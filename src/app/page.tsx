import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HomePageNotice } from "@/components/HomePageNotice";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ToolTypesGrid } from "@/components/ToolTypesGrid";
import { ProPicks } from "@/components/ProPicks";
import { BuiltByTheTradeBlock } from "@/components/BuiltByTheTradeBlock";
import { RecentlyViewedRail } from "@/components/RecentlyViewedRail";
import { DistributionPartnersSection } from "@/components/DistributionPartnersSection";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexCategory } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Home page is intentionally SYNC at the top level. The Hero + the
// production-notice marquee render immediately on first paint without
// waiting for any DB query. The data-dependent sections (Pro Picks,
// Categories, Tool Types, etc.) are wrapped in a Suspense boundary
// inside HomeContent so they stream in once the categories query
// resolves — but they don't block the Hero from showing.
export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <HomePageNotice />
      <Suspense fallback={<div aria-hidden="true" className="h-64" />}>
        <HomeContent />
      </Suspense>
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
      .select("id, slug, name, image_url, sort_order, is_tool_type")
      .order("sort_order");
    return (cats.data ?? []) as HammerexCategory[];
  } catch {
    return [];
  }
}
