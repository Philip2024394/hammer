import type { HammerexProduct } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";

const FALLBACK_EXTRAS = {
  slug: null, sku: null, brand: null, model_number: null, weight_kg: null,
  dispatch_cutoff_local: null, warranty_years: null, country_of_assembly: null,
  overview: null, features: null, stock_count: null, compare_at_idr: null,
  qty_discount_tiers: null, is_accessory: null, rating_avg: null, rating_count: null,
  base_currency: null, sizes: null, dispatch_lead_days: null,
  delivery_quote_only: null, purchase_notes: null, badge_label: null,
  subtitle: null, home_sort_order: null
};

const FALLBACK: HammerexProduct[] = [
  { id: "p1", category_id: null, name: "Cordless Drill", description: "20V brushless with 2 batteries.", price_idr: 1_850_000, image_url: "https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=600&q=70", is_featured: true, ...FALLBACK_EXTRAS, slug: "cordless-drill-20v" }
];

const fmtIdr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const fmtGbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function formatProductPrice(p: HammerexProduct): string {
  if (p.base_currency === "GBP") return fmtGbp.format(p.price_idr / 20000);
  return fmtIdr.format(p.price_idr);
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ProductRow({ items }: { items?: HammerexProduct[] }) {
  const data = (items?.length ? items : FALLBACK);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <SectionHeader title="Featured products" viewAllHref="/products" />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        {data.map((p) => {
          const features = (p.features ?? []).slice(0, 4);
          const href = p.slug ? `/product/${p.slug}` : "#";
          return (
            <li key={p.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
                <a href={href} className="relative block aspect-square overflow-hidden bg-black">
                  {p.badge_label && (
                    <span
                      className="absolute left-0 top-3 bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black"
                      style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)", paddingRight: "1.25rem" }}
                    >
                      {p.badge_label}
                    </span>
                  )}
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </a>

                <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase leading-tight tracking-wide text-brand-text">
                      <a href={href} className="hover:text-brand-accent">{p.name}</a>
                    </h3>
                    {p.subtitle && (
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-accent">{p.subtitle}</p>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-1.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] leading-snug text-brand-muted sm:text-xs">
                          <span className="mt-0.5 text-brand-accent"><Check /></span>
                          <span>{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <div className="rounded-md border-2 border-brand-accent bg-black/40 px-3 py-2 text-center">
                      <div className="text-base font-bold text-brand-text sm:text-lg">{formatProductPrice(p)}</div>
                    </div>
                    <a
                      href={href}
                      className="grid h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90"
                    >
                      <span>View product</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
