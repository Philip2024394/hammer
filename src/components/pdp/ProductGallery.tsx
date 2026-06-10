"use client";

import { useEffect, useState } from "react";
import type { HammerexProductMedia } from "@/lib/supabase";

export function ProductGallery({ media, fallbackImage, name }: {
  media: HammerexProductMedia[];
  fallbackImage: string | null;
  name: string;
}) {
  const images = media.filter((m) => m.kind === "image");
  const seed = images.length
    ? images
    : fallbackImage
    ? [{ id: "fallback", product_id: "", kind: "image" as const, url: fallbackImage, alt: name, sort_order: 0 }]
    : [];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = seed[active];

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomed(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!current) {
    return <div className="aspect-square rounded-2xl border border-brand-line bg-brand-surface" />;
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
              className={`block h-20 w-20 overflow-hidden rounded-lg border ${i === active ? "border-brand-accent" : "border-brand-line"} bg-brand-surface`}
            >
              <img src={m.url} alt={m.alt ?? ""} className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ol>

      <div className="flex-1">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Zoom image"
          className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-brand-line bg-brand-surface"
        >
          <img
            key={current.id}
            src={current.url}
            alt={current.alt ?? name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-brand-line bg-black/60 text-brand-text opacity-0 transition-opacity group-hover:opacity-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
          </span>
        </button>

        <ol className="scrollbar-none mt-2 flex gap-2 overflow-x-auto sm:hidden">
          {seed.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-14 w-14 overflow-hidden rounded-md border ${i === active ? "border-brand-accent" : "border-brand-line"} bg-brand-surface`}
              >
                <img src={m.url} alt={m.alt ?? ""} className="h-full w-full object-cover" />
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
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          <img src={current.url} alt={current.alt ?? name} className="max-h-full max-w-full rounded-xl object-contain" />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-brand-surface text-brand-text"
          >×</button>
        </div>
      )}
    </div>
  );
}
