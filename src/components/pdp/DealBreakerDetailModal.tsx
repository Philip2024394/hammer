"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice, type Currency } from "@/lib/fx";
import { cart } from "@/lib/cart";
import type { HammerexDealBreaker } from "@/lib/supabase";

const COLOR_MAP: Record<string, string> = {
  black: "#111111",
  white: "#F4F4F4",
  red: "#D33A2C",
  orange: "#F08A1E",
  yellow: "#F2C811",
  green: "#2E8B57",
  blue: "#1E5BD9",
  navy: "#0B1A45",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  silver: "#C0C0C0",
  brown: "#7A4E2A",
  tan: "#C19A6B",
  pink: "#E91E63",
  purple: "#6D28D9"
};

function colorHex(label: string): string | null {
  return COLOR_MAP[label.toLowerCase().trim()] ?? null;
}

export function DealBreakerDetailModal({
  deal,
  anchorProductName,
  currency,
  onClose
}: {
  deal: HammerexDealBreaker;
  anchorProductName: string;
  currency: Currency;
  onClose: () => void;
}) {
  const variants = deal.variants;

  const [activeVariantId, setActiveVariantId] = useState<string | null>(
    variants.find((v) => v.is_default)?.id ?? variants[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant = useMemo(
    () => variants.find((v) => v.id === activeVariantId) ?? null,
    [variants, activeVariantId]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const dealPrice = deal.deal_price_idr;
  const rrp = deal.item.price_idr;
  const savedPct = rrp > dealPrice ? Math.round(((rrp - dealPrice) / rrp) * 100) : 0;
  const displayImage = activeVariant?.image_url ?? deal.item.image_url;
  const displaySku = activeVariant?.sku ?? deal.item.sku;

  const onAdd = () => {
    if (variants.length > 0 && !activeVariant) return;
    cart.add({
      productId: deal.item.id,
      slug: deal.item.slug ?? deal.item.id,
      name: deal.item.name,
      sku: displaySku ?? null,
      image: displayImage,
      unitPriceIdr: dealPrice,
      qty,
      size: null,
      baseCurrency: deal.item.base_currency ?? "IDR",
      threadColor: null,
      variantId: activeVariant?.id ?? null,
      variantLabel: activeVariant?.label ? `Deal Breaker · ${activeVariant.label}` : "Deal Breaker",
      backpackStraps: false
    });
    setAdded(true);
    setTimeout(onClose, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Deal Breaker — ${deal.item.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-brand-accent bg-brand-bg"
      >
        <div className="relative aspect-square bg-brand-surface">
          {displayImage && (
            <img
              src={displayImage}
              alt={deal.item.name}
              className="h-full w-full object-contain p-6"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-brand-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
            Deal Breaker
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-brand-line bg-black/70 text-brand-text hover:border-brand-accent"
          >×</button>
        </div>

        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-brand-text">{deal.item.name}</h2>
          {displaySku && (
            <p className="text-xs font-semibold text-brand-accent">Ref: {displaySku}</p>
          )}

          <p className="mt-3 text-xs leading-relaxed text-brand-muted">
            For your <span className="font-semibold text-brand-text">{anchorProductName}</span>{" "}
            order today, Hammerex is happy to offer this Deal Breaker —{" "}
            <span className="font-semibold text-brand-text">{deal.item.name}</span>.
            {variants.length > 0 ? " Pick a colour and quantity below — " : " Pick a quantity below — "}
            our team will confirm your order.
          </p>

          {variants.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Colour</span>
                {activeVariant && (
                  <span className="text-xs font-semibold text-brand-text">{activeVariant.label}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
                {variants.map((v) => {
                  const hex = colorHex(v.label);
                  const active = activeVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={v.label}
                      title={v.label}
                      onClick={() => setActiveVariantId(v.id)}
                      className={`grid h-11 w-11 place-items-center rounded-full border-2 transition ${
                        active ? "border-brand-accent" : "border-brand-line hover:border-brand-text"
                      }`}
                    >
                      {hex ? (
                        <span
                          style={{ backgroundColor: hex }}
                          className="block h-7 w-7 rounded-full border border-brand-line"
                        />
                      ) : (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-surface text-xs font-bold uppercase text-brand-text">
                          {v.label.charAt(0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-text">{formatPrice(dealPrice, currency)}</span>
                {rrp > dealPrice && (
                  <span className="text-xs text-brand-muted line-through">{formatPrice(rrp, currency)}</span>
                )}
              </div>
              {savedPct > 0 && (
                <span className="mt-1 inline-block rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                  Save {savedPct}%
                </span>
              )}
            </div>
            <div className="flex h-11 items-center rounded-full border border-brand-line bg-black/40">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
              >−</button>
              <span className="w-7 text-center text-sm font-semibold text-brand-text" aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="grid h-11 w-11 place-items-center text-brand-text hover:text-brand-accent"
              >+</button>
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={added || (variants.length > 0 && !activeVariant)}
            className="mt-5 grid h-12 w-full place-items-center rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-40"
          >
            {added ? "Added to cart ✓" : `Add ${qty} to cart · ${formatPrice(dealPrice * qty, currency)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
