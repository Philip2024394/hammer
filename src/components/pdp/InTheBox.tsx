"use client";

import { useEffect, useState } from "react";
import type { HammerexWhatInBox } from "@/lib/supabase";

export function InTheBox({
  items,
  fallbackImage,
  overlayImage,
  title = "In the box",
  subtitle = "This is what you receive in your delivery box."
}: {
  items: HammerexWhatInBox[];
  fallbackImage?: string | null;
  /**
   * Optional image rendered ON TOP of the first item's tile (e.g. the bare
   * product floating above the wrapped package). Only used when there is a
   * single item in the box so the layered effect doesn't overflow the grid.
   */
  overlayImage?: string | null;
  title?: string;
  subtitle?: string;
}) {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  // Esc-to-close + body scroll lock while the lightbox is open.
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

  if (!items.length) return null;
  return (
    <section id="in-the-box" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
          <p className="mt-1 text-xs text-brand-muted">{subtitle}</p>
        </div>
        <ul className={
          items.length === 1
            ? "mx-auto flex max-w-md flex-col"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        }>
          {items.map((b, idx) => {
            const src = b.image_url ?? fallbackImage ?? null;
            const single = items.length === 1;
            const showOverlay = single && idx === 0 && !!overlayImage;
            return (
              <li key={b.id} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
                <button
                  type="button"
                  onClick={() => src && setZoom({ src: overlayImage || src, alt: b.label })}
                  aria-label={`Enlarge ${b.label}`}
                  disabled={!src}
                  className="relative block aspect-square w-full overflow-hidden bg-black disabled:cursor-default"
                >
                  {src && <img src={src} alt={b.label} className="h-full w-full object-contain p-2" />}
                  {showOverlay && (
                    <img
                      src={overlayImage!}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-2 right-2 block w-[56%] translate-y-[170px] object-contain object-right drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                    />
                  )}
                  {src && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-black shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.5" y2="16.5" />
                      </svg>
                    </span>
                  )}
                </button>
                <div className={single ? "p-4 text-center" : "flex items-center justify-between gap-2 p-3"}>
                  <span className={single ? "text-sm font-semibold text-brand-text" : "text-xs font-medium text-brand-text"}>
                    {b.label}
                  </span>
                  {!single && b.qty > 1 && <span className="text-xs text-brand-muted">× {b.qty}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          <img
            src={zoom.src}
            alt={zoom.alt}
            onClick={(e) => e.stopPropagation()}
            className="block max-h-[88vh] max-w-full rounded-xl object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Close"
            className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >×</button>
        </div>
      )}
    </section>
  );
}
