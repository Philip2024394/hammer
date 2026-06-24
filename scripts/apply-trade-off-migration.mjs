import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.tools.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const REF = "msdonkkechxzgagyguoe";
const sql = readFileSync("supabase/migrations/20260625100000_hammerex_trade_off_directory.sql", "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql })
});
const txt = await res.text();
console.log("status:", res.status);
console.log(txt);
if (!res.ok) process.exit(1);
