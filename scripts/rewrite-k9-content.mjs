import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SKU = "HX-K9-001";

const p = await s.from("hammerex_products").select("id").eq("sku", SKU).maybeSingle();
if (!p.data) throw new Error(SKU + " not found");
const id = p.data.id;

const overview = `The HAMMEREX K9 Plastering Tool Station is NOT a bag — it's a **solid-core tool station** with solid sides, solid base, and solid gables. Built for the plasterer who wants every blade protected and every tool in one place that survives the working day.

Holds 2 plastering trowels up to 18", plus 1 gable trowel — 14" recommended but longer trowels will fit. A window-bead level and a spatula knife for skimming sit alongside, with a 16" plastering hawk board in its own dedicated rigid compartment. A measure-tape clip and a gable pocket for hand tools take care of the everyday small kit.

The big one: the **large internal compartment is approximately 22" × 9" with open height**. People always ask what it can carry — we figured it out years ago: **if you can lift it, it will carry it**.

The carry handle is bolt-fixed (like the gables), with a **5 cm-wide handle** that puts the power and comfort exactly where your hand wants them. **Corner bolt-fixed construction** is why these things last on global markets long after a plasterer's trade years.

Wash it by hand or hit it with the power washer — the K9 jumps back ready for the next day.`;

const features = [
  { icon: "check", label: "SOLID-CORE construction — solid sides, base, and gables (it's not a bag)" },
  { icon: "check", label: "Holds 2 plastering trowels up to 18\"" },
  { icon: "check", label: "1 gable trowel — 14\" recommended, longer trowels fit" },
  { icon: "check", label: "Window-bead level + spatula skimming knife slots" },
  { icon: "check", label: "Dedicated 16\" plastering hawk board compartment" },
  { icon: "check", label: "Measure-tape clip — quick access, no rummaging" },
  { icon: "check", label: "Gable pocket for hand tools and small kit" },
  { icon: "check", label: "Large internal compartment ~22\" × 9\" with OPEN height" },
  { icon: "check", label: "Carry capacity: if you can lift it, it will carry it" },
  { icon: "check", label: "Bolt-fixed carry handle — 5 cm wide for power + comfort" },
  { icon: "check", label: "Corner bolt-fixed construction — outlasts a plasterer's trade years" },
  { icon: "check", label: "Hand-washable OR power-washable — jumps back ready for the next day" }
];

const upd = await s.from("hammerex_products").update({
  overview,
  description: "Solid-core plastering tool station — not a bag. 3 trowels + hawk + level + spatula + measure tape, 22×9 open-height main compartment, bolt-fixed handle and corners, hand or power washable. Free UK delivery.",
  features,
  subtitle: "K9 PLASTERING TOOL STATION · SOLID-CORE · 3 TROWELS + 16\" HAWK"
}).eq("id", id);
if (upd.error) throw upd.error;
console.log("✓ overview + features + subtitle rewritten");

// Replace specs with accurate ones
await s.from("hammerex_product_specs").delete().eq("product_id", id);
const specs = [
  { group_name: "Capacity",   label: "Side trowels",        value: "2 × up to 18\" plastering trowels",                          sort_order: 0 },
  { group_name: "Capacity",   label: "Gable trowel",        value: "1 × 14\" recommended (longer trowels will fit)",             sort_order: 1 },
  { group_name: "Capacity",   label: "Hawk board",          value: "1 × 16\" plastering hawk — rigid dedicated compartment",     sort_order: 2 },
  { group_name: "Capacity",   label: "Window-bead level",   value: "Dedicated holder",                                            sort_order: 3 },
  { group_name: "Capacity",   label: "Spatula skim knife",  value: "Dedicated slot",                                              sort_order: 4 },
  { group_name: "Capacity",   label: "Measure tape",        value: "Clip — quick access",                                         sort_order: 5 },
  { group_name: "Capacity",   label: "Gable pocket",        value: "Hand tools + small kit",                                      sort_order: 6 },
  { group_name: "Capacity",   label: "Main compartment",    value: "~22\" × 9\" × OPEN height — if you can lift it, it'll carry it", sort_order: 7 },
  { group_name: "Construction", label: "Body",              value: "SOLID-CORE — solid sides, solid base, solid gables",         sort_order: 10 },
  { group_name: "Construction", label: "Handle",            value: "Bolt-fixed · 5 cm wide for power + comfort",                  sort_order: 11 },
  { group_name: "Construction", label: "Corners",           value: "Bolt-fixed — outlasts trade years",                           sort_order: 12 },
  { group_name: "Construction", label: "Cleaning",          value: "Hand-washable OR power-washable — jumps back ready",          sort_order: 13 },
  { group_name: "Pricing",    label: "Single unit",         value: "£188.00 with FREE UK delivery",                               sort_order: 30 },
  { group_name: "Pricing",    label: "Bulk discounts",      value: "Buy 2 -10% · Buy 3 -15%",                                     sort_order: 31 },
  { group_name: "Stock",      label: "Availability",        value: "In stock",                                                    sort_order: 40 },
  { group_name: "Dispatch",   label: "Lead time",           value: "Dispatched within 48 hours",                                  sort_order: 41 },
  { group_name: "Dispatch",   label: "UK delivery",         value: "Free UK delivery — typically 5–6 working days transit",       sort_order: 42 },
  { group_name: "Dispatch",   label: "Other countries",     value: "+£10 air freight · confirmed on WhatsApp at checkout",        sort_order: 43 },
  { group_name: "Use",        label: "Built for",           value: "Professional plasterers · renderers · finish trades",         sort_order: 50 },
  { group_name: "Build & care", label: "Made in",           value: "Yogyakarta, Indonesia — Hammerex factory",                    sort_order: 60 },
  { group_name: "Build & care", label: "Warranty",          value: "1 year (manufacturing defects)",                              sort_order: 61 }
];
const sIns = await s.from("hammerex_product_specs").insert(specs.map((r) => ({ ...r, product_id: id })));
if (sIns.error) throw sIns.error;
console.log(`✓ ${specs.length} specs rewritten`);
