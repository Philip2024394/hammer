import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const p = await sb.from("hammerex_products").select("id,slug,image_url").eq("slug","k9-plastering-tool-station").maybeSingle();
console.log("PRODUCT:", JSON.stringify(p.data, null, 2));
const m = await sb.from("hammerex_product_media").select("id,sort_order,url").eq("product_id", p.data.id).order("sort_order");
console.log("\nMEDIA (current):");
(m.data||[]).forEach(r=>console.log(`  ${r.sort_order}: ${r.url}`));
