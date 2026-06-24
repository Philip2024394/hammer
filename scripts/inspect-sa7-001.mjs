import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const r = await supabase.from("hammerex_products").select("*").eq("sku", "HX-SA7-001").maybeSingle();
if (!r.data) {
  console.log("HX-SA7-001 not found, searching scaffolder belts...");
  const cat = await supabase.from("hammerex_categories").select("id, slug, name").ilike("slug", "%scaffold%");
  console.log("scaffolder categories:", cat.data);
  const all = await supabase.from("hammerex_products").select("id, slug, name, sku, category_id, image_url").or("sku.ilike.HX-SA%,slug.ilike.%scaffold%");
  console.log("scaffolder/SA products:");
  for (const p of all.data ?? []) console.log("  -", p.sku, "|", p.slug, "|", p.name, "|", p.image_url?.slice(0, 60));
  process.exit(0);
}

const p = r.data;
console.log("Product:", p.slug, "|", p.name, "|", p.sku);
console.log("image_url:", p.image_url);
console.log("price_idr:", p.price_idr);
console.log("category_id:", p.category_id);
console.log("compare_with:", JSON.stringify(p.compare_with));
console.log("description:\n", p.description);
console.log("\noverview chars:", p.overview?.length);
console.log("variants field?", "variants" in p);

const cat = await supabase.from("hammerex_categories").select("slug, name").eq("id", p.category_id).maybeSingle();
console.log("category:", cat.data);

const media = await supabase.from("hammerex_product_media").select("*").eq("product_id", p.id).order("sort_order");
console.log("\nmedia rows:", media.data?.length);
for (const m of media.data ?? []) console.log("  ", m.sort_order, m.type, m.url?.slice(0, 70), m.role ?? "");

const deals = await supabase.from("hammerex_product_deals").select("*").eq("product_id", p.id).order("sort_order");
console.log("\ndeals rows:", deals.data?.length);
for (const d of deals.data ?? []) console.log("  ", d.qty, d.name, d.price_idr, d.banner_url?.slice(0, 70));

// All scaffolder belts in same category
const sibs = await supabase.from("hammerex_products").select("id, slug, name, sku, price_idr, image_url").eq("category_id", p.category_id);
console.log("\nsame-category products:");
for (const s of sibs.data ?? []) console.log("  -", s.sku, "|", s.slug, "|", s.name, "|", s.price_idr, "IDR");
