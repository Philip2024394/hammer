"use client";

import { useEffect, useRef, useState } from "react";
import type { HammerexProductMedia } from "@/lib/supabase";
import { useVariant } from "./VariantContext";
import { useDeal } from "./DealContext";
import { DealSwitcher } from "./DealSwitcher";
import { ShareButton } from "./ShareButton";

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ media, fallbackImage, name }: {
  media: HammerexProductMedia[];
  fallbackImage: string | null;
  name: string;
}) {
  const variantCtx = useVariant();
  const dealCtx = useDeal();
  const images = media.filter((m) => m.kind === "image");
  const seed = images.length
    ? images
    : fallbackImage
    ? [{ id: "fallback", product_id: "", kind: "image" as const, url: fallbackImage, alt: name, sort_order: 0 }]
    : [];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  // When a deal is active, the visible banner swaps to the deal's image
  // but the thumbnails strip keeps showing the original product banners.
  // Tapping a thumbnail deselects the deal (see thumbnail onClick below).
  const current = dealCtx?.active
    ? { id: `deal-${dealCtx.active.id}`, product_id: "", kind: "image" as const, url: dealCtx.active.banner_url, alt: dealCtx.active.name, sort_order: 0 }
    : seed[active];
  const dragX = useRef<number | null>(null);

  useEffect(() => {
    const url = variantCtx?.active?.image_url;
    if (!url) return;
    const idx = seed.findIndex((m) => m.url === url);
    if (idx >= 0 && idx !== active) setActive(idx);
  }, [variantCtx?.active?.id]);

  // Pre-measure every gallery image so the container can lock to the SMALLEST
  // aspect ratio (most-square image). Every banner then displays at full width;
  // wider banners get small top/bottom bands instead of horizontal letterbox.
  useEffect(() => {
    if (seed.length === 0) return;
    const ratios: number[] = [];
    let pending = seed.length;
    let cancelled = false;
    const settle = () => {
      pending -= 1;
      if (pending === 0 && !cancelled && ratios.length > 0) {
        setAspect(Math.min(...ratios));
      }
    };
    seed.forEach((m) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          ratios.push(img.naturalWidth / img.naturalHeight);
        }
        settle();
      };
      img.onerror = settle;
      img.src = m.url;
    });
    return () => { cancelled = true; };
  }, [seed.map((s) => s.id).join("|")]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomed(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed]);

  const prev = () => setActive((i) => (i - 1 + seed.length) % seed.length);
  const next = () => setActive((i) => (i + 1) % seed.length);

  const onPointerDown = (e: React.PointerEvent) => { dragX.current = e.clientX; };
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragX.current == null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || seed.length < 2) return;
    if (dx < 0) next(); else prev();
  };

  if (!current) {
    return <div className="aspect-square" />;
  }

  return (
    <div>
      <div>
        <div
          className="relative w-full select-none touch-pan-y"
          style={aspect ? { aspectRatio: String(aspect) } : undefined}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragX.current = null; }}
        >
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Zoom image"
            className="block h-full w-full overflow-hidden rounded-2xl"
            style={{ background: "radial-gradient(circle at center, rgb(255 179 0 / 0.10) 0%, rgb(0 0 0) 72%)" }}
          >
            <img
              key={current.id}
              src={current.url}
              alt={current.alt ?? name}
              fetchPriority="high"
              decoding="async"
              className={aspect ? "block h-full w-full object-contain transition-opacity duration-200" : "block w-full h-auto transition-opacity duration-200"}
            />
          </button>

          {seed.length > 1 && !dealCtx?.active && (
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-1.5">
              {seed.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`h-1 flex-1 rounded-full transition-all ${i === active ? "bg-brand-accent" : "bg-white/30"}`}
                />
              ))}
            </div>
          )}

          <div className="absolute right-3 top-3 z-10">
            <ShareButton title={name} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          {seed.length > 1 ? (
            <ol className="scrollbar-none flex justify-start gap-2 overflow-x-auto">
              {seed.map((m, i) => {
                const isActiveThumb = !dealCtx?.active && i === active;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(i);
                        if (dealCtx?.active) dealCtx.setActiveId(null);
                      }}
                      aria-label={`View image ${i + 1}`}
                      aria-current={isActiveThumb}
                      className={`block h-16 w-16 overflow-hidden rounded-md border transition ${isActiveThumb ? "border-brand-accent" : "border-brand-line"} bg-brand-surface hover:border-brand-accent sm:h-20 sm:w-20 sm:rounded-lg`}
                    >
                      <img src={m.url} alt={m.alt ?? `${name} — image ${i + 1}`} loading="lazy" decoding="async" width="80" height="80" className="h-full w-full object-contain p-1" />
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : <span />}
          <DealSwitcher />
        </div>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4"
        >
          <div className="grid min-h-full place-items-center">
            <img
              src={current.url}
              alt={current.alt ?? name}
              onClick={(e) => e.stopPropagation()}
              className="block h-auto w-auto max-w-full rounded-xl object-contain sm:max-w-[720px]"
              style={{ maxHeight: "85vh", touchAction: "pinch-zoom" }}
            />
          </div>
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
            className="fixed right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-brand-surface text-brand-text hover:text-brand-accent"
          >×</button>
        </div>
      )}
    </div>
  );
}
