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

// 1. Find the Electrician Pro Pouch and its category
const epp = await supabase.from("hammerex_products").select("id, category_id, name").eq("slug", "electrician-pro-pouch").maybeSingle();
console.log("Electrician Pro Pouch:", epp.data);

// 2. Find other electrician-related products to compare against
const sibs = await supabase
  .from("hammerex_products")
  .select("slug, name, category_id, price_idr")
  .or("slug.ilike.%electrician%,slug.ilike.%sling%bag%,slug.ilike.%electrical%")
  .neq("slug", "electrician-pro-pouch");
console.log("Sibling candidates:");
for (const p of sibs.data ?? []) console.log("  ", p.slug, "|", p.name, "|", p.price_idr, "IDR");

// 3. Also peek at same-category siblings
if (epp.data?.category_id) {
  const cat = await supabase
    .from("hammerex_products")
    .select("slug, name, price_idr")
    .eq("category_id", epp.data.category_id)
    .neq("slug", "electrician-pro-pouch")
    .limit(8);
  console.log("Same-category siblings:");
  for (const p of cat.data ?? []) console.log("  ", p.slug, "|", p.name, "|", p.price_idr, "IDR");
}
