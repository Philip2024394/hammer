"use client";

import { formatPriceForRegion, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import { useVariant } from "./VariantContext";

export function VariantSelector({ currency }: { currency: Currency }) {
  const country = useCountry();
  const ctx = useVariant();
  if (!ctx || ctx.variants.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
          Choose option {ctx.active ? "" : "(required)"}
        </span>
        {ctx.active && (
          <span className="text-xs text-brand-accent">Ref: {ctx.active.sku ?? "—"}</span>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Variant">
        {ctx.variants.map((v) => {
          const active = ctx.active?.id === v.id;
          return (
            <li key={v.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => ctx.setActiveId(v.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                  active
                    ? "border-brand-accent bg-brand-accent/10"
                    : "border-brand-line bg-brand-surface hover:border-brand-accent"
                }`}
              >
                {v.image_url && (
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                    <img src={v.image_url} alt={v.label} className="h-full w-full object-contain p-1" />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-semibold leading-tight text-brand-text">{v.label}</span>
                  <span className="text-xs text-brand-muted">
                    {formatPriceForRegion(v.price_idr, currency, country)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
