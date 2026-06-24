import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

const SLUGS = [
  { brand_key: "xrated_logo", ik: "https://ik.imagekit.io/9mrgsv2rp/x%20rated%20trade%20asdasd.png" },
  { brand_key: "xrated_hero", ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2003_52_07%20AM.png" }
];

// Insert through a tiny temp DB to leverage the existing migration pipeline.
// Use hammerex_trade_off_listings as a parking lot: insert a tmp 'xrated-seed-asset' draft,
// stash the ImageKit URL, then run migrate_images + rewrite_urls.
// Simpler: just upload directly to product-images bucket from the IK URL.

for (const a of SLUGS) {
  console.log(`fetching ${a.ik}`);
  const r = await fetch(a.ik);
  if (!r.ok) { console.error(`fail ${a.brand_key}: ${r.status}`); continue; }
  const ext = a.ik.split(".").pop().split("?")[0] || "png";
  const buf = Buffer.from(await r.arrayBuffer());
  const path = `branding/${a.brand_key}.${ext}`;
  const up = await sb.storage.from("product-images").upload(path, buf, { contentType: "image/png", upsert: true });
  if (up.error) { console.error(`upload fail ${a.brand_key}: ${up.error.message}`); continue; }
  const pub = sb.storage.from("product-images").getPublicUrl(path);
  console.log(`✓ ${a.brand_key} → ${pub.data.publicUrl}`);
}
