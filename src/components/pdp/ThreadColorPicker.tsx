"use client";

import { useEffect, useState } from "react";
import { formatPrice, type Currency } from "@/lib/fx";
import {
  THREAD_COLOR_IMAGES,
  isFreeThreadColor,
  threadColorsFor,
  type ThreadColor
} from "@/lib/threadColor";

// Profile-thumbnail thread-colour picker. Each available colour renders as a
// circle ringed with that thread's hex. Black has a "Standard · no cost"
// badge; the rest carry a "+£X" tag. Tap any circle → enlarge modal with the
// close-up reference photo and two actions: Add to order (selects it) or
// Close (cancels back to the listing without changing the picked colour).
export function ThreadColorPicker({
  productSlug,
  value,
  onChange,
  threadDeltaIdr,
  currency
}: {
  productSlug: string | null | undefined;
  value: ThreadColor | null;
  onChange: (next: ThreadColor) => void;
  threadDeltaIdr: number;
  currency: Currency;
}) {
  const palette = threadColorsFor(productSlug);
  const [zoom, setZoom] = useState<ThreadColor | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  const zoomColor = zoom ? palette.find((c) => c.value === zoom) ?? null : null;
  const zoomImage = zoom ? THREAD_COLOR_IMAGES[zoom] : null;
  const zoomFree = zoom ? isFreeThreadColor(zoom) : false;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
          Thread colour {value && `· ${palette.find((c) => c.value === value)?.label ?? ""}`}
        </span>
        <span className="text-xs text-brand-muted">
          Black free · others +{formatPrice(threadDeltaIdr, currency)} · +2 working days
        </span>
      </div>

      <ul className="flex flex-wrap gap-3" role="radiogroup" aria-label="Thread colour">
        {palette.map((c) => {
          const active = value === c.value;
          const free = isFreeThreadColor(c.value);
          const img = THREAD_COLOR_IMAGES[c.value];
          // Black is the house standard — render as a clean solid swatch in
          // the small profile circle (the photo of black-on-black leather
          // doesn't survive being shrunk to 64px). The enlarge modal still
          // shows the photo so the buyer can see the actual stitching.
          const useSolidSwatch = c.value === "black";
          // For black specifically, the swatch hex (#111111) is too close to
          // the page background — the circle vanishes against bg-brand-bg.
          // Use a visible mid-gray border + light inner ring so the buyer
          // can see the swatch exists and read it as a "filled" colour.
          const borderColor = c.value === "black" ? "#9CA3AF" : c.hex;
          return (
            <li key={c.value} className="flex flex-col items-center gap-1">
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${c.label} thread — tap to enlarge`}
                onClick={() => setZoom(c.value)}
                className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-[3px] transition active:scale-95 hover:opacity-90 sm:h-20 sm:w-20`}
                style={{ borderColor }}
              >
                {img && !useSolidSwatch ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={`${c.label} thread close-up`}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`h-full w-full ${c.value === "black" ? "ring-1 ring-inset ring-white/15" : ""}`}
                    style={{ backgroundColor: c.hex }}
                  />
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </button>
              <span className="text-xs font-semibold text-brand-text">{c.label}</span>
              <span className={`text-xs font-semibold ${free ? "text-brand-muted" : "text-brand-accent"}`}>
                {free ? "Standard · free" : `+${formatPrice(threadDeltaIdr, currency)}`}
              </span>
            </li>
          );
        })}
      </ul>

      {zoom && zoomColor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomColor.label} thread`}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-8 w-full max-w-md overflow-hidden rounded-2xl border border-brand-line bg-brand-bg"
          >
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
            >×</button>

            <div className="aspect-square w-full overflow-hidden bg-black">
              {zoomImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={zoomImage}
                  alt={`${zoomColor.label} thread close-up`}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="block h-full w-full"
                  style={{ backgroundColor: zoomColor.hex }}
                />
              )}
            </div>

            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-brand-text">{zoomColor.label} thread</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                  zoomFree
                    ? "bg-brand-line text-brand-muted"
                    : "bg-brand-accent/15 text-brand-accent"
                }`}>
                  {zoomFree ? "Standard · no cost" : `+${formatPrice(threadDeltaIdr, currency)} · +2 working days`}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-brand-muted">
                {zoomFree
                  ? "Black is our house thread. Selected by default — dispatches within the standard lead time."
                  : `Custom colour-matched thread for your belt. Adds ${formatPrice(threadDeltaIdr, currency)} to the unit price and 2 working days to dispatch while we stitch your order to spec.`}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(null)}
                  className="h-12 rounded-full border-2 border-brand-line bg-transparent text-xs font-bold uppercase tracking-widest text-brand-text transition active:scale-95 hover:border-brand-accent hover:text-brand-accent sm:text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { onChange(zoom); setZoom(null); }}
                  className="h-12 rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90 sm:text-sm"
                >
                  Add to order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
