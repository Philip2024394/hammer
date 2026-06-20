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

// Find the product by SKU
const r = await supabase
  .from("hammerex_products")
  .select("*")
  .or("sku.eq.HX-KIT-SCA-001,slug.ilike.%scaffolder%setup,slug.ilike.%scaffolders-setup%")
  .limit(5);
console.log("matches:");
for (const p of r.data ?? []) {
  console.log("  -", p.slug, "|", p.name, "|", p.sku, "|", p.price_idr, "IDR", "| img:", p.image_url?.slice(0, 60));
}

if (r.data?.[0]) {
  const id = r.data[0].id;
  const tables = ["hammerex_product_media","hammerex_product_specs","hammerex_what_in_box","hammerex_product_variants","hammerex_product_deals","hammerex_pair_with","hammerex_bundles"];
  console.log("Row counts:");
  for (const t of tables) {
    const col = (t === "hammerex_bundles") ? "anchor_product_id" : "product_id";
    const c = await supabase.from(t).select("*", { count: "exact", head: true }).eq(col, id);
    console.log(`  ${t}: ${c.count}`);
  }
  console.log("compare_with:", JSON.stringify(r.data[0].compare_with));
  console.log("shipping_per_unit_idr:", r.data[0].shipping_per_unit_idr);
  console.log("overview chars:", r.data[0].overview?.length);
  // category siblings
  const sibs = await supabase.from("hammerex_products").select("slug, name, price_idr").eq("category_id", r.data[0].category_id).neq("id", id).limit(8);
  console.log("Same-category siblings:");
  for (const p of sibs.data ?? []) console.log("  ", p.slug, "|", p.name, "|", p.price_idr, "IDR");
}
