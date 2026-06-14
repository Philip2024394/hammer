-- HAMMEREX Bucket Trowel — hardened thermoplastic scoop/transfer trowel with
-- angled ergonomic handle. 200mm × 200mm square profile. £7.99 GBP
-- (Rp 159,800 @ 20k/£). Primary category: plastering; cross-listed to
-- drywall.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Bucket Trowel',
  'Heavy-duty thermoplastic bucket trowel — 200×200mm square profile, angled ergonomic handle to keep hands clear of mortar. Lightweight, rust-proof, easy-clean.',
  159800,
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsd.png?updatedAt=1781342418537',
  true,
  'bucket-trowel', 'HX-BT-001', 'Hammerex', 'HX-BT', '14:00',
  1, 'United Kingdom',
  E'The **Hammerex Bucket Trowel** is designed for professional plasterers, bricklayers, and tradespeople who need a reliable tool for scooping and transferring mortar, plaster, render, and other construction materials directly from buckets and mixing tubs.\n\nManufactured from hardened thermoplastic material, this durable bucket trowel is **lightweight, rust-proof, and built to withstand demanding site conditions**. The specially angled handle keeps your hand elevated above the material while scooping, helping to reduce contact with mortar and improving comfort during extended use.\n\nThe compact square design makes it easy to reach into corners of buckets and containers, reducing waste and allowing for efficient material transfer.\n\n### Features\n\n* Heavy-duty hardened thermoplastic construction\n* Angled ergonomic handle design\n* Helps keep hands clear of mortar and plaster\n* Lightweight, durable, and easy to clean\n* Ideal for plaster, mortar, render, adhesives, and compounds\n* Compact square profile for efficient bucket access\n* Suitable for professional and DIY use\n\n### Approximate Size\n\n* 8" × 8" (200mm × 200mm)\n\n### Benefits\n\n* Comfortable handling during prolonged use\n* Reduces material waste in buckets and tubs\n* Non-corrosive construction\n* Easy-clean smooth surface\n* Built for daily site use\n\n**Hammerex – Professional Tools Built for Tradespeople.**',
  '[
    {"icon":"check","label":"Heavy-duty hardened thermoplastic construction"},
    {"icon":"check","label":"Angled ergonomic handle keeps hands clear of mortar"},
    {"icon":"check","label":"Lightweight, durable, and easy to clean"},
    {"icon":"check","label":"Ideal for plaster, mortar, render, adhesives and compounds"},
    {"icon":"check","label":"Compact 200×200mm square profile for efficient bucket access"},
    {"icon":"check","label":"Rust-proof, non-corrosive construction"},
    {"icon":"check","label":"Suitable for professional and DIY use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days of confirmed order.",
    "Securely packaged for safe transport.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'BUCKET TROWEL — 200×200MM', 33
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'bucket-trowel');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsd.png?updatedAt=1781342418537',
  'Hammerex Bucket Trowel — hardened thermoplastic, angled handle, 200×200mm square profile',
  0
from public.hammerex_products p
where p.slug = 'bucket-trowel'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering + drywall.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1)) as v(slug, s)
where p.slug = 'bucket-trowel' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Bucket Trowel (200×200mm)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'bucket-trowel'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                  0),
    ('Brand',        'Product type',   'Bucket Trowel',                                             1),
    ('Material',     'Construction',   'Hardened thermoplastic — lightweight, rust-proof',         10),
    ('Material',     'Surface',        'Smooth, easy-clean',                                       11),
    ('Design',       'Handle',         'Angled ergonomic handle — keeps hands clear of mortar',    20),
    ('Design',       'Profile',        'Compact square profile reaches bucket corners',            21),
    ('Dimensions',   'Approximate',    '8" × 8" (200mm × 200mm)',                                  30),
    ('Use',          'Materials',      'Plaster, mortar, render, adhesives, compounds',            40),
    ('Use',          'Built for',      'Professional plasterers, bricklayers, tradespeople, DIY',  41),
    ('Pricing',      'Single unit',    '£7.99',                                                    50),
    ('Stock',        'Availability',   'In stock',                                                 60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of confirmed order',      61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                62),
    ('Build & care', 'Made in',        'United Kingdom',                                            70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                            71)
  ) as v(g, l, val, s)
where p.slug = 'bucket-trowel'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
