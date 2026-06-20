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
const THIRD = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2004_33_18%20AM.png";

const p = await s.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error(`${SLUG} not found`);
const id = p.data.id;

const max = await s.from("hammerex_product_media").select("sort_order").eq("product_id", id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
const nextSort = (max.data?.sort_order ?? -1) + 1;

const ins = await s.from("hammerex_product_media").insert({
  product_id: id,
  kind: "image",
  url: THIRD,
  alt: "HAMMEREX Electrician Bag Sling — additional view",
  sort_order: nextSort
});
if (ins.error) throw ins.error;
console.log(`✓ third image inserted at sort_order ${nextSort}`);
