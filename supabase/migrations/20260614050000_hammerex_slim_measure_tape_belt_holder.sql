-- HAMMEREX Slim Measure Tape Belt Holder — slim, low-profile click-on /
-- click-off tape holder. Universal fit (all tape sizes, belts up to 60mm).
-- £6.99 GBP (Rp 139,800 @ 20k/£). Distinct from the earlier leather model
-- (slug `measure-tape-belt-holder`, £9.80, soft-close button, fits up to 8m)
-- — renamed to "Slim" to avoid customer-facing duplication of the
-- "Measure Tape Belt Holder" title. Primary category: carpentry.
-- Cross-listed to EVERY existing category at user request ("all category").

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Slim Measure Tape Belt Holder',
  'Slim, low-profile tape belt holder — fast click-on / click-off action, universal fit for all tape measure sizes and belts up to 60mm.',
  139800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_15_17%20AM.png',
  true,
  'slim-measure-tape-belt-holder', 'HX-SMTBH-001', 'Hammerex', 'HX-SMTBH', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Slim Measure Tape Belt Holder\n\nSlim, sleek, and built for everyday performance, the **HAMMEREX Slim Measure Tape Belt Holder** is the simple solution for keeping your tape measure secure and always within reach.\n\nDesigned with convenience in mind, this holder allows for a fast **click-on, click-off** action, giving you quick access to your tape measure without slowing down your workflow. Whether you''re on a construction site, in a workshop, or tackling projects around the job site, this holder keeps your essential measuring tool exactly where you need it.\n\nEngineered to fit **all tape measure sizes** and compatible with **all belts up to 6cm wide**, it offers universal functionality without unnecessary bulk. Its streamlined profile sits comfortably on your belt while maintaining a secure hold throughout the day.\n\nCrafted with the durability and attention to detail that define every HammerEX product, this holder combines practical design with professional-grade performance.\n\n### Features\n\n* Slim, sleek, low-profile design\n* Fast and convenient click-on, click-off operation\n* Fits all tape measure sizes\n* Compatible with belts up to 6cm wide\n* Secure hold with easy access\n* Lightweight and comfortable for daily wear\n* Built for professional tradespeople and DIY users alike\n\n### Why You''ll Love It\n\n* Simple and effective design\n* Quick access when you need it most\n* Comfortable for all-day use\n* Universal fit for belts and tape measures\n* Built tough for daily job-site demands\n\n**HAMMEREX – Simple. Effective. Built for the Trade.**',
  '[
    {"icon":"check","label":"Slim, sleek, low-profile design"},
    {"icon":"check","label":"Fast click-on / click-off operation"},
    {"icon":"check","label":"Fits all tape measure sizes"},
    {"icon":"check","label":"Compatible with belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Secure hold with easy access"},
    {"icon":"check","label":"Lightweight and comfortable for daily wear"},
    {"icon":"check","label":"Built for professional tradespeople and DIY users alike"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Universal fit — works with all tape measure sizes and belts up to 60mm.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SLIM TAPE HOLDER — CLICK-ON / CLICK-OFF', 39
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'slim-measure-tape-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2001_15_17%20AM.png',
  'Hammerex Slim Measure Tape Belt Holder — low-profile click-on / click-off design',
  0
from public.hammerex_products p
where p.slug = 'slim-measure-tape-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'slim-measure-tape-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Slim Measure Tape Belt Holder', 1, 0)
  ) as v(l, q, s)
where p.slug = 'slim-measure-tape-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                  0),
    ('Brand',        'Product type',   'Slim Measure Tape Belt Holder',                             1),
    ('Material',     'Construction',   'Heavy-duty, low-profile build',                            10),
    ('Design',       'Profile',        'Slim, sleek, streamlined',                                 20),
    ('Design',       'Attachment',     'Fast click-on / click-off action',                         21),
    ('Capacity',     'Tape fit',       'Fits all tape measure sizes',                              30),
    ('Fit',          'Belt width',     'Fits belts up to 60mm (6cm) wide',                         40),
    ('Pricing',      'Single unit',    '£6.99',                                                    50),
    ('Stock',        'Availability',   'In stock',                                                 60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                62),
    ('Use',          'Built for',      'Professional tradespeople and DIY users',                  70),
    ('Build & care', 'Made in',        'United Kingdom',                                            80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                            81)
  ) as v(g, l, val, s)
where p.slug = 'slim-measure-tape-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
