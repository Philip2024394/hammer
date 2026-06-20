import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "measure-tape-belt-holder";
const HERO = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2006_09_59%20AM.png?updatedAt=1781910619213";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Canonical thumbnail / hero
const up1 = await s.from("hammerex_products").update({ image_url: HERO }).eq("id", id);
if (up1.error) throw up1.error;
console.log("✓ product.image_url updated");

// First gallery row
const m = await s.from("hammerex_product_media").select("id").eq("product_id", id).eq("kind", "image").order("sort_order").limit(1).maybeSingle();
if (m.data) {
  const up2 = await s.from("hammerex_product_media").update({ url: HERO }).eq("id", m.data.id);
  if (up2.error) throw up2.error;
  console.log("✓ hero gallery row replaced");
} else {
  const ins = await s.from("hammerex_product_media").insert({
    product_id: id, kind: "image", url: HERO,
    alt: "HAMMEREX Measure Tape Belt Holder — hero shot",
    sort_order: 0
  });
  if (ins.error) throw ins.error;
  console.log("✓ hero gallery row inserted");
}
