-- Cart + Checkout + Trowel Leg Pouch + multi-category schema.

-- New product-level columns to support GBP pricing, size variants,
-- multi-day dispatch leads, quoted-only delivery, and a free-form
-- "purchase notes" bullet list on the PDP.
alter table public.hammerex_products
  add column if not exists base_currency text default 'IDR',
  add column if not exists sizes jsonb default '[]'::jsonb,
  add column if not exists dispatch_lead_days integer default 0,
  add column if not exists delivery_quote_only boolean default false,
  add column if not exists purchase_notes jsonb default '[]'::jsonb;

-- 4 new trade categories (plastering / drywall / concrete / tiling).
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('plastering', 'Plastering', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=70', 100),
  ('drywall',    'Drywall',    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=70', 101),
  ('concrete',   'Concrete',   'https://images.unsplash.com/photo-1543393470-b2785d3b94d2?auto=format&fit=crop&w=400&q=70', 102),
  ('tiling',     'Tiling',     'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=400&q=70', 103)
on conflict (slug) do nothing;

-- Multi-category join so one product can belong to several trade categories.
create table if not exists public.hammerex_product_categories (
  product_id  uuid not null references public.hammerex_products(id)   on delete cascade,
  category_id uuid not null references public.hammerex_categories(id) on delete cascade,
  primary key (product_id, category_id)
);
alter table public.hammerex_product_categories enable row level security;
drop policy if exists "product_categories public read" on public.hammerex_product_categories;
create policy "product_categories public read" on public.hammerex_product_categories for select using (true);

-- Backfill the join from the legacy single category_id, so older products
-- keep working through the new lookup.
insert into public.hammerex_product_categories (product_id, category_id)
select id, category_id from public.hammerex_products where category_id is not null
on conflict do nothing;

-- Trowel Leg Pouch — £49 base. Stored as IDR (£49 × 20,000 indicative)
-- so the existing FX module + cart math still works; UI defaults to GBP.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features, stock_count,
  base_currency, sizes, dispatch_lead_days, delivery_quote_only, purchase_notes
)
select c.id,
  'Trowel Leg Pouch',
  'Twin-layer trowel holster for plasterers — secure, fast trowel access on the job.',
  980000,
  'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZx.png',
  true,
  'trowel-leg-pouch', 'HX-TLP-001', 'Hammerex', 'HX-TLP', 0.65, '14:00', 1, 'United Kingdom',
  E'Designed for plasterers who demand durability and convenience on the job, our Trowel Leg Holder keeps your trowel secure, protected, and always within reach.\n\nAvailable in 14", 16", and 18" trowel sizes, each holder is crafted using a twin-layer construction for added strength and long-term durability. The design features stud-reinforced pressure points and pressure-glued seams to withstand the demands of daily site work.',
  '[
    {"icon":"chuck","label":"Available in 14\", 16\", and 18\" sizes"},
    {"icon":"weight","label":"Heavy-duty twin-layer construction"},
    {"icon":"bolt","label":"Stud-reinforced high-stress pressure points"},
    {"icon":"gauge","label":"Pressure-glued seams for long-term durability"},
    {"icon":"lamp","label":"Fast, secure trowel access while working"},
    {"icon":"battery","label":"Built for pro plasterers and renderers"}
  ]'::jsonb,
  30,
  'GBP',
  '["14\"", "16\"", "18\""]'::jsonb,
  3,
  true,
  '["Belt not included — must be ordered separately.","Orders dispatched within 3 working days.","Delivery is quoted at checkout — sea freight (4–6 weeks, best value) or air freight (~6 working days, express)."]'::jsonb
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'trowel-leg-pouch');

-- Link Trowel Leg Pouch to all 4 trade categories.
insert into public.hammerex_product_categories (product_id, category_id)
select p.id, c.id
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'trowel-leg-pouch'
and c.slug in ('plastering','drywall','concrete','tiling')
on conflict do nothing;
