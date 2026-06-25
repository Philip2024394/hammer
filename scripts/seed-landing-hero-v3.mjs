import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const r = await fetch("https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2010_01_21%20AM.png");
if (!r.ok) { console.error(`fetch fail: ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
const up = await sb.storage.from("product-images").upload("branding/xrated-landing-hero-v3.png", buf, { contentType: "image/png", upsert: true });
if (up.error) throw up.error;
const pub = sb.storage.from("product-images").getPublicUrl("branding/xrated-landing-hero-v3.png");
console.log(`✓ ${pub.data.publicUrl}`);
