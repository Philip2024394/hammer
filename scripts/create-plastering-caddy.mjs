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

const PLASTERING_CAT_ID = "2f530c24-d55a-4e0c-83ec-4b63dbecba82";
const IMAGE_URL = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2002_28_39%20AM.png";
const SLUG = "plastering-caddy";
const BASE_IDR = 1048388; // £44

const overview = `Keep your plastering tools protected, organised, and job-site ready with the HAMMEREX Plastering 5 Trowel & Hawk Carry Caddy.

Designed specifically for professional plasterers, renderers, and tradespeople, this heavy-duty storage system safely carries and protects up to 5 plastering trowels while providing dedicated storage for a hawk board on the reverse side.

The main compartment securely accommodates most major trowel brands and styles, fitting blades up to 5" x 18" (125mm x 460mm), and holds smaller trowels without movement during transport. Individual retaining straps help prevent tool-on-tool contact, reducing blade damage and extending the working life of your finishing tools.

The rear storage section is designed to carry hawk boards up to 16" (400mm). Integrated elastic retention straps secure the hawk handle in place, preventing movement while transporting between jobs.

Manufactured using blade-resistant internal material and a durable leather outer skin, the HAMMEREX Carry Caddy provides superior protection against accidental blade contact while delivering long-lasting performance in demanding trade environments.

Package includes:
• 1 × HAMMEREX Plastering 5 Trowel & Hawk Carry Caddy

Tools shown in product imagery are for display purposes only and are not included.`;

const features = [
  { icon: "check", label: "Stores and protects up to 5 plastering trowels" },
  { icon: "check", label: "Fits most major trowel brands and styles" },
  { icon: "check", label: "Accommodates trowels up to 5\" × 18\" (125mm × 460mm)" },
  { icon: "check", label: "Securely holds smaller trowels with adjustable retention straps" },
  { icon: "check", label: "Rear compartment stores hawk boards up to 16\" (400mm)" },
  { icon: "check", label: "Elastic hawk-handle retention system" },
  { icon: "check", label: "Blade-resistant internal construction" },
  { icon: "check", label: "Durable leather outer skin" },
  { icon: "check", label: "Heavy-duty stitching and reinforced carry handle" },
  { icon: "check", label: "Ideal for transport, storage and protection of finishing tools" }
];

// Insert product
const existing = await supabase.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (existing.data) {
  console.log("⚠ product already exists, skipping insert. id:", existing.data.id);
  process.exit(0);
}

const ins = await supabase.from("hammerex_products").insert({
  category_id: PLASTERING_CAT_ID,
  name: "Hammerex Plastering 5 Trowel & Hawk Carry Caddy",
  slug: SLUG,
  sku: "HX-PCC-001",
  brand: "Hammerex",
  price_idr: BASE_IDR,
  shipping_per_unit_idr: 0,    // free UK delivery (non-UK +£10 handled at line level)
  image_url: IMAGE_URL,
  is_featured: true,
  is_accessory: false,
  base_currency: "GBP",
  warranty_years: 1,
  dispatch_lead_days: 3,
  overview,
  description: "Heavy-duty plastering caddy — protects 5 trowels + a hawk in transit. Blade-resistant inner, leather outer.",
  features,
  badge_label: "New",
  country_of_assembly: "Yogyakarta, Indonesia",
  compare_with: ["plastering-pro-bag", "plasterer-carry-bag"]
}).select("id").single();
if (ins.error) throw ins.error;
const id = ins.data.id;
console.log("✓ product created — id:", id);

// Specs (mirror Plastering Pro Bag group structure)
const specs = [
  { group_name: "Capacity",   label: "Trowels",      value: "Up to 5 plastering trowels",                                 sort_order: 0 },
  { group_name: "Capacity",   label: "Trowel size",  value: "Fits blades up to 5\" × 18\" (125mm × 460mm)",               sort_order: 1 },
  { group_name: "Capacity",   label: "Hawk board",   value: "Rear compartment fits hawks up to 16\" (400mm)",             sort_order: 2 },
  { group_name: "Capacity",   label: "Retention",    value: "Individual trowel straps + elastic hawk-handle retention",   sort_order: 3 },

  { group_name: "Material",   label: "Outer",        value: "Durable leather outer skin",                                 sort_order: 10 },
  { group_name: "Material",   label: "Inner",        value: "Blade-resistant internal layer",                             sort_order: 11 },
  { group_name: "Material",   label: "Closure",      value: "Fold-over protective flap with secure fastening",            sort_order: 12 },
  { group_name: "Material",   label: "Construction", value: "Heavy-duty stitching, reinforced carry handle",              sort_order: 13 },

  { group_name: "Pricing",    label: "Single unit",  value: "£44.00 with FREE UK delivery",                               sort_order: 30 },
  { group_name: "Pricing",    label: "Bulk discounts", value: "Buy 2 -10% · Buy 3 -15%",                                  sort_order: 31 },

  { group_name: "Stock",      label: "Availability", value: "In stock",                                                   sort_order: 40 },

  { group_name: "Dispatch",   label: "Lead time",    value: "Dispatched within 3 working days of order",                  sort_order: 41 },
  { group_name: "Dispatch",   label: "UK delivery",  value: "Free UK delivery — typically 5 working days transit",        sort_order: 42 },
  { group_name: "Dispatch",   label: "Other countries", value: "+£10 air freight · confirmed on WhatsApp at checkout",    sort_order: 43 },

  { group_name: "Use",        label: "Built for",    value: "Plastering, rendering, skimming and finishing trades",       sort_order: 50 },

  { group_name: "Build & care", label: "Made in",    value: "Yogyakarta, Indonesia — Hammerex factory",                   sort_order: 60 },
  { group_name: "Build & care", label: "Warranty",   value: "1 year (manufacturing defects)",                             sort_order: 61 }
].map((s) => ({ ...s, product_id: id }));
const sIns = await supabase.from("hammerex_product_specs").insert(specs);
if (sIns.error) throw sIns.error;
console.log(`✓ ${specs.length} specs inserted`);

// What's-in-box
const boxIns = await supabase.from("hammerex_what_in_box").insert({
  product_id: id,
  label: "1 — Hammerex Plastering 5 Trowel & Hawk Carry Caddy",
  qty: 1,
  image_url: IMAGE_URL,
  sort_order: 0
});
if (boxIns.error) throw boxIns.error;
console.log("✓ what's-in-box: 1 row");

// Multi-buy deals
const r100 = n => Math.floor(n / 100) * 100;
const qty2 = r100(BASE_IDR * 2 * 0.9);   // £79.20
const qty3 = r100(BASE_IDR * 3 * 0.85);  // £112.20
const dIns = await supabase.from("hammerex_product_deals").insert([
  {
    product_id: id, sort_order: 0, label: "Deal 1", qty: 2,
    name: "Buy 2 Plastering Caddies",
    price_idr: qty2, banner_url: IMAGE_URL, icon_emoji: "?", description: null
  },
  {
    product_id: id, sort_order: 1, label: "Deal 2", qty: 3,
    name: "Buy 3 Plastering Caddies",
    price_idr: qty3, banner_url: IMAGE_URL, icon_emoji: "??", description: null
  }
]);
if (dIns.error) throw dIns.error;
console.log(`✓ multi-buy: qty2 @ ${qty2.toLocaleString()} (-10%), qty3 @ ${qty3.toLocaleString()} (-15%)`);

console.log("\nDone. Live at /product/" + SLUG);
