-- Three gardening products on 2026-06-15:
--   1) Garden Waste Bags — Heavy Duty (Square 150L / Round 95L variants) £16.99
--   2) Seed Storage Pouch                                                £17.30
--   3) Garden Waste Bags — Compact (Square / Round variants)             £2 each
--
-- Products 1 and 3 share the same source description. They differ by price
-- (£16.99 vs £2) and image, so they're separately listed as Heavy Duty vs
-- Compact / Value editions of the same Garden Waste Bag family.
--
-- All images already in Supabase Storage.

-- ============================================================
-- 1. Garden Waste Bags — Heavy Duty (Square 150L / Round 95L) — £16.99
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Waste Bags — Heavy Duty',
  'Heavy-duty reusable woven polypropylene garden waste bags — choose Square 150L or Round 95L. Full-length lifting straps, reinforced stitching, water-resistant.',
  339800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cc87ab3bd6a68e7e.png',
  true,
  'garden-waste-bags-heavy-duty', 'HX-GWB-HD-001', 'Hammerex', 'HX-GWB-HD', '14:00',
  1, 'United Kingdom',
  E'Tackle garden clean-up with confidence using the **Hammerex® Garden Waste Bags (Heavy Duty)**. Designed for gardeners, landscapers, and outdoor professionals, these heavy-duty reusable bags provide a practical and durable solution for collecting leaves, grass clippings, weeds, hedge trimmings, and general garden waste.\n\nManufactured from tough **woven polypropylene fabric** with reinforced webbing handles, these bags are built to withstand demanding outdoor use. The structured design helps the bags remain open during filling, making garden clean-up faster and more efficient. Reinforced stitching and full-length lifting straps provide additional strength when carrying heavy loads.\n\nAvailable in both **Square (150L)** and **Round (95L)** designs, Hammerex Garden Waste Bags offer large-capacity storage while remaining lightweight, foldable, and easy to store when not in use.\n\n## FEATURES\n\n* Heavy-duty woven polypropylene construction\n* Reinforced lifting handles with industrial stitching\n* Large-capacity design for garden waste collection\n* Water-resistant and weather-resistant material\n* Reusable alternative to disposable garden sacks\n* Fold-flat design for compact storage\n* Strong enough for leaves, grass, weeds, twigs, and branches\n* Suitable for gardening, landscaping, allotments, and outdoor maintenance\n\n## SQUARE BAG SPECIFICATIONS\n\n* Dimensions: 71cm (L) × 38cm (W) × 57cm (H)\n* Capacity: Approx. 150 Litres\n* Handles: Full-Length Reinforced Webbing Straps\n\n## ROUND BAG SPECIFICATIONS\n\n* Dimensions: 45cm Diameter × 60cm Height\n* Capacity: Approx. 95 Litres\n* Handles: Reinforced Carry Handles\n\nBoth options: Material — Heavy-Duty Woven Polypropylene · Colour — Dark Green with Hammerex Black & Yellow Details.\n\n## IDEAL FOR\n\n* Leaves and hedge trimmings · Grass clippings · Weeds and plant waste\n* Twigs and branches · General garden maintenance · Landscaping and outdoor projects\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"Heavy-duty woven polypropylene"},
    {"icon":"check","label":"Reinforced lifting handles with industrial stitching"},
    {"icon":"check","label":"Square 150L or Round 95L — pick above"},
    {"icon":"check","label":"Water- and weather-resistant"},
    {"icon":"check","label":"Reusable, fold-flat when not in use"},
    {"icon":"check","label":"Strong enough for leaves, grass, weeds, twigs, branches"},
    {"icon":"check","label":"Dark green with Hammerex black & yellow details"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your shape and capacity above — Square (150L) or Round (95L).",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN WASTE BAGS — HEAVY DUTY (CHOOSE SHAPE)', 65
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-waste-bags-heavy-duty');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cc87ab3bd6a68e7e.png',
  'Hammerex Garden Waste Bags — Heavy Duty (Square + Round)', 0
from public.hammerex_products p
where p.slug = 'garden-waste-bags-heavy-duty'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('tool-bags-backpacks', 2)) as v(slug, s)
where p.slug = 'garden-waste-bags-heavy-duty' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Square — 71 × 38 × 57 cm · ~150L', 'HX-GWB-HD-SQ',  339800,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cc87ab3bd6a68e7e.png',
       'HX-GWB-HD-SQ', 0, true,  60),
    ('Round — 45cm dia × 60cm · ~95L',   'HX-GWB-HD-RD',  339800,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cc87ab3bd6a68e7e.png',
       'HX-GWB-HD-RD', 1, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'garden-waste-bags-heavy-duty'
on conflict (product_id, label) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Heavy-Duty Garden Waste Bag (shape as selected)', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-waste-bags-heavy-duty'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Brand', 'Edition', 'Heavy Duty', 1),
    ('Material', 'Body', 'Heavy-duty woven polypropylene', 10),
    ('Material', 'Stitching', 'Reinforced industrial', 11),
    ('Material', 'Colour', 'Dark green with Hammerex black & yellow details', 12),
    ('Dimensions', 'Square', '71 (L) × 38 (W) × 57 (H) cm — ~150L', 20),
    ('Dimensions', 'Round', '45 cm dia × 60 cm H — ~95L', 21),
    ('Design', 'Square handles', 'Full-length reinforced webbing straps', 30),
    ('Design', 'Round handles', 'Reinforced carry handles', 31),
    ('Use', 'Built for', 'Leaves, grass, weeds, twigs, branches, hedge trimmings', 40),
    ('Pricing', 'Per shape', '£16.99 — Square and Round priced the same', 50),
    ('Stock', 'Availability', 'In stock — both shapes', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Water/weather resistant', 'Yes', 70),
    ('Build & care', 'Made in', 'United Kingdom', 71),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 72)
  ) as v(g, l, val, s)
