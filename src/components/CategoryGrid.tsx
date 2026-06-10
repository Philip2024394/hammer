import type { HammerexCategory } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";

const DESIGN_SLUGS = [
  "trowel-holders",
  "tool-bags-backpacks",
  "hawk-holders",
  "drywall-accessories",
  "professional-tool-storage",
  "new-products"
] as const;

export function CategoryGrid({ items }: { items: HammerexCategory[] }) {
  const data = DESIGN_SLUGS
    .map((slug) => items.find((i) => i.slug === slug))
    .filter((x): x is HammerexCategory => Boolean(x));

  if (!data.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <SectionHeader title="Shop by category" viewAllHref="/categories" />
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {data.map((c) => (
          <li key={c.id}>
            <a
              href={`/c/${c.slug}`}
              className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3 transition hover:border-brand-accent"
            >
              {c.slug === "new-products" && (
                <span className="absolute right-2 top-2 rounded-md bg-brand-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">New</span>
              )}
              <span className="text-brand-accent">
                <CategoryIcon slug={c.slug} />
              </span>
              <span className="text-center text-[11px] font-bold uppercase tracking-wider text-brand-text sm:text-xs">
                {c.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
