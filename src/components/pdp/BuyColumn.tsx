"use client";

import { useMemo, useState } from "react";
import { CURRENCIES, formatPrice, type Currency } from "@/lib/fx";
import { effectivePricePerUnit, nextTier } from "@/lib/pricing";
import { cart } from "@/lib/cart";
import type { HammerexProduct } from "@/lib/supabase";
import { StockBadge } from "./StockBadge";
import { WishlistButton } from "./WishlistButton";
import { SizeSelector } from "./SizeSelector";
import { PurchaseNotes } from "./PurchaseNotes";
import { DeliveryQuoteBanner } from "./DeliveryQuoteBanner";

export function BuyColumn({ product }: { product: HammerexProduct }) {
  const defaultCurrency = (product.base_currency as Currency | undefined) ?? "IDR";
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const sizes = product.sizes ?? [];
  const tiers = product.qty_discount_tiers ?? [];
  const unitPrice = useMemo(() => effectivePricePerUnit(product.price_idr, tiers, qty), [product.price_idr, tiers, qty]);
  const lineTotal = unitPrice * qty;
  const nextT = useMemo(() => nextTier(tiers, qty), [tiers, qty]);
  const savedPct = product.compare_at_idr && product.compare_at_idr > product.price_idr
    ? Math.round(((product.compare_at_idr - product.price_idr) / product.compare_at_idr) * 100)
    : 0;

  const soldOut = product.stock_count === 0;

  const onAdd = () => {
    if (sizes.length && !size) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    cart.add({
      productId: product.id,
      slug: product.slug ?? product.id,
      name: product.name,
      image: product.image_url,
      unitPriceIdr: unitPrice,
      qty,
      size,
      baseCurrency: product.base_currency ?? "IDR"
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-brand-line bg-brand-surface px-2 py-1 text-brand-muted">{product.brand ?? "Hammerex"}</span>
        {product.model_number && <span className="text-brand-muted">Model {product.model_number}</span>}
        {product.sku && <span className="text-brand-muted">· SKU {product.sku}</span>}
        <StockBadge count={product.stock_count} />
      </div>

      <h1 className="text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{product.name}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < 4 ? "#FFB300" : "none"} stroke="#FFB300" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-brand-muted">
            {product.rating_count ? `${product.rating_avg?.toFixed(1)} · ${product.rating_count} reviews` : "Be the first to review"}
          </span>
        </div>
      </div>

      {product.overview && <p className="text-sm leading-relaxed text-brand-muted">{product.overview}</p>}

      <div className="flex items-end justify-between border-t border-brand-line pt-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-text">{formatPrice(unitPrice, currency)}</span>
            {product.compare_at_idr && product.compare_at_idr > unitPrice && (
              <span className="text-sm text-brand-muted line-through">{formatPrice(product.compare_at_idr, currency)}</span>
            )}
            {savedPct > 0 && (
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[11px] font-semibold text-brand-accent">−{savedPct}%</span>
            )}
          </div>
          {qty > 1 && (
            <div className="text-xs text-brand-muted">
              {qty} × {formatPrice(unitPrice, currency)} = <span className="text-brand-text">{formatPrice(lineTotal, currency)}</span>
            </div>
          )}
          {currency !== defaultCurrency && <div className="text-xs text-brand-muted">Indicative · charged in {defaultCurrency}</div>}
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          aria-label="Currency"
          className="h-9 rounded-md border border-brand-line bg-brand-surface px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {sizes.length > 0 && (
        <SizeSelector sizes={sizes} value={size} onChange={(s) => { setSize(s); setSizeError(false); }} />
      )}

      {tiers.length > 0 && (
        <div className="rounded-xl border border-brand-line bg-black/40 p-3">
          <div className="text-[11px] uppercase tracking-widest text-brand-muted">Buy more, save more</div>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {[{ min: 1, pct: 0 }, ...tiers].map((t) => {
              const active = qty >= t.min;
              return (
                <li
                  key={t.min}
                  onClick={() => setQty(t.min)}
                  className={`cursor-pointer rounded-lg border p-2 text-center ${
                    active ? "border-brand-accent bg-brand-accent/10" : "border-brand-line bg-brand-surface"
                  }`}
                >
                  <div className="text-xs font-semibold text-brand-text">{t.min}+ unit{t.min === 1 ? "" : "s"}</div>
                  <div className="text-[11px] text-brand-muted">{t.pct === 0 ? "Standard" : `−${t.pct}% each`}</div>
                </li>
              );
            })}
          </ul>
          {nextT && (
            <p className="mt-2 text-[11px] text-brand-accent">
              Add {nextT.min - qty} more and pay only {formatPrice(effectivePricePerUnit(product.price_idr, tiers, nextT.min), currency)} each.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-brand-line bg-brand-surface">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="grid h-12 w-12 place-items-center text-brand-text hover:text-brand-accent"
          >−</button>
          <span className="w-8 text-center text-sm font-semibold text-brand-text" aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock_count ?? 99, q + 1))}
            aria-label="Increase quantity"
            className="grid h-12 w-12 place-items-center text-brand-text hover:text-brand-accent"
          >+</button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="h-12 flex-1 rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-40"
        >
          {soldOut ? "Notify me when back" : added ? "Added to cart ✓" : sizeError ? "Pick a size first" : "Add to cart"}
        </button>

        <WishlistButton productId={product.id} />
      </div>

      <a
        href="/cart"
        className="grid h-12 place-items-center rounded-full border border-brand-line bg-brand-surface text-sm font-semibold text-brand-text hover:border-brand-accent"
      >
        View cart & checkout
      </a>

      <DeliveryQuoteBanner />

      <PurchaseNotes notes={product.purchase_notes} />

      <ul className="grid grid-cols-2 gap-2 text-xs text-brand-muted">
        <li className="flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-2">
          <Shield /> Authentic
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-2">
          <Calendar /> {product.warranty_years ?? 1}-year warranty
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-2">
          <Return /> 30-day returns
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-2">
          <Lock /> Secure checkout
        </li>
      </ul>
    </div>
  );
}

function Shield() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/><path d="m9 12 2 2 4-4"/></svg>;
}
function Calendar() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function Return() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 5v5h5"/></svg>;
}
function Lock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
