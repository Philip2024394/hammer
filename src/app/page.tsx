import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductRow } from "@/components/ProductRow";
import { ProductRequestSection } from "@/components/ProductRequestSection";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexCategory, type HammerexProduct } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadData() {
  try {
    const [cats, prods] = await Promise.all([
      supabase.from("hammerex_categories").select("id, slug, name, image_url, sort_order").order("sort_order"),
      supabase.from("hammerex_products").select("*").eq("is_featured", true).order("home_sort_order", { ascending: true }).order("price_idr", { ascending: false }).limit(6)
    ]);
    return {
      categories: (cats.data ?? []) as HammerexCategory[],
      products: (prods.data ?? []) as HammerexProduct[]
    };
  } catch {
    return { categories: [], products: [] };
  }
}

export default async function HomePage() {
  const { categories, products } = await loadData();
  return (
    <main>
      <Header />
      <Hero />
      <CategoryGrid items={categories} />
      <ProductRow items={products} />
      <ProductRequestSection />
      <DeliveryFooter />
    </main>
  );
}
