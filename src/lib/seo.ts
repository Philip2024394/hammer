import type { HammerexCategory, HammerexGuide, HammerexProduct, HammerexTradeOffListing } from "./supabase";

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
  tagline: "Construction tools, tool belts & tool bags — direct from the maker",
  description:
    "Hammerex supplies construction tools, hand tools, tool belts, tool bags and trade PPE direct from our Yogyakarta workshop — the hardware-store-direct alternative to building merchants. Worldwide shipping with delivery quoted by the Hammerex team within 24 hours by email or phone — best combined rate for your whole order, never per item.",
  // Short-form descriptor for OG/Twitter where punchy beats complete.
  descriptionShort:
    "Construction tools, tool belts & tool bags direct from the Hammerex workshop — hardware-store-direct prices, worldwide shipping.",
  logo: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png",
  whatsapp: process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP ?? "+6281392000050",
  // UK English — biggest single signal to Google + OG consumers that
  // this site targets the UK market. Was en_US (US English) which
  // confused localised SERPs and lost ranking ground in google.co.uk.
  locale: "en_GB"
};

// Site-wide keyword set kept in one place so titles, meta descriptions, JSON-LD
// keywords and the home FAQ all stay aligned with the queries we're targeting.
export const SEO_KEYWORDS = [
  "construction tools",
  "tool belts",
  "tool bags",
  "hand tools",
  "hardware store",
  "building merchants",
  "trade tools",
  "trade products",
  "new tools",
  "scaffolding tools",
  "plastering tools",
  "drywall tools",
  "electrician tools"
];

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
    inLanguage: "en-GB",
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
        availableLanguage: ["en-GB", "en", "id"],
        areaServed: ["GB", "Worldwide"]
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
    inLanguage: "en-GB",
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
  // Default to GBP so Google Merchant Center + UK Shopping see a
  // £-denominated Offer (the canonical IDR price gets divided by the
  // indicative FX rate above). Tradies who set base_currency='IDR'
  // still get raw IDR — that's the explicit opt-in for IDR audiences.
  const cur = (product.base_currency ?? "GBP").toUpperCase();
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
    inLanguage: "en-GB",
    sku: product.sku ?? product.id,
    brand: { "@type": "Brand", name: product.brand ?? BRAND.name },
    ...(product.model_number ? { mpn: product.model_number } : {}),
    ...(category ? { category: category.name } : {}),
    offers,
    ...aggregateRating
  };
}

// Per-slug SEO title overrides for category pages. Bare category names ("Belts",
// "Trowels") don't carry the construction-industry keywords buyers actually
// type into Google ("tool belts uk", "construction tools direct"); the override
// folds those in while keeping the H1 readable.
export const CATEGORY_SEO_TITLES: Record<string, string> = {
  belts: "Work Belts & Tool Belts — Leather Trade Belts Direct",
  "belt-holders": "Belt Holders & Tool Belt Pouches — Modular Trade Storage",
  "tool-bags-backpacks": "Tool Bags & Tool Backpacks for Tradesmen — Direct from the Workshop",
  trowels: "Plastering & Bricklaying Trowels — Trade-Grade Hand Tools",
  "trowel-holders": "Trowel Holders & Belt Sets — Plastering Tool Belt Kits",
  "tape-holders": "Measure Tape Holders — Tool Belt Tape Pouches",
  "knives-cutters": "Trade Knives & Cutters — Site Hand Tools",
  "hammer-holders": "Hammer Holders & Hammer Loops — Tool Belt Accessories",
  "hawk-holders": "Hawk Holders — Plastering Tool Belt Add-ons",
  "drill-holders": "Drill Holders — Cordless Drill Tool Belt Pouches",
  "phone-laptop-cases": "Site Phone & Tablet Cases — Heavy-Duty Trade Pouches",
  "gloves-ppe": "Trade Gloves & PPE — Site Safety Hand Protection",
  "aprons-workwear": "Trade Aprons & Workwear — Builder & Tradesman Aprons",
  "lunch-hydration": "Site Lunch Bags & Hydration — Trade Lunchbox & Bottle Holders",
  "drywall-accessories": "Drywall Accessories — Plasterboard Hand Tools & Holders",
  "sleeves-wallets": "Trade Tool Wallets & Sleeves — Pouch Inserts",
  lanyards: "Trade Lanyards — Tool Tethers & Drop Prevention",
  scaffolding: "Scaffolding Tool Belts & Site Kits — Scaffolder Setup",
  plastering: "Plastering Tools & Tool Belts — Hand Tools for Plasterers",
  drywall: "Drywall Tools — Plasterboard Hand Tools & Belts",
  carpentry: "Carpentry Tools — Hand Tools & Tool Belts for Carpenters",
  tiling: "Tiling Tools & Trowels — Hand Tools for Tilers",
  bricklaying: "Bricklaying Tools & Brick Trowels — Hand Tools for Bricklayers",
  electrical: "Electrician Tool Belts & Pouches — Electrical Hand Tools",
  plumbing: "Plumbing Tool Belts & Pouches — Hand Tools for Plumbers",
  "painting-decorating": "Painter & Decorator Tool Belts — Hand Tools & Pouches",
  glazing: "Glazing Hand Tools & Tool Belts — Glazier Trade Gear",
  landscaping: "Landscaping Tools & Tool Belts — Hand Tools for Landscapers",
  "steel-fixing": "Steel Fixing Tools — Rebar Belts & Trade Hand Tools",
  demolition: "Demolition Hand Tools & Site Belts — Trade-Grade",
  "metal-fabrication": "Metal Fabrication Hand Tools & Tool Belts",
  joinery: "Joinery Hand Tools & Tool Belts — Trade Workshop Gear",
  "stone-masonry": "Stone Masonry Hand Tools & Belts — Mason Trade Gear",
  tailoring: "Tailoring Hand Tools — Trade Workshop Gear",
  barber: "Barber Hand Tools & Belt Pouches — Trade Belt Gear",
  "first-aid": "Site First Aid Pouches — Construction Trade Safety"
};

