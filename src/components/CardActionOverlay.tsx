"use client";

import { useEffect, useState } from "react";
import { wishlist } from "@/lib/wishlist";
import { compare, COMPARE_MAX } from "@/lib/compare";

// Tiny floating toggle row positioned over each ProductRow card's image.
// Heart = wishlist; up/down arrows = compare add/remove.
export function CardActionOverlay({ slug }: { slug: string | null }) {
  const [saved, setSaved] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [compareFull, setCompareFull] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const sync = () => {
      setSaved(wishlist.has(slug));
      setInCompare(compare.has(slug));
      setCompareFull(compare.count() >= COMPARE_MAX);
    };
    sync();
    const unsubW = wishlist.subscribe(sync);
    const unsubC = compare.subscribe(sync);
    return () => { unsubW(); unsubC(); };
  }, [slug]);

  if (!slug) return null;

  return (
    <div
      className="absolute right-2 top-2 z-20 flex flex-col gap-1.5"
      onClick={(e) => e.preventDefault()}
    >
      <button
        type="button"
        aria-label={saved ? "Remove from saved" : "Save to wishlist"}
        aria-pressed={saved}
        onClick={(e) => { e.preventDefault(); wishlist.toggle(slug); }}
        className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition active:scale-95 ${
          saved
            ? "border-brand-accent bg-brand-accent text-black"
            : "border-brand-line bg-brand-bg/80 text-brand-text hover:border-brand-accent hover:text-brand-accent"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <button
        type="button"
        aria-label={inCompare ? "Remove from compare" : "Add to compare"}
        aria-pressed={inCompare}
        disabled={!inCompare && compareFull}
        onClick={(e) => { e.preventDefault(); compare.toggle(slug); }}
        className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
          inCompare
            ? "border-brand-accent bg-brand-accent text-black"
            : "border-brand-line bg-brand-bg/80 text-brand-text hover:border-brand-accent hover:text-brand-accent"
        }`}
        title={!inCompare && compareFull ? `Compare full (${COMPARE_MAX})` : undefined}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
    </div>
  );
}
