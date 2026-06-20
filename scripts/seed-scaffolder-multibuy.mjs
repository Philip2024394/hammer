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

const SLUG = "scaffolders-setup-kit";
const r = await supabase.from("hammerex_products").select("id, name, price_idr, image_url").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("scaffolders-setup-kit not found");
const { id, name, price_idr: base, image_url } = r.data;
console.log(`Seeding for "${name}" @ ${base} IDR base (≈£${(base/23827).toFixed(2)})`);

// 1. Multi-buy deals (qty 2 = -10%, qty 3 = -15%)
{
  const roundDown100 = (n) => Math.floor(n / 100) * 100;
  const qty2 = roundDown100(base * 2 * 0.9);
  const qty3 = roundDown100(base * 3 * 0.85);
  await supabase.from("hammerex_product_deals").delete().eq("product_id", id);
  const deals = [
    {
      product_id: id,
      sort_order: 0,
      label: "Deal 1",
      qty: 2,
      name: `Buy 2 ${name}s`,
      price_idr: qty2,
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
      price_idr: qty3,
      banner_url: image_url,
      icon_emoji: "??",
      description: null
    }
  ];
  const { error } = await supabase.from("hammerex_product_deals").insert(deals);
  if (error) throw error;
  console.log(`✓ multi-buy: qty2 @ ${qty2.toLocaleString()} (-10%), qty3 @ ${qty3.toLocaleString()} (-15%)`);
}

// 2. compare_with — sensible sibling scaffolder products in same category
{
  const compare = ["scaffolders-tool-belt", "leather-scaffolding-belt-tilted-ratchet-frog-holder"];
  const { error } = await supabase
    .from("hammerex_products")
    .update({ compare_with: compare })
    .eq("id", id);
  if (error) throw error;
  console.log(`✓ compare_with → ${JSON.stringify(compare)}`);
}

console.log("\nDone — multi-buy + compare. Deal banners are using the product image_url as placeholder; send bespoke banners and I'll swap them in.");
