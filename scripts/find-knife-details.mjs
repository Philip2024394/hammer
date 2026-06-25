import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const r = await sb.from("hammerex_products").select("id,slug,name,sku,image_url,base_currency,price_idr,shipping_per_unit_idr").eq("slug","folding-safety-cutting-knife").maybeSingle();
console.log(JSON.stringify(r.data, null, 2));
