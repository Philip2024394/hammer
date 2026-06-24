import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

const HEROES = [
  { slug: "electrician",   ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_33_47%20AM.png" },
  { slug: "plasterer",     ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_35_30%20AM.png" },
  { slug: "drywaller",     ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_40_51%20AM.png" },
  { slug: "stonemason",    ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_44_18%20AM.png" },
  { slug: "plumber",       ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_50_04%20AM.png" },
  { slug: "general-builder", ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_54_56%20AM.png" },
  { slug: "bricklayer",    ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_56_15%20AM.png" },
  { slug: "scaffolder",    ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2005_59_05%20AM.png" }
];

const out = {};
for (const h of HEROES) {
  console.log(`fetching ${h.slug}...`);
  const r = await fetch(h.ik);
  if (!r.ok) { console.error(`  fail ${r.status}`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  const path = `branding/trade-hero-${h.slug}.png`;
  const up = await sb.storage.from("product-images").upload(path, buf, { contentType: "image/png", upsert: true });
  if (up.error) { console.error(`  upload fail: ${up.error.message}`); continue; }
  const pub = sb.storage.from("product-images").getPublicUrl(path);
  out[h.slug] = pub.data.publicUrl;
  console.log(`  ✓ ${h.slug} → ${pub.data.publicUrl}`);
}
console.log("\nFINAL MAP:");
console.log(JSON.stringify(out, null, 2));
