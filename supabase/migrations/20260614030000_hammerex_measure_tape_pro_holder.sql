-- HAMMEREX Measure Tape Pro Holder — three user-selectable sizes (5m / 8m /
-- 10m). £18.70 GBP per size (Rp 445,565 @ current fx.ts rate). Dispatch lead time is 5 working days for this
-- model (overrides the usual 3-day Hammerex default). Primary category:
-- carpentry. Cross-listed to EVERY existing category at user request
-- ("all category").

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Measure Tape Pro Holder',
  'Premium measure tape pro holder — secure and stylish carry for your tape measure. Choose 5m / 8m / 10m. Heavy-duty construction, quick access.',
  445565,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_01_42%20AM.png',
  true,
  'measure-tape-pro-holder', 'HX-MTP-001', 'Hammerex', 'HX-MTP', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Measure Tape Pro Holder\n\nDesigned for tradespeople who demand both performance and style, the **HammerEX Measure Tape Pro Holder** is built to keep your measuring tape secure, accessible, and ready for action throughout the workday.\n\nAvailable in **three sizes** to ensure the perfect fit for your tape measure:\n\n* 5 Meter\n* 8 Meter\n* 10 Meter\n\nThe Measure Tape Pro Holder speaks attitude from every angle, combining rugged durability with a professional appearance that stands out on site. Crafted with attention to detail and engineered for everyday use, this holder delivers the premium quality and reliability that HammerEX is known for.\n\nIts practical design allows for quick insertion and removal of your tape measure while maintaining a secure hold during movement, climbing, and demanding job-site tasks. Built from quality materials and reinforced for long-lasting performance, it is made to withstand the toughest working conditions.\n\n### Features\n\n* Available in 5m, 8m, and 10m sizes\n* Designed for a secure and precise tape measure fit\n* Quick access for fast retrieval and storage\n* Heavy-duty construction for daily professional use\n* Stylish HammerEX design with premium craftsmanship\n* Comfortable to wear on your work belt throughout the day\n\n### Why Choose HammerEX?\n\nEvery HammerEX product is crafted with a focus on durability, functionality, and professional-grade performance. The Measure Tape Pro Holder is no exception. Built to exceed expectations, it delivers the perfect combination of convenience, strength, and site-ready style.\n\n**HAMMEREX – Built Tough. Built for the Trade.**',
  '[
    {"icon":"check","label":"Available in 5m, 8m and 10m sizes"},
    {"icon":"check","label":"Designed for a secure and precise tape measure fit"},
    {"icon":"check","label":"Quick access for fast retrieval and storage"},
    {"icon":"check","label":"Heavy-duty construction for daily professional use"},
    {"icon":"check","label":"Stylish HammerEX design with premium craftsmanship"},
    {"icon":"check","label":"Comfortable to wear on your work belt throughout the day"}
  ]'::jsonb,
  'GBP', 5, true,
  '[
    "Pick your tape size above — 5m / 8m / 10m.",
    "In stock — dispatched within 5 working days for this model.",
    "Typical UK delivery within 5 working days after dispatch.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'MEASURE TAPE PRO — CHOOSE SIZE', 38
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'measure-tape-pro-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_01_42%20AM.png',
  'Hammerex Measure Tape Pro Holder — three sizes, heavy-duty premium build',
  0
from public.hammerex_products p
where p.slug = 'measure-tape-pro-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'measure-tape-pro-holder'
on conflict (product_id, category_id) do nothing;

-- Three size variants. £18.70 GBP per size — same price across sizes.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('5 Meter',  'HX-MTP-5M',  445565,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_01_42%20AM.png',
       'HX-MTP-5M',  0, true,  60),
    ('8 Meter',  'HX-MTP-8M',  445565,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_01_42%20AM.png',
       'HX-MTP-8M',  1, false, 60),
    ('10 Meter', 'HX-MTP-10M', 445565,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_01_42%20AM.png',
       'HX-MTP-10M', 2, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'measure-tape-pro-holder'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Measure Tape Pro Holder (size as selected)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'measure-tape-pro-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Brand',        'Product type',   'Measure Tape Pro Holder',                               1),
    ('Material',     'Construction',   'Heavy-duty, reinforced for long-lasting performance',  10),
    ('Capacity',     'Sizes',          '5m / 8m / 10m tape measures — pick above',             20),
    ('Design',       'Access',         'Quick insertion and removal',                          30),
    ('Design',       'Retention',      'Secure hold during movement and climbing',             31),
    ('Use',          'Built for',      'Tradespeople demanding performance and style',         40),
    ('Pricing',      'Per size',       '£18.70 — same price across all three sizes',           50),
    ('Stock',        'Availability',   'In stock — all sizes',                                 60),
    ('Dispatch',     'Lead time',      'Dispatched within 5 working days of order',            61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days after dispatch', 62),
    ('Build & care', 'Made in',        'United Kingdom',                                        70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        71)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-pro-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
