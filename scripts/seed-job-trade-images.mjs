import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

const IMAGES = [
  { slug: "drywaller-wanted", ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2006_21_18%20AM.png" },
  { slug: "scaffolder-wanted", ik: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2006_25_55%20AM.png" }
];

const urls = {};
for (const i of IMAGES) {
  const r = await fetch(i.ik);
  if (!r.ok) { console.error(`fail ${i.slug}: ${r.status}`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  const path = `branding/job-${i.slug}.png`;
  const up = await sb.storage.from("product-images").upload(path, buf, { contentType: "image/png", upsert: true });
  if (up.error) { console.error(`upload fail ${i.slug}: ${up.error.message}`); continue; }
  const pub = sb.storage.from("product-images").getPublicUrl(path);
  urls[i.slug] = pub.data.publicUrl;
  console.log(`✓ ${i.slug} → ${pub.data.publicUrl}`);
}

// Update example drywaller jobs to use the new drywaller image,
// scaffolder jobs to use the new scaffolder image.
const updates = [
  { trade_slug: "drywaller", url: urls["drywaller-wanted"] },
  { trade_slug: "scaffolder", url: urls["scaffolder-wanted"] }
];
for (const u of updates) {
  if (!u.url) continue;
  const { data, error } = await sb
    .from("hammerex_xrated_jobs")
    .update({ photos: [u.url] })
    .eq("trade_slug", u.trade_slug)
    .eq("is_example", true)
    .select("slug");
  if (error) { console.error(`update fail ${u.trade_slug}: ${error.message}`); continue; }
  console.log(`✓ updated ${data.length} ${u.trade_slug} jobs → ${u.url}`);
}
