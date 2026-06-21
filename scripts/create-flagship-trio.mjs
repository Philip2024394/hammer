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
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// 23,827 IDR per £ (FX in fx.ts). Prices rounded to nearest 100 for clean display.
const GBP = 23827;
const r100 = (n) => Math.floor(n / 100) * 100;
const idr = (gbp) => r100(gbp * GBP);

const PLASTERING_CAT_ID = "2f530c24-d55a-4e0c-83ec-4b63dbecba82";
const DRYWALL_CAT_ID = "6616b4c7-df34-443a-9b37-e09e6b517dd9";

const PLACEHOLDER_IMG = "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png";

const TIERS = [{ min: 2, pct: 10 }, { min: 3, pct: 15 }];

async function upsertSpecs(productId, rows) {
  await s.from("hammerex_product_specs").delete().eq("product_id", productId);
  if (rows.length) {
    const out = rows.map((r) => ({ ...r, product_id: productId }));
    const ins = await s.from("hammerex_product_specs").insert(out);
    if (ins.error) throw ins.error;
  }
}

async function upsertWhatInBox(productId, rows) {
  await s.from("hammerex_what_in_box").delete().eq("product_id", productId);
  if (rows.length) {
    const out = rows.map((r) => ({ ...r, product_id: productId }));
    const ins = await s.from("hammerex_what_in_box").insert(out);
    if (ins.error) throw ins.error;
  }
}

async function upsertDeals(productId, productImage, name, priceIdr) {
  await s.from("hammerex_product_deals").delete().eq("product_id", productId);
  const qty2 = r100(priceIdr * 2 * 0.9);
  const qty3 = r100(priceIdr * 3 * 0.85);
  const ins = await s.from("hammerex_product_deals").insert([
    {
      product_id: productId, sort_order: 0, label: "Deal 1", qty: 2,
      name: `Buy 2 ${name}`, price_idr: qty2,
      banner_url: productImage, icon_emoji: "?", description: null
    },
    {
      product_id: productId, sort_order: 1, label: "Deal 2", qty: 3,
      name: `Buy 3 ${name}`, price_idr: qty3,
      banner_url: productImage, icon_emoji: "??", description: null
    }
  ]);
  if (ins.error) throw ins.error;
  console.log(`  · multi-buy: qty2 ${qty2.toLocaleString()} (~£${(qty2/GBP).toFixed(2)}) · qty3 ${qty3.toLocaleString()} (~£${(qty3/GBP).toFixed(2)})`);
}

