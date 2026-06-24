// Adds SEA-specific pricing columns to hammerex_products and hammerex_product_variants.
//   price_idr_sea     INTEGER NOT NULL DEFAULT 0    — SEA-facing price in IDR (0 = "Quoted at checkout")
//   free_shipping_sea BOOLEAN NOT NULL DEFAULT false — display-only free-shipping flag for ID/MY/VN visitors
// SEA = {ID, MY, VN}. Existing price_idr stays as the canonical for UK/RoW (admin enters in GBP, server converts).
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.tools.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const REF = env.HAMMEREX_NEW_PROJECT_REF;
if (!TOKEN || !REF) throw new Error("Missing SUPABASE_ACCESS_TOKEN or HAMMEREX_NEW_PROJECT_REF in .env.tools.local");

const SQL = `
ALTER TABLE hammerex_products
  ADD COLUMN IF NOT EXISTS price_idr_sea integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_shipping_sea boolean NOT NULL DEFAULT false;

ALTER TABLE hammerex_product_variants
  ADD COLUMN IF NOT EXISTS price_idr_sea integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN hammerex_products.price_idr_sea IS
  'SEA-only price in IDR. Shown to ID/MY/VN visitors (MY/VN see it FX-converted). 0 = Quoted at checkout. Admin sets per product.';
COMMENT ON COLUMN hammerex_products.free_shipping_sea IS
  'Display-only free-shipping flag for ID/MY/VN visitors. Does not affect UK shipping logic.';
COMMENT ON COLUMN hammerex_product_variants.price_idr_sea IS
  'Variant-level SEA override. 0 = use parent product price_idr_sea.';
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: SQL })
});
const text = await res.text();
if (!res.ok) {
  console.error("Migration failed:", res.status, text);
  process.exit(1);
}
console.log("✓ Migration applied:");
console.log(text);
