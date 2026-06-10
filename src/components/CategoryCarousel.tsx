import type { HammerexCategory } from "@/lib/supabase";

const FALLBACK: HammerexCategory[] = [
  { id: "1", slug: "tools", name: "Tools", image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=70", sort_order: 1 },
  { id: "2", slug: "outdoor", name: "Outdoor", image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=70", sort_order: 2 },
  { id: "3", slug: "home", name: "Home", image_url: "https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=400&q=70", sort_order: 3 },
  { id: "4", slug: "auto", name: "Auto", image_url: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=400&q=70", sort_order: 4 },
  { id: "5", slug: "garden", name: "Garden", image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=70", sort_order: 5 },
  { id: "6", slug: "safety", name: "Safety", image_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=70", sort_order: 6 }
];

export function CategoryCarousel({ items }: { items?: HammerexCategory[] }) {
  const data = items?.length ? items : FALLBACK;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <h2 className="mb-3 text-sm font-semibold text-brand-text">Categories</h2>
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {data.map((c) => (
          <a
            key={c.id}
            href={`/c/${c.slug}`}
            className="group flex w-32 shrink-0 snap-start flex-col gap-2"
          >
            <div className="h-32 w-32 overflow-hidden rounded-xl border border-brand-line bg-brand-surface">
              {c.image_url && (
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <span className="text-xs font-medium text-brand-text">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
