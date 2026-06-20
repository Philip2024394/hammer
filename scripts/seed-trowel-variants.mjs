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

const SLUG = "trowel-leg-pouch";
const COMBO_IMAGE = "https://ik.imagekit.io/9mrgsv2rp/Untitledsdasdadsaasd-removebg-preview.png?updatedAt=1781810397073";

const r = await supabase.from("hammerex_products").select("id, image_url, price_idr").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("trowel-leg-pouch not found");
const id = r.data.id;
const pouchImage = r.data.image_url;

// ---- 1. sizes ----
{
  const { error } = await supabase
    .from("hammerex_products")
    .update({ sizes: ["14\"", "16\"", "18\""] })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ sizes set: 14\", 16\", 18\"");
}

// ---- 2. variants (replace existing) ----
{
  await supabase.from("hammerex_product_variants").delete().eq("product_id", id);
  const variants = [
    {
      product_id: id,
      label: "Pouch only",
      sku: "HX-TLP-001",
      price_idr: 905426,
      image_url: pouchImage,
      stock_count: null,
      sort_order: 0,
      is_default: true
    },
    {
      product_id: id,
      label: "Pouch + Leather Belt",
      sku: "HX-TLP-002",
      price_idr: 1143696,
      image_url: COMBO_IMAGE,
      stock_count: null,
      sort_order: 1,
      is_default: false
    }
  ];
  const { error } = await supabase.from("hammerex_product_variants").insert(variants);
  if (error) throw error;
  console.log("✓ 2 variants inserted: Pouch only (£38) default, Pouch + Leather Belt (£48)");
}

// ---- 3. what's in box — add combo row, relabel option 1 ----
{
  await supabase.from("hammerex_what_in_box").delete().eq("product_id", id);
  const rows = [
    {
      product_id: id,
      label: "Option 1 — Trowel Leg Pouch (14\", 16\" or 18\")",
      qty: 1,
      image_url: pouchImage,
      sort_order: 0
    },
    {
      product_id: id,
      label: "Option 2 — Trowel Leg Pouch + Leather Belt (fits up to 40\" waist)",
      qty: 1,
      image_url: COMBO_IMAGE,
      sort_order: 1
    }
  ];
  const { error } = await supabase.from("hammerex_what_in_box").insert(rows);
  if (error) throw error;
  console.log("✓ what's-in-box: 2 rows (Option 1 pouch, Option 2 pouch + belt)");
}

// ---- 4. update specs: replace Trowel sizes line + Pricing single-unit ----
{
  // Refresh just the spec rows whose values are stale now that the combo exists.
  // Capacity / Trowel sizes already says "Available in 14\", 16\" and 18\"" — that still holds.
  // Pricing / Single unit needs to reflect both options now.
  const { error } = await supabase
    .from("hammerex_product_specs")
    .update({ value: "£38.00 pouch only · £48.00 with leather belt (indicative)" })
    .eq("product_id", id)
    .eq("group_name", "Pricing")
    .eq("label", "Single unit");
  if (error) throw error;
  console.log("✓ Pricing/Single-unit spec updated to reflect both options");
}

console.log("\nDone.");
