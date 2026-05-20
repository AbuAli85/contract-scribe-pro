// Edge Function: stripe-webhook
// Receives Stripe webhook events and updates the profiles table.
//
// Events handled:
//   checkout.session.completed      → set is_pro = true
//   customer.subscription.deleted   → set is_pro = false
//   customer.subscription.updated   → sync active/inactive status
//
// Required secrets:
//   STRIPE_WEBHOOK_SECRET   — whsec_... (from Stripe Dashboard → Webhooks)
//   SUPABASE_SERVICE_ROLE_KEY — needed to bypass RLS for admin writes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook error: ${err}`, { status: 400 });
  }

  // Use service-role key to bypass RLS for admin writes
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  async function setProStatus(supabaseUid: string, isPro: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_pro: isPro, updated_at: new Date().toISOString() })
      .eq("id", supabaseUid);
    if (error) console.error("Failed to update profile:", error);
  }

  function getUid(obj: { metadata?: Stripe.Metadata | null }): string | null {
    return obj.metadata?.supabase_uid ?? null;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = getUid(session);
        if (uid && session.payment_status === "paid") {
          await setProStatus(uid, true);
          console.log(`Activated Pro for user ${uid}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = getUid(sub);
        if (uid) {
          const isActive = ["active", "trialing"].includes(sub.status);
          await setProStatus(uid, isActive);
          console.log(`Subscription updated for ${uid}: status=${sub.status}, is_pro=${isActive}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = getUid(sub);
        if (uid) {
          await setProStatus(uid, false);
          console.log(`Deactivated Pro for user ${uid}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
