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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const TROWEL_SLUG = "trowel-leg-pouch";
const ANCHOR = await supabase.from("hammerex_products").select("*").eq("slug", TROWEL_SLUG).maybeSingle();
if (!ANCHOR.data) throw new Error("trowel-leg-pouch not found");
const p = ANCHOR.data;
const id = p.id;
const base = p.price_idr;

console.log("Seeding PDP rows for", p.name, id, "@", base, "IDR");

// ---- 1. compare_with sibling ----
{
  const { error } = await supabase
    .from("hammerex_products")
    .update({ compare_with: ["plastering-pro-bag"] })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ compare_with set");
}

// ---- 2. what's in box ----
{
  await supabase.from("hammerex_what_in_box").delete().eq("product_id", id);
  const { error } = await supabase.from("hammerex_what_in_box").insert([
    {
      product_id: id,
      label: "1 — Trowel Leg Pouch",
      qty: 1,
      image_url: p.image_url,
      sort_order: 0
    }
  ]);
  if (error) throw error;
  console.log("✓ what_in_box inserted");
}

// ---- 3. specs (mirror Plastering Pro Bag's group structure, Trowel-accurate values) ----
{
  await supabase.from("hammerex_product_specs").delete().eq("product_id", id);
  const specs = [
    { group_name: "Capacity",     label: "Trowel sizes",      value: "Available in 14\", 16\" and 18\"",                     sort_order: 0 },
    { group_name: "Capacity",     label: "Worn as",           value: "Leg-mounted holster — trowel always within reach",      sort_order: 1 },

    { group_name: "Material",     label: "Construction",      value: "Twin-layer construction for strength + long-term durability", sort_order: 10 },
    { group_name: "Material",     label: "Reinforcement",     value: "Stud-reinforced pressure points",                       sort_order: 11 },
    { group_name: "Material",     label: "Seams",             value: "Pressure-glued seams for jobsite punishment",           sort_order: 12 },

    { group_name: "Design",       label: "Carry style",       value: "Strap-mounted to thigh / belt — hands-free trowel access", sort_order: 20 },

    { group_name: "Pricing",      label: "Single unit",       value: "£38.00 (indicative)",                                   sort_order: 30 },
    { group_name: "Pricing",      label: "Bulk discounts",    value: "Buy 2 -10% · Buy 3 -15%",                               sort_order: 31 },

    { group_name: "Stock",        label: "Availability",      value: "In stock",                                              sort_order: 40 },

    { group_name: "Dispatch",     label: "Lead time",         value: "Dispatched within 3 working days of order",             sort_order: 41 },
    { group_name: "Dispatch",     label: "UK delivery",       value: "Typical UK delivery within 5 working days",             sort_order: 42 },

    { group_name: "Use",          label: "Built for",         value: "Professional plasterers",                               sort_order: 50 },

    { group_name: "Build & care", label: "Made in",           value: "Yogyakarta, Indonesia — Hammerex factory",              sort_order: 60 },
    { group_name: "Build & care", label: "Warranty",          value: "1 year (manufacturing defects)",                        sort_order: 61 }
  ].map((s) => ({ ...s, product_id: id }));
  const { error } = await supabase.from("hammerex_product_specs").insert(specs);
  if (error) throw error;
  console.log(`✓ ${specs.length} specs inserted`);
}

// ---- 4. multi-buy deals (qty 2 = -10%, qty 3 = -15%) ----
{
  await supabase.from("hammerex_product_deals").delete().eq("product_id", id);
  const roundDown100 = (n) => Math.floor(n / 100) * 100;
  const qty2Total = roundDown100(base * 2 * 0.9);
  const qty3Total = roundDown100(base * 3 * 0.85);
  const deals = [
    {
      product_id: id,
      sort_order: 0,
      label: "Deal 1",
      qty: 2,
      name: `Buy 2 ${p.name}s`,
      price_idr: qty2Total,
      banner_url: p.image_url,
      icon_emoji: "?",
      description: null
    },
    {
      product_id: id,
      sort_order: 1,
      label: "Deal 2",
      qty: 3,
      name: `Buy 3 ${p.name}s`,
      price_idr: qty3Total,
      banner_url: p.image_url,
      icon_emoji: "??",
      description: null
    }
  ];
  const { error } = await supabase.from("hammerex_product_deals").insert(deals);
  if (error) throw error;
  console.log(`✓ multi-buy: qty2 @ ${qty2Total.toLocaleString()} IDR, qty3 @ ${qty3Total.toLocaleString()} IDR`);
}

console.log("\nDone. /product/trowel-leg-pouch should now mirror Plastering Pro Bag's PDP shape.");
