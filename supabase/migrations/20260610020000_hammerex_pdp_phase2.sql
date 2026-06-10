-- PDP Phase 2: upsell-first commerce features.
-- Bundles, accessory cross-sell, qty-tier discounts, stock scarcity,
-- compare-at price, free-shipping thresholds, reviews + Q&A schema.

alter table public.hammerex_products
  add column if not exists stock_count integer default 50,
  add column if not exists compare_at_idr integer,
  add column if not exists qty_discount_tiers jsonb default '[]'::jsonb,
  add column if not exists is_accessory boolean default false,
  add column if not exists rating_avg numeric(3,2),
  add column if not exists rating_count integer default 0;

alter table public.hammerex_shipping_zones
  add column if not exists free_shipping_threshold_idr integer default 0;

create table if not exists public.hammerex_bundles (
  id uuid primary key default gen_random_uuid(),
  anchor_product_id uuid not null references public.hammerex_products(id) on delete cascade,
  title text not null default 'Frequently bought together',
  discount_pct integer not null default 10 check (discount_pct between 0 and 50),
  sort_order integer not null default 0
);

create table if not exists public.hammerex_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.hammerex_bundles(id) on delete cascade,
  item_product_id uuid not null references public.hammerex_products(id) on delete cascade,
  qty integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists public.hammerex_pair_with (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  accessory_product_id uuid not null references public.hammerex_products(id) on delete cascade,
  reason text,
  sort_order integer not null default 0,
  unique (product_id, accessory_product_id)
);

create table if not exists public.hammerex_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  reviewer_name text not null,
  reviewer_type text check (reviewer_type in ('pro','hobbyist','first-timer','vendor')),
  rating integer not null check (rating between 1 and 5),
  pillars jsonb default '{}'::jsonb,
  title text,
  body text,
  photos jsonb default '[]'::jsonb,
  verified_purchase boolean default false,
  helpful_count integer default 0,
  created_at timestamptz default now()
);
create index if not exists hammerex_reviews_pid_idx on public.hammerex_reviews (product_id, created_at desc);

create table if not exists public.hammerex_questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  asked_by text,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.hammerex_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.hammerex_questions(id) on delete cascade,
  by_name text,
  body text not null,
  by_vendor boolean default false,
  created_at timestamptz default now()
);

alter table public.hammerex_bundles        enable row level security;
alter table public.hammerex_bundle_items   enable row level security;
alter table public.hammerex_pair_with      enable row level security;
alter table public.hammerex_reviews        enable row level security;
alter table public.hammerex_questions      enable row level security;
alter table public.hammerex_answers        enable row level security;

drop policy if exists "p2 bundles public read"        on public.hammerex_bundles;
drop policy if exists "p2 bundle items public read"   on public.hammerex_bundle_items;
drop policy if exists "p2 pair_with public read"      on public.hammerex_pair_with;
drop policy if exists "p2 reviews public read"        on public.hammerex_reviews;
drop policy if exists "p2 questions public read"      on public.hammerex_questions;
drop policy if exists "p2 answers public read"        on public.hammerex_answers;

create policy "p2 bundles public read"      on public.hammerex_bundles        for select using (true);
create policy "p2 bundle items public read" on public.hammerex_bundle_items   for select using (true);
create policy "p2 pair_with public read"    on public.hammerex_pair_with      for select using (true);
create policy "p2 reviews public read"      on public.hammerex_reviews        for select using (true);
create policy "p2 questions public read"    on public.hammerex_questions      for select using (true);
create policy "p2 answers public read"      on public.hammerex_answers        for select using (true);

-- Free shipping thresholds — indicative. Tune for your real margin.
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 1500000 where country_code = 'ID';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 4000000 where country_code = 'SG';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 4000000 where country_code = 'MY';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 5000000 where country_code = 'AU';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 6000000 where country_code = 'US';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 5000000 where country_code = 'GB';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 5000000 where country_code = 'DE';
update public.hammerex_shipping_zones set free_shipping_threshold_idr = 5000000 where country_code = 'JP';

