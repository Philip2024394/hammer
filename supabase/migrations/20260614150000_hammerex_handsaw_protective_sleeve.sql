-- HAMMEREX Handsaw Protective Sleeve — premium leather sleeve protecting
-- saw teeth and blade edges with soft-close button strap. Eight selectable
-- handsaw lengths (14" → 28"). User confirmed largest (28" = £13.99); the
-- other prices are linear at £0.20/inch (same slope as the spatula wallet,
-- a similar leather sleeve product). Custom sizes available on request.
-- Primary category: carpentry. is_universal=true so the sleeve appears on
-- every trade category page without per-trade cross-list rows.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, is_universal
)
select c.id,
  'Hammerex Handsaw Protective Sleeve',
  'Premium leather handsaw sleeve — soft-close button strap, reinforced stitching. Protects teeth, blades, tool bags and vehicles. Choose 14" to 28" (custom sizes available).',
  223800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
  true,
  'handsaw-protective-sleeve', 'HX-HSS-001', 'Hammerex', 'HX-HSS', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX® Handsaw Protective Sleeves\n\nProtect your handsaw blade with the **HAMMEREX Handsaw Protective Sleeve**, designed to keep your saw safe during storage, transport, and daily jobsite use. Manufactured from premium heavy-duty leather with reinforced stitching, this protective sleeve helps prevent damage to saw teeth, blade edges, tool bags, vehicles, and surrounding equipment.\n\nWhether you''re a carpenter, joiner, builder, roofer, landscaper, or DIY enthusiast, the HAMMEREX Handsaw Sleeve provides a simple and effective way to extend the life of your saw while improving safety on site and in transit.\n\nThe secure leather retention strap with **soft-close button fastening** keeps the sleeve firmly attached to the saw, while the durable construction withstands demanding professional use.\n\n## FEATURES & BENEFITS\n\n* Premium heavy-duty leather construction\n* Protects saw teeth and blade edges from damage\n* Helps prevent accidental cuts and injuries\n* Protects tool bags, vans, and equipment from blade contact\n* Secure leather strap with soft-close button closure\n* Reinforced stitching for maximum durability\n* Lightweight and easy to fit\n* Ideal for storage, transport, and jobsite protection\n* Professional HAMMEREX black leather with yellow stitching\n* Built for professional trades and everyday use\n\n## SUITABLE FOR\n\n* Traditional Handsaws · Panel Saws · Carpentry Saws\n* Wood Cutting Saws · General Purpose Handsaws · Construction Handsaws · DIY & Professional Saws\n\n## AVAILABLE IN ALL SIZES\n\nDesigned to fit most common handsaw lengths, including:\n\n* 14" (350mm)\n* 16" (400mm)\n* 18" (450mm)\n* 20" (500mm)\n* 22" (550mm)\n* 24" (600mm)\n* 26" (650mm)\n* 28" (700mm)\n* **Custom Sizes Available** — request on the WhatsApp quote\n\n## SPECIFICATIONS\n\n* Brand: HAMMEREX®\n* Material: Premium Leather\n* Closure Type: Soft-Close Button Strap\n* Colour: Black with Yellow Stitching\n* Application: Handsaw Blade Protection & Storage\n* Suitable For: Professional Trades, Construction, Carpentry, Joinery & DIY Use\n\n**Protect Your Saw. Protect Your Tools. Work Smarter.**\n\nHAMMEREX – BUILT TO PROTECT. MADE TO LAST.',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Protects saw teeth and blade edges from damage"},
    {"icon":"check","label":"Prevents accidental cuts and equipment damage"},
    {"icon":"check","label":"Secure leather strap with soft-close button"},
    {"icon":"check","label":"Reinforced stitching for maximum durability"},
    {"icon":"check","label":"Ideal for storage, transport and jobsite protection"},
    {"icon":"check","label":"Fits traditional handsaws, panel saws, carpentry saws"},
    {"icon":"check","label":"Black leather with yellow stitching"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your saw length above — 14\" to 28\".",
    "Custom sizes available — request on the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'HANDSAW SLEEVE — CHOOSE LENGTH', 46, true
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'handsaw-protective-sleeve');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
  'Hammerex Handsaw Protective Sleeve — premium leather with soft-close button strap',
  0
from public.hammerex_products p
where p.slug = 'handsaw-protective-sleeve'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- No hammerex_product_trades rows needed — is_universal=true makes this
-- appear on every category page via the category loader logic.

-- Eight length variants. Linear pricing £0.20/inch from 28"=£13.99 anchor.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('14" (350mm)', 'HX-HSS-14', 223800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-14', 0, true,  40),
    ('16" (400mm)', 'HX-HSS-16', 231800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-16', 1, false, 40),
    ('18" (450mm)', 'HX-HSS-18', 239800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-18', 2, false, 40),
    ('20" (500mm)', 'HX-HSS-20', 247800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-20', 3, false, 40),
    ('22" (550mm)', 'HX-HSS-22', 255800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-22', 4, false, 40),
    ('24" (600mm)', 'HX-HSS-24', 263800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-24', 5, false, 40),
    ('26" (650mm)', 'HX-HSS-26', 271800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-26', 6, false, 35),
    ('28" (700mm)', 'HX-HSS-28', 279800,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_30_29%20PM.png',
       'HX-HSS-28', 7, false, 30)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'handsaw-protective-sleeve'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Handsaw Protective Sleeve (length as selected)', 1, 0),
    ('Soft-close button leather strap',                         1, 1)
  ) as v(l, q, s)
where p.slug = 'handsaw-protective-sleeve'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                       0),
    ('Brand',        'Product type',   'Handsaw Protective Sleeve',                                       1),
    ('Material',     'Body',           'Premium leather',                                                10),
    ('Material',     'Stitching',      'Reinforced — yellow contrast stitching',                         11),
    ('Material',     'Colour',         'Black leather with yellow stitching',                            12),
    ('Design',       'Closure',        'Soft-close button strap',                                        20),
    ('Design',       'Fit',            'Secure retention strap',                                         21),
    ('Capacity',     'Lengths',        '14" / 16" / 18" / 20" / 22" / 24" / 26" / 28" — pick above',     30),
    ('Capacity',     'Suitable for',   'Traditional, panel, carpentry, wood cutting and general handsaws', 31),
    ('Capacity',     'Custom',         'Custom sizes available — request on WhatsApp quote',             32),
    ('Pricing',      '14"',            '£11.19',                                                         40),
    ('Pricing',      '16"',            '£11.59',                                                         41),
    ('Pricing',      '18"',            '£11.99',                                                         42),
    ('Pricing',      '20"',            '£12.39',                                                         43),
    ('Pricing',      '22"',            '£12.79',                                                         44),
    ('Pricing',      '24"',            '£13.19',                                                         45),
    ('Pricing',      '26"',            '£13.59',                                                         46),
    ('Pricing',      '28"',            '£13.99',                                                         47),
    ('Stock',        'Availability',   'In stock — all sizes',                                           50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                      51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                      52),
    ('Use',          'Built for',      'Carpenters, joiners, builders, roofers, landscapers, DIY',       60),
    ('Build & care', 'Made in',        'United Kingdom',                                                  70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                  71)
  ) as v(g, l, val, s)
where p.slug = 'handsaw-protective-sleeve'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
