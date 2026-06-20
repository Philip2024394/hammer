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

const { error } = await supabase
  .from("hammerex_products")
  .update({ compare_with: ["electrician-single-pouch-belt-slide", "electrician-double-pouch-belt-slide"] })
  .eq("slug", "electrician-pro-pouch");
if (error) throw error;
console.log("✓ Electrician Pro Pouch compare_with → Single + Double Pouch Belt Slides");
