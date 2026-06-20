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

// £10 × 23,827 IDR/£ = 238,270 IDR per unit (matches the £20 = 476,540 pattern)
const NEW_SHIPPING_IDR = 238270;

const { error } = await supabase
  .from("hammerex_products")
  .update({ shipping_per_unit_idr: NEW_SHIPPING_IDR })
  .eq("slug", "trowel-leg-pouch");
if (error) throw error;
console.log(`✓ shipping_per_unit_idr → ${NEW_SHIPPING_IDR} IDR (£10) for trowel-leg-pouch`);
