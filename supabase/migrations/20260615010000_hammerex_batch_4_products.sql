-- Batch: 4 new products on 2026-06-15.
--   1) HAMMEREX Hi-Vis Safety Glasses (Tinted Edition) — concrete/plastering/drywall — £7.99
--   2) HAMMEREX Scaffolding Spanner 19/21mm — scaffolding only — £6.40
--   3) HAMMEREX 1/4" Drill Bit Holder Keychain Set — auto-categorised — £8.40
--   4) HAMMEREX Hi-Vis Safety Glasses (universal) — every category — £7.90
--
-- All four images already migrated to Supabase Storage.

-- ============================================================
-- 1. Tinted Safety Glasses — Trades Edition (concrete/plastering/drywall)
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Hi-Vis Safety Glasses — Tinted Edition',
  'High-visibility tinted safety glasses — impact-resistant, lightweight frame, reduces glare and eye strain. Built for concrete, plastering and drywall work.',
  159800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cddc2ad1108a7271.png',
  true,
  'hi-vis-safety-glasses-tinted', 'HX-TSG-001', 'Hammerex', 'HX-TSG', '14:00',
  1, 'United Kingdom',
  E'When it comes to working on site, safety should never be compromised. The **HAMMEREX High-Visibility Safety Glasses (Tinted Edition)** are designed to provide superior eye protection while delivering the modern style today''s tradespeople demand.\n\nFeaturing a high-visibility tinted lens, these safety glasses enhance visual clarity in changing light conditions while helping reduce glare and eye fatigue throughout the workday. Whether you''re working on a construction site, scaffolding, bricklaying project, workshop, or industrial environment, HAMMEREX safety glasses are built to keep your vision protected and focused.\n\nConstructed from robust, impact-resistant materials, the lightweight frame delivers all-day comfort without sacrificing durability. The sleek, modern design means you don''t have to choose between safety and style — HAMMEREX combines both in one professional package.\n\n### Features\n\n* High-visibility tinted lenses\n* Impact-resistant construction\n* Lightweight and comfortable design\n* Durable frame built for site conditions\n* Reduces glare and eye strain\n* Secure fit for all-day wear\n* Modern professional styling\n* Suitable for construction, scaffolding, bricklaying, and general trade work\n\n### Benefits\n\n* Protects eyes from dust, debris, and workplace hazards\n* Enhances visibility in varying light conditions\n* Comfortable for extended use\n* Durable enough for demanding work environments\n* Stylish design that looks as good as it performs\n* Helps maintain focus and productivity throughout the day\n\n**HAMMEREX – Safety First. Performance Always.**',
  '[
    {"icon":"check","label":"High-visibility tinted lenses"},
    {"icon":"check","label":"Impact-resistant construction"},
    {"icon":"check","label":"Lightweight and comfortable design"},
    {"icon":"check","label":"Durable frame built for site conditions"},
    {"icon":"check","label":"Reduces glare and eye strain"},
    {"icon":"check","label":"Secure fit for all-day wear"},
    {"icon":"check","label":"Suitable for concrete, plastering, drywall, scaffolding and general trades"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'HI-VIS TINTED SAFETY GLASSES', 51
from public.hammerex_categories c
where c.slug = 'concrete'
and not exists (select 1 from public.hammerex_products where slug = 'hi-vis-safety-glasses-tinted');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cddc2ad1108a7271.png',
  'Hammerex Hi-Vis Safety Glasses Tinted Edition',
  0
from public.hammerex_products p
where p.slug = 'hi-vis-safety-glasses-tinted'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('concrete', 0), ('plastering', 1), ('drywall', 2), ('gloves-ppe', 3)) as v(slug, s)
where p.slug = 'hi-vis-safety-glasses-tinted' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Hi-Vis Safety Glasses (Tinted)', 1, null, 0
from public.hammerex_products p where p.slug = 'hi-vis-safety-glasses-tinted'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Brand', 'Edition', 'Tinted (Trades)', 1),
    ('Material', 'Lens', 'High-visibility tinted, impact-resistant', 10),
    ('Material', 'Frame', 'Lightweight impact-resistant', 11),
    ('Design', 'Fit', 'Secure all-day wear', 20),
    ('Use', 'Built for', 'Concrete, plastering, drywall, scaffolding, general trades', 30),
    ('Pricing', 'Single unit', '£7.99', 40),
    ('Stock', 'Availability', 'In stock', 50),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 51),
    ('Build & care', 'Made in', 'United Kingdom', 60),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 61)
  ) as v(g, l, val, s)
