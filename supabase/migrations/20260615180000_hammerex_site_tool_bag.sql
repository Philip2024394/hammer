-- HAMMEREX Professional Work Bag (site tool bag) — 1680D heavy-duty fabric,
-- 48 × 25 × 30 cm, adjustable shoulder strap + reinforced carry handles.
-- £58 GBP (Rp 1,160,000 @ 20k/£). Universal cross-trade product so primary
-- category = 'tools' and flagged is_universal. Cross-listed into bricklaying,
-- plastering, electrical, plumbing, carpentry, tool-bags-backpacks (tool type)
-- and new-products. Same bulk tier pattern as the other pro bags (2/-10%, 3/-15%).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers,
  is_universal
)
select c.id,
  'Professional Work Bag',
  'Heavy-duty 1680D site tool bag — 48 × 25 × 30 cm with reinforced base, adjustable shoulder strap and twin carry handles. Multi-pocket layout for hand tools, fixings, PPE and daily essentials. Built for builders, bricklayers, plasterers, electricians, plumbers and general trades.',
  1160000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledsdfasdfasdfasdfasdfasdfasdfsd.png',
  true,
  'site-tool-bag', 'HX-WBG-001', 'Hammerex', 'HX-WBG', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Built for demanding job sites and everyday trade use, the **HAMMEREX Professional Work Bag** delivers durability, storage, and comfort in one rugged package. Manufactured from heavy-duty **1680D fabric**, this tool bag is designed to withstand the harsh conditions of construction sites, workshops, and service vehicles while keeping your essential tools organised and protected.\n\nFeaturing multiple external and internal storage pockets, the bag provides quick access to hand tools, fixings, measuring equipment, PPE, and daily work essentials. The reinforced base offers added protection against wear and tear when placed on rough surfaces, helping extend the life of the bag.\n\nFor maximum carrying comfort, each bag is supplied with a **fully adjustable shoulder strap**, allowing hands-free transport between jobs. Strong carry handles provide an additional carrying option for heavier loads.\n\n### Key Features\n\n* Heavy-duty 1680D fabric construction\n* Supplied with adjustable shoulder strap\n* Multiple storage pockets for tool organisation\n* Reinforced hard-wearing base for added durability\n* Comfortable carry handles with reinforced stitching\n* Weather-resistant design suitable for site conditions\n* Ideal for builders, bricklayers, plasterers, electricians, plumbers, and general tradesmen\n\n### Dimensions\n\n* Length: 48 cm\n* Width: 25 cm\n* Height: 30 cm\n\nWhether you''re working on-site, travelling between jobs, or storing your tools in the van, the HAMMEREX Work Bag is built to keep your equipment protected, organised, and ready for work.\n\n**HAMMEREX – Built to Work. Made to Last.**',
  '[
    {"icon":"check","label":"Heavy-duty 1680D fabric construction"},
    {"icon":"check","label":"Adjustable shoulder strap included"},
    {"icon":"check","label":"Multiple storage pockets for tool organisation"},
    {"icon":"check","label":"Reinforced hard-wearing base"},
    {"icon":"check","label":"Reinforced-stitch carry handles"},
    {"icon":"check","label":"Weather-resistant site-ready design"},
    {"icon":"check","label":"48 × 25 × 30 cm — sized for full daily kit"},
    {"icon":"check","label":"Universal across building trades"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 worldwide shipping via EMS Air Mail (5–6 days transit)."
  ]'::jsonb,
  null, 'SITE TOOL BAG · 1680D', 35,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb,
  true
from public.hammerex_categories c
where c.slug = 'tools'
and not exists (select 1 from public.hammerex_products where slug = 'site-tool-bag');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledsdfasdfasdfasdfasdfasdfasdfsd.png',
  'Hammerex Professional Work Bag — 1680D heavy-duty site tool bag, 48 × 25 × 30 cm',
  0
from public.hammerex_products p
where p.slug = 'site-tool-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to every trade the listing names plus the tool-bags tool type and new-products feed.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('tools', 0),
    ('bricklaying', 1),
    ('plastering', 2),
    ('electrical', 3),
    ('plumbing', 4),
    ('carpentry', 5),
    ('tool-bags-backpacks', 6),
    ('new-products', 7)
  ) as v(slug, s)
where p.slug = 'site-tool-bag' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Professional Work Bag (1680D)', 1, 0),
    ('Adjustable shoulder strap', 1, 1)
  ) as v(l, q, s)
where p.slug = 'site-tool-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Length',         '48 cm',                                              0),
    ('Dimensions',   'Width',          '25 cm',                                              1),
    ('Dimensions',   'Height',         '30 cm',                                              2),
    ('Material',     'Fabric',         'Heavy-duty 1680D weatherproof fabric',              10),
    ('Material',     'Base',           'Reinforced hard-wearing base for site use',         11),
    ('Material',     'Stitching',      'Reinforced stitching on handles and strap mounts',  12),
    ('Design',       'Carry options',  'Adjustable shoulder strap + twin carry handles',    20),
    ('Design',       'Storage',        'Multiple external + internal pockets',              21),
    ('Pricing',      'Single unit',    '£58.00',                                            30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                           31),
    ('Stock',        'Availability',   'In stock',                                          40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',         41),
    ('Dispatch',     'Worldwide',      'Flat £20 EMS Air Mail · 5–6 days transit',          42),
    ('Use',          'Built for',      'Builders, bricklayers, plasterers, electricians, plumbers, general trades', 50),
    ('Use',          'Environments',   'Construction sites, workshops, service vehicles',   51),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',        60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                    61)
  ) as v(g, l, val, s)
where p.slug = 'site-tool-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
