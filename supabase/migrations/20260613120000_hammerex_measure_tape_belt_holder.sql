-- HAMMEREX Measure Tape Belt Holder — leather, industrial sewn, fits tape
-- measures up to 8m, soft-close button belt loop. £9.80 GBP (Rp 196,000 @
-- 20k/£). Primary category: carpentry. Cross-listed to EVERY existing
-- category at user request ("add to all category").

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Measure Tape Belt Holder',
  'Heavy-duty leather tape measure belt holder — fits tapes up to 8m, soft-close button belt loop, open-top fast access. Industrial sewn for daily site use.',
  196000,
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsdhhjhjhj.png',
  true,
  'measure-tape-belt-holder', 'HX-MTAP-001', 'Hammerex', 'HX-MTAP', '14:00',
  1, 'United Kingdom',
  E'Keep your tape measure secure, accessible, and ready for work with the **HAMMEREX Measure Tape Belt Holder**. Designed for construction professionals, tradespeople, and DIY users, this heavy-duty holder provides a reliable way to carry your tape measure while keeping your hands free on the job.\n\nManufactured from durable leather and **industrial sewn** for long-lasting performance, the holder is built to withstand demanding worksite conditions. The reinforced belt loop features a **soft-close button** for quick attachment and removal from your work belt, while maintaining a secure hold throughout the day.\n\nThe compact **open-top design** allows fast access to your tape measure, reducing downtime and improving efficiency on site.\n\n### Features\n\n* Fits tape measures up to 8 meters in size\n* Premium leather construction\n* Heavy-duty industrial sewn design\n* Reinforced for strength and durability\n* Soft-close button belt attachment\n* Fast and easy tape measure access\n* Suitable for most work belts\n* Ideal for construction, carpentry, scaffolding, and general trade work\n\n**Built Tough. Built for Professionals. Built by HAMMEREX.**',
  '[
    {"icon":"check","label":"Fits tape measures up to 8 meters in size"},
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Heavy-duty industrial sewn design"},
    {"icon":"check","label":"Reinforced for strength and durability"},
    {"icon":"check","label":"Soft-close button belt attachment"},
    {"icon":"check","label":"Open-top design for fast tape measure access"},
    {"icon":"check","label":"Suitable for most work belts"},
    {"icon":"check","label":"Ideal for construction, carpentry, scaffolding, and general trade work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any HAMMEREX leather tool belt.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TAPE MEASURE BELT HOLDER', 26
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'measure-tape-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsdhhjhjhj.png',
  'Hammerex Measure Tape Belt Holder — heavy-duty leather, industrial sewn, soft-close button',
  0
from public.hammerex_products p
where p.slug = 'measure-tape-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'measure-tape-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Measure Tape Belt Holder', 1, 0),
    ('Reinforced soft-close button belt loop', 1, 1)
  ) as v(l, q, s)
where p.slug = 'measure-tape-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                       0),
    ('Material',     'Stitching',      'Industrial sewn — reinforced for strength',             1),
    ('Capacity',     'Tape measure',   'Fits tape measures up to 8 metres',                    10),
    ('Design',       'Access',         'Open-top design for fast tape access',                 20),
    ('Design',       'Belt loop',      'Reinforced loop with soft-close button',               21),
    ('Fit',          'Belt width',     'Suitable for most professional work belts',            30),
    ('Pricing',      'Single unit',    '£9.80',                                                40),
    ('Stock',        'Availability',   'In stock',                                             50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            52),
    ('Use',          'Built for',      'Construction, carpentry, scaffolding, general trades', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                       70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                       71)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
