// Edge Function: create-checkout-session (Thawani Pay)
// Creates a Thawani checkout session for the Pro subscription.
// Thawani is an Omani payment gateway — accepts OMR natively.
// Docs: https://developer.thawani.om
//
// Required secrets (supabase secrets set):
//   THAWANI_SECRET_KEY       — from Thawani merchant dashboard
//   THAWANI_PUBLISHABLE_KEY  — from Thawani merchant dashboard
//   THAWANI_ENV              — "live" or "test" (defaults to live)
//   APP_URL                  — https://contract-scribe-pro.vercel.app
//
// Monthly price: 9900 baisa = OMR 9.900 (Thawani uses baisa, smallest unit)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONTHLY_PRICE_BAISA = 9900; // OMR 9.900

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env = Deno.env.get("THAWANI_ENV") ?? "live";
    const baseUrl = env === "test"
      ? "https://uatcheckout.thawani.om/api/v1"
      : "https://checkout.thawani.om/api/v1";
    const checkoutBase = env === "test"
      ? "https://uatcheckout.thawani.om/pay"
      : "https://checkout.thawani.om/pay";

    const secretKey      = Deno.env.get("THAWANI_SECRET_KEY")!;
    const publishableKey = Deno.env.get("THAWANI_PUBLISHABLE_KEY")!;
    const appUrl         = Deno.env.get("APP_URL") ?? "https://contract-scribe-pro.vercel.app";

    // Create Thawani checkout session
    const body = {
      client_reference_id: user.id,
      mode: "payment",
      products: [
        {
          name: "Contract Scribe Pro — Monthly",
          quantity: 1,
          unit_amount: MONTHLY_PRICE_BAISA,
        },
      ],
      success_url: `${appUrl}/upgrade?status=success`,
      cancel_url:  `${appUrl}/upgrade?status=cancelled`,
      metadata: {
        supabase_uid: user.id,
        user_email:   user.email ?? "",
      },
    };

    const response = await fetch(`${baseUrl}/checkout/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": secretKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Thawani session creation failed:", text);
      return new Response(JSON.stringify({ error: "Payment gateway error", detail: text }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const sessionId = data?.data?.session_id;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session_id returned", raw: data }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutUrl = `${checkoutBase}/${sessionId}?key=${publishableKey}`;

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