where p.slug = 'hi-vis-safety-glasses-tinted'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 2. Scaffolding Spanner 19/21mm — scaffolding only — £6.40
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Scaffolding Spanner 19/21mm',
  'Professional dual-socket scaffolding ratchet spanner — 19mm × 21mm, 235mm long, high-carbon steel, heat-treated. Built for scaffolders and steel erection.',
  128000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/68253f2d9d47e374.png',
  true,
  'scaffolding-spanner-19-21', 'HX-SSP-001', 'Hammerex', 'HX-SSP-1921', '14:00',
  1, 'United Kingdom',
  E'Built for demanding construction and scaffolding applications, the **HAMMEREX Scaffolding Spanner** combines strength, durability, and performance in one professional-grade tool. Featuring dual 19mm and 21mm socket sizes, this ratchet wrench is designed for fast and efficient tightening and loosening of scaffold fittings and couplers.\n\nManufactured from **high carbon steel** and subjected to **overall heat treatment**, the spanner delivers exceptional toughness, high hardness, and superior torque performance. Its ergonomic 235mm handle provides excellent leverage while maintaining comfort and control during extended use.\n\nWhether you''re working on scaffolding, construction sites, industrial maintenance, or steel erection projects, the HAMMEREX Scaffolding Spanner is engineered to withstand the toughest job-site conditions.\n\n### Specifications\n\n* Socket Sizes: 19mm × 21mm\n* Total Length: 235mm\n* Material: High Carbon Steel\n* Finish: Heat Treated for Maximum Durability\n\n### Features\n\n* Professional-grade scaffolding ratchet wrench\n* High carbon steel construction\n* Overall heat-treated for increased strength and wear resistance\n* Excellent toughness and high hardness\n* Delivers high torque for demanding applications\n* Compact 235mm design for easy handling\n* Ideal for scaffolding, construction, industrial, and maintenance work\n\n**HAMMEREX – Built to Perform. Built to Last.**',
  '[
    {"icon":"check","label":"Dual 19mm × 21mm sockets"},
    {"icon":"check","label":"235mm overall length — ergonomic leverage"},
    {"icon":"check","label":"High-carbon steel construction"},
    {"icon":"check","label":"Overall heat-treated for strength and wear resistance"},
    {"icon":"check","label":"Excellent toughness, high hardness, high torque"},
    {"icon":"check","label":"Built for scaffolding, construction, industrial and maintenance work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SCAFFOLDING SPANNER 19/21MM', 52
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolding-spanner-19-21');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/68253f2d9d47e374.png',
  'Hammerex Scaffolding Spanner 19/21mm — high-carbon steel ratchet wrench',
  0
from public.hammerex_products p
where p.slug = 'scaffolding-spanner-19-21'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p cross join public.hammerex_categories c
where p.slug = 'scaffolding-spanner-19-21' and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Scaffolding Ratchet Wrench (19/21mm)', 1, null, 0
from public.hammerex_products p where p.slug = 'scaffolding-spanner-19-21'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Steel', 'High-carbon steel, overall heat treated', 10),
    ('Dimensions', 'Sockets', '19mm × 21mm', 20),
    ('Dimensions', 'Length', '235mm overall', 21),
    ('Use', 'Application', 'Scaffolding, construction, industrial maintenance, steel erection', 30),
    ('Pricing', 'Single unit', '£6.40', 40),
    ('Stock', 'Availability', 'In stock', 50),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 51),
    ('Build & care', 'Made in', 'United Kingdom', 60),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 61)
  ) as v(g, l, val, s)
