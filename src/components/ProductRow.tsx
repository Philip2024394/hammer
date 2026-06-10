import type { HammerexProduct } from "@/lib/supabase";

const emptyExtras = {
  slug: null, sku: null, brand: null, model_number: null, weight_kg: null,
  dispatch_cutoff_local: null, warranty_years: null, country_of_assembly: null,
  overview: null, features: null, stock_count: null, compare_at_idr: null,
  qty_discount_tiers: null, is_accessory: null, rating_avg: null, rating_count: null,
  base_currency: null, sizes: null, dispatch_lead_days: null,
  delivery_quote_only: null, purchase_notes: null
};
const FALLBACK: HammerexProduct[] = [
  { id: "p1", category_id: null, name: "Cordless Drill", description: "20V brushless with 2 batteries.", price_idr: 1_850_000, image_url: "https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=600&q=70", is_featured: true, ...emptyExtras, slug: "cordless-drill-20v" },
  { id: "p2", category_id: null, name: "Tool Belt", description: "Heavy-duty canvas, 12 pockets.", price_idr: 420_000, image_url: "https://images.unsplash.com/photo-1521989588531-cf2073a3a9f4?auto=format&fit=crop&w=600&q=70", is_featured: true, ...emptyExtras, slug: "tool-belt" },
  { id: "p3", category_id: null, name: "Headlamp 1200lm", description: "USB-C rechargeable, IP65.", price_idr: 285_000, image_url: "https://images.unsplash.com/photo-1592920448607-a26f5cf06ad9?auto=format&fit=crop&w=600&q=70", is_featured: true, ...emptyExtras, slug: "headlamp-1200lm" }
];

const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function ProductRow({ items }: { items?: HammerexProduct[] }) {
  const data = (items?.length ? items : FALLBACK).slice(0, 8);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-semibold text-brand-text">Featured products</h2>
        <a href="/products" className="text-xs text-brand-accent hover:underline">See all</a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {data.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
            <a href={p.slug ? `/product/${p.slug}` : "#"} className="block h-40 w-full overflow-hidden bg-black">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform hover:scale-105" />}
            </a>
            <div className="flex flex-col gap-2 p-4">
              <a href={p.slug ? `/product/${p.slug}` : "#"} className="text-sm font-semibold text-brand-text hover:text-brand-accent">
                <h3>{p.name}</h3>
              </a>
              {p.description && <p className="text-xs text-brand-muted">{p.description}</p>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-brand-text">{fmt.format(p.price_idr)}</span>
                <a
                  href={p.slug ? `/product/${p.slug}` : "#"}
                  className="grid h-11 place-items-center rounded-full bg-brand-accent px-4 text-xs font-semibold text-black hover:opacity-90"
                >
                  View
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
