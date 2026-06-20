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

const p = await s.from("hammerex_products").select("id,price_idr,image_url").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const { id, price_idr } = p.data;

// 1) Multi-buy tiers (mirror plastering-pro-bag: 2 -10%, 3 -15%)
const tiers = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 }
];

// 2) Purchase notes (mirror plastering-pro-bag tone)
const purchase_notes = [
  "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
  "In stock — dispatched within 3 working days.",
  "Typical UK delivery within 5 working days.",
  "International shipping quoted on request.",
  "Bulk and trade pricing available — speak to our team via the partners page."
];

const upd = await s.from("hammerex_products").update({
  qty_discount_tiers: tiers,
  purchase_notes,
  compare_with: ["electrician-pro-pouch", "electrician-double-pouch"]
}).eq("id", id);
if (upd.error) throw upd.error;
console.log("✓ tiers + purchase_notes + compare_with updated");

// 3) Multi-buy deals (Buy 2 / Buy 3) — bannered above the buy panel.
//    Price is base × qty × (1 − pct/100), rounded down to nearest 100.
const r100 = (n) => Math.floor(n / 100) * 100;
const qty2 = r100(price_idr * 2 * 0.9);   // -10%
const qty3 = r100(price_idr * 3 * 0.85);  // -15%

// Wipe any existing deals to keep the page clean if re-run.
await s.from("hammerex_product_deals").delete().eq("product_id", id);

const dIns = await s.from("hammerex_product_deals").insert([
  {
    product_id: id, sort_order: 0, label: "Deal 1", qty: 2,
    name: "Buy 2 Electrician Sling Bags",
    price_idr: qty2, banner_url: p.data.image_url, icon_emoji: "?", description: null
  },
  {
    product_id: id, sort_order: 1, label: "Deal 2", qty: 3,
    name: "Buy 3 Electrician Sling Bags",
    price_idr: qty3, banner_url: p.data.image_url, icon_emoji: "??", description: null
  }
]);
if (dIns.error) throw dIns.error;
console.log(`✓ multi-buy banners: qty2 @ ${qty2.toLocaleString()}, qty3 @ ${qty3.toLocaleString()}`);
console.log("\nDone — ESB page now mirrors plastering-pro-bag's multi-buy treatment.");
