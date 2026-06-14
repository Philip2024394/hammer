-- HAMMEREX Scaffolders Tilted Spanner Belt Holder — premium leather drop-
-- station holder with tilted entry for one-handed access. Reinforced solid
-- inner core, high-visibility yellow industrial stitching, universal belt
-- loop up to 60mm. £13.99 GBP (Rp 279,800 @ 20k/£). Primary category:
-- scaffolding.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Scaffolders Tilted Spanner Belt Holder',
  'Premium leather tilted spanner belt holder — reinforced solid inner core, drop-station entry for fast one-handed access, yellow industrial stitching, fits belts up to 60mm.',
  279800,
  'https://ik.imagekit.io/pinky/Untitledcxzxczxczcx.png',
  true,
  'scaffolders-tilted-spanner-belt-holder', 'HX-STSBH-001', 'Hammerex', 'HX-STSBH', '14:00',
  1, 'United Kingdom',
  E'Keep your essential tools secure, accessible, and ready for action with the **Hammerex Scaffolders Tilted Spanner Belt Holder**. Designed specifically for scaffolders and site professionals, this premium leather holder features a tilted entry design for rapid tool access and smooth one-handed operation.\n\nBuilt with a reinforced solid inner core, the holder maintains its shape under heavy daily use while providing exceptional durability on demanding job sites. The fast-release drop station design allows quick tool insertion and retrieval, helping you work efficiently at height or on the ground.\n\nCrafted from heavy-duty leather and finished with high-visibility yellow industrial stitching, this holder combines professional appearance with long-lasting performance. The universal belt loop design fits all work belts up to 6cm wide, providing a secure and stable fit throughout the working day.\n\n### Features\n\n* Premium heavy-duty leather construction\n* Reinforced solid inner core for maximum durability\n* Fast-release access for quick tool retrieval\n* Drop station design for easy tool placement\n* Industrial-strength yellow stitched seams\n* Fits scaffolders'' spanners and similar tools\n* Universal fit for belts up to 6cm wide\n* Maintains shape even under heavy use\n* Built for professional site environments\n\n### Built for Site Professionals\n\nWhether you''re erecting scaffolding, carrying out inspections, or working on demanding construction projects, the Hammerex Scaffolders Tilted Spanner Belt Holder keeps your spanner securely within reach while providing the speed and convenience required on modern job sites.\n\n**Strong. Reliable. Built to Last.**',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Reinforced solid inner core for maximum durability"},
    {"icon":"check","label":"Tilted entry for fast one-handed access"},
    {"icon":"check","label":"Drop-station design for easy tool placement"},
    {"icon":"check","label":"Industrial-strength yellow stitched seams"},
    {"icon":"check","label":"Fits scaffolders'' spanners and similar tools"},
    {"icon":"check","label":"Universal fit for belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Maintains shape even under heavy use"},
    {"icon":"check","label":"Built for professional site environments"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any HAMMEREX leather tool belt up to 60mm wide.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TILTED SPANNER DROP STATION', 32
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-tilted-spanner-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledcxzxczxczcx.png',
  'Hammerex Scaffolders Tilted Spanner Belt Holder — premium leather, yellow industrial stitching, drop-station tilted entry',
  0
from public.hammerex_products p
where p.slug = 'scaffolders-tilted-spanner-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to scaffolding only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'scaffolders-tilted-spanner-belt-holder' and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Scaffolders Tilted Spanner Belt Holder', 1, 0),
    ('Universal belt loop (up to 60mm)',                 1, 1)
  ) as v(l, q, s)
where p.slug = 'scaffolders-tilted-spanner-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Material',     'Body',           'Premium heavy-duty leather',                           10),
    ('Material',     'Stitching',      'High-visibility yellow industrial stitching',          11),
    ('Material',     'Inner core',     'Reinforced solid core — keeps shape under load',       12),
    ('Design',       'Entry',          'Tilted entry — fast one-handed access',                20),
    ('Design',       'Station',        'Drop-station for quick tool placement and retrieval',  21),
    ('Capacity',     'Fits',           'Scaffolders'' spanners and similar tools',             30),
    ('Fit',          'Belt width',     'Universal — fits belts up to 60mm (6cm) wide',         40),
    ('Pricing',      'Single unit',    '£13.99',                                               50),
    ('Stock',        'Availability',   'In stock',                                             60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            62),
    ('Use',          'Built for',      'Scaffolders, site professionals, inspections',         70),
    ('Build & care', 'Made in',        'United Kingdom',                                       80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                       81)
  ) as v(g, l, val, s)
where p.slug = 'scaffolders-tilted-spanner-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
