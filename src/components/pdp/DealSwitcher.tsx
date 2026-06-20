"use client";

import { useDeal, dealDiscountPct } from "./DealContext";

// Rounded-square "Multi Purchase" buttons rendered next to the gallery
// thumbnails. Each button is labelled with the deal's `qty` (2, 3, 4…)
// — so the buyer reads "tap 2 to buy 2 bags". A small savings badge
// under each button shows the % off vs list price.
export function DealSwitcher() {
  const ctx = useDeal();
  if (!ctx || ctx.deals.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
        Multi Purchase
      </span>
      <div className="flex flex-wrap items-start gap-2">
        {/* Synthetic "1" button — represents the default single-bag listing.
            Highlighted when no deal is selected; tapping it deselects any
            active deal. Not stored in the DB. */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => ctx.setActiveId(null)}
            aria-label="Buy 1 — single bag (no bundle)"
            aria-pressed={ctx.active == null}
            className={`grid h-16 w-16 place-items-center rounded-xl border-2 text-2xl font-bold transition active:scale-95 ${
              ctx.active == null
                ? "border-brand-accent bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.45)]"
                : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
            }`}
            title="Buy 1"
          >
            1
          </button>
          {/* invisible spacer keeps the row aligned with deal buttons that have a "−X%" badge */}
          <span className="text-xs font-bold uppercase tracking-wider opacity-0">−</span>
        </div>

        {ctx.deals.map((d, i) => {
          const isActive = ctx.active?.id === d.id;
          const anyDealActive = ctx.active != null;
          const showChase = !anyDealActive;
          const perButton = ctx.deals.length > 0 ? 6 / ctx.deals.length : 6;
          const pct = dealDiscountPct(d, ctx.unitPriceIdr);
          return (
            <div key={d.id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => ctx.setActiveId(isActive ? null : d.id)}
                aria-label={`Buy ${d.qty} — ${d.name}`}
                aria-pressed={isActive}
                className={`grid h-16 w-16 place-items-center rounded-xl border-2 text-2xl font-bold transition active:scale-95 ${
                  isActive
                    ? "border-brand-accent bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.45)]"
                    : showChase
                      ? "hx-deal-chase border-brand-line bg-brand-surface text-brand-text"
                      : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
                }`}
                style={showChase && !isActive ? { animationDelay: `${i * perButton}s` } : undefined}
                title={`Buy ${d.qty}`}
              >
                {d.qty}
              </button>
              {pct > 0 && (
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                  −{pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
