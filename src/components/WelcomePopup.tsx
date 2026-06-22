"use client";

import { useEffect, useState } from "react";
import { cart } from "@/lib/cart";
import { supabase, type HammerexProduct } from "@/lib/supabase";

const SEEN_KEY = "hammerex_welcome_v1";
const GIFT_SLUG = "folding-safety-cutting-knife";
export const WELCOME_EVENT = "hammerex:welcome:show";

type GiftRow = Pick<HammerexProduct, "id" | "name" | "sku" | "image_url" | "base_currency">;

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [added, setAdded] = useState(false);

  // Show only when a triggering page (category / PDP / exit-intent on PDP+cart)
  // dispatches the WELCOME_EVENT. Always gated on the SEEN_KEY localStorage so
  // a user who has already seen or claimed is never shown the popup again.
  useEffect(() => {
    const handler = () => {
      try {
        if (localStorage.getItem(SEEN_KEY)) return;
      } catch { /* ignore */ }
      setOpen(true);
    };
    window.addEventListener(WELCOME_EVENT, handler);
    return () => window.removeEventListener(WELCOME_EVENT, handler);
  }, []);

  // Lazily fetch the gift product once we know we're opening.
  useEffect(() => {
    if (!open || gift) return;
    (async () => {
      const res = await supabase
        .from("hammerex_products")
        .select("id, name, sku, image_url, base_currency")
        .eq("slug", GIFT_SLUG)
        .maybeSingle();
      if (res.data) setGift(res.data as GiftRow);
    })();
  }, [open, gift]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const markSeen = () => {
    try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const claim = () => {
    if (!gift) return;
    const lines = cart.read();
    const already = lines.some(
      (l) => l.productId === gift.id && l.variantLabel === "WELCOME GIFT"
    );
    if (!already) {
      cart.add({
        productId: gift.id,
        slug: GIFT_SLUG,
        name: gift.name,
        sku: gift.sku ?? null,
        image: gift.image_url ?? null,
        unitPriceIdr: 0,
        qty: 1,
        size: null,
        baseCurrency: gift.base_currency ?? "GBP",
        threadColor: null,
        variantId: null,
        variantLabel: "WELCOME GIFT",
        backpackStraps: false
      });
    }
    setAdded(true);
    markSeen();
    window.setTimeout(() => setOpen(false), 1200);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4"
    >
      <button
        type="button"
        aria-label="Close welcome offer"
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-accent/50 bg-brand-bg shadow-[0_24px_60px_-16px_rgba(255,179,0,0.5)]">
        <div className="flex items-center gap-3 border-b border-brand-line bg-brand-surface px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-accent text-lg font-bold text-black">★</span>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Welcome to Hammerex</p>
            <p className="text-sm font-semibold text-brand-text">A small gift on us.</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-brand-muted hover:bg-black/40 hover:text-brand-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="text-sm leading-relaxed text-brand-muted">
            <p className="text-brand-text">
              First time here? Have a <span className="font-semibold text-brand-accent">free Hammerex Folding Safety Cutter Knife (£9.80 RRP)</span> on us — added straight to your cart with your first paid order, no code needed.
            </p>
            <p className="mt-2">
              It's a cool knife — and most upcoming Hammerex products will have a dedicated pocket for this style of knife.
            </p>
            <p className="mt-2 text-xs">
              Don't forget to check us out on Instagram{" "}
              <a
                href="https://instagram.com/hammerexproductsdirect"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-accent underline-offset-2 hover:underline"
              >@hammerexproductsdirect</a>
              {" "}and hit the share or like button.
            </p>
            <p className="mt-2 text-xs font-semibold text-brand-text">
              — Hammerex Team :-)
            </p>
          </div>

          {gift?.image_url && (
            <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-black">
              <img
                src={gift.image_url}
                alt={gift?.name ?? "Free Hammerex knife"}
                className="h-full w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-brand-line bg-brand-surface p-3 sm:flex-row">
          <button
            type="button"
            onClick={close}
            className="h-14 flex-1 rounded-full border border-brand-line bg-black text-sm font-semibold text-brand-muted hover:text-brand-text"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={claim}
            disabled={!gift || added}
            className="h-14 flex-1 rounded-full bg-brand-accent px-4 text-sm font-bold uppercase tracking-widest text-black transition active:scale-95 hover:opacity-90 disabled:opacity-60"
          >
            {added ? "Added to cart ✓" : "Add my free knife"}
          </button>
        </div>
      </div>
    </div>
  );
}
