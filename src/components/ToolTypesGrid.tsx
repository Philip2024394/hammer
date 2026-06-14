import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";

const TOOL_TYPE_SLUGS = [
  "tape-holders",
  "knives-cutters",
  "hammer-holders",
  "belt-holders",
  "trowels",
  "trowel-holders",
  "sleeves-wallets",
  "hawk-holders",
  "tool-bags-backpacks",
  "phone-laptop-cases",
  "gloves-ppe",
  "aprons-workwear",
  "lunch-hydration",
  "drywall-accessories"
];

export function ToolTypesGrid({ items }: { items: HammerexCategory[] }) {
  const byOrder = new Map<string, HammerexCategory>();
  for (const c of items) byOrder.set(c.slug, c);
  const tiles = TOOL_TYPE_SLUGS
    .map((s) => byOrder.get(s))
    .filter((c): c is HammerexCategory => Boolean(c));

  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <SectionHeader title="Shop by Tool Type" viewAllHref="/categories" />

      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        {tiles.map((c) => (
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
