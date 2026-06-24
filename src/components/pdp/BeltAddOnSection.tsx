"use client";

import { formatPriceForRegion, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import { imageUrl } from "@/lib/imageUrl";
import type { HammerexProduct } from "@/lib/supabase";
import { CollapsibleSection } from "./CollapsibleSection";

// Belt add-on picker shown on the Electrician Pouch Belt Slide PDPs.
// Each option is a separate Hammerex product (its own SKU + price) — when
// ticked, BuyColumn pushes it into the cart as its own line alongside the
// main pouch. No variant-axis change; the host product's cart key is
// untouched, so existing pouch cart entries keep their normal grouping.
export function BeltAddOnSection({
  options,
  selected,
  onToggle,
  currency
}: {
  options: HammerexProduct[];
  selected: Set<string>;
  onToggle: (id: string, next: boolean) => void;
  currency: Currency;
}) {
  const country = useCountry();
  if (options.length === 0) return null;

  const summary = options.filter((o) => selected.has(o.id));
  const selectedLabel = summary.length
    ? `Added: ${summary.map((o) => o.name).join(" + ")}`
    : "Optional · tick to add a belt";

  return (
    <CollapsibleSection title="Add a belt" selectedLabel={selectedLabel}>
      <p className="mb-3 text-xs leading-relaxed text-brand-muted">
        Pick a belt to pair with this pouch. Each belt ships as a separate line in
        your order — choose either, both, or skip.
      </p>
      <ul className="flex flex-col gap-2">
        {options.map((belt) => {
          const checked = selected.has(belt.id);
          const src = belt.image_url ? imageUrl(belt.image_url, 240) ?? belt.image_url : null;
          return (
            <li key={belt.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line bg-black/40 p-3 transition hover:border-brand-accent">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(belt.id, e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-brand-accent"
                  aria-label={`Add ${belt.name}`}
                />
                {src && (
                  <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                    <img
                      src={src}
                      alt={belt.name}
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-contain"
                    />
                  </span>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-brand-text">{belt.name}</span>
                    <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                      +{formatPriceForRegion(belt.price_idr, currency, country)}
                    </span>
                  </div>
                  {belt.sku && (
                    <span className="text-xs font-semibold tracking-wide text-brand-muted">
                      Ref: <span className="text-brand-accent">{belt.sku}</span>
                    </span>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </CollapsibleSection>
  );
}
