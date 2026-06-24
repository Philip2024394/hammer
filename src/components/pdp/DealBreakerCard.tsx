"use client";

import { useMemo, useState } from "react";
import { formatPriceForRegion, shouldShowPrice, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import { cart } from "@/lib/cart";
import type { HammerexDealBreaker } from "@/lib/supabase";
import { DealBreakerDetailModal } from "./DealBreakerDetailModal";

const COLOR_MAP: Record<string, string> = {
  black: "#111111", white: "#F4F4F4", red: "#D33A2C", orange: "#F08A1E",
  yellow: "#F2C811", green: "#2E8B57", blue: "#1E5BD9", navy: "#0B1A45",
  grey: "#9CA3AF", gray: "#9CA3AF", silver: "#C0C0C0", brown: "#7A4E2A",
  tan: "#C19A6B", pink: "#E91E63", purple: "#6D28D9"
};
function colorHex(label: string): string | null {
  return COLOR_MAP[label.toLowerCase().trim()] ?? null;
}

export function DealBreakerCard({
  items,
  currency,
  anchorProductName
}: {
  items: HammerexDealBreaker[];
  currency: Currency;
  anchorProductName: string;
}) {
  const country = useCountry();
  const [detailFor, setDetailFor] = useState<HammerexDealBreaker | null>(null);
  const [open, setOpen] = useState(false);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [variantPicks, setVariantPicks] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const d of items) {
      const def = d.variants.find((v) => v.is_default) ?? d.variants[0];
      if (def) obj[d.id] = def.id;
    }
    return obj;
  });
  const [added, setAdded] = useState(false);

  if (!items.length) return null;

  const selected = useMemo(
    () => items.filter((d) => (qtys[d.id] ?? 0) > 0),
    [items, qtys]
  );
  const totalQty = selected.reduce((s, d) => s + (qtys[d.id] ?? 0), 0);
  const totalDeal = selected.reduce((s, d) => s + d.deal_price_idr * (qtys[d.id] ?? 0), 0);
  const totalRrp = selected.reduce((s, d) => s + d.item.price_idr * (qtys[d.id] ?? 0), 0);
  const savings = totalRrp - totalDeal;

  const startingFrom = Math.min(...items.map((d) => d.deal_price_idr));

  const setQty = (id: string, next: number) =>
    setQtys((p) => ({ ...p, [id]: Math.max(0, Math.min(99, next)) }));

  const onAdd = () => {
    if (!totalQty) return;
    for (const d of selected) {
      const activeVariant = d.variants.find((v) => v.id === variantPicks[d.id]) ?? null;
      cart.add({
        productId: d.item.id,
        slug: d.item.slug ?? d.item.id,
        name: d.item.name,
        sku: activeVariant?.sku ?? d.item.sku ?? null,
        image: activeVariant?.image_url ?? d.item.image_url,
        unitPriceIdr: d.deal_price_idr,
        qty: qtys[d.id] ?? 1,
        size: null,
        baseCurrency: d.item.base_currency ?? "IDR",
        threadColor: null,
        variantId: activeVariant?.id ?? null,
        variantLabel: activeVariant?.label
          ? `Deal Breaker · ${activeVariant.label}`
          : "Deal Breaker",
        backpackStraps: false
      });
    }
    setQtys({});
    setOpen(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section
      aria-label="Deal Breaker upsell"
      className="overflow-hidden rounded-2xl border border-brand-accent bg-brand-accent/10"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="deal-breaker-body"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black"
          aria-hidden="true"
        >
          <Hammer />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Deal Breaker
          </span>
          <span className="text-xs text-brand-text">
            {items.length} add-on{items.length === 1 ? "" : "s"} from {formatPriceForRegion(startingFrom, currency, country)} · bundle price
          </span>
        </span>
        <span
          className={`shrink-0 text-brand-accent transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <Chevron />
        </span>
      </button>

      {open && (
        <div id="deal-breaker-body" className="border-t border-brand-accent/40 bg-black/30">
          <ul className="divide-y divide-brand-line/60">
            {items.map((d) => {
              const qty = qtys[d.id] ?? 0;
              const rrp = d.item.price_idr;
              const savedPct = rrp > d.deal_price_idr
                ? Math.round(((rrp - d.deal_price_idr) / rrp) * 100)
                : 0;
              const activeVariant = d.variants.find((v) => v.id === variantPicks[d.id]) ?? null;
              const displayRef = activeVariant?.sku ?? d.item.sku;
              return (
                <li key={d.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    {d.item.image_url && (
                      <button
                        type="button"
                        onClick={() => setDetailFor(d)}
                        aria-label={`View ${d.item.name} details`}
                        className="group relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-brand-line bg-brand-surface"
                      >
                        <img src={d.item.image_url} alt={d.item.name} className="h-full w-full object-contain p-1" />
                        <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-accent text-black">
                            <EyeIcon />
                          </span>
                        </span>
                        <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-brand-accent text-black sm:hidden">
                          <EyeIcon small />
                        </span>
                      </button>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-xs font-semibold text-brand-text">{d.item.name}</span>
                      {displayRef && (
                        <span className="text-xs font-semibold text-brand-accent">Ref: {displayRef}</span>
                      )}
                      <span className="flex flex-wrap items-baseline gap-2 text-xs">
                        <span className="font-bold text-brand-text">{formatPriceForRegion(d.deal_price_idr, currency, country)}</span>
                        {shouldShowPrice(country) && rrp > d.deal_price_idr && (
                          <span className="text-brand-muted line-through">{formatPriceForRegion(rrp, currency, country)}</span>
                        )}
                        {shouldShowPrice(country) && savedPct > 0 && (
                          <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                            −{savedPct}%
                          </span>
                        )}
                      </span>
                    </span>
                    <div className={`flex h-11 shrink-0 items-center rounded-full border ${qty > 0 ? "border-brand-accent" : "border-brand-line"} bg-black/40`}>
                      <button
                        type="button"
                        onClick={() => setQty(d.id, qty - 1)}
                        aria-label={`Decrease ${d.item.name}`}
                        disabled={qty === 0}
                        className="grid h-11 w-11 place-items-center text-brand-text disabled:text-brand-muted disabled:opacity-50"
                      >−</button>
                      <span className="w-7 text-center text-xs font-semibold text-brand-text" aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(d.id, qty + 1)}
                        aria-label={`Increase ${d.item.name}`}
                        className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
                      >+</button>
                    </div>
                  </div>

                  {d.variants.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5" style={{ paddingLeft: 60 }}>
                      <span className="text-xs uppercase tracking-widest text-brand-muted">Colour:</span>
                      {d.variants.map((v) => {
                        const hex = colorHex(v.label);
                        const active = activeVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVariantPicks((p) => ({ ...p, [d.id]: v.id }))}
                            aria-label={`Choose ${v.label}`}
                            aria-pressed={active}
                            title={v.label}
                            className={`grid h-11 w-11 place-items-center rounded-full border-2 transition ${
                              active ? "border-brand-accent" : "border-brand-line hover:border-brand-text"
                            }`}
                          >
                            {hex ? (
                              <span style={{ backgroundColor: hex }} className="block h-5 w-5 rounded-full border border-brand-line" />
                            ) : (
                              <span className="text-xs font-bold uppercase text-brand-text">{v.label.charAt(0)}</span>
                            )}
                          </button>
                        );
                      })}
                      {activeVariant && (
                        <span className="ml-1 text-xs text-brand-muted">{activeVariant.label}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 border-t border-brand-accent/40 px-4 py-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs uppercase tracking-widest text-brand-muted">
                {totalQty > 0 ? `${totalQty} item${totalQty === 1 ? "" : "s"} selected` : "Pick a quantity"}
              </span>
              {totalQty > 0 ? (
                <span className="flex flex-wrap items-baseline gap-2 text-xs">
                  <span className="font-bold text-brand-text">{formatPriceForRegion(totalDeal, currency, country)}</span>
                  {shouldShowPrice(country) && savings > 0 && (
                    <span className="text-brand-accent">save {formatPriceForRegion(savings, currency, country)}</span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-brand-muted">Use + / − to add as many as you like</span>
              )}
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={!totalQty}
              className="h-10 rounded-full bg-brand-accent px-4 text-xs font-semibold text-black hover:opacity-90 disabled:opacity-40"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        </div>
      )}

      {detailFor && (
        <DealBreakerDetailModal
          deal={detailFor}
          anchorProductName={anchorProductName}
          currency={currency}
          onClose={() => setDetailFor(null)}
        />
      )}
    </section>
  );
}

function EyeIcon({ small }: { small?: boolean }) {
  const s = small ? 10 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Hammer() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6l4 4-8 8H6v-4z" /><path d="M14 6l3-3 4 4-3 3" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
