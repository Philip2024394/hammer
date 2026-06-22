-- New `belts` category + five belt products.
--
-- Strategy for the old `leather-tool-belt-2-inch` row: UPDATE in place
-- rather than DELETE. The row has 27 reviews and an active URL — keeping
-- the UUID + slug preserves both. The new name/copy/image/sizes overwrite
-- the old "Heavy-Duty Leather Tool Belt" content, and the row moves into
-- the new belts category. Specs are refreshed via delete-then-insert so
-- they match the new product description.
--
-- Prices are all set to 0 placeholder per owner instruction — to be set
-- after review. Shipping stays at 0 (free UK delivery, consistent with
-- the rest of the belt catalogue).

-- 1) Category --------------------------------------------------------------

insert into public.hammerex_categories (slug, name, sort_order, is_tool_type, card_show_label)
values ('belts', 'Belts', 50, false, true)
on conflict (slug) do update set name = excluded.name;

-- 2) Update the existing 2" belt row in place --------------------------------

update public.hammerex_products
set
  category_id      = (select id from public.hammerex_categories where slug = 'belts'),
  name             = 'Hammerex 2" Heavy Duty Leather Work Belt',
  subtitle         = 'Inner Flex Plate reinforced · sizes 28"–48"',
  description      = 'Premium heavy-duty 2" leather work belt with Hammerex Inner Flex Plate Technology — a hidden reinforced centre layer that resists stretching, buckle pull-out and shape distortion under heavy tool loads.',
  overview         = E'The Hammerex 2" Leather Work Belt is built on a design that tradespeople have trusted for generations. From electricians and carpenters to builders, plumbers, and general construction workers, the 2" work belt remains the industry standard for carrying tool pouches and equipment comfortably throughout the day.\n\nAvailable in sizes up to 48", the Hammerex belt takes a proven design and adds innovative features that set it apart from ordinary leather belts. While the premium leather construction delivers the rugged performance professionals expect, the real strength lies beneath the surface.\n\nAt the core of the belt is Hammerex''s Inner Flex Plate Technology — a reinforced centre layer engineered to resist stretching, distortion, and buckle pull-out over years of hard use. This hidden reinforcement helps maintain the belt''s shape and structural integrity, even when carrying heavily loaded tool pouches and accessories.\n\nThe result is a belt that not only looks professional but continues to perform day after day, year after year. Designed to withstand demanding job site conditions, the Hammerex Leather Work Belt combines traditional craftsmanship with modern reinforcement technology to deliver exceptional durability and comfort.',
  image_url        = 'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2011_41_43%20AM.png?updatedAt=1782016925529',
  sizes            = '["28\"","30\"","32\"","34\"","36\"","38\"","40\"","44\"","48\""]'::jsonb,
  features         = '[
    {"icon":"⚙","label":"Traditional 2\" wide heavy-duty leather work belt"},
    {"icon":"🛡","label":"Inner Flex Plate reinforced centre layer"},
    {"icon":"🔩","label":"Reinforced riveted buckle attachment"},
    {"icon":"📐","label":"Precision punched adjustment holes"},
    {"icon":"🧵","label":"Professional edge stitching"},
    {"icon":"🔧","label":"Fits most standard tool pouches and belt accessories"},
    {"icon":"📏","label":"Sizes 28\"–48\" — fits the full trade size range"}
  ]'::jsonb,
  price_idr        = 0,
  compare_at_idr   = null,
  shipping_per_unit_idr = 0,
  base_currency    = 'GBP',
  brand            = 'Hammerex',
  sku              = 'HX-LB2-001',
  stock_count      = 100,
  dispatch_lead_days = 3,
  is_featured      = false,
  hide_from_upsell = false
where slug = 'leather-tool-belt-2-inch';

-- Sync the product↔category bridge row to point at the new belts category.
update public.hammerex_product_categories
set category_id = (select id from public.hammerex_categories where slug = 'belts')
where product_id = (select id from public.hammerex_products where slug = 'leather-tool-belt-2-inch');

-- 3) Refresh specs for the 2" belt ------------------------------------------

