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
const BUY2_BANNER = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2006_31_01%20AM.png";

const p = await s.from("hammerex_products").select("id,price_idr").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Check existing deals
const existing = await s.from("hammerex_product_deals").select("*").eq("product_id", id).eq("qty", 2).maybeSingle();
const r100 = (n) => Math.floor(n / 100) * 100;
const qty2 = r100(p.data.price_idr * 2 * 0.9); // -10%

if (existing.data) {
  const upd = await s.from("hammerex_product_deals")
    .update({ banner_url: BUY2_BANNER })
    .eq("id", existing.data.id);
  if (upd.error) throw upd.error;
  console.log("✓ Buy 2 deal banner updated");
} else {
  // No Buy 2 deal yet — apply the same multi-buy treatment as ESB / PPB
  const tiers = [{ min: 2, pct: 10 }, { min: 3, pct: 15 }];
  await s.from("hammerex_products").update({ qty_discount_tiers: tiers }).eq("id", id);

  const ins = await s.from("hammerex_product_deals").insert({
    product_id: id, sort_order: 0, label: "Deal 1", qty: 2,
    name: "Buy 2 Measure Tape Belt Holders",
    price_idr: qty2, banner_url: BUY2_BANNER, icon_emoji: "?", description: null
  });
  if (ins.error) throw ins.error;
  console.log(`✓ Buy 2 deal inserted with banner @ ${qty2.toLocaleString()} IDR (~£${(qty2/23827).toFixed(2)})`);
}
