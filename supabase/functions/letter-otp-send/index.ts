// =============================================================
// Edge Function: letter-otp-send
//
// Step 1 of the /letters free-tier gate. Takes an email, refuses
// burner domains, throttles, and mails a 6-digit code.
//
// Deploy:
//   supabase functions deploy letter-otp-send --no-verify-jwt
//
// Required secrets (Supabase Vault):
//   LETTER_GATE_SALT    Server-side salt for hashing codes/IPs
//   RESEND_API_KEY      Resend API key
//   LETTER_FROM_EMAIL   From address, default "SmartPRO <letters@thesmartpro.io>"
//
// Response is ALWAYS 200 { ok: true } on a successful send — we never
// disclose whether an address is already known to us. Only the two
// pre-send refusals (burner domain, throttle) return an error code.
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  classifyEmail,
  CORS,
  generateOtpCode,
  hashWithSalt,
  json,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_TTL_MINUTES,
} from "../_shared/letterGate.ts";

const BRAND_GREEN = "#006948";

function buildOtpEmail(code: string) {
  return {
    subject: "رمز التحقق — Verification Code",
    html: `<!DOCTYPE html><html dir="rtl" lang="ar"><body style="margin:0;padding:0;background:#f6f7f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f6;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
  <tr><td align="center" style="padding-bottom:8px;">
    <div style="font-size:20px;font-weight:bold;color:${BRAND_GREEN};">SmartPRO</div>
  </td></tr>
  <tr><td align="center" style="font-size:16px;line-height:1.6;padding-bottom:4px;">
    رمز التحقق الخاص بك
  </td></tr>
  <tr><td align="center" style="font-size:13px;line-height:1.6;color:#666666;padding-bottom:20px;" dir="ltr">
    Your verification code
  </td></tr>
  <tr><td align="center" style="padding:8px 0 20px;">
    <div style="display:inline-block;background:#f0f7f4;border:1px solid ${BRAND_GREEN}22;border-radius:10px;padding:16px 28px;font-size:34px;font-weight:bold;letter-spacing:10px;color:${BRAND_GREEN};font-family:'Courier New',monospace;" dir="ltr">${code}</div>
  </td></tr>
  <tr><td align="center" style="font-size:14px;line-height:1.7;color:#444444;">
    الرمز صالح لمدة ${OTP_TTL_MINUTES} دقائق فقط.
  </td></tr>
  <tr><td align="center" style="font-size:12px;line-height:1.7;color:#888888;padding-bottom:16px;" dir="ltr">
    This code is valid for ${OTP_TTL_MINUTES} minutes.
  </td></tr>
  <tr><td align="center" style="font-size:12px;line-height:1.7;color:#999999;border-top:1px solid #eeeeee;padding-top:16px;">
    إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.<br/>
    <span dir="ltr">If you did not request this code, you can safely ignore this email.</span>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const { email: rawEmail } = (await req.json().catch(() => ({}))) as { email?: string };

    const classified = classifyEmail(rawEmail ?? "");
    if (!classified.ok) {
      // 422 for both — the client renders the Arabic/English copy per reason.
      return json({ error: classified.reason }, 422);
    }
    const email = classified.email;

    const SALT = Deno.env.get("LETTER_GATE_SALT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SALT || !SUPABASE_URL || !SERVICE_KEY) {
      console.error("letter-otp-send: missing LETTER_GATE_SALT / Supabase env");
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // --- throttle: max N sends per email per rolling hour -------------
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentSends, error: countErr } = await admin
      .from("letter_otp_codes")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (countErr) {
      console.error("letter-otp-send: throttle count failed", countErr);
      return json({ error: "server_error" }, 500);
    }
    if ((recentSends ?? 0) >= OTP_MAX_SENDS_PER_HOUR) {
      return json({ error: "too_many_requests" }, 429);
    }

    // --- invalidate any live code, then issue a fresh one -------------
    // Consuming the old ones means a re-send always makes the previous
    // code useless, so a leaked older mail can't be replayed.
    const nowIso = new Date().toISOString();
    const { error: invalidateErr } = await admin
      .from("letter_otp_codes")
      .update({ consumed_at: nowIso })
      .eq("email", email)
      .is("consumed_at", null);

    if (invalidateErr) {
      console.error("letter-otp-send: invalidate failed", invalidateErr);
      return json({ error: "server_error" }, 500);
    }

    const code = generateOtpCode();
    const codeHash = await hashWithSalt(code, SALT);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertErr } = await admin.from("letter_otp_codes").insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error("letter-otp-send: insert failed", insertErr);
      return json({ error: "server_error" }, 500);
    }

    // --- deliver ------------------------------------------------------
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("LETTER_FROM_EMAIL") ?? "SmartPRO <letters@thesmartpro.io>";

    if (!RESEND_API_KEY) {
      // Mirrors send-template-email: don't hard-fail the flow in envs
      // without mail configured, but never pretend the mail was sent.
      console.warn("letter-otp-send: RESEND_API_KEY not set — code stored but not emailed");
      return json({ ok: true, sent: false, reason: "no-api-key" });
    }

    const { subject, html } = buildOtpEmail(code);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        html,
        tags: [{ name: "category", value: "letter-otp" }],
      }),
    });

    if (!res.ok) {
      console.error("letter-otp-send: resend error", await res.text());
      return json({ error: "email_send_failed" }, 502);
    }

    return json({ ok: true, sent: true });
  } catch (err: any) {
    console.error("letter-otp-send error:", err);
    return json({ error: "server_error" }, 500);
  }
});
