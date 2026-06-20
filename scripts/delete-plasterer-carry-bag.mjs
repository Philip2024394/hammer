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

const SKU = "HX-PCB-001";
const SLUG = "plasterer-carry-bag";

const r = await supabase.from("hammerex_products").select("id").eq("sku", SKU).maybeSingle();
if (!r.data) {
  console.log("⚠ product not found by sku, trying slug…");
  const r2 = await supabase.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
  if (!r2.data) {
    console.log("Nothing to delete.");
    process.exit(0);
  }
  r.data = r2.data;
}
const id = r.data.id;

const childTables = [
  "hammerex_what_in_box",
  "hammerex_product_specs",
  "hammerex_product_media",
  "hammerex_product_variants",
  "hammerex_product_deals",
  "hammerex_reviews",
  "hammerex_answers",
  "hammerex_questions"
];
for (const t of childTables) {
  const { error } = await supabase.from(t).delete().eq("product_id", id);
  if (error && !String(error.message).includes("does not exist")) {
    console.warn(`! ${t}: ${error.message}`);
  } else {
    console.log(`✓ cleared ${t}`);
  }
}

// Deal breakers can reference this product as anchor or item
const db1 = await supabase.from("hammerex_deal_breakers").delete().eq("anchor_product_id", id);
const db2 = await supabase.from("hammerex_deal_breakers").delete().eq("item_product_id", id);
if (db1.error) console.warn(`! deal_breakers anchor: ${db1.error.message}`);
if (db2.error) console.warn(`! deal_breakers item:   ${db2.error.message}`);

// Pair-with rows referencing this product (either side)
const pw1 = await supabase.from("hammerex_pair_with").delete().eq("product_id", id);
const pw2 = await supabase.from("hammerex_pair_with").delete().eq("accessory_product_id", id);
if (pw1.error) console.warn(`! pair_with main:      ${pw1.error.message}`);
if (pw2.error) console.warn(`! pair_with accessory: ${pw2.error.message}`);

// Bundle items + bundles anchored on it
const bi = await supabase.from("hammerex_bundle_items").delete().eq("item_product_id", id);
if (bi.error) console.warn(`! bundle_items: ${bi.error.message}`);
const bd = await supabase.from("hammerex_bundles").delete().eq("anchor_product_id", id);
if (bd.error) console.warn(`! bundles:      ${bd.error.message}`);

// Finally the product itself
const del = await supabase.from("hammerex_products").delete().eq("id", id);
if (del.error) throw del.error;
console.log(`✓ product ${SKU} (${SLUG}) deleted`);
