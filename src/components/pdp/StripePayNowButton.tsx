"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";

// Secondary Pay-now CTA. Renders only when:
//   - The public feature flag NEXT_PUBLIC_STRIPE_ENABLED is "true", AND
//   - The product on the page is free-UK delivery (shipping_per_unit_idr === 0)
// Sends the buyer's cart to /api/checkout/stripe, then redirects to the
// Stripe-hosted checkout page. We don't take the money until the admin
// captures (manual capture) — the buyer's card is authorised in the
// meantime so they're committed but you have the dispatch buffer.
export function StripePayNowButton({
  productHasFreeUkDelivery
}: {
  productHasFreeUkDelivery: boolean;
}) {
  const enabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!enabled || !productHasFreeUkDelivery) return null;

  const onClick = async () => {
    setLoading(true);
    setErr(null);
    try {
      const lines = cart.read();
      if (lines.length === 0) {
        setErr("Your basket is empty.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            size: l.size,
            variantLabel: l.variantLabel,
            beltSize: l.beltSize ?? null,
            threadColor: l.threadColor,
            customBrandName: l.customBrandName ?? null,
            repairCover: l.repairCover ?? false,
            beltUpgrade: l.beltUpgrade ?? null,
            backpackStraps: l.backpackStraps
          }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErr(data.error || "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="h-12 w-full rounded-full bg-brand-accent text-sm font-bold uppercase tracking-widest text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90 disabled:opacity-40"
      >
        {loading ? "Redirecting to secure checkout…" : "Pay now · UK · free delivery"}
      </button>
      <p className="px-1 text-xs leading-snug text-brand-muted">
        Card authorised now · captured on dispatch (4–5 working days) · UK only at launch.
      </p>
      {err && <p className="px-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}
