-- HAMMEREX Spatula Protective Wallet — premium leather blade-protection
-- sleeve for plastering/drywall/finishing knives. Soft-close buttons,
-- reinforced stitching, hanging ring. Nine user-selectable sizes (10" → 40")
-- with linear pricing at £0.20/inch between the user-confirmed endpoints
-- (£6.99 at 10" → £12.99 at 40"). Custom sizes available on request.
-- Primary category: plastering; cross-listed to drywall.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Spatula Protective Wallet',
  'Premium leather wallet for plastering and drywall blades — soft-close button fastening, reinforced stitching, hanging ring. Choose from 10" to 40" (custom sizes available).',
  139800,
  'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
  true,
  'spatula-protective-wallet', 'HX-SPW-001', 'Hammerex', 'HX-SPW', '14:00',
  1, 'United Kingdom',
  E'Protect your plastering and drywall knives with the **HAMMEREX Spatula Protective Wallet**. Designed for professional plasterers, drywall finishers, decorators, and builders, this premium leather storage sleeve keeps your blades protected, organised, and ready for work.\n\nManufactured from heavy-duty leather with reinforced stitching and **soft-close button fasteners**, the wallet helps prevent blade damage, edge wear, scratches, and accidental contact during transport and storage. Whether stored in a van, toolbox, tool bag, or on-site, your finishing knives remain protected and in professional condition.\n\nAvailable in multiple sizes to suit a wide range of plastering spatulas, skimming blades, drywall knives, and finishing tools, the HAMMEREX Protective Wallet is built to withstand daily jobsite use while extending the life of your valuable tools.\n\n## FEATURES & BENEFITS\n\n* Premium heavy-duty leather construction\n* Protects blade edges from damage and wear\n* Prevents scratches during storage and transport\n* Soft-close button fastening system\n* Reinforced stitching for maximum durability\n* Lightweight and easy to carry\n* Hanging ring for convenient storage\n* Helps maintain blade straightness and finish quality\n* Ideal for plastering, drywall finishing, skimming, taping, and decorating tools\n* Professional HAMMEREX black leather with yellow stitching\n\n## SUITABLE FOR\n\n* Plastering Spatulas · Drywall Knives · Finishing Blades · Skimming Blades\n* Jointing Knives · Taping Knives · Filling Knives · Decorating Spatulas\n\n## AVAILABLE SIZES\n\n* 10" (25cm)\n* 12" (30cm)\n* 14" (35cm)\n* 16" (40cm)\n* 18" (45cm)\n* 20" (50cm)\n* 24" (60cm)\n* 32" (80cm)\n* 40" (100cm)\n* **Custom Sizes Available** — request on the WhatsApp quote\n\n## SPECIFICATIONS\n\n* Brand: HAMMEREX®\n* Material: Premium Leather\n* Fastening: Soft-Close Buttons\n* Colour: Black with Yellow Stitching\n* Application: Blade Protection, Storage & Transportation\n* Suitable For: Plastering, Drywall, Decorating & Finishing Tools\n\n**HAMMEREX – PROTECT YOUR TOOLS. PERFORM BETTER.**',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Protects blade edges from damage and wear"},
    {"icon":"check","label":"Soft-close button fastening system"},
    {"icon":"check","label":"Reinforced stitching for maximum durability"},
    {"icon":"check","label":"Hanging ring for convenient storage"},
    {"icon":"check","label":"Maintains blade straightness and finish quality"},
    {"icon":"check","label":"Ideal for plastering, drywall, skimming, taping, decorating"},
    {"icon":"check","label":"Black leather with yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your blade length above — 10\" to 40\".",
    "Custom sizes available — request on the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SPATULA PROTECTIVE WALLET — CHOOSE LENGTH', 45
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'spatula-protective-wallet');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
  'Hammerex Spatula Protective Wallet — premium leather blade protection sleeve',
  0
from public.hammerex_products p
where p.slug = 'spatula-protective-wallet'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering + drywall.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1)) as v(slug, s)
where p.slug = 'spatula-protective-wallet' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- Nine size variants. Linear pricing £0.20/inch between confirmed endpoints.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('10" (25cm)',  'HX-SPW-10', 139800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-10', 0, true,  50),
    ('12" (30cm)',  'HX-SPW-12', 147800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-12', 1, false, 50),
    ('14" (35cm)',  'HX-SPW-14', 155800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-14', 2, false, 50),
    ('16" (40cm)',  'HX-SPW-16', 163800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-16', 3, false, 50),
    ('18" (45cm)',  'HX-SPW-18', 171800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-18', 4, false, 50),
    ('20" (50cm)',  'HX-SPW-20', 179800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-20', 5, false, 50),
    ('24" (60cm)',  'HX-SPW-24', 195800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-24', 6, false, 40),
    ('32" (80cm)',  'HX-SPW-32', 227800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-32', 7, false, 30),
    ('40" (100cm)', 'HX-SPW-40', 259800,
       'https://ik.imagekit.io/pinky/Untitleddasdasadsadasd.png',
       'HX-SPW-40', 8, false, 20)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'spatula-protective-wallet'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Spatula Protective Wallet (length as selected)', 1, 0),
    ('Soft-close button fastening', 1, 1),
    ('Hanging ring',                1, 2)
  ) as v(l, q, s)
where p.slug = 'spatula-protective-wallet'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                       0),
    ('Brand',        'Product type',   'Spatula Protective Wallet',                                       1),
    ('Material',     'Body',           'Premium leather',                                                10),
    ('Material',     'Stitching',      'Reinforced — yellow contrast stitching',                         11),
    ('Material',     'Colour',         'Black leather with yellow stitching',                            12),
    ('Design',       'Fastening',      'Soft-close button system',                                       20),
    ('Design',       'Storage',        'Hanging ring',                                                   21),
    ('Capacity',     'Lengths',        '10" / 12" / 14" / 16" / 18" / 20" / 24" / 32" / 40" — pick above', 30),
    ('Capacity',     'Suitable for',   'Plastering spatulas, drywall knives, finishing/skimming/jointing/taping/filling blades, decorating spatulas', 31),
    ('Capacity',     'Custom',         'Custom sizes available — request on WhatsApp quote',             32),
    ('Pricing',      '10"',            '£6.99',                                                          40),
    ('Pricing',      '12"',            '£7.39',                                                          41),
    ('Pricing',      '14"',            '£7.79',                                                          42),
    ('Pricing',      '16"',            '£8.19',                                                          43),
    ('Pricing',      '18"',            '£8.59',                                                          44),
    ('Pricing',      '20"',            '£8.99',                                                          45),
    ('Pricing',      '24"',            '£9.79',                                                          46),
    ('Pricing',      '32"',            '£11.39',                                                         47),
    ('Pricing',      '40"',            '£12.99',                                                         48),
    ('Stock',        'Availability',   'In stock — all sizes',                                           50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                      51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                      52),
    ('Use',          'Built for',      'Plasterers, drywall finishers, decorators, builders',            60),
    ('Build & care', 'Made in',        'United Kingdom',                                                  70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                  71)
  ) as v(g, l, val, s)
where p.slug = 'spatula-protective-wallet'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
