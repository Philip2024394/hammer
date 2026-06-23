-- HX-TRX-001 — Scaffolders Belt TROX
-- Sibling to HX-FX7-001 (ForgeX 7 Station) and HX-SA7-001 (Apex 7). Primary
-- trade category: scaffolding. shipping_per_unit_idr=0 triggers the
-- free-UK / £10-other surcharge logic.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single   = £39             = 929,000 IDR
--   buy 2 -10% = 2*929000*0.90 = 1,672,200 IDR
--   buy 3 -15% = 3*929000*0.85 = 2,368,950 IDR (auto-discount, no banner)

insert into public.hammerex_products (
  category_id, name, description, overview,
  price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly,
  base_currency, dispatch_lead_days, delivery_quote_only,
  shipping_per_unit_idr,
  features, purchase_notes,
  subtitle, badge_label, home_sort_order,
  qty_discount_tiers, compare_with,
  thread_color_option_idr
)
select c.id,
  'Scaffolders Belt TROX',
  $txt$2" genuine-leather scaffolders belt with reinforced inner-lip core — lanyard slide w/ glove clip, 8 m tape holder, double/single/square level holder, two spanner positions, hammer loop, calibrator slot.$txt$,
  $body$The **TROX Scaffolders Belt** is engineered specifically for professional scaffolders who need maximum functionality, durability, and intelligent tool organisation on the job. Built with real job-site demands in mind, this belt gives you the space, strength, and modular layout required to carry essential tools without compromise.

Crafted with a **reinforced inner lip core design**, the TROX belt prevents hole pull-through and extends overall belt life, even under heavy daily use. The **2" genuine leather construction** provides a strong yet comfortable foundation that adapts to your working movements while maintaining structure and reliability.

The layout begins on the left side with a **lanyard slide fitted with an integrated glove clip** for quick access. Next, you'll find a **secure tape measure holder** designed to fit up to **8 metres**, ensuring your measuring tool is always within reach.

One of the standout features of the TROX belt is its dedicated **level holder**, compatible with **double bubble, single, and square levels** — keeping precision tools secure and accessible at all times. This section also includes **two front tool positions** designed to hold scaffolders' spanners of all types.

Continuing along the belt is a **standard single scaffolding tool holder**, followed by a **heavy-duty hammer loop** for reliable hammer storage. The system finishes with an **additional lanyard slider and calibrator space** for less frequently used tools, giving you a fully balanced setup from start to finish.

Every TROX Scaffolders Belt is made to fit you perfectly. Simply select your size to create a tailored fit that works with your body and your workflow.

Built for strength. Designed for organisation. Made for scaffolders who expect more from their gear.$body$,
  929000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxcxcxcxc.png',
  true,
  'scaffolders-belt-trox', 'HX-TRX-001', 'Hammerex', 'HX-TRX', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  'GBP', 3, false,
  0,
  '[
    {"icon":"check","label":"2\" genuine leather construction"},
    {"icon":"check","label":"Reinforced inner-lip core — prevents hole pull-through"},
    {"icon":"check","label":"Lanyard slide with integrated glove clip"},
    {"icon":"check","label":"Tape measure holder — fits up to 8 m tapes"},
    {"icon":"check","label":"Level holder — double bubble, single, and square levels"},
    {"icon":"check","label":"Two front spanner positions for scaffolders'' spanners"},
    {"icon":"check","label":"Standard single scaffolding tool holder"},
    {"icon":"check","label":"Heavy-duty hammer loop"},
    {"icon":"check","label":"Additional lanyard slider + calibrator space"},
    {"icon":"check","label":"Tailored fit — select your size at checkout"},
    {"icon":"check","label":"Custom thread colour available on request"}
  ]'::jsonb,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Free UK delivery — £10 flat to all other countries."
  ]'::jsonb,
  'SCAFFOLDERS · TROX LEATHER BELT', null, 35,
  '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb,
  ARRAY['scaffolders-apex-7-station-tool-belt','forgex-7-station-scaffolders-belt'],
  71481
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-belt-trox');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxcxcxcxc.png',
  p.name || ' — 2" leather scaffolders belt with tape, level, spanner, hammer and lanyard stations',
  0
from public.hammerex_products p
where p.slug = 'scaffolders-belt-trox'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id and m.url = 'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxcxcxcxc.png'
);

-- Cross-list to belts + new-products (mirrors HX-FX7-001 / HX-SA7-001 visibility surfaces).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('belts', 0),
    ('new-products', 1)
  ) as v(slug, s)
where p.slug = 'scaffolders-belt-trox' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('TROX Scaffolders Belt', 1, 0)
  ) as v(l, q, s)
where p.slug = 'scaffolders-belt-trox'
and not exists (
  select 1 from public.hammerex_what_in_box w
  where w.product_id = p.id and w.label = v.l
);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                                   0),
    ('Material',     'Belt',           '2" genuine leather with reinforced inner-lip core',                         10),
    ('Material',     'Hardware',       'Metal buckle, riveted load points',                                          11),
    ('Design',       'Lanyard slide',  'Integrated glove clip',                                                      20),
    ('Design',       'Tape holder',    'Fits tape measures up to 8 m',                                               21),
    ('Design',       'Level holder',   'Double bubble, single, and square levels',                                   22),
    ('Design',       'Spanner positions','Two front positions — all scaffolders'' spanner types',                   23),
    ('Design',       'Tool holder',    'Standard single scaffolding tool holder',                                    24),
    ('Design',       'Hammer loop',    'Heavy-duty hammer loop',                                                     25),
    ('Design',       'Calibrator',     'Additional lanyard slider + calibrator slot',                                26),
    ('Fit',          'Sizing',         'Tailored — select waist size at checkout',                                   30),
    ('Pricing',      'Single unit',    '£39',                                                                        40),
    ('Stock',        'Availability',   'In stock',                                                                   50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                                  51),
    ('Dispatch',     'UK delivery',    'Free UK delivery',                                                           52),
    ('Dispatch',     'International',  '£10 flat to all other countries',                                            53),
    ('Use',          'Application',    'Scaffolding (erecting, dismantling, inspection); general site trades',       60),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',                                 70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                             71)
  ) as v(g, l, val, s)
where p.slug = 'scaffolders-belt-trox'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
