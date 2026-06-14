-- HAMMEREX Magnetic Trowel Belt Holder — powerful magnet retention, push-down
-- release, fits all common builder's trowels.
-- £11.70 GBP (Rp 234,000 @ 20k/£). Primary category: bricklaying.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Magnetic Trowel Belt Holder',
  'Magnetic-retention trowel belt holder — strong magnet keeps the trowel in place, quick push-down release, fits all common builder''s trowel sizes.',
  234000,
  'https://ik.imagekit.io/pinky/Untitledewrwerwerwerwerdsds.png?updatedAt=1781307101587',
  true,
  'magnetic-trowel-belt-holder', 'HX-MTBH-001', 'Hammerex', 'HX-MTBH', '14:00',
  1, 'United Kingdom',
  E'**Magnet on. Push to release.**\n\nExperience a new way to carry your trowel with the HAMMEREX Magnetic Trowel Belt Holder. Designed for professional bricklayers, block layers, and builders, this innovative holder uses a powerful magnetic retention system to securely hold your trowel while keeping it instantly accessible throughout the working day.\n\nCompatible with all common builder''s trowel sizes, the heavy-duty magnet maintains a strong and reliable hold during movement, climbing, bending, and everyday site activities. When you''re ready to use your trowel, simply push downward to release it quickly and effortlessly.\n\nUnlike traditional holders, the magnetic system keeps continuous contact with your trowel until intentional downward pressure is applied, reducing the chance of accidental tool loss while improving speed and convenience on site.\n\nBuilt with premium materials and designed for daily trade use, the HAMMEREX Magnetic Trowel Belt Holder offers a practical solution for keeping your most important tool exactly where you need it.',
  '[
    {"icon":"check","label":"Powerful magnetic trowel retention system"},
    {"icon":"check","label":"Fits all common builder''s trowel sizes"},
    {"icon":"check","label":"Quick push-down release mechanism"},
    {"icon":"check","label":"Secure hold during movement and site work"},
    {"icon":"check","label":"Fast access to your trowel when needed"},
    {"icon":"check","label":"Reduces downtime searching for tools"},
    {"icon":"check","label":"Durable construction for daily professional use"},
    {"icon":"check","label":"Comfortable belt-mounted design"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Pairs with any HAMMEREX leather tool belt.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'MAGNETIC TROWEL STATION', 21
from public.hammerex_categories c
where c.slug = 'bricklaying'
and not exists (select 1 from public.hammerex_products where slug = 'magnetic-trowel-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledewrwerwerwerwerdsds.png?updatedAt=1781307101587',
  'Hammerex Magnetic Trowel Belt Holder — magnetic retention with push-down release',
  0
from public.hammerex_products p
where p.slug = 'magnetic-trowel-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to bricklaying only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'magnetic-trowel-belt-holder' and c.slug = 'bricklaying'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Magnetic Trowel Belt Holder', 1, 0),
    ('Heavy-duty retention magnet',          1, 1),
    ('Universal belt loop',                  1, 2)
  ) as v(l, q, s)
where p.slug = 'magnetic-trowel-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Design',       'Retention',      'Powerful magnetic — continuous contact with trowel', 0),
    ('Design',       'Release',        'Push-down — one-handed quick release',             1),
    ('Capacity',     'Trowel fit',     'Fits all common builder''s trowel sizes',          10),
    ('Material',     'Construction',   'Premium materials, heavy-duty magnet',             20),
    ('Pricing',      'Single unit',    '£11.70',                                           40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Bricklayers, block layers, builders — daily site use', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'magnetic-trowel-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
