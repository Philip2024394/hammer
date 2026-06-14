-- Hammerex Heavy Duty Lifting Bags & Bucket — three products under a new
-- "lifting" trade. No thread colour option. Cross-listed across:
--   scaffolding, carpentry, drywall, plastering.
--
-- Prices (canonical IDR; per src/lib/fx.ts, 1 GBP = 20,000 IDR):
--   30kg Lifting Bag     £15  → 300,000 IDR
--   50kg Lifting Bag     £17  → 340,000 IDR
--   Lifting Bucket 50kg  £25  → 500,000 IDR

-- 1. New trade category for lifting equipment.
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('lifting', 'Lifting',
   'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
   315)
on conflict (slug) do nothing;

-- 2. Products. Primary category = lifting; cross-listing handled in step 3.

-- 2a. 30kg Lifting Bag — £15
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  '30kg Lifting Bag',
  'Heavy-duty 30kg lifting bag for builders, plasterers and tradespeople — reinforced stitching and stitched handles.',
  300000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_16_28%20PM.png',
  true,
  '30kg-lifting-bag', 'HX-LB30-001', 'Hammerex', 'HX-LB30', '14:00',
  1, 'United Kingdom',
  E'The Hammerex 30kg Lifting Bag is designed for builders, plasterers, and tradespeople who need a reliable solution for carrying and storing construction materials. Manufactured from heavy-duty industrial fabric with reinforced stitching, this bag is built to withstand demanding site conditions while providing comfortable and secure handling.\n\nIdeal for moving rubble, tools, aggregates, sand, and general site materials. Compact and foldable for convenient storage between jobs.',
  '[
    {"icon":"check","label":"Safe working load up to 30kg"},
    {"icon":"check","label":"Reinforced heavy-duty construction"},
    {"icon":"check","label":"Durable stitched lifting handles"},
    {"icon":"check","label":"Suitable for rubble, tools, aggregates, sand and site materials"},
    {"icon":"check","label":"Water-resistant and easy to clean"},
    {"icon":"check","label":"Compact, foldable design for convenient storage"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "UK delivery available — international shipping quoted on request.",
    "Orders dispatched within 3 working days (subject to stock and order volume)."
  ]'::jsonb,
  null, 'HEAVY-DUTY 30KG LIFTING BAG', 6
from public.hammerex_categories c
where c.slug = 'lifting'
and not exists (select 1 from public.hammerex_products where slug = '30kg-lifting-bag');

-- 2b. 50kg Lifting Bag — £17
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  '50kg Lifting Bag',
  'Reinforced 50kg lifting bag for heavy aggregates, cement and site waste — industrial fabric, twin lifting handles.',
  340000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
  true,
  '50kg-lifting-bag', 'HX-LB50-001', 'Hammerex', 'HX-LB50', '14:00',
  1, 'United Kingdom',
  E'Built for heavier loads, the Hammerex 50kg Lifting Bag offers exceptional strength and durability for demanding construction and landscaping applications. Featuring reinforced seams and robust lifting handles, this bag is designed to transport heavy materials safely and efficiently around the job site.\n\nIdeal for rubble, aggregates, cement products and site waste — built for repeated daily use.',
  '[
    {"icon":"check","label":"Safe working load up to 50kg"},
    {"icon":"check","label":"Heavy-duty reinforced stitching throughout"},
    {"icon":"check","label":"Industrial-grade fabric construction"},
    {"icon":"check","label":"Strong lifting handles for easy transportation"},
    {"icon":"check","label":"Ideal for rubble, aggregates, cement products and site waste"},
    {"icon":"check","label":"Durable design for repeated daily use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "UK delivery available — international shipping quoted on request.",
    "Orders dispatched within 3 working days (subject to stock and order volume)."
  ]'::jsonb,
  null, 'HEAVY-DUTY 50KG LIFTING BAG', 7
from public.hammerex_categories c
where c.slug = 'lifting'
and not exists (select 1 from public.hammerex_products where slug = '50kg-lifting-bag');

-- 2c. Heavy Duty Lifting Bucket 50kg — £25
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Heavy Duty Lifting Bucket 50kg',
  'Site-grade 50kg lifting bucket for mortar, plaster, debris and tools — reinforced lifting points.',
  500000,
  'https://ik.imagekit.io/pinky/WWWWWWWWWWWWWWW.png',
  true,
  'lifting-bucket-50kg', 'HX-LBKT50-001', 'Hammerex', 'HX-LBKT50', '14:00',
  1, 'United Kingdom',
  E'The Hammerex Heavy Duty Lifting Bucket is a versatile site essential designed for carrying mortar, plaster, debris, tools and construction materials. Manufactured from robust materials and fitted with strong lifting points, it provides a practical solution for material handling on site.\n\nWeather-resistant and easy to clean — designed for professional trade use.',
  '[
    {"icon":"check","label":"Safe working load up to 50kg"},
    {"icon":"check","label":"Heavy-duty construction"},
    {"icon":"check","label":"Strong lifting handles"},
    {"icon":"check","label":"Suitable for mortar, plaster, rubble and general site materials"},
    {"icon":"check","label":"Durable and weather-resistant"},
    {"icon":"check","label":"Easy to clean and maintain"},
    {"icon":"check","label":"Designed for professional trade use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "UK delivery available — international shipping quoted on request.",
    "Orders dispatched within 3 working days (subject to stock and order volume)."
  ]'::jsonb,
  null, 'HEAVY-DUTY 50KG LIFTING BUCKET', 8
