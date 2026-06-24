import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});

const TABLES = [
  "hammerex_trade_off_listings",
  "hammerex_trade_off_projects",
  "hammerex_trade_off_reports",
  "hammerex_xrated_jobs",
  "hammerex_xrated_job_reports",
  "hammerex_xrated_views",
  "hammerex_xrated_payments"
];

console.log("=== Xrated Supabase connectivity ===\n");
for (const t of TABLES) {
  const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
  if (error) console.log(`  ✗ ${t}: ${error.message}`);
  else console.log(`  ✓ ${t}: ${count} rows`);
}

console.log("\n=== Live tradies (status=live) ===");
const live = await sb.from("hammerex_trade_off_listings").select("slug,display_name,primary_trade,city,tier,hammerex_standard_verified").eq("status","live").order("created_at",{ascending:false});
(live.data||[]).forEach(r=>console.log(`  ${r.tier.padEnd(10)} ${r.hammerex_standard_verified?"★":" "} ${r.primary_trade.padEnd(18)} ${r.city.padEnd(14)} ${r.display_name}`));

console.log("\n=== Live example jobs (status=live, is_example=true) ===");
const jobs = await sb.from("hammerex_xrated_jobs").select("slug,trade_slug,city,customer_name,is_example").eq("status","live").order("created_at",{ascending:false});
(jobs.data||[]).forEach(r=>console.log(`  ${r.is_example?"EX ":"   "} ${r.trade_slug.padEnd(18)} ${r.city.padEnd(14)} ${r.customer_name}`));

console.log("\n=== Tier distribution ===");
const tiers = await sb.from("hammerex_trade_off_listings").select("tier").eq("status","live");
const tcounts = {};
(tiers.data||[]).forEach(r=>{tcounts[r.tier] = (tcounts[r.tier]||0) + 1;});
Object.entries(tcounts).forEach(([t,c])=>console.log(`  ${t}: ${c}`));
