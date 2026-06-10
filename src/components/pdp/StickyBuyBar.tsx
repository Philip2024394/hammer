"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/fx";
import type { HammerexProduct } from "@/lib/supabase";

export function StickyBuyBar({ product, image }: { product: HammerexProduct; image: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("pdp-buy-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-brand-bg/95 backdrop-blur sm:top-28 sm:bottom-auto sm:border-b sm:border-t-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {image && <img src={image} alt="" className="h-10 w-10 rounded-md object-cover" />}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-semibold text-brand-text">{product.name}</span>
          <span className="text-xs text-brand-muted">{formatPrice(product.price_idr, "IDR")}</span>
        </div>
        <button
          type="button"
          className="h-11 rounded-full bg-brand-accent px-4 text-xs font-semibold text-black hover:opacity-90"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
