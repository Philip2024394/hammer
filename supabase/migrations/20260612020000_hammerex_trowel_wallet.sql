-- HAMMEREX Trowel Wallet — premium leather, fits all trowels.
-- Base £9.99 (199,800 IDR @ 20,000/£). 7 specific sizes + 1 "Fit All Trowels"
-- variant, all at base price. 3 mixed-size bundles at £24 (480,000 IDR).
-- Primary category: plastering. Cross-listed to drywall + new venetian-plastering.

-- 1. Ensure the new "Venetian Plastering" category exists.
insert into public.hammerex_categories (slug, name, image_url, sort_order)
values ('venetian-plastering', 'Venetian Plastering', null, 25)
on conflict (slug) do nothing;

-- 2. Product row. Primary category = plastering.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Trowel Wallet',
  'Premium leather trowel wallet — soft-closing buttons, integrated hanging hook, fits all major trowel brands and sizes.',
  199800,
  'https://ik.imagekit.io/pinky/Untitledasdasdasdaaaaaas.png',
  true,
  'trowel-wallet', 'HX-TWL-001', 'Hammerex', 'HX-TWL', '14:00',
  1, 'United Kingdom',
  E'**Protect Your Trowels. Organise Your Kit. Built for the Trade.**\n\nThe Hammerex Trowel Wallet is a premium storage solution designed to protect and carry plastering, rendering, and finishing trowels of all sizes. Crafted from durable leather and built to withstand demanding site conditions, this wallet keeps your valuable tools secure, protected, and ready for work.\n\nDesigned to accommodate all major trowel brands and sizes, the Hammerex Trowel Wallet features industrial-grade stitching combined with pressure-glued seams for maximum durability and long service life. Soft-closing button fasteners provide secure closure while allowing quick access when needed.\n\nEach wallet includes a convenient on-site hanging hook, making it easy to store, organise, and access your tools in workshops, vans, or on-site workstations.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Fits all trowel sizes and brands"},
    {"icon":"check","label":"Industrial-strength thread stitching"},
    {"icon":"check","label":"Pressure-glued reinforced seams"},
    {"icon":"check","label":"Soft-closing button fasteners"},
    {"icon":"check","label":"Integrated hanging hook for on-site storage"},
    {"icon":"check","label":"Protects trowel blades during transport and storage"},
    {"icon":"check","label":"Built for professional tradespeople"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick a single size or the universal Fit-All option above — or save with a 3-pack bundle.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request.",
    "Bulk and trade pricing available — speak to our team via the partners page."
  ]'::jsonb,
  null, 'TROWEL WALLET', 11
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'trowel-wallet');

-- 3. Hero image.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledasdasdasdaaaaaas.png',
  'Hammerex Trowel Wallet — premium leather with hanging hook',
  0
from public.hammerex_products p
where p.slug = 'trowel-wallet'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 4. Cross-list across plastering + drywall + venetian-plastering.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1), ('venetian-plastering', 2)) as v(slug, s)
where p.slug = 'trowel-wallet' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- 5. What's Included (per single wallet).
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Trowel Wallet (size as chosen)', 1, 0),
    ('Integrated hanging hook',                 1, 1),
    ('Soft-closing button fasteners',           1, 2)
  ) as v(l, q, s)
where p.slug = 'trowel-wallet'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 6. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',      'Body',            'Premium leather',                                      0),
    ('Material',      'Stitching',       'Industrial-strength thread, pressure-glued seams',     1),
    ('Closure',       'Type',            'Soft-closing button fasteners',                        10),
    ('Storage',       'Hanging hook',    'Integrated — workshop, van or on-site mounting',       20),
    ('Compatibility', 'Universal',       'Fits all major trowel brands and sizes',               30),
    ('Compatibility', 'Specific sizes',  '8" × 4", 11" × 5", 12" × 5", 13" × 5", 14" × 5", 16" × 5", 18" × 5"', 31),
    ('Pricing',       'Single wallet',   '£9.99 per wallet (any size)',                          40),
    ('Pricing',       '3-pack bundle',   '£24 — choose 14"+16"+18", 14"+16"+16", or 16"+18"+18"', 41),
    ('Use',           'Built for',       'Plasterers, renderers, finishers, Venetian plasterers, drywall trades', 50),
    ('Build & care',  'Made in',         'United Kingdom',                                       60),
    ('Build & care',  'Warranty',        '1 year (manufacturing defects)',                       61)
  ) as v(g, l, val, s)
where p.slug = 'trowel-wallet'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);

-- 7. Variants — 1 fit-all + 7 specific sizes (all £9.99 = 199,800 IDR) +
--    3 mixed-size bundles (£24 = 480,000 IDR each).
insert into public.hammerex_product_variants (
  product_id, label, sku, price_idr, image_url, model_number,
  stock_count, sort_order, is_default
)
select p.id, v.label, v.sku, v.price, null, v.model, null, v.so, v.def
from public.hammerex_products p,
  (values
    ('Fit All Trowels',                      'HX-TWL-FIT', 199800, 'HX-TWL-FIT', 0,  true),
    ('8" x 4"',                              'HX-TWL-08',  199800, 'HX-TWL-08',  10, false),
    ('11" x 5"',                             'HX-TWL-11',  199800, 'HX-TWL-11',  11, false),
    ('12" x 5"',                             'HX-TWL-12',  199800, 'HX-TWL-12',  12, false),
    ('13" x 5"',                             'HX-TWL-13',  199800, 'HX-TWL-13',  13, false),
    ('14" x 5"',                             'HX-TWL-14',  199800, 'HX-TWL-14',  14, false),
    ('16" x 5"',                             'HX-TWL-16',  199800, 'HX-TWL-16',  15, false),
    ('18" x 5"',                             'HX-TWL-18',  199800, 'HX-TWL-18',  16, false),
    ('Bundle — 14" + 16" + 18"',             'HX-TWL-B1',  480000, 'HX-TWL-B1',  30, false),
    ('Bundle — 14" + 16" + 16"',             'HX-TWL-B2',  480000, 'HX-TWL-B2',  31, false),
    ('Bundle — 16" + 18" + 18"',             'HX-TWL-B3',  480000, 'HX-TWL-B3',  32, false)
  ) as v(label, sku, price, model, so, def)
where p.slug = 'trowel-wallet'
on conflict (product_id, label) do nothing;
