// =============================================================
// Edge Function: letter-rewrite
//
// Server-side proxy for the «تحسين الصياغة» (Improve Wording) button on
// the /letters page. It takes the user's rough free-text detail and asks
// the Anthropic Claude API to rewrite it into formal Omani official-letter
// body wording — carrying every fact through verbatim.
//
// WHY A PROXY: the Anthropic API key must never reach the browser. This
// function holds it server-side (Supabase secret) and is the ONLY place it
// is read. The client sends the text; it never sees the key.
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy letter-rewrite
//
// Required secrets (Supabase Vault):
//   ANTHROPIC_API_KEY           The Anthropic API key — never returned/logged
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY   Verify the caller's JWT
//
// Errors: 401 unauthorized | 400 invalid input | 500 misconfigured | 502 upstream
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, json } from "../_shared/letterGate.ts";

/** Swappable model constant — keep the rewrite model in one place. */
const REWRITE_MODEL = "claude-haiku-4-5-20251001";
const MAX_INPUT_CHARS = 2000;
const ANTHROPIC_TIMEOUT_MS = 20_000;

// The rewrite rules. English instruction text is intentional; the {lang}
// directive below tells the model which register to write in.
const SYSTEM_RULES = `You rewrite rough user input into the body wording of a formal Omani official letter.

Rules:
- When lang=ar, write the output in formal Omani official-letter Arabic register (phrasing such as نلتمس / التكرم / عدم ممانعة). When lang=en, write it in formal English official-letter register.
- Carry every fact verbatim: names, civil numbers, CR numbers, dates, amounts, and phone numbers must appear exactly as given. NEVER invent, guess, or add any fact, name, or number not present in the input.
- Output ONE clean paragraph (no line breaks unless the input clearly lists multiple distinct items). No greetings, no closings, no addressee lines, no «الموضوع» line — body detail text only.
- If the input is too vague to rewrite, return it unchanged.
- Return ONLY the rewritten text — no preamble, no quotes, no markdown.`;

interface Body {
  text?: string;
  letterTypeLabelAr?: string;
  lang?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    // --- auth: a signed-in user is required ---------------------------
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error("letter-rewrite: missing Supabase env");
      return json({ error: "server_misconfigured" }, 500);
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: userData } = bearer
      ? await admin.auth.getUser(bearer)
      : { data: { user: null } as any };
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    // --- input validation ---------------------------------------------
    const body = (await req.json().catch(() => ({}))) as Body;
    const text = (body.text ?? "").toString();
    const trimmed = text.trim();
    if (!trimmed) return json({ error: "empty_text", message: "text is required" }, 400);
    if (trimmed.length > MAX_INPUT_CHARS) {
      return json(
        { error: "text_too_long", message: `text must be ${MAX_INPUT_CHARS} characters or fewer`, max: MAX_INPUT_CHARS },
        400,
      );
    }
    const lang = body.lang === "en" ? "en" : "ar";
    const letterTypeLabelAr = (body.letterTypeLabelAr ?? "").toString().slice(0, 200);

    // --- the API key lives here and only here -------------------------
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("letter-rewrite: ANTHROPIC_API_KEY not set");
      return json({ error: "rewrite service not configured" }, 500);
    }

    // --- one call to the Anthropic Messages API (no retry) ------------
    let resp: Response;
    try {
      resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: REWRITE_MODEL,
          max_tokens: 1024,
          system: `${SYSTEM_RULES}\n\nFor this request, lang="${lang}".`,
          messages: [
            {
              role: "user",
              content: `نوع الخطاب: ${letterTypeLabelAr}\n\n${text}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(ANTHROPIC_TIMEOUT_MS),
      });
    } catch (e: any) {
      // Timeout or network error — one attempt, no retry loop.
      console.error("letter-rewrite: upstream fetch failed", e?.name ?? "error");
      return json({ error: "rewrite failed" }, 502);
    }

    if (!resp.ok) {
      // Log the status code, NEVER the key or the response body.
      console.error("letter-rewrite: Anthropic non-200", resp.status);
      return json({ error: "rewrite failed" }, 502);
    }

    const data = (await resp.json().catch(() => null)) as any;
    const rewritten = (data?.content?.[0]?.text ?? "").toString().trim();
    if (!rewritten) {
      console.error("letter-rewrite: empty completion");
      return json({ error: "rewrite failed" }, 502);
    }

    return json({ rewritten });
  } catch (err: any) {
    console.error("letter-rewrite error:", err?.message ?? "error");
    return json({ error: "server_error" }, 500);
  }
});
