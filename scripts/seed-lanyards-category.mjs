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

// ----- 1. Create the Lanyards tool-type category -----
const SCAFFOLDING_CATEGORY_ID = "a5aec617-78b3-4b88-9b99-78e1f11cd7d4";

let lanyardCat = await supabase.from("hammerex_categories").select("id, slug").eq("slug", "lanyards").maybeSingle();
if (!lanyardCat.data) {
  const ins = await supabase.from("hammerex_categories").insert({
    slug: "lanyards",
    name: "Lanyards",
    is_tool_type: true,
    sort_order: 406,
    image_url: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_50_49%20AM.png?updatedAt=1781833867780",
    card_image_url: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_50_49%20AM.png?updatedAt=1781833867780",
    card_show_label: true
  }).select("id, slug").single();
  lanyardCat = { data: ins.data };
  console.log("✓ created `lanyards` category:", ins.data.id);
} else {
  console.log("• `lanyards` category already exists:", lanyardCat.data.id);
}

const lanyardCategoryId = lanyardCat.data.id;

// ----- 2. Create 5 colour-variant lanyard products -----
const colors = [
  { value: "black",  label: "Black",  image: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_50_49%20AM.png?updatedAt=1781833867780" },
  { value: "orange", label: "Orange", image: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_47_26%20AM.png?updatedAt=1781833688966" },
  { value: "red",    label: "Red",    image: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_38_40%20AM.png?updatedAt=1781833148529" },
  { value: "green",  label: "Green",  image: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2008_37_11%20AM.png?updatedAt=1781833066629" },
  { value: "yellow", label: "Yellow", image: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2009_18_57%20AM.png" }
];

const overview = "Heavy-duty tool lanyard with an aluminium twist-lock carabiner at one end and an adjustable loop at the other. Premium nylon and elastic construction with stainless steel hardware — built to take real site abuse.\n\nTethers any belt-loop hand tool while you work at height; built for ironworkers, scaffolders, roofers, carpenters, climbers and campers.\n\nSpec: 90 cm relaxed / 120 cm extended · 2 cm cord · 6.8 kg max load · polyester, elastic, nylon, aluminium.";
const description = "Heavy-duty 90 cm tool lanyard with twist-lock aluminium carabiner. 6.8 kg max load.";

const productIds = [];
for (const c of colors) {
  const slug = `tool-lanyard-90cm-${c.value}`;
  let existing = await supabase.from("hammerex_products").select("id, slug").eq("slug", slug).maybeSingle();
  if (existing.data) {
    productIds.push(existing.data.id);
    console.log(`• ${slug} already exists — skipping insert, id=${existing.data.id}`);
    continue;
  }
  const ins = await supabase.from("hammerex_products").insert({
    category_id: SCAFFOLDING_CATEGORY_ID, // primary trade category
    name: `Hammerex Tool Lanyard 90 cm — ${c.label}`,
    slug,
    sku: `HX-LANYARD-${c.value.toUpperCase()}`,
    brand: "Hammerex",
    price_idr: 71481, // £3
    image_url: c.image,
    is_featured: false,
    is_accessory: true,
    base_currency: "GBP",
    warranty_years: 1,
    dispatch_lead_days: 3,
    overview,
    description,
    badge_label: "Lanyard",
    country_of_assembly: "Yogyakarta, Indonesia"
  }).select("id").single();
  if (ins.error) throw ins.error;
  productIds.push(ins.data.id);
  console.log(`✓ created ${slug} — id ${ins.data.id}`);
}

// ----- 3. Link to Lanyards tool-type via the trades junction -----
const existingLanyardIds = [
  "392d6b05-fece-4e41-b00e-5e052b852336", // Hammerex Tool Lanyard 1.5m
  "25b1cd77-fbfb-4977-a138-7926d49f55fb"  // HAMMEREX Tool Safety Lanyard 90cm
];
const allLanyardIds = [...productIds, ...existingLanyardIds];

for (let i = 0; i < allLanyardIds.length; i++) {
  const pid = allLanyardIds[i];
  const present = await supabase.from("hammerex_product_trades").select("product_id").eq("product_id", pid).eq("category_id", lanyardCategoryId).maybeSingle();
  if (present.data) {
    continue;
  }
  const link = await supabase.from("hammerex_product_trades").insert({
    product_id: pid,
    category_id: lanyardCategoryId,
    sort_order: i
  });
  if (link.error) throw link.error;
}
console.log(`✓ ${allLanyardIds.length} product(s) linked into the Lanyards tool-type category`);
console.log("\nDone.");
