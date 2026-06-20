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
const id = r.data.id;

// what's-in-box row for Option 2 (sort_order 1) — update belt size
const { error } = await supabase
  .from("hammerex_what_in_box")
  .update({ label: "Option 2 — Trowel Leg Pouch + Leather Belt (fits up to 44\" waist)" })
  .eq("product_id", id)
  .eq("sort_order", 1);
if (error) throw error;
console.log("✓ what's-in-box Option 2: belt fit updated to 44\"");
