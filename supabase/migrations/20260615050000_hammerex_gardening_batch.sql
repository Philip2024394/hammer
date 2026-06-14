-- Batch: 4 gardening products on 2026-06-15. No "gardening" category exists;
-- primary = landscaping (closest); farming added as cross-list (allotments
-- / vegetable beds overlap). All images already in Supabase Storage.
--
--   1) Garden Tool Belt — Standard  — £13.70
--   2) Garden Tool Belt — Pro        — £19.99
--   3) Garden Knee Pads              — £14.65
--   4) Garden Kneeling Mat           — £16.30

-- ============================================================
-- 1. Garden Tool Belt — Standard — £13.70
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Tool Belt — Standard',
  'Adjustable garden tool belt with water-bottle holder, multiple front pockets, large centre compartment and rear storage. Built for gardeners, landscapers and outdoor enthusiasts.',
  274000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/00fe3bb0be46f1e0.png',
  true,
  'garden-tool-belt-standard', 'HX-GTB-001', 'Hammerex', 'HX-GTB', '14:00',
  1, 'United Kingdom',
  E'Keep your essential gardening tools, seeds, gloves, and water bottle close at hand with the **HAMMEREX Garden Tool Belt**. Designed for gardeners, landscapers, and outdoor enthusiasts, this versatile belt helps you work more efficiently by keeping everything you need within easy reach.\n\nThe intelligently designed storage system features multiple front pockets ideal for holding seed packets, plant labels, twine, and small accessories. The spacious centre compartment provides quick access to hand tools such as trowels, cultivators, pruners, and garden forks, while the rear storage section offers additional space for gloves, larger tools, and other gardening essentials when required.\n\nA dedicated water bottle holder keeps refreshments close by, allowing you to stay hydrated throughout the day without returning to your shed or work area. Built from durable materials and designed for comfort, the adjustable belt provides a secure fit while distributing weight evenly for all-day wear.\n\nFinished in the signature HAMMEREX black and yellow styling, this practical tool belt is built to withstand the demands of everyday gardening and landscaping tasks.\n\n### Features\n\n* Dedicated water bottle holder for convenient hydration\n* Front storage pockets for seed packets, plant labels, small accessories\n* Large centre compartment for hand tools and garden equipment\n* Rear storage pockets for gloves and additional tools\n* Adjustable waist belt for a secure and comfortable fit\n* Durable construction for long-lasting outdoor use\n* Lightweight design for all-day comfort\n* Quick-access layout keeps essential items within easy reach\n\n### Ideal For\n\n* Gardening · Planting & seeding · Landscaping\n* Greenhouse work · Allotments · DIY outdoor projects · Professional garden maintenance\n\n**Built to Work. Built to Last.**',
  '[
    {"icon":"check","label":"Dedicated water bottle holder"},
    {"icon":"check","label":"Front pockets for seeds, labels, accessories"},
    {"icon":"check","label":"Large centre compartment for hand tools"},
    {"icon":"check","label":"Rear pockets for gloves and additional tools"},
    {"icon":"check","label":"Adjustable waist belt"},
    {"icon":"check","label":"Lightweight, durable for all-day outdoor use"},
    {"icon":"check","label":"Hammerex black with yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN TOOL BELT — STANDARD', 58
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-tool-belt-standard');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/00fe3bb0be46f1e0.png',
  'Hammerex Garden Tool Belt — Standard', 0
from public.hammerex_products p
where p.slug = 'garden-tool-belt-standard'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('belt-holders', 2), ('aprons-workwear', 3)) as v(slug, s)
where p.slug = 'garden-tool-belt-standard' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Tool Belt (Standard)', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-tool-belt-standard'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX', 0),
    ('Material', 'Colour', 'Black with yellow stitching', 10),
    ('Capacity', 'Bottle holder', 'Fits most standard water bottles', 20),
    ('Capacity', 'Storage', 'Front / centre / rear multi-pocket', 21),
    ('Fit', 'Belt', 'Adjustable for a secure, comfortable fit', 30),
    ('Use', 'Built for', 'Gardening, landscaping, allotments, greenhouse, DIY outdoors', 40),
    ('Pricing', 'Single unit', '£13.70', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Made in', 'United Kingdom', 70),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 71)
  ) as v(g, l, val, s)
