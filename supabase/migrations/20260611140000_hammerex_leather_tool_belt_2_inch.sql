-- Ensure thread_color_option_idr column exists (from earlier migration that
-- never made it to remote). Safe to re-run.
alter table public.hammerex_products
  add column if not exists thread_color_option_idr numeric null;

-- Hammerex 2" Heavy-Duty Leather Tool Belt — twin pin buckle.
-- Base price £8.99 (179,800 IDR). Thread colour upgrade £2.50 (50,000 IDR) for
-- Yellow / Red / Brown; Black stitching is the standard option, no extra charge.
-- Cross-listed across every existing hammerex_categories row.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, thread_color_option_idr
)
select c.id,
  'Hammerex 2" Heavy-Duty Leather Tool Belt',
  'Premium 2" heavy-duty leather work belt with twin pin steel buckle, multi-hole adjustment and optional custom thread colour.',
  179800,
  'https://ik.imagekit.io/pinky/Untitleddfsfsdfsdfsdf.png',
  true,
  'leather-tool-belt-2-inch', 'HX-LB2-001', 'Hammerex', 'HX-LB2', '14:00',
  1, 'United Kingdom',
  E'Built for demanding job sites, the Hammerex 2" Heavy-Duty Leather Tool Belt is designed to provide the strength, support and reliability tradespeople need every day.\n\nManufactured from premium heavy-duty leather, this belt is built to carry tool pouches, holders and accessories while maintaining comfort throughout the working day. The extra-wide 2-inch design helps distribute weight evenly around the waist, reducing pressure and providing a more secure fit when carrying loaded tool belts.\n\nFeaturing a strong twin pin buckle system, the belt delivers added security and stability compared to standard single-pin belts. Multiple adjustment holes allow for a comfortable fit across a wide range of waist sizes.\n\nTo make your belt your own, Hammerex offers custom thread colour options. Standard Black stitching is included; Yellow, Red and Brown threads are available as a £2.50 upgrade and can be matched to company branding, tool pouches or team colours.\n\nWhether you''re a roofer, carpenter, builder, electrician, plumber or general contractor, the Hammerex leather belt is built to handle the toughest site conditions.',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Strong twin pin steel buckle for added security"},
    {"icon":"check","label":"Extra-wide 2\" (50mm) belt for maximum support and comfort"},
    {"icon":"check","label":"Multiple adjustment holes for a precise fit"},
    {"icon":"check","label":"Supports heavy tool pouches and accessories"},
    {"icon":"check","label":"Durable reinforced construction for long service life"},
    {"icon":"check","label":"Standard Black stitching included — custom thread colours available"},
    {"icon":"check","label":"Custom thread colours: Yellow, Red, Brown (+£2.50)"},
    {"icon":"check","label":"Suitable for roofing, carpentry, construction, electrical, plumbing and general trade work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Orders dispatched within 3 working days.",
    "Pick a non-Black thread colour above to upgrade the stitching to match your branding.",
    "UK delivery available — international shipping quoted on request.",
    "Bulk and trade pricing available — speak to our team via the partners page."
  ]'::jsonb,
  null, 'HEAVY-DUTY LEATHER TOOL BELT 2"', 12,
  50000
from public.hammerex_categories c
where c.slug = 'tools'
and not exists (select 1 from public.hammerex_products where slug = 'leather-tool-belt-2-inch');

-- Hero image.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitleddfsfsdfsdfsdf.png',
  'Hammerex 2" Heavy-Duty Leather Tool Belt with twin pin buckle',
  0
from public.hammerex_products p
where p.slug = 'leather-tool-belt-2-inch'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to every category that exists.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 100
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'leather-tool-belt-2-inch'
on conflict (product_id, category_id) do nothing;

-- What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex 2" Heavy-Duty Leather Tool Belt', 0),
    ('Twin pin steel buckle',                    1)
  ) as v(l, s)
where p.slug = 'leather-tool-belt-2-inch'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Belt width',         '2" (50mm)',                                       0),
    ('Material',     'Body',               'Premium heavy-duty leather',                     10),
    ('Material',     'Buckle',             'Twin pin steel buckle',                          11),
    ('Fit',          'Adjustment',         'Multi-hole adjustment system',                   20),
    ('Fit',          'Sizes',              'Fits most standard waist sizes',                 21),
    ('Customisation','Standard stitching', 'Black (included at base price)',                 30),
    ('Customisation','Optional thread',    'Yellow, Red or Brown — +£2.50',                  31),
    ('Use',          'Built for',          'Roofers, carpenters, builders, electricians, plumbers, contractors', 40),
    ('Build & care', 'Made in',            'United Kingdom',                                 50),
    ('Build & care', 'Warranty',           '1 year (manufacturing defects)',                 51)
  ) as v(g, l, val, s)
where p.slug = 'leather-tool-belt-2-inch'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
