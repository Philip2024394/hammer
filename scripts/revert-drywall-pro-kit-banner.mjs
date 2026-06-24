import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

// Original drywall-pro-bag art before the mistaken K11 overwrite
const ORIGINAL = "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/0a5025387dc3be92.png";

const before = await sb.from("hammerex_products").select("image_url").eq("slug","drywall-pro-kit").maybeSingle();
console.log("before:", before.data.image_url);

const { error } = await sb.from("hammerex_products").update({ image_url: ORIGINAL }).eq("slug","drywall-pro-kit");
if (error) throw error;

const after = await sb.from("hammerex_products").select("image_url,name").eq("slug","drywall-pro-kit").maybeSingle();
console.log("after :", after.data.image_url);
console.log("name  :", after.data.name);
