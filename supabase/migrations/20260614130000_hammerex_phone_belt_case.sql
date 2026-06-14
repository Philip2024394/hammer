-- HAMMEREX Phone Belt Case — leather phone belt holder with side pen sleeve
-- and integrated key clip. Black leather with yellow stitching. £19.99 GBP
-- per size (Rp 399,800 @ 20k/£). Four user-selectable sizes covering all
-- mainstream modern flagships (biased toward the larger phones per user
-- request). Primary category: carpentry. Flagged is_universal=true so it
-- appears on every trade category page without needing per-category
-- cross-list rows.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, is_universal
)
select c.id,
  'Hammerex Phone Belt Case',
  'Premium leather phone belt case — side pen sleeve, integrated key clip, reinforced stitching. Choose your size: Standard / Plus / Pro Max / Ultra. Same price across sizes.',
  399800,
  'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
  true,
  'phone-belt-case', 'HX-PBC-001', 'Hammerex', 'HX-PBC', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX® Phone Belt Holder with Pen Sleeve & Key Clip\n\nKeep your phone, pen, and keys secure and within easy reach with the **HAMMEREX Phone Belt Holder**. Designed for tradespeople, scaffolders, builders, carpenters, electricians, engineers, and maintenance professionals, this rugged belt-mounted phone pouch combines durability, comfort, and everyday practicality.\n\nManufactured from premium heavy-duty leather with reinforced stitching, the holder is built to withstand harsh job site conditions while protecting your device from scratches, dust, and accidental knocks. The integrated side pen sleeve keeps your marker or pen ready for use, while the built-in key clip ensures your keys stay secure and accessible throughout the workday.\n\nThe compact design sits comfortably on your belt without restricting movement, making it the perfect hands-free solution for busy professionals.\n\n## FEATURES & BENEFITS\n\n* Premium heavy-duty leather construction\n* Secure phone storage and protection\n* Convenient side pen holder\n* Integrated key clip attachment\n* Reinforced stitching for long-lasting durability\n* Comfortable belt-mounted design\n* Lightweight and practical for everyday use\n* Suitable for construction, scaffolding, carpentry, electrical, plumbing, maintenance, and DIY work\n* Professional HAMMEREX black and yellow styling\n\n## SUITABLE FOR MOST SMARTPHONES\n\nCompatible with most popular Apple and Android devices including:\n\n### APPLE iPHONE\n\n* iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max\n* iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max\n* iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max\n* iPhone 13 / 13 Pro / 13 Pro Max\n* iPhone 12 / 12 Pro / 12 Pro Max\n\n### ANDROID PHONES\n\n* Samsung Galaxy S25 / S25+ / S25 Ultra\n* Samsung Galaxy S24 / S24+ / S24 Ultra\n* Samsung Galaxy A Series\n* Google Pixel 9 / 9 Pro / 9 Pro XL\n* Google Pixel 8 Series\n* OnePlus 13 / 12\n* Xiaomi 15 Series · Xiaomi Redmi Note Series\n* OPPO Find Series · OPPO Reno Series\n* Vivo X Series · Vivo V Series\n\n## CHOOSE YOUR SIZE\n\n* **Standard** — iPhone 16/15/14/13, Galaxy S24/S25, Pixel 9, OnePlus 12\n* **Plus** — iPhone 16/15/14 Plus, Galaxy S24+/S25+, OnePlus 13, Xiaomi 15\n* **Pro Max** — iPhone 16/15/14 Pro Max\n* **Ultra** — Galaxy S25/S24 Ultra, Pixel 9 Pro XL, biggest flagships\n\n## SPECIFICATIONS\n\n* Brand: HAMMEREX®\n* Material: Premium Leather\n* Colour: Black with Yellow Stitching\n* Features: Phone Holder, Pen Sleeve, Key Clip\n* Mounting: Belt Loop Attachment\n* Application: Construction, Scaffolding, Carpentry, Electrical, Plumbing, Maintenance & General Trade Use\n\n**HAMMEREX – YOUR TOOLS. ALWAYS WITH YOU.**',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Secure phone storage and protection"},
    {"icon":"check","label":"Side pen sleeve"},
    {"icon":"check","label":"Integrated key clip attachment"},
    {"icon":"check","label":"Reinforced stitching for long-lasting durability"},
    {"icon":"check","label":"Comfortable belt-mounted design"},
    {"icon":"check","label":"Fits all mainstream modern flagships — pick your size"},
    {"icon":"check","label":"Black leather with yellow contrast stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your phone size above — Standard / Plus / Pro Max / Ultra. Same price across sizes.",
    "If your phone isn''t listed, tell us the model on the WhatsApp quote and we''ll confirm the best size.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'PHONE BELT CASE — CHOOSE SIZE', 44, true
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'phone-belt-case');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
  'Hammerex Phone Belt Case — premium leather with pen sleeve and key clip',
  0
from public.hammerex_products p
where p.slug = 'phone-belt-case'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- No hammerex_product_trades rows needed — is_universal=true makes this
-- appear on every category page via the category loader logic.

-- Four size variants — all £19.99 (same price across sizes per user spec).
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Standard — iPhone 13–16, Galaxy S24/S25, Pixel 9, OnePlus 12',     'HX-PBC-STD', 399800,
       'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
       'HX-PBC-STD', 0, true,  80),
    ('Plus — iPhone Plus, Galaxy S24+/S25+, OnePlus 13, Xiaomi 15',      'HX-PBC-PLS', 399800,
       'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
       'HX-PBC-PLS', 1, false, 80),
    ('Pro Max — iPhone 14/15/16 Pro Max',                                'HX-PBC-PRM', 399800,
       'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
       'HX-PBC-PRM', 2, false, 80),
    ('Ultra — Galaxy S24/S25 Ultra, Pixel 9 Pro XL, biggest flagships', 'HX-PBC-ULT', 399800,
       'https://ik.imagekit.io/pinky/Untitledasdfasdfasdfasdasdadsasdasdczxczxc.png',
       'HX-PBC-ULT', 3, false, 80)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'phone-belt-case'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Phone Belt Case (size as selected)', 1, 0),
    ('Side pen sleeve',                              1, 1),
    ('Integrated key clip',                          1, 2)
  ) as v(l, q, s)
where p.slug = 'phone-belt-case'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                 0),
    ('Brand',        'Product type',   'Phone Belt Case w/ Pen Sleeve & Key Clip',                  1),
    ('Material',     'Body',           'Premium leather',                                          10),
    ('Material',     'Stitching',      'Reinforced yellow contrast stitching',                     11),
    ('Material',     'Colour',         'Black leather with yellow stitching',                      12),
    ('Capacity',     'Phone fit',      'Universal across modern flagships — pick your size',       20),
    ('Capacity',     'Sizes',          'Standard / Plus / Pro Max / Ultra (see above)',            21),
    ('Design',       'Pen sleeve',     'Integrated side sleeve for marker or pen',                 30),
    ('Design',       'Key clip',       'Built-in key clip',                                        31),
    ('Design',       'Mounting',       'Belt loop attachment — fits standard work belts',          32),
    ('Pricing',      'Per size',       '£19.99 — same price across all four sizes',                40),
    ('Stock',        'Availability',   'In stock — all sizes',                                     50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                52),
    ('Use',          'Built for',      'Construction, scaffolding, carpentry, electrical, plumbing, maintenance, DIY', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                            70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                            71)
  ) as v(g, l, val, s)
where p.slug = 'phone-belt-case'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