delete from public.hammerex_product_specs
where product_id = (select id from public.hammerex_products where slug = 'leather-tool-belt-2-inch');

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select id, 'Construction', 'Width', '2 inch (50mm)', 1 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Construction', 'Material', 'Premium heavy-duty leather', 2 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Construction', 'Core', 'Inner Flex Plate reinforced centre layer', 3 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Construction', 'Buckle', 'Riveted heavy-duty buckle assembly', 4 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Construction', 'Stitching', 'Double edge stitched', 5 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Sizing', 'Available sizes', '28", 30", 32", 34", 36", 38", 40", 44", 48"', 1 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Use', 'Compatibility', 'Standard tool pouches and belt accessories', 1 from public.hammerex_products where slug = 'leather-tool-belt-2-inch'
union all
select id, 'Use', 'Designed for', 'Electricians, carpenters, builders, plumbers, construction', 2 from public.hammerex_products where slug = 'leather-tool-belt-2-inch';

-- 4) New product: Hammerex Fast Clip Work Belt -------------------------------

insert into public.hammerex_products (
  category_id, slug, name, subtitle, description, overview,
  image_url, sizes, features, price_idr, shipping_per_unit_idr,
  base_currency, brand, sku, stock_count, dispatch_lead_days
)
select
  c.id,
  'fast-clip-work-belt',
  'Hammerex Fast Clip Work Belt',
  '38mm nylon · adjustable 120cm · quick-release buckle',
  'Heavy-duty 38mm nylon webbing work belt with a premium quick-release fast-clip buckle — fitted, removed, adjusted and secured in seconds. Buckle can sit at the front or rear of the waist for fast tool-pouch access.',
  E'Built for work and designed for comfort, the Hammerex Fast Clip Work Belt is a versatile heavy-duty belt engineered for tradespeople, construction workers, maintenance professionals, and anyone who needs a reliable belt system on site.\n\nManufactured from durable 38mm (3.8cm) heavy-duty nylon webbing, this belt delivers exceptional strength while remaining lightweight and comfortable for all-day wear. The premium quick-release buckle system allows the belt to be fitted, removed, adjusted, and secured in seconds, making it ideal for fast-paced work environments.\n\nThe innovative buckle design can be positioned at either the front or rear of the belt, allowing users to choose the most comfortable setup for their application. When worn at the back, the buckle remains easily accessible for quick release and adjustment, helping to reduce interference with tool pouches and equipment carried around the waist.\n\nWith a fully adjustable 120cm length, the Hammerex Fast Clip Work Belt provides a secure and comfortable fit for a wide range of waist sizes and can be used as a standalone work belt or as the foundation for various pouch and tool-carrying systems.',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_41_38%20AM.png?updatedAt=1782013316972',
  '[]'::jsonb,
  '[
    {"icon":"🧵","label":"Heavy-duty 38mm nylon webbing"},
    {"icon":"⚡","label":"Quick-release fast clip buckle"},
    {"icon":"📏","label":"Adjustable length up to 120cm"},
    {"icon":"🔁","label":"Buckle can sit at the front or rear of the belt"},
    {"icon":"🪶","label":"Lightweight, comfortable for all-day wear"},
    {"icon":"💧","label":"Wear-resistant — wipes clean"},
    {"icon":"🔧","label":"Fits a wide range of tool pouches and accessories"}
  ]'::jsonb,
  0,
  0,
  'GBP',
  'Hammerex',
  'HX-FCB-001',
  100,
  2
from public.hammerex_categories c where c.slug = 'belts'
on conflict (slug) do nothing;

