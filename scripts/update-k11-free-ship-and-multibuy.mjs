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
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SLUG = "k11-drywall-tool-station";
const r = await sb.from("hammerex_products").select("id,price_idr").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("K11 not found");
const id = r.data.id;
const unit = r.data.price_idr;

const tiers = [
  { min: 2, pct: 5 },
  { min: 3, pct: 10 }
];

const purchase_notes = [
  "Buy 2 save 5% · Buy 3 save 10% — applied automatically at the quantity step.",
  "In stock — dispatched within 48 hours.",
  "Trade & bulk pricing available — message us via the Partners page.",
  "Free worldwide delivery — UK, USA & Australia included."
];

{
  const { error } = await sb
    .from("hammerex_products")
    .update({
      qty_discount_tiers: tiers,
      purchase_notes,
      shipping_per_unit_idr: 0
    })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ product: tiers, purchase_notes, free shipping");
}

const specUpdates = [
  { sort_order: 30, value: "£188.00 with FREE worldwide delivery" },
  { sort_order: 31, value: "Buy 2 -5% · Buy 3 -10%" },
  { sort_order: 42, value: "Free UK delivery — typically 5–6 working days transit" },
  { sort_order: 43, value: "Free USA & Australia delivery — typically 5–6 working days air freight" }
];
for (const s of specUpdates) {
  const { error } = await sb
    .from("hammerex_product_specs")
    .update({ value: s.value })
    .eq("product_id", id)
    .eq("sort_order", s.sort_order);
  if (error) throw error;
}
console.log(`✓ ${specUpdates.length} spec rows updated`);

const deal2 = Math.round(2 * unit * 0.95);
const deal3 = Math.round(3 * unit * 0.90);
{
  const { error: e1 } = await sb
    .from("hammerex_product_deals")
    .update({ price_idr: deal2 })
    .eq("product_id", id)
    .eq("qty", 2);
  if (e1) throw e1;
  const { error: e2 } = await sb
    .from("hammerex_product_deals")
    .update({ price_idr: deal3 })
    .eq("product_id", id)
    .eq("qty", 3);
  if (e2) throw e2;
  console.log(`✓ deals repriced: qty2=${deal2}  qty3=${deal3}`);
}

console.log("\nDone.");
