-- Tracking tables for the admin dashboard. Two surfaces:
--   1) hammerex_search_queries — what shoppers type into the site search
--   2) hammerex_page_events    — funnel + country breakdown
--
-- Both are append-only logs (no updates). Indexed for the dashboard's
-- "last 30 days" rollups + a country-grouped breakdown.

create table if not exists public.hammerex_search_queries (
  id          uuid primary key default gen_random_uuid(),
  q           text not null,
  results_count integer not null default 0,
  country     text,
  session_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists hammerex_search_queries_created_idx
  on public.hammerex_search_queries (created_at desc);
create index if not exists hammerex_search_queries_q_idx
  on public.hammerex_search_queries (lower(q));

-- Funnel events. event_type one of:
--   'pdp_view'             — product page viewed
--   'cart_view'            — cart page viewed
--   'checkout_view'        — /checkout reached
--   'checkout_started'     — Pay-now button clicked (Stripe session start)
--   'checkout_success'     — buyer landed on /checkout/success
create table if not exists public.hammerex_page_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  product_id  uuid,
  country     text,
  session_id  text,
  path        text,
  created_at  timestamptz not null default now()
);

create index if not exists hammerex_page_events_created_idx
  on public.hammerex_page_events (created_at desc);
create index if not exists hammerex_page_events_type_idx
  on public.hammerex_page_events (event_type, created_at desc);
create index if not exists hammerex_page_events_session_idx
  on public.hammerex_page_events (session_id);