where p.slug = 'garden-waste-bags-heavy-duty'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 2. Seed Storage Pouch — £17.30
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Seed Storage Pouch',
  '1680D polyester seed storage pouch — wrap-around two-way zipper, 12–24 mesh seed-packet pockets, water-resistant. 25 × 18 × 4 cm, ~250g.',
  346000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/b96418ef52a43d46.png',
  true,
  'seed-storage-pouch', 'HX-SSP-PCH-001', 'Hammerex', 'HX-SSP-PCH', '14:00',
  1, 'United Kingdom',
  E'Keep your seeds protected, organised, and ready for planting with the **Hammerex® Seed Storage Pouch**. Designed for gardeners, allotment owners, and growing enthusiasts, this durable organiser provides a practical solution for storing and sorting seed packets throughout the growing season.\n\nConstructed from heavy-duty **1680D polyester** with reinforced stitching, the Seed Storage Pouch is built to withstand years of use while protecting valuable seeds from moisture, dirt, and damage. Inside, multiple mesh retention pockets securely hold standard paper seed packets, allowing gardeners to quickly identify and access their seeds without loose packets becoming misplaced.\n\nA **full wrap-around zipper** opens the pouch flat for easy viewing and organisation, while additional storage compartments provide space for planting notes, labels, markers, and gardening accessories.\n\nWhether you''re planning next season''s vegetable garden, organising flower seeds, or storing heirloom varieties, the Hammerex Seed Storage Pouch keeps everything neatly arranged and ready when you need it.\n\n## FEATURES\n\n* Heavy-duty 1680D polyester construction\n* Full wrap-around zipper opening\n* Multiple mesh pockets for standard seed packets\n* Reinforced industrial stitching\n* Water-resistant outer fabric\n* Compact carry handle\n* Dedicated storage for planting notes and labels\n* Lightweight and portable\n* Helps organise seeds by variety and season\n\n## SPECIFICATIONS\n\n* Material: 1680D Polyester with PVC Backing\n* Lining: 210D Polyester\n* Closure: Heavy-Duty Two-Way Zipper\n* Storage: 12–24 Mesh Seed Packet Pockets\n* Dimensions: 25cm × 18cm × 4cm\n* Colour: Black with Hammerex Yellow Stitching\n* Weight: Approx. 250g\n\n## IDEAL FOR STORING\n\n* Vegetable seed packets · Herb seed packets · Flower seed packets\n* Plant labels and markers · Planting schedules and notes · Seed collection records\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"1680D polyester with PVC backing"},
    {"icon":"check","label":"210D polyester lining"},
    {"icon":"check","label":"Heavy-duty two-way wrap-around zipper"},
    {"icon":"check","label":"12–24 mesh pockets for standard seed packets"},
    {"icon":"check","label":"Reinforced industrial stitching"},
    {"icon":"check","label":"Compact carry handle, water-resistant outer"},
    {"icon":"check","label":"25 × 18 × 4 cm, ~250g"},
    {"icon":"check","label":"Black with Hammerex yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SEED STORAGE POUCH — 1680D POLYESTER', 66
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'seed-storage-pouch');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/b96418ef52a43d46.png',
  'Hammerex Seed Storage Pouch — 1680D polyester with mesh seed-packet pockets', 0
