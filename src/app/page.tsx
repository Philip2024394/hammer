import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BrandStatementStrip } from "@/components/BrandStatementStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ToolTypesGrid } from "@/components/ToolTypesGrid";
import { ProPicks } from "@/components/ProPicks";
import { BuiltByTheTradeBlock } from "@/components/BuiltByTheTradeBlock";
import { RecentlyViewedRail } from "@/components/RecentlyViewedRail";
import { DistributionPartnersSection } from "@/components/DistributionPartnersSection";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexCategory } from "@/lib/supabase";
import { BRAND, SEO_KEYWORDS, breadcrumbJsonLd, faqJsonLd, siteUrl } from "@/lib/seo";
import { HOME_FAQ } from "@/lib/homeFaq";

// Home is ISR — categories rarely change and the hero is static.
export const revalidate = 60;

// Home metadata is keyword-rich on purpose — this is the highest-authority URL
// on the site, so it has to do the heavy lifting for "construction tools",
// "tool belts", "tool bags", "hand tools", "hardware store" and
// "building merchants" intent queries.
export const metadata: Metadata = {
  title: "Hammerex | Construction Tools, Tool Belts & Tool Bags Direct from the Maker",
  description: BRAND.description,
  keywords: SEO_KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: "Hammerex | Construction Tools, Tool Belts & Tool Bags Direct",
    description: BRAND.descriptionShort,
    url: siteUrl(),
    locale: BRAND.locale,
    images: [{ url: BRAND.logo, width: 1200, height: 1200, alt: `${BRAND.name} — construction tools, tool belts and tool bags direct from Yogyakarta` }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammerex | Construction Tools, Tool Belts & Tool Bags Direct",
    description: BRAND.descriptionShort,
    images: [BRAND.logo]
  }
};

// Home page is intentionally SYNC at the top level. The Hero + the
// production-notice marquee render immediately on first paint without
// waiting for any DB query. The data-dependent sections (Pro Picks,
// Categories, Tool Types, etc.) are wrapped in a Suspense boundary
// inside HomeContent so they stream in once the categories query
// resolves — but they don't block the Hero from showing.
export default function HomePage() {
  // BreadcrumbList + FAQPage on the home page so Google can surface the
  // brand entity (Knowledge panel) and Q/A featured snippets for informational
  // queries that lead into the catalogue.
  const breadcrumb = breadcrumbJsonLd([{ name: "Home", url: "/" }]);
  const faq = faqJsonLd(HOME_FAQ);
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <Header />
      <Hero />
      <BrandStatementStrip />
      <Suspense fallback={<div aria-hidden="true" className="h-64" />}>
        <HomeContent />
      </Suspense>
      <HomeFaqSection />
      <DeliveryFooter />
    </main>
  );
}

async function HomeContent() {
  const categories = await loadCategories();
  return (
    <>
      <ProPicks />
      <CategoryGrid items={categories} />
      <ToolTypesGrid items={categories} />
      <BuiltByTheTradeBlock />
      <RecentlyViewedRail />
      <DistributionPartnersSection />
    </>
  );
}

async function loadCategories(): Promise<HammerexCategory[]> {
  try {
    const cats = await supabase
      .from("hammerex_categories")
      .select("id, slug, name, image_url, card_image_url, card_show_label, sort_order, is_tool_type")
      .order("sort_order");
    return (cats.data ?? []) as HammerexCategory[];
  } catch {
    return [];
  }
}
