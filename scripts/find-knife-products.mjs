import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const r = await sb.from("hammerex_products").select("slug,name,price_idr,sku").or("name.ilike.%knife%,slug.ilike.%knife%").order("price_idr");
(r.data||[]).forEach(p => console.log(`${(p.price_idr/23827).toFixed(2)} GBP  ${p.slug}  ${p.name}`));
console.log(`\nTotal knife-ish products: ${(r.data||[]).length}`);
