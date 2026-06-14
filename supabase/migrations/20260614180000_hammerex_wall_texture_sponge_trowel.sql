-- HAMMEREX Wall Texture Sponge Trowel — large-format texturing trowel with
-- textured sponge-foam base for plaster, cement, skim coat, stucco, and
-- decorative paint applications. Approx 29cm × 10.5/12cm, yellow & red,
-- heavy-duty plastic handle. £6.99 GBP (Rp 139,800 @ 20k/£). Primary
-- category: plastering.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Wall Texture Sponge Trowel',
  'Large-format wall texturing trowel — textured sponge-foam base for plaster, cement, skim coat, stucco and decorative paints. Approx 29 × 10.5/12 cm, ergonomic handle.',
  139800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfsdasdasasdasd.png',
  true,
  'wall-texture-sponge-trowel', 'HX-WTST-001', 'Hammerex', 'HX-WTST', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX® Wall Texture Sponge Trowel\n\nCreate professional wall textures with ease using the **HAMMEREX Wall Texture Sponge Trowel**. Designed for plaster, cement, skim coat, stucco, and decorative paint applications, this large-format texturing trowel helps achieve consistent patterns and smooth finishing results while reducing effort and application time.\n\nThe textured foam base creates clean, uniform wall finishes, making it ideal for decorative wall effects, renovation projects, and professional construction work. Its ergonomic heavy-duty handle provides a comfortable grip for extended use, while the lightweight design minimises hand fatigue.\n\nWhether you''re a professional tradesperson or DIY enthusiast, the HAMMEREX Sponge Trowel delivers faster coverage, better texture consistency, and a more professional finish on every project.\n\n## FEATURES & BENEFITS\n\n* Creates clean and consistent wall texture patterns\n* Large surface area for faster application and improved coverage\n* Lightweight design for reduced fatigue during use\n* Strong ergonomic handle for superior comfort and control\n* Suitable for plaster, cement, skim coat, stucco, and decorative paints\n* Ideal for construction, renovation, and decorative finishing projects\n* Easy to clean and maintain\n* Durable materials built for long service life\n* Professional-quality finishing results\n\n## SPECIFICATIONS\n\n* Brand: HAMMEREX®\n* Product Type: Wall Texture Sponge Trowel\n* Size: Approx. 29 cm × 10.5 cm / 12 cm\n* Base Material: Textured Sponge Foam\n* Handle Material: Heavy-Duty Plastic\n* Colour: Yellow & Red\n* Application: Wall texturing and decorative pattern creation\n* Suitable For: Plaster, Cement, Skim Coat, Stucco, Decorative Paints, Wall Finishing\n\n**HAMMEREX – BUILD BETTER. FINISH BETTER.**',
  '[
    {"icon":"check","label":"Creates clean and consistent wall texture patterns"},
    {"icon":"check","label":"Large surface area for faster application"},
    {"icon":"check","label":"Lightweight design reduces hand fatigue"},
    {"icon":"check","label":"Strong ergonomic plastic handle"},
    {"icon":"check","label":"For plaster, cement, skim coat, stucco, decorative paints"},
    {"icon":"check","label":"Ideal for construction, renovation, decorative finishing"},
    {"icon":"check","label":"Easy to clean and maintain"},
    {"icon":"check","label":"Yellow & red HAMMEREX colour scheme"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'WALL TEXTURE SPONGE TROWEL', 49
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'wall-texture-sponge-trowel');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfsdasdasasdasd.png',
  'Hammerex Wall Texture Sponge Trowel — large-format textured foam base, yellow & red',
  0
from public.hammerex_products p
where p.slug = 'wall-texture-sponge-trowel'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'wall-texture-sponge-trowel' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Wall Texture Sponge Trowel', 1, 0)
  ) as v(l, q, s)
where p.slug = 'wall-texture-sponge-trowel'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                                      0),
    ('Brand',        'Product type',   'Wall Texture Sponge Trowel',                                                     1),
    ('Material',     'Base',           'Textured sponge foam',                                                          10),
    ('Material',     'Handle',         'Heavy-duty plastic — ergonomic',                                                11),
    ('Material',     'Colour',         'Yellow & red',                                                                  12),
    ('Dimensions',   'Size',           'Approx. 29 cm × 10.5 cm / 12 cm',                                               20),
    ('Use',          'Application',    'Wall texturing and decorative pattern creation',                                30),
    ('Use',          'Suitable for',   'Plaster, cement, skim coat, stucco, decorative paints, wall finishing',         31),
    ('Use',          'Built for',      'Professional tradespeople and DIY users',                                       32),
    ('Pricing',      'Single unit',    '£6.99',                                                                         40),
    ('Stock',        'Availability',   'In stock',                                                                      50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                                     51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                                     52),
    ('Build & care', 'Made in',        'United Kingdom',                                                                 60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                                 61)
  ) as v(g, l, val, s)
where p.slug = 'wall-texture-sponge-trowel'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
