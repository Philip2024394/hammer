"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, type Currency } from "@/lib/fx";
import { bundlePricing } from "@/lib/pricing";
import { beltSizingFor } from "@/lib/beltSizes";
import { cart } from "@/lib/cart";
import type { HammerexBundle } from "@/lib/supabase";

export function BundleBlock({
  bundle,
  anchorSlug,
  currency = "IDR",
  inline = false
}: {
  bundle: HammerexBundle | null;
  anchorSlug?: string | null;
  currency?: Currency;
  // When true, render without the full-width <section> + max-w-6xl wrappers
  // so the block can live inside a narrower column (e.g. the PDP BuyColumn).
  inline?: boolean;
}) {
  if (!bundle?.items.length) return null;
  // Belt sizing is keyed by the anchor slug — only certain belt-set anchors
  // surface waist sizes (scaffolders-setup-kit etc.). When absent, the size
  // selector simply doesn't render.
  const beltConfig = beltSizingFor(anchorSlug);

  const [picked, setPicked] = useState<Record<string, boolean>>(
    Object.fromEntries(bundle.items.map((i) => [i.id, true]))
  );
  const [bundleQty, setBundleQty] = useState(1);
  const [bundleBeltSize, setBundleBeltSize] = useState<string | null>(null);
  const [beltError, setBeltError] = useState(false);
  const [added, setAdded] = useState(false);

  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  // Measure the body so the slide-down has a real target value; observe
  // resizes so checkbox-driven layout shifts inside the body don't clip.
  useEffect(() => {
    if (!open || !bodyRef.current) {
      setMaxHeight(0);
      return;
    }
    const measure = () => {
      if (bodyRef.current) setMaxHeight(bodyRef.current.scrollHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(bodyRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [open]);

  // Rotating thumbnail in the header — cycles through bundle product images
  // every 2.4s while the section is closed so the buyer sees what's inside
  // without having to expand. Pauses on hover for accessibility.
  const productImages = bundle.items.map((i) => i.product.image_url).filter(Boolean) as string[];
  const [thumbIdx, setThumbIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (productImages.length <= 1 || open || paused) return;
    const id = window.setInterval(() => {
      setThumbIdx((i) => (i + 1) % productImages.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [productImages.length, open, paused]);

  const selected = bundle.items.filter((i) => picked[i.id]);
  const { original, final, savings } = useMemo(
    () => bundlePricing(selected.map((i) => i.product.price_idr * i.qty), bundle.discount_pct),
    [selected, bundle.discount_pct]
  );

  const Wrapper = inline ? "div" : "section";
  const wrapperProps = inline
    ? { className: "flex flex-col gap-3" }
    : { id: "bundle", className: "border-t border-brand-line py-10" };

  return (
    <Wrapper {...wrapperProps}>
      <div className={inline ? "" : "mx-auto max-w-6xl px-4"}>
        <div className={`overflow-hidden rounded-2xl border ${open ? "border-brand-accent" : "border-brand-line"}`}>
          {/* Yellow header — title on the left, mini carousel on the right,
              chevron at the far edge. Tap anywhere on the bar to expand. */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="bundle-body"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="flex w-full items-center justify-between gap-3 bg-brand-accent px-4 py-3 text-left text-black transition active:scale-[0.995] hover:opacity-95"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wide">{bundle.title || "Bundle and Save"}</span>
                <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
                  Save {bundle.discount_pct}%
                </span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {bundle.items.length} products · bundle price {formatPrice(final, currency)}
              </span>
            </span>

            {productImages.length > 0 && (
              <span
                aria-hidden="true"
                className="hidden shrink-0 items-center gap-1 sm:flex"
              >
                {/* Static strip: shows up to 4 small product thumbs side by side. */}
                {productImages.slice(0, 4).map((src, i) => (
                  <span
                    key={`${src}-${i}`}
                    className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-md border bg-black transition ${
                      i === thumbIdx % Math.min(productImages.length, 4)
                        ? "border-black scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                        : "border-black/30 opacity-70"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${bundle.title || "Hammerex bundle"} — included product`} className="h-full w-full object-contain p-0.5" loading="lazy" />
                  </span>
                ))}
                {productImages.length > 4 && (
                  <span className="ml-1 text-xs font-bold uppercase tracking-widest">
                    +{productImages.length - 4}
                  </span>
                )}
              </span>
            )}

            {/* Mobile-only single rotating thumb so the carousel still shows
                up when the strip wouldn't fit. */}
            {productImages.length > 0 && (
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md border border-black/30 bg-black sm:hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={productImages[thumbIdx]}
                  src={productImages[thumbIdx]}
                  alt={`${bundle.title || "Hammerex bundle"} — included product`}
                  loading="lazy"
                  className="h-full w-full object-contain p-0.5 transition-opacity duration-500"
                />
              </span>
            )}

            <span
              aria-hidden="true"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/15 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          {/* Slide-down body. */}
          <div
            id="bundle-body"
            role="region"
            style={{ maxHeight }}
            className="overflow-hidden bg-brand-surface transition-[max-height] duration-300 ease-out"
          >
            <div ref={bodyRef} className="p-4 sm:p-5">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-brand-muted">Tick items to recalculate. Bundle discount applies automatically.</p>
                {anchorSlug && (
                  <a
                    href={`/bundle/${anchorSlug}`}
                    className="text-xs font-semibold text-brand-accent hover:underline"
                  >
                    Share / view bundle page →
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {bundle.items.map((item, idx) => (
                    <li key={item.id} className="relative">
                      <label className="flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-brand-line bg-brand-bg p-3 has-[:checked]:border-brand-accent">
                        <div className="flex items-center justify-between">
                          <input
                            type="checkbox"
                            checked={!!picked[item.id]}
                            onChange={(e) => setPicked((p) => ({ ...p, [item.id]: e.target.checked }))}
                            className="h-4 w-4 accent-brand-accent"
                            aria-label={`Include ${item.product.name}`}
                          />
                          {idx < bundle.items.length - 1 && (
                            <span className="hidden text-brand-muted sm:inline">+</span>
                          )}
                        </div>
                        <div className="aspect-square overflow-hidden rounded-lg border border-brand-line bg-black">
                          {item.product.image_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-contain p-2" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-brand-text">{item.product.name}</div>
                          <div className="text-xs text-brand-muted">{formatPrice(item.product.price_idr, currency)}</div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>

                <aside className="flex flex-col gap-2 rounded-2xl border border-brand-line bg-brand-bg p-5">
                  <div className="text-xs text-brand-muted">Original</div>
                  <div className="text-sm text-brand-muted line-through">{formatPrice(original, currency)}</div>
                  <div className="mt-2 text-xs text-brand-muted">Bundle price</div>
                  <div className="text-2xl font-bold text-brand-text">{formatPrice(final, currency)}</div>
                  <div className="mt-1 inline-block rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                    You save {formatPrice(savings, currency)}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase controls — moved BELOW the Bundle and Save container so
            the buyer always sees the price, qty and belt size even when the
            bundle slider is collapsed. Total figures scale with bundleQty. */}
        <div className="mt-4 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-text sm:text-3xl">
                {formatPrice(final * bundleQty, currency)}
              </span>
              <span className="text-sm text-brand-muted line-through">
                {formatPrice(original * bundleQty, currency)}
              </span>
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold text-brand-accent">
                −{bundle.discount_pct}%
              </span>
              {bundleQty > 1 && (
                <span className="text-xs text-brand-muted">· bundle × {bundleQty}</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-brand-line pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBundleQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease bundle quantity"
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-xl font-bold text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                >−</button>
                <span className="w-7 text-center text-base font-bold text-brand-text" aria-live="polite">{bundleQty}</span>
                <button
                  type="button"
                  onClick={() => setBundleQty((q) => Math.min(99, q + 1))}
                  aria-label="Increase bundle quantity"
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-xl font-bold text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
                >+</button>
              </div>
            </div>

            {beltConfig && (
              <div className="border-t border-brand-line pt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                    Belt waist size — made to fit
                  </span>
                  <a
                    href={beltConfig.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-accent hover:underline"
                  >View size guide</a>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {beltConfig.sizes.map((s, i) => {
                    const isSelected = bundleBeltSize === s;
                    const shouldFlash = beltError && i === 0 && !isSelected;
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => { setBundleBeltSize(s); setBeltError(false); }}
                          aria-pressed={isSelected}
                          className={`min-h-11 min-w-[3rem] rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                            isSelected
                              ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                              : shouldFlash
                                ? "hx-flash-red"
                                : "border-brand-line bg-brand-bg text-brand-text hover:border-brand-accent"
                          }`}
                        >{s}</button>
                      </li>
                    );
                  })}
                </ul>
                {!bundleBeltSize && (
                  <p className={`mt-2 text-xs ${beltError ? "text-red-400" : "text-brand-muted"}`}>
                    {beltError ? "Please pick a waist size." : "Select your waist size to fit the belt."}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={selected.length === 0 || added}
              onClick={() => {
                if (beltConfig && !bundleBeltSize) {
                  setBeltError(true);
                  return;
                }
                // Apply the bundle discount per-line by scaling each item's
                // unit price by (1 − discount_pct/100). This way the cart's
                // subtotal already reflects the bundle savings without any
                // additional cart-side logic, and removing one line later
                // still leaves the remaining ones discounted (matches the
                // picker's "tick items to recalculate" promise).
                const factor = 1 - bundle.discount_pct / 100;
                const r100 = (n: number) => Math.floor(n / 100) * 100;
                const bundleLabel = `BUNDLE · ${bundle.title || "Bundle and Save"} (−${bundle.discount_pct}%)`;
                for (const item of selected) {
                  const p = item.product;
                  const discountedUnitIdr = r100(p.price_idr * factor);
                  // Belt waist size applies to belt-bearing anchors only;
                  // tag every item in the bundle with it so the cart line
                  // tells the admin the same waist size for the whole set.
                  const itemBeltSize = beltConfig ? bundleBeltSize : null;
                  cart.add({
                    productId: p.id,
                    slug: p.slug ?? p.id,
                    name: p.name,
                    sku: p.sku ?? null,
                    image: p.image_url ?? null,
                    unitPriceIdr: discountedUnitIdr,
                    qty: item.qty * bundleQty,
                    size: null,
                    baseCurrency: p.base_currency ?? "IDR",
                    threadColor: null,
                    variantId: null,
                    variantLabel: bundleLabel,
                    backpackStraps: false,
                    shippingPerUnitIdr: null,
                    beltSize: itemBeltSize,
                    customBrandName: null,
                    repairCover: false,
                    beltUpgrade: null
                  });
                }
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1800);
              }}
              className="h-12 w-full rounded-full bg-brand-accent text-sm font-semibold text-black transition active:scale-[0.98] hover:opacity-90 disabled:opacity-40"
            >
              {added ? "Bundle added ✓" : "Add bundle to cart"}
            </button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
