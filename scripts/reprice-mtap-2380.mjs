import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "measure-tape-belt-holder";

// £23.80 @ 23,827 IDR/£ = 567,083 → round to 567,000 for clean display
const PRICE_IDR = 567_000;

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// shipping_per_unit_idr = 0 → BuyColumn shows FREE-UK panel + auto +£10
// air freight panel for non-UK buyers.
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
console.log("✓ price + shipping + notes updated (£23.80, free UK delivery)");

// Recompute multi-buy deal prices off the new base.
const r100 = (n) => Math.floor(n / 100) * 100;
const qty2 = r100(PRICE_IDR * 2 * 0.9);   // -10%
const qty3 = r100(PRICE_IDR * 3 * 0.85);  // -15%

const d2 = await s.from("hammerex_product_deals").update({ price_idr: qty2 }).eq("product_id", id).eq("qty", 2);
if (d2.error) throw d2.error;
console.log(`✓ Buy 2 repriced: ${qty2.toLocaleString()} IDR (~£${(qty2/23827).toFixed(2)})`);

// Buy 3 may not exist yet (banner not provided) — skip if absent
const d3check = await s.from("hammerex_product_deals").select("id").eq("product_id", id).eq("qty", 3).maybeSingle();
if (d3check.data) {
  const d3 = await s.from("hammerex_product_deals").update({ price_idr: qty3 }).eq("id", d3check.data.id);
  if (d3.error) throw d3.error;
  console.log(`✓ Buy 3 repriced: ${qty3.toLocaleString()} IDR (~£${(qty3/23827).toFixed(2)})`);
} else {
  console.log("· Buy 3 deal not present yet (waiting on banner)");
}

// Update / insert spec rows so the spec table reflects the new headline.
const specs = await s.from("hammerex_product_specs").select("id,group_name,label").eq("product_id", id);
let updated = 0;
for (const row of specs.data ?? []) {
  if (row.group_name === "Pricing" && row.label === "Single unit") {
    await s.from("hammerex_product_specs").update({ value: "£23.80 with FREE UK delivery" }).eq("id", row.id);
    updated++;
  }
  if (row.group_name === "Dispatch" && row.label === "UK delivery") {
    await s.from("hammerex_product_specs").update({ value: "Free UK delivery — typically 5 working days transit" }).eq("id", row.id);
    updated++;
  }
}

const hasSingle = (specs.data ?? []).some(r => r.group_name === "Pricing" && r.label === "Single unit");
if (!hasSingle) {
  await s.from("hammerex_product_specs").insert([
    { product_id: id, group_name: "Pricing",  label: "Single unit",     value: "£23.80 with FREE UK delivery",                          sort_order: 30 },
    { product_id: id, group_name: "Pricing",  label: "Bulk discounts",  value: "Buy 2 -10% · Buy 3 -15%",                               sort_order: 31 },
    { product_id: id, group_name: "Dispatch", label: "UK delivery",     value: "Free UK delivery — typically 5 working days transit",   sort_order: 42 },
    { product_id: id, group_name: "Dispatch", label: "Other countries", value: "+£10 air freight · confirmed on WhatsApp at checkout",  sort_order: 43 }
  ]);
  console.log("✓ inserted Pricing/Dispatch spec rows");
} else if (updated > 0) {
  console.log(`✓ ${updated} existing spec rows refreshed`);
}
