"use client";

import { useMemo, useRef, useState } from "react";
import { CURRENCIES, CURRENCY_FLAGS, formatPrice, type Currency } from "@/lib/fx";
import { effectivePricePerUnit } from "@/lib/pricing";
import { cart } from "@/lib/cart";
import { sparkBurst } from "@/lib/sparks";
import type { HammerexProduct, HammerexProductSpec } from "@/lib/supabase";
import { THREAD_COLORS, DEFAULT_THREAD_COLOR, isFreeThreadColor, type ThreadColor } from "@/lib/threadColor";
import { StockBadge } from "./StockBadge";
import { SizeSelector } from "./SizeSelector";
import { PurchaseNotes } from "./PurchaseNotes";
import { DispatchCountdown } from "./DispatchCountdown";
import { QuoteSignalBadge } from "./QuoteSignalBadge";
import { useVariant } from "./VariantContext";
import { useDeal, dealDiscountPct } from "./DealContext";
import { VariantSelector } from "./VariantSelector";
import { RelatedUpsell } from "./RelatedUpsell";

type CategoryLite = { slug: string; name: string };

export function BuyColumn({
  product,
  currentCategory,
  allCategories,
  specs
}: {
  product: HammerexProduct;
  currentCategory?: CategoryLite | null;
  allCategories?: CategoryLite[];
  specs?: HammerexProductSpec[];
}) {
  const [overviewView, setOverviewView] = useState<"description" | "specs">("description");
  const variantCtx = useVariant();
  const dealCtx = useDeal();
  const activeVariant = variantCtx?.active ?? null;
  const activeDeal = dealCtx?.active ?? null;
  const dealPct = activeDeal ? dealDiscountPct(activeDeal, product.price_idr) : 0;
  const displayName = activeDeal?.name ?? product.name;
  const displayOverview = activeDeal?.description
    ?? (activeDeal
      ? `${activeDeal.qty}× ${product.name}${dealPct > 0 ? ` — save ${dealPct}% on the bag price` : ""}. Shipping is calculated at checkout and is not discounted.`
      : product.overview);
  const variantPriceIdr = activeDeal?.price_idr ?? activeVariant?.price_idr ?? product.price_idr;
  const variantSku = activeVariant?.sku ?? product.sku;
  const variantImage = activeVariant?.image_url ?? product.image_url;
  const variantStock = activeVariant?.stock_count ?? product.stock_count;
  const defaultCurrency = (product.base_currency as Currency | undefined) ?? "IDR";
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const threadDelta = product.thread_color_option_idr ?? 0;
  const threadOptionEnabled = threadDelta > 0;
  const [threadColor, setThreadColor] = useState<ThreadColor | null>(
    threadOptionEnabled ? DEFAULT_THREAD_COLOR : null
  );
  const strapDelta = product.backpack_straps_option_idr ?? 0;
  const strapOptionEnabled = strapDelta > 0;
  const [backpackStraps, setBackpackStraps] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const sizes = product.sizes ?? [];
  const tiers = product.qty_discount_tiers ?? [];
  const basePrice = useMemo(() => effectivePricePerUnit(variantPriceIdr, tiers, qty), [variantPriceIdr, tiers, qty]);
  const threadCharged = threadColor && !isFreeThreadColor(threadColor);
  const unitPrice = basePrice + (threadCharged ? threadDelta : 0) + (backpackStraps ? strapDelta : 0);

  const baseDispatchDays = product.dispatch_lead_days ?? 3;
  const customThreadDispatchDelay = threadOptionEnabled && threadCharged ? 2 : 0;
  const dispatchDays = baseDispatchDays + customThreadDispatchDelay;
  const lineTotal = unitPrice * qty;
  const savedPct = product.compare_at_idr && product.compare_at_idr > variantPriceIdr
    ? Math.round(((product.compare_at_idr - variantPriceIdr) / product.compare_at_idr) * 100)
    : 0;

  const soldOut = variantStock === 0;

  const onAdd = () => {
    if (sizes.length && !size) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.([20, 40, 20]); } catch {}
      }
      return;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate?.([10, 30, 10]); } catch {}
    }
    cart.add({
      productId: product.id,
      slug: product.slug ?? product.id,
      name: product.name,
      sku: variantSku ?? null,
      image: variantImage,
      unitPriceIdr: unitPrice,
      qty,
      size,
      baseCurrency: product.base_currency ?? "IDR",
      threadColor,
      variantId: activeVariant?.id ?? null,
      variantLabel: activeVariant?.label ?? null,
      backpackStraps,
      shippingPerUnitIdr: product.shipping_per_unit_idr ?? null
    });
    sparkBurst(addButtonRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
        <span className="font-semibold text-brand-text">{product.brand ?? "Hammerex"}</span>
        <StockBadge count={variantStock} productId={product.id} isAccessory={product.is_accessory ?? false} />
      </div>

      <h1 className="text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{displayName}</h1>

      {variantSku && (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-accent">
          Ref: <span className="text-brand-text">{variantSku}</span>
        </span>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="text-brand-accent" fill={i < 4 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-brand-muted">
            {product.rating_count ? `${product.rating_avg?.toFixed(1)} · ${product.rating_count} reviews` : "Be the first to review"}
          </span>
        </div>
        {specs && specs.length > 0 && (
          <button
            type="button"
            onClick={() => setOverviewView((v) => (v === "description" ? "specs" : "description"))}
            aria-pressed={overviewView === "specs"}
            className={`grid h-9 place-items-center rounded-full px-4 text-[11px] font-bold uppercase tracking-widest transition active:scale-95 ${
              overviewView === "specs"
                ? "bg-brand-accent text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)]"
                : "border-2 border-brand-accent bg-transparent text-brand-accent hover:bg-brand-accent/10"
            }`}
          >
            {overviewView === "description" ? "Specs" : "Description"}
          </button>
        )}
      </div>

      {overviewView === "description" && displayOverview && (
        <p className="text-sm leading-relaxed text-brand-muted">{displayOverview}</p>
      )}
      {overviewView === "specs" && specs && specs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
          {Object.entries(
            specs.reduce<Record<string, HammerexProductSpec[]>>((acc, s) => {
              (acc[s.group_name] ||= []).push(s);
              return acc;
            }, {})
          ).map(([group, rows], i) => (
            <div key={group} className={i > 0 ? "border-t border-brand-line" : ""}>
              <h3 className="border-b border-brand-line bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-brand-accent">
                {group}
              </h3>
              <dl className="divide-y divide-brand-line">
                {rows.map((r) => (
                  <div key={r.id} className="grid grid-cols-2 gap-3 px-4 py-2">
                    <dt className="text-[11px] uppercase tracking-wider text-brand-muted">{r.label}</dt>
                    <dd className="text-xs font-medium text-brand-text">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-xs text-brand-muted">
        <span className="inline-flex items-center gap-2 text-brand-accent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h13l5 5v5h-3" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
          </svg>
          <span className="font-bold uppercase tracking-widest">Ships fast</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          Dispatched in <span className="font-semibold text-brand-text">{dispatchDays} working days</span>
          {customThreadDispatchDelay > 0 && (
            <span className="ml-1 text-brand-accent">(+{customThreadDispatchDelay} for custom thread)</span>
          )}
        </span>
        <span aria-hidden="true">·</span>
        <span>Worldwide tracked courier</span>
      </div>

      <DispatchCountdown cutoffHHMM={product.dispatch_cutoff_local} />

      <QuoteSignalBadge productId={product.id} />

      <div className="flex items-end justify-between border-t border-brand-line pt-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-text">{formatPrice(unitPrice, currency)}</span>
            {activeDeal && dealPct > 0 ? (
              <>
                <span className="text-sm text-brand-muted line-through">{formatPrice(product.price_idr * activeDeal.qty, currency)}</span>
                <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">−{dealPct}%</span>
              </>
            ) : (
              <>
                {product.compare_at_idr && product.compare_at_idr > unitPrice && (
                  <span className="text-sm text-brand-muted line-through">{formatPrice(product.compare_at_idr, currency)}</span>
                )}
                {savedPct > 0 && (
                  <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">−{savedPct}%</span>
                )}
              </>
            )}
          </div>
          {qty > 1 && (
            <div className="text-xs text-brand-muted">
              {qty} × {formatPrice(unitPrice, currency)} = <span className="text-brand-text">{formatPrice(lineTotal, currency)}</span>
            </div>
          )}
          {currency !== defaultCurrency && <div className="text-xs text-brand-muted">Indicative · charged in {defaultCurrency}</div>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-11 items-center rounded-full border border-brand-line bg-brand-surface">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
            >−</button>
            <span className="w-7 text-center text-sm font-semibold text-brand-text" aria-live="polite">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(variantStock ?? 99, q + 1))}
              aria-label="Increase quantity"
              className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
            >+</button>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            aria-label="Currency"
            className="h-11 rounded-md border border-brand-line bg-brand-surface px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{CURRENCY_FLAGS[c]} {c}</option>)}
          </select>
        </div>
      </div>

      {variantCtx && variantCtx.variants.length > 0 && <VariantSelector currency={currency} />}

      {/* DealBreakerCard intentionally removed from PDPs (per user 2026-06-15).
          The "Deal Breakers" mechanic now lives on the checkout page as a
          curated 5-item universal add-on lot. See CheckoutDealBreakers. */}

      {sizes.length > 0 && (
        <SizeSelector sizes={sizes} value={size} onChange={(s) => { setSize(s); setSizeError(false); }} />
      )}

      {threadOptionEnabled && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              Thread colour
            </span>
            <span className="text-xs text-brand-muted">
              Black free · others +{formatPrice(threadDelta, currency)} · +2 working days
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Thread colour">
            {THREAD_COLORS.map((c) => {
              const active = threadColor === c.value;
              const free = isFreeThreadColor(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setThreadColor(c.value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    active ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 rounded-full border border-brand-line"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.label}
                  {!free && active && (
                    <span className="text-xs font-semibold text-brand-accent">+{formatPrice(threadDelta, currency)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {strapOptionEnabled && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              Backpack straps
            </span>
            <span className="text-xs text-brand-muted">
              Standard carry free · add straps +{formatPrice(strapDelta, currency)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Backpack straps option">
            <button
              type="button"
              role="radio"
              aria-checked={!backpackStraps}
              onClick={() => setBackpackStraps(false)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                !backpackStraps ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent"
              }`}
            >
              Standard carry
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={backpackStraps}
              onClick={() => setBackpackStraps(true)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                backpackStraps ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent"
              }`}
            >
              Add backpack straps
              <span className="text-xs font-semibold text-brand-accent">+{formatPrice(strapDelta, currency)}</span>
            </button>
          </div>
        </div>
      )}

      {allCategories && allCategories.length > 0 && (
        <RelatedUpsell
          currentProductId={product.id}
          currentCategory={currentCategory ?? null}
          categories={allCategories}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          ref={addButtonRef}
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="relative h-12 flex-1 overflow-visible rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-40"
        >
          {soldOut ? "Notify me when back" : added ? "Added to cart ✓" : sizeError ? "Pick a size first" : "Add to cart"}
        </button>
      </div>

      <a
        href="/cart"
        className="grid h-12 place-items-center rounded-full border border-brand-line bg-brand-surface text-sm font-semibold text-brand-text hover:border-brand-accent"
      >
        View cart & checkout
      </a>

      <PurchaseNotes notes={product.purchase_notes} />

      <a
        href="/terms-and-conditions#3-year-free-repair-warranty"
        className="block rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-3 text-xs text-brand-muted transition hover:border-brand-accent"
      >
        <div className="flex items-center gap-2 text-brand-accent">
          <Shield />
          <span className="font-bold uppercase tracking-widest">3-year free repair</span>
        </div>
        <p className="mt-1 leading-relaxed">
          Confirmed manufacturing defects repaired free for 3 years from dispatch — you pay
          inbound postage, we pay return. Every order recorded by CCTV at dispatch.{" "}
          <span className="font-semibold text-brand-text">See terms →</span>
        </p>
      </a>

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
