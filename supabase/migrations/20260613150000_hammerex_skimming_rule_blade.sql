-- HAMMEREX Skimming Rule Blade — stainless steel finishing blade on a rigid
-- powder-coated orange aluminium body. Four user-selectable sizes (400 / 600
-- / 800 / 1000 mm) implemented as per-size variants in
-- hammerex_product_variants. Prices are intentionally seeded as 0 (placeholder
-- pending user confirmation per size). Primary category: plastering;
-- cross-listed to drywall.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Skimming Rule Blade',
  'Stainless steel skimming rule blade on a rigid aluminium body — flat, even finishing across walls and ceilings. Choose 400 / 600 / 800 / 1000 mm.',
  0,
  'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
  true,
  'skimming-rule-blade', 'HX-SRB-001', 'Hammerex', 'HX-SRB', '14:00',
  1, 'United Kingdom',
  E'The **Hammerex Skimming Rule Blade** is a professional finishing tool designed to deliver smooth, flat, and consistent results when applying plaster, joint compound, putty, and finishing coats. Manufactured from high-quality stainless steel and supported by a rigid aluminium body, this skimming blade helps achieve superior surface finishes while reducing application time and effort.\n\nIts lightweight yet durable construction provides excellent control across large wall and ceiling areas, making it ideal for plasterers, drywall installers, decorators, and professional tradespeople.\n\nWhether you''re skimming fresh plaster, flattening joint compound, or applying finishing coats, the Hammerex Skimming Rule Blade ensures clean, professional results every time.\n\n### Key Features\n\n* High-quality stainless steel blade for smooth finishing\n* Rigid aluminium body for strength and stability\n* Lightweight design reduces user fatigue\n* Ideal for plaster, putty, joint compound, and skim coat applications\n* Produces flat, even surfaces with minimal effort\n* Durable construction built for professional site use\n* Easy to clean and maintain\n\n### Available Sizes\n\n* 400mm (40cm)\n* 600mm (60cm)\n* 800mm (80cm)\n* 1000mm (100cm)\n\n### Perfect For\n\n* Professional Plasterers\n* Drywall Installers\n* Painters & Decorators\n* Renovation Contractors\n* General Construction Work\n\n### HAMMEREX – BUILT FOR THE TRADE\n\nDesigned to withstand demanding job site conditions while delivering exceptional finishing performance, the Hammerex Skimming Rule Blade is the reliable choice for tradespeople who expect professional results.',
  '[
    {"icon":"check","label":"High-quality stainless steel blade for smooth finishing"},
    {"icon":"check","label":"Rigid aluminium body for strength and stability"},
    {"icon":"check","label":"Lightweight design reduces user fatigue"},
    {"icon":"check","label":"Ideal for plaster, putty, joint compound, and skim coat applications"},
    {"icon":"check","label":"Produces flat, even surfaces with minimal effort"},
    {"icon":"check","label":"Durable construction built for professional site use"},
    {"icon":"check","label":"Easy to clean and maintain"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your blade size above — 400 / 600 / 800 / 1000 mm.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SKIMMING RULE BLADE — CHOOSE SIZE', 29
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'skimming-rule-blade');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
  'Hammerex Skimming Rule Blade — stainless steel blade on powder-coated orange aluminium body',
  0
from public.hammerex_products p
where p.slug = 'skimming-rule-blade'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering + drywall.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1)) as v(slug, s)
where p.slug = 'skimming-rule-blade' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- Four size variants. Placeholder price 0 — user will confirm each size price.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('400mm (40cm)',  'HX-SRB-400',  0,
       'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
       'HX-SRB-400',  0, true,  50),
    ('600mm (60cm)',  'HX-SRB-600',  0,
       'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
       'HX-SRB-600',  1, false, 50),
    ('800mm (80cm)',  'HX-SRB-800',  0,
       'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
       'HX-SRB-800',  2, false, 50),
    ('1000mm (100cm)','HX-SRB-1000', 0,
       'https://ik.imagekit.io/pinky/Untitledsdfsdfssddsdsddasdasdasdasdasda.png',
       'HX-SRB-1000', 3, false, 50)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'skimming-rule-blade'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Skimming Rule Blade (size as selected)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'skimming-rule-blade'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',         'Hammerex',                                                                0),
    ('Brand',        'Product type',  'Skimming Rule Blade',                                                     1),
    ('Material',     'Blade',         'Stainless steel',                                                        10),
    ('Material',     'Body',          'Aluminium alloy — rigid',                                                11),
    ('Material',     'Finish',        'Powder-coated orange frame',                                             12),
    ('Capacity',     'Sizes',         '400 / 600 / 800 / 1000 mm — pick above',                                 20),
    ('Use',          'Application',   'Plastering, skimming, drywall finishing, jointing, surface preparation', 30),
    ('Use',          'Perfect for',   'Plasterers, drywall installers, decorators, renovation contractors',     31),
    ('Pricing',      'Per size',      'Price set per size at the size picker above',                            40),
    ('Stock',        'Availability',  'In stock — all sizes',                                                   50),
    ('Dispatch',     'Lead time',     'Dispatched within 3 working days of order',                              51),
    ('Dispatch',     'UK delivery',   'Typical UK delivery within 5 working days',                              52),
    ('Build & care', 'Made in',       'United Kingdom',                                                          60),
    ('Build & care', 'Warranty',      '1 year (manufacturing defects)',                                          61)
  ) as v(g, l, val, s)
where p.slug = 'skimming-rule-blade'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
