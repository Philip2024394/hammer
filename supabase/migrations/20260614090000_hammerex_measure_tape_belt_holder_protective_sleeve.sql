-- HAMMEREX Measure Tape Belt Holder With Protective Sleeve — premium leather
-- with lift-up retention sleeve, reinforced solid core, three selectable
-- sizes (5m / 8m / 10m) at the SAME price (£13.65 = 273,000 IDR). User
-- chose the full "With Protective Sleeve" name to avoid colliding with the
-- existing leather measure-tape-belt-holder product. Primary category:
-- carpentry. Cross-listed to EVERY existing category at user request
-- ("all categories").

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Measure Tape Belt Holder With Protective Sleeve',
  'Premium leather tape holder with lift-up protective sleeve — reinforced solid core, universal fit. Choose 5m / 8m / 10m at the same price.',
  273000,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_58_45%20AM.png',
  true,
  'measure-tape-belt-holder-protective-sleeve', 'HX-MTPS-001', 'Hammerex', 'HX-MTPS', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Measure Tape Belt Holder With Protective Sleeve\n\nDesigned for professionals who demand fast access and maximum security, the **HAMMEREX Measure Tape Belt Holder with Protective Sleeve** provides a reliable and durable solution for carrying tape measures on site. Built from premium leather and engineered with a reinforced internal core, this holder keeps your tape measure secure while allowing smooth, effortless operation throughout the working day.\n\nThe **protective top sleeve** covers the tape measure to prevent accidental loss during climbing, lifting, and movement around busy construction sites. When needed, simply lift the protective sleeve and remove your tape measure in seconds. The **solid internal support core** helps maintain the holder''s shape, making insertion and removal quick, smooth, and frustration-free.\n\nDesigned to accommodate most leading tape measure brands, the universal-fit holder is suitable for **5m, 8m, and 10m tape measures**, making it an ideal choice for scaffolders, builders, roofers, carpenters, and general tradespeople.\n\n### Features\n\n* Protective top sleeve retention system\n* Quick lift-and-release access\n* Reinforced solid internal core for smooth operation\n* Universal fit for most tape measure brands\n* Suitable for 5m, 8m, and 10m tape measures\n* Premium heavy-duty leather construction\n* Secure hold during climbing and movement\n* Professional-grade site durability\n\n### Benefits\n\n* Prevents tape measures from falling out during work\n* Fast one-handed access when measuring is required\n* Internal support core keeps holder open and functional\n* Maintains shape for easy insertion and removal\n* Reduces wear on tape measure clips\n* Comfortable all-day use on busy construction sites\n\n### Ideal For\n\n* Scaffolders · Builders · Carpenters · Roofers\n* Steel Erectors · Construction Workers · Surveyors · Maintenance Trades\n\nThe HAMMEREX Protective Sleeve Tape Holder combines security, durability, and quick access in one professional-grade design, ensuring your tape measure stays protected, secure, and always within reach.\n\n**HAMMEREX – Built For Professionals.**',
  '[
    {"icon":"check","label":"Protective lift-up top sleeve retention system"},
    {"icon":"check","label":"Quick lift-and-release access"},
    {"icon":"check","label":"Reinforced solid internal core for smooth operation"},
    {"icon":"check","label":"Universal fit for most tape measure brands"},
    {"icon":"check","label":"Suitable for 5m, 8m, and 10m tape measures"},
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Secure hold during climbing and movement"},
    {"icon":"check","label":"Professional-grade site durability"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your tape size above — 5m / 8m / 10m. Same price across sizes.",
    "Protective sleeve prevents accidental tape loss during movement and climbing.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TAPE HOLDER + PROTECTIVE SLEEVE — CHOOSE SIZE', 43
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'measure-tape-belt-holder-protective-sleeve');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_58_45%20AM.png',
  'Hammerex Measure Tape Belt Holder With Protective Sleeve — premium leather, lift-up sleeve',
  0
from public.hammerex_products p
where p.slug = 'measure-tape-belt-holder-protective-sleeve'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'measure-tape-belt-holder-protective-sleeve'
on conflict (product_id, category_id) do nothing;

-- Three size variants — all £13.65 (same price across sizes).
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('5 Meter',  'HX-MTPS-5M',  273000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_58_45%20AM.png',
       'HX-MTPS-5M',  0, true,  60),
    ('8 Meter',  'HX-MTPS-8M',  273000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_58_45%20AM.png',
       'HX-MTPS-8M',  1, false, 60),
    ('10 Meter', 'HX-MTPS-10M', 273000,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_58_45%20AM.png',
       'HX-MTPS-10M', 2, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'measure-tape-belt-holder-protective-sleeve'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Measure Tape Belt Holder With Protective Sleeve (size as selected)', 1, 0),
    ('Lift-up protective top sleeve',                                                1, 1),
    ('Reinforced solid internal core',                                               1, 2)
  ) as v(l, q, s)
where p.slug = 'measure-tape-belt-holder-protective-sleeve'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Brand',        'Product type',   'Measure Tape Belt Holder With Protective Sleeve',       1),
    ('Material',     'Body',           'Premium genuine leather',                              10),
    ('Material',     'Internal core',  'Reinforced solid support core',                        11),
    ('Design',       'Retention',      'Protective lift-up top sleeve',                        20),
    ('Design',       'Access',         'Quick lift-and-release one-handed',                    21),
    ('Capacity',     'Tape fit',       'Universal — 5m / 8m / 10m tape measures (pick above)', 30),
    ('Pricing',      'Per size',       '£13.65 — same price across all three sizes',           40),
    ('Stock',        'Availability',   'In stock — all sizes',                                 50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            52),
    ('Use',          'Built for',      'Scaffolders, builders, carpenters, roofers, steel erectors, surveyors, maintenance', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                        70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        71)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-belt-holder-protective-sleeve'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
