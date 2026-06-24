"use client";

import { useEffect, useState } from "react";
import { supabase, type HammerexProduct } from "@/lib/supabase";
import { cart } from "@/lib/cart";
import { formatPriceForRegion, shouldShowPrice } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";

// Five curated universal add-ons surfaced at checkout and on non-kit PDPs —
// Hammerex "Deal Breakers". Each is small-ticket and broadly useful so
// trade pros can impulse-add without thinking. Each line is added to the
// cart at DISCOUNT_PCT off the listed price and tagged as "DEAL BREAKER"
// so it's visually distinct on the cart and in the team quote that
// follows checkout.
//
// Each card opens a quick-view modal on tap that shows a larger image,
// short description, star rating and the discounted price — so the buyer
// can see what they're getting before committing.
const SLUGS = [
  "measure-tape-belt-holder",
  "marker-belt-holder",
  "hammer-pencil-belt-holder",
  "battery-drill-belt-holder",
  "leather-work-gloves"
];

const DISCOUNT_PCT = 15;

export function CheckoutDealBreakers() {
  const country = useCountry();
  const showPrices = shouldShowPrice(country);
  const [products, setProducts] = useState<HammerexProduct[]>([]);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("hammerex_products")
        .select("*")
        .in("slug", SLUGS);
      if (!data) return;
      const lookup = new Map((data as HammerexProduct[]).map((p) => [p.slug ?? "", p]));
      setProducts(SLUGS.map((s) => lookup.get(s)).filter((p): p is HammerexProduct => Boolean(p)));
    })();
  }, []);

  useEffect(() => {
    const sync = () => {
      const inCart: Record<string, boolean> = {};
      for (const l of cart.read()) {
        if (l.variantLabel === "DEAL BREAKER") inCart[l.productId] = true;
      }
      setAdded(inCart);
    };
    sync();
    return cart.subscribe(sync);
  }, []);

  useEffect(() => {
    if (!previewId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [previewId]);

  if (products.length === 0) return null;

  const previewing = previewId ? products.find((p) => p.id === previewId) ?? null : null;

  const onAdd = (p: HammerexProduct) => {
    const discounted = Math.round(p.price_idr * (1 - DISCOUNT_PCT / 100));
    cart.add({
      productId: p.id,
      slug: p.slug ?? p.id,
      name: p.name,
      sku: p.sku ?? null,
      image: p.image_url,
      unitPriceIdr: discounted,
      qty: 1,
      size: null,
      baseCurrency: p.base_currency ?? "GBP",
      threadColor: null,
      variantId: null,
      variantLabel: "DEAL BREAKER",
      backpackStraps: false
    });
    setPreviewId(null);
  };

  return (
    <>
      <section className="mt-6 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">
            Deal Breakers
          </h2>
          <span className="text-xs text-brand-muted">
            Most trades carry these · <span className="font-semibold text-brand-accent">{DISCOUNT_PCT}% off</span>
          </span>
        </div>

        <p className="mb-3 text-xs text-brand-muted">
          Tap any card to preview · or add straight to your order at a flat 15% off.
          Pre-curated essentials that fit every trade.
        </p>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {products.map((p) => {
            const discounted = Math.round(p.price_idr * (1 - DISCOUNT_PCT / 100));
            const cur = (p.base_currency ?? "IDR") as "IDR" | "USD" | "SGD" | "AUD" | "EUR" | "GBP";
            const isAdded = added[p.id];
            return (
              <li key={p.id} className="flex flex-col gap-2 rounded-xl border border-brand-line bg-black p-2 sm:p-3">
                <button
                  type="button"
                  onClick={() => setPreviewId(p.id)}
                  aria-label={`Preview ${p.name}`}
                  className="block h-20 w-full overflow-hidden rounded-lg bg-brand-surface transition hover:ring-2 hover:ring-brand-accent"
                >
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-contain" loading="lazy" decoding="async" />
                  )}
                </button>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setPreviewId(p.id)}
                    className="line-clamp-2 text-left text-xs font-semibold leading-tight text-brand-text hover:text-brand-accent"
                  >
                    {p.name}
                  </button>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-brand-accent">{formatPriceForRegion(discounted, cur, country)}</span>
                    {showPrices && (
                      <span className="text-xs text-brand-muted line-through">{formatPriceForRegion(p.price_idr, cur, country)}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(p)}
                  disabled={isAdded}
                  className={`h-9 w-full rounded-full text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] ${
                    isAdded
                      ? "border border-brand-line bg-brand-surface text-brand-muted"
                      : "bg-brand-accent text-black hover:opacity-90"
                  }`}
                >
                  {isAdded ? "Added ✓" : `Add at -${DISCOUNT_PCT}%`}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {previewing && (
        <DealBreakerPreview
          product={previewing}
          discountPct={DISCOUNT_PCT}
          alreadyAdded={Boolean(added[previewing.id])}
          onClose={() => setPreviewId(null)}
          onAdd={() => onAdd(previewing)}
        />
      )}
    </>
  );
}

function StarRow({ avg, count }: { avg: number | null; count: number | null }) {
  const rating = avg ?? 0;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className={i < filled ? "text-brand-accent" : "text-brand-line"}
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        ))}
      </div>
      {rating > 0 ? (
        <span className="text-xs text-brand-muted">
          {rating.toFixed(1)}{count ? ` · ${count} review${count === 1 ? "" : "s"}` : ""}
        </span>
      ) : (
        <span className="text-xs text-brand-muted">Be the first to review</span>
      )}
    </div>
  );
}

