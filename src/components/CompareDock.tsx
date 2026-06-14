"use client";

import { useEffect, useState } from "react";
import { compare, COMPARE_MAX } from "@/lib/compare";
import { supabase, type HammerexProduct } from "@/lib/supabase";

// Slim bottom dock that surfaces whenever the user has 1+ products in the
// compare list. Click "Compare" to open /compare. Persists across visits.
export function CompareDock() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, { image: string | null; name: string }>>({});

  useEffect(() => {
    const sync = () => setSlugs(compare.read());
    sync();
    return compare.subscribe(sync);
  }, []);

  useEffect(() => {
    const missing = slugs.filter((s) => !thumbs[s]);
    if (missing.length === 0) return;
    (async () => {
      const res = await supabase
        .from("hammerex_products")
        .select("slug, name, image_url")
        .in("slug", missing);
      const next = { ...thumbs };
      for (const r of (res.data ?? []) as Pick<HammerexProduct, "slug" | "name" | "image_url">[]) {
        next[r.slug ?? ""] = { image: r.image_url, name: r.name };
      }
      setThumbs(next);
    })();
  }, [slugs, thumbs]);

  if (slugs.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-line bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4">
        <span className="hidden text-xs font-bold uppercase tracking-widest text-brand-accent sm:inline">Compare</span>
        <ul className="flex flex-1 items-center gap-2 overflow-x-auto">
          {Array.from({ length: COMPARE_MAX }).map((_, i) => {
            const slug = slugs[i];
            const thumb = slug ? thumbs[slug] : null;
            return (
              <li
                key={i}
                className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border ${
                  slug ? "border-brand-accent bg-black" : "border-dashed border-brand-line bg-brand-surface text-brand-muted"
                }`}
              >
                {slug && thumb?.image && (
                  <img src={thumb.image} alt={thumb.name} className="h-full w-full object-contain" />
                )}
                {slug && (
                  <button
                    type="button"
                    onClick={() => compare.remove(slug)}
                    aria-label="Remove from compare"
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-brand-line bg-brand-bg text-xs text-brand-muted hover:text-brand-accent"
                  >×</button>
                )}
                {!slug && <span className="text-xs">+</span>}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => compare.clear()}
          className="hidden rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:text-red-300 sm:inline"
        >Clear</button>
        <a
          href="/compare"
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition active:scale-95 ${
            slugs.length >= 2 ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
          }`}
        >
          Compare {slugs.length}
        </a>
      </div>
    </div>
  );
}