where p.slug = 'garden-tool-belt-standard'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 2. Garden Tool Belt — Pro — £19.99
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Tool Belt — Pro',
  'Pro adjustable garden tool belt with water-bottle holder, multiple front pockets, large centre compartment and rear storage. Heavier-duty build for professional gardeners and landscapers.',
  399800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/c35a73bf2cf1597c.png',
  true,
  'garden-tool-belt-pro', 'HX-GTBP-001', 'Hammerex', 'HX-GTBP', '14:00',
  1, 'United Kingdom',
  E'Keep your essential gardening tools, seeds, gloves, and water bottle close at hand with the **HAMMEREX Garden Tool Belt (Pro)**. Designed for gardeners, landscapers, and outdoor enthusiasts, this versatile belt helps you work more efficiently by keeping everything you need within easy reach.\n\nThe intelligently designed storage system features multiple front pockets ideal for holding seed packets, plant labels, twine, and small accessories. The spacious centre compartment provides quick access to hand tools such as trowels, cultivators, pruners, and garden forks, while the rear storage section offers additional space for gloves, larger tools, and other gardening essentials when required.\n\nA dedicated water bottle holder keeps refreshments close by, allowing you to stay hydrated throughout the day without returning to your shed or work area. Built from durable materials and designed for comfort, the adjustable belt provides a secure fit while distributing weight evenly for all-day wear.\n\nFinished in the signature HAMMEREX black and yellow styling, this practical tool belt is built to withstand the demands of everyday gardening and landscaping tasks.\n\n### Features\n\n* Dedicated water bottle holder for convenient hydration\n* Front storage pockets for seed packets, plant labels, small accessories\n* Large centre compartment for hand tools and garden equipment\n* Rear storage pockets for gloves and additional tools\n* Adjustable waist belt for a secure and comfortable fit\n* Durable construction for long-lasting outdoor use\n* Lightweight design for all-day comfort\n* Quick-access layout keeps essential items within easy reach\n\n### Ideal For\n\n* Gardening · Planting & seeding · Landscaping\n* Greenhouse work · Allotments · DIY outdoor projects · Professional garden maintenance\n\n**Built to Work. Built to Last.**',
  '[
    {"icon":"check","label":"Dedicated water bottle holder"},
    {"icon":"check","label":"Front pockets for seeds, labels, accessories"},
    {"icon":"check","label":"Large centre compartment for hand tools"},
    {"icon":"check","label":"Rear pockets for gloves and additional tools"},
    {"icon":"check","label":"Adjustable waist belt"},
    {"icon":"check","label":"Lightweight, durable for all-day outdoor use"},
    {"icon":"check","label":"Hammerex black with yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN TOOL BELT — PRO', 59
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-tool-belt-pro');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/c35a73bf2cf1597c.png',
  'Hammerex Garden Tool Belt — Pro', 0
from public.hammerex_products p
where p.slug = 'garden-tool-belt-pro'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('belt-holders', 2), ('aprons-workwear', 3)) as v(slug, s)
where p.slug = 'garden-tool-belt-pro' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Tool Belt (Pro)', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-tool-belt-pro'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX', 0),
    ('Brand', 'Edition', 'Pro', 1),
    ('Material', 'Colour', 'Black with yellow stitching', 10),
    ('Capacity', 'Bottle holder', 'Fits most standard water bottles', 20),
    ('Capacity', 'Storage', 'Front / centre / rear multi-pocket', 21),
    ('Fit', 'Belt', 'Adjustable for a secure, comfortable fit', 30),
    ('Use', 'Built for', 'Professional gardeners, landscapers, allotments, greenhouse, DIY', 40),
    ('Pricing', 'Single unit', '£19.99', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Made in', 'United Kingdom', 70),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 71)
  ) as v(g, l, val, s)
where p.slug = 'garden-tool-belt-pro'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 3. Garden Knee Pads — £14.65
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Knee Pads',
  'High-density foam garden knee pads with adjustable dual straps and water-resistant outer shell. Light, durable, ergonomic. Built for gardening, landscaping and DIY.',
  293000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6b3a1321737f8d02.png',
  true,
  'garden-knee-pads', 'HX-GKP-001', 'Hammerex', 'HX-GKP', '14:00',
  1, 'United Kingdom',
  E'Take the strain out of gardening with the **HAMMEREX Garden Knee Pads**. Designed to provide superior comfort and protection, these lightweight yet durable knee pads help shield your knees from hard ground, stones, gravel, and uneven surfaces while you work.\n\nFeaturing **thick high-density foam padding**, the ergonomic design cushions your knees and reduces pressure on joints, allowing you to spend more time gardening in comfort. The adjustable dual-strap system provides a secure fit for all-day wear, while the lightweight construction ensures unrestricted movement as you plant, weed, prune, and maintain your garden.\n\nBuilt with a **water-resistant outer shell**, these knee pads are easy to clean and designed to withstand daily outdoor use. Finished in the signature HAMMEREX black and yellow styling, they combine professional-grade durability with exceptional comfort.\n\n### Features\n\n* Thick foam padding for maximum knee protection\n* Adjustable dual straps for a secure and comfortable fit\n* Lightweight design for unrestricted movement\n* Water-resistant outer material\n* Durable construction built for regular outdoor use\n* Ergonomic shape conforms comfortably to the knee\n* Easy-clean surface\n* Suitable for gardening, landscaping, DIY projects, flooring, decorating, and general maintenance work\n\n### Perfect For\n\n* Planting flowers and vegetables · Weeding garden beds · Landscaping\n* Lawn maintenance · DIY and home improvement · Workshop and garage use\n\n**Built to Work. Built to Last.**',
  '[
    {"icon":"check","label":"Thick high-density foam padding"},
    {"icon":"check","label":"Adjustable dual-strap fastening"},
    {"icon":"check","label":"Water-resistant outer shell"},
    {"icon":"check","label":"Ergonomic shape — fits the knee"},
    {"icon":"check","label":"Lightweight, unrestricted movement"},
    {"icon":"check","label":"Easy-clean surface"},
    {"icon":"check","label":"Hammerex black with yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN KNEE PADS', 60
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-knee-pads');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/6b3a1321737f8d02.png',
  'Hammerex Garden Knee Pads', 0
from public.hammerex_products p
where p.slug = 'garden-knee-pads'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('gloves-ppe', 2)) as v(slug, s)
where p.slug = 'garden-knee-pads' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 pair × Hammerex Garden Knee Pads', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-knee-pads'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX', 0),
    ('Material', 'Outer shell', 'Durable water-resistant', 10),
    ('Material', 'Padding', 'High-density foam', 11),
    ('Material', 'Colour', 'Black with yellow stitching', 12),
    ('Design', 'Fastening', 'Adjustable dual-strap system', 20),
    ('Design', 'Weight', 'Lightweight', 21),
    ('Use', 'Built for', 'Gardening, landscaping, DIY, flooring, decorating, general maintenance', 30),
    ('Pricing', 'Single unit', '£14.65', 40),
    ('Stock', 'Availability', 'In stock', 50),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 51),
    ('Build & care', 'Water resistant', 'Yes', 60),
    ('Build & care', 'Made in', 'United Kingdom', 61),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 62)
  ) as v(g, l, val, s)
