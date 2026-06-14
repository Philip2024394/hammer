-- BRICKY (Hammerex sub-line) — two bricklayer trowel-station belt holders:
--   1) Magnet Trowel Station + Walkie Talkie Deck — £26.00
--   2) Magnet Trowel Station + Tape Deck         — £14.99
-- Both: primary category bricklaying; cross-listed to adjacent trades
-- (concrete, scaffolding) and tool-types (trowel-holders, belt-holders).
-- Images already in Supabase Storage.

-- ============================================================
-- 1. BRICKY Magnet Trowel Station + Walkie Talkie Deck — £26.00
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'BRICKY Magnet Trowel Station + Walkie Talkie Deck',
  'Magnetic trowel station with integrated walkie-talkie deck — quick push-down trowel release, fits most site radios. Built for professional bricklayers.',
  520000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/0fc2501255169fa4.png',
  true,
  'bricky-magnet-trowel-station-walkie-talkie', 'HX-BMTSW-001', 'BRICKY', 'HX-BMTSW', '14:00',
  1, 'United Kingdom',
  E'Built for professional bricklayers and block layers, the **BRICKY Magnet Trowel Station with Walkie Talkie Deck** combines tool retention and site communication into one practical belt-mounted solution.\n\nWhen working at heights, on large construction projects, or in environments where constant communication is essential, having instant access to your radio can make all the difference. This innovative holder features a dedicated **Walkie Talkie Deck** that securely holds most site radios while keeping them easily accessible throughout the workday.\n\nThe integrated **magnetic trowel station** uses a powerful magnet to securely hold your trowel during climbing, movement, and general site activity. When it''s time to work, simply push down and lift the trowel away for a fast and effortless release. No straps, clips, or complicated locking systems — just reliable retention and instant access.\n\nDesigned to increase productivity and improve workflow, the BRICKY holder keeps your two most important site essentials — your trowel and communication device — securely by your side at all times.\n\n### Features\n\n* Powerful magnetic trowel retention system\n* Quick push-down trowel release design\n* Dedicated Walkie Talkie Deck\n* Fits most site radios and communication devices\n* Secure retention during climbing and movement\n* Heavy-duty construction for demanding site conditions\n* Universal fit for most work belts\n* Fast-access design for improved productivity\n* Built specifically for bricklayers and block layers\n\n### Benefits\n\n* Keeps your trowel secure and ready for use\n* Provides instant access to your walkie talkie\n* Ideal for working at heights and large construction sites\n* Improves communication and site safety\n* Reduces tool handling time\n* Keeps essential equipment organised and within reach\n* Designed for all-day professional use\n\n**BRICKY – Built for the Trade. Connected on Every Site.**',
  '[
    {"icon":"check","label":"Powerful magnetic trowel retention"},
    {"icon":"check","label":"Quick push-down trowel release"},
    {"icon":"check","label":"Dedicated Walkie Talkie Deck"},
    {"icon":"check","label":"Fits most site radios and communication devices"},
    {"icon":"check","label":"Heavy-duty construction for demanding site conditions"},
    {"icon":"check","label":"Universal fit for most work belts"},
    {"icon":"check","label":"Built specifically for bricklayers and block layers"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any standard work belt.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TROWEL STATION + WALKIE TALKIE DECK', 55
from public.hammerex_categories c
where c.slug = 'bricklaying'
and not exists (select 1 from public.hammerex_products where slug = 'bricky-magnet-trowel-station-walkie-talkie');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/0fc2501255169fa4.png',
  'BRICKY Magnet Trowel Station with Walkie Talkie Deck',
  0
from public.hammerex_products p
where p.slug = 'bricky-magnet-trowel-station-walkie-talkie'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values
    ('bricklaying',     0),
    ('concrete',        1),
    ('scaffolding',     2),
    ('trowel-holders',  3),
    ('belt-holders',    4)
  ) as v(slug, s)
where p.slug = 'bricky-magnet-trowel-station-walkie-talkie' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('BRICKY Magnet Trowel Station + Walkie Talkie Deck', 1, 0),
    ('Universal belt loop',                                1, 1)
  ) as v(l, q, s)
where p.slug = 'bricky-magnet-trowel-station-walkie-talkie'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'BRICKY (a HAMMEREX line)',                                 0),
    ('Material',     'Construction',   'Heavy-duty — built for daily site use',                   10),
    ('Design',       'Retention',      'Powerful magnetic trowel station — push-down release',    20),
    ('Design',       'Radio deck',     'Dedicated walkie-talkie deck for most site radios',       21),
    ('Fit',          'Belt',           'Universal — fits most work belts',                        30),
    ('Use',          'Built for',      'Professional bricklayers and block layers',               40),
    ('Pricing',      'Single unit',    '£26.00',                                                  50),
    ('Stock',        'Availability',   'In stock',                                                60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',               61),
    ('Build & care', 'Made in',        'United Kingdom',                                          70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                          71)
  ) as v(g, l, val, s)
