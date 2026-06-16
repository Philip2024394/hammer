-- Two gardening products on 2026-06-15:
--   1) HAMMEREX Garden Apron     — £15.75 — 1680D polyester apron
--   2) HAMMEREX Garden Tool Tote — £14.99 — 1680D polyester tote bag
-- Primary category: landscaping; cross-listed to farming + the relevant
-- tool-type bucket. Images already in Supabase Storage.

-- ============================================================
-- 1. Garden Apron — £15.75
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Apron',
  '1680D polyester garden apron with multiple tool pockets, accessory loops, large lower utility pocket. Adjustable neck strap and quick-release waist buckle. Water-resistant.',
  315000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/12b8b544be69b180.png',
  true,
  'garden-apron', 'HX-GA-001', 'Hammerex', 'HX-GA', '14:00',
  1, 'United Kingdom',
  E'Stay organised, protected, and productive with the **Hammerex® Garden Apron**. Designed for gardeners, allotment growers, landscapers, and outdoor enthusiasts, this rugged work apron keeps essential tools and supplies within easy reach while you work.\n\nConstructed from premium **1680D polyester** with reinforced industrial stitching, the Garden Apron is built to handle demanding outdoor tasks. Multiple tool pockets, accessory compartments, and utility loops provide dedicated storage for trowels, hand forks, pruning shears, gloves, seed packets, plant labels, and other gardening essentials.\n\nThe adjustable neck and waist straps ensure a comfortable fit, while the water-resistant fabric helps protect clothing from dirt, moisture, and everyday garden debris. A large lower utility pocket offers convenient storage for harvested produce, weeds, twine, and miscellaneous gardening supplies.\n\nWhether you''re planting, pruning, harvesting, or maintaining your garden, the Hammerex Garden Apron keeps your tools organised and your hands free to focus on the job.\n\n## FEATURES\n\n* Heavy-duty 1680D polyester construction\n* Reinforced industrial stitching throughout\n* Adjustable neck strap for a comfortable fit\n* Adjustable waist belt with quick-release buckle\n* Multiple tool and accessory pockets\n* Dedicated pruning shear and hand tool holders\n* Utility loops for twine and garden accessories\n* Large lower storage pocket\n* Water-resistant and easy-to-clean fabric\n* Suitable for gardening, allotments, landscaping, and greenhouse work\n\n## SPECIFICATIONS\n\n* Material: 1680D Polyester with PVC Backing\n* Thread: Heavy-Duty Bonded Nylon\n* Neck Strap: Adjustable\n* Waist Belt: Adjustable with Quick-Release Buckle\n* Apron Size: 70cm (H) × 55cm (W)\n* Colour: Black with Hammerex Yellow Stitching and Trim\n* Weight: Approx. 0.7kg\n\n## IDEAL FOR STORING\n\n* Trowels · Hand forks · Pruning shears · Gardening gloves\n* Seed packets · Plant labels · Marker pens · Twine and accessories\n* Harvested fruit and vegetables\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"Heavy-duty 1680D polyester with PVC backing"},
    {"icon":"check","label":"Reinforced industrial stitching throughout"},
    {"icon":"check","label":"Adjustable neck strap + quick-release waist buckle"},
    {"icon":"check","label":"Multiple tool / accessory pockets + utility loops"},
    {"icon":"check","label":"Large lower utility pocket for harvested produce"},
    {"icon":"check","label":"Water-resistant, easy to clean"},
    {"icon":"check","label":"70cm (H) × 55cm (W), ~0.7kg"},
    {"icon":"check","label":"Black with Hammerex yellow stitching and trim"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN APRON — 1680D POLYESTER', 63
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-apron');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/12b8b544be69b180.png',
  'Hammerex Garden Apron — 1680D polyester with multiple tool pockets', 0
from public.hammerex_products p
where p.slug = 'garden-apron'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('aprons-workwear', 2)) as v(slug, s)
where p.slug = 'garden-apron' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Apron', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-apron'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Body', '1680D polyester with PVC backing', 10),
    ('Material', 'Thread', 'Heavy-duty bonded nylon', 11),
    ('Material', 'Colour', 'Black with Hammerex yellow stitching and trim', 12),
    ('Design', 'Neck strap', 'Adjustable', 20),
    ('Design', 'Waist belt', 'Adjustable with quick-release buckle', 21),
    ('Design', 'Pockets', 'Multiple tool / accessory pockets + utility loops + large lower utility pocket', 22),
    ('Dimensions', 'Size', '70cm (H) × 55cm (W)', 30),
    ('Dimensions', 'Weight', 'Approx. 0.7kg', 31),
    ('Use', 'Built for', 'Gardening, allotments, landscaping, greenhouse', 40),
    ('Pricing', 'Single unit', '£15.75', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Water resistant', 'Yes', 70),
    ('Build & care', 'Made in', 'United Kingdom', 71),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 72)
  ) as v(g, l, val, s)
