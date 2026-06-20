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

// Confirm the wallet slug first
const w = await supabase
  .from("hammerex_products")
  .select("slug, name")
  .ilike("slug", "%trowel-wallet%");
console.log("Candidates:", w.data);

const target = w.data?.find((p) => p.slug === "trowel-wallet") ?? w.data?.[0];
if (!target) throw new Error("No trowel wallet product found");

const { error } = await supabase
  .from("hammerex_products")
  .update({ compare_with: [target.slug] })
  .eq("slug", "trowel-leg-pouch");
if (error) throw error;
console.log(`✓ trowel-leg-pouch compare_with = ['${target.slug}']`);
