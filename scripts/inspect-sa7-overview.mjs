import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()]}));
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const p = await s.from("hammerex_products").select("name, description, overview, subtitle").eq("sku","HX-SA7-001").maybeSingle();
console.log("NAME:", p.data.name);
console.log("\nSUBTITLE:", p.data.subtitle);
console.log("\nDESCRIPTION:", p.data.description);
console.log("\nOVERVIEW:\n", p.data.overview);