from public.hammerex_categories c
where c.slug = 'lifting'
and not exists (select 1 from public.hammerex_products where slug = 'lifting-bucket-50kg');

-- 3. Cross-list all three products across the four sibling trades
--    (scaffolding / carpentry / drywall / plastering). Idempotent.
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
where p.slug in ('30kg-lifting-bag', '50kg-lifting-bag', 'lifting-bucket-50kg')
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- 4. Hero images (also gallery image 0 for each product).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, v.alt, 0
from public.hammerex_products p,
  (values
    ('30kg-lifting-bag',
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_16_28%20PM.png',
     '30kg Lifting Bag — heavy-duty reinforced fabric with stitched handles'),
    ('50kg-lifting-bag',
     'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png',
     '50kg Lifting Bag — industrial-grade fabric with twin lifting handles'),
    ('lifting-bucket-50kg',
     'https://ik.imagekit.io/pinky/WWWWWWWWWWWWWWW.png',
     'Heavy Duty Lifting Bucket 50kg — reinforced lifting points')
  ) as v(slug, url, alt)
where p.slug = v.slug
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 5. What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('30kg-lifting-bag',    'Heavy-duty 30kg lifting bag', 1, null, 0),
    ('50kg-lifting-bag',    'Heavy-duty 50kg lifting bag', 1, null, 0),
    ('lifting-bucket-50kg', 'Heavy-duty 50kg lifting bucket', 1, null, 0)
  ) as v(slug, l, q, u, s)
where p.slug = v.slug
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- 6. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    -- 30kg bag
    ('30kg-lifting-bag', 'Capacity', 'Safe working load', '30kg',                                  0),
    ('30kg-lifting-bag', 'Material', 'Body',              'Heavy-duty industrial fabric',         10),
    ('30kg-lifting-bag', 'Material', 'Construction',      'Reinforced stitching throughout',      11),
    ('30kg-lifting-bag', 'Handles',  'Lifting',           'Durable stitched lifting handles',     20),
    ('30kg-lifting-bag', 'Use',      'Suitable for',      'Rubble, tools, aggregates, sand, materials', 30),
    ('30kg-lifting-bag', 'Care',     'Cleaning',          'Water-resistant, easy to clean',       40),
    ('30kg-lifting-bag', 'Build',    'Made in',           'United Kingdom',                       50),
    ('30kg-lifting-bag', 'Build',    'Warranty',          '1 year (manufacturing defects)',       51),

    -- 50kg bag
    ('50kg-lifting-bag', 'Capacity', 'Safe working load', '50kg',                                  0),
    ('50kg-lifting-bag', 'Material', 'Body',              'Industrial-grade heavy-duty fabric',   10),
    ('50kg-lifting-bag', 'Material', 'Construction',      'Heavy-duty reinforced stitching',      11),
    ('50kg-lifting-bag', 'Handles',  'Lifting',           'Strong reinforced lifting handles',    20),
    ('50kg-lifting-bag', 'Use',      'Suitable for',      'Rubble, aggregates, cement products, site waste', 30),
    ('50kg-lifting-bag', 'Care',     'Use cycle',         'Designed for repeated daily use',      40),
    ('50kg-lifting-bag', 'Build',    'Made in',           'United Kingdom',                       50),
    ('50kg-lifting-bag', 'Build',    'Warranty',          '1 year (manufacturing defects)',       51),

    -- 50kg bucket
    ('lifting-bucket-50kg', 'Capacity', 'Safe working load', '50kg',                                  0),
    ('lifting-bucket-50kg', 'Material', 'Body',              'Heavy-duty construction',              10),
    ('lifting-bucket-50kg', 'Handles',  'Lifting',           'Strong lifting handles & lifting points', 20),
    ('lifting-bucket-50kg', 'Use',      'Suitable for',      'Mortar, plaster, rubble, site materials, tools', 30),
    ('lifting-bucket-50kg', 'Care',     'Weather',           'Weather-resistant, easy to clean',     40),
    ('lifting-bucket-50kg', 'Build',    'Made in',           'United Kingdom',                       50),
    ('lifting-bucket-50kg', 'Build',    'Warranty',          '1 year (manufacturing defects)',       51)
  ) as v(slug, g, l, val, s)
where p.slug = v.slug
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
