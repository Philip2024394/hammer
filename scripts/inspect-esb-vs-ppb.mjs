import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

for (const slug of ["plastering-pro-bag", "electrician-sling-bag"]) {
  const p = await s.from("hammerex_products")
    .select("id,name,slug,sku,price_idr,shipping_per_unit_idr,qty_discount_tiers,compare_with,is_featured,badge_label,country_of_assembly,base_currency,warranty_years,dispatch_lead_days,image_url,purchase_notes")
    .eq("slug", slug).maybeSingle();
  if (!p.data) { console.log(slug, "NOT FOUND"); continue; }
  console.log("\n=== " + slug + " ===");
  console.log(JSON.stringify(p.data, null, 2));
  const deals = await s.from("hammerex_product_deals").select("*").eq("product_id", p.data.id).order("sort_order");
  console.log("DEALS:", deals.data?.length ?? 0);
  if (deals.data?.length) console.log(JSON.stringify(deals.data, null, 2));
  const box = await s.from("hammerex_what_in_box").select("label,qty,image_url,sort_order").eq("product_id", p.data.id).order("sort_order");
  console.log("BOX:", box.data?.length, JSON.stringify(box.data, null, 2));
  const specs = await s.from("hammerex_product_specs").select("group_name,label,value,sort_order").eq("product_id", p.data.id).order("sort_order");
  console.log("SPECS:", specs.data?.length);
}
