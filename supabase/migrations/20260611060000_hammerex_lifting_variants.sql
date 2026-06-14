-- Collapse the three lifting products into ONE parent product with three
-- variants (capacity / format). Per-variant: own SKU, own price, own image.

-- 1. Variant table.
create table if not exists public.hammerex_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  label text not null,
  sku text,
  price_idr integer not null check (price_idr >= 0),
  image_url text,
  model_number text,
  stock_count integer,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists hammerex_product_variants_product_label_uq
  on public.hammerex_product_variants (product_id, label);
create index if not exists hammerex_product_variants_product_idx
  on public.hammerex_product_variants (product_id, sort_order);

alter table public.hammerex_product_variants enable row level security;
drop policy if exists "hammerex_product_variants public read" on public.hammerex_product_variants;
create policy "hammerex_product_variants public read"
  on public.hammerex_product_variants for select
  using (true);

-- 2. Parent product. Sits in `lifting`. Default price = 30kg bag price so
--    server-rendered SEO and PDP fallbacks show a meaningful number until
--    the user selects a variant.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Heavy Duty Lifting Bags & Bucket',
  'Heavy-duty 30kg and 50kg lifting bags and a 50kg lifting bucket — choose your capacity.',
  300000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
  true,
  'lifting-bags-range', 'HX-LB-RANGE', 'Hammerex', 'HX-LB-RANGE', '14:00',
  1, 'United Kingdom',
  E'The Hammerex heavy-duty lifting range gives builders, plasterers, scaffolders and carpenters a reliable solution for moving rubble, aggregates, mortar, tools and site waste.\n\nChoose your capacity:\n• 30kg Lifting Bag — for everyday loads, compact and foldable.\n• 50kg Lifting Bag — heavier-duty fabric for cement and bigger loads.\n• 50kg Heavy Duty Lifting Bucket — for mortar, plaster, debris and tools.\n\nAll three share the same heavy-duty construction, reinforced stitching and durable lifting handles you expect from Hammerex.',
  '[
    {"icon":"check","label":"Choice of three capacities — 30kg bag, 50kg bag, 50kg bucket"},
    {"icon":"check","label":"Reinforced heavy-duty construction across the range"},
    {"icon":"check","label":"Durable stitched lifting handles"},
    {"icon":"check","label":"Suitable for rubble, aggregates, mortar, tools and site waste"},
    {"icon":"check","label":"Water-resistant materials, easy to clean"},
    {"icon":"check","label":"Designed for repeated daily site use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "UK delivery available — international shipping quoted on request.",
    "Orders dispatched within 3 working days (subject to stock and order volume).",
    "Select a capacity above before adding to cart — each variant has its own Ref number."
  ]'::jsonb,
  null, 'LIFTING BAGS & BUCKET', 6
from public.hammerex_categories c
where c.slug = 'lifting'
and not exists (select 1 from public.hammerex_products where slug = 'lifting-bags-range');

-- 3. Three variants for the parent.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default
from public.hammerex_products p,
  (values
    ('30kg Lifting Bag',     'HX-LB30-001',
     300000,
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_16_28%20PM.png',
     'HX-LB30',   0, true),
    ('50kg Lifting Bag',     'HX-LB50-001',
     340000,
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
     'HX-LB50',   1, false),
    ('50kg Lifting Bucket',  'HX-LBKT50-001',
     500000,
     'https://ik.imagekit.io/pinky/WWWWWWWWWWWWWWW.png',
     'HX-LBKT50', 2, false)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default)
where p.slug = 'lifting-bags-range'
on conflict (product_id, label) do nothing;

-- 4. Gallery — one image per variant.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, v.alt, v.s
from public.hammerex_products p,
  (values
    ('https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_16_28%20PM.png',
     '30kg Lifting Bag — heavy-duty reinforced fabric with stitched handles', 0),
    ('https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
     '50kg Lifting Bag — industrial fabric with twin lifting handles', 1),
    ('https://ik.imagekit.io/pinky/WWWWWWWWWWWWWWW.png',
     '50kg Heavy Duty Lifting Bucket — reinforced lifting points', 2)
  ) as v(url, alt, s)
where p.slug = 'lifting-bags-range'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id and m.url = v.url
);

-- 5. What's Included (one row per variant).
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, v.u, v.s
from public.hammerex_products p,
  (values
    ('30kg Lifting Bag',
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_16_28%20PM.png', 0),
    ('50kg Lifting Bag',
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png', 1),
    ('50kg Lifting Bucket',
     'https://ik.imagekit.io/pinky/WWWWWWWWWWWWWWW.png', 2)
  ) as v(l, u, s)
where p.slug = 'lifting-bags-range'
and not exists (
  select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l
);

-- 6. Specifications — shared specs at the bottom; per-variant SWL on top.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     '30kg Lifting Bag',     'Safe working load 30kg',                  0),
    ('Capacity',     '50kg Lifting Bag',     'Safe working load 50kg',                  1),
    ('Capacity',     '50kg Lifting Bucket',  'Safe working load 50kg',                  2),
    ('Material',     'Body',                 'Heavy-duty industrial-grade fabric',     10),
    ('Material',     'Construction',         'Reinforced stitching throughout',        11),
    ('Handles',      'Lifting',              'Strong stitched lifting handles',        20),
    ('Use',          'Suitable for',         'Rubble, aggregates, mortar, tools, waste', 30),
    ('Care',         'Cleaning',             'Water-resistant, easy to clean',         40),
    ('Build & care', 'Made in',              'United Kingdom',                         50),
    ('Build & care', 'Warranty',             '1 year (manufacturing defects)',         51)
  ) as v(g, l, val, s)
where p.slug = 'lifting-bags-range'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);

-- 7. Cross-list parent across scaffolding / carpentry / drywall / plastering.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('scaffolding', 0),
    ('carpentry',   1),
    ('drywall',     2),
    ('plastering',  3)
  ) as v(cat_slug, s)
where p.slug = 'lifting-bags-range'
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- 8. Remove the three standalone products. Cascade clears their
--    media / specs / what_in_box / trade cross-listings.
delete from public.hammerex_products
where slug in ('30kg-lifting-bag', '50kg-lifting-bag', 'lifting-bucket-50kg');