where p.slug = 'scaffolding-spanner-19-21'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 3. 1/4" Drill Bit Holder Keychain Set — auto-categorised — £8.40
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex 1/4" Drill Bit Holder Keychain Set',
  'Aluminium-alloy 1/4" hex drill-bit holder keychain — 5 × extensions + heavy-duty carabiner clip. Quick-release one-handed bit change. Built for tradespeople, electricians, carpenters and scaffolders.',
  168000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/c6f3bb04746c3a9f.png',
  true,
  'drill-bit-holder-keychain-set', 'HX-DBK-001', 'Hammerex', 'HX-DBK', '14:00',
  1, 'United Kingdom',
  E'Keep your essential drill bits secure, organised, and always within reach with the **HAMMEREX 1/4" Drill Bit Holder Keychain Set**. Designed for tradespeople, electricians, carpenters, scaffolders, and DIY professionals, this compact carrying solution allows fast one-handed access to your most-used bits while working on site.\n\nManufactured from premium lightweight aluminium alloy, each holder is built for durability without adding unnecessary weight to your tool belt or pocket. The quick-release mechanism securely locks drill bits in place to prevent accidental drops, making it ideal for working at heights and demanding job environments.\n\nThe universal 1/4-inch hex shank design is compatible with most screwdriver bits, drill bits, nut drivers, electric screwdrivers, impact drivers, and cordless drills. Simply pull back the outer metal sleeve to quickly remove or replace bits, allowing fast tool changes and improved productivity.\n\n### Features\n\n* Heavy-duty aluminium alloy construction\n* Lightweight, compact, and easy to carry\n* Secure quick-release locking mechanism\n* One-handed bit change operation\n* Prevents accidental bit loss during work\n* Universal 1/4" hex shank compatibility\n* Ideal for tool belts, keychains, bags, and work pouches\n* Perfect for professionals and DIY users\n\n### Applications\n\n* Construction workers · Electricians · Carpenters · Scaffolders\n* Maintenance technicians · DIY enthusiasts\n\n### Package Includes\n\n* 5 × 1/4" Hex Drill Bit Holder Extensions\n* 1 × Heavy-Duty Carabiner Clip\n\n**HAMMEREX – Built for Tough Job Sites.**',
  '[
    {"icon":"check","label":"Heavy-duty aluminium alloy construction"},
    {"icon":"check","label":"Quick-release locking mechanism"},
    {"icon":"check","label":"One-handed bit change"},
    {"icon":"check","label":"Universal 1/4\" hex shank compatibility"},
    {"icon":"check","label":"Includes 5 × extensions + heavy-duty carabiner"},
    {"icon":"check","label":"Compact for tool belts, keychains, bags, pouches"},
    {"icon":"check","label":"Built for construction, electrical, carpentry, scaffolding work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, '1/4" DRILL BIT HOLDER KEYCHAIN SET', 53
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'drill-bit-holder-keychain-set');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/c6f3bb04746c3a9f.png',
  'Hammerex 1/4" Drill Bit Holder Keychain Set — 5 extensions + carabiner',
  0
from public.hammerex_products p
where p.slug = 'drill-bit-holder-keychain-set'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Auto-categorisation: trades that use bits + tool-type buckets.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values
    ('carpentry',                 0),
    ('electrical',                1),
    ('scaffolding',               2),
    ('hvac',                      3),
    ('metal-fabrication',         4),
    ('belt-holders',              5),
    ('professional-tool-storage', 6)
  ) as v(slug, s)
where p.slug = 'drill-bit-holder-keychain-set' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('1/4" Hex Drill Bit Holder Extension', 5, 0),
    ('Heavy-Duty Carabiner Clip',           1, 1)
  ) as v(l, q, s)
