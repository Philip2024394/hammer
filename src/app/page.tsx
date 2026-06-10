import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ProductRow } from "@/components/ProductRow";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexCategory, type HammerexProduct } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadData() {
  try {
    const [cats, prods] = await Promise.all([
      supabase.from("hammerex_categories").select("id, slug, name, image_url, sort_order").order("sort_order"),
      supabase.from("hammerex_products").select("id, category_id, name, description, price_idr, image_url, is_featured").eq("is_featured", true).limit(3)
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
      <CategoryCarousel items={categories} />
      <ProductRow items={products} />
      <DeliveryFooter />
    </main>
  );
}
