"use client";

import { useEffect, useRef, useState } from "react";
import type { HammerexProductMedia } from "@/lib/supabase";
import { useVariant } from "./VariantContext";
import { ShareButton } from "./ShareButton";

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ media, fallbackImage, name }: {
  media: HammerexProductMedia[];
  fallbackImage: string | null;
  name: string;
}) {
  const variantCtx = useVariant();
  const images = media.filter((m) => m.kind === "image");
  const seed = images.length
    ? images
    : fallbackImage
    ? [{ id: "fallback", product_id: "", kind: "image" as const, url: fallbackImage, alt: name, sort_order: 0 }]
    : [];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = seed[active];
  const dragX = useRef<number | null>(null);

  useEffect(() => {
    const url = variantCtx?.active?.image_url;
    if (!url) return;
    const idx = seed.findIndex((m) => m.url === url);
    if (idx >= 0 && idx !== active) setActive(idx);
  }, [variantCtx?.active?.id]);

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
    <div className="flex gap-3">
      <ol className="hidden w-20 shrink-0 flex-col gap-2 sm:flex">
        {seed.map((m, i) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`block h-20 w-20 overflow-hidden rounded-lg border transition ${i === active ? "border-brand-accent" : "border-brand-line"} bg-brand-surface hover:border-brand-accent`}
            >
              <img src={m.url} alt={m.alt ?? ""} loading="lazy" decoding="async" width="80" height="80" className="h-full w-full object-contain p-1" />
            </button>
          </li>
        ))}
      </ol>

      <div className="min-w-0 flex-1">
        <div
          className="relative aspect-square w-full select-none touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragX.current = null; }}
        >
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Zoom image"
            className="absolute inset-0 overflow-hidden"
          >
            <img
              key={current.id}
              src={current.url}
              alt={current.alt ?? name}
              width="800"
              height="800"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-contain transition-opacity duration-200"
            />
          </button>

          {seed.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-brand-line bg-brand-bg/80 text-brand-text backdrop-blur transition hover:border-brand-accent hover:text-brand-accent sm:grid"
              >‹</button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-brand-line bg-brand-bg/80 text-brand-text backdrop-blur transition hover:border-brand-accent hover:text-brand-accent sm:grid"
              >›</button>

              <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5 sm:hidden">
                {seed.map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-brand-accent" : "w-1.5 bg-brand-line"}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute right-3 top-3 z-10">
            <ShareButton title={name} />
          </div>
        </div>

        <ol className="scrollbar-none mt-3 flex gap-2 overflow-x-auto sm:hidden">
          {seed.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-16 w-16 overflow-hidden rounded-md border transition ${i === active ? "border-brand-accent" : "border-brand-line"} bg-brand-surface`}
              >
                <img src={m.url} alt={m.alt ?? ""} loading="lazy" decoding="async" width="64" height="64" className="h-full w-full object-contain p-1" />
              </button>
            </li>
          ))}
        </ol>
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