from public.hammerex_products p
where p.slug = 'seed-storage-pouch'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1)) as v(slug, s)
where p.slug = 'seed-storage-pouch' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Seed Storage Pouch', 1, null, 0
from public.hammerex_products p where p.slug = 'seed-storage-pouch'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Body', '1680D polyester with PVC backing', 10),
    ('Material', 'Lining', '210D polyester', 11),
    ('Material', 'Colour', 'Black with Hammerex yellow stitching', 12),
    ('Design', 'Closure', 'Heavy-duty two-way wrap-around zipper', 20),
    ('Capacity', 'Pockets', '12–24 mesh seed-packet pockets', 30),
    ('Dimensions', 'Size', '25 × 18 × 4 cm', 40),
    ('Dimensions', 'Weight', 'Approx. 250g', 41),
    ('Use', 'Built for', 'Vegetable, herb, flower seed packets · labels · planting notes', 50),
    ('Pricing', 'Single unit', '£17.30', 60),
    ('Stock', 'Availability', 'In stock', 70),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 71),
    ('Build & care', 'Water resistant', 'Yes', 80),
    ('Build & care', 'Made in', 'United Kingdom', 81),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 82)
  ) as v(g, l, val, s)
where p.slug = 'seed-storage-pouch'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 3. Garden Waste Bags — Compact / Value (Square / Round) — £2.00 each
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Waste Bags — Compact',
  'Compact reusable woven polypropylene garden waste bags — Square or Round, £2 each. Lightweight, fold-flat, reinforced handles.',
  40000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/1d579de9a2834545.png',
  true,
  'garden-waste-bags-compact', 'HX-GWB-CP-001', 'Hammerex', 'HX-GWB-CP', '14:00',
  1, 'United Kingdom',
  E'Tackle garden clean-up with confidence using the **Hammerex® Garden Waste Bags (Compact)**. Designed for gardeners, landscapers, and outdoor professionals, these heavy-duty reusable bags provide a practical and durable solution for collecting leaves, grass clippings, weeds, hedge trimmings, and general garden waste.\n\nManufactured from tough woven polypropylene fabric with reinforced webbing handles, these bags are built to withstand demanding outdoor use. The structured design helps the bags remain open during filling, making garden clean-up faster and more efficient. Reinforced stitching and full-length lifting straps provide additional strength when carrying heavy loads.\n\nAvailable in both **Square** and **Round** designs, Hammerex Garden Waste Bags offer practical storage while remaining lightweight, foldable, and easy to store when not in use.\n\n## FEATURES\n\n* Heavy-duty woven polypropylene construction\n* Reinforced lifting handles with industrial stitching\n* Water-resistant and weather-resistant material\n* Reusable alternative to disposable garden sacks\n* Fold-flat design for compact storage\n* Strong enough for leaves, grass, weeds, twigs, and branches\n* Suitable for gardening, landscaping, allotments, and outdoor maintenance\n\n## IDEAL FOR\n\n* Leaves and hedge trimmings · Grass clippings · Weeds and plant waste\n* Twigs and branches · General garden maintenance · Landscaping and outdoor projects\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"Heavy-duty woven polypropylene"},
    {"icon":"check","label":"Reinforced lifting handles"},
    {"icon":"check","label":"Square or Round — pick above"},
    {"icon":"check","label":"Water- and weather-resistant"},
    {"icon":"check","label":"Reusable, fold-flat when not in use"},
    {"icon":"check","label":"Suitable for gardening, landscaping, allotments"},
    {"icon":"check","label":"Dark green with Hammerex black & yellow details"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick Square or Round above — £2 each.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN WASTE BAGS — COMPACT (£2 EACH)', 67
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-waste-bags-compact');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/1d579de9a2834545.png',
  'Hammerex Garden Waste Bags — Compact (Square + Round)', 0
from public.hammerex_products p
where p.slug = 'garden-waste-bags-compact'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('tool-bags-backpacks', 2)) as v(slug, s)
where p.slug = 'garden-waste-bags-compact' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Square — Compact', 'HX-GWB-CP-SQ', 40000,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/1d579de9a2834545.png',
       'HX-GWB-CP-SQ', 0, true,  100),
    ('Round — Compact',  'HX-GWB-CP-RD', 40000,
       'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/1d579de9a2834545.png',
       'HX-GWB-CP-RD', 1, false, 100)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'garden-waste-bags-compact'
on conflict (product_id, label) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Compact Garden Waste Bag (shape as selected)', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-waste-bags-compact'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Brand', 'Edition', 'Compact / Value', 1),
    ('Material', 'Body', 'Heavy-duty woven polypropylene', 10),
    ('Material', 'Stitching', 'Reinforced industrial', 11),
    ('Material', 'Colour', 'Dark green with Hammerex black & yellow details', 12),
    ('Capacity', 'Shapes', 'Square or Round — pick above', 20),
    ('Design', 'Handles', 'Reinforced carry handles', 30),
    ('Use', 'Built for', 'Leaves, grass, weeds, twigs, branches', 40),
    ('Pricing', 'Per bag', '£2.00 — Square and Round priced the same', 50),
    ('Stock', 'Availability', 'In stock — both shapes', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Water/weather resistant', 'Yes', 70),
    ('Build & care', 'Made in', 'United Kingdom', 71),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 72)
  ) as v(g, l, val, s)
where p.slug = 'garden-waste-bags-compact'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
