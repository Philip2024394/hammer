import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const p = await sb.from("hammerex_products").select("id,slug,price_idr,shipping_per_unit_idr,base_currency,qty_discount_tiers,purchase_notes").eq("slug","k9-plastering-tool-station").maybeSingle();
console.log("PRODUCT:", JSON.stringify(p.data, null, 2));
const s = await sb.from("hammerex_product_specs").select("id,group_name,label,value,sort_order").eq("product_id", p.data.id).order("sort_order");
console.log("\nSPECS (shipping/pricing only):");
(s.data||[]).filter(r=>["Pricing","Dispatch","Stock","Build & care"].includes(r.group_name)).forEach(r=>console.log(`  [${r.sort_order}] ${r.group_name}/${r.label}: ${r.value}`));
const d = await sb.from("hammerex_product_deals").select("id,qty,price_idr,name").eq("product_id", p.data.id).order("sort_order");
console.log("\nDEALS:");
(d.data||[]).forEach(r=>console.log(`  qty=${r.qty} price_idr=${r.price_idr}  ${r.name}`));