// ───────────────────────────────────────────────────────────────────────
// 1) Refresh the existing PBP-001 to "Hammerex Plasterer's Backpack" £96
// ───────────────────────────────────────────────────────────────────────
{
  const pbpRow = await s.from("hammerex_products").select("id,image_url").eq("sku", "HX-PBP-001").maybeSingle();
  if (!pbpRow.data) throw new Error("HX-PBP-001 missing — abort.");
  const pbpId = pbpRow.data.id;
  const pbpImg = pbpRow.data.image_url ?? PLACEHOLDER_IMG;
  const pbpPrice = idr(96); // £96.00 → 2,287,300 IDR

  const overview = `The HAMMEREX Plasterer's Backpack is the canonical plastering bag — twin industrial-thread stitching, water-resistant fiber faux-leather body with genuine leather brown panels, construction-tested zippers.

Built around four trowels and a hawk: two 16" trowels in the front compartments, two 18" trowels in the side outer pockets, and an 18" plastering hawk in the dedicated rear slot. A large internal compartment holds your skim rule, spatulas, mixer paddle, gloves and PPE.

After 12 years on UK sites, we now sell it direct from the Yogyakarta factory — same product, same factory, no distributor markup.`;

  const features = [
    { icon: "check", label: "Holds 4 trowels — 2× 16\" front + 2× 18\" side outer" },
    { icon: "check", label: "Rear plastering hawk slot — fits hawks up to 18\"" },
    { icon: "check", label: "Large internal compartment for skim rule, spatulas, hand tools" },
    { icon: "check", label: "Water-resistant fiber faux-leather body" },
    { icon: "check", label: "Genuine leather brown panels — wear-resistant where it matters" },
    { icon: "check", label: "Twin industrial-thread stitching" },
    { icon: "check", label: "Construction-tested zippers" },
    { icon: "check", label: "Backpack carry — both hands free between jobs" },
    { icon: "check", label: "12 years of UK trade — now direct from the factory" }
  ];

  const purchase_notes = [
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "FREE UK delivery via EMS — typical 5–6 days transit.",
    "Outside the UK: flat +£10 air freight, 5–6 days transit.",
    "In stock — dispatched within 48 hours.",
    "Trade & bulk pricing available — message us via the Partners page."
  ];

  const upd = await s.from("hammerex_products").update({
    name: "Hammerex Plasterer's Backpack",
    sku: "HX-PBP-001",
    model_number: "HX-PBP",
    brand: "Hammerex",
    price_idr: pbpPrice,
    shipping_per_unit_idr: 0,
    base_currency: "GBP",
    warranty_years: 1,
    dispatch_lead_days: 3,
    country_of_assembly: "Yogyakarta, Indonesia — Hammerex factory",
    overview,
    description: "The canonical Hammerex plastering backpack — 4 trowels, 18\" hawk, twin industrial-thread stitching. Direct from the factory.",
    features,
    subtitle: "PLASTERER'S BACKPACK · 4 TROWELS + HAWK",
    badge_label: "Direct from factory",
    qty_discount_tiers: TIERS,
    purchase_notes,
    is_featured: true,
    compare_with: ["k9-plastering-tool-station", "plastering-caddy"]
  }).eq("id", pbpId);
  if (upd.error) throw upd.error;
  console.log(`✓ HX-PBP-001 refreshed → Plasterer's Backpack @ £96 (${pbpPrice.toLocaleString()} IDR)`);

  await upsertSpecs(pbpId, [
    { group_name: "Capacity", label: "Front trowels",        value: "2 × 16\" trowel slots — front compartments",                sort_order: 0 },
    { group_name: "Capacity", label: "Side trowels",         value: "2 × 18\" trowel slots — side outer pockets",                sort_order: 1 },
    { group_name: "Capacity", label: "Hawk",                 value: "Rear hawk slot — fits plastering hawks up to 18\"",         sort_order: 2 },
    { group_name: "Capacity", label: "Internal compartment", value: "Large interior — skim rule, spatulas, mixer paddle, PPE",    sort_order: 3 },
    { group_name: "Material", label: "Body",                 value: "Water-resistant fiber faux-leather",                          sort_order: 10 },
    { group_name: "Material", label: "Trim",                 value: "Genuine leather brown panels at wear points",                 sort_order: 11 },
    { group_name: "Material", label: "Stitching",            value: "Twin industrial-thread construction",                         sort_order: 12 },
    { group_name: "Material", label: "Zippers",              value: "Construction-tested",                                         sort_order: 13 },
    { group_name: "Design",   label: "Carry",                value: "Backpack straps — hands-free between jobs",                   sort_order: 20 },
    { group_name: "Pricing",  label: "Single unit",          value: "£96.00 with FREE UK delivery",                                sort_order: 30 },
    { group_name: "Pricing",  label: "Bulk discounts",       value: "Buy 2 -10% · Buy 3 -15%",                                     sort_order: 31 },
    { group_name: "Stock",    label: "Availability",         value: "In stock",                                                    sort_order: 40 },
    { group_name: "Dispatch", label: "Lead time",            value: "Dispatched within 48 hours",                                  sort_order: 41 },
    { group_name: "Dispatch", label: "UK delivery",          value: "Free UK delivery — typically 5–6 working days transit",       sort_order: 42 },
    { group_name: "Dispatch", label: "Other countries",      value: "+£10 air freight · confirmed on WhatsApp at checkout",        sort_order: 43 },
    { group_name: "Use",      label: "Built for",            value: "Professional plasterers · renderers · skim & finish",         sort_order: 50 },
    { group_name: "Build & care", label: "Made in",          value: "Yogyakarta, Indonesia — Hammerex factory",                    sort_order: 60 },
    { group_name: "Build & care", label: "Warranty",         value: "1 year (manufacturing defects)",                              sort_order: 61 }
  ]);

  await upsertWhatInBox(pbpId, [
    { label: "1 — Hammerex Plasterer's Backpack", qty: 1, image_url: pbpImg, sort_order: 0 }
  ]);

  await upsertDeals(pbpId, pbpImg, "Plasterer's Backpacks", pbpPrice);
}

