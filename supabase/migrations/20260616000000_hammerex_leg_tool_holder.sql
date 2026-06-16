-- HAMMEREX Heavy Duty Leg Tool Holder — 1680D leg-mounted organiser for
-- electricians, maintenance techs, builders, scaffolders and industrial
-- crews. Adjustable leg + waist straps, multiple reinforced pockets, tool
-- retention straps. £39.99 GBP (Rp 799,800 @ 20k/£). Sits below the
-- specialised £49 Trowel Leg Pouch (plasterer-focused).
-- Primary: electrical. Cross-listed to scaffolding, carpentry,
-- metal-fabrication, tool-bags-backpacks (tool-type) and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Heavy Duty Leg Tool Holder',
  'Leg-mounted 1680D tool organiser — multiple reinforced pockets, adjustable retention straps, comfortable adjustable leg and waist straps. Keeps screwdrivers, pliers, cutters, testers and hand tools secure and within reach for electricians, scaffolders, builders and industrial crews.',
  799800,
  'https://ik.imagekit.io/9mrgsv2rp/carpenterewrwerwer.png',
  true,
  'leg-tool-holder', 'HX-LTH-001', 'Hammerex', 'HX-LTH', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Keep your essential tools exactly where you need them with the **HAMMEREX™ Heavy Duty Leg Tool Holder**. Designed for electricians, maintenance technicians, builders, scaffolders and industrial professionals, this rugged leg-mounted organiser keeps your most-used hand tools secure, accessible, and ready for action.\n\nConstructed from durable **1680D heavy-duty fabric**, the holder is built to withstand demanding jobsite conditions while providing long-lasting performance. Multiple reinforced tool pockets and adjustable retention straps securely hold screwdrivers, pliers, cutters, testers and other hand tools without unwanted movement or rattling.\n\nThe adjustable leg and waist straps provide a comfortable, secure fit that stays in place while walking, climbing ladders or working at height. The ergonomic design reduces unnecessary bending and trips back to the toolbox, helping improve efficiency and productivity throughout the workday.\n\n### Features\n\n* Heavy-duty 1680D industrial fabric construction\n* Multiple tool pockets for organised storage\n* Adjustable retention straps securely hold tools in place\n* Comfortable adjustable leg and waist straps\n* Fast access to frequently used hand tools\n* Reinforced stitching for maximum durability\n* Suitable for construction, electrical, maintenance and industrial work\n* Lightweight design that reduces tool belt bulk\n\n### Benefits\n\n* Keep tools within easy reach\n* Reduce downtime and increase productivity\n* Improve tool organisation on the job\n* Secure fit for active work environments\n* Built for professional daily use\n\nWhether you''re on a construction site, industrial plant, maintenance job or electrical installation, the HAMMEREX™ Leg Tool Holder helps you stay organised, work faster, and keep your tools exactly where you need them.',
  '[
    {"icon":"check","label":"Heavy-duty 1680D industrial fabric"},
    {"icon":"check","label":"Multiple reinforced tool pockets"},
    {"icon":"check","label":"Adjustable retention straps for secure tool hold"},
    {"icon":"check","label":"Adjustable leg + waist straps for active wear"},
    {"icon":"check","label":"Lightweight — less bulk than a full tool belt"},
    {"icon":"check","label":"Stays put when walking, climbing or at height"},
    {"icon":"check","label":"Reinforced stitching for daily site use"},
    {"icon":"check","label":"Fits screwdrivers, pliers, cutters, testers, markers"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 worldwide shipping via EMS Air Mail (5–6 days transit)."
  ]'::jsonb,
  null, 'LEG TOOL HOLDER · 1680D', 39,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'leg-tool-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/carpenterewrwerwer.png',
  'Hammerex Heavy Duty Leg Tool Holder — 1680D, multi-pocket, adjustable leg + waist straps',
  0
from public.hammerex_products p
where p.slug = 'leg-tool-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list — electrical primary, plus the trades the listing names.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('electrical', 0),
    ('scaffolding', 1),
    ('carpentry', 2),
    ('metal-fabrication', 3),
    ('tool-bags-backpacks', 4),
    ('new-products', 5)
  ) as v(slug, s)
where p.slug = 'leg-tool-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Heavy Duty Leg Tool Holder (1680D)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'leg-tool-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Fabric',         'Heavy-duty 1680D industrial fabric',                  0),
    ('Material',     'Stitching',      'Reinforced stitching on pockets and strap mounts',    1),
    ('Capacity',     'Tool pockets',   'Multiple reinforced tool pockets',                   10),
    ('Capacity',     'Retention',      'Adjustable straps secure tools against movement',    11),
    ('Capacity',     'Fits',           'Screwdrivers, pliers, cutters, testers, markers',    12),
    ('Carry',        'Leg strap',      'Adjustable leg strap for snug fit',                  20),
    ('Carry',        'Waist strap',    'Adjustable waist strap for stability at height',     21),
    ('Carry',        'Profile',        'Lightweight — sits closer to body than full belt',   22),
    ('Pricing',      'Single unit',    '£39.99',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          41),
    ('Dispatch',     'Worldwide',      'Flat £20 EMS Air Mail · 5–6 days transit',           42),
    ('Use',          'Built for',      'Electricians, maintenance techs, builders, scaffolders, industrial crews', 50),
    ('Use',          'Environments',   'Construction sites, industrial plants, electrical installations', 51),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'leg-tool-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
