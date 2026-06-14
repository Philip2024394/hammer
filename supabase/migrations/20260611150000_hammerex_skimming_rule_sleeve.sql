-- HAMMEREX Skimming Rule Sleeve — placeholder price £12.99 (259,800 IDR).
-- Primary: plastering. Cross-listed: drywall.
-- Update price_idr below when the real RRP is confirmed.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, sizes, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'HAMMEREX Skimming Rule Sleeve',
  'Heavy-duty 1680D ballistic fabric sleeve for plasterers and drywallers — protects skimming rules in transit, with reinforced carry handle and double snap closure.',
  259800,
  'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
  true,
  'skimming-rule-sleeve', 'HX-SRS-001', 'Hammerex', 'HX-SRS', '14:00',
  1, 'United Kingdom',
  E'Protect your skimming rules with confidence using the HAMMEREX Skimming Rule Sleeve. Designed specifically for plasterers, drywallers, and finishing professionals, this heavy-duty storage sleeve keeps your rules protected during transport, storage, and everyday site use.\n\nManufactured from tough 1680D ballistic fabric, the sleeve is built to withstand the demands of busy construction sites while helping prevent scratches, dents and damage to your valuable skimming rules. The slim-profile design makes carrying and storing your tools easy, while the reinforced centre handle provides excellent balance and comfort when moving between jobs.\n\nFeaturing secure double snap closures, your rule stays firmly in place whether it''s in the van, workshop, or on-site. The durable construction and professional finish make it the ideal solution for tradespeople who want to protect their equipment and extend its working life.\n\nAvailable in a full range of sizes to fit the most popular skimming rules on the market, including models from Refina, NELA, Marshalltown, DeWalt and other leading manufacturers.',
  '[
    {"icon":"check","label":"Heavy-duty 1680D ballistic fabric construction"},
    {"icon":"check","label":"Protects skimming rules from damage during transport and storage"},
    {"icon":"check","label":"Secure double snap closure system"},
    {"icon":"check","label":"Reinforced centre carry handle for balanced lifting"},
    {"icon":"check","label":"Slim and lightweight design"},
    {"icon":"check","label":"Available in multiple sizes to suit a wide range of rule lengths"},
    {"icon":"check","label":"Fits leading brands — Refina, NELA, Marshalltown, DeWalt"},
    {"icon":"check","label":"Professional-grade quality built for daily site use"}
  ]'::jsonb,
  'GBP', 3, true,
  '["600mm (24\")","900mm (36\")","1200mm (48\")","1500mm (60\")","1800mm (72\")","2400mm (96\")"]'::jsonb,
  '[
    "Pick your rule length above — sleeves are cut to fit popular skimming-rule sizes.",
    "Compatible with Refina, NELA, Marshalltown and DeWalt skimming rules.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'SKIMMING RULE SLEEVE', 13
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'skimming-rule-sleeve');

-- Hero image.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
  'HAMMEREX Skimming Rule Sleeve — ballistic fabric with reinforced carry handle',
  0
from public.hammerex_products p
where p.slug = 'skimming-rule-sleeve'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list across plastering and drywall.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('plastering', 0),
    ('drywall',    1)
  ) as v(cat_slug, s)
where p.slug = 'skimming-rule-sleeve'
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, null, v.s
from public.hammerex_products p,
  (values
    ('HAMMEREX Skimming Rule Sleeve', 0),
    ('Reinforced centre carry handle', 1),
    ('Double snap closure system',     2)
  ) as v(l, s)
where p.slug = 'skimming-rule-sleeve'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',         '1680D ballistic fabric',                                          0),
    ('Material',     'Construction', 'Heavy-duty reinforced stitching',                                 1),
    ('Closure',      'System',       'Double snap closures',                                            10),
    ('Carry',        'Handle',       'Reinforced centre carry handle',                                  20),
    ('Compatibility','Rule brands',  'Refina, NELA, Marshalltown, DeWalt and other leading manufacturers', 30),
    ('Compatibility','Rule lengths', '600 / 900 / 1200 / 1500 / 1800 / 2400 mm',                        31),
    ('Use',          'Built for',    'Plasterers, drywallers, finishing professionals',                 40),
    ('Build & care', 'Made in',      'United Kingdom',                                                  50),
    ('Build & care', 'Warranty',     '1 year (manufacturing defects)',                                  51)
  ) as v(g, l, val, s)
where p.slug = 'skimming-rule-sleeve'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
