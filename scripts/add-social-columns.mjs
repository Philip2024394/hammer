// Add 3 social-link columns to hammerex_trade_off_listings for the
// premium-footer social icon row: twitter (X), snapchat, reddit.
// Existing fields already cover instagram, facebook, tiktok, youtube,
// website.

import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.tools.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.HAMMEREX_NEW_PROJECT_REF || "msdonkkechxzgagyguoe";

const sql = `
alter table public.hammerex_trade_off_listings
  add column if not exists twitter text,
  add column if not exists snapchat text,
  add column if not exists reddit text,
  add column if not exists google text;
`;

const r = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql })
  }
);
const text = await r.text();
console.log("HTTP", r.status);
console.log(text.slice(0, 800));
