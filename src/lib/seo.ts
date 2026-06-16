import type { HammerexCategory, HammerexGuide, HammerexProduct } from "./supabase";

const FALLBACK = "http://localhost:3007";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_HAMMEREX_SITE_URL?.trim();
  if (!raw) return FALLBACK;
  return raw.replace(/\/+$/, "");
}

export function absolute(path: string): string {
  if (!path) return siteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const BRAND = {
  name: "Hammerex",
  legalName: "Hammerex Products",
  tagline: "International tools & construction supplier",
  description:
    "Hammerex supplies tools, PPE and construction goods worldwide. Flat £20 shipping to UK, USA and Australia via EMS Air Mail — 5–6 days transit. Other countries confirmed on WhatsApp.",
  logo: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png",
  whatsapp: process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP ?? "+6281392000050",
  locale: "en_US"
};

export function organizationJsonLd() {
  const digits = BRAND.whatsapp.replace(/\D/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: siteUrl(),
    logo: BRAND.logo,
    description: BRAND.description,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${digits}`,
        contactType: "sales",
        availableLanguage: ["en", "id"],
        areaServed: "Worldwide"
      }
    ]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function breadcrumbJsonLd(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absolute(t.url)
    }))
  };
}

export function productJsonLd(product: HammerexProduct, category?: HammerexCategory | null) {
  const availability =
    product.stock_count === null || product.stock_count === undefined || product.stock_count > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const image = product.image_url ?? BRAND.logo;
  const description = product.subtitle ?? product.overview ?? product.description ?? BRAND.description;

  const offers = {
    "@type": "Offer",
    url: absolute(`/product/${product.slug ?? product.id}`),
    priceCurrency: "IDR",
    price: product.price_idr,
    availability,
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: BRAND.name }
  };

  const aggregateRating =
    product.rating_avg && product.rating_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating_avg,
            reviewCount: product.rating_count
          }
        }
      : {};

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image,
    sku: product.sku ?? product.id,
    brand: { "@type": "Brand", name: product.brand ?? BRAND.name },
    ...(product.model_number ? { mpn: product.model_number } : {}),
    ...(category ? { category: category.name } : {}),
    offers,
    ...aggregateRating
  };
}

export function collectionJsonLd(category: HammerexCategory, products: HammerexProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — ${BRAND.name}`,
    url: absolute(`/c/${category.slug}`),
    description: `${category.name} products supplied by ${BRAND.name} — flat £20 shipping to UK, USA, Australia (others quoted on WhatsApp).`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(`/product/${p.slug ?? p.id}`),
        name: p.name
      }))
    }
  };
}

// FAQPage JSON-LD — Google's required shape for the AI Overview / featured
// snippet panel. Only emit when there is at least one Q/A pair, otherwise
// validators flag it as an empty mainEntity array.
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}

// Article JSON-LD for /guides/[slug]. Pairs with FAQPage on the same page
// so a single guide can populate both the "Featured snippet" panel and the
// "Top stories / News" panel for an information query.
export function articleJsonLd(guide: HammerexGuide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.meta_description,
    image: guide.hero_image_url ?? BRAND.logo,
    author: { "@type": "Organization", name: BRAND.name },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      logo: { "@type": "ImageObject", url: BRAND.logo }
    },
    datePublished: guide.created_at,
    dateModified: guide.updated_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(`/guides/${guide.slug}`) }
  };
}

export function escapeXml(input: string): string {
  return input.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
  );
}
