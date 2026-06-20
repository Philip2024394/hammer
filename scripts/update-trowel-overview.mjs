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

const overview = `Designed for plasterers who demand durability and convenience on the job, our Trowel Leg Pouch keeps your trowel secure, protected, and always within reach.

Available in 14", 16" and 18" trowel sizes, each pouch is crafted using twin-layer construction for added strength and long-term durability. Stud-reinforced pressure points and pressure-glued seams stand up to the demands of daily site work, while the leg strap can be worn for jobs that need the trowel pinned to your thigh, or removed entirely when you'd rather carry the pouch by hand.

At the end of the day, hang the pouch in the back of your vehicle and your trowel rides home defect-free — no more nicks, dings or blade damage from knocking against other tools in transit.`;

const { error } = await supabase
  .from("hammerex_products")
  .update({ overview })
  .eq("slug", "trowel-leg-pouch");
if (error) throw error;
console.log("✓ overview updated for trowel-leg-pouch");
