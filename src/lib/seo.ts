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
    // Social-profile cross-links — Google uses sameAs for the Knowledge
    // Graph card and entity disambiguation.
    sameAs: [
      "https://www.instagram.com/hammerexproductsdirect/"
    ],
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

// Strip markdown so the overview field doesn't bleed `**bold**`, `### heading`,
// list bullets, links and code fences into <meta description> / OG / Twitter
// previews. Conservative: collapse to plain text + single spaces.
export function stripMarkdown(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/```[\s\S]*?```/g, " ")            // fenced code blocks
    .replace(/`([^`]+)`/g, "$1")                // inline code
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")      // images
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")    // links → keep text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")        // # headings
    .replace(/\*\*([^*]+)\*\*/g, "$1")          // **bold**
    .replace(/(^|\s)\*([^*\s][^*]*)\*/g, "$1$2") // *italic*
    .replace(/_([^_]+)_/g, "$1")                // _italic_
    .replace(/^\s*[-*+]\s+/gm, "")              // - bullets
    .replace(/^\s*\d+\.\s+/gm, "")              // 1. ordered list
    .replace(/^\s*>\s?/gm, "")                  // > blockquotes
    .replace(/\r?\n+/g, " ")                    // newlines → space
    .replace(/\s{2,}/g, " ")                    // collapse whitespace
    .trim();
}

// Clamp a description to a safe length for SERP / OG previews. Google
// truncates around 155–160; OG/Twitter handle longer but readability wins.
export function clampDescription(input: string, max = 160): string {
  if (input.length <= max) return input;
  const slice = input.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim() + "…";
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

// Indicative FX → GBP for JSON-LD when product.base_currency is GBP. We keep
// the canonical IDR price in the DB but advertise the price in the buyer-
// expected currency so Google Shopping doesn't flag a mismatch.
const IDR_PER_GBP = 23827;
const IDR_PER_USD = 17753;
const IDR_PER_EUR = 20619;
const IDR_PER_AUD = 12578;
const IDR_PER_SGD = 13866;

function priceForJsonLd(product: HammerexProduct): { priceCurrency: string; price: string } {
  const cur = (product.base_currency ?? "IDR").toUpperCase();
  const divisor =
    cur === "GBP" ? IDR_PER_GBP :
    cur === "USD" ? IDR_PER_USD :
    cur === "EUR" ? IDR_PER_EUR :
    cur === "AUD" ? IDR_PER_AUD :
    cur === "SGD" ? IDR_PER_SGD :
    1;
  const price = (product.price_idr / divisor).toFixed(cur === "IDR" ? 0 : 2);
  return { priceCurrency: cur, price };
}

export function productJsonLd(product: HammerexProduct, category?: HammerexCategory | null) {
  const availability =
    product.stock_count === null || product.stock_count === undefined || product.stock_count > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const image = product.image_url ?? BRAND.logo;
  const description = clampDescription(
    stripMarkdown(product.subtitle ?? product.overview ?? product.description ?? BRAND.description)
  );

  // priceValidUntil: required by Google Merchant Center on every Offer.
  // Default to 1 year from today; we'd rather re-emit fresh than fail audit.
  const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  const offers = {
    "@type": "Offer",
    url: absolute(`/product/${product.slug ?? product.id}`),
    ...priceForJsonLd(product),
    priceValidUntil: validUntil,
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
