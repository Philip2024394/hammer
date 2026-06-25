import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.tools.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sql = readFileSync("supabase/migrations/20260625160000_hammerex_xrated_app_features.sql","utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/msdonkkechxzgagyguoe/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql })
});
console.log("status:", res.status, await res.text());
