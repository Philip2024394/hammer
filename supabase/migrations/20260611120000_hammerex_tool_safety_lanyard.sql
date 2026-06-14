-- HAMMEREX Tool Safety Lanyard 90cm — £3.80 each (76,000 IDR @ 20,000/£).
-- Primary: scaffolding. Cross-listed: carpentry, metal-fabrication.
-- 5 colour variants: Black (default), Yellow, Red, Orange, Green.
-- Also linked as Deal Breaker (£2.50 / 50,000 IDR) on every product
-- in the scaffolding category.

-- 1. New trade category for metal fabrication.
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('metal-fabrication', 'Metal Fabrication', null, 316)
on conflict (slug) do nothing;

-- 2. Parent product. Default price = 76,000 IDR; per-variant price set in step 3.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'HAMMEREX Tool Safety Lanyard 90cm',
  'Elasticated 90cm anti-drop tool tether with heavy-duty carabiner — for scaffolders, carpenters and metal fabricators working at height.',
  76000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
  true,
  'hammerex-tool-safety-lanyard-90cm', 'HX-TSL90-001', 'Hammerex', 'HX-TSL90', '14:00',
  1, 'United Kingdom',
  E'Keep your tools secure while working at height with the HAMMEREX 90cm Tool Safety Lanyard. Designed for scaffolders, roofers, steel erectors, dryliners, construction workers and maintenance professionals, this heavy-duty elasticated lanyard helps prevent dropped tools, reducing the risk of injury, equipment damage and lost productivity.\n\nManufactured from durable 20mm wide elasticated webbing, the lanyard expands when required and retracts when not under load, helping to reduce snagging and keeping your work area safer and more organised. The heavy-duty carabiner allows quick attachment to tool belts, harnesses, tool bags and anchor points.\n\nIdeal for securing hammers, spanners, podgers, tape measures, levels, pliers and other hand tools when working on site.\n\nApplications: scaffolding, construction sites, roofing, steel erection, drylining, industrial maintenance, general working at height.\n\nCustom sizes can be manufactured to order to suit your specific requirements.',
  '[
    {"icon":"check","label":"90cm elasticated tool safety lanyard"},
    {"icon":"check","label":"Strong 20mm wide elastic webbing"},
    {"icon":"check","label":"Heavy duty carabiner clip"},
    {"icon":"check","label":"Helps prevent dropped tools"},
    {"icon":"check","label":"Reduces risk of injury and tool damage"},
    {"icon":"check","label":"Lightweight and comfortable to use"},
    {"icon":"check","label":"Suitable for tool belts, harnesses and work bags"},
    {"icon":"check","label":"Professional site and construction use"},
    {"icon":"check","label":"Available in Black, Yellow, Red, Orange and Green"}
  ]'::jsonb,
  'GBP', 4, true,
  '[
    "Selected colours dispatched within 4 working days.",
    "Custom sizes available to order — please specify length when quoting.",
    "Contact us for custom colour and volume orders.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'TOOL SAFETY LANYARD 90CM', 10
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'hammerex-tool-safety-lanyard-90cm');

-- 3. Five colour variants — same price, same default image (replace with
--    per-colour images when available).
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default
from public.hammerex_products p,
  (values
    ('Black',  'HX-TSL90-BLK', 76000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
       'HX-TSL90-BLK', 0, true),
    ('Yellow', 'HX-TSL90-YLW', 76000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
       'HX-TSL90-YLW', 1, false),
    ('Red',    'HX-TSL90-RED', 76000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
       'HX-TSL90-RED', 2, false),
    ('Orange', 'HX-TSL90-ORG', 76000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
       'HX-TSL90-ORG', 3, false),
    ('Green',  'HX-TSL90-GRN', 76000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
       'HX-TSL90-GRN', 4, false)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default)
where p.slug = 'hammerex-tool-safety-lanyard-90cm'
on conflict (product_id, label) do nothing;

-- 4. Hero image.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2006_41_52%20PM.png',
  'HAMMEREX 90cm Tool Safety Lanyard with carabiner clip',
  0
from public.hammerex_products p
where p.slug = 'hammerex-tool-safety-lanyard-90cm'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 5. Cross-list across scaffolding / carpentry / metal-fabrication.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('scaffolding',       0),
    ('carpentry',         1),
    ('metal-fabrication', 2)
  ) as v(cat_slug, s)
where p.slug = 'hammerex-tool-safety-lanyard-90cm'
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- 6. What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, null, v.s
from public.hammerex_products p,
  (values
    ('HAMMEREX 90cm Tool Safety Lanyard', 0),
    ('Heavy-duty carabiner clip',         1),
    ('Tool attachment cord',              2)
  ) as v(l, s)
where p.slug = 'hammerex-tool-safety-lanyard-90cm'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 7. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Specification', 'Length',         '90cm',                                            0),
    ('Specification', 'Material width', '20mm',                                            1),
    ('Specification', 'Material',       'Heavy-duty elasticated webbing',                  2),
    ('Specification', 'Fitting',        'Carabiner clip & tool attachment cord',           3),
    ('Specification', 'Brand',          'HAMMEREX Professional Tools',                     4),
    ('Compatibility', 'Suits',          'Tool belts, harnesses, work bags, anchor points', 10),
    ('Compatibility', 'Tools',          'Hammers, spanners, podgers, tape measures, levels, pliers', 11),
    ('Use',           'Applications',   'Scaffolding, construction, roofing, steel erection, drylining', 20),
    ('Customisation', 'Custom sizes',   'Available to order — specify length when quoting', 30),
    ('Build & care',  'Made in',        'United Kingdom',                                  40),
    ('Build & care',  'Warranty',       '1 year (manufacturing defects)',                  41)
  ) as v(g, l, val, s)
where p.slug = 'hammerex-tool-safety-lanyard-90cm'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);

-- 8. Deal Breaker — link this lanyard to every product whose primary category
--    OR cross-list is "scaffolding". Deal Breaker price 50,000 IDR (£2.50).
insert into public.hammerex_deal_breakers (anchor_product_id, item_product_id, deal_price_idr, sort_order)
select distinct anchor.id, lanyard.id, 50000, 50
from public.hammerex_products lanyard,
  public.hammerex_products anchor,
  public.hammerex_categories scaff
where lanyard.slug = 'hammerex-tool-safety-lanyard-90cm'
and scaff.slug = 'scaffolding'
and anchor.id <> lanyard.id
and (
  anchor.category_id = scaff.id
  or exists (
    select 1 from public.hammerex_product_trades t
    where t.product_id = anchor.id and t.category_id = scaff.id
  )
)
on conflict (anchor_product_id, item_product_id) do nothing;
