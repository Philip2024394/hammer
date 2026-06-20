import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "electrician-sling-bag";
const BUY3_BANNER = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2005_43_10%20AM.png";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);

const upd = await s.from("hammerex_product_deals")
  .update({ banner_url: BUY3_BANNER })
  .eq("product_id", p.data.id)
  .eq("qty", 3);
if (upd.error) throw upd.error;
console.log("✓ Buy 3 deal banner set");
