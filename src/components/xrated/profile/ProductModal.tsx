"use client";

// Xrated Shop Mode — product detail lightbox.
//
// Yellow ring-4 modal that opens when a customer taps a product card.
// Image gallery (cover + up to 3 gallery photos), description, price,
// stock + dispatch lines, and the "Add to enquiry" CTA. The CTA writes
// to the per-tradesperson localStorage cart and closes the modal after
// a brief confirmation. Out-of-stock products surface a WhatsApp
// fallback so the customer can still ask.

import { useEffect, useMemo, useState } from "react";
import type { HammerexXratedProduct } from "@/lib/supabase";
import { addItem, cartItemCount, readCart, formatGbp } from "@/lib/xratedCart";
import { CompareProductsModal } from "./CompareProductsModal";

export function ProductModal({
  product,
  slug,
  siblings,
  themeColor,
  onClose
}: {
  product: HammerexXratedProduct;
  slug: string;
  siblings: HammerexXratedProduct[];
  themeColor: string;
  onClose: () => void;
}) {
  const images = useMemo(() => {
    const all = [product.cover_url, ...(product.gallery_urls ?? [])].filter(
      (u): u is string => typeof u === "string" && u.length > 0
    );
    return Array.from(new Set(all)).slice(0, 4);
  }, [product]);
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const outOfStock = product.stock_count !== null && product.stock_count <= 0;
  const canCompare = siblings.length > 0;

  function handleAdd() {
    if (outOfStock) return;
    const next = addItem(slug, {
      product_id: product.id,
      name: product.name,
      price_pence: product.price_pence,
      cover_url: product.cover_url
    });
    setToast(`Added — ${cartItemCount(next)} in cart`);
    window.setTimeout(() => {
      onClose();
    }, 800);
  }

  // Pre-read the cart for the modal-open lifetime so the "already in
  // cart" badge can show the customer they already added this once.
  const currentQty = useMemo(() => {
    const state = readCart(slug);
    return state.items.find((it) => it.product_id === product.id)?.qty ?? 0;
  }, [slug, product.id]);

  const activeImage = images[active];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} details`}
        className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/85 backdrop-blur sm:items-center sm:p-3"
        onClick={onClose}
      >
        <div
          className="relative flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl ring-4 ring-[#FFB300] sm:max-h-[95vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="relative w-full bg-neutral-100" style={{ aspectRatio: "1 / 1" }}>
              {activeImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeImage}
                  alt={`${product.name} — photo ${active + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                  No image yet
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-100 bg-neutral-50 px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={i === active}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === active ? "border-[#FFB300]" : "border-transparent opacity-70"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-extrabold leading-tight text-neutral-900 sm:text-xl">
                  {product.name}
                </h2>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                    {formatGbp(product.price_pence)}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <StockPill stock={product.stock_count} />
                {typeof product.dispatch_days === "number" && product.dispatch_days > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-bold text-neutral-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="1" y="3" width="15" height="13" />
                      <path d="M16 8h4l3 3v5h-7z" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    Ships in {product.dispatch_days}{" "}
                    {product.dispatch_days === 1 ? "day" : "days"}
                  </span>
                )}
                {currentQty > 0 && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold"
                    style={{ background: themeColor, color: "#0A0A0A" }}
                  >
                    {currentQty} in your cart
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-[13px] leading-relaxed text-neutral-700 sm:text-sm">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-neutral-200 bg-white p-4 sm:flex-row sm:p-5" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              aria-disabled={outOfStock}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: outOfStock ? "#737373" : "#0F7A3F",
                boxShadow: outOfStock ? undefined : "0 8px 22px rgba(15,122,63,0.45)"
              }}
            >
              {outOfStock ? (
                <>Out of stock — message on WhatsApp</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to enquiry
                </>
              )}
            </button>
            {canCompare && (
              <button
                type="button"
                onClick={() => setCompareOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border-2 border-neutral-300 bg-white px-5 text-sm font-extrabold uppercase tracking-wider text-neutral-700 transition active:scale-[0.98]"
              >
                Compare
              </button>
            )}
          </div>

          {toast && (
            <div
              className="pointer-events-none fixed inset-x-0 bottom-24 z-[110] flex justify-center px-4"
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-xl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {toast}
              </span>
            </div>
          )}
        </div>
      </div>

      {compareOpen && (
        <CompareProductsModal
          anchor={product}
          siblings={siblings}
          slug={slug}
          themeColor={themeColor}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </>
  );
}

function StockPill({ stock }: { stock: number | null }) {
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[13px] font-bold text-neutral-700">
        Available on enquiry
      </span>
    );
  }
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-extrabold text-white" style={{ background: "#DC2626" }}>
        Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-extrabold text-white" style={{ background: "#F97316" }}>
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-extrabold text-neutral-900" style={{ background: "#FFB300" }}>
      In stock
    </span>
  );
}
