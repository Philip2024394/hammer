// Server-only Stripe helpers. Imports the SDK and lazily constructs a
// singleton client. The feature is gated behind STRIPE_ENABLED — when off,
// the API routes return 503 and the UI never shows the Pay-now CTA.
//
// To green-light Stripe end-to-end you need three env vars in .env.local:
//   STRIPE_ENABLED=true
//   STRIPE_SECRET_KEY=sk_live_… (or sk_test_… for staging)
//   STRIPE_WEBHOOK_SECRET=whsec_… (from the Stripe dashboard webhook config)
// Plus one public var that the client checks for the CTA visibility:
//   NEXT_PUBLIC_STRIPE_ENABLED=true
// (Two flags so a deploy can have the keys present but the CTA hidden.)

import Stripe from "stripe";

export const STRIPE_ENABLED =
  process.env.STRIPE_ENABLED === "true" &&
  !!process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_ENABLED) {
    throw new Error(
      "Stripe is not enabled. Set STRIPE_ENABLED=true and STRIPE_SECRET_KEY in .env.local."
    );
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true
    });
  }
  return stripe;
}

// Convert an IDR amount to GBP pence for Stripe (Stripe wants the smallest
// unit of the charge currency — pence for GBP). 23,827 IDR/£ rate matches
// fx.ts. Stripe rejects amounts below 30p, so we floor at 30p.
const IDR_PER_GBP = 23827;
export function idrToGbpPence(idr: number): number {
  const pence = Math.round((idr / IDR_PER_GBP) * 100);
  return Math.max(30, pence);
}
