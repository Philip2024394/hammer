"use client";

// Xrated Services Prices add-on — service-tile lightbox.
//
// Parallel to ProductModal (we deliberately fork it for now — see Phase 2
// note in the add-on spec — to avoid stepping on the concurrent ProductModal
// edit). Differences vs ProductModal:
//   – No stock pill (services don't run out).
//   – Yellow brand pill carries the `unit` ("PER TREE", "PER HOUR"…).
//   – Dispatch-days line reads "Lead time" instead of "Ships in".
//   – Two CTAs side-by-side on mobile: WhatsApp Enquire (green) +
//     Add to service cart (yellow). Enquire is the fast path for big jobs
//     ("can you do my whole garden?"); Add-to-cart bundles smaller items.

import { useEffect, useMemo, useState } from "react";
import type { HammerexXratedProduct, HammerexTradeOffListing } from "@/lib/supabase";
import { addItem, cartItemCount, readCart, formatGbp } from "@/lib/xratedCart";
import { whatsappDigits } from "@/lib/tradeOff";

export function ServiceModal({
  service,
  listing,
  onClose
}: {
  service: HammerexXratedProduct;
  listing: HammerexTradeOffListing;
  onClose: () => void;
}) {
  const slug = listing.slug;
  const images = useMemo(() => {
    const all = [service.cover_url, ...(service.gallery_urls ?? [])].filter(
      (u): u is string => typeof u === "string" && u.length > 0
    );
    return Array.from(new Set(all)).slice(0, 4);
  }, [service]);
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

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

  function handleAdd() {
    const next = addItem(slug, {
      product_id: service.id,
      name: service.name,
      price_pence: service.price_pence,
      cover_url: service.cover_url,
      unit: service.unit
    });
    setToast(`Added — ${cartItemCount(next)} in cart`);
    window.setTimeout(() => onClose(), 800);
  }

  const currentQty = useMemo(() => {
    const state = readCart(slug);
    return state.items.find((it) => it.product_id === service.id)?.qty ?? 0;
  }, [slug, service.id]);

  const activeImage = images[active];
  const unitLabel = service.unit?.trim() || null;
  const firstName =
    listing.display_name.split(/\s+/)[0] ?? listing.display_name;
  const waDigits = whatsappDigits(listing.whatsapp);
  const enquireMsg = encodeURIComponent(
    [
      `Hi ${firstName} — I'd like to enquire about:`,
      `• ${service.name}${unitLabel ? ` (${unitLabel})` : ""}`,
      `Listed: ${formatGbp(service.price_pence)}${unitLabel ? ` ${unitLabel}` : ""}`,
      "",
      "Could you confirm availability + final price?"
    ].join("\n")
  );
  const waHref = `https://wa.me/${waDigits}?text=${enquireMsg}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${service.name} details`}
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
          <div
            className="relative w-full bg-neutral-100"
            style={{ aspectRatio: "1 / 1" }}
          >
            {activeImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeImage}
                alt={`${service.name} — photo ${active + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                No image yet
              </div>
            )}
            {unitLabel && (
              <span
                className="absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-900 shadow-md"
                style={{ background: "#FFB300" }}
              >
                {unitLabel}
              </span>
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
                    i === active
                      ? "border-[#FFB300]"
                      : "border-transparent opacity-70"
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
                {service.name}
              </h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                  {formatGbp(service.price_pence)}
                </span>
                {unitLabel && (
                  <span className="text-[13px] font-bold text-neutral-500 sm:text-sm">
                    {unitLabel}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              {service.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-bold text-neutral-700">
                  {service.category}
                </span>
              )}
              {typeof service.dispatch_days === "number" &&
                service.dispatch_days > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-bold text-neutral-700">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Lead time {service.dispatch_days}{" "}
                    {service.dispatch_days === 1 ? "day" : "days"}
                  </span>
                )}
              {currentQty > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold"
                  style={{ background: "#FFB300", color: "#0A0A0A" }}
                >
                  {currentQty} in your cart
                </span>
              )}
            </div>

            {service.description && (
              <p className="text-[13px] leading-relaxed text-neutral-700 sm:text-sm">
                {service.description}
              </p>
            )}
          </div>
        </div>

        <div
          className="sticky bottom-0 flex flex-col gap-2 border-t border-neutral-200 bg-white p-4 sm:flex-row sm:p-5"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98]"
            style={{
              background: "#0F7A3F",
              boxShadow: "0 8px 22px rgba(15,122,63,0.45)"
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.05 4.91A10 10 0 0 0 12 2a10 10 0 0 0-8.94 14.5L2 22l5.62-1.47A10 10 0 1 0 19.05 4.91Z" />
            </svg>
            Enquire now
          </a>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-extrabold uppercase tracking-wider text-neutral-900 shadow-lg transition active:scale-[0.98]"
            style={{
              background: "#FFB300",
              boxShadow: "0 8px 22px rgba(255,179,0,0.45)"
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to cart
          </button>
        </div>

        {toast && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-24 z-[110] flex justify-center px-4"
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-xl">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFB300"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {toast}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
