-- Hammerex PDP Phase 1: rich product schema for the advanced product detail page.
-- Extends hammerex_products and adds media / specs / what's-in-the-box / shipping zones.

alter table public.hammerex_products
  add column if not exists sku text unique,
  add column if not exists brand text default 'Hammerex',
  add column if not exists model_number text,
  add column if not exists slug text,
  add column if not exists weight_kg numeric(10,3),
  add column if not exists dispatch_cutoff_local time default '14:00',
  add column if not exists dispatch_timezone text default 'Asia/Jakarta',
  add column if not exists warranty_years integer default 1,
  add column if not exists country_of_assembly text default 'Indonesia',
  add column if not exists overview text,
  add column if not exists features jsonb default '[]'::jsonb,
  add column if not exists video_url text;

create unique index if not exists hammerex_products_slug_uq on public.hammerex_products (slug);

create table if not exists public.hammerex_product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  kind text not null check (kind in ('image','video','360')),
  url text not null,
  alt text,
  sort_order integer not null default 0
);
create index if not exists hammerex_product_media_pid_idx on public.hammerex_product_media (product_id, sort_order);

create table if not exists public.hammerex_product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  group_name text not null,
  label text not null,
  value text not null,
  sort_order integer not null default 0
);
create index if not exists hammerex_product_specs_pid_idx on public.hammerex_product_specs (product_id, sort_order);

create table if not exists public.hammerex_what_in_box (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  label text not null,
  qty integer not null default 1,
  image_url text,
  sort_order integer not null default 0
);
create index if not exists hammerex_what_in_box_pid_idx on public.hammerex_what_in_box (product_id, sort_order);

create table if not exists public.hammerex_shipping_zones (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique,
  country_name text not null,
  carrier text not null,
  base_fee_idr integer not null,
  per_kg_idr integer not null,
  eta_min_days integer not null,
  eta_max_days integer not null,
  is_default boolean not null default false
);

alter table public.hammerex_product_media enable row level security;
alter table public.hammerex_product_specs enable row level security;
alter table public.hammerex_what_in_box enable row level security;
alter table public.hammerex_shipping_zones enable row level security;

drop policy if exists "hammerex_media public read" on public.hammerex_product_media;
create policy "hammerex_media public read" on public.hammerex_product_media for select using (true);

drop policy if exists "hammerex_specs public read" on public.hammerex_product_specs;
create policy "hammerex_specs public read" on public.hammerex_product_specs for select using (true);

drop policy if exists "hammerex_box public read" on public.hammerex_what_in_box;
create policy "hammerex_box public read" on public.hammerex_what_in_box for select using (true);

drop policy if exists "hammerex_zones public read" on public.hammerex_shipping_zones;
create policy "hammerex_zones public read" on public.hammerex_shipping_zones for select using (true);

-- Enrich the Cordless Drill seed row.
update public.hammerex_products set
  slug = coalesce(slug, 'cordless-drill-20v'),
  sku = coalesce(sku, 'HX-CD20-001'),
  model_number = coalesce(model_number, 'HX-D20'),
  weight_kg = coalesce(weight_kg, 1.6),
  warranty_years = coalesce(warranty_years, 2),
  dispatch_cutoff_local = coalesce(dispatch_cutoff_local, '14:00'),
  country_of_assembly = coalesce(country_of_assembly, 'Indonesia'),
  overview = coalesce(overview, 'Full-power 20V brushless cordless drill engineered for everyday utility. Twin 4.0Ah batteries, fast charger, hard-shell carry case. Built to outwork what you''re replacing.'),
  features = case when features = '[]'::jsonb or features is null then '[
    {"icon":"bolt","label":"20V brushless motor — 60Nm max torque"},
    {"icon":"battery","label":"Two 4.0Ah batteries — 8h+ run time"},
    {"icon":"lamp","label":"LED work light with 20s afterglow"},
    {"icon":"chuck","label":"13mm metal keyless chuck"},
    {"icon":"gauge","label":"2-speed transmission, 0–500 / 0–1900 RPM"},
    {"icon":"weight","label":"Compact 1.6kg with belt hook"}
  ]'::jsonb else features end
