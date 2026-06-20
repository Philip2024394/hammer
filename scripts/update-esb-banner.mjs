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
const BANNER = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2004_26_23%20AM.png";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Main product image
const up1 = await s.from("hammerex_products").update({ image_url: BANNER }).eq("id", id);
if (up1.error) throw up1.error;
console.log("✓ product.image_url updated");

// First gallery media row (kind=image, lowest sort_order)
const m = await s.from("hammerex_product_media").select("id").eq("product_id", id).eq("kind", "image").order("sort_order").limit(1).maybeSingle();
if (m.data) {
  const up2 = await s.from("hammerex_product_media").update({ url: BANNER }).eq("id", m.data.id);
  if (up2.error) throw up2.error;
  console.log("✓ hero media row updated");
}

// Deal banner_urls (multi-buy banners) — mirror the product banner
const up3 = await s.from("hammerex_product_deals").update({ banner_url: BANNER }).eq("product_id", id);
if (up3.error) throw up3.error;
console.log("✓ multi-buy deal banners updated");