// ───────────────────────────────────────────────────────────────────────
// 2) K9 Plastering Tool Station £188
// ───────────────────────────────────────────────────────────────────────
async function createOrUpdate({
  sku, slug, name, model_number, categoryId, priceIdr, badge, subtitle,
  overview, features, specs, box, compareWith, image
}) {
  const existing = await s.from("hammerex_products").select("id,image_url").eq("sku", sku).maybeSingle();
  const data = {
    category_id: categoryId,
    name, slug, sku, model_number, brand: "Hammerex",
    price_idr: priceIdr,
    shipping_per_unit_idr: 0,
    image_url: existing.data?.image_url ?? image,
    base_currency: "GBP",
    warranty_years: 1,
    dispatch_lead_days: 3,
    country_of_assembly: "Yogyakarta, Indonesia — Hammerex factory",
    overview,
    description: overview.split("\n")[0],
    features,
    subtitle,
    badge_label: badge,
    qty_discount_tiers: TIERS,
    purchase_notes: [
      "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
      "FREE UK delivery via EMS — typical 5–6 days transit.",
      "Outside the UK: flat +£10 air freight, 5–6 days transit.",
      "In stock — dispatched within 48 hours.",
      "Trade & bulk pricing available — message us via the Partners page."
    ],
    is_featured: true,
    compare_with: compareWith
  };

  let id;
  if (existing.data) {
    const upd = await s.from("hammerex_products").update(data).eq("id", existing.data.id);
    if (upd.error) throw upd.error;
    id = existing.data.id;
    console.log(`✓ ${sku} updated → ${name}`);
  } else {
    const ins = await s.from("hammerex_products").insert(data).select("id").single();
    if (ins.error) throw ins.error;
    id = ins.data.id;
    console.log(`✓ ${sku} created → ${name}`);
  }

  await upsertSpecs(id, specs);
  await upsertWhatInBox(id, box.map((b) => ({ ...b, image_url: data.image_url })));
  await upsertDeals(id, data.image_url, name, priceIdr);
}