where name = 'Cordless Drill';

-- Also slugify the other two seeded products so PDP routes work for them.
update public.hammerex_products set slug = coalesce(slug, 'tool-belt') where name = 'Tool Belt';
update public.hammerex_products set slug = coalesce(slug, 'headlamp-1200lm') where name = 'Headlamp 1200lm';

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, v.alt, v.sort
from public.hammerex_products p,
  (values
    ('https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=1200&q=80', 'Hammerex cordless drill — front', 0),
    ('https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80', 'Side profile', 1),
    ('https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', 'In use on a workbench', 2),
    ('https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80', 'Carry case and kit contents', 3),
    ('https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&w=1200&q=80', '4.0Ah battery pack detail', 4),
    ('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', 'Belt hook mounted', 5)
  ) as v(url, alt, sort)
where p.name = 'Cordless Drill'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Power',         'Voltage',              '20V',                          0),
    ('Power',         'Battery',              '4.0Ah Li-ion × 2',             1),
    ('Power',         'Run time (mixed)',     '8h+',                          2),
    ('Power',         'Charge time',          '45 min full',                  3),
    ('Performance',   'Max torque',           '60 Nm',                       10),
    ('Performance',   'No-load speed',        '0–500 / 0–1900 RPM',          11),
    ('Performance',   'Chuck capacity',       '13 mm metal keyless',         12),
    ('Performance',   'Clutch settings',      '21 + drill mode',             13),
    ('Physical',      'Weight (with battery)','1.6 kg',                      20),
    ('Physical',      'Length',               '215 mm',                      21),
    ('Physical',      'Body material',        'Glass-filled nylon composite',22),
    ('Physical',      'Grip',                 'Soft-touch overmould',        23),
    ('Build & care',  'Warranty',             '2 years (parts & labour)',    30),
    ('Build & care',  'Country of assembly',  'Indonesia',                   31),
    ('Build & care',  'Ingress rating',       'IP54 — splash and dust',      32)
  ) as v(g, l, val, s)
where p.name = 'Cordless Drill'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id);

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('20V cordless drill',      1, 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=400&q=70', 0),
    ('4.0Ah battery pack',      2, 'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&w=400&q=70', 1),
    ('Fast charger',            1, 'https://images.unsplash.com/photo-1583863788434-e58a36d96b1d?auto=format&fit=crop&w=400&q=70', 2),
    ('Hard-shell carry case',   1, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=70', 3),
    ('Belt hook + screws',      1, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=70', 4)
  ) as v(l, q, u, s)
where p.name = 'Cordless Drill'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Shipping zones. Indicative carrier fees in IDR; meant as Phase-1 estimates until you wire real rate cards.
insert into public.hammerex_shipping_zones (country_code, country_name, carrier, base_fee_idr, per_kg_idr, eta_min_days, eta_max_days, is_default) values
  ('ID', 'Indonesia',       'JNE Reguler',  15000,   8000,  1,  3, true),
  ('SG', 'Singapore',       'DHL Express', 180000,  60000,  3,  5, false),
  ('MY', 'Malaysia',        'Pos Laju',    150000,  55000,  4,  6, false),
  ('AU', 'Australia',       'DHL Express', 280000,  85000,  5,  8, false),
  ('US', 'United States',   'FedEx IE',    360000, 110000,  6, 10, false),
  ('GB', 'United Kingdom',  'DHL Express', 320000, 100000,  6,  9, false),
  ('DE', 'Germany',          'DHL Express', 340000, 105000,  6,  9, false),
  ('JP', 'Japan',            'DHL Express', 260000,  80000,  4,  6, false)
on conflict (country_code) do nothing;