where p.slug = 'garden-knee-pads'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 4. Garden Kneeling Mat — £16.30
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Kneeling Mat',
  'Premium PU-leather garden kneeling mat with 40mm high-density foam core, concealed zipper for replaceable foam, non-slip base, reinforced webbing carry strap.',
  326000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/20c5262a78d340ab.png',
  true,
  'garden-kneeling-mat', 'HX-GKM-001', 'Hammerex', 'HX-GKM', '14:00',
  1, 'United Kingdom',
  E'Protect your knees and work in comfort with the **HAMMEREX Garden Kneeling Mat**. Designed for gardeners, landscapers, DIY enthusiasts, and outdoor professionals, this premium kneeling mat provides exceptional cushioning and support when working on hard, uneven, or damp surfaces.\n\nFeaturing a **thick high-density foam core**, the mat helps reduce pressure on your knees and joints, allowing you to work longer with less discomfort. The durable water-resistant outer cover is easy to clean and built to withstand daily use in gardens, workshops, garages, and around the home.\n\nUnlike standard kneeling pads, the HAMMEREX Kneeling Mat includes a **concealed side zipper** that allows the foam core to be removed and replaced if required, extending the life of your mat and reducing waste. The integrated **webbing carry strap** makes transport effortless, while the **non-slip base** helps keep the mat securely in place on a variety of surfaces.\n\nFinished in the signature HAMMEREX black and yellow design, this kneeling mat combines professional durability with all-day comfort.\n\n### Features\n\n* Thick high-density foam cushioning for superior knee support\n* Water-resistant and easy-clean outer cover\n* Non-slip textured base for added stability\n* Concealed side zipper with replaceable foam core\n* Durable webbing carry strap for easy transport\n* Rounded corners and reinforced stitching for long-lasting performance\n* Lightweight and portable design\n* Suitable for gardening, landscaping, DIY, decorating, flooring, plumbing, general maintenance\n\n**Built to Work. Built to Last.**',
  '[
    {"icon":"check","label":"40mm high-density foam core (replaceable)"},
    {"icon":"check","label":"Premium PU leather outer — water resistant, easy clean"},
    {"icon":"check","label":"Non-slip textured base"},
    {"icon":"check","label":"Concealed side zipper for foam replacement"},
    {"icon":"check","label":"Reinforced webbing carry strap"},
    {"icon":"check","label":"Rounded corners + reinforced stitching"},
    {"icon":"check","label":"Lightweight and portable"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN KNEELING MAT', 61
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-kneeling-mat');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/20c5262a78d340ab.png',
  'Hammerex Garden Kneeling Mat', 0
from public.hammerex_products p
where p.slug = 'garden-kneeling-mat'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('gloves-ppe', 2)) as v(slug, s)
where p.slug = 'garden-kneeling-mat' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Kneeling Mat (with replaceable foam core)', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-kneeling-mat'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX', 0),
    ('Material', 'Outer', 'Premium PU leather — water resistant', 10),
    ('Material', 'Core', 'High-density foam, 40mm (1.5")', 11),
    ('Material', 'Colour', 'Black with yellow stitching', 12),
    ('Design', 'Closure', 'Concealed side zipper — foam core removable / replaceable', 20),
    ('Design', 'Handle', 'Reinforced webbing carry strap', 21),
    ('Design', 'Base', 'Non-slip textured', 22),
    ('Use', 'Built for', 'Gardening, landscaping, DIY, decorating, flooring, plumbing, maintenance', 30),
    ('Pricing', 'Single unit', '£16.30', 40),
    ('Stock', 'Availability', 'In stock', 50),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 51),
    ('Build & care', 'Water resistant', 'Yes', 60),
    ('Build & care', 'Made in', 'United Kingdom', 61),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 62)
  ) as v(g, l, val, s)
where p.slug = 'garden-kneeling-mat'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
