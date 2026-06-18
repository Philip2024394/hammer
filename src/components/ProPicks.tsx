import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { ProductRow } from "./ProductRow";

// Surfaces the three flagship Pro Pick products. These are the brand's
// signature trade-pro purchases — a single home-page row that gives the
// catalogue a clear story instead of the previous 75-SKU dump.
//
// To change the picks: update the slugs list below OR update which
// hammerex_products rows have badge_label = 'PRO KIT'.
const PRO_PICK_SLUGS = [
  "plastering-pro-bag",
  "drywall-pro-kit",
  "scaffolders-setup-kit"
];

export async function ProPicks() {
  const [prodRes, catRes] = await Promise.all([
    supabase.from("hammerex_products").select("*").in("slug", PRO_PICK_SLUGS),
    supabase.from("hammerex_categories").select("id, slug, name")
  ]);
  const cats = new Map<string, { slug: string; name: string }>();
  for (const c of (catRes.data ?? []) as HammerexCategory[]) {
    cats.set(c.id, { slug: c.slug, name: c.name });
  }
  const lookup = new Map<string, HammerexProduct>();
  for (const p of (prodRes.data ?? []) as HammerexProduct[]) {
    lookup.set(p.slug ?? "", { ...p, category: p.category_id ? cats.get(p.category_id) ?? null : null });
  }
  const products = PRO_PICK_SLUGS.map((s) => lookup.get(s)).filter((p): p is HammerexProduct => Boolean(p));
  if (products.length === 0) return null;
  return <ProductRow items={products} title="Pro Picks" viewAllHref="/products" layout="landscape" />;
}
