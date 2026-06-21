import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Standard Hammerex multi-buy: 2 → −10%, 3 → −15%. Applied to every
// product that doesn't already have its own tiers + deal banners.
const TIERS = [{ min: 2, pct: 10 }, { min: 3, pct: 15 }];
const r100 = (n) => Math.floor(n / 100) * 100;
const GBP = 23827;

const all = await s.from("hammerex_products").select("id,slug,name,price_idr,image_url,qty_discount_tiers");
const products = all.data ?? [];

const dealsRes = await s.from("hammerex_product_deals").select("product_id,qty");
const dealsByProduct = new Map();
for (const d of dealsRes.data ?? []) {
  if (!dealsByProduct.has(d.product_id)) dealsByProduct.set(d.product_id, new Set());
  dealsByProduct.get(d.product_id).add(d.qty);
}

let tiersAdded = 0, dealsAdded = 0, skippedNoImage = 0, alreadyHad = 0;

for (const p of products) {
  const currentTiers = Array.isArray(p.qty_discount_tiers) ? p.qty_discount_tiers : [];
  const tiersOk = currentTiers.length > 0;
  const existingDeals = dealsByProduct.get(p.id) ?? new Set();
  const dealsOk = existingDeals.has(2) && existingDeals.has(3);

  if (tiersOk && dealsOk) { alreadyHad++; continue; }

  // Tiers — set if missing
  if (!tiersOk) {
    const upd = await s.from("hammerex_products").update({ qty_discount_tiers: TIERS }).eq("id", p.id);
    if (upd.error) { console.warn(`! tiers fail ${p.slug}:`, upd.error.message); continue; }
    tiersAdded++;
  }

  // Deal banners — need a banner_url. Without product.image_url we can't
  // create the cards (the slider banner would render blank).
  if (!p.image_url) { skippedNoImage++; continue; }

  // Wipe any partial deal rows so the insert is idempotent.
  if (existingDeals.size > 0) {
    await s.from("hammerex_product_deals").delete().eq("product_id", p.id);
  }

  const qty2 = r100(p.price_idr * 2 * 0.9);
  const qty3 = r100(p.price_idr * 3 * 0.85);
  const ins = await s.from("hammerex_product_deals").insert([
    {
      product_id: p.id, sort_order: 0, label: "Deal 1", qty: 2,
      name: `Buy 2 ${p.name}`,
      price_idr: qty2, banner_url: p.image_url, icon_emoji: "?", description: null
    },
    {
      product_id: p.id, sort_order: 1, label: "Deal 2", qty: 3,
      name: `Buy 3 ${p.name}`,
      price_idr: qty3, banner_url: p.image_url, icon_emoji: "??", description: null
    }
  ]);
  if (ins.error) { console.warn(`! deals fail ${p.slug}:`, ins.error.message); continue; }
  dealsAdded++;
}

console.log(`\n✓ tiers added on ${tiersAdded} products`);
console.log(`✓ multi-buy deal banners added on ${dealsAdded} products`);
console.log(`· already had both: ${alreadyHad}`);
console.log(`· skipped (no image_url, deal banner would be blank): ${skippedNoImage}`);
