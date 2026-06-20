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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const slugs = ["plastering-pro-bag", "trowel-leg-pouch"];

for (const slug of slugs) {
  console.log("\n=================");
  console.log("SLUG:", slug);
  console.log("=================");
  const p = await supabase.from("hammerex_products").select("*").eq("slug", slug).maybeSingle();
  if (!p.data) {
    console.log("NOT FOUND");
    continue;
  }
  const id = p.data.id;
  console.log("product:", {
    id,
    name: p.data.name,
    sku: p.data.sku,
    price_idr: p.data.price_idr,
    category_id: p.data.category_id,
    image_url: p.data.image_url,
    overview: p.data.overview,
    description: p.data.description?.slice(0, 80),
    is_accessory: p.data.is_accessory,
    is_featured: p.data.is_featured,
    warranty_years: p.data.warranty_years,
    dispatch_lead_days: p.data.dispatch_lead_days,
    weight_kg: p.data.weight_kg,
    compare_with: p.data.compare_with,
    faq_count: Array.isArray(p.data.faq) ? p.data.faq.length : 0,
    shipping_per_unit_idr: p.data.shipping_per_unit_idr
  });

  const tables = [
    "hammerex_product_media",
    "hammerex_product_specs",
    "hammerex_what_in_box",
    "hammerex_product_variants",
    "hammerex_product_deals",
    "hammerex_deal_breakers",
    "hammerex_pair_with",
    "hammerex_bundles"
  ];
  for (const t of tables) {
    const col = t === "hammerex_deal_breakers" || t === "hammerex_bundles" ? "anchor_product_id" : "product_id";
    const r = await supabase.from(t).select("*").eq(col, id);
    console.log(`${t} (${r.data?.length ?? 0}):`);
    for (const row of r.data ?? []) {
      console.log("  ", JSON.stringify(row));
    }
  }
}
