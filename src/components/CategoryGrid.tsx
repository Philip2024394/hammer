import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";

const TRADE_SLUGS = [
  "plastering", "drywall", "tiling", "concrete", "rendering", "venetian-plastering",
  "carpentry", "bricklaying", "painting-decorating", "plumbing", "electrical",
  "roofing", "flooring", "glazing", "landscaping", "steel-fixing", "scaffolding",
  "demolition", "hvac", "lifting", "metal-fabrication", "joinery", "stone-masonry",
  "tailoring", "barber", "farming"
];

export function CategoryGrid({ items }: { items: HammerexCategory[] }) {
  const byOrder = new Map<string, HammerexCategory>();
  for (const c of items) byOrder.set(c.slug, c);
  const trades = TRADE_SLUGS
    .map((s) => byOrder.get(s))
    .filter((c): c is HammerexCategory => Boolean(c));

  if (trades.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <SectionHeader title="View Your Trade" viewAllHref="/categories" />

      <div
        className="hammerex-marquee-mask relative mb-3 overflow-hidden rounded-full border border-brand-line bg-brand-surface py-2"
        aria-label="Announcement"
      >
        <span className="hammerex-marquee-track px-4 text-xs font-semibold uppercase tracking-wider text-brand-accent">
          Custom-built work tool belts now on request — pick your thread colour and choose your holders to build the perfect belt · Direct prices, 3-day worldwide dispatch ·&nbsp;&nbsp;&nbsp;
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        {trades.map((c) => (
          <li key={c.slug} className="group relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 -bottom-2 h-6 rounded-full bg-brand-accent/0 blur-2xl transition-all duration-300 group-hover:bg-brand-accent/55"
            />
            <a
              href={`/c/${c.slug}`}
              className="relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-surface p-4 transition-colors duration-200 group-hover:border-brand-accent sm:gap-3 sm:p-6"
            >
              <span className="text-brand-accent">
                <CategoryIcon slug={c.slug} />
              </span>
              <span className="line-clamp-2 text-center text-xs font-bold uppercase tracking-wider text-brand-text sm:text-sm">
                {c.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
