// =============================================================
// Edge Function: translate-text
//
// Proxies to DeepL Pro API for high-quality Arabic ↔ English
// translation. Used by the bilingual input pair to auto-fill the
// opposite-language half when the user has typed in one language.
//
// DeepL chosen over Google Translate / Azure because its Arabic
// translation quality is noticeably better, especially for proper
// names, addresses, and job titles in a formal/legal context.
//
// Deploy:
//   supabase functions deploy translate-text --no-verify-jwt
//
// Secret:
//   DEEPL_API_KEY   from https://www.deepl.com/pro-api
//                   Free tier: 500,000 chars/month
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface RequestBody {
  text: string;
  /** Direction of translation */
  from: "en" | "ar";
  to: "en" | "ar";
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { text, from, to } = (await req.json()) as RequestBody;

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: true, translated: "" }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }
    if (from === to) {
      return new Response(
        JSON.stringify({ ok: true, translated: text }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const DEEPL_API_KEY = Deno.env.get("DEEPL_API_KEY");
    if (!DEEPL_API_KEY) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "DEEPL_API_KEY not configured",
          hint: "Set via: supabase secrets set DEEPL_API_KEY=...",
        }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // DeepL uses different host for Free vs Pro keys (`:fx` suffix = Free)
    const host = DEEPL_API_KEY.endsWith(":fx")
      ? "https://api-free.deepl.com"
      : "https://api.deepl.com";

    const targetLang = to === "ar" ? "AR" : "EN-US";
    const sourceLang = from === "ar" ? "AR" : "EN";

    const params = new URLSearchParams();
    params.set("text", text);
    params.set("target_lang", targetLang);
    params.set("source_lang", sourceLang);
    params.set("formality", "more"); // formal register fits legal documents

    const deeplRes = await fetch(`${host}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!deeplRes.ok) {
      const errText = await deeplRes.text();
      console.error("DeepL error:", errText);
      return new Response(
        JSON.stringify({ ok: false, error: errText }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await deeplRes.json();
    const translated = data?.translations?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({ ok: true, translated }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("translate-text error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