insert into public.hammerex_product_categories (product_id, category_id, is_primary)
select p.id, c.id, true
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'fast-clip-work-belt' and c.slug = 'belts'
on conflict do nothing;

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, 'Construction', 'Length', '120cm', 1 from public.hammerex_products p where p.slug = 'fast-clip-work-belt'
union all
select p.id, 'Construction', 'Width', '38mm (3.8cm)', 2 from public.hammerex_products p where p.slug = 'fast-clip-work-belt'
union all
select p.id, 'Construction', 'Material', 'Heavy-duty nylon webbing', 3 from public.hammerex_products p where p.slug = 'fast-clip-work-belt'
union all
select p.id, 'Construction', 'Buckle', 'Quick-release fast-clip system', 4 from public.hammerex_products p where p.slug = 'fast-clip-work-belt'
union all
select p.id, 'Use', 'Buckle position', 'Front or rear of waist', 1 from public.hammerex_products p where p.slug = 'fast-clip-work-belt'
union all
select p.id, 'Use', 'Compatibility', 'Wide range of tool pouches and accessories', 2 from public.hammerex_products p where p.slug = 'fast-clip-work-belt';

-- 5) New product: Hammerex Heavy Duty Lanyard Safety Belt -------------------

insert into public.hammerex_products (
  category_id, slug, name, subtitle, description, overview,
  image_url, sizes, features, price_idr, shipping_per_unit_idr,
  base_currency, brand, sku, stock_count, dispatch_lead_days
)
select
  c.id,
  'lanyard-safety-belt',
  'Hammerex Heavy Duty Lanyard Safety Belt',
  '2" leather · 4 sliding D-ring stations · up to 5 lanyards each',
  'Heavy-duty 2" leather safety belt with four steel D-ring lanyard stations that slide along the belt — secure attachment points for working at height, with freedom to slide tool pouches past each station when not tethering.',
  E'Designed for tradespeople working at height, the Hammerex Heavy Duty Lanyard Safety Belt provides a secure and reliable attachment point for tool lanyards, helping to reduce the risk of dropped tools on site. Built from premium heavy-duty leather and reinforced with riveted construction, this belt is engineered for demanding industrial, construction, scaffolding, and maintenance environments.\n\nFeaturing a robust 2" wide leather belt, the system incorporates four heavy-duty steel D-ring attachment stations strategically positioned around the belt. Each D-ring assembly is designed to accommodate multiple tool lanyards, allowing users to secure a wide range of tools while maintaining comfort and mobility throughout the workday.\n\nA unique sliding attachment design allows the D-ring stations to be pushed towards the left or right side of the belt when not required. This enables tool pouches, holders, and accessories to slide freely along the belt without obstruction, providing maximum flexibility when configuring your tool setup.\n\nEach D-ring attachment station is engineered to support up to five heavy-duty tool lanyards, allowing users to safely secure multiple tools while working from height.',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_29_23%20AM.png?updatedAt=1782012584919',
  '["Medium 30\"","Large 38\"","Extra Large 46\""]'::jsonb,
  '[
    {"icon":"📏","label":"Heavy-duty 2\" wide leather belt"},
    {"icon":"🛡","label":"Premium leather, reinforced riveted assembly"},
    {"icon":"🔗","label":"Four steel D-ring lanyard stations"},
    {"icon":"↔","label":"D-ring stations slide left or right when not in use"},
    {"icon":"🪢","label":"Each station supports up to 5 heavy-duty lanyards"},
    {"icon":"🪜","label":"Suited to scaffolding, structural steel, elevated platforms"}
  ]'::jsonb,
  0,
  0,
  'GBP',
  'Hammerex',
  'HX-LSB-001',
  100,
  3
from public.hammerex_categories c where c.slug = 'belts'
on conflict (slug) do nothing;

insert into public.hammerex_product_categories (product_id, category_id, is_primary)
select p.id, c.id, true
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'lanyard-safety-belt' and c.slug = 'belts'
on conflict do nothing;

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, 'Construction', 'Width', '2 inch (50mm)', 1 from public.hammerex_products p where p.slug = 'lanyard-safety-belt'
union all
select p.id, 'Construction', 'Material', 'Premium heavy-duty leather', 2 from public.hammerex_products p where p.slug = 'lanyard-safety-belt'
union all
select p.id, 'Construction', 'Assembly', 'Riveted construction throughout', 3 from public.hammerex_products p where p.slug = 'lanyard-safety-belt'
union all
select p.id, 'Lanyard system', 'D-ring stations', '4 sliding steel D-ring assemblies', 1 from public.hammerex_products p where p.slug = 'lanyard-safety-belt'
union all
select p.id, 'Lanyard system', 'Lanyards per station', 'Up to 5 heavy-duty lanyards', 2 from public.hammerex_products p where p.slug = 'lanyard-safety-belt'
union all
select p.id, 'Sizing', 'Available sizes', 'Medium 30", Large 38", Extra Large 46"', 1 from public.hammerex_products p where p.slug = 'lanyard-safety-belt';

