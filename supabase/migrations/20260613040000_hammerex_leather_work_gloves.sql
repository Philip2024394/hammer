-- HAMMEREX Leather Work Gloves — premium soft leather, touchscreen fingertips,
-- water-repellent finish. Sizes L–XL. £8.50 GBP (Rp 170,000 @ 20k/£).
-- Cross-listed to every category (general PPE — all trades).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, sizes, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Leather Work Gloves',
  'Premium soft-leather work gloves — touchscreen fingertips, water-repellent finish, all-day comfort for construction, scaffolding, landscaping, agriculture and general trade use.',
  170000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2006_03_35%20AM.png?updatedAt=1781305436808',
  true,
  'leather-work-gloves', 'HX-LWG-001', 'Hammerex', 'HX-LWG', '14:00',
  1, 'United Kingdom',
  E'**Built for hard work. Designed for comfort.**\n\nDesigned for hardworking tradespeople, the HAMMEREX Leather Work Gloves deliver comfort, durability, and protection throughout the working day. Crafted from premium soft leather, these gloves provide an excellent fit while maintaining the flexibility needed for handling tools, materials, and equipment with confidence.\n\nFeaturing touchscreen-compatible fingertips, you can operate smartphones, tablets, and site devices without removing your gloves, helping you stay productive on the job. The water-repellent leather finish helps keep hands drier in damp working conditions, making them suitable for construction, scaffolding, landscaping, agriculture, and general trade use.\n\nBuilt to withstand demanding environments while remaining comfortable for extended wear, HAMMEREX Leather Work Gloves are the ideal choice for professionals who expect performance from their workwear.',
  '[
    {"icon":"check","label":"Premium soft leather construction"},
    {"icon":"check","label":"Touchscreen-compatible fingertips"},
    {"icon":"check","label":"Water-repellent finish"},
    {"icon":"check","label":"Comfortable all-day wear"},
    {"icon":"check","label":"Flexible fit for improved dexterity"},
    {"icon":"check","label":"Durable design for daily site use"},
    {"icon":"check","label":"Suitable for construction, scaffolding, landscaping, farming, and general trades"}
  ]'::jsonb,
  'GBP', 3, true,
  '["L","XL"]'::jsonb,
  '[
    "Pick your size above — L or XL.",
    "In stock — dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'LEATHER WORK GLOVES', 19
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'leather-work-gloves');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2006_03_35%20AM.png?updatedAt=1781305436808',
  'Hammerex Leather Work Gloves — premium soft leather with touchscreen fingertips',
  0
from public.hammerex_products p
where p.slug = 'leather-work-gloves'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (general PPE).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'leather-work-gloves'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Pair of Hammerex Leather Work Gloves (size as selected)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'leather-work-gloves'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium soft leather',                             0),
    ('Material',     'Finish',         'Water-repellent',                                  1),
    ('Design',       'Fingertips',     'Touchscreen-compatible (phone, tablet, site devices)', 10),
    ('Design',       'Fit',            'Flexible — improved dexterity for tool handling',  11),
    ('Sizing',       'Sizes available','L, XL',                                            20),
    ('Pricing',      'Single pair',    '£8.50',                                            30),
    ('Stock',        'Availability',   'In stock',                                         40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        41),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        42),
    ('Use',          'Built for',      'Construction, scaffolding, landscaping, agriculture, general trades', 50),
    ('Build & care', 'Made in',        'United Kingdom',                                   60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   61)
  ) as v(g, l, val, s)
where p.slug = 'leather-work-gloves'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
