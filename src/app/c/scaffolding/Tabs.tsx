"use client";

import Link from "next/link";
import { SCAFFOLDING_TABS, type ScaffoldingTabId } from "./tabsConfig";

// Sticky toggle bar that lives directly under the scaffolding hero. Each
// tab updates the URL (?tab=...), which the page server-reads to fetch the
// matching product set. Using <Link> with prefetch keeps tab-switching
// snappy and SEO-friendly (each filter has a shareable URL).
export function ScaffoldingTabs({ active }: { active: ScaffoldingTabId }) {
  return (
    <nav
      aria-label="Scaffolding categories"
      className="sticky top-0 z-30 -mx-4 mb-2 border-y border-brand-line bg-brand-bg/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
        {SCAFFOLDING_TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <li key={t.id} className="shrink-0">
              <Link
                href={t.id === "belts" ? "/c/scaffolding" : `/c/scaffolding?tab=${t.id}`}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  isActive
                    ? "bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)]"
                    : "border border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent hover:text-brand-accent"
                }`}
              >
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
