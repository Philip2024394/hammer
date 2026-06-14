-- HAMMEREX Triple Station Scaffolder's Spanner Belt Holder — three drop-in
-- spanner stations, belt-mounted, scaffolding-specific.
-- £12.80 GBP (Rp 256,000 @ 20k/£). Scaffolding category only.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex 3 Spanner Belt Holder',
  'Triple-station drop-in spanner holder for scaffolders — three dedicated stations for fast access, heavy-duty belt-mounted construction.',
  256000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2001_26_22%20AM.png?updatedAt=1781288805121',
  true,
  '3-spanner-belt-holder', 'HX-3SBH-001', 'Hammerex', 'HX-3SBH', '14:00',
  1, 'United Kingdom',
  E'**Three spanners. One station. Hands free.**\n\nKeep your most-used scaffolding spanners exactly where you need them with the HAMMEREX Triple Station Scaffolder''s Spanner Belt Holder. Designed for speed, convenience, and durability, this holder provides three dedicated stations for quick access to your essential scaffold spanners throughout the working day.\n\nThe simple drop-in and lift-out design allows you to store and retrieve your tools effortlessly, helping you work more efficiently while keeping your hands free when climbing, positioning, or handling scaffold components.\n\nManufactured to a high-quality standard, this holder is built to withstand the demands of daily use in the scaffolding industry. Whether you''re erecting, dismantling, or inspecting scaffolding, the HAMMEREX Triple Station Holder keeps your tools secure and within easy reach.',
  '[
    {"icon":"check","label":"Triple spanner storage stations"},
    {"icon":"check","label":"Fast drop-in, lift-out access"},
    {"icon":"check","label":"Keeps essential tools organised and readily available"},
    {"icon":"check","label":"Heavy-duty construction for daily site use"},
    {"icon":"check","label":"Designed specifically for scaffolders"},
    {"icon":"check","label":"Comfortable belt-mounted design"},
    {"icon":"check","label":"Suitable for most work belts"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Manufactured in production batches.",
    "Orders dispatched within approximately 3 business days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'TRIPLE SPANNER STATION', 16
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = '3-spanner-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2001_26_22%20AM.png?updatedAt=1781288805121',
  'Hammerex 3 Spanner Belt Holder — triple-station scaffolder''s spanner holder',
  0
from public.hammerex_products p
where p.slug = '3-spanner-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to scaffolding only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = '3-spanner-belt-holder' and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex 3 Spanner Belt Holder', 1, 0),
    ('Universal belt loop',            1, 1)
  ) as v(l, q, s)
where p.slug = '3-spanner-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Design',       'Stations',       'Three dedicated spanner stations',                 0),
    ('Design',       'Access',         'Drop-in / lift-out',                               1),
    ('Capacity',     'Spanner fit',    'Standard scaffolding spanners',                    10),
    ('Fit',          'Belt loop',      'Suitable for most work belts',                     20),
    ('Material',     'Construction',   'Heavy-duty — built for daily site use',            30),
    ('Pricing',      'Single unit',    '£12.80',                                           40),
    ('Dispatch',     'Production',     'Manufactured in production batches',               50),
    ('Dispatch',     'Lead time',      'Dispatched within approximately 3 business days',  51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Scaffolders — erecting, dismantling, inspecting',  60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = '3-spanner-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
