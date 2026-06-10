"use client";

import { useEffect, useRef, useState } from "react";
import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";

const TRADE_SLUGS = [
  "plastering", "drywall", "tiling", "concrete", "rendering",
  "carpentry", "bricklaying", "painting-decorating", "plumbing",
  "electrical", "roofing", "flooring", "glazing", "landscaping",
  "steel-fixing", "scaffolding", "demolition", "hvac"
];

const PX_PER_SEC = 25;
const RESUME_AFTER_MS = 1800;

export function CategoryGrid({ items }: { items: HammerexCategory[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const resumeT = useRef<number | null>(null);

  const trades = TRADE_SLUGS
    .map((slug) => items.find((i) => i.slug === slug))
    .filter((x): x is HammerexCategory => Boolean(x));

  // Duplicate the list so the scroll can loop seamlessly.
  const track = [...trades, ...trades];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || paused || trades.length === 0) return;

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      el.scrollLeft += (PX_PER_SEC * dt) / 1000;
      const half = el.scrollWidth / 2;
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, trades.length]);

  const nudge = (px: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    setPaused(true);
    el.scrollBy({ left: px, behavior: "smooth" });
    if (resumeT.current) window.clearTimeout(resumeT.current);
    resumeT.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  };

  if (!trades.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <SectionHeader title="Shop by category" viewAllHref="/categories" />
      <div className="relative">
        <button
          type="button"
          onClick={() => nudge(-260)}
          aria-label="Scroll categories left"
          className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-brand-line bg-brand-bg/90 text-brand-text backdrop-blur transition hover:border-brand-accent hover:text-brand-accent"
        >‹</button>

        <div
          ref={scrollerRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => {
            if (resumeT.current) window.clearTimeout(resumeT.current);
            resumeT.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
          }}
          className="scrollbar-none flex gap-3 overflow-x-auto px-12"
          style={{ scrollBehavior: "auto" }}
        >
          {track.map((c, i) => (
            <a
              key={`${c.slug}-${i}`}
              href={`/c/${c.slug}`}
              className="group flex aspect-square w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-surface p-3 transition hover:border-brand-accent sm:w-32 sm:gap-3 sm:p-4"
            >
              <span className="text-brand-accent">
                <CategoryIcon slug={c.slug} />
              </span>
              <span className="text-center text-[10px] font-bold uppercase tracking-wider text-brand-text sm:text-[11px]">
                {c.name}
              </span>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => nudge(260)}
          aria-label="Scroll categories right"
          className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-brand-line bg-brand-bg/90 text-brand-text backdrop-blur transition hover:border-brand-accent hover:text-brand-accent"
        >›</button>
      </div>
    </section>
  );
}
