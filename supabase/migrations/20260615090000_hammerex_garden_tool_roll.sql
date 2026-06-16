-- HAMMEREX Garden Tool Roll — 1680D polyester roll-up tool organiser with
-- multiple deep pockets, dual buckle straps. 63 × 38 cm open, 40 × 13 cm
-- rolled. £12.99 GBP (Rp 259,800). Primary: landscaping. Cross-listed to
-- farming + tool-bags-backpacks tool-type.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Garden Tool Roll',
  '1680D polyester garden tool roll-up organiser — multiple deep pockets for trowels, hand forks, cultivators, pruners. Dual buckle straps, integrated carry handle. 63×38cm open / 40×13cm rolled.',
  259800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/ecd70f50505c3059.png',
  true,
  'garden-tool-roll', 'HX-GTR-001', 'Hammerex', 'HX-GTR', '14:00',
  1, 'United Kingdom',
  E'Keep your essential gardening tools organised, protected, and ready for every job with the **Hammerex® Garden Tool Roll**. Designed for gardeners, landscapers, and outdoor enthusiasts, this durable tool organiser provides a compact and convenient way to store and transport your most-used hand tools.\n\nManufactured from premium **1680D polyester** with reinforced stitching, the Garden Tool Roll is built to withstand tough outdoor conditions while keeping tools securely in place. Multiple deep pockets accommodate trowels, hand forks, cultivators, pruning shears, gloves, markers, and other gardening essentials. Adjustable buckle straps allow the organiser to roll into a compact carry size for easy transport and storage.\n\nWhether you''re working in the garden, greenhouse, allotment, or landscaping site, the Hammerex Garden Tool Roll helps keep your tools protected, organised, and within easy reach.\n\n## FEATURES\n\n* Heavy-duty 1680D polyester construction\n* Reinforced industrial stitching for long service life\n* Multiple tool pockets for organised storage\n* Adjustable quick-release buckle straps\n* Compact roll-up design for easy carrying\n* Water-resistant fabric protects against dirt and moisture\n* Integrated carry handle for convenient transport\n* Suitable for gardening, landscaping, allotments, and outdoor maintenance\n\n## SPECIFICATIONS\n\n* Material: 1680D Polyester with PVC Backing\n* Dimensions (Open): 63cm × 38cm\n* Dimensions (Rolled): 40cm × 13cm\n* Closure: Dual Adjustable Buckle Straps\n* Colour: Black with Hammerex Yellow Stitching\n* Use: Garden Tool Storage and Transport\n\nPerfect for storing trowels, hand forks, cultivators, pruners, gloves, markers, twine, and other gardening essentials.\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"1680D polyester with PVC backing"},
    {"icon":"check","label":"Multiple deep tool pockets"},
    {"icon":"check","label":"Dual adjustable quick-release buckle straps"},
    {"icon":"check","label":"Rolls down to 40 × 13 cm for compact carry"},
    {"icon":"check","label":"Integrated carry handle"},
    {"icon":"check","label":"Water-resistant, easy to clean"},
    {"icon":"check","label":"Black with Hammerex yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'GARDEN TOOL ROLL — 1680D POLYESTER', 68
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-tool-roll');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/ecd70f50505c3059.png',
  'Hammerex Garden Tool Roll — 1680D polyester roll-up tool organiser', 0
from public.hammerex_products p
where p.slug = 'garden-tool-roll'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('landscaping', 0), ('farming', 1), ('tool-bags-backpacks', 2)) as v(slug, s)
where p.slug = 'garden-tool-roll' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, '1 × Hammerex Garden Tool Roll', 1, null, 0
from public.hammerex_products p where p.slug = 'garden-tool-roll'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand', 'Brand', 'HAMMEREX®', 0),
    ('Material', 'Body', '1680D polyester with PVC backing', 10),
    ('Material', 'Stitching', 'Reinforced industrial', 11),
    ('Material', 'Colour', 'Black with Hammerex yellow stitching', 12),
    ('Design', 'Closure', 'Dual adjustable buckle straps', 20),
    ('Design', 'Pockets', 'Multiple deep tool pockets', 21),
    ('Design', 'Handle', 'Integrated carry handle', 22),
    ('Dimensions', 'Open', '63cm × 38cm', 30),
    ('Dimensions', 'Rolled', '40cm × 13cm', 31),
    ('Use', 'Built for', 'Gardening, landscaping, allotments, greenhouses, outdoor maintenance', 40),
    ('Pricing', 'Single unit', '£12.99', 50),
    ('Stock', 'Availability', 'In stock', 60),
    ('Dispatch', 'Lead time', 'Dispatched within 3 working days', 61),
    ('Build & care', 'Water resistant', 'Yes', 70),
    ('Build & care', 'Made in', 'United Kingdom', 71),
    ('Build & care', 'Warranty', '1 year (manufacturing defects)', 72)
  ) as v(g, l, val, s)
where p.slug = 'garden-tool-roll'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g);
