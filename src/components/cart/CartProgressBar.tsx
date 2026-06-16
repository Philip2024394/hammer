"use client";

import { formatPrice } from "@/lib/fx";
import {
  FLAT_SHIPPING_LABEL_GBP,
  MIN_ORDER_IDR,
  MIN_ORDER_LABEL_GBP,
  TIER_1_SHIPPING_LABEL_GBP,
  TIER_2_THRESHOLD_IDR,
  TIER_2_THRESHOLD_LABEL_GBP
} from "@/lib/shipping";

// Live two-tier progress bar:
//   0 → £30   "Add £X to reach the £30 minimum"
//   £30 → £50  "£28 shipping unlocked · Add £X for £20 flat"
//   £50+      "£20 flat shipping unlocked"
// A tick mark at the £30 position makes both milestones visible at a
// glance so the buyer always sees the next reward.

export function CartProgressBar({ subtotalIdr }: { subtotalIdr: number }) {
  const tier2Reached = subtotalIdr >= TIER_2_THRESHOLD_IDR;
  const minReached = subtotalIdr >= MIN_ORDER_IDR;
  const toMin = Math.max(0, MIN_ORDER_IDR - subtotalIdr);
  const toTier2 = Math.max(0, TIER_2_THRESHOLD_IDR - subtotalIdr);
  const pct = Math.min(100, Math.round((subtotalIdr / TIER_2_THRESHOLD_IDR) * 100));
  const minMarkerPct = Math.round((MIN_ORDER_IDR / TIER_2_THRESHOLD_IDR) * 100);

  const headline = tier2Reached
    ? `✓ ${FLAT_SHIPPING_LABEL_GBP} flat shipping unlocked`
    : minReached
      ? `✓ ${TIER_1_SHIPPING_LABEL_GBP} shipping unlocked · add ${formatPrice(toTier2, "GBP")} for ${FLAT_SHIPPING_LABEL_GBP} flat`
      : `Add ${formatPrice(toMin, "GBP")} to reach the ${MIN_ORDER_LABEL_GBP} minimum order`;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        tier2Reached
          ? "border-brand-accent/50 bg-brand-accent/10"
          : minReached
            ? "border-brand-accent/30 bg-brand-accent/5"
            : "border-brand-line bg-brand-surface"
      }`}
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
        <span className={tier2Reached || minReached ? "text-brand-accent" : "text-brand-text"}>
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
            tier2Reached ? "bg-brand-accent" : minReached ? "bg-brand-accent/80" : "bg-brand-accent/60"
          }`}
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-brand-bg"
          style={{ left: `${minMarkerPct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
        <span className={minReached ? "text-brand-accent" : "text-brand-muted"}>
          {MIN_ORDER_LABEL_GBP} · {TIER_1_SHIPPING_LABEL_GBP} ship
        </span>
        <span className={tier2Reached ? "text-brand-accent" : "text-brand-muted"}>
          {TIER_2_THRESHOLD_LABEL_GBP} · {FLAT_SHIPPING_LABEL_GBP} flat
        </span>
      </div>
      {!minReached && (
        <p className="mt-3 text-xs leading-relaxed text-brand-muted">
          {MIN_ORDER_LABEL_GBP} minimum order. Add more items to check out.
        </p>
      )}
    </div>
  );
}
