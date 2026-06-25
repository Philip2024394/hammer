import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

// Migrate new header logo
const r = await fetch("https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2025,%202026,%2009_45_07%20AM.png");
const buf = Buffer.from(await r.arrayBuffer());
const up = await sb.storage.from("product-images").upload("branding/xrated_logo_v2.png", buf, { contentType: "image/png", upsert: true });
if (up.error) throw up.error;
const pub = sb.storage.from("product-images").getPublicUrl("branding/xrated_logo_v2.png");
console.log(`✓ logo → ${pub.data.publicUrl}`);

// Sweep tradies' theme_color: any orange → Hammerex yellow.
const orange = ["#F97316", "#EA580C", "#f97316", "#ea580c"];
for (const hex of orange) {
  const { data, error } = await sb.from("hammerex_trade_off_listings").update({ theme_color: "#FFB300" }).eq("theme_color", hex).select("slug");
  if (error) { console.error(`fail for ${hex}: ${error.message}`); continue; }
  console.log(`✓ ${hex} → #FFB300: ${data.length} tradies updated`);
}

const remaining = await sb.from("hammerex_trade_off_listings").select("slug,theme_color").not("theme_color", "eq", "#FFB300").not("theme_color", "is", null);
console.log("\nNon-yellow theme_color rows remaining:", remaining.data?.length || 0);
(remaining.data||[]).forEach(r => console.log(`  ${r.slug}: ${r.theme_color}`));
