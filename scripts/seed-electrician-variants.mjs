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

const SLUG = "electrician-pro-pouch";
const r = await supabase.from("hammerex_products").select("id, image_url, price_idr, sku").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("electrician-pro-pouch not found");
const { id, image_url, price_idr: base, sku } = r.data;
console.log(`base = ${base} IDR (≈£${(base / 23827).toFixed(2)})`);

// £10 = 238,270 IDR additional for the leather belt option (matches Trowel pricing model)
const BELT_ADD_IDR = 238270;

await supabase.from("hammerex_product_variants").delete().eq("product_id", id);
const variants = [
  {
    product_id: id,
    label: "Pouch only",
    sku: sku ?? "HX-EPP-001",
    price_idr: base,
    image_url,
    stock_count: null,
    sort_order: 0,
    is_default: true
  },
  {
    product_id: id,
    label: "Pouch + Leather Belt",
    sku: "HX-EPP-002",
    price_idr: base + BELT_ADD_IDR,
    image_url,
    stock_count: null,
    sort_order: 1,
    is_default: false
  }
];
const { error } = await supabase.from("hammerex_product_variants").insert(variants);
if (error) throw error;
console.log("✓ 2 variants inserted:");
console.log(`  - Pouch only (default) @ ${base.toLocaleString()} IDR (≈£${(base/23827).toFixed(2)})`);
console.log(`  - Pouch + Leather Belt @ ${(base + BELT_ADD_IDR).toLocaleString()} IDR (≈£${((base + BELT_ADD_IDR)/23827).toFixed(2)})`);
console.log("\nNote: combo variant uses banner 1 as image_url — send a what's-in-box combo image when ready and I'll add Option 2 row + swap variant image.");
