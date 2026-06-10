"use client";

import { useState } from "react";
import { CURRENCIES, formatPrice, type Currency } from "@/lib/fx";
import type { HammerexProduct, HammerexShippingZone } from "@/lib/supabase";
import { LiveETA } from "./LiveETA";

export function BuyColumn({ product, zones }: { product: HammerexProduct; zones: HammerexShippingZone[] }) {
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full border border-brand-line bg-brand-surface px-2 py-1 text-brand-muted">{product.brand ?? "Hammerex"}</span>
        {product.model_number && <span className="text-brand-muted">Model {product.model_number}</span>}
        {product.sku && <span className="text-brand-muted">· SKU {product.sku}</span>}
      </div>

      <h1 className="text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{product.name}</h1>

      {/* Pillar rating placeholder — beats DeWalt's empty star block.
          Wired to real data in Phase 2 once reviews ship. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < 4 ? "#ff5a1f" : "none"} stroke="#ff5a1f" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-brand-muted">4.6 · 0 reviews</span>
        </div>
        <span className="text-xs text-brand-muted">·</span>
        <span className="text-xs text-brand-muted">Power 4.8 · Build 4.7 · Battery 4.4</span>
      </div>

      {product.overview && <p className="text-sm leading-relaxed text-brand-muted">{product.overview}</p>}

      <div className="flex items-end justify-between border-t border-brand-line pt-4">
        <div>
          <div className="text-2xl font-bold text-brand-text">{formatPrice(product.price_idr, currency)}</div>
          {currency !== "IDR" && (
            <div className="text-xs text-brand-muted">Indicative · charged in IDR</div>
          )}
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
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="grid h-12 w-12 place-items-center text-brand-text hover:text-brand-accent"
          >+</button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="h-12 flex-1 rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90"
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      <button
        type="button"
        className="h-12 rounded-full border border-brand-line bg-brand-surface text-sm font-semibold text-brand-text hover:border-brand-accent"
      >
        Buy now
      </button>

      <LiveETA
        zones={zones}
        cutoffLocal={product.dispatch_cutoff_local ?? "14:00"}
        weightKg={Number(product.weight_kg ?? 1)}
        currency={currency}
      />

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
