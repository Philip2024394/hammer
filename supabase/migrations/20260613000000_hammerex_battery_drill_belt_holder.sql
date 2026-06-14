-- HAMMEREX Battery Drill Belt Holder — fast drop-in, adjustable handle position,
-- fits compact through full-size battery drills, belts up to 4" (100mm).
-- £17.80 GBP (Rp 356,000 @ 20k/£). Cross-listed to every category — multi-trade.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Battery Drill Belt Holder',
  'Heavy-duty drop-in drill holder — adjustable for compact and full-size battery drills, customizable handle positioning, fits belts up to 4" wide, left or right-hand use.',
  356000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2003_09_09%20AM.png?updatedAt=1781294978358',
  true,
  'battery-drill-belt-holder', 'HX-BDBH-001', 'Hammerex', 'HX-BDBH', '14:00',
  1, 'United Kingdom',
  E'**Drop it. Grab it. Keep working.**\n\nThe HAMMEREX Battery Drill Belt Holder is designed to keep your drill secure, accessible, and ready for action at all times. Built for tradespeople who demand efficiency on-site, this holder allows you to simply drop your drill into place and continue working without the hassle of setting tools down or searching for them later.\n\nIts adjustable design accommodates compact, standard, and larger battery drills, making it one of the most versatile drill holders available. The handle position can be adjusted to suit different drill styles, reducing unwanted movement, handle shake, and drill tilt while you work.\n\nWhether you''re climbing ladders, working on scaffolding, roofing, framing, or general construction, the HAMMEREX Battery Drill Belt Holder keeps your drill exactly where you need it — secure, accessible, and ready for the next task.',
  '[
    {"icon":"check","label":"Fast drop-in design for quick drill access"},
    {"icon":"check","label":"Adjustable to suit compact and full-size battery drills"},
    {"icon":"check","label":"Customizable handle positioning for improved stability"},
    {"icon":"check","label":"Reduces drill movement and unwanted tilting"},
    {"icon":"check","label":"Heavy-duty construction built for jobsite use"},
    {"icon":"check","label":"Fits most tool belts from narrow belts up to 4\" wide"},
    {"icon":"check","label":"Suitable for left or right-hand use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Versatile fit — pairs with any HAMMEREX or third-party tool belt up to 4\" wide.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'DROP-IN DRILL STATION', 15
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'battery-drill-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2003_09_09%20AM.png?updatedAt=1781294978358',
  'Hammerex Battery Drill Belt Holder — adjustable drop-in drill station',
  0
from public.hammerex_products p
where p.slug = 'battery-drill-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (multi-trade tool).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'battery-drill-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Battery Drill Belt Holder', 1, 0),
    ('Adjustable handle position hardware', 1, 1),
    ('Universal belt loop (up to 4")',     1, 2)
  ) as v(l, q, s)
where p.slug = 'battery-drill-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Design',       'Access',         'Fast drop-in / lift-out',                          0),
    ('Design',       'Handle',         'Adjustable position — compact, standard, large drills', 1),
    ('Capacity',     'Drill fit',      'Compact through full-size battery drills',         10),
    ('Fit',          'Belt loop',      'Fits belts up to 4" (100mm) wide',                 20),
    ('Fit',          'Handed-ness',    'Left or right-hand use',                           21),
    ('Material',     'Construction',   'Heavy-duty — built for jobsite use',               30),
    ('Pricing',      'Single unit',    '£17.80',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        50),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        51),
    ('Use',          'Built for',      'Carpenters, scaffolders, roofers, framers, general construction', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'battery-drill-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
