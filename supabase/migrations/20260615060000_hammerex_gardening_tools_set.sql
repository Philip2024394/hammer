-- HAMMEREX Gardening Tools — polished alloy-steel hand-tool range with five
-- user-selectable variants: each of the four individual tools as a single
-- purchase, plus the complete set-of-four bundle. Prices intentionally
-- seeded as 0 (placeholder pending user confirmation per variant). Primary
-- category: landscaping (no "gardening" category exists). Cross-listed to
-- farming (allotment / vegetable garden overlap).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Gardening Tools',
  'Polished alloy-steel garden hand tools — one-piece solid construction, ergonomic comfort grip. Buy individually (trowel, planting trowel, cultivator, fork) or the complete set of four.',
  0,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
  true,
  'gardening-tools-set', 'HX-GTS-001', 'Hammerex', 'HX-GTS', '14:00',
  1, 'United Kingdom',
  E'Transform your gardening experience with the **Hammerex® Gardening Tools Set**, designed for gardeners who demand strength, durability, and reliable performance. Whether you''re planting, cultivating, transplanting, or maintaining your garden, these premium hand tools are built to help you work efficiently and comfortably.\n\nManufactured from polished alloy steel with a one-piece solid construction, each tool delivers exceptional strength and resistance to bending, rust, and wear. The ergonomic comfort-grip handles provide excellent control while reducing hand fatigue during extended gardening sessions.\n\nPerfect for flower beds, vegetable gardens, raised planters, greenhouses, and allotments, the Hammerex Gardening Tools Set combines professional-quality construction with practical everyday performance.\n\n## FEATURES\n\n* Heavy-duty polished alloy steel construction\n* One-piece solid design for maximum strength\n* Rust-resistant polished finish\n* Ergonomic comfort-grip handles\n* Durable and easy-to-clean surfaces\n* Designed for frequent outdoor use\n* Suitable for beginners and experienced gardeners\n* Built for long-lasting performance\n\n## SET INCLUDES\n\n* Garden Trowel\n* Graduated Planting Trowel\n* Hand Cultivator\n* Hand Fork\n\nEach tool is also available individually — pick what you need at the variant selector above.\n\n## IDEAL FOR\n\n* Planting flowers and vegetables\n* Digging and transplanting seedlings\n* Soil cultivation and aeration\n* Weeding and garden maintenance\n* Raised beds and containers\n* Greenhouses and allotments\n\n## SPECIFICATIONS\n\n* Material: Polished Alloy Steel\n* Handle Type: Ergonomic Solid Handle\n* Finish: Corrosion-Resistant Mirror Polish\n* Colour: Silver Steel Finish\n* Application: Gardening, Landscaping, Planting & Cultivating\n\n## BENEFITS\n\n* Strong enough for demanding garden work\n* Comfortable grip for improved control\n* Resistant to rust and corrosion\n* Easy to clean after use\n* Professional-quality construction\n* Designed for years of dependable service\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"Heavy-duty polished alloy steel"},
    {"icon":"check","label":"One-piece solid construction"},
    {"icon":"check","label":"Rust-resistant polished finish"},
    {"icon":"check","label":"Ergonomic comfort-grip handles"},
    {"icon":"check","label":"Easy to clean after use"},
    {"icon":"check","label":"Buy individually or as the full set of four"},
    {"icon":"check","label":"Suitable for beginners and pros"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick a single tool above — or the complete Set of 4.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDENING TOOLS — SINGLE OR SET OF 4', 62
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'gardening-tools-set');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
  'Hammerex Gardening Tools — polished alloy-steel set of four',
  0
from public.hammerex_products p
where p.slug = 'gardening-tools-set'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to landscaping (primary) + farming (allotments / vegetable
-- garden overlap) + trowels tool-type bucket (two of the four items are
-- trowels — enough that this product belongs there).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('trowels', 2)) as v(slug, s)
where p.slug = 'gardening-tools-set' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- Five variants — 4 single tools + 1 set-of-four bundle. Placeholder
-- prices (0) — user will confirm each.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Set of 4 — all tools',         'HX-GTS-SET4',    0,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
       'HX-GTS-SET4',   0, true,  50),
    ('Garden Trowel (single)',        'HX-GTS-TROWEL',  0,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
       'HX-GTS-TROWEL', 1, false, 60),
    ('Graduated Planting Trowel (single)', 'HX-GTS-PLANT', 0,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
       'HX-GTS-PLANT',  2, false, 60),
    ('Hand Cultivator (single)',      'HX-GTS-CULT',    0,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
       'HX-GTS-CULT',   3, false, 60),
    ('Hand Fork (single)',            'HX-GTS-FORK',    0,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6adb63aae4757cc3.png',
       'HX-GTS-FORK',   4, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'gardening-tools-set'
on conflict (product_id, label) do nothing;

-- What's-in-box (lists every component, scoped per variant in copy).
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Garden Trowel — single tool (when chosen)',           1, 0),
    ('Graduated Planting Trowel — single tool (when chosen)', 1, 1),
    ('Hand Cultivator — single tool (when chosen)',         1, 2),
    ('Hand Fork — single tool (when chosen)',               1, 3),
    ('Set of 4 — all four tools (when chosen)',             1, 4)
  ) as v(l, q, s)
where p.slug = 'gardening-tools-set'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                       0),
    ('Material',     'Body',           'Polished alloy steel — one-piece solid construction',           10),
    ('Material',     'Finish',         'Corrosion-resistant mirror polish',                              11),
    ('Material',     'Colour',         'Silver steel finish',                                            12),
    ('Material',     'Handle',         'Ergonomic comfort grip',                                         13),
    ('Capacity',     'Tools available','Garden Trowel · Graduated Planting Trowel · Hand Cultivator · Hand Fork', 20),
    ('Capacity',     'Purchase',       'Single tool OR complete set of 4 — pick above',                  21),
    ('Use',          'Built for',      'Flower beds, vegetable gardens, raised planters, greenhouses, allotments', 30),
    ('Use',          'Tasks',          'Planting, transplanting, cultivation, weeding, soil aeration',   31),
    ('Pricing',      'Per variant',    'Price set per variant at the picker above',                      40),
    ('Stock',        'Availability',   'In stock — all options',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                      51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                      52),
    ('Build & care', 'Made in',        'United Kingdom',                                                  60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                  61)
  ) as v(g, l, val, s)
where p.slug = 'gardening-tools-set'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
