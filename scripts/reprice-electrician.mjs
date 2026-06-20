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

// £36 × 23,827 = 857,772 IDR (pouch only base)
// £46 × 23,827 = 1,096,042 IDR (combo)
// £10 × 23,827 = 238,270 IDR (shipping per unit)
const POUCH_IDR = 857772;
const COMBO_IDR = 1096042;
const SHIP_IDR = 238270;

const SLUG = "electrician-pro-pouch";
const r = await supabase.from("hammerex_products").select("id, name").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("electrician-pro-pouch not found");
const id = r.data.id;

// 1. Base product price + shipping override
{
  const { error } = await supabase
    .from("hammerex_products")
    .update({ price_idr: POUCH_IDR, shipping_per_unit_idr: SHIP_IDR })
    .eq("id", id);
  if (error) throw error;
  console.log(`✓ product: price_idr → ${POUCH_IDR.toLocaleString()} (£36), shipping → ${SHIP_IDR.toLocaleString()} (£10)`);
}

// 2. Variant prices
{
  const { error: e1 } = await supabase
    .from("hammerex_product_variants")
    .update({ price_idr: POUCH_IDR })
    .eq("product_id", id)
    .eq("label", "Pouch only");
  if (e1) throw e1;
  const { error: e2 } = await supabase
    .from("hammerex_product_variants")
    .update({ price_idr: COMBO_IDR })
    .eq("product_id", id)
    .eq("label", "Pouch + Leather Belt");
  if (e2) throw e2;
  console.log(`✓ variant "Pouch only" → £36, "Pouch + Leather Belt" → £46`);
}

// 3. Recompute multi-buy deals so the discount % stays 10% / 15% off the new £36 base
{
  const roundDown100 = (n) => Math.floor(n / 100) * 100;
  const qty2 = roundDown100(POUCH_IDR * 2 * 0.9);
  const qty3 = roundDown100(POUCH_IDR * 3 * 0.85);
  await supabase
    .from("hammerex_product_deals")
    .update({ price_idr: qty2 })
    .eq("product_id", id)
    .eq("qty", 2);
  await supabase
    .from("hammerex_product_deals")
    .update({ price_idr: qty3 })
    .eq("product_id", id)
    .eq("qty", 3);
  console.log(`✓ multi-buy: qty2 → ${qty2.toLocaleString()} (-10% on £36×2), qty3 → ${qty3.toLocaleString()} (-15% on £36×3)`);
  console.log(`  (combo variant auto-scales these % at runtime in BuyColumn — Buy 2 combo ≈ £82.80, Buy 3 combo ≈ £117.30)`);
}

console.log("\nDone.");
