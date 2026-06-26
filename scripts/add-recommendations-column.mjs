// Add `recommendations` jsonb column to hammerex_trade_off_listings.
// Structure: [{ slug: string, note?: string }, ...] — capped at 12 entries
// at the API layer.

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
  add column if not exists recommendations jsonb not null default '[]'::jsonb;

comment on column public.hammerex_trade_off_listings.recommendations is
  'Trusted Trades: array of {slug, note?} this tradesperson vouches for.';
`;

const r = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql })
  }
);
console.log("HTTP", r.status);
console.log((await r.text()).slice(0, 400));
