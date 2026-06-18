import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryCard } from "./CategoryCard";

const TRADE_SLUGS = [
  "plastering", "drywall", "tiling", "concrete", "venetian-plastering",
  "carpentry", "bricklaying", "painting-decorating", "plumbing", "electrical",
  "glazing", "landscaping", "steel-fixing", "scaffolding",
  "demolition", "metal-fabrication", "joinery", "stone-masonry",
  "tailoring", "barber", "first-aid"
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
          <CategoryCard key={c.slug} category={c} />
        ))}
      </ul>
    </section>
  );
}
