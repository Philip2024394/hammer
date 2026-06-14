-- HAMMEREX Strip Nail Holder — £15.70 GBP, single category: carpentry.
-- Per src/lib/fx.ts (1 GBP = 20,000 IDR): £15.70 → 314,000 IDR.
-- No thread colour option.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'HAMMEREX Strip Nail Holder',
  'Heavy-duty open-top pouch for up to 10 nail strips — double-lined, two belt loops up to 70mm.',
  314000,
  'https://ik.imagekit.io/pinky/Untitledsdfsdfsdfsssssasdasdasadsdadsfsdfasdasdasdassfsdfsdfsdfsd.png',
  true,
  'strip-nail-holder', 'HX-SNH-001', 'Hammerex', 'HX-SNH', '14:00',
  1, 'United Kingdom',
  E'Keep your nail strips organised, protected, and always within reach with the HAMMEREX Strip Nail Holder. Designed for professional framers, roofers, carpenters, and builders, this rugged pouch provides fast access to your most-used nail strips while keeping your worksite efficient.\n\nConstructed from heavy-duty industrial-grade materials, the pouch features a double-lined reinforced structure with industrial stitching for maximum durability and long service life on demanding job sites. The reinforced design helps the holder maintain its shape while protecting nail strips from damage during transport and daily use.\n\nThe holder is equipped with two heavy-duty belt loops, providing superior stability and reducing movement while working, climbing, or bending. Designed to fit belts up to 70mm (2.75") wide, it stays secure throughout the day.\n\nThe HAMMEREX Nail Holder offers versatile storage options, allowing nail strips to be carried standing upright for quick access or positioned sideways depending on user preference and working style. The open-top design enables fast one-handed removal when loading nail guns on site.\n\nBuilt tough, built smart, and built for the site — the HAMMEREX Strip Nail Holder is the dependable storage solution for keeping your nail strips secure and ready for action.',
  '[
    {"icon":"check","label":"Holds up to 10 full nail strips"},
    {"icon":"check","label":"Double-lined reinforced construction"},
    {"icon":"check","label":"Two heavy-duty belt loops for added stability"},
    {"icon":"check","label":"Industrial-strength stitching throughout"},
    {"icon":"check","label":"Water-resistant material for site conditions"},
    {"icon":"check","label":"Drainage eyelets to release water and debris"},
    {"icon":"check","label":"Suitable for paper, plastic, and wire collated nail strips"},
    {"icon":"check","label":"Quick-access open-top design"},
    {"icon":"check","label":"Lightweight and compact profile"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "UK delivery available — international shipping quoted on request.",
    "Orders dispatched within 3 working days (subject to stock and order volume)."
  ]'::jsonb,
  null, 'STRIP NAIL HOLDER', 9
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'strip-nail-holder');

-- Hero image (also gallery image 0).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledsdfsdfsdfsssssasdasdasadsdadsfsdfasdasdasdassfsdfsdfsdfsd.png',
  'HAMMEREX Strip Nail Holder — double-lined open-top pouch on belt',
  0
from public.hammerex_products p
where p.slug = 'strip-nail-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('HAMMEREX Strip Nail Holder', 1, null, 0)
  ) as v(l, q, u, s)
where p.slug = 'strip-nail-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',      'Nail strips',     'Up to 10 full strips',                        0),
    ('Compatibility', 'Strip types',     'Paper, plastic and wire collated nail strips', 1),
    ('Material',      'Body',            'Heavy-duty industrial-grade fabric',         10),
    ('Material',      'Construction',    'Double-lined reinforced with industrial stitching', 11),
    ('Material',      'Water resistance', 'Water-resistant with drainage eyelets',     12),
    ('Fit',           'Belt loops',      'Two heavy-duty loops',                       20),
    ('Fit',           'Belt width',      'Up to 70mm (2.75")',                         21),
    ('Use',           'Carry options',   'Upright or sideways; open-top one-hand access', 30),
    ('Dimensions',    'Height',          '230mm (9")',                                 40),
    ('Dimensions',    'Width',           '120mm (4.7")',                               41),
    ('Dimensions',    'Depth',           '70mm (2.75")',                               42),
    ('Build & care',  'Made in',         'United Kingdom',                             50),
    ('Build & care',  'Warranty',        '1 year (manufacturing defects)',             51)
  ) as v(g, l, val, s)
where p.slug = 'strip-nail-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
