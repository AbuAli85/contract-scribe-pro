// =============================================================
// Edge Function: send-whatsapp
//
// Sends a WhatsApp Business message via Twilio. Used to share the
// contract signing link with the counterparty on WhatsApp — the
// dominant business communication channel in the GCC.
//
// Deploy:
//   supabase functions deploy send-whatsapp --no-verify-jwt
//
// Secrets:
//   TWILIO_ACCOUNT_SID   from https://console.twilio.com
//   TWILIO_AUTH_TOKEN    same dashboard
//   TWILIO_WHATSAPP_FROM e.g. "whatsapp:+14155238886" (sandbox)
//                        Production: your verified WhatsApp Business number
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface RequestBody {
  /** Recipient phone in E.164 format e.g. "+96891234567" */
  to: string;
  /** Plain text message body. Keep under 1600 chars per Twilio limits. */
  message: string;
  /** Optional URL to include as a media link (the signing URL) */
  link?: string;
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
    const { to, message, link } = (await req.json()) as RequestBody;

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "to and message required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

    if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM) {
      return new Response(
        JSON.stringify({
          error: "Twilio not configured",
          hint:
            "Set: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM",
        }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Compose the message — append the link on its own line so WhatsApp
    // renders it as a tappable preview card
    const body = link ? `${message}\n\n${link}` : message;

    // Normalize the "to" address — Twilio expects whatsapp:+E164
    const normalizedTo = to.startsWith("whatsapp:")
      ? to
      : `whatsapp:${to.replace(/\s+/g, "")}`;

    const params = new URLSearchParams();
    params.set("To", normalizedTo);
    params.set("From", FROM);
    params.set("Body", body);

    const auth = "Basic " + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Twilio error:", errText);
      return new Response(
        JSON.stringify({ ok: false, error: errText }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({
        ok: true,
        messageSid: data.sid,
        status: data.status,
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-whatsapp error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