function DealBreakerPreview({
  product, discountPct, alreadyAdded, onClose, onAdd
}: {
  product: HammerexProduct;
  discountPct: number;
  alreadyAdded: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  const country = useCountry();
  const showPrices = shouldShowPrice(country);
  const discounted = Math.round(product.price_idr * (1 - discountPct / 100));
  const cur = (product.base_currency ?? "IDR") as "IDR" | "USD" | "SGD" | "AUD" | "EUR" | "GBP";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="db-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-accent/40 bg-brand-bg shadow-[0_24px_60px_-16px_rgba(255,179,0,0.5)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-brand-text hover:bg-brand-accent hover:text-black"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="aspect-square w-full overflow-hidden bg-black">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
            ⚡ Deal Breaker
          </div>

          <h3 id="db-preview-title" className="text-lg font-bold leading-tight text-brand-text">
            {product.name}
          </h3>

          {product.sku && (
            <p className="text-xs font-semibold text-brand-accent">Ref: {product.sku}</p>
          )}

          <StarRow avg={product.rating_avg} count={product.rating_count} />

          {product.description && (
            <p className="text-sm leading-relaxed text-brand-muted">{product.description}</p>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-accent">{formatPriceForRegion(discounted, cur, country)}</span>
            {showPrices && (
              <>
                <span className="text-sm text-brand-muted line-through">{formatPriceForRegion(product.price_idr, cur, country)}</span>
                <span className="ml-1 rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold text-brand-accent">
                  −{discountPct}%
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-full border border-brand-line bg-black text-xs font-semibold text-brand-muted hover:text-brand-text"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={alreadyAdded}
              className={`h-11 flex-1 rounded-full text-xs font-bold uppercase tracking-widest transition active:scale-95 disabled:opacity-60 ${
                alreadyAdded
                  ? "border border-brand-line bg-brand-surface text-brand-muted"
                  : "bg-brand-accent text-black hover:opacity-90"
              }`}
            >
              {alreadyAdded ? "Already added ✓" : `Add at -${discountPct}%`}
            </button>
          </div>

          {product.slug && (
            <a
              href={`/product/${product.slug}`}
              className="text-center text-xs text-brand-muted hover:text-brand-accent"
            >
              See full product page →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
