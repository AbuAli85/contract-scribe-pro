// Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for the Pro subscription and returns the URL.
// Called from the frontend Upgrade page.
//
// Required secrets (supabase secrets set):
//   STRIPE_SECRET_KEY   — sk_live_... or sk_test_...
//   STRIPE_PRICE_ID     — price_... (monthly or yearly price object in Stripe)
//   APP_URL             — https://contract-scribe-pro.vercel.app

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller is an authenticated Supabase user
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const appUrl = Deno.env.get("APP_URL") ?? "https://contract-scribe-pro.vercel.app";

    // Retrieve or create Stripe customer linked to this user's email
    const existingCustomers = await stripe.customers.list({ email: user.email!, limit: 1 });
    const customer = existingCustomers.data[0] ??
      await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_uid: user.id },
      });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: Deno.env.get("STRIPE_PRICE_ID")!, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/upgrade?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url:  `${appUrl}/upgrade?status=cancelled`,
      metadata: { supabase_uid: user.id },
      subscription_data: {
        metadata: { supabase_uid: user.id },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