where p.slug = 'bricky-magnet-trowel-station-walkie-talkie'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 2. BRICKY Magnet Trowel Station + Tape Deck — £14.99
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'BRICKY Magnet Trowel Station + Tape Deck',
  'Magnetic trowel station with integrated click-fit tape measure deck — push-down trowel release, fits most tape sizes. Built for professional bricklayers.',
  299800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/5f581771f9f4bdb9.png',
  true,
  'bricky-magnet-trowel-station-tape-deck', 'HX-BMTST-001', 'BRICKY', 'HX-BMTST', '14:00',
  1, 'United Kingdom',
  E'Designed specifically for professional bricklayers and block layers, the **BRICKY Magnet Trowel Station Belt Holder** provides a fast, secure, and efficient way to carry your trowel and tape measure while working on site.\n\nFeaturing a powerful **magnetic trowel station**, the holder securely grips your trowel during everyday site activity, climbing, bending, and movement. When you need your tool, simply push down and lift to instantly release the trowel for use. No straps, clips, or complicated mechanisms — just quick access when it matters most.\n\nIntegrated into the design is the **BRICKY Tape Deck Station**, engineered to securely click-fit most tape measure sizes, providing reliable retention and rapid access throughout the workday. The heavy-duty construction ensures durability in demanding construction environments while keeping your essential tools within easy reach.\n\nBuilt from premium materials and designed for all-day comfort, the BRICKY Magnet Trowel Station Belt Holder helps improve productivity, reduce tool handling time, and keep your workspace organised.\n\n### Features\n\n* Powerful magnetic trowel retention system\n* Push-down quick-release trowel access\n* Integrated Tape Deck Station\n* Fits most tape measure sizes\n* Secure click-fit tape retention\n* Heavy-duty construction for site use\n* Fast and efficient tool access\n* Universal belt compatibility\n* Designed for professional bricklayers and block layers\n\n### Benefits\n\n* Keeps your trowel secure while working\n* Quick one-handed trowel release\n* Reduces tool handling and downtime\n* Keeps tape measure and trowel together in one station\n* Improves efficiency and productivity on site\n* Built to withstand demanding construction environments\n\n**BRICKY – The Ultimate Trowel & Tape Station for Professional Block Layers.**',
  '[
    {"icon":"check","label":"Powerful magnetic trowel retention"},
    {"icon":"check","label":"Push-down quick-release trowel access"},
    {"icon":"check","label":"Integrated Tape Deck Station — click-fit"},
    {"icon":"check","label":"Fits most tape measure sizes"},
    {"icon":"check","label":"Heavy-duty construction for site use"},
    {"icon":"check","label":"Universal belt compatibility"},
    {"icon":"check","label":"Designed for professional bricklayers and block layers"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any standard work belt.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TROWEL STATION + TAPE DECK', 56
from public.hammerex_categories c
where c.slug = 'bricklaying'
and not exists (select 1 from public.hammerex_products where slug = 'bricky-magnet-trowel-station-tape-deck');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/5f581771f9f4bdb9.png',
  'BRICKY Magnet Trowel Station with Tape Deck',
  0
from public.hammerex_products p
where p.slug = 'bricky-magnet-trowel-station-tape-deck'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values
    ('bricklaying',     0),
    ('concrete',        1),
    ('scaffolding',     2),
    ('trowel-holders',  3),
    ('belt-holders',    4),
    ('tape-holders',    5)
  ) as v(slug, s)
where p.slug = 'bricky-magnet-trowel-station-tape-deck' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('BRICKY Magnet Trowel Station + Tape Deck', 1, 0),
    ('Click-fit tape deck station',              1, 1),
    ('Universal belt loop',                      1, 2)
  ) as v(l, q, s)
where p.slug = 'bricky-magnet-trowel-station-tape-deck'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'BRICKY (a HAMMEREX line)',                                 0),
    ('Material',     'Construction',   'Heavy-duty — built for daily site use',                   10),
    ('Design',       'Trowel station', 'Powerful magnetic — push-down quick release',             20),
    ('Design',       'Tape deck',      'Click-fit tape deck for most tape measure sizes',         21),
    ('Fit',          'Belt',           'Universal — fits most work belts',                        30),
    ('Use',          'Built for',      'Professional bricklayers and block layers',               40),
    ('Pricing',      'Single unit',    '£14.99',                                                  50),
    ('Stock',        'Availability',   'In stock',                                                60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',               61),
    ('Build & care', 'Made in',        'United Kingdom',                                          70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                          71)
  ) as v(g, l, val, s)
where p.slug = 'bricky-magnet-trowel-station-tape-deck'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
