import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryCard } from "./CategoryCard";

const TOOL_TYPE_SLUGS = [
  "tape-holders",
  "knives-cutters",
  "hammer-holders",
  "drill-holders",
  "tool-pouches",
  "belts",
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
          <CategoryCard key={c.slug} category={c} />
        ))}
      </ul>
    </section>
  );
}
