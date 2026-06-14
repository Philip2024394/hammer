-- Hammerex "Deal Breaker" PDP upsell.
--   anchor_product_id  - the product on whose PDP the Deal Breaker block shows
--   item_product_id    - the add-on product offered at the Deal Breaker price
--   deal_price_idr     - the Deal Breaker price (in IDR, canonical)
-- Same add-on can appear under multiple anchors.

create table if not exists public.hammerex_deal_breakers (
  id uuid primary key default gen_random_uuid(),
  anchor_product_id uuid not null references public.hammerex_products(id) on delete cascade,
  item_product_id   uuid not null references public.hammerex_products(id) on delete cascade,
  deal_price_idr    integer not null check (deal_price_idr >= 0),
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  unique (anchor_product_id, item_product_id)
);

create index if not exists hammerex_deal_breakers_anchor_idx
  on public.hammerex_deal_breakers (anchor_product_id, sort_order);

alter table public.hammerex_deal_breakers enable row level security;

drop policy if exists "hammerex_deal_breakers public read" on public.hammerex_deal_breakers;
create policy "hammerex_deal_breakers public read"
  on public.hammerex_deal_breakers for select
  using (true);
