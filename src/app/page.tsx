import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ToolTypesGrid } from "@/components/ToolTypesGrid";
import { RecentlyViewedRail } from "@/components/RecentlyViewedRail";
import { DistributionPartnersSection } from "@/components/DistributionPartnersSection";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexCategory } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadData() {
  try {
    const cats = await supabase
      .from("hammerex_categories")
      .select("id, slug, name, image_url, sort_order, is_tool_type")
      .order("sort_order");
    return { categories: (cats.data ?? []) as HammerexCategory[] };
  } catch {
    return { categories: [] };
  }
}

export default async function HomePage() {
  const { categories } = await loadData();
  return (
    <main>
      <Header />
      <Hero />
      <CategoryGrid items={categories} />
      <ToolTypesGrid items={categories} />
      <RecentlyViewedRail />
      <DistributionPartnersSection />
      <DeliveryFooter />
    </main>
  );
}
