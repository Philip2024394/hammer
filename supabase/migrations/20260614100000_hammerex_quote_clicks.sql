-- HAMMEREX quote-click counter — records every time a customer taps a
-- "Quote on WhatsApp" / checkout WhatsApp button. Powers the honest
-- "X people quoted this in the last 7 days" badge on PDPs.
--
-- The badge is only displayed when the *real* count is >= a threshold,
-- so there is never any fake or padded signal. Insert is allowed via the
-- public anon role (the action is intentionally low-stakes).

create table if not exists public.hammerex_quote_clicks (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.hammerex_products(id) on delete cascade,
  source      text not null,  -- e.g. 'pdp_fab', 'checkout_wa'
  created_at  timestamptz not null default now()
);

create index if not exists hammerex_quote_clicks_product_idx
  on public.hammerex_quote_clicks (product_id, created_at desc);

alter table public.hammerex_quote_clicks enable row level security;

drop policy if exists "anon can insert quote clicks" on public.hammerex_quote_clicks;
create policy "anon can insert quote clicks"
  on public.hammerex_quote_clicks
  for insert to anon, authenticated
  with check (true);

drop policy if exists "anyone can read quote click rollups" on public.hammerex_quote_clicks;
create policy "anyone can read quote click rollups"
  on public.hammerex_quote_clicks
  for select to anon, authenticated
  using (true);
