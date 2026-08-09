// =============================================================
// Edge Function: letter-generate-check
//
// Step 3 of the /letters free-tier gate — the only thing standing
// between a visitor and the .docx. Decides whether this download is
// allowed, and records it.
//
// Limits are counted across THREE dimensions (email, device, IP) and
// any one of them tripping blocks the download. That's deliberate:
// email-only would fall to a fresh burner, device-only to a private
// window, IP-only to a phone hotspot.
//
// Deploy:
//   supabase functions deploy letter-generate-check --no-verify-jwt
//
// Required secrets (Supabase Vault):
//   LETTER_GATE_SALT    Verifies the gate token, hashes the IP
//
// Errors: 401 invalid_token | 403 limit_reached
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS,
  extractClientIp,
  FREE_LETTER_LIMIT,
  hashWithSalt,
  hasReachedFreeLimit,
  isHashLike,
  json,
  normalizeEmail,
  remainingAfterGeneration,
  verifyGateToken,
} from "../_shared/letterGate.ts";

interface Body {
  token?: string;
  device_hash?: string;
  authority?: string;
  letter_type?: string;
  language?: string;
}

const clip = (v: string | undefined, max = 120) => (v ?? "").toString().slice(0, max);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Body;

    const deviceHash = (body.device_hash ?? "").toLowerCase();
    if (!isHashLike(deviceHash)) return json({ error: "invalid_device_hash" }, 400);

    const authority = clip(body.authority);
    const letterType = clip(body.letter_type);
    const language = clip(body.language, 8) || "ar";
    if (!authority || !letterType) return json({ error: "missing_fields" }, 400);

    const SALT = Deno.env.get("LETTER_GATE_SALT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SALT || !SUPABASE_URL || !SERVICE_KEY) {
      console.error("letter-generate-check: missing LETTER_GATE_SALT / Supabase env");
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // --- who is asking? ------------------------------------------------
    // Two independent identities, and either can be absent:
    //   • a Supabase session (pro users bypass the gate)
    //   • a gate token (anonymous visitors who verified an email)
    // supabase-js sends the anon key as Authorization when signed out, so
    // getUser simply fails there and we fall through to anonymous.
    let userId: string | null = null;
    let userEmail: string | null = null;
    let isPro = false;

    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (bearer) {
      const { data: userData } = await admin.auth.getUser(bearer);
      const user = userData?.user;
      if (user) {
        userId = user.id;
        userEmail = normalizeEmail(user.email ?? "");
        const { data: profile } = await admin
          .from("profiles")
          .select("is_pro")
          .eq("id", user.id)
          .maybeSingle();
        isPro = profile?.is_pro === true;
      }
    }

    const tokenEmail = await verifyGateToken(body.token ?? "", SALT);

    // A verified gate token identifies the free-tier visitor. Pro users
    // may not have one (they never saw the dialog) — their session email
    // stands in, so the row is still attributable.
    const email = tokenEmail ?? (isPro ? userEmail : null);
    if (!email) return json({ error: "invalid_token" }, 401);

    const ipHash = await hashWithSalt(extractClientIp(req.headers), SALT);

    // --- pro: log, never limit ----------------------------------------
    if (isPro) {
      const { error: insErr } = await admin.from("letter_generations").insert({
        email,
        email_verified_at: tokenEmail ? new Date().toISOString() : null,
        device_hash: deviceHash,
        ip_hash: ipHash,
        authority,
        letter_type: letterType,
        language,
        user_id: userId,
      });
      if (insErr) console.error("letter-generate-check: pro log failed", insErr);
      return json({ ok: true, remaining: null, pro: true });
    }

    // --- free tier: count across all three dimensions ------------------
    // Every operand is either a validated email or a 64-char hex hash,
    // so nothing here can smuggle extra PostgREST filter syntax.
    const { count, error: countErr } = await admin
      .from("letter_generations")
      .select("id", { count: "exact", head: true })
      .or(`email.eq.${email},device_hash.eq.${deviceHash},ip_hash.eq.${ipHash}`);

    if (countErr) {
      console.error("letter-generate-check: count failed", countErr);
      return json({ error: "server_error" }, 500);
    }

    const priorCount = count ?? 0;
    if (hasReachedFreeLimit(priorCount)) {
      return json({ error: "limit_reached", limit: FREE_LETTER_LIMIT }, 403);
    }

    const { error: insErr } = await admin.from("letter_generations").insert({
      email,
      email_verified_at: new Date().toISOString(),
      device_hash: deviceHash,
      ip_hash: ipHash,
      authority,
      letter_type: letterType,
      language,
      user_id: userId,
    });

    if (insErr) {
      console.error("letter-generate-check: insert failed", insErr);
      return json({ error: "server_error" }, 500);
    }

    return json({ ok: true, remaining: remainingAfterGeneration(priorCount) });
  } catch (err: any) {
    console.error("letter-generate-check error:", err);
    return json({ error: "server_error" }, 500);
  }
});
