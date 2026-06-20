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
  .or("sku.eq.HX-EPP-001,slug.ilike.%electrician%pro%pouch%,slug.ilike.%electrician-pro%");
console.log("matches:", r.data?.map((p) => ({ id: p.id, slug: p.slug, name: p.name, sku: p.sku, price_idr: p.price_idr, image_url: p.image_url, overview_len: p.overview?.length })));

if (r.data?.[0]) {
  const id = r.data[0].id;
  const tables = ["hammerex_product_media","hammerex_product_specs","hammerex_what_in_box","hammerex_product_variants","hammerex_product_deals","hammerex_pair_with","hammerex_bundles"];
  for (const t of tables) {
    const col = (t === "hammerex_bundles") ? "anchor_product_id" : "product_id";
    const c = await supabase.from(t).select("*", { count: "exact", head: true }).eq(col, id);
    console.log(`  ${t}: ${c.count} rows`);
  }
}
