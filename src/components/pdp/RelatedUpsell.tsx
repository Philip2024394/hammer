"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { formatPrice, type Currency } from "@/lib/fx";
import { imageUrl } from "@/lib/imageUrl";
import { cart } from "@/lib/cart";
import { BundleZoomModal } from "./BundleZoomModal";

// Cross-sell discount applied to every product added through this rail.
// Hard-coded at 10% per the brand-wide policy. To make it configurable per
// category or per pair later, swap this constant for a DB-driven value.
const CROSS_SELL_DISCOUNT_PCT = 10;

// Universal cross-sell categories — every working tradesperson uses these
// regardless of the trade they were browsing, so they're surfaced as
// one-tap quick-picks above the full category dropdown.
const QUICK_PICK_CATEGORIES = [
  { slug: "tape-holders",   label: "Measure Tape Holders" },
  { slug: "gloves-ppe",     label: "Gloves" },
  { slug: "hammer-holders", label: "Hammer Holders" },
  { slug: "drill-holders",  label: "Drill Holders" },
  { slug: "lanyards",       label: "Lanyards" }
] as const;

type CategoryLite = { slug: string; name: string };

export function RelatedUpsell({
  currentProductId,
  currentProductSlug,
  currentProductName,
  currentCategory,
  categories
}: {
  currentProductId: string;
  currentProductSlug: string;
  currentProductName: string;
  currentCategory: CategoryLite | null;
  categories: CategoryLite[];
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState<HammerexProduct | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>(currentCategory?.slug ?? categories[0]?.slug ?? "");
  const [products, setProducts] = useState<HammerexProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Whenever the user changes the dropdown — fetch products for that
  // category. Type categories (Tape Holders / Gloves / etc.) read through
  // the hammerex_product_trades junction so cross-listed products show
  // even when their primary category_id is a trade (e.g. carpentry).
  // Trade categories use primary category_id directly. Excludes the
  // current product and any product flagged hide_from_upsell.
  useEffect(() => {
    if (!open || !selectedSlug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const cat = await supabase
        .from("hammerex_categories")
        .select("id, is_tool_type")
        .eq("slug", selectedSlug)
        .maybeSingle();
      if (!cat.data) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }

      let fetched: HammerexProduct[] = [];
      if (cat.data.is_tool_type) {
        // Tool-type → read from the junction (cross-listings live here).
        const res = await supabase
          .from("hammerex_product_trades")
          .select("sort_order, product:hammerex_products(*)")
          .eq("category_id", cat.data.id)
          .order("sort_order")
          .limit(40);
        fetched = ((res.data ?? []) as unknown as Array<{ product: HammerexProduct | null }>)
          .map((r) => r.product)
          .filter((p): p is HammerexProduct => Boolean(p));
      } else {
        // Trade category → read from primary category_id.
        const res = await supabase
          .from("hammerex_products")
          .select("*")
          .eq("category_id", cat.data.id)
          .order("home_sort_order", { ascending: true })
          .limit(40);
        fetched = (res.data ?? []) as HammerexProduct[];
      }

      // Dedup, drop the current product, drop anything flagged hide_from_upsell,
      // cap at 20 rail items.
      const seen = new Set<string>();
      const filtered = fetched.filter((p) => {
        if (p.id === currentProductId) return false;
        if (p.hide_from_upsell) return false;
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      }).slice(0, 20);

      if (!cancelled) {
        setProducts(filtered);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, selectedSlug, currentProductId]);

  const onAdd = (p: HammerexProduct) => {
    const discounted = Math.round(p.price_idr * (1 - CROSS_SELL_DISCOUNT_PCT / 100));
    cart.add({
      productId: p.id,
      slug: p.slug ?? p.id,
      name: p.name,
      sku: p.sku,
      image: p.image_url,
      unitPriceIdr: discounted,
      qty: 1,
      size: null,
      baseCurrency: p.base_currency ?? "IDR",
      threadColor: null,
      variantId: null,
      variantLabel: `${CROSS_SELL_DISCOUNT_PCT}% bundle offer · free shipping`,
      backpackStraps: false,
      // Bundle-and-save items always ship free — the buyer is already
      // paying shipping on their main product, so cross-sells ride along
      // at zero shipping cost regardless of the product's own override.
      shippingPerUnitIdr: 0
    });
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${open ? "border-brand-accent" : "border-brand-line"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="related-upsell-content"
        className="flex w-full items-center justify-between gap-3 bg-brand-accent px-4 py-3 text-left text-black transition active:scale-[0.995] hover:opacity-95"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-bold uppercase tracking-wide">Bundle and save</span>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Add related products to your order
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/15 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div id="related-upsell-content" className="bg-brand-surface px-5 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Quick pick</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICK_CATEGORIES.map((q) => {
                  const isSelected = selectedSlug === q.slug;
                  return (
                    <button
                      key={q.slug}
                      type="button"
                      onClick={() => setSelectedSlug(q.slug)}
                      aria-pressed={isSelected}
                      className={`grid h-9 place-items-center rounded-full px-3 text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                        isSelected
                          ? "bg-brand-accent text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)]"
                          : "border-2 border-brand-accent bg-transparent text-brand-accent hover:bg-brand-accent/10"
                      }`}
                    >
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 flex flex-col gap-1 text-xs font-bold uppercase tracking-widest text-brand-muted">
              Or browse by category
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="h-11 rounded-lg border border-brand-line bg-black px-3 text-sm font-semibold text-brand-text"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>

            <ul className="mt-4 flex flex-col gap-2">
              {loading && (
                <li className="grid h-16 w-full place-items-center text-xs text-brand-muted">
                  Loading…
                </li>
              )}
              {!loading && products.length === 0 && (
                <li className="grid h-16 w-full place-items-center text-xs text-brand-muted">
                  No other products in this category yet.
                </li>
              )}
              {!loading && products.map((p) => {
                const currency: Currency = (p.base_currency as Currency | undefined) ?? "IDR";
                const discounted = Math.round(p.price_idr * (1 - CROSS_SELL_DISCOUNT_PCT / 100));
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-accent bg-white p-2"
                  >
                    <button
                      type="button"
                      onClick={() => setZoomed(p)}
                      aria-label={`Enlarge ${p.name}`}
                      className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-md bg-white sm:h-20 sm:w-20"
                    >
                      {(() => {
                        const src = p.upsell_image_url ?? p.image_url;
                        return src ? (
                          <img
                            src={imageUrl(src, 240) ?? src}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : null;
                      })()}
                      <span
                        aria-hidden="true"
                        className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-accent text-xs font-bold text-black shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7" />
                          <line x1="21" y1="21" x2="16.5" y2="16.5" />
                        </svg>
                      </span>
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <a
                        href={`/product/${p.slug ?? p.id}`}
                        className="line-clamp-2 text-xs font-bold uppercase leading-tight text-black hover:text-brand-accent sm:text-sm"
                      >
                        {p.name}
                      </a>
                      {p.subtitle && (
                        <p className="line-clamp-1 text-xs text-neutral-600">{p.subtitle}</p>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-black">{formatPrice(discounted, currency)}</span>
                        <span className="text-xs text-neutral-500 line-through">{formatPrice(p.price_idr, currency)}</span>
                      </div>
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
                        Free shipping
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdd(p)}
                      className="grid h-11 shrink-0 place-items-center rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black transition active:scale-95 hover:opacity-90"
                    >
                      + Add
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      {zoomed && (
        <BundleZoomModal
          product={zoomed}
          discountPct={CROSS_SELL_DISCOUNT_PCT}
          currency={(zoomed.base_currency as Currency | undefined) ?? "IDR"}
          currentPdpUrl={`/product/${currentProductSlug}`}
          currentPdpLabel={currentProductName}
          onClose={() => setZoomed(null)}
          onAdd={() => onAdd(zoomed)}
        />
      )}
    </div>
  );
}
