-- Site Single Bubble Level Holder — £6.99 GBP, leather pouch for site levels.
-- Listed across five trades (scaffolders / plumbers / carpenters / tilers / stone masons)
-- via a new hammerex_product_trades junction table.

-- 1. New category for stone masons (slug stays kebab-case like the rest).
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('stone-masonry', 'Stone Masonry', null, 314)
on conflict (slug) do nothing;

-- 2. Junction table for products that belong on multiple trade browse lists.
--    Primary category stays on hammerex_products.category_id; this table is
--    purely additive for cross-listing.
create table if not exists public.hammerex_product_trades (
  product_id uuid not null references public.hammerex_products(id) on delete cascade,
  category_id uuid not null references public.hammerex_categories(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, category_id)
);
create index if not exists hammerex_product_trades_cat_idx on public.hammerex_product_trades (category_id, sort_order);

alter table public.hammerex_product_trades enable row level security;
drop policy if exists "hammerex_product_trades public read" on public.hammerex_product_trades;
create policy "hammerex_product_trades public read"
  on public.hammerex_product_trades for select
  using (true);

-- 3. Product row. Primary category = scaffolding (matches the product name).
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Site Single Bubble Level Holder',
  'Thick leather holder for single bubble site levels — fits belts up to 6cm, rivet-reinforced.',
  139800,
  'https://ik.imagekit.io/pinky/Untitledsdfasdaaaasdasdasd.png?tr=w-1600,q-90,f-auto',
  true,
  'site-single-bubble-level-holder', 'HX-SBLH-001', 'Hammerex', 'HX-SBLH', '14:00',
  1, 'United Kingdom',
  E'Keep your site level secure and within easy reach with the Scaffolders Single Bubble Site Level Holder. Designed for daily use on demanding job sites, this holder is crafted from thick, premium-grade leather to provide exceptional durability and long-lasting performance.\n\nBuilt to fit all standard single bubble site levels, the holder features a universal belt loop design that accommodates work belts up to 6cm wide. Reinforced with heavy-duty rivets at key stress points, it is engineered to withstand the rigours of everyday scaffolding, construction, and trade work.\n\nThe robust leather construction offers reliable retention while allowing quick access when needed, helping you work efficiently and maintain accurate level checks throughout the day.\n\nA durable, professional-grade holder designed to keep your essential leveling tool protected, accessible, and ready for work.',
  '[
    {"icon":"check","label":"Fits all standard single bubble site levels"},
    {"icon":"check","label":"Suitable for belts up to 6cm wide"},
    {"icon":"check","label":"Crafted from thick, premium-quality leather"},
    {"icon":"check","label":"Heavy-duty rivet reinforcement for added strength"},
    {"icon":"check","label":"Designed for demanding daily site use"},
    {"icon":"check","label":"Secure fit with quick and easy access"},
    {"icon":"check","label":"Built for scaffolders, construction workers, and trade professionals"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Orders dispatched within 3 working days.",
    "UK delivery and international delivery quoted on request — contact us for details."
  ]'::jsonb,
  null, 'SITE LEVEL HOLDER', 5
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'site-single-bubble-level-holder');

-- 4. Cross-list the product across all five trades (idempotent).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('scaffolding',   0),
    ('plumbing',      1),
    ('carpentry',     2),
    ('tiling',        3),
    ('stone-masonry', 4)
  ) as v(cat_slug, s)
where p.slug = 'site-single-bubble-level-holder'
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- 5. Hero image (also seeded as gallery image 0).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledsdfasdaaaasdasdasd.png?tr=w-1600,q-90,f-auto',
  'Site Single Bubble Level Holder — leather pouch on belt',
  0
from public.hammerex_products p
where p.slug = 'site-single-bubble-level-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 6. What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('Leather site level holder', 1, 'https://ik.imagekit.io/pinky/Untitledsdfasdaaaasdasdasd.png?tr=w-800,q-85,f-auto', 0)
  ) as v(l, q, u, s)
where p.slug = 'site-single-bubble-level-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 7. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',      'Body',          'Thick premium-grade leather',                 0),
    ('Material',      'Construction',  'Heavy-duty rivet reinforcement at stress points', 1),
    ('Fit',           'Site level',    'Fits all standard single bubble site levels', 10),
    ('Fit',           'Belt loop',     'Universal — work belts up to 6cm wide',       11),
    ('Use',           'Built for',     'Scaffolders, construction workers, trades',   20),
    ('Build & care',  'Made in',       'United Kingdom',                              30),
    ('Build & care',  'Warranty',      '1 year (manufacturing defects)',              31)
  ) as v(g, l, val, s)
where p.slug = 'site-single-bubble-level-holder'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id);
