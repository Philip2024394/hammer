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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const POUCH_BOX_IMAGE = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2002_33_25%20AM.png";

const r = await supabase.from("hammerex_products").select("id").eq("slug", "trowel-leg-pouch").maybeSingle();
if (!r.data) throw new Error("trowel-leg-pouch not found");

const { error } = await supabase
  .from("hammerex_what_in_box")
  .update({ image_url: POUCH_BOX_IMAGE })
  .eq("product_id", r.data.id)
  .eq("sort_order", 0);
if (error) throw error;
console.log("✓ Option 1 (pouch-only) what's-in-box image updated");
