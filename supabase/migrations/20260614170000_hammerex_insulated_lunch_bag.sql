-- HAMMEREX Insulated Worker Lunch Bag — rugged insulated lunch bag with
-- dual zipper, padded handle, shoulder strap, side mesh pocket. Size
-- 11" × 8" × 6" (280 × 200 × 150mm, ~8.6L internal). Price intentionally
-- seeded as 0 (placeholder pending user confirmation). Primary category:
-- carpentry. is_universal=true so it appears on every trade category page.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, is_universal
)
select c.id,
  'Hammerex Insulated Worker Lunch Bag',
  'Rugged insulated lunch bag for tradies — 11" × 8" × 6", dual zipper closure, padded handle, shoulder strap, side mesh pocket. Built to keep meals fresh on site.',
  0,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfsdasdas.png',
  true,
  'insulated-worker-lunch-bag', 'HX-LNB-001', 'Hammerex', 'HX-LNB', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Insulated Worker Lunch Bag\n\n**Work Hard. Eat Well. Stay Strong.**\n\nBuilt for tradies, construction workers, scaffolders, mechanics, and hardworking professionals, the **HAMMEREX Insulated Lunch Bag** keeps your meals fresh and protected throughout the workday.\n\nDesigned with a rugged industrial look, this lunch bag features a durable outer shell, heavy-duty zipper closure, reinforced stitching, and premium insulated lining to help maintain food temperature for hours. Whether you''re on-site, travelling between jobs, or heading to the workshop, the HAMMEREX Lunch Bag is built to handle tough environments.\n\nThe compact yet spacious design easily fits lunch containers, sandwiches, fruit, snacks, drinks, and daily essentials while remaining lightweight and easy to carry.\n\n## Features\n\n* Premium insulated thermal lining\n* Heavy-duty water-resistant exterior\n* Industrial HAMMEREX design\n* Strong dual zipper closure\n* Reinforced stitching for durability\n* Comfortable padded carry handle\n* Adjustable shoulder strap included\n* Easy-clean food-safe interior\n* Side mesh pocket for drink bottle or accessories\n* Lightweight and portable\n\n## Dimensions\n\n**External Size**\n\n* Length: 11" (~280 mm)\n* Width: 8" (~200 mm)\n* Height: 6" (~150 mm)\n\n**Internal Capacity**\n\n* Approx. 8.6 Litres\n\n## Ideal For\n\n* Construction Workers · Scaffolders · Bricklayers · Carpenters\n* Electricians · Mechanics · Warehouse Staff · Everyday Work Use\n\n**HAMMEREX – Built Strong. Works Stronger.**',
  '[
    {"icon":"check","label":"Premium insulated thermal lining"},
    {"icon":"check","label":"Heavy-duty water-resistant exterior"},
    {"icon":"check","label":"Strong dual zipper closure"},
    {"icon":"check","label":"Reinforced stitching for durability"},
    {"icon":"check","label":"Comfortable padded carry handle"},
    {"icon":"check","label":"Adjustable shoulder strap included"},
    {"icon":"check","label":"Easy-clean food-safe interior"},
    {"icon":"check","label":"Side mesh pocket for drink bottle or accessories"},
    {"icon":"check","label":"11\" × 8\" × 6\" — approx. 8.6L internal"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'INSULATED LUNCH BAG — 11" × 8" × 6"', 48, true
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'insulated-worker-lunch-bag');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfsdasdas.png',
  'Hammerex Insulated Worker Lunch Bag — rugged insulated bag with dual zipper',
  0
from public.hammerex_products p
where p.slug = 'insulated-worker-lunch-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- No hammerex_product_trades rows needed — is_universal=true makes this
-- appear on every category page via the category loader logic.

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Insulated Worker Lunch Bag (11" × 8" × 6")', 1, 0),
    ('Adjustable shoulder strap',                            1, 1),
    ('Padded carry handle',                                  1, 2)
  ) as v(l, q, s)
where p.slug = 'insulated-worker-lunch-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX',                                                       0),
    ('Brand',        'Product type',   'Insulated Worker Lunch Bag',                                     1),
    ('Material',     'Lining',         'Premium insulated thermal lining',                              10),
    ('Material',     'Exterior',       'Heavy-duty water-resistant',                                    11),
    ('Material',     'Interior',       'Easy-clean food-safe',                                          12),
    ('Material',     'Stitching',      'Reinforced for durability',                                     13),
    ('Design',       'Closure',        'Strong dual zipper',                                            20),
    ('Design',       'Handle',         'Comfortable padded carry handle',                               21),
    ('Design',       'Strap',          'Adjustable shoulder strap (included)',                          22),
    ('Design',       'Pocket',         'Side mesh pocket for drink bottle or accessories',              23),
    ('Dimensions',   'External',       '11" × 8" × 6" (~280 × 200 × 150 mm)',                           30),
    ('Dimensions',   'Internal',       'Approx. 8.6 litres',                                            31),
    ('Pricing',      'Single unit',    'Price set per unit (TBC) — confirm before dispatch',            40),
    ('Stock',        'Availability',   'In stock',                                                      50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                     51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                     52),
    ('Use',          'Ideal for',      'Construction, scaffolding, bricklaying, carpentry, electrical, mechanics, warehouse, everyday work', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                                 70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                 71)
  ) as v(g, l, val, s)
where p.slug = 'insulated-worker-lunch-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
