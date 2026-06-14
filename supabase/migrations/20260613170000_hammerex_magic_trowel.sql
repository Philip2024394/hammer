-- HAMMEREX Magic Trowel — flexible rubber-blade skimming trowel for wall and
-- ceiling finishing. Two user-selectable sizes (15" / 20") implemented as
-- variants. Prices intentionally seeded as 0 (placeholder pending user
-- confirmation per size). Primary category: plastering; cross-listed to
-- drywall.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Magic Trowel',
  'Flexible rubber-blade skimming trowel — smooth, even wall and ceiling finishes for plaster, skim coat, texture and finishing compounds. Choose 15" or 20". Protective blade cover included.',
  0,
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasd.png',
  true,
  'magic-trowel', 'HX-MT-001', 'Hammerex', 'HX-MT', '14:00',
  1, 'United Kingdom',
  E'Achieve smooth, professional wall finishes with the **HAMMEREX Magic Trowel**. Designed for plasterers, decorators, and drywall professionals, this lightweight skimming trowel features a flexible rubber blade that helps spread and smooth plaster, skim coat, texture coatings, and finishing compounds with ease.\n\nThe straight-edge rubber blade delivers excellent control across large wall and ceiling areas, reducing drag marks while producing a consistent finish. Supplied with a **protective blade cover**, your trowel remains protected during transport, storage, and on-site use.\n\nAvailable in two practical sizes, the HAMMEREX Magic Trowel is ideal for both detailed work and larger surface applications.\n\n### Features\n\n* Flexible rubber skimming blade\n* Straight edge design for smooth, even finishes\n* Ergonomic comfort grip handle\n* Lightweight and easy to control\n* Protective blade cover included\n* Suitable for plaster, skim coat, texture coatings and finishing compounds\n* Ideal for walls, ceilings and drywall finishing\n* Professional trade quality construction\n\n### Available Sizes\n\n* 15" (38cm)\n* 20" (50cm)\n\n### Applications\n\n* Wall skimming\n* Plaster finishing\n* Drywall finishing\n* Texture coating application\n* Surface smoothing and levelling\n* Decorative finishing work\n\nBuilt for professionals and DIY users alike, the HAMMEREX Magic Trowel delivers smooth, consistent results while helping reduce finishing time on every project.\n\n**HAMMEREX – Built to Perform. Built to Last.**',
  '[
    {"icon":"check","label":"Flexible rubber skimming blade"},
    {"icon":"check","label":"Straight edge design for smooth, even finishes"},
    {"icon":"check","label":"Ergonomic comfort grip handle"},
    {"icon":"check","label":"Lightweight and easy to control"},
    {"icon":"check","label":"Protective blade cover included"},
    {"icon":"check","label":"Suitable for plaster, skim coat, texture coatings and finishing compounds"},
    {"icon":"check","label":"Ideal for walls, ceilings and drywall finishing"},
    {"icon":"check","label":"Professional trade quality construction"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your trowel size above — 15\" (38cm) or 20\" (50cm).",
    "Protective blade cover supplied with every trowel.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'MAGIC TROWEL — CHOOSE SIZE', 31
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'magic-trowel');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasd.png',
  'Hammerex Magic Trowel — flexible rubber blade with protective cover, two sizes',
  0
from public.hammerex_products p
where p.slug = 'magic-trowel'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering + drywall.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1)) as v(slug, s)
where p.slug = 'magic-trowel' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- Two size variants. Placeholder price 0 — user will confirm each.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('15" (38cm)', 'HX-MT-15', 0,
       'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasd.png',
       'HX-MT-15', 0, true,  60),
    ('20" (50cm)', 'HX-MT-20', 0,
       'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasd.png',
       'HX-MT-20', 1, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'magic-trowel'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('HAMMEREX Magic Trowel (size as selected)', 1, 0),
    ('Protective blade cover',                   1, 1)
  ) as v(l, q, s)
where p.slug = 'magic-trowel'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',         'Hammerex',                                                                0),
    ('Brand',        'Product type',  'Magic Trowel (skimming trowel)',                                          1),
    ('Material',     'Blade',         'Flexible rubber, straight edge',                                         10),
    ('Material',     'Handle',        'Ergonomic comfort grip',                                                 11),
    ('Capacity',     'Sizes',         '15" (38cm) and 20" (50cm) — pick above',                                 20),
    ('Use',          'Application',   'Plaster, skim coat, texture coatings, finishing compounds',              30),
    ('Use',          'Surfaces',      'Walls, ceilings, drywall finishing',                                     31),
    ('Use',          'Built for',     'Plasterers, decorators, drywall pros, DIY',                              32),
    ('Pricing',      'Per size',      'Price set per size at the size picker above',                            40),
    ('Stock',        'Availability',  'In stock — both sizes',                                                  50),
    ('Dispatch',     'Lead time',     'Dispatched within 3 working days of order',                              51),
    ('Dispatch',     'UK delivery',   'Typical UK delivery within 5 working days',                              52),
    ('Build & care', 'Made in',       'United Kingdom',                                                          60),
    ('Build & care', 'Warranty',      '1 year (manufacturing defects)',                                          61)
  ) as v(g, l, val, s)
where p.slug = 'magic-trowel'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
