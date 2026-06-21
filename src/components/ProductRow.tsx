import type { HammerexProduct } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { CardActionOverlay } from "./CardActionOverlay";
import { imageUrl } from "@/lib/imageUrl";
import { formatPrice, type Currency } from "@/lib/fx";

const FALLBACK_EXTRAS = {
  slug: null, sku: null, brand: null, model_number: null, weight_kg: null,
  dispatch_cutoff_local: null, warranty_years: null, country_of_assembly: null,
  overview: null, features: null, stock_count: null, compare_at_idr: null,
  qty_discount_tiers: null, is_accessory: null, rating_avg: null, rating_count: null,
  base_currency: null, sizes: null, dispatch_lead_days: null,
  delivery_quote_only: null, purchase_notes: null, badge_label: null,
  subtitle: null, home_sort_order: null, thread_color_option_idr: null,
  backpack_straps_option_idr: null, is_universal: null,
  shipping_per_unit_idr: null, faq: null
};

const FALLBACK: HammerexProduct[] = [
  { id: "p1", category_id: null, name: "Cordless Drill", description: "20V brushless with 2 batteries.", price_idr: 1_850_000, image_url: "https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=600&q=70", is_featured: true, ...FALLBACK_EXTRAS, slug: "cordless-drill-20v" }
];

