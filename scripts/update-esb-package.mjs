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
const PACKAGE_IMG = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2005_58_41%20AM.png";
const PRODUCT_IMG = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2005_57_18%20AM.png";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Collapse what's-in-box into a single "package" row that pictures the
// wrapped package and names both items as the contents.
await s.from("hammerex_what_in_box").delete().eq("product_id", id);
const boxIns = await s.from("hammerex_what_in_box").insert({
  product_id: id,
  label: "1 — Hammerex Electrician Sling Bag + Adjustable Shoulder Strap",
  qty: 1,
  image_url: PACKAGE_IMG,
  sort_order: 0
});
if (boxIns.error) throw boxIns.error;
console.log("✓ in-the-package collapsed to single row with package image");

// Use the cleaner product shot as the canonical product image (replaces
// the banner-style thumbnail used in grids).
const upm = await s.from("hammerex_products").update({ image_url: PRODUCT_IMG }).eq("id", id);
if (upm.error) throw upm.error;
console.log("✓ product.image_url updated to the clean product shot");