const K9_PRICE = idr(188);
await createOrUpdate({
  sku: "HX-K9-001",
  slug: "k9-plastering-tool-station",
  name: "Hammerex K9 Plastering Tool Station",
  model_number: "HX-K9",
  categoryId: PLASTERING_CAT_ID,
  priceIdr: K9_PRICE,
  badge: "Flagship",
  subtitle: "K9 PLASTERING TOOL STATION · 3 TROWELS + HAWK + LEVEL",
  image: PLACEHOLDER_IMG,
  overview: `The HAMMEREX K9 Plastering Tool Station is the flagship plastering carry — genuine leather, reinforced corners and top edges, fiber-flex certified washable lining safe for electric tools.

Built around a 20" interior with three trowel compartments: two side trowels up to 18" × 5" and a gable trowel up to 14" × 5". A dedicated hawk-board compartment fits hawks up to 18" × 18", and the spirit level or spatula pole fixes safely on the same side.

After 12 years on UK sites, we now sell it direct from the Yogyakarta factory — same product, same factory, no distributor markup.`,
  features: [
    { icon: "check", label: "Holds 3 plastering trowels — 2× 18\"×5\" side + 1× 14\"×5\" gable" },
    { icon: "check", label: "Plastering hawk compartment fits hawks up to 18\"×18\"" },
    { icon: "check", label: "Spirit level / spatula pole holder on the same side" },
    { icon: "check", label: "Inner compartment 20\" × 10\" × 8\" (L × W × H)" },
    { icon: "check", label: "Fiber-flex certified washable lining — electric-tool safe" },
    { icon: "check", label: "Genuine leather body with reinforced corners + top edges" },
    { icon: "check", label: "Industrial sewn — built for daily site abuse" },
    { icon: "check", label: "Carry handle + shoulder option for hands-free transit" },
    { icon: "check", label: "12 years of UK trade — now direct from the factory" }
  ],
  specs: [
    { group_name: "Capacity", label: "Side trowels",      value: "2 × 18\" × 5\" trowel slots",                        sort_order: 0 },
    { group_name: "Capacity", label: "Gable trowel",      value: "1 × 14\" × 5\" gable slot",                          sort_order: 1 },
    { group_name: "Capacity", label: "Hawk board",        value: "Dedicated compartment — up to 18\" × 18\"",          sort_order: 2 },
    { group_name: "Capacity", label: "Spirit level / pole", value: "Fixed safely on the hawk-side panel",              sort_order: 3 },
    { group_name: "Dimensions", label: "Inner length",    value: "20\"",                                               sort_order: 4 },
    { group_name: "Dimensions", label: "Inner width",     value: "10\"",                                               sort_order: 5 },
    { group_name: "Dimensions", label: "Inner height",    value: "8\"",                                                sort_order: 6 },
    { group_name: "Material",  label: "Body",             value: "Genuine leather, reinforced corners + top edges",    sort_order: 10 },
    { group_name: "Material",  label: "Lining",           value: "Fiber-flex certified washable — electric-tool safe", sort_order: 11 },
    { group_name: "Material",  label: "Construction",     value: "Industrial sewn — heavy-duty stitching",             sort_order: 12 },
    { group_name: "Pricing",   label: "Single unit",      value: "£188.00 with FREE UK delivery",                      sort_order: 30 },
    { group_name: "Pricing",   label: "Bulk discounts",   value: "Buy 2 -10% · Buy 3 -15%",                            sort_order: 31 },
    { group_name: "Stock",     label: "Availability",     value: "In stock",                                           sort_order: 40 },
    { group_name: "Dispatch",  label: "Lead time",        value: "Dispatched within 48 hours",                         sort_order: 41 },
    { group_name: "Dispatch",  label: "UK delivery",      value: "Free UK delivery — typically 5–6 working days transit", sort_order: 42 },
    { group_name: "Dispatch",  label: "Other countries",  value: "+£10 air freight · confirmed on WhatsApp at checkout", sort_order: 43 },
    { group_name: "Use",       label: "Built for",        value: "Professional plasterers · renderers · finish trades", sort_order: 50 },
    { group_name: "Build & care", label: "Made in",       value: "Yogyakarta, Indonesia — Hammerex factory",            sort_order: 60 },
    { group_name: "Build & care", label: "Warranty",      value: "1 year (manufacturing defects)",                      sort_order: 61 }
  ],
  box: [{ label: "1 — Hammerex K9 Plastering Tool Station", qty: 1, sort_order: 0 }],
  compareWith: ["plastering-backpack", "plastering-caddy", "k11-drywall-tool-station"]
});

