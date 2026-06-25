import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { ProductRow } from "@/components/ProductRow";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SEO_LANDINGS, type SeoLandingConfig } from "@/lib/seoLandings";
import { absolute, breadcrumbJsonLd, faqJsonLd, BRAND, SEO_KEYWORDS } from "@/lib/seo";
import { supabase, type HammerexCategory, type HammerexProduct } from "@/lib/supabase";
import { cookies, headers } from "next/headers";
import { getCountryFromRequest } from "@/lib/geo";

// Shared SEO landing-page renderer for the alias URLs at /tool-belts,
// /tool-bags, /construction-tools, etc. Each route file passes a `landingKey`
// matching a config in src/lib/seoLandings.ts; this component does the full
// page render — keyword H1, intro copy, category grid, product strip, FAQ
// and the JSON-LD pair (BreadcrumbList + FAQPage).
//
// Products are pulled from the existing hammerex_categories rows — no
// duplicate SKUs or shadow inventory. The landing is a discovery surface
// that re-presents the catalogue against a high-intent search query.
export async function SeoLandingPage({ landingKey }: { landingKey: string }) {
  const config = SEO_LANDINGS[landingKey];
  if (!config) notFound();

  const { categories, products } = await loadLandingData(config);
  const country = getCountryFromRequest(await headers(), await cookies());
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: config.h1, url: `/${config.slug}` }
  ]);
  const faq = faqJsonLd(config.faq);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <nav className="text-xs text-brand-muted" aria-label="Breadcrumb">
          <a href="/" className="hover:text-brand-accent">Home</a>
          <span className="mx-2">/</span>
          <span className="text-brand-text">{config.h1}</span>
        </nav>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-4">
        <header className="rounded-2xl border border-brand-line bg-brand-surface p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Direct from the Hammerex workshop</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{config.h1}</h1>
          {config.intro.split(/\n\n+/).map((para, i) => (
            <p key={i} className="mt-3 text-[13px] leading-relaxed text-brand-muted sm:text-sm">{para}</p>
          ))}
        </header>
      </section>

      {config.valueProps && config.valueProps.length > 0 && (
        <ValuePropStrip items={config.valueProps} />
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <h2 className="text-lg font-bold uppercase tracking-wide text-brand-text sm:text-xl">Browse the range</h2>
          <CategoryGridInline items={categories} />
        </section>
      )}

      {products.length > 0 && (
        <ProductRow
          items={products}
          title={`Featured ${config.h1.split(" — ")[0]}`}
          viewAllHref={config.ctaCategorySlug ? `/c/${config.ctaCategorySlug}` : `/c/${config.categorySlugs[0]}`}
          country={country}
        />
      )}

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-xl font-bold leading-tight text-brand-text sm:text-2xl">
          {config.h1.split(" — ")[0]} — common questions
        </h2>
        <ul className="mt-4 flex flex-col gap-2 sm:gap-3">
          {config.faq.map((entry, i) => (
            <li key={i}>
              <details className="group rounded-2xl border border-brand-line bg-brand-surface p-4 transition open:border-brand-accent">
                <summary className="flex cursor-pointer items-start justify-between gap-3 text-sm font-bold text-brand-text marker:content-[''] sm:text-base">
                  <span>{entry.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand-line text-brand-accent transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-brand-muted sm:text-sm">{entry.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <DeliveryFooter />
    </main>
  );
}

// 4-up trust strip rendered between the hero and the category grid on
// region-targeted landings (UK / EU). Each card is a small icon + bold
// label + one-line sublabel. The icon set lives below so the component
// can stay server-rendered (no client-side icon library needed).
function ValuePropStrip({
  items
}: {
  items: NonNullable<SeoLandingConfig["valueProps"]>;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((p) => (
          <li
            key={p.label}
            className="flex items-start gap-3 rounded-xl border border-brand-line bg-brand-surface p-3 sm:p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent text-black"
            >
              <ValuePropIcon name={p.icon} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold leading-tight text-brand-text sm:text-sm">
                {p.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-brand-muted">
                {p.sublabel}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ValuePropIcon({ name }: { name: NonNullable<SeoLandingConfig["valueProps"]>[number]["icon"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const
  };
  switch (name) {
    case "delivery":
      return (
        <svg {...common}>
          <path d="M1 3h15v13H1z" />
          <path d="M16 8h4l3 3v5h-7z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "spanner":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
        </svg>
      );
    case "weight":
      return (
        <svg {...common}>
          <path d="M6 6h12l-1 14H7L6 6z" />
          <path d="M9 6V4a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M11 20a8 8 0 0 0 8-8c0-5-2-9-2-9s-9 0-13 4-4 13 7 13Z" />
          <path d="M2 22 11 13" />
        </svg>
      );
    case "uk":
      // Stylised Union-Jack-style shield mark — simple lines so it reads
      // at 20px without going noisy. Used as the "UK delivery" mark.
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="1" />
          <path d="M3 4 21 18" />
          <path d="M21 4 3 18" />
          <path d="M12 4v14" />
          <path d="M3 11h18" />
        </svg>
      );
    case "check":
    default:
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
  }
}

// Inline tile grid for landing pages — same look as CategoryGrid but routes
// to /c/[slug] directly, without the marquee notice strip the home page uses.
function CategoryGridInline({ items }: { items: HammerexCategory[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
      {items.map((c) => (
        <li key={c.slug} className="group relative">
          <a
            href={`/c/${c.slug}`}
            className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface p-4 transition-colors duration-200 group-hover:border-brand-accent sm:p-6"
          >
            {c.card_image_url ? (
              <>
                <img
                  src={c.card_image_url}
                  alt={`${c.name} — Hammerex trade tools and tool belts`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-3"
                />
                <span className="absolute inset-x-0 bottom-3 z-10 text-center text-xs font-bold uppercase tracking-widest text-brand-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {c.name}
                </span>
              </>
            ) : (
              <span className="text-center text-xs font-bold uppercase tracking-wider text-brand-text sm:text-sm">
                {c.name}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

async function loadLandingData(config: SeoLandingConfig) {
  const catRes = await supabase
    .from("hammerex_categories")
    .select("id, slug, name, image_url, card_image_url, card_show_label, sort_order, is_tool_type")
    .in("slug", config.categorySlugs);
  const cats = (catRes.data ?? []) as HammerexCategory[];
  // Preserve config.categorySlugs order so the first config slug is rendered
  // first regardless of DB sort_order.
  const ordered = config.categorySlugs
    .map((s) => cats.find((c) => c.slug === s))
    .filter((c): c is HammerexCategory => Boolean(c));

  // Featured product strip: 3 featured products from the FIRST category in the
  // list so the buyer has a click-into-product CTA above the FAQ.
  let products: HammerexProduct[] = [];
  if (ordered.length > 0) {
    const prodRes = await supabase
      .from("hammerex_products")
      .select("*")
      .eq("category_id", ordered[0].id)
      .eq("is_featured", true)
      .order("home_sort_order", { nullsFirst: false })
      .limit(3);
    products = (prodRes.data ?? []) as HammerexProduct[];
  }

  return { categories: ordered, products };
}

export function landingMetadata(slug: string) {
  const config = SEO_LANDINGS[slug];
  if (!config) return { title: "Not found" };
  return {
    title: config.title,
    description: config.metaDescription,
    keywords: SEO_KEYWORDS,
    alternates: { canonical: `/${config.slug}` },
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      title: config.title,
      description: config.metaDescription,
      url: absolute(`/${config.slug}`),
      locale: BRAND.locale,
      images: [{ url: BRAND.logo, alt: `${config.h1} — ${BRAND.name}` }]
    },
    twitter: {
      card: "summary_large_image" as const,
      title: config.title,
      description: config.metaDescription,
      images: [BRAND.logo]
    }
  };
}
