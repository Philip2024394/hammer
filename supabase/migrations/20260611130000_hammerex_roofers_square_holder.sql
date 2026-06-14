-- Hammerex 7" Roofer's Square Belt Holder — £17.99 (359,800 IDR @ 20,000/£).
-- Primary: carpentry. Cross-listed: joinery (new category).

-- 1. New trade category for joinery.
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('joinery', 'Joinery', null, 317)
on conflict (slug) do nothing;

-- 2. Product.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex 7" Roofer''s Square Belt Holder',
  'Heavy-duty belt holder for 7" speed squares with integrated tape clip and twin pocket for pencils, markers and small hand tools.',
  359800,
  'https://ik.imagekit.io/pinky/Untitleddsadasd.png',
  true,
  'roofers-square-belt-holder', 'HX-RSBH-001', 'Hammerex', 'HX-RSBH', '14:00',
  1, 'United Kingdom',
  E'Built for tradespeople who need fast access to their most-used tools, the Hammerex 7" Roofer''s Square Belt Holder keeps everything within easy reach while working on site.\n\nDesigned to securely hold most 7" speed squares, this heavy-duty holder features an integrated steel tape measure clip and a twin side pocket that can be used for carpenter pencils, markers, utility knives, nail punches, or other essential hand tools.\n\nThe compact design keeps your tools organised and easily accessible without adding unnecessary bulk to your tool belt. Whether you''re roofing, framing, carpentry, construction, or general site work, the Hammerex holder helps improve efficiency by keeping your square, tape measure, and marking tools exactly where you need them.\n\nManufactured from premium heavy-duty materials and reinforced with steel rivets, this holder is built to withstand daily use on demanding job sites.',
  '[
    {"icon":"check","label":"Fits most 7\" roofing and speed squares"},
    {"icon":"check","label":"Integrated heavy-duty tape measure clip"},
    {"icon":"check","label":"Twin side pocket for pencils, markers, nail punches, or utility knives"},
    {"icon":"check","label":"Fast and easy access to essential tools"},
    {"icon":"check","label":"Heavy-duty reinforced construction"},
    {"icon":"check","label":"Strong steel rivet reinforcement"},
    {"icon":"check","label":"Compact low-profile design"},
    {"icon":"check","label":"Suitable for roofers, carpenters, framers, builders and general tradespeople"},
    {"icon":"check","label":"Fits most standard work belts"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request.",
    "Custom configurations available for trade and bulk orders."
  ]'::jsonb,
  null, 'ROOFER''S SQUARE BELT HOLDER', 11
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'roofers-square-belt-holder');

-- 3. Hero image (gallery image 0).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitleddsadasd.png',
  'Hammerex 7" Roofer''s Square Belt Holder with tape clip and twin tool pocket',
  0
from public.hammerex_products p
where p.slug = 'roofers-square-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 4. Cross-list across carpentry and joinery.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('carpentry', 0),
    ('joinery',   1)
  ) as v(cat_slug, s)
where p.slug = 'roofers-square-belt-holder'
and c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;

-- 5. What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, 1, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex 7" Roofer''s Square Belt Holder', 0),
    ('Integrated tape measure clip',             1),
    ('Twin tool pocket',                         2)
  ) as v(l, s)
where p.slug = 'roofers-square-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 6. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Fits',           '7" roofing and speed squares (most standard sizes)', 0),
    ('Capacity',     'Tape clip',      'Heavy-duty integrated steel clip',                    1),
    ('Capacity',     'Twin pocket',    'Pencils, markers, nail punches, utility knives',     2),
    ('Material',     'Body',           'Premium heavy-duty construction',                    10),
    ('Material',     'Reinforcement',  'Steel rivets at stress points',                      11),
    ('Fit',          'Belt loop',      'Suits most standard work belts',                     20),
    ('Design',       'Profile',        'Compact, low-profile',                               30),
    ('Use',          'Built for',      'Roofers, carpenters, framers, builders, tradespeople', 40),
    ('Build & care', 'Made in',        'United Kingdom',                                     50),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     51)
  ) as v(g, l, val, s)
where p.slug = 'roofers-square-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
