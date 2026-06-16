-- HAMMEREX Garden Tool Backpack — 1680D polyester with PVC backing, 210D
-- lining, 26L capacity, 12+ pockets, padded shoulder straps + chest & waist
-- support, water-resistant. £39.99 GBP (Rp 799,800 @ 20k/£). Sits above
-- the £24.99 Bucket Organizer entry tier, below tradesman pro bags.
-- Primary: garden. Cross-listed to landscaping, outdoor, tool-bags-backpacks
-- (tool-type filter) and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Garden Tool Backpack',
  'Heavy-duty 26L garden tool backpack — 1680D polyester with PVC backing, 210D lining, 12+ pockets and tool loops, padded shoulder straps with chest + waist support, water-resistant. Built for gardeners, landscapers and grounds teams who carry a full kit between jobs.',
  799800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledasdasddasdasdasada.png',
  true,
  'garden-tool-backpack', 'HX-GBP-001', 'Hammerex', 'HX-GBP', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'**Carry more. Stay organised. Work smarter.**\n\nThe **HAMMEREX Garden Tool Backpack** is designed for gardeners, landscapers, allotment owners and outdoor professionals who need a durable and organised way to transport their tools. Built from heavy-duty materials with multiple storage compartments, this backpack keeps all your essential gardening tools within easy reach while providing all-day carrying comfort.\n\n### Key Features\n\n✅ **Large Capacity Storage** — spacious main compartment for hand tools, gloves, seeds, spray bottles and accessories. 26-litre capacity for everyday gardening tasks.\n\n✅ **Multiple Tool Pockets & Loops** — front organiser section securely holds trowels, forks, pruners, screwdrivers and other hand tools. Dedicated pockets keep equipment separated and easy to access.\n\n✅ **Heavy-Duty Construction** — rugged 1680D polyester with reinforced stitching for maximum durability. Designed to withstand demanding outdoor environments.\n\n✅ **Water-Resistant Design** — protects tools and equipment from moisture, dirt and light rain. Easy-to-clean fabric for long-lasting performance.\n\n✅ **Comfortable to Carry** — padded shoulder straps and breathable back panel reduce fatigue. Adjustable chest and waist straps provide added support and stability.\n\n✅ **Practical Everyday Use** — side mesh pockets for water bottles or spray containers. Front zip pocket for small accessories, phone, keys and personal items. Strong dual zippers and heavy-duty buckles for reliable performance.\n\n### Ideal For\n\n* Gardening · Landscaping · Allotments\n* Grounds Maintenance · Outdoor Work\n* Professional Gardeners · DIY Enthusiasts\n\nThe HAMMEREX Garden Tool Backpack combines durability, organisation and comfort — the right companion for keeping your gardening tools protected, organised and ready for every job.\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"26-litre main compartment"},
    {"icon":"check","label":"12+ storage pockets and tool loops"},
    {"icon":"check","label":"1680D polyester with PVC backing"},
    {"icon":"check","label":"210D polyester lining"},
    {"icon":"check","label":"Padded shoulder straps + breathable back panel"},
    {"icon":"check","label":"Adjustable chest and waist straps"},
    {"icon":"check","label":"Side mesh pockets for water / spray bottles"},
    {"icon":"check","label":"Front zip pocket for phone, keys, accessories"},
    {"icon":"check","label":"Water-resistant, easy-clean fabric"},
    {"icon":"check","label":"Dual zippers + heavy-duty buckles"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 worldwide shipping via EMS Air Mail (5–6 days transit)."
  ]'::jsonb,
  null, '26L GARDEN BACKPACK · 12+ POCKETS', 38,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'garden'
and not exists (select 1 from public.hammerex_products where slug = 'garden-tool-backpack');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledasdasddasdasdasada.png',
  'Hammerex Garden Tool Backpack — 26L, 1680D polyester, 12+ pockets, padded straps',
  0
from public.hammerex_products p
where p.slug = 'garden-tool-backpack'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to outdoor surfaces + storage tool-type.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('garden', 0),
    ('landscaping', 1),
    ('outdoor', 2),
    ('tool-bags-backpacks', 3),
    ('new-products', 4)
  ) as v(slug, s)
where p.slug = 'garden-tool-backpack' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Garden Tool Backpack (1680D, 26L, 12+ pockets)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'garden-tool-backpack'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Height',         '48 cm',                                               0),
    ('Dimensions',   'Width',          '34 cm',                                               1),
    ('Dimensions',   'Depth',          '22 cm',                                               2),
    ('Dimensions',   'Capacity',       'Approx. 26 litres',                                   3),
    ('Dimensions',   'Weight',         'Approx. 1.35 kg',                                     4),
    ('Capacity',     'Pockets',        '12+ pockets & tool loops (interior + exterior)',     10),
    ('Capacity',     'Use case',       'Trowels, forks, pruners, gloves, seeds, spray bottles', 11),
    ('Material',     'Fabric',         '1680D polyester with PVC backing',                   20),
    ('Material',     'Lining',         '210D polyester',                                     21),
    ('Material',     'Stitching',      'Reinforced stitching throughout',                    22),
    ('Material',     'Water resist',   'Water-resistant outer for site & light rain',        23),
    ('Carry',        'Shoulder',       'Padded shoulder straps + breathable back panel',     30),
    ('Carry',        'Support',        'Adjustable chest + waist straps',                    31),
    ('Carry',        'Hardware',       'Dual zippers + heavy-duty buckles',                  32),
    ('Design',       'Colour',         'Black with Hammerex yellow accents',                 40),
    ('Pricing',      'Single unit',    '£39.99',                                             50),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            51),
    ('Stock',        'Availability',   'In stock',                                           60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          61),
    ('Dispatch',     'Worldwide',      'Flat £20 EMS Air Mail · 5–6 days transit',           62),
    ('Use',          'Built for',      'Gardeners, landscapers, allotments, grounds teams',  70),
    ('Use',          'Environments',   'Gardens, greenhouses, allotments, job sites',        71),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     81)
  ) as v(g, l, val, s)
where p.slug = 'garden-tool-backpack'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
