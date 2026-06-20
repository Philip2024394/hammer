import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "electrician-sling-bag";

// £46 @ 23,827 IDR/£ = 1,096,042 → round to nearest 100 for clean display
const PRICE_IDR = 1_096_000;

const p = await s.from("hammerex_products").select("id,image_url").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Free UK delivery (shipping_per_unit_idr = 0) triggers the BuyColumn's
// "+£10 air freight · free for UK" panel for non-UK buyers automatically.
const upd = await s.from("hammerex_products").update({
  price_idr: PRICE_IDR,
  shipping_per_unit_idr: 0,
  purchase_notes: [
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "FREE UK delivery — typical 5 working days transit.",
    "Outside the UK: flat +£10 air freight, 5–6 days transit.",
    "In stock — dispatched within 3 working days.",
    "Bulk and trade pricing available — speak to our team via the partners page."
  ]
}).eq("id", id);
if (upd.error) throw upd.error;
console.log("✓ price + shipping + notes updated (£46, free UK delivery)");

// Recompute multi-buy deal prices off the new base.
const r100 = (n) => Math.floor(n / 100) * 100;
const qty2 = r100(PRICE_IDR * 2 * 0.9);   // -10%
const qty3 = r100(PRICE_IDR * 3 * 0.85);  // -15%

const d2 = await s.from("hammerex_product_deals").update({ price_idr: qty2 }).eq("product_id", id).eq("qty", 2);
const d3 = await s.from("hammerex_product_deals").update({ price_idr: qty3 }).eq("product_id", id).eq("qty", 3);
if (d2.error) throw d2.error;
if (d3.error) throw d3.error;
console.log(`✓ deals repriced: qty2 ${qty2.toLocaleString()} (~£${(qty2/23827).toFixed(2)}) · qty3 ${qty3.toLocaleString()} (~£${(qty3/23827).toFixed(2)})`);

// Update the pricing spec rows so the spec table reflects the new headline.
const specs = await s.from("hammerex_product_specs").select("id,group_name,label").eq("product_id", id);
for (const row of specs.data ?? []) {
  if (row.group_name === "Pricing" && row.label === "Single unit") {
    await s.from("hammerex_product_specs").update({ value: "£46.00 with FREE UK delivery" }).eq("id", row.id);
  }
  if (row.group_name === "Dispatch" && row.label === "UK delivery") {
    await s.from("hammerex_product_specs").update({ value: "Free UK delivery — typically 5 working days transit" }).eq("id", row.id);
  }
}

// Make sure the spec table has a Pricing / Single unit row even if it didn't before
const hasSingle = (specs.data ?? []).some(r => r.group_name === "Pricing" && r.label === "Single unit");
if (!hasSingle) {
  await s.from("hammerex_product_specs").insert([
    { product_id: id, group_name: "Pricing", label: "Single unit",     value: "£46.00 with FREE UK delivery",       sort_order: 30 },
    { product_id: id, group_name: "Pricing", label: "Bulk discounts",  value: "Buy 2 -10% · Buy 3 -15%",            sort_order: 31 },
    { product_id: id, group_name: "Dispatch", label: "Other countries", value: "+£10 air freight · confirmed on WhatsApp at checkout", sort_order: 43 }
  ]);
  console.log("✓ inserted Pricing/Dispatch spec rows");
}
console.log("Done.");
