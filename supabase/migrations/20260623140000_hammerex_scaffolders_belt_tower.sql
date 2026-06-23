-- HX-TWR-001 — Scaffolders Belt TOWER
-- Sibling to HX-TRX-001 (Trox), HX-FX7-001 (ForgeX 7) and HX-SA7-001 (Apex 7).
-- Primary trade category: scaffolding. shipping_per_unit_idr=0 triggers the
-- free-UK / £10-other surcharge logic.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single = £49 = 1,168,000 IDR

insert into public.hammerex_products (
  category_id, name, description, overview,
  price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly,
  base_currency, dispatch_lead_days, delivery_quote_only,
  shipping_per_unit_idr,
  features, purchase_notes,
  subtitle, badge_label, home_sort_order,
  compare_with,
  thread_color_option_idr
)
select c.id,
  'Scaffolders Belt TOWER',
  $txt$Premium-grade 2" leather scaffolders belt with reinforced rivet supports — 6-station layout: two spanner positions (twin + single), level holder, 8 m tape holder, hammer loop, two lanyard sliders + calibrated key holder.$txt$,
  $body$The **HAMMEREX Tower Scaffolders Belt** is built for professionals who demand strength, precision, and reliability at height. Crafted from premium-grade leather and reinforced with heavy-duty rivet supports, this belt is designed to withstand the toughest site conditions while maintaining long-lasting performance.

Each HAMMEREX belt is dispatched in your selected size for a perfect, secure fit — no excess slack, no awkward overhang, just a clean, stable fit that works with your movement on the scaffold. Available in sizes **30" to 46"**, and built on a solid **2" wide belt base**, it delivers the structure and support needed for daily trade use.

Designed as a **6-station tool system**, the HAMMEREX layout ensures everything has its place. It features **two lanyard belt sliders** along with a **calibrated holder for keys or additional small tools**. **Industrial-grade metal reinforcement** strengthens the spanner holders, available in both **twin and single configurations** for maximum durability under load.

A dedicated **level holder** allows for simple drop-in storage, keeping your spirit level secure and instantly accessible. The **tape measure holder** is engineered to accommodate up to **8-metre tapes** with multiple fitting styles for versatility across different brands and models.

The **hammer holder** uses a secure loop design that locks the hammer into position during movement, keeping your setup tight, stable, and snag-free against the frame for a cleaner, safer work environment.

Built with industrial strength and designed for real site efficiency, the HAMMEREX Tower Scaffolders Belt stands as a true leader in scaffolding tool systems — and a first-choice essential for serious scaffolders who expect the best.$body$,
  1168000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdfsdfsdsdf.png',
  true,
  'scaffolders-belt-tower', 'HX-TWR-001', 'Hammerex', 'HX-TWR', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  'GBP', 3, false,
  0,
  '[
    {"icon":"check","label":"Premium-grade 2\" genuine leather construction"},
    {"icon":"check","label":"Heavy-duty rivet-reinforced supports"},
    {"icon":"check","label":"6-station tool system layout"},
    {"icon":"check","label":"Two lanyard belt sliders"},
    {"icon":"check","label":"Calibrated holder for keys / small tools"},
    {"icon":"check","label":"Industrial metal-reinforced spanner holders (twin + single)"},
    {"icon":"check","label":"Dedicated drop-in level holder"},
    {"icon":"check","label":"Tape measure holder — fits up to 8 m tapes"},
    {"icon":"check","label":"Secure-loop hammer holder, snag-free design"},
    {"icon":"check","label":"Sizes 30\" to 46\" — dispatched in your selected size"},
    {"icon":"check","label":"Custom thread colour available on request"}
  ]'::jsonb,
  '[
    "Tools shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Free UK delivery — £10 flat to all other countries."
  ]'::jsonb,
  'SCAFFOLDERS · TOWER 6-STATION LEATHER BELT', null, 36,
  ARRAY['scaffolders-belt-trox','scaffolders-apex-7-station-tool-belt'],
  71481
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-belt-tower');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdfsdfsdsdf.png',
  p.name || ' — 2" leather 6-station scaffolders belt with twin/single spanner, level, 8 m tape, hammer loop and lanyard stations',
  0
from public.hammerex_products p
where p.slug = 'scaffolders-belt-tower'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id and m.url = 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdfsdfsdsdf.png'
);

-- Cross-list to belts + new-products (mirrors TROX / ForgeX / Apex visibility surfaces).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('belts', 0),
    ('new-products', 1)
  ) as v(slug, s)
where p.slug = 'scaffolders-belt-tower' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('TOWER Scaffolders Belt', 1, 0)
  ) as v(l, q, s)
where p.slug = 'scaffolders-belt-tower'
and not exists (
  select 1 from public.hammerex_what_in_box w
  where w.product_id = p.id and w.label = v.l
);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',           'Hammerex',                                                                   0),
    ('Material',     'Belt',            '2" premium-grade genuine leather',                                          10),
    ('Material',     'Reinforcement',   'Heavy-duty rivet supports + industrial metal reinforcement at spanner holders', 11),
    ('Design',       'Layout',          '6-station tool system',                                                      20),
    ('Design',       'Lanyard sliders', 'Two lanyard belt sliders',                                                   21),
    ('Design',       'Small-tool holder','Calibrated holder for keys / small tools',                                  22),
    ('Design',       'Spanner holders', 'Twin + single configurations, metal-reinforced',                             23),
    ('Design',       'Level holder',    'Drop-in spirit-level holder',                                                24),
    ('Design',       'Tape holder',     'Fits tape measures up to 8 m, multi-fit',                                    25),
    ('Design',       'Hammer holder',   'Secure-loop, snag-free against the frame',                                   26),
    ('Fit',          'Sizes',           '30" to 46" — dispatched in selected size',                                  30),
    ('Fit',          'Belt width',      '2"',                                                                          31),
    ('Pricing',      'Single unit',     '£49',                                                                         40),
    ('Stock',        'Availability',    'In stock',                                                                    50),
    ('Dispatch',     'Lead time',       'Dispatched within 3 working days of order',                                   51),
    ('Dispatch',     'UK delivery',     'Free UK delivery',                                                            52),
    ('Dispatch',     'International',   '£10 flat to all other countries',                                             53),
    ('Use',          'Application',     'Scaffolding (erecting, dismantling, working at height); general site trades', 60),
    ('Build & care', 'Made in',         'Indonesia · Hammerex Official Distribution',                                  70),
    ('Build & care', 'Warranty',        '1 year (manufacturing defects)',                                              71)
  ) as v(g, l, val, s)
where p.slug = 'scaffolders-belt-tower'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