-- 6) New product: Hammerex 4" Heavy Duty Belt Support ----------------------

insert into public.hammerex_products (
  category_id, slug, name, subtitle, description, overview,
  image_url, sizes, features, price_idr, shipping_per_unit_idr,
  base_currency, brand, sku, stock_count, dispatch_lead_days
)
select
  c.id,
  '4-inch-belt-support',
  'Hammerex 4" Heavy Duty Belt Support',
  '4" support body · 2" front lips · fits heavier tool loads',
  'Wide 4" leather belt support that distributes heavy tool-loads across the waist, with 2" front lips so standard pouches and holders still fit. Built for tradespeople carrying more weight than a standard 2" belt can handle.',
  E'The Hammerex 4" Heavy Duty Belt Support is designed for tradespeople who carry heavier tool loads and require greater stability than a standard work belt can provide. Featuring a wide 4" support section, this belt helps distribute weight more evenly around the waist, reducing pressure points and improving comfort during long days on site.\n\nUnlike conventional belts, the Hammerex support belt provides a larger mounting surface for tool holders and accessories that require multiple fixing points or hole placements. The wider design helps prevent twisting and sagging when carrying heavier pouches, drills, fastening systems, and specialised trade equipment.\n\nThe belt transitions to 2" front support lips, allowing compatibility with standard tool pouches, holders, and accessories while maintaining freedom of movement and a comfortable fit around the front of the waist.\n\nConstructed from premium heavy-duty leather and reinforced with heavy-duty rivets throughout, this belt is built to withstand the daily punishment of construction, maintenance, electrical, plumbing, and industrial work environments.',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_02_54%20AM.png?updatedAt=1782011049952',
  '[]'::jsonb,
  '[
    {"icon":"📏","label":"4\" wide back-support body, 2\" front lips"},
    {"icon":"⚖","label":"Distributes heavier loads evenly across the waist"},
    {"icon":"🔩","label":"Heavy-duty rivets throughout"},
    {"icon":"🧵","label":"Double stitched for added strength"},
    {"icon":"🛡","label":"Premium heavy-duty leather"},
    {"icon":"🔧","label":"2\" front lips compatible with standard pouches"},
    {"icon":"📐","label":"Larger mounting area for multi-hole holders"}
  ]'::jsonb,
  524194,
  0,
  'GBP',
  'Hammerex',
  'HX-4BS-001',
  100,
  3
from public.hammerex_categories c where c.slug = 'belts'
on conflict (slug) do nothing;

insert into public.hammerex_product_categories (product_id, category_id, is_primary)
select p.id, c.id, true
from public.hammerex_products p, public.hammerex_categories c
where p.slug = '4-inch-belt-support' and c.slug = 'belts'
on conflict do nothing;

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, 'Construction', 'Back-support width', '4 inch (100mm)', 1 from public.hammerex_products p where p.slug = '4-inch-belt-support'
union all
select p.id, 'Construction', 'Front lip width', '2 inch (50mm)', 2 from public.hammerex_products p where p.slug = '4-inch-belt-support'
union all
select p.id, 'Construction', 'Material', 'Premium heavy-duty leather', 3 from public.hammerex_products p where p.slug = '4-inch-belt-support'
union all
select p.id, 'Construction', 'Assembly', 'Heavy-duty rivets, double stitched', 4 from public.hammerex_products p where p.slug = '4-inch-belt-support'
union all
select p.id, 'Use', 'Designed for', 'Heavy tool loads, multi-hole holders', 1 from public.hammerex_products p where p.slug = '4-inch-belt-support'
union all
select p.id, 'Use', 'Compatibility', 'Standard tool pouches via 2" front lips', 2 from public.hammerex_products p where p.slug = '4-inch-belt-support';

