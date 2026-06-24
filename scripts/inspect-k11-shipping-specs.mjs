import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const p = await sb.from("hammerex_products").select("id,purchase_notes,qty_discount_tiers").eq("slug","k11-drywall-tool-station").maybeSingle();
console.log("purchase_notes:", JSON.stringify(p.data.purchase_notes, null, 2));
console.log("\nqty_discount_tiers:", JSON.stringify(p.data.qty_discount_tiers, null, 2));
const s = await sb.from("hammerex_product_specs").select("*").eq("product_id", p.data.id).order("sort_order");
console.log("\nspecs:");
(s.data||[]).forEach(r=>console.log(JSON.stringify(r)));
const d = await sb.from("hammerex_product_deals").select("*").eq("product_id", p.data.id);
console.log("\ndeals:");
(d.data||[]).forEach(r=>console.log(JSON.stringify(r)));
