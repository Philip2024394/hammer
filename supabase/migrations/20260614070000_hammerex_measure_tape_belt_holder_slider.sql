-- HAMMEREX Measure Tape Belt Holder Slider — universal click-on / clip-off
-- slider for standard tape measures. Belts up to 60mm. £12.99 GBP
-- (Rp 259,800 @ 20k/£). Primary category: carpentry. Cross-listed to EVERY
-- existing category at user request ("all categories"). Distinct product
-- from the leather "Measure Tape Belt Holder" (£9.80, soft-close) and the
-- "Slim Measure Tape Belt Holder" (£6.99) — this one is the universal
-- slider system.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Measure Tape Belt Holder Slider',
  'Universal slider tape belt holder — click-on / clip-off system, fits virtually all standard tape measures, belts up to 60mm. Heavy-duty, low profile.',
  259800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_53_26%20AM.png',
  true,
  'measure-tape-belt-holder-slider', 'HX-MTBS-001', 'Hammerex', 'HX-MTBS', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Measure Tape Belt Holder Slider\n\nKeep your tape measure secure, accessible, and ready for action with the **HAMMEREX Measure Tape Belt Holder Slider**. Designed for professional tradespeople, scaffolders, builders, carpenters, and contractors, this heavy-duty holder provides a fast and reliable way to carry your tape measure throughout the working day.\n\nThe universal slider design fits virtually all standard tape measures, allowing quick insertion and removal without slowing you down. Simply click your tape measure into place and clip it off when needed. No complicated straps, buckles, or retainers — just fast access when every second counts on site.\n\nDesigned to fit tool belts up to 6cm wide, the holder slides securely onto your belt while maintaining a comfortable, low-profile fit. Built for demanding construction environments, it keeps your tape measure within easy reach while reducing pocket clutter and improving productivity.\n\n### Features\n\n* Universal fit for most standard tape measures\n* Quick click-on, clip-off operation\n* Fits belts up to 6cm wide\n* Fast access for efficient working\n* Secure hold during daily site activities\n* Heavy-duty construction for professional use\n* Lightweight and comfortable design\n* Ideal for scaffolders, builders, carpenters, and tradespeople\n\n### Benefits\n\n* No more searching through pockets or tool bags\n* Keeps tape measures securely attached and within reach\n* Improves efficiency and workflow on site\n* Durable construction built for tough working environments\n* Simple, practical design that works all day\n\n### Applications\n\n* Scaffolding · Construction · Carpentry · Roofing\n* General Building · Maintenance Work · Industrial Sites\n\n**HAMMEREX – Built For Professionals.**',
  '[
    {"icon":"check","label":"Universal fit for most standard tape measures"},
    {"icon":"check","label":"Quick click-on / clip-off slider operation"},
    {"icon":"check","label":"Fits belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Fast access for efficient working"},
    {"icon":"check","label":"Secure hold during daily site activities"},
    {"icon":"check","label":"Heavy-duty construction for professional use"},
    {"icon":"check","label":"Lightweight and comfortable low-profile design"},
    {"icon":"check","label":"Ideal for scaffolders, builders, carpenters and tradespeople"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Universal fit — works with virtually all standard tape measures.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TAPE BELT SLIDER — CLICK-ON / CLIP-OFF', 41
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'measure-tape-belt-holder-slider');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_53_26%20AM.png',
  'Hammerex Measure Tape Belt Holder Slider — universal click-on / clip-off slider',
  0
from public.hammerex_products p
where p.slug = 'measure-tape-belt-holder-slider'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'measure-tape-belt-holder-slider'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Measure Tape Belt Holder Slider', 1, 0)
  ) as v(l, q, s)
where p.slug = 'measure-tape-belt-holder-slider'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Brand',        'Product type',   'Measure Tape Belt Holder Slider',                       1),
    ('Material',     'Construction',   'Heavy-duty, professional-grade build',                 10),
    ('Design',       'Operation',      'Click-on / clip-off slider system',                    20),
    ('Design',       'Profile',        'Low-profile, lightweight',                             21),
    ('Capacity',     'Tape fit',       'Universal — fits virtually all standard tape measures', 30),
    ('Fit',          'Belt width',     'Fits belts up to 60mm (6cm) wide',                     40),
    ('Pricing',      'Single unit',    '£12.99',                                               50),
    ('Stock',        'Availability',   'In stock',                                             60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            62),
    ('Use',          'Application',    'Scaffolding, construction, carpentry, roofing, building, maintenance, industrial', 70),
    ('Build & care', 'Made in',        'United Kingdom',                                        80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        81)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-belt-holder-slider'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
