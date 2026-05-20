// Edge Function: thawani-webhook (file kept as stripe-webhook for URL compat)
// Receives Thawani Pay webhook events and updates the profiles table.
//
// Thawani sends a POST to this URL when a payment succeeds or fails.
// We verify the signature, then set is_pro on the matching user.
//
// Required secrets:
//   THAWANI_SECRET_KEY         — used to verify the webhook signature
//   SUPABASE_SERVICE_ROLE_KEY  — bypasses RLS for admin profile writes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Thawani sends the signature in thawani-signature header
  const signature = req.headers.get("thawani-signature") ?? "";
  const body = await req.text();

  // Verify HMAC-SHA256 signature
  const secretKey = Deno.env.get("THAWANI_SECRET_KEY") ?? "";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const expectedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature && expectedSig !== signature) {
    console.warn("Thawani webhook signature mismatch — ignoring");
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Thawani webhook payload shape:
  // { session_id, payment_status, client_reference_id, metadata: { supabase_uid } }
  const paymentStatus    = String(payload.payment_status ?? "").toLowerCase();
  const supabaseUid      = (payload.metadata as Record<string, string>)?.supabase_uid
                        ?? String(payload.client_reference_id ?? "");

  if (!supabaseUid) {
    console.warn("No supabase_uid in webhook payload — skipping");
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const isPro = paymentStatus === "paid";

  // Set pro_until to 32 days from now (covers monthly billing with buffer)
  const proUntil = isPro
    ? new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({ is_pro: isPro, pro_until: proUntil, updated_at: new Date().toISOString() })
    .eq("id", supabaseUid);

  if (error) {
    console.error("Failed to update profile:", error);
    return new Response("DB error", { status: 500 });
  }

  console.log(`Thawani webhook: uid=${supabaseUid} payment_status=${paymentStatus} is_pro=${isPro}`);
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