where p.slug = 'garden-apron'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);

-- ============================================================
-- 2. Garden Tool Tote — £14.99
-- ============================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Tool Tote',
  '1680D polyester garden tool tote — large central compartment, exterior pockets, waterproof reinforced base, heavy-duty webbing handles. Structured to stand upright.',
  299800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/0045ecebba4f4639.png',
  true,
  'garden-tool-tote', 'HX-GTT-001', 'Hammerex', 'HX-GTT', '14:00',
  1, 'United Kingdom',
  E'Keep your essential gardening tools organised, protected, and within easy reach with the **Hammerex® Garden Tool Tote**. Designed for gardeners, landscapers, allotment growers, and outdoor enthusiasts, this rugged tool carrier provides a practical solution for transporting and storing your most-used gardening equipment.\n\nConstructed from premium **1680D polyester** with reinforced industrial stitching, the Garden Tool Tote is built to withstand demanding outdoor conditions. The large central storage compartment provides ample space for hand tools, gloves, twine, seed packets, and gardening accessories, while multiple exterior pockets keep frequently used items organised and easily accessible.\n\nA **reinforced waterproof base** helps protect contents from damp ground conditions, while heavy-duty webbing handles ensure comfortable carrying when fully loaded. The structured design allows the tote to stand upright for convenient access while working in the garden.\n\nWhether you''re planting, pruning, weeding, harvesting, or maintaining an allotment, the Hammerex Garden Tool Tote keeps everything organised and ready for the job.\n\n## FEATURES\n\n* Heavy-duty 1680D polyester construction\n* Reinforced industrial stitching throughout\n* Large open central storage compartment\n* Multiple external tool and accessory pockets\n* Waterproof reinforced base panel\n* Heavy-duty webbing carry handles\n* Structured design remains upright during use\n* Water-resistant and easy-to-clean materials\n\n## SPECIFICATIONS\n\n* Material: 1680D Polyester with PVC Backing\n* Base: Reinforced Waterproof Panel\n* Handles: Heavy-Duty Webbing\n* Dimensions: 40cm (L) × 20cm (W) × 30cm (H)\n* Colour: Black with Hammerex Yellow Stitching and Trim\n* Weight: Approx. 1kg\n\n## IDEAL FOR STORING\n\n* Trowels · Hand forks · Cultivators · Pruning shears · Gardening gloves\n* Seed packets · Plant markers · Twine and accessories · Water bottles\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"Heavy-duty 1680D polyester with PVC backing"},
    {"icon":"check","label":"Large open central storage compartment"},
    {"icon":"check","label":"Multiple external tool / accessory pockets"},
    {"icon":"check","label":"Waterproof reinforced base panel"},
    {"icon":"check","label":"Heavy-duty webbing carry handles"},
    {"icon":"check","label":"Structured design — stands upright when working"},
    {"icon":"check","label":"40 × 20 × 30 cm, ~1kg"},
    {"icon":"check","label":"Black with Hammerex yellow stitching and trim"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN TOOL TOTE — 1680D POLYESTER', 64
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-tool-tote');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/0045ecebba4f4639.png',
  'Hammerex Garden Tool Tote — 1680D polyester with waterproof reinforced base', 0
from public.hammerex_products p
where p.slug = 'garden-tool-tote'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('tool-bags-backpacks', 2)) as v(slug, s)
where p.slug = 'garden-tool-tote' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Tool Tote', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-tool-tote'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Body', '1680D polyester with PVC backing', 10),
    ('Material', 'Base', 'Reinforced waterproof panel', 11),
    ('Material', 'Handles', 'Heavy-duty webbing', 12),
    ('Material', 'Colour', 'Black with Hammerex yellow stitching and trim', 13),
    ('Design', 'Compartments', 'Large central storage + multiple external pockets', 20),
    ('Design', 'Structure', 'Stands upright when in use', 21),
    ('Dimensions', 'Size', '40cm (L) × 20cm (W) × 30cm (H)', 30),
    ('Dimensions', 'Weight', 'Approx. 1kg', 31),
    ('Use', 'Built for', 'Gardening, allotments, landscaping, greenhouse', 40),
    ('Pricing', 'Single unit', '£14.99', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Water resistant', 'Yes', 70),
    ('Build & care', 'Made in', 'United Kingdom', 71),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 72)
  ) as v(g, l, val, s)
where p.slug = 'garden-tool-tote'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