// ───────────────────────────────────────────────────────────────────────
// 3) K11 Drywall Tool Station £188
// ───────────────────────────────────────────────────────────────────────
await createOrUpdate({
  sku: "HX-K11-001",
  slug: "k11-drywall-tool-station",
  name: "Hammerex K11 Drywall Tool Station",
  model_number: "HX-K11",
  categoryId: DRYWALL_CAT_ID,
  priceIdr: idr(188),
  badge: "Flagship",
  subtitle: "K11 DRYWALL TOOL STATION · 5 KNIFE ROWS + MUD PAN + HAWK",
  image: PLACEHOLDER_IMG,
  overview: `The HAMMEREX K11 Drywall Tool Station is the flagship drywall carry — genuine leather body, solid frame with aluminium edge protectors, stainless steel upper edges and corners, solid core with reinforced aluminium base.

Built for tapers and finishers: five rows of drywall knives (each 18" long), a 16" mud-pan compartment, room for a plastering trowel up to 18" and a hawk up to 18", plus a skim-rule / spatula blade position over the trowel. Shoulder strap and grab handle for between-stations transit.

External dimensions 520 × 250 × 380 mm. After 12 years on UK sites, we now sell it direct from the Yogyakarta factory — same product, same factory, no distributor markup.`,
  features: [
    { icon: "check", label: "5 rows of drywall knives — each 18\" long" },
    { icon: "check", label: "Mud-pan compartment — fits a 16\" mud pan" },
    { icon: "check", label: "Plastering trowel slot — up to 18\"" },
    { icon: "check", label: "Plastering hawk slot — up to 18\"" },
    { icon: "check", label: "Skim rule / spatula blade position over the trowel" },
    { icon: "check", label: "External dimensions 520 × 250 × 380 mm (L × W × H)" },
    { icon: "check", label: "Solid frame with aluminium edge protectors" },
    { icon: "check", label: "Stainless steel upper edges + corners" },
    { icon: "check", label: "Solid core + reinforced aluminium base" },
    { icon: "check", label: "Carry shoulder strap + grab handle" },
    { icon: "check", label: "12 years of UK trade — now direct from the factory" }
  ],
  specs: [
    { group_name: "Capacity", label: "Drywall knives",   value: "5 rows · each 18\" long",                            sort_order: 0 },
    { group_name: "Capacity", label: "Mud pan",          value: "Dedicated compartment · 16\"",                       sort_order: 1 },
    { group_name: "Capacity", label: "Plastering trowel", value: "Slot fits trowels up to 18\"",                       sort_order: 2 },
    { group_name: "Capacity", label: "Plastering hawk",  value: "Slot fits hawks up to 18\"",                          sort_order: 3 },
    { group_name: "Capacity", label: "Skim rule / spatula", value: "Position over the plastering trowel",              sort_order: 4 },
    { group_name: "Dimensions", label: "Length",         value: "520 mm",                                              sort_order: 5 },
    { group_name: "Dimensions", label: "Width",          value: "250 mm",                                              sort_order: 6 },
    { group_name: "Dimensions", label: "Height",         value: "380 mm",                                              sort_order: 7 },
    { group_name: "Material",  label: "Body",            value: "Genuine leather",                                     sort_order: 10 },
    { group_name: "Material",  label: "Frame",           value: "Solid frame with aluminium edge protectors",          sort_order: 11 },
    { group_name: "Material",  label: "Upper edges",     value: "Stainless steel edges + corners",                     sort_order: 12 },
    { group_name: "Material",  label: "Base",            value: "Solid core + reinforced aluminium",                   sort_order: 13 },
    { group_name: "Design",   label: "Carry",            value: "Shoulder strap + grab handle",                        sort_order: 20 },
    { group_name: "Pricing",  label: "Single unit",      value: "£188.00 with FREE UK delivery",                       sort_order: 30 },
    { group_name: "Pricing",  label: "Bulk discounts",   value: "Buy 2 -10% · Buy 3 -15%",                             sort_order: 31 },
    { group_name: "Stock",    label: "Availability",     value: "In stock",                                            sort_order: 40 },
    { group_name: "Dispatch", label: "Lead time",        value: "Dispatched within 48 hours",                          sort_order: 41 },
    { group_name: "Dispatch", label: "UK delivery",      value: "Free UK delivery — typically 5–6 working days transit", sort_order: 42 },
    { group_name: "Dispatch", label: "Other countries",  value: "+£10 air freight · confirmed on WhatsApp at checkout", sort_order: 43 },
    { group_name: "Use",      label: "Built for",        value: "Drywall tapers · finishers · plasterer-renderer crossover", sort_order: 50 },
    { group_name: "Build & care", label: "Made in",      value: "Yogyakarta, Indonesia — Hammerex factory",             sort_order: 60 },
    { group_name: "Build & care", label: "Warranty",     value: "1 year (manufacturing defects)",                       sort_order: 61 }
  ],
  box: [{ label: "1 — Hammerex K11 Drywall Tool Station", qty: 1, sort_order: 0 }],
  compareWith: ["k9-plastering-tool-station", "plastering-backpack", "plastering-pro-bag"]
});

console.log("\nDone. Live URLs (after 60s ISR refresh):");
console.log("  /product/plastering-backpack       → Hammerex Plasterer's Backpack");
console.log("  /product/k9-plastering-tool-station → Hammerex K9 Plastering Tool Station");
console.log("  /product/k11-drywall-tool-station  → Hammerex K11 Drywall Tool Station");
