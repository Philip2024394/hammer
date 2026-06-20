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
const r = await supabase.from("hammerex_products").select("id, name, price_idr, image_url").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("electrician-pro-pouch not found");
const { id, name, price_idr: base, image_url } = r.data;
console.log(`Seeding multi-buy for "${name}" @ ${base} IDR base`);

const roundDown100 = (n) => Math.floor(n / 100) * 100;
const qty2Total = roundDown100(base * 2 * 0.9);
const qty3Total = roundDown100(base * 3 * 0.85);

await supabase.from("hammerex_product_deals").delete().eq("product_id", id);
const deals = [
  {
    product_id: id,
    sort_order: 0,
    label: "Deal 1",
    qty: 2,
    name: `Buy 2 ${name}s`,
    price_idr: qty2Total,
    banner_url: image_url,
    icon_emoji: "?",
    description: null
  },
  {
    product_id: id,
    sort_order: 1,
    label: "Deal 2",
    qty: 3,
    name: `Buy 3 ${name}s`,
    price_idr: qty3Total,
    banner_url: image_url,
    icon_emoji: "??",
    description: null
  }
];
const { error } = await supabase.from("hammerex_product_deals").insert(deals);
if (error) throw error;
console.log(`✓ multi-buy: qty2 @ ${qty2Total.toLocaleString()} IDR (-10%), qty3 @ ${qty3Total.toLocaleString()} IDR (-15%)`);
console.log("Note: deal banners use the product image as a placeholder — drop in bespoke banners when ready.");