// Grid card prices are the **product price only** — shipping is NEVER added
// here. Some products ship free UK / +£10 air freight, others are quoted on
// WhatsApp for sea-freight; that nuance belongs on the PDP, not the grid.
// Uses the live FX from fx.ts so the displayed amount matches the PDP.
function formatProductPrice(p: HammerexProduct): string {
  const cur = (p.base_currency as Currency | null) ?? "IDR";
  return formatPrice(p.price_idr, cur);
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Items may carry a `customHref` overlay — if set, that URL overrides both
// the productHref + categoryHref computation. Used on the home Pro Picks
// row so the Scaffolders Setup Kit card routes to the tabbed scaffolding
// shop (so buyers land on a belt picker, not the single-product PDP).
// `customCtaLabel` overrides the default CTA copy on the same row.
type ProductRowItem = HammerexProduct & { customHref?: string; customCtaLabel?: string };

export function ProductRow({ items, title, viewAllHref, hideHeader, linkTo = "product", layout = "portrait" }: { items?: ProductRowItem[]; title?: string; viewAllHref?: string; hideHeader?: boolean; linkTo?: "product" | "category"; layout?: "portrait" | "landscape" }) {
  const data: ProductRowItem[] = (items?.length ? items : FALLBACK);

  if (layout === "landscape") {
    return (
      <section className="mx-auto max-w-6xl px-4 pt-8">
        {!hideHeader && <SectionHeader title={title ?? "Featured products"} viewAllHref={viewAllHref ?? "/products"} />}

        <ul className="flex flex-col gap-4 sm:gap-5">
          {data.map((p) => {
            const productHref = p.slug ? `/product/${p.slug}` : "#";
            const categoryHref = p.category ? `/c/${p.category.slug}` : productHref;
            const baseHref = linkTo === "category" ? categoryHref : productHref;
            const href = p.customHref ?? baseHref;
            const ctaLabel = p.customCtaLabel
              ?? (p.customHref
                ? "Browse belts"
                : linkTo === "category"
                  ? "Browse category"
                  : "View product");
            return (
              <li key={p.id} className="group relative">
                <article className="relative overflow-hidden rounded-2xl bg-brand-surface">
                  <a href={href} className="block w-full overflow-hidden">
                    {p.image_url && (
                      <img
                        src={imageUrl(p.image_url, 1280) ?? p.image_url}
                        srcSet={`${imageUrl(p.image_url, 640) ?? p.image_url} 640w, ${imageUrl(p.image_url, 960) ?? p.image_url} 960w, ${imageUrl(p.image_url, 1280) ?? p.image_url} 1280w`}
                        sizes="(min-width: 1024px) 1120px, 100vw"
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="block w-full h-auto"
                      />
                    )}
                  </a>
                  <div className="flex items-center justify-between gap-3 border-t border-brand-line p-3 sm:p-4">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold uppercase tracking-wide text-brand-text sm:text-base">{p.name}</div>
                      <div className="text-base font-bold text-brand-accent sm:text-lg">{formatProductPrice(p)}</div>
                    </div>
                    <a
                      href={href}
                      className="grid h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-4 text-xs font-bold uppercase tracking-wider text-black transition active:scale-[0.98] hover:opacity-90 sm:text-sm"
                    >
                      <span>{ctaLabel}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      {!hideHeader && <SectionHeader title={title ?? "Featured products"} viewAllHref={viewAllHref ?? "/products"} />}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {data.map((p) => {
          const features = (p.features ?? []).slice(0, 4);
          const productHref = p.slug ? `/product/${p.slug}` : "#";
          const categoryHref = p.category ? `/c/${p.category.slug}` : productHref;
          const baseHref = linkTo === "category" ? categoryHref : productHref;
          const href = p.customHref ?? baseHref;
          const ctaLabel = p.customHref
            ? "Browse belts"
            : linkTo === "category"
              ? "Browse category"
              : "View product";
          const stock = p.stock_count;
          const stockTone = stock == null
            ? null
            : stock <= 0
              ? { label: "Out of stock", color: "text-brand-muted", dot: "bg-brand-muted" }
              : stock <= 5
                ? { label: `Only ${stock} left`, color: "text-brand-accent", dot: "bg-brand-accent" }
                : { label: "In stock", color: "text-brand-success", dot: "bg-brand-success" };
          return (
            <li key={p.id} className="group relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 -bottom-2 h-6 rounded-full bg-brand-accent/0 blur-2xl transition-all duration-300 group-hover:bg-brand-accent/55"
              />
              <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand-surface transition-colors duration-200">
                <a
                  href={href}
                  className="relative block aspect-[4/3] w-full overflow-hidden"
                  style={{ background: "radial-gradient(circle at center, rgb(255 179 0 / 0.10) 0%, rgb(0 0 0) 72%)" }}
                >
                  <CardActionOverlay slug={p.slug} />
                  {p.badge_label && (
                    <span
                      className="absolute left-0 top-3 z-10 inline-flex h-7 items-center bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black"
                      style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)", paddingRight: "1.25rem" }}
                    >
                      {p.badge_label}
                    </span>
                  )}
                  {p.image_url && (
                    <img
                      src={imageUrl(p.image_url, 720) ?? p.image_url}
                      srcSet={`${imageUrl(p.image_url, 360) ?? p.image_url} 360w, ${imageUrl(p.image_url, 480) ?? p.image_url} 480w, ${imageUrl(p.image_url, 720) ?? p.image_url} 720w, ${imageUrl(p.image_url, 960) ?? p.image_url} 960w`}
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      // Product cards must show the WHOLE product — no crop.
                      // Container is aspect-[4/3] landscape to fit the wide
                      // banner-style hero images we generate (≈ 16:10 / 2:1)
                      // without the heavy black bands above and below they
                      // used to get in an aspect-square frame. object-contain
                      // is kept so square photos still render fully visible
                      // with minor side-letterbox (much less prominent than
                      // top/bottom bars).
                      //
                      // Different policy from the site Hero on purpose: the
                      // Hero uses object-cover (full-bleed banner, crop is
                      // fine). Product cards must NEVER crop — the product
                      // would get its edges sliced off and look broken.
                      className="block h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </a>

                <div className="flex flex-1 flex-col gap-2 p-2.5 sm:gap-3 sm:p-4">
                  <div>
                    {p.category && (
                      <a
                        href={`/c/${p.category.slug}`}
                        className="mb-2 inline-flex min-h-6 items-center gap-1 rounded-full border border-brand-line bg-black/40 px-2.5 text-xs font-semibold uppercase tracking-widest text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                        {p.category.name}
                      </a>
                    )}
                    <h3 className="line-clamp-2 text-sm font-bold uppercase leading-tight tracking-wide text-brand-text">
                      <a href={href} className="hover:text-brand-accent">{p.name}</a>
                    </h3>
                    {p.subtitle && (
                      <p className="mt-0.5 line-clamp-1 text-xs font-bold uppercase tracking-wider text-brand-accent">{p.subtitle}</p>
                    )}
                    {p.sku && (
                      <p className="mt-1 text-xs font-semibold tracking-wide text-brand-muted">
                        Ref: <span className="text-brand-accent">{p.sku}</span>
                      </p>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="hidden space-y-1.5 sm:block">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-snug text-brand-muted">
                          <span className="mt-0.5 text-brand-accent"><Check /></span>
                          <span>{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {features.length > 0 && (
                    <ul className="space-y-1.5 sm:hidden">
                      {features.slice(0, 2).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-snug text-brand-muted">
                          <span className="mt-0.5 text-brand-accent"><Check /></span>
                          <span className="line-clamp-1">{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    {stockTone && (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stockTone.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${stockTone.dot}`} />
                        {stockTone.label}
                      </span>
                    )}
                    <div className="rounded-md border-2 border-brand-accent bg-black/40 px-3 py-2 text-center">
                      <div className="text-base font-bold text-brand-text sm:text-lg">{formatProductPrice(p)}</div>
                    </div>
                    <a
                      href={href}
                      className="grid h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black transition active:scale-[0.98] hover:opacity-90"
                    >
                      <span>{ctaLabel}</span>
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
