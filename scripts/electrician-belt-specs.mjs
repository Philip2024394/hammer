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
const r = await supabase.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
const id = r.data.id;

// 1. Rename combo variant to reflect the actual nylon-canvas + chrome quick-release buckle
{
  const { error } = await supabase
    .from("hammerex_product_variants")
    .update({ label: "Pouch + Quick-Release Belt" })
    .eq("product_id", id)
    .eq("label", "Pouch + Leather Belt");
  if (error) throw error;
  console.log("✓ variant renamed: Pouch + Leather Belt → Pouch + Quick-Release Belt");
}

// 2. Add a "Belt details" spec group (or refresh if present)
{
  await supabase
    .from("hammerex_product_specs")
    .delete()
    .eq("product_id", id)
    .eq("group_name", "Belt details");

  const beltSpecs = [
    { label: "Material",       value: "Strong, durable nylon canvas rope — flexible and lightweight",  sort_order: 90 },
    { label: "Buckle",         value: "Anti-rust chrome iron · fast-release",                          sort_order: 91 },
    { label: "Buckle size",    value: "7 cm × 5 cm (L × W)",                                           sort_order: 92 },
    { label: "Strap length",   value: "~115 cm",                                                       sort_order: 93 },
    { label: "Total length",   value: "122 cm",                                                        sort_order: 94 },
    { label: "Width",          value: "3.8 cm",                                                        sort_order: 95 }
  ].map((s) => ({ ...s, product_id: id, group_name: "Belt details" }));

  const { error } = await supabase.from("hammerex_product_specs").insert(beltSpecs);
  if (error) throw error;
  console.log(`✓ ${beltSpecs.length} rows inserted under "Belt details" spec group`);
}

console.log("\nDone.");
