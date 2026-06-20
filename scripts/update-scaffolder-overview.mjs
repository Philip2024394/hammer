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

const overview = `Scaffolder's Setup — the working scaffolder's starter kit

A four-piece kit covering the tool belt, the spanner holder, the lanyard and the PPE — everything a scaffolder needs to start a shift.

What's in the kit:

• Hammerex Scaffolder's Tool Belt — rivet-reinforced multi-holder belt with steel buckle, multi-hole adjustment
• Hammerex Scaffolders Tilted Spanner Belt Holder — premium leather drop-station with tilted entry for one-handed access
• Hammerex Tool Lanyard 1.5m — strong tether for working at height
• Hammerex Hi-Visibility Safety Glasses — impact-resistant lens`;

const { error } = await supabase
  .from("hammerex_products")
  .update({ overview })
  .eq("slug", "scaffolders-setup-kit");
if (error) throw error;
console.log("✓ overview updated for scaffolders-setup-kit — no prices in copy");
