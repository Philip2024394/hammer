// POST /api/webhooks/stripe
// Stripe sends payment lifecycle events here. We use them to flip the
// order row's status — authorized (on checkout.session.completed),
// captured (when the admin runs the capture endpoint), refunded, etc.
//
// Signature verification uses STRIPE_WEBHOOK_SECRET. Without that env var
// we 400 every request to avoid spoofed status updates.

import { NextResponse, type NextRequest } from "next/server";
import { STRIPE_ENABLED, getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json({ error: "Stripe is not enabled." }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();
  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const piId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
      await supabase.from("hammerex_orders").update({
        status: "authorized",
        authorized_at: new Date().toISOString(),
        stripe_payment_intent_id: piId,
        buyer_email: session.customer_details?.email ?? null,
        buyer_name: session.customer_details?.name ?? null,
        buyer_phone: session.customer_details?.phone ?? null,
        shipping_address: session.collected_information?.shipping_details ?? session.customer_details?.address ?? null
      }).eq("stripe_session_id", session.id);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      await supabase.from("hammerex_orders").update({
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      }).eq("stripe_session_id", session.id);
      break;
    }
    case "payment_intent.canceled": {
      const pi = event.data.object as import("stripe").Stripe.PaymentIntent;
      await supabase.from("hammerex_orders").update({
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      }).eq("stripe_payment_intent_id", pi.id);
      break;
    }
    case "charge.refunded": {
      const ch = event.data.object as import("stripe").Stripe.Charge;
      const piId = typeof ch.payment_intent === "string"
        ? ch.payment_intent
        : ch.payment_intent?.id ?? null;
      if (piId) {
        await supabase.from("hammerex_orders").update({
          status: "refunded",
          refunded_at: new Date().toISOString()
        }).eq("stripe_payment_intent_id", piId);
      }
      break;
    }
    default:
      // Unhandled events are intentional — Stripe sends a lot of types
      // we don't act on. Returning 200 prevents Stripe from retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