-- 7) New product: Hammerex Padded Belt Support System -----------------------

insert into public.hammerex_products (
  category_id, slug, name, subtitle, description, overview,
  image_url, sizes, features, price_idr, shipping_per_unit_idr,
  base_currency, brand, sku, stock_count, dispatch_lead_days, purchase_notes
)
select
  c.id,
  'padded-belt-support-system',
  'Hammerex Padded Belt Support & Heavy Duty Work Belt System',
  '5" padded back + 2" heavy-duty work belt · all-day support',
  'Heavy-duty 2" work belt paired with a 5" padded back support that wraps round the sides for all-day weight distribution. Sold as the complete system; individual parts also available — message us to specify on order.',
  E'Experience all-day comfort, support, and durability with the Hammerex Padded Belt Support & Work Belt System. Designed for tradespeople who spend long hours on site, this versatile system can be purchased as a complete setup or as individual components to suit your existing tool belt configuration.\n\nThe system features a heavy-duty 2" work belt paired with a 5" padded back support section that extends into the sides to provide additional comfort and stability where it''s needed most. Whether you''re carrying a full set of tools or working through demanding site conditions, the Hammerex belt system helps distribute weight evenly across the waist and lower back, reducing fatigue throughout the day.\n\nConstructed from premium heavy-duty materials with reinforced stitching and rugged hardware, this belt system is built to withstand the toughest job sites while maintaining a professional appearance. The ergonomic design combines strength, comfort, and style, making it ideal for electricians, carpenters, builders, plumbers, and general tradespeople.\n\nAvailable as: Padded Belt Support only · Heavy Duty 2" Belt only · or the Complete Belt & Support System.',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxzcxzxcsdsdasdasd.png?updatedAt=1782011026288',
  '["Medium 30\"","Large 38\"","Extra Large 46\""]'::jsonb,
  '[
    {"icon":"⚖","label":"5\" padded back support extending into the sides"},
    {"icon":"📏","label":"Heavy-duty 2\" work belt included"},
    {"icon":"🧘","label":"Reduces fatigue across long shifts"},
    {"icon":"🛡","label":"Reinforced construction, rugged hardware"},
    {"icon":"🧵","label":"Heavy-duty stitching"},
    {"icon":"🔧","label":"Compatible with standard pouches and accessories"}
  ]'::jsonb,
  0,
  0,
  'GBP',
  'Hammerex',
  'HX-PBS-001',
  100,
  3,
  '["Sold as the complete belt + padded-support system by default.","Padded Belt Support only, or Heavy-Duty 2\" Belt only, also available — message us on WhatsApp before paying to switch."]'::jsonb
from public.hammerex_categories c where c.slug = 'belts'
on conflict (slug) do nothing;

insert into public.hammerex_product_categories (product_id, category_id, is_primary)
select p.id, c.id, true
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'padded-belt-support-system' and c.slug = 'belts'
on conflict do nothing;

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, 'Construction', 'Back support', '5" padded, extends into sides', 1 from public.hammerex_products p where p.slug = 'padded-belt-support-system'
union all
select p.id, 'Construction', 'Belt width', '2 inch (50mm)', 2 from public.hammerex_products p where p.slug = 'padded-belt-support-system'
union all
select p.id, 'Construction', 'Material', 'Premium heavy-duty, reinforced stitching', 3 from public.hammerex_products p where p.slug = 'padded-belt-support-system'
union all
select p.id, 'Sizing', 'Available sizes', 'Medium 30", Large 38", Extra Large 46"', 1 from public.hammerex_products p where p.slug = 'padded-belt-support-system'
union all
select p.id, 'Purchase', 'Options', 'Complete system · Padded only · Belt only (specify on WhatsApp)', 1 from public.hammerex_products p where p.slug = 'padded-belt-support-system';
