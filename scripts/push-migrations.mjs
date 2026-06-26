// One-shot migration push for the 3 missing launch-readiness tables.
// Reads SUPABASE_ACCESS_TOKEN + HAMMEREX_NEW_PROJECT_REF from
// .env.tools.local and posts the DDL to the Management API.

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
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN missing in .env.tools.local");

const sql = `
create table if not exists public.hammerex_trade_off_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.hammerex_trade_off_listings(id) on delete cascade,
  customer_name text not null,
  customer_postcode text,
  customer_avatar_url text,
  project_type text check (project_type in ('new_build','renovation','repair') or project_type is null),
  service_name text,
  overall_rating int not null check (overall_rating between 1 and 5),
  workmanship_rating int check (workmanship_rating between 1 and 5),
  communication_rating int check (communication_rating between 1 and 5),
  value_rating int check (value_rating between 1 and 5),
  timeliness_rating int check (timeliness_rating between 1 and 5),
  body text not null,
  status text not null default 'live' check (status in ('live','disputed','hidden')),
  public_response text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists hammerex_trade_off_reviews_listing_id_idx on public.hammerex_trade_off_reviews(listing_id);
create index if not exists hammerex_trade_off_reviews_status_idx on public.hammerex_trade_off_reviews(status);

create table if not exists public.hammerex_trade_off_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.hammerex_trade_off_listings(id) on delete cascade,
  session_id text not null,
  page text,
  referrer text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  ip_country text,
  ip_region text,
  ip_city text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists hammerex_trade_off_views_listing_id_idx on public.hammerex_trade_off_views(listing_id);
create index if not exists hammerex_trade_off_views_session_id_idx on public.hammerex_trade_off_views(session_id);
create index if not exists hammerex_trade_off_views_started_at_idx on public.hammerex_trade_off_views(started_at);

create table if not exists public.hammerex_verified_waitlist (
  id uuid primary key default gen_random_uuid(),
  trade_name text not null,
  company_name text not null,
  country text not null,
  email text not null unique,
  whatsapp text,
  price_locked_gbp int not null default 200,
  source_path text,
  created_at timestamptz not null default now()
);
create index if not exists hammerex_verified_waitlist_country_idx on public.hammerex_verified_waitlist(country);
create index if not exists hammerex_verified_waitlist_created_at_idx on public.hammerex_verified_waitlist(created_at desc);
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
console.log("Migration HTTP", r.status);
console.log(text.slice(0, 1200));
