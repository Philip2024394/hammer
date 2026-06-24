import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const p = await sb.from("hammerex_products").select("id,slug,sku,price_idr,shipping_per_unit_idr,image_url,subtitle,description,category_id").eq("slug","k11-drywall-tool-station").maybeSingle();
console.log("PRODUCT:", JSON.stringify({...p.data, description: (p.data.description||"").slice(0,80)+"..."}, null, 2));
const m = await sb.from("hammerex_product_media").select("sort_order,url").eq("product_id", p.data.id).order("sort_order");
console.log("\nMEDIA:");
m.data.forEach(r=>console.log(`  ${r.sort_order}: ${r.url}`));
const c = await sb.from("hammerex_categories").select("slug,name,image_url,card_image_url").eq("slug","drywall").maybeSingle();
console.log("\nCATEGORY:", JSON.stringify(c.data, null, 2));
const ik = await sb.from("hammerex_products").select("id").or("image_url.like.%imagekit%,description.like.%imagekit%");
console.log("\nResidual ImageKit URLs in products:", ik.data?.length || 0);
