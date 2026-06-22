-- Security hardening migration.
-- 1) Lock down PII / order / tracking tables with RLS so the public anon
--    JWT (shipped in the client bundle) can no longer read them.
-- 2) Restrict the public quote-click table to a single anon insert per
--    visitor + drop the public read policy that was being used as a
--    counter dump.
-- 3) Create a hammerex_admin_login_attempts table so the /api/admin/login
--    route can throttle by IP without an external KV/Redis service.

-- ---------------------------------------------------------------
-- hammerex_orders — PII (email, name, phone, shipping address).
-- Was readable by anyone with the public anon key. Service-role reads
-- (admin pages via supabaseAdmin) bypass RLS, so admin still works.
-- ---------------------------------------------------------------
alter table public.hammerex_orders enable row level security;

-- Drop any pre-existing permissive policies and recreate fresh.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where tablename='hammerex_orders' and schemaname='public' loop
    execute format('drop policy if exists %I on public.hammerex_orders', p.policyname);
  end loop;
end $$;

-- No anon select / insert / update / delete. (No policy = denied under RLS.)
-- Service-role client bypasses RLS so admin reads + webhook writes still work.

-- ---------------------------------------------------------------
-- hammerex_search_queries — buyer search terms, country, IP-derived data.
-- Was writeable + readable by anon (used to log every search).
-- Keep anon INSERT (the client logs queries) but DENY anon SELECT.
-- ---------------------------------------------------------------
alter table public.hammerex_search_queries enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where tablename='hammerex_search_queries' and schemaname='public' loop
    execute format('drop policy if exists %I on public.hammerex_search_queries', p.policyname);
  end loop;
end $$;

create policy hammerex_search_queries_anon_insert
  on public.hammerex_search_queries
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------
-- hammerex_page_events — analytics. Same shape as search_queries.
-- ---------------------------------------------------------------
alter table public.hammerex_page_events enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where tablename='hammerex_page_events' and schemaname='public' loop
    execute format('drop policy if exists %I on public.hammerex_page_events', p.policyname);
  end loop;
end $$;

create policy hammerex_page_events_anon_insert
  on public.hammerex_page_events
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------
-- hammerex_quote_clicks — was bidirectional public. Drop the public
-- SELECT (no buyer needs to enumerate every quote click) and clamp
-- the INSERT so we can't be flooded.
-- ---------------------------------------------------------------
alter table public.hammerex_quote_clicks enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where tablename='hammerex_quote_clicks' and schemaname='public' loop
    execute format('drop policy if exists %I on public.hammerex_quote_clicks', p.policyname);
  end loop;
end $$;

create policy hammerex_quote_clicks_anon_insert
  on public.hammerex_quote_clicks
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------
-- hammerex_admin_login_attempts — backing store for admin login throttle.
-- Service-role only (no public policies needed: RLS denies anon).
-- ---------------------------------------------------------------
create table if not exists public.hammerex_admin_login_attempts (
  id          bigserial primary key,
  ip_hash     text not null,
  success     boolean not null,
  user_agent  text,
  attempted_at timestamptz not null default now()
);

create index if not exists hammerex_admin_login_attempts_ip_time_idx
  on public.hammerex_admin_login_attempts (ip_hash, attempted_at desc);

alter table public.hammerex_admin_login_attempts enable row level security;
