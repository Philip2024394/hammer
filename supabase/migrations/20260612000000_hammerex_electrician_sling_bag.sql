-- HAMMEREX Electrician Bag Sling — £19.99 (399,800 IDR @ 20,000/£).
-- Primary: electrical (per trade alias: electrician → electrical).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'HAMMEREX Electrician Bag Sling',
  'Compact 27 × 23 × 12cm water-repellent electrician sling bag — multiple front tool holders, large main compartment and internal side pockets for meters and testers.',
  399800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2001_27_30%20AM.png',
  true,
  'electrician-sling-bag', 'HX-ESB-001', 'Hammerex', 'HX-ESB', '14:00',
  1, 'United Kingdom',
  E'Built for professionals who need reliable tool storage on the go, the HAMMEREX Electrician Bag Sling combines durability, organisation and comfort in a compact, jobsite-ready design. Whether you''re an electrician, technician, maintenance worker or DIY enthusiast, this versatile tool bag keeps your essential tools organised and within easy reach.\n\nMeasuring just 27cm × 23cm × 12cm, the bag offers a compact footprint without compromising storage capacity. The rugged, water-repellent construction helps protect your tools from dust, moisture and everyday jobsite conditions, while the adjustable shoulder strap ensures comfortable carrying throughout the working day.\n\nThe front exterior features multiple tool storage pockets designed to accommodate screwdrivers, pliers, cutters and hand tools of various sizes. Inside, a spacious main compartment provides ample room for larger tools and accessories, while integrated side pockets offer secure storage for electrical meters, testers, tape measures and other essential equipment.\n\nIdeal for electrical installations and maintenance, service and repair work, construction projects, home improvement and mobile technicians.',
  '[
    {"icon":"check","label":"Compact size: 27cm × 23cm × 12cm"},
    {"icon":"check","label":"Durable water-repellent construction"},
    {"icon":"check","label":"Comfortable adjustable shoulder strap"},
    {"icon":"check","label":"Multiple front tool holders for quick access"},
    {"icon":"check","label":"Large main storage compartment"},
    {"icon":"check","label":"Internal side pockets for meters and accessories"},
    {"icon":"check","label":"Lightweight yet rugged design"},
    {"icon":"check","label":"Ideal for electricians, technicians, maintenance professionals and general trades"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request.",
    "Bulk and trade pricing available — speak to our team via the partners page."
  ]'::jsonb,
  null, 'ELECTRICIAN SLING BAG', 14
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'electrician-sling-bag');

-- Hero image.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2001_27_30%20AM.png',
  'HAMMEREX Electrician Bag Sling with adjustable shoulder strap',
  0
from public.hammerex_products p
where p.slug = 'electrician-sling-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, null, v.s
from public.hammerex_products p,
  (values
    ('HAMMEREX Electrician Bag Sling', 0),
    ('Adjustable shoulder strap',      1)
  ) as v(l, s)
where p.slug = 'electrician-sling-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',    'Width',           '27cm',                                                   0),
    ('Dimensions',    'Height',          '23cm',                                                   1),
    ('Dimensions',    'Depth',           '12cm',                                                   2),
    ('Material',      'Construction',    'Rugged water-repellent fabric',                          10),
    ('Material',      'Protection',      'Resists dust, moisture and everyday jobsite conditions', 11),
    ('Storage',       'Front pockets',   'Multiple holders for screwdrivers, pliers, cutters and hand tools', 20),
    ('Storage',       'Main compartment','Spacious main compartment for larger tools and accessories', 21),
    ('Storage',       'Side pockets',    'Internal side pockets for meters, testers and tape measures', 22),
    ('Carry',         'Strap',           'Adjustable shoulder strap',                              30),
    ('Use',           'Suitable for',    'Electrical install, service & repair, construction, home improvement, mobile techs', 40),
    ('Use',           'Built for',       'Electricians, technicians, maintenance professionals',   41),
    ('Build & care',  'Made in',         'United Kingdom',                                         50),
    ('Build & care',  'Warranty',        '1 year (manufacturing defects)',                         51)
  ) as v(g, l, val, s)
where p.slug = 'electrician-sling-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
