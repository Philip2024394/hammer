-- HAMMEREX Marker Belt Holder — low-profile leather, reinforced stud supports,
-- fits all marker sizes, belts up to 60mm. £10.99 (Rp 219,800 @ 20k/£).
-- Primary category: carpentry. Cross-listed to EVERY existing category at
-- user request.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Marker Belt Holder',
  'Compact leather marker belt holder — reinforced stud supports, fits markers of all sizes, low-profile design for belts up to 60mm.',
  219800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_01_24%20PM.png?updatedAt=1781265714850',
  true,
  'marker-belt-holder', 'HX-MBH-001', 'Hammerex', 'HX-MBH', '14:00',
  1, 'United Kingdom',
  E'**Simple. Effective. Compact.**\n\nThe Hammerex Marker Belt Holder is designed to carry markers of all sizes while requiring minimal belt space. Crafted from durable leather with reinforced stud supports, it offers secure retention and long-lasting performance.\n\nCompatible with belts up to 6 cm wide, it''s the perfect low-profile solution for keeping your marker within easy reach.',
  '[
    {"icon":"check","label":"Durable leather construction"},
    {"icon":"check","label":"Reinforced stud supports for secure retention"},
    {"icon":"check","label":"Fits markers of all sizes"},
    {"icon":"check","label":"Low-profile design — minimal belt space"},
    {"icon":"check","label":"Fits belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Long-lasting performance for daily site use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Low-profile design — pairs easily with other belt holders.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'COMPACT MARKER STATION', 14
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'marker-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_01_24%20PM.png?updatedAt=1781265714850',
  'Hammerex Marker Belt Holder — compact leather with reinforced studs',
  0
from public.hammerex_products p
where p.slug = 'marker-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'marker-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Marker Belt Holder',      1, 0),
    ('Reinforced stud supports',         1, 1),
    ('Universal belt loop (up to 60mm)', 1, 2)
  ) as v(l, q, s)
where p.slug = 'marker-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Durable leather',                                  0),
    ('Material',     'Reinforcement',  'Stud supports at high-stress points',              1),
    ('Capacity',     'Marker fit',     'Fits markers of all sizes',                        10),
    ('Design',       'Profile',        'Low-profile — minimal belt space',                 20),
    ('Fit',          'Belt loop',      'Fits belts up to 60mm (6cm) wide',                 30),
    ('Pricing',      'Single unit',    '£10.99',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        50),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        51),
    ('Use',          'Built for',      'All trades — carpenters, painters, sparks, plumbers, scaffolders, masons', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'marker-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