export function categoryTitle(slug: string, fallbackName: string): string {
  return CATEGORY_SEO_TITLES[slug] ?? `${fallbackName} — Trade-Grade Hand Tools & Tool Belts`;
}

export function categoryDescription(category: HammerexCategory): string {
  const keyword = CATEGORY_SEO_TITLES[category.slug]?.split(" — ")[0] ?? category.name;
  return clampDescription(
    `${keyword} direct from the Hammerex workshop — the maker-direct alternative to building merchants and hardware stores. Trade-grade, stitched and riveted in Yogyakarta, shipped worldwide. Delivery quoted as one package by the Hammerex team within 24 hours.`
  );
}

export function collectionJsonLd(category: HammerexCategory, products: HammerexProduct[]) {
  const seoTitle = CATEGORY_SEO_TITLES[category.slug] ?? `${category.name} — ${BRAND.name}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    url: absolute(`/c/${category.slug}`),
    description: categoryDescription(category),
    keywords: [category.name.toLowerCase(), ...SEO_KEYWORDS].join(", "),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(`/product/${p.slug ?? p.id}`),
        name: p.name
      }))
    },
    // OfferCatalog tells Google "this page lists products for sale" — improves
    // category-page eligibility for Shopping carousels and merchant listings.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: category.name,
      itemListElement: products.slice(0, 30).map((p) => ({
        "@type": "Offer",
        url: absolute(`/product/${p.slug ?? p.id}`),
        itemOffered: { "@type": "Product", name: p.name, sku: p.sku ?? p.id },
        ...priceForJsonLd(p),
        availability:
          p.stock_count === null || p.stock_count === undefined || p.stock_count > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock"
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

// LocalBusiness schema for a Trade Off tradesperson profile.
// Surfaces the listing to Google as a local trade so /trade/<slug> can rank for
// "<trade> in <city>" queries the way Checkatrade pages do.
export function localBusinessJsonLd(listing: HammerexTradeOffListing, tradeLabelText: string) {
  const url = absolute(`/trade/${listing.slug}`);
  const photo = listing.avatar_url ?? listing.photos[0] ?? BRAND.logo;
  const digits = listing.whatsapp.replace(/\D/g, "");
  const geo =
    listing.lat != null && listing.lng != null
      ? { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    name: listing.trading_name ?? listing.display_name,
    description: stripMarkdown(listing.bio).slice(0, 320),
    image: photo,
    url,
    telephone: digits ? `+${digits}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressCountry: listing.country,
      postalCode: listing.postcode_prefix ?? undefined
    },
    geo,
    areaServed: listing.service_postcodes.length
      ? listing.service_postcodes
      : [listing.city],
    knowsAbout: [tradeLabelText, ...listing.secondary_trades],
    foundingDate: listing.start_year ? `${listing.start_year}-01-01` : undefined,
    sameAs: [listing.website, listing.instagram ? `https://instagram.com/${listing.instagram.replace(/^@/, "")}` : null].filter(Boolean)
  };
}

export function escapeXml(input: string): string {
  return input.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
  );
}
