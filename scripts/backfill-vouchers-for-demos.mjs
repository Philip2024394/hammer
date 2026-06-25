// One-off backfill — generate a Welcome Knife voucher for every demo-*
// Xrated Trades listing that doesn't already have one. Safe to re-run;
// listings that already have a voucher are skipped.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import crypto from "crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `XRATED-${out.slice(0, 4)}-${out.slice(4, 8)}`;
}

const listings = await sb
  .from("hammerex_trade_off_listings")
  .select("id, slug, display_name")
  .like("slug", "demo-%")
  .order("created_at", { ascending: true });

if (listings.error) {
  console.error("Failed to load demo listings:", listings.error);
  process.exit(1);
}

console.log(`Found ${listings.data.length} demo listings.`);

const existing = await sb
  .from("hammerex_xrated_vouchers")
  .select("listing_id, code")
  .in("listing_id", listings.data.map((l) => l.id));

if (existing.error) {
  console.error("Failed to load existing vouchers:", existing.error);
  process.exit(1);
}

const have = new Map(existing.data.map((v) => [v.listing_id, v.code]));

let issued = 0;
let skipped = 0;
for (const l of listings.data) {
  if (have.has(l.id)) {
    console.log(`SKIP  ${l.slug.padEnd(48)}  already has ${have.get(l.id)}`);
    skipped++;
    continue;
  }
  let inserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const ins = await sb
      .from("hammerex_xrated_vouchers")
      .insert({
        listing_id: l.id,
        code,
        product_slug: "folding-safety-cutting-knife"
      })
      .select("code")
      .maybeSingle();
    if (ins.data) {
      console.log(`OK    ${l.slug.padEnd(48)}  ${ins.data.code}  (${l.display_name})`);
      issued++;
      inserted = true;
      break;
    }
    if (ins.error?.code !== "23505") {
      console.error(`FAIL  ${l.slug}:`, ins.error);
      break;
    }
    // 23505 = unique violation — retry with a fresh code.
  }
  if (!inserted) {
    console.error(`Could not insert voucher for ${l.slug} after retries.`);
  }
}

console.log(`\nDone. Issued ${issued}, skipped ${skipped}.`);
