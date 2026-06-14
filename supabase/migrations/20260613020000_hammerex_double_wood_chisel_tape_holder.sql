-- HAMMEREX Double Wood Chisel & Tape Measure Belt Holder — twin chisel pockets
-- (up to 1½"), integrated tape measure deck, premium leather, belts up to 75mm.
-- £15.99 GBP (Rp 319,800 @ 20k/£). Primary category: carpentry.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Double Wood Chisel & Tape Measure Belt Holder',
  'Premium leather twin-chisel holder with integrated tape measure deck — fits chisels up to 1½", most tape measures, belts up to 75mm.',
  319800,
  'https://ik.imagekit.io/pinky/Untitleddsfsdfsdf.png?updatedAt=1781284950727',
  true,
  'double-wood-chisel-tape-holder', 'HX-DWCTH-001', 'Hammerex', 'HX-DWCTH', '14:00',
  1, 'United Kingdom',
  E'**Two chisels. One tape. All in reach.**\n\nKeep your essential woodworking tools organised and within easy reach with the HAMMEREX Double Wood Chisel & Tape Measure Belt Holder. Designed for carpenters, joiners, and woodworking professionals, this practical holder securely carries two wood chisels alongside a dedicated tape measure deck for maximum convenience on site.\n\nCrafted from premium leather and reinforced with heavy-duty stud placements, the holder is built to withstand the demands of daily workshop and construction use. The dual chisel pockets safely store and protect wood chisels up to 1½" wide, helping to prevent damage to cutting edges while keeping tools readily accessible.\n\nThe integrated tape measure deck is designed to accommodate most tape measure sizes and brands, providing a secure storage position and quick access whenever accurate measurements are required.\n\nWhether you''re fitting doors, framing, cabinet making, or carrying out detailed joinery work, the HAMMEREX Double Wood Chisel & Tape Measure Belt Holder keeps your most-used tools secure, protected, and ready for action throughout the working day.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Holds up to 2 wood chisels"},
    {"icon":"check","label":"Suitable for chisels up to 1½\" wide"},
    {"icon":"check","label":"Integrated tape measure deck"},
    {"icon":"check","label":"Fits most tape measure sizes and brands"},
    {"icon":"check","label":"Heavy-duty reinforced stud placements"},
    {"icon":"check","label":"Protects chisel cutting edges from damage"},
    {"icon":"check","label":"Quick and easy access to tools"},
    {"icon":"check","label":"Built for daily site and workshop use"},
    {"icon":"check","label":"Fits work belts up to 75mm wide"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Pairs with any HAMMEREX leather tool belt up to 75mm wide.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'TWIN CHISEL + TAPE STATION', 17
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'double-wood-chisel-tape-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitleddsfsdfsdf.png?updatedAt=1781284950727',
  'Hammerex Double Wood Chisel & Tape Measure Belt Holder — premium leather, twin chisel + tape deck',
  0
from public.hammerex_products p
where p.slug = 'double-wood-chisel-tape-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to carpentry only (trade-specific — chisels are a carpenter/joiner tool).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'double-wood-chisel-tape-holder' and c.slug = 'carpentry'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Double Wood Chisel & Tape Measure Belt Holder', 1, 0),
    ('Reinforced stud placements',                              1, 1),
    ('Universal belt loop (up to 75mm)',                        1, 2)
  ) as v(l, q, s)
where p.slug = 'double-wood-chisel-tape-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                  0),
    ('Material',     'Reinforcement',  'Heavy-duty stud placements',                       1),
    ('Capacity',     'Chisels',        'Holds up to 2 wood chisels, up to 1½" (38mm) wide', 10),
    ('Capacity',     'Tape measure',   'Integrated deck — fits most tape sizes and brands', 11),
    ('Design',       'Edge guard',     'Pockets protect cutting edges from damage',        20),
    ('Fit',          'Belt loop',      'Fits belts up to 75mm wide',                       30),
    ('Pricing',      'Single unit',    '£15.99',                                           40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Carpenters, joiners — door fitting, framing, cabinet making, joinery', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'double-wood-chisel-tape-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
