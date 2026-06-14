-- HAMMEREX Garden Shears Belt Holder — durable leather sheath with soft-close
-- snap button for pruning shears and cutters. Belts up to 60mm.
-- £12.99 GBP (Rp 259,800 @ 20k/£). Primary category: landscaping (no
-- dedicated gardening category — landscaping is the closest fit and is
-- explicitly named in the description).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Shears Belt Holder',
  'Durable leather belt sheath for pruning shears and cutters — soft-close snap button, fits belts up to 60mm, ideal for gardening, landscaping, orchards and ladder work.',
  259800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2009_15_17%20PM.png?updatedAt=1781274512827',
  true,
  'garden-shears-belt-holder', 'HX-GSBH-001', 'Hammerex', 'HX-GSBH', '14:00',
  1, 'United Kingdom',
  E'**Shears in. Snap closed. Up the ladder.**\n\nKeep your garden shears protected, secure, and always within reach with the HAMMEREX Garden Shears Belt Holder. Crafted from durable leather, this holder is designed to safely store your pruning shears and cutters while working in the garden, helping to prevent blade damage and reduce the risk of injury.\n\nThe protective leather design also keeps your cutters safely stored away at the end of the day, extending the life of your tools and protecting surrounding equipment during transport and storage.\n\nFor added security, the holder features a soft-close snap button that keeps your shears firmly in place, making it ideal for ladder work, elevated gardening tasks, and other activities where tool retention is essential.\n\nThe HAMMEREX Garden Shears Belt Holder is the practical solution for gardeners and landscapers who want their tools protected, secure, and ready whenever needed.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Protects blades during use, transport, and storage"},
    {"icon":"check","label":"Soft-close snap button for secure tool retention"},
    {"icon":"check","label":"Suitable for gardening, landscaping, orchards, and pruning work"},
    {"icon":"check","label":"Fits all belt sizes up to 60mm (6cm) wide"},
    {"icon":"check","label":"Comfortable, lightweight, and easy-access design"},
    {"icon":"check","label":"Helps prevent accidental tool drops while working at height"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 business days.",
    "Pairs with any HAMMEREX leather tool belt up to 60mm wide.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN SHEARS SHEATH', 23
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-shears-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2009_15_17%20PM.png?updatedAt=1781274512827',
  'Hammerex Garden Shears Belt Holder — durable leather sheath with soft-close snap',
  0
from public.hammerex_products p
where p.slug = 'garden-shears-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to landscaping only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'garden-shears-belt-holder' and c.slug = 'landscaping'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Garden Shears Belt Holder', 1, 0),
    ('Soft-close snap button',             1, 1),
    ('Universal belt loop (up to 60mm)',   1, 2)
  ) as v(l, q, s)
where p.slug = 'garden-shears-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                  0),
    ('Design',       'Closure',        'Soft-close snap button — secure retention',        10),
    ('Design',       'Blade guard',    'Leather sheath protects blades in use and storage', 11),
    ('Capacity',     'Tool fit',       'Pruning shears and cutters',                       20),
    ('Fit',          'Belt loop',      'Fits belts up to 60mm (6cm) wide',                 30),
    ('Pricing',      'Single unit',    '£12.99',                                           40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 business days of order',       51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Gardeners, landscapers — pruning, orchards, ladder work', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'garden-shears-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
