-- Hammerex Products — namespaced tables that live alongside indocity verticals.
-- Prefix every table with hammerex_ to avoid colliding with citydrivers/cityriders/beautician/etc.

create table if not exists public.hammerex_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hammerex_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.hammerex_categories(id) on delete set null,
  name text not null,
  description text,
  price_idr integer not null check (price_idr >= 0),
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists hammerex_products_category_idx on public.hammerex_products (category_id);
create index if not exists hammerex_products_featured_idx on public.hammerex_products (is_featured) where is_featured = true;

alter table public.hammerex_categories enable row level security;
alter table public.hammerex_products enable row level security;

drop policy if exists "hammerex_categories public read" on public.hammerex_categories;
create policy "hammerex_categories public read"
  on public.hammerex_categories for select
  using (true);

drop policy if exists "hammerex_products public read" on public.hammerex_products;
create policy "hammerex_products public read"
  on public.hammerex_products for select
  using (true);

-- Seed
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('tools',   'Tools',   'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=70', 1),
  ('outdoor', 'Outdoor', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=70', 2),
  ('home',    'Home',    'https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=400&q=70', 3),
  ('auto',    'Auto',    'https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=400&q=70', 4),
  ('garden',  'Garden',  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=70', 5),
  ('safety',  'Safety',  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=70', 6)
on conflict (slug) do nothing;

with t as (select id from public.hammerex_categories where slug = 'tools')
insert into public.hammerex_products (category_id, name, description, price_idr, image_url, is_featured)
select t.id, v.name, v.description, v.price_idr, v.image_url, true
from t, (values
  ('Cordless Drill', '20V brushless with 2 batteries.', 1850000, 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=600&q=70'),
  ('Tool Belt',      'Heavy-duty canvas, 12 pockets.',   420000, 'https://images.unsplash.com/photo-1521989588531-cf2073a3a9f4?auto=format&fit=crop&w=600&q=70'),
  ('Headlamp 1200lm','USB-C rechargeable, IP65.',        285000, 'https://images.unsplash.com/photo-1592920448607-a26f5cf06ad9?auto=format&fit=crop&w=600&q=70')
) as v(name, description, price_idr, image_url)
where not exists (select 1 from public.hammerex_products p where p.name = v.name);
