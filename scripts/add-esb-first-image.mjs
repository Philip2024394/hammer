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
const NEW_FIRST = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2004_29_02%20AM.png";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

// Bump every existing media row's sort_order up by 1 so we can insert at 0.
const existing = await s.from("hammerex_product_media").select("id,sort_order").eq("product_id", id).order("sort_order", { ascending: false });
if (existing.error) throw existing.error;
for (const row of existing.data ?? []) {
  const upd = await s.from("hammerex_product_media").update({ sort_order: row.sort_order + 1 }).eq("id", row.id);
  if (upd.error) throw upd.error;
}
console.log(`✓ shifted ${existing.data?.length ?? 0} existing media rows by +1`);

// Insert the new image at sort_order 0.
const ins = await s.from("hammerex_product_media").insert({
  product_id: id,
  kind: "image",
  url: NEW_FIRST,
  alt: "HAMMEREX Electrician Bag Sling — hero shot",
  sort_order: 0
});
if (ins.error) throw ins.error;
console.log("✓ new first image inserted");

// Update product.image_url to match (this is the canonical thumbnail).
const upm = await s.from("hammerex_products").update({ image_url: NEW_FIRST }).eq("id", id);
if (upm.error) throw upm.error;
console.log("✓ product.image_url updated to new first image");
