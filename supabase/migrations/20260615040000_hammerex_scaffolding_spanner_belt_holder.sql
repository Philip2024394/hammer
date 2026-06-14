-- HAMMEREX Scaffolding Spanner Belt Holder — premium leather belt holder
-- with retention strap and steel D-ring. £12.50 GBP (Rp 250,000 @ 20k/£).
-- Primary category: scaffolding (description says specifically "for
-- scaffolders"). Tool-type: belt-holders. No adjacent-trade over-listing.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Scaffolding Spanner Belt Holder',
  'Premium leather scaffolding spanner belt holder — reinforced stitching, snap-button retention strap, steel D-ring for lanyards. Built for scaffolders.',
  250000,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/77fef2cc7719c2d7.png',
  true,
  'scaffolding-spanner-belt-holder', 'HX-SSBH-001', 'Hammerex', 'HX-SSBH', '14:00',
  1, 'United Kingdom',
  E'Built for hardworking scaffolders, the **HAMMEREX Scaffolding Spanner Belt Holder** is designed to keep your essential spanner secure, accessible, and ready for action throughout the workday.\n\nCrafted from heavy-duty premium leather with reinforced stitching, this holder is engineered to withstand the toughest site conditions while maintaining comfort and reliability. The secure retention strap keeps your spanner firmly in place when climbing, moving, or working at height, while allowing for fast one-handed access when needed.\n\nThe universal design accommodates most scaffolding spanners and fits all standard work belts, making it an essential addition to any scaffolder''s tool setup. A durable steel D-ring provides an additional attachment point for lanyards, accessories, or tool tethering systems.\n\n### Features\n\n* Premium heavy-duty leather construction\n* Reinforced stitching for maximum durability\n* Secure retention strap with heavy-duty black snap button\n* Fits most scaffolding spanners\n* Universal belt fit for all standard work belts\n* Durable steel D-ring attachment point\n* Fast access and secure tool retention\n* Built for demanding construction and scaffolding environments\n\n### Benefits\n\n* Keeps your spanner secure while working at height\n* Reduces tool loss and improves site safety\n* Quick and easy one-handed tool access\n* Comfortable all-day wear\n* Professional-grade construction designed for daily use\n\n**HAMMEREX – Built Tough for the Trade.**',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Reinforced stitching for maximum durability"},
    {"icon":"check","label":"Snap-button retention strap"},
    {"icon":"check","label":"Steel D-ring for lanyards / tool tethering"},
    {"icon":"check","label":"Fits most scaffolding spanners"},
    {"icon":"check","label":"Universal fit for all standard work belts"},
    {"icon":"check","label":"Built for demanding scaffolding environments"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any HAMMEREX leather tool belt.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SCAFFOLDING SPANNER BELT HOLDER', 57
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolding-spanner-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/77fef2cc7719c2d7.png',
  'Hammerex Scaffolding Spanner Belt Holder — premium leather with snap-button strap and steel D-ring',
  0
from public.hammerex_products p
where p.slug = 'scaffolding-spanner-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Trade + tool-type cross-list — scaffolding only, plus belt-holders bucket.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p, public.hammerex_categories c,
  (values ('scaffolding', 0), ('belt-holders', 1)) as v(slug, s)
where p.slug = 'scaffolding-spanner-belt-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Scaffolding Spanner Belt Holder', 1, 0),
    ('Steel D-ring attachment point',            1, 1)
  ) as v(l, q, s)
where p.slug = 'scaffolding-spanner-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX',                                              0),
    ('Material',     'Body',           'Premium heavy-duty leather',                           10),
    ('Material',     'Stitching',      'Reinforced',                                           11),
    ('Material',     'Hardware',       'Steel D-ring · heavy-duty black snap button',          12),
    ('Capacity',     'Tool fit',       'Most scaffolding spanners',                            20),
    ('Design',       'Retention',      'Snap-button retention strap',                          30),
    ('Design',       'Attachment',     'D-ring for lanyards, accessories or tool tethering',   31),
    ('Fit',          'Belt',           'Universal — fits all standard work belts',             40),
    ('Pricing',      'Single unit',    '£12.50',                                               50),
    ('Stock',        'Availability',   'In stock',                                             60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            62),
    ('Use',          'Built for',      'Scaffolders, site professionals working at height',    70),
    ('Build & care', 'Made in',        'United Kingdom',                                       80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                       81)
  ) as v(g, l, val, s)
where p.slug = 'scaffolding-spanner-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
