import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BELT_SKUS = [
  "HX-STB-001",
  "HX-FX7-001",
  "HX-KIT-SCA-001",
  "HX-SA7-001",
  "HX-LSRFH-001",
  "HX-HDLTB-001",
];

const r = await supabase.from("hammerex_products").select("id, sku, slug, name, price_idr, image_url").in("sku", BELT_SKUS);
for (const p of r.data ?? []) {
  const deals = await supabase.from("hammerex_product_deals").select("qty, price_idr").eq("product_id", p.id).order("qty");
  console.log(`${p.sku} | ${p.slug} | ${p.price_idr} IDR | deals: ${JSON.stringify(deals.data)}`);
}
