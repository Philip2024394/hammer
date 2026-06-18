"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { formatPrice, type Currency } from "@/lib/fx";
import { imageUrl } from "@/lib/imageUrl";
import { cart } from "@/lib/cart";

// Cross-sell discount applied to every product added through this rail.
// Hard-coded at 10% per the brand-wide policy. To make it configurable per
// category or per pair later, swap this constant for a DB-driven value.
const CROSS_SELL_DISCOUNT_PCT = 10;

type CategoryLite = { slug: string; name: string };

export function RelatedUpsell({
  currentProductId,
  currentCategory,
  categories
}: {
  currentProductId: string;
  currentCategory: CategoryLite | null;
  categories: CategoryLite[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>(currentCategory?.slug ?? categories[0]?.slug ?? "");
  const [products, setProducts] = useState<HammerexProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Whenever the user changes the dropdown — fetch products for that
  // category. Excludes the current product (no point cross-selling
  // a product to itself).
  useEffect(() => {
    if (!open || !selectedSlug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const cat = await supabase.from("hammerex_categories").select("id").eq("slug", selectedSlug).maybeSingle();
      if (!cat.data) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }
      const res = await supabase
        .from("hammerex_products")
        .select("*")
        .eq("category_id", cat.data.id)
        .neq("id", currentProductId)
        .order("home_sort_order", { ascending: true })
        .limit(20);
      if (!cancelled) {
        setProducts((res.data ?? []) as HammerexProduct[]);
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
      variantLabel: `${CROSS_SELL_DISCOUNT_PCT}% bundle offer`,
      backpackStraps: false,
      shippingPerUnitIdr: p.shipping_per_unit_idr ?? null
    });
  };

  return (
    <div className="rounded-2xl border border-brand-line bg-neutral-800">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="related-upsell-content"
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Bundle and save
            </span>
            <span className="text-sm font-semibold text-brand-text sm:text-base">
              Add related products to your order
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)] transition ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {open && (
          <div id="related-upsell-content" className="border-t border-brand-line px-5 py-4">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-widest text-brand-muted">
              Browse by category
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
                    className="flex items-center gap-3 overflow-hidden rounded-xl border border-brand-line bg-neutral-800 p-2"
                  >
                    <a
                      href={`/product/${p.slug ?? p.id}`}
                      className="block h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-700 sm:h-20 sm:w-20"
                    >
                      {p.image_url && (
                        <img
                          src={imageUrl(p.image_url, 240) ?? p.image_url}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-1"
                        />
                      )}
                    </a>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <a
                        href={`/product/${p.slug ?? p.id}`}
                        className="line-clamp-2 text-xs font-bold uppercase leading-tight text-brand-text hover:text-brand-accent sm:text-sm"
                      >
                        {p.name}
                      </a>
                      {p.subtitle && (
                        <p className="line-clamp-1 text-[11px] text-brand-muted">{p.subtitle}</p>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-brand-accent">{formatPrice(discounted, currency)}</span>
                        <span className="text-[10px] text-brand-muted line-through">{formatPrice(p.price_idr, currency)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdd(p)}
                      className="grid h-11 shrink-0 place-items-center rounded-md bg-brand-accent px-3 text-[11px] font-bold uppercase tracking-wider text-black transition active:scale-95 hover:opacity-90"
                    >
                      + Add −{CROSS_SELL_DISCOUNT_PCT}%
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
    </div>
  );
}
