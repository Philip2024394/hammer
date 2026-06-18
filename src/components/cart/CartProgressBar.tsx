"use client";

import { formatPrice } from "@/lib/fx";
import {
  FLAT_SHIPPING_LABEL_GBP,
  TIER_2_THRESHOLD_IDR,
  TIER_2_THRESHOLD_LABEL_GBP
} from "@/lib/shipping";

// Live air-freight progress bar:
//   0 → £50   "Add £X to unlock £20 air freight rate"
//   £50+     "✓ £20 air freight rate unlocked"

export function CartProgressBar({ subtotalIdr }: { subtotalIdr: number }) {
  const tier2Reached = subtotalIdr >= TIER_2_THRESHOLD_IDR;
  const toTier2 = Math.max(0, TIER_2_THRESHOLD_IDR - subtotalIdr);
  const pct = Math.min(100, Math.round((subtotalIdr / TIER_2_THRESHOLD_IDR) * 100));

  const headline = tier2Reached
    ? `✓ ${FLAT_SHIPPING_LABEL_GBP} air freight rate unlocked`
    : `Add ${formatPrice(toTier2, "GBP")} to unlock ${FLAT_SHIPPING_LABEL_GBP} air freight rate`;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        tier2Reached
          ? "border-brand-accent/50 bg-brand-accent/10"
          : "border-brand-accent/30 bg-brand-accent/5"
      }`}
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="text-brand-accent">
          {headline}
        </span>
        <span className="shrink-0 text-brand-muted">
          {formatPrice(subtotalIdr, "GBP")} / {TIER_2_THRESHOLD_LABEL_GBP}
        </span>
      </div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-black/40"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Cart progress to ${TIER_2_THRESHOLD_LABEL_GBP} flat-shipping unlock`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            tier2Reached ? "bg-brand-accent" : "bg-brand-accent/80"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