-- Seed 3 accessory products.
insert into public.hammerex_products (name, description, price_idr, image_url, is_featured, slug, sku, brand, model_number, weight_kg, warranty_years, country_of_assembly, is_accessory, overview)
select * from (values
  ('Extra 4.0Ah Battery',  'Spare 4.0Ah Li-ion pack for the HX-D20 platform.',                380000, 'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&w=600&q=70', false, 'extra-4ah-battery',     'HX-BAT-40', 'Hammerex', 'HX-B40', 0.55, 2, 'Indonesia', true, 'Genuine Hammerex 4.0Ah Li-ion battery. Compatible with the entire 20V cordless platform.'),
  ('50-piece Bit Set',      'Drill + driver bits, hex shank, tough storage case.',             165000, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=70', false, '50pc-bit-set',          'HX-BIT-50', 'Hammerex', 'HX-BS50',0.45, 1, 'Indonesia', true, '50 quick-change bits in a hard-shell carry case. Standard 1/4" hex shanks fit any modern driver.'),
  ('Drill Carry Pouch',     'Soft tool pouch with belt clip and bit pockets.',                  95000, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=70', false, 'drill-carry-pouch',     'HX-PCH-01', 'Hammerex', 'HX-P01', 0.20, 1, 'Indonesia', true, 'Soft, durable tool pouch with belt clip. Keeps your drill and bits at hand on the job.')
) as v(name, description, price_idr, image_url, is_featured, slug, sku, brand, model_number, weight_kg, warranty_years, country_of_assembly, is_accessory, overview)
where not exists (select 1 from public.hammerex_products p where p.slug = v.slug);

-- Cordless Drill: stock count (PLACEHOLDER — set to real on-hand inventory),
-- compare-at "was" price, qty discount tiers.
update public.hammerex_products set
  stock_count = 9,
  compare_at_idr = 2199000,
  qty_discount_tiers = '[{"min":2,"pct":5},{"min":3,"pct":10}]'::jsonb
where slug = 'cordless-drill-20v';

-- Tool Belt + Headlamp: simple stock + tier so they also feel alive.
update public.hammerex_products set
  stock_count = 24,
  qty_discount_tiers = '[{"min":2,"pct":5}]'::jsonb
where slug = 'tool-belt';

update public.hammerex_products set
  stock_count = 41,
  qty_discount_tiers = '[{"min":2,"pct":5}]'::jsonb
where slug = 'headlamp-1200lm';

-- Bundle: drill + battery + bit set, -12%.
insert into public.hammerex_bundles (anchor_product_id, title, discount_pct)
select id, 'Pro starter kit — drill + spare battery + bits', 12
from public.hammerex_products
where slug = 'cordless-drill-20v'
and not exists (
  select 1 from public.hammerex_bundles b
  join public.hammerex_products p on p.id = b.anchor_product_id
  where p.slug = 'cordless-drill-20v'
);

insert into public.hammerex_bundle_items (bundle_id, item_product_id, qty, sort_order)
select b.id, p.id, 1, v.sort
from public.hammerex_bundles b
join public.hammerex_products a on a.id = b.anchor_product_id and a.slug = 'cordless-drill-20v',
  (values ('cordless-drill-20v', 0), ('extra-4ah-battery', 1), ('50pc-bit-set', 2)) as v(slug, sort)
join public.hammerex_products p on p.slug = v.slug
where not exists (
  select 1 from public.hammerex_bundle_items bi where bi.bundle_id = b.id and bi.item_product_id = p.id
);

-- Pairs well with: drill ← all 3 accessories.
insert into public.hammerex_pair_with (product_id, accessory_product_id, reason, sort_order)
select drill.id, acc.id, v.reason, v.sort
from public.hammerex_products drill,
  (values
    ('extra-4ah-battery', 'Double your run time on long jobs.', 0),
    ('50pc-bit-set',      'Cover every common screw + masonry job.', 1),
    ('drill-carry-pouch', 'Keep tool + bits within reach on the belt.', 2)
  ) as v(slug, reason, sort)
join public.hammerex_products acc on acc.slug = v.slug
where drill.slug = 'cordless-drill-20v'
and not exists (
  select 1 from public.hammerex_pair_with pw
  where pw.product_id = drill.id and pw.accessory_product_id = acc.id
);
