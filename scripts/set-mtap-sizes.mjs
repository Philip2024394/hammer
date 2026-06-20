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
const SIZES = ["5m", "7.5m", "8m", "10m"];

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Setting sizes triggers the SizeSelector + the flash-red behaviour on
// Add-to-cart / Buy-now when no size is picked (BuyColumn already wires
// this via sizes.length && !size → setSizeError(true)).
const upd = await s.from("hammerex_products").update({ sizes: SIZES }).eq("id", id);
if (upd.error) throw upd.error;
console.log(`✓ sizes set: ${SIZES.join(", ")}`);

// Refresh the capacity spec so it reflects the four-size offer rather than
// the old "up to 8m" line.
const specs = await s.from("hammerex_product_specs").select("id,group_name,label").eq("product_id", id);
let touched = false;
for (const row of specs.data ?? []) {
  if (row.group_name === "Capacity" || row.label?.toLowerCase().includes("tape")) {
    await s.from("hammerex_product_specs").update({
      value: "Sized for tape measures: 5m, 7.5m, 8m, 10m — pick yours at checkout."
    }).eq("id", row.id);
    touched = true;
  }
}
if (!touched) {
  await s.from("hammerex_product_specs").insert({
    product_id: id, group_name: "Capacity", label: "Tape size",
    value: "Sized for tape measures: 5m, 7.5m, 8m, 10m — pick yours at checkout.",
    sort_order: 0
  });
  console.log("✓ Capacity / Tape size spec row inserted");
} else {
  console.log("✓ Capacity / tape spec row refreshed");
}
