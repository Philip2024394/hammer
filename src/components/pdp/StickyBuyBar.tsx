"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/fx";
import type { HammerexProduct } from "@/lib/supabase";
import { useVariant } from "./VariantContext";
import { cart } from "@/lib/cart";

export function StickyBuyBar({ product, image }: { product: HammerexProduct; image: string | null }) {
  const variantCtx = useVariant();
  const activeVariant = variantCtx?.active ?? null;
  const displayImage = activeVariant?.image_url ?? image;
  const displaySku = activeVariant?.sku ?? product.sku;
  const displayPriceIdr = activeVariant?.price_idr ?? product.price_idr;
  const [show, setShow] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("pdp-buy-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  if (!show) return null;

  const onAdd = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate?.([10, 30, 10]); } catch {}
    }
    cart.add({
      productId: product.id,
      slug: product.slug ?? "",
      variantId: activeVariant?.id ?? null,
      variantLabel: activeVariant?.label ?? null,
      name: product.name,
      image: displayImage ?? null,
      sku: displaySku ?? null,
      unitPriceIdr: displayPriceIdr,
      baseCurrency: product.base_currency ?? "IDR",
      size: null,
      threadColor: null,
      backpackStraps: false,
      qty: 1
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-brand-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:bottom-auto md:top-16 md:border-b md:border-t-0 md:pb-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-4">
        {displayImage && (
          <img
            src={displayImage}
            alt=""
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
            className="h-10 w-10 shrink-0 rounded-md object-contain"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-semibold text-brand-text">
            {product.name}{activeVariant ? ` — ${activeVariant.label}` : ""}
          </span>
          <span className="truncate text-xs text-brand-muted">
            {displaySku && <span className="font-semibold text-brand-accent">Ref: {displaySku} · </span>}
            {formatPrice(displayPriceIdr, "IDR")}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`h-11 shrink-0 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition active:scale-[0.97] hover:opacity-90 ${added ? "hx-pulse" : ""}`}
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
