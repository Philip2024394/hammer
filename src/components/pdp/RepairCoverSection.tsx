"use client";

import { formatPriceForRegion, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import type { RepairCoverConfig } from "@/lib/repairCover";

// Hammerex Pro Trade Cover toggle. Sits next to the custom-branding upsell
// in the BuyColumn. The cover pricing is held in repairCover.ts; the £15
// shown here is added to the unit price at the BuyColumn aggregation stage.
export function RepairCoverSection({
  config,
  enabled,
  onToggle,
  currency
}: {
  config: RepairCoverConfig;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  currency: Currency;
}) {
  const country = useCountry();
  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-accent"
          aria-label="Add Hammerex Pro Trade Cover"
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-bold text-brand-text">Hammerex Pro Trade Cover</span>
            <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
              +{formatPriceForRegion(config.priceIdr, currency, country)} · one-off
            </span>
          </div>
          <p className="text-xs leading-relaxed text-brand-muted">
            <span className="font-semibold text-brand-text">Built tough · serviced for life by the makers.</span>{" "}
            Beyond the standard 1-year defect warranty, this cover keeps your belt in service for{" "}
            <span className="font-semibold text-brand-text">3 full years</span> on the parts that wear under
            daily site use — re-stitching, rivet / stud replacement, buckle service, slider replacement, and
            leather conditioning.
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-xs text-brand-muted">
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 text-brand-accent" aria-hidden="true">✓</span>
              <span>You post the belt to us; we fix it and post it back. <span className="text-brand-text font-semibold">You pay the postage both ways</span> — no service or labour charge.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 text-brand-accent" aria-hidden="true">✓</span>
              <span>Unlimited claims for the full 3 years from delivery date.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 text-brand-accent" aria-hidden="true">✓</span>
              <span>Standard 1-year manufacturing-defect warranty still applies — that one&apos;s on us, both ways.</span>
            </li>
          </ul>
        </div>
      </label>
    </div>
  );
}