where p.slug = 'drill-bit-holder-keychain-set'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Body', 'Lightweight aluminium alloy', 10),
    ('Design', 'Compatibility', 'Universal 1/4" hex shank', 20),
    ('Design', 'Release', 'Quick-release outer sleeve, one-handed', 21),
    ('Capacity', 'In box', '5 × bit holder extensions + 1 × carabiner', 30),
    ('Use', 'Built for', 'Tradespeople, electricians, carpenters, scaffolders, maintenance, DIY', 40),
    ('Pricing', 'Single unit', '£8.40', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Made in', 'United Kingdom', 70),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 71)
  ) as v(g, l, val, s)
where p.slug = 'drill-bit-holder-keychain-set'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 4. Hi-Vis Safety Glasses (Universal) — every category — £7.90
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, is_universal
)
select c.id,
  'Hammerex Hi-Visibility Safety Glasses',
  'High-visibility safety glasses — impact-resistant, lightweight, reduces glare and eye strain. Suitable for every trade.',
  158000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/7c6bd0c284604c09.png',
  true,
  'hi-vis-safety-glasses', 'HX-HVG-001', 'Hammerex', 'HX-HVG', '14:00',
  1, 'United Kingdom',
  E'When it comes to working on site, safety should never be compromised. The **HAMMEREX High-Visibility Safety Glasses** are designed to provide superior eye protection while delivering the modern style today''s tradespeople demand.\n\nFeaturing a high-visibility tinted lens, these safety glasses enhance visual clarity in changing light conditions while helping reduce glare and eye fatigue throughout the workday. Whether you''re working on a construction site, scaffolding, bricklaying project, workshop, or industrial environment, HAMMEREX safety glasses are built to keep your vision protected and focused.\n\nConstructed from robust, impact-resistant materials, the lightweight frame delivers all-day comfort without sacrificing durability. The sleek, modern design means you don''t have to choose between safety and style — HAMMEREX combines both in one professional package.\n\n### Features\n\n* High-visibility tinted lenses\n* Impact-resistant construction\n* Lightweight and comfortable design\n* Durable frame built for site conditions\n* Reduces glare and eye strain\n* Secure fit for all-day wear\n* Modern professional styling\n* Suitable for construction, scaffolding, bricklaying, and general trade work\n\n### Benefits\n\n* Protects eyes from dust, debris, and workplace hazards\n* Enhances visibility in varying light conditions\n* Comfortable for extended use\n* Durable enough for demanding work environments\n* Stylish design that looks as good as it performs\n* Helps maintain focus and productivity throughout the day\n\n**HAMMEREX – Safety First. Performance Always.**',
  '[
    {"icon":"check","label":"High-visibility tinted lenses"},
    {"icon":"check","label":"Impact-resistant construction"},
    {"icon":"check","label":"Lightweight and comfortable design"},
    {"icon":"check","label":"Reduces glare and eye strain"},
    {"icon":"check","label":"Secure fit for all-day wear"},
    {"icon":"check","label":"Modern professional styling"},
    {"icon":"check","label":"Suitable for every trade"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'HI-VIS SAFETY GLASSES', 54, true
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'hi-vis-safety-glasses');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/7c6bd0c284604c09.png',
  'Hammerex Hi-Visibility Safety Glasses',
  0
from public.hammerex_products p
where p.slug = 'hi-vis-safety-glasses'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Also link to gloves-ppe tool-type bucket.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p cross join public.hammerex_categories c
where p.slug = 'hi-vis-safety-glasses' and c.slug = 'gloves-ppe'
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Hi-Vis Safety Glasses', 1, null, 0
from public.hammerex_products p where p.slug = 'hi-vis-safety-glasses'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Lens', 'High-visibility tinted, impact-resistant', 10),
    ('Material', 'Frame', 'Lightweight impact-resistant', 11),
    ('Design', 'Fit', 'Secure all-day wear', 20),
    ('Use', 'Built for', 'Every trade — construction, scaffolding, bricklaying, workshop, industrial', 30),
    ('Pricing', 'Single unit', '£7.90', 40),
    ('Stock', 'Availability', 'In stock', 50),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 51),
    ('Build & care', 'Made in', 'United Kingdom', 60),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 61)
  ) as v(g, l, val, s)
where p.slug = 'hi-vis-safety-glasses'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
