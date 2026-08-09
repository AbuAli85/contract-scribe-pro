// =============================================================
// Edge Function: letter-otp-verify
//
// Step 2 of the /letters free-tier gate. Checks the 6-digit code
// and, on success, hands back a 30-day gate token (HS256 JWT) that
// the browser keeps so the visitor isn't re-prompted for every
// letter within the free allowance.
//
// Deploy:
//   supabase functions deploy letter-otp-verify --no-verify-jwt
//
// Required secrets (Supabase Vault):
//   LETTER_GATE_SALT    Hashes the codes AND signs the gate token
//
// Errors: 403 invalid_code | 403 too_many_attempts
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS,
  hashWithSalt,
  isOtpCodeShape,
  isValidEmailFormat,
  json,
  normalizeEmail,
  OTP_MAX_ATTEMPTS,
  shouldInvalidateCode,
  signGateToken,
} from "../_shared/letterGate.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; code?: string };
    const email = normalizeEmail(body.email ?? "");
    const code = (body.code ?? "").trim();

    if (!isValidEmailFormat(email) || !isOtpCodeShape(code)) {
      return json({ error: "invalid_code" }, 403);
    }

    const SALT = Deno.env.get("LETTER_GATE_SALT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SALT || !SUPABASE_URL || !SERVICE_KEY) {
      console.error("letter-otp-verify: missing LETTER_GATE_SALT / Supabase env");
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Latest still-live code for this address. Anything consumed or past
    // its expiry is simply not a candidate.
    const nowIso = new Date().toISOString();
    const { data: row, error: selErr } = await admin
      .from("letter_otp_codes")
      .select("id, code_hash, attempts")
      .eq("email", email)
      .is("consumed_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selErr) {
      console.error("letter-otp-verify: select failed", selErr);
      return json({ error: "server_error" }, 500);
    }
    if (!row) {
      // No live code: never expired, already used, or never requested —
      // all indistinguishable to the caller on purpose.
      return json({ error: "invalid_code" }, 403);
    }

    if ((row.attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      await admin.from("letter_otp_codes").update({ consumed_at: nowIso }).eq("id", row.id);
      return json({ error: "too_many_attempts" }, 403);
    }

    const candidateHash = await hashWithSalt(code, SALT);

    if (candidateHash !== row.code_hash) {
      const attemptsAfter = (row.attempts ?? 0) + 1;
      const burn = shouldInvalidateCode(attemptsAfter);

      await admin
        .from("letter_otp_codes")
        .update({
          attempts: attemptsAfter,
          ...(burn ? { consumed_at: nowIso } : {}),
        })
        .eq("id", row.id);

      return json({ error: burn ? "too_many_attempts" : "invalid_code" }, 403);
    }

    // Correct — single-use, so consume it before issuing the token.
    const { error: consumeErr } = await admin
      .from("letter_otp_codes")
      .update({ consumed_at: nowIso, attempts: (row.attempts ?? 0) + 1 })
      .eq("id", row.id)
      .is("consumed_at", null);

    if (consumeErr) {
      console.error("letter-otp-verify: consume failed", consumeErr);
      return json({ error: "server_error" }, 500);
    }

    const token = await signGateToken(email, SALT);
    return json({ ok: true, token });
  } catch (err: any) {
    console.error("letter-otp-verify error:", err);
    return json({ error: "server_error" }, 500);
  }
});
