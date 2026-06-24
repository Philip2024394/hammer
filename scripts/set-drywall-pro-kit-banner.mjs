import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

const k11 = await sb.from("hammerex_products").select("image_url").eq("slug","k11-drywall-tool-station").maybeSingle();
const NEW = k11.data.image_url; // already-migrated Supabase Storage URL for k11 toolstation.png
console.log("Target image:", NEW);

const before = await sb.from("hammerex_products").select("image_url").eq("slug","drywall-pro-kit").maybeSingle();
console.log("drywall-pro-kit before:", before.data.image_url);

const { error } = await sb.from("hammerex_products").update({ image_url: NEW }).eq("slug","drywall-pro-kit");
if (error) throw error;
console.log("✓ drywall-pro-kit image_url updated");

const after = await sb.from("hammerex_products").select("image_url").eq("slug","drywall-pro-kit").maybeSingle();
console.log("drywall-pro-kit after:", after.data.image_url);
