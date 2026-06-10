"use client";

import { useState } from "react";
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
  const current = seed[active];

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
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
          <img
            key={current.id}
            src={current.url}
            alt={current.alt ?? name}
            className="h-full w-full object-cover transition-opacity"
          />
        </div>

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
    </div>
  );
}
