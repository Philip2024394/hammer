-- HAMMEREX Brick & Block Layer's Trowel Belt Holder — universal trowel drop-in
-- with integrated front tape-measure deck, premium leather, reinforced core.
-- £16.40 GBP (Rp 328,000 @ 20k/£). Primary category: plastering (per user tag);
-- cross-listed to bricklaying (description content). Flag if either category
-- assignment should be tightened.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Brick & Block Layer''s Trowel Belt Holder',
  'Universal-fit trowel belt holder with integrated front tape-measure deck — premium leather, reinforced solid inner core, built for daily bricklaying and block-laying use.',
  328000,
  'https://ik.imagekit.io/pinky/Untitledsdfsdsssssss.png?updatedAt=1781307230587',
  true,
  'brick-block-trowel-belt-holder', 'HX-BBTBH-001', 'Hammerex', 'HX-BBTBH', '14:00',
  1, 'United Kingdom',
  E'**Drop the trowel. Grab the tape. Keep laying.**\n\nKeep your trowel secure, accessible, and ready for action with the HAMMEREX Brick & Block Layer''s Trowel Belt Holder. Designed specifically for bricklayers and block layers, this holder allows fast drop-in and lift-out access, helping you work more efficiently throughout the day.\n\nThe universal design accommodates virtually all brick and block laying trowel sizes, while the integrated front tape measure deck provides convenient storage for your tape measure, keeping your most-used tools within easy reach at all times.\n\nBuilt to reduce downtime spent searching for tools, the HAMMEREX Trowel Belt Holder helps improve productivity on site by ensuring your trowel is always exactly where you need it.\n\nCrafted from premium leather with a solid reinforced inner core, this holder is designed to maintain its shape and withstand the demands of daily trade use. The heavy-duty construction delivers long-lasting durability in even the toughest site conditions.\n\nBuilt for professional tradespeople, the HAMMEREX Brick & Block Layer''s Trowel Belt Holder delivers durability, convenience, and reliable tool access throughout the working day.',
  '[
    {"icon":"check","label":"Fits most bricklaying and block laying trowels"},
    {"icon":"check","label":"Fast drop-in, lift-out trowel access"},
    {"icon":"check","label":"Integrated front tape measure deck"},
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Reinforced solid inner core for strength and shape retention"},
    {"icon":"check","label":"Durable design for daily site use"},
    {"icon":"check","label":"Keeps essential tools organised and within reach"},
    {"icon":"check","label":"Suitable for professional bricklayers and block layers"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Pairs with any HAMMEREX leather tool belt.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'TROWEL + TAPE STATION', 20
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'brick-block-trowel-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledsdfsdsssssss.png?updatedAt=1781307230587',
  'Hammerex Brick & Block Layer''s Trowel Belt Holder — premium leather, trowel + tape station',
  0
from public.hammerex_products p
where p.slug = 'brick-block-trowel-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering (primary) + bricklaying (description match).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'brick-block-trowel-belt-holder'
  and c.slug in ('plastering', 'bricklaying')
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Brick & Block Layer''s Trowel Belt Holder', 1, 0),
    ('Reinforced solid inner core',                        1, 1),
    ('Integrated front tape-measure deck',                 1, 2),
    ('Universal belt loop',                                1, 3)
  ) as v(l, q, s)
where p.slug = 'brick-block-trowel-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                  0),
    ('Material',     'Core',           'Solid reinforced inner core — maintains shape',    1),
    ('Capacity',     'Trowel fit',     'Universal — fits virtually all brick & block trowels', 10),
    ('Capacity',     'Tape measure',   'Integrated front deck',                            11),
    ('Design',       'Access',         'Fast drop-in / lift-out',                          20),
    ('Pricing',      'Single unit',    '£16.40',                                           40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Bricklayers, block layers — daily site use',       60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'brick-block-trowel-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
