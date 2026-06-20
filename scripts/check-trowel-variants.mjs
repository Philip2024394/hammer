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

const r = await supabase.from("hammerex_products").select("id").eq("slug", "trowel-leg-pouch").maybeSingle();
const vr = await supabase.from("hammerex_product_variants").select("*").eq("product_id", r.data.id).order("sort_order");
for (const v of vr.data) {
  console.log({ label: v.label, sku: v.sku, price_idr: v.price_idr, image_url: v.image_url });
}
