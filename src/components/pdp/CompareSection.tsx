"use client";

import type { HammerexProduct } from "@/lib/supabase";
import { formatPriceForRegion, shouldShowPrice, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import { imageUrl } from "@/lib/imageUrl";

// Side-by-side comparison rail. Shows the current product plus the products
// listed in hammerex_products.compare_with (max 2 — comparison reads cleanest
// as 3 columns). The "current" column is highlighted with a yellow border
// and labelled "THIS PRODUCT" so the buyer can quickly orient.
export function CompareSection({
  currentProduct,
  others
}: {
  currentProduct: HammerexProduct;
  others: HammerexProduct[];
}) {
  const country = useCountry();
  if (others.length === 0) return null;
  const lineup: { p: HammerexProduct; isCurrent: boolean }[] = [
    { p: currentProduct, isCurrent: true },
    ...others.map((p) => ({ p, isCurrent: false }))
  ];

  return (
    <section id="compare" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-brand-text">Compare these products</h2>
          <p className="mt-1 text-xs text-brand-muted">
            See how the {currentProduct.name} stacks up against the closest alternatives in the
            Hammerex plastering range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {lineup.map(({ p, isCurrent }) => {
            const currency: Currency = (p.base_currency as Currency | undefined) ?? "IDR";
            const href = `/product/${p.slug ?? p.id}`;
            const features = (p.features ?? []).slice(0, 4);
            return (
              <article
                key={p.id}
                className={`flex flex-col overflow-hidden rounded-2xl bg-brand-surface ${
                  isCurrent
                    ? "border-2 border-brand-accent shadow-[0_2px_16px_rgba(255,179,0,0.25)]"
                    : "border border-brand-line"
                }`}
              >
                <a href={href} className="relative block aspect-square w-full overflow-hidden bg-black">
                  {p.image_url && (
                    <img
                      src={imageUrl(p.image_url, 480) ?? p.image_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-3"
                    />
                  )}
                  {isCurrent && (
                    <span className="absolute left-0 top-3 z-10 inline-flex h-7 items-center bg-brand-accent px-3 text-xs font-bold uppercase tracking-widest text-black">
                      This product
                    </span>
                  )}
                </a>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <a href={href} className="text-sm font-bold uppercase leading-tight text-brand-text hover:text-brand-accent">
                    {p.name}
                  </a>

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-brand-text">{formatPriceForRegion(p.price_idr, currency, country)}</span>
                    {shouldShowPrice(country) && p.compare_at_idr && p.compare_at_idr > p.price_idr && (
                      <span className="text-xs text-brand-muted line-through">{formatPriceForRegion(p.compare_at_idr, currency, country)}</span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-snug text-brand-muted">
                          <span className="mt-0.5 text-brand-accent" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          <span className="line-clamp-2">{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href={href}
                    className={`mt-auto grid h-10 place-items-center rounded-md text-xs font-bold uppercase tracking-widest transition active:scale-95 ${
                      isCurrent
                        ? "border-2 border-brand-accent bg-transparent text-brand-accent cursor-default pointer-events-none"
                        : "bg-brand-accent text-black hover:opacity-90"
                    }`}
                  >
                    {isCurrent ? "You are here" : "View product →"}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
