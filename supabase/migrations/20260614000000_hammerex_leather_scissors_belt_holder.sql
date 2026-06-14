-- HAMMEREX Leather Scissors Belt Holder — premium leather scissors holster
-- for tailors, garment manufacturers, upholstery pros and textile workers.
-- Reinforced stitching, metal rivets, belt-loop carry. Four user-selectable
-- sizes (8" / 9" / 10" / 12") as per-size variants.
--
-- Pricing (GBP, 1 GBP = 20,000 IDR; linear ≈ £0.50/inch from user-confirmed
--  8" = £7.99 → 12" = £10.00):
--    8"  = £7.99 → 159,800 IDR (confirmed by user)
--    9"  = £8.49 → 169,800 IDR (extrapolated)
--   10"  = £8.99 → 179,800 IDR (extrapolated)
--   12"  = £10.00 → 200,000 IDR (confirmed by user)
--
-- Creates a NEW "tailoring" trade category. Not added to the home-page
-- CategoryGrid TRADE_SLUGS whitelist — the category is still reachable at
-- /c/tailoring and via the featured product card.

-- 1. New trade category for tailoring (sits after construction trades).
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('tailoring', 'Tailoring',
   'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
   320)
on conflict (slug) do nothing;

-- 2. Parent product. Default price = 8" (cheapest) so the parent and the
--    default variant agree.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Leather Scissors Belt Holder',
  'Premium leather scissors belt holder — reinforced stitching, metal rivets, belt-loop carry. Built for tailors, garment makers, upholstery pros and textile workers. Choose 8" / 9" / 10" / 12".',
  159800,
  'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
  true,
  'leather-scissors-belt-holder', 'HX-LSBH-001', 'Hammerex', 'HX-LSBH', '14:00',
  1, 'United Kingdom',
  E'Keep your scissors secure, protected, and always within reach with our premium **Leather Scissors Belt Holders**. Crafted from high-quality genuine leather, these holders are designed for tailors, garment manufacturers, upholstery professionals, textile workers, and anyone who relies on scissors throughout the workday.\n\nBuilt for durability and everyday use, each holder features reinforced stitching and sturdy metal rivets for long-lasting performance in demanding workshop environments. The belt-loop design allows for quick access while keeping your hands free and your tools safely stored.\n\n### Available Sizes\n\n* 8" Scissors Holder\n* 9" Scissors Holder\n* 10" Scissors Holder\n* 12" Scissors Holder\n\n### Features\n\n* Premium genuine leather construction\n* Heavy-duty stitching and reinforced rivets\n* Comfortable belt-mounted design\n* Protects scissor blades from damage\n* Quick access during cutting and production work\n* Ideal for tailoring, textile, upholstery, and industrial applications\n\nWhether you''re working in a tailoring shop, fabric warehouse, garment factory, or workshop, these leather scissors holders provide a practical and professional solution for carrying your essential cutting tools.\n\n### Complete Your Toolkit\n\nLooking for the perfect scissors to pair with your holder? Explore our complete range of professional tailoring, fabric cutting, industrial, and heavy-duty scissors designed for precision, comfort, and durability.',
  '[
    {"icon":"check","label":"Premium genuine leather construction"},
    {"icon":"check","label":"Heavy-duty stitching and reinforced rivets"},
    {"icon":"check","label":"Comfortable belt-mounted design"},
    {"icon":"check","label":"Protects scissor blades from damage"},
    {"icon":"check","label":"Quick access during cutting and production work"},
    {"icon":"check","label":"Ideal for tailoring, textile, upholstery, and industrial applications"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your scissors size above — 8\" / 9\" / 10\" / 12\".",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'LEATHER SCISSORS HOLSTER — CHOOSE SIZE', 35
from public.hammerex_categories c
where c.slug = 'tailoring'
and not exists (select 1 from public.hammerex_products where slug = 'leather-scissors-belt-holder');

-- 3. Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
  'Hammerex Leather Scissors Belt Holder — premium leather, reinforced stitching, metal rivets',
  0
from public.hammerex_products p
where p.slug = 'leather-scissors-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 4. Cross-list to tailoring (primary). Trade-specific — no other category fits.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'leather-scissors-belt-holder' and c.slug = 'tailoring'
on conflict (product_id, category_id) do nothing;

-- 5. Four size variants. Confirmed prices: 8" = £7.99, 12" = £10.00. 9" + 10"
--    extrapolated linearly at ≈£0.50/inch.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('8" Scissors Holder',  'HX-LSBH-08', 159800,
       'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
       'HX-LSBH-08',  0, true,  60),
    ('9" Scissors Holder',  'HX-LSBH-09', 169800,
       'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
       'HX-LSBH-09',  1, false, 60),
    ('10" Scissors Holder', 'HX-LSBH-10', 179800,
       'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
       'HX-LSBH-10',  2, false, 60),
    ('12" Scissors Holder', 'HX-LSBH-12', 200000,
       'https://ik.imagekit.io/pinky/Untitledcxzxczxczcxasdasdas.png',
       'HX-LSBH-12',  3, false, 60)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'leather-scissors-belt-holder'
on conflict (product_id, label) do nothing;

-- 6. What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Leather Scissors Belt Holder (size as selected)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'leather-scissors-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 7. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                  0),
    ('Brand',        'Product type',   'Leather Scissors Belt Holder',                              1),
    ('Material',     'Body',           'Premium genuine leather',                                  10),
    ('Material',     'Stitching',      'Heavy-duty reinforced stitching',                          11),
    ('Material',     'Hardware',       'Sturdy metal rivets',                                      12),
    ('Capacity',     'Sizes',          '8" / 9" / 10" / 12" — pick above',                         20),
    ('Design',       'Carry',          'Belt-loop design for hands-free access',                   30),
    ('Use',          'Built for',      'Tailors, garment makers, upholstery, textile workers',     40),
    ('Use',          'Workplaces',     'Tailoring shops, fabric warehouses, garment factories',    41),
    ('Pricing',      '8"',             '£7.99',                                                    50),
    ('Pricing',      '9"',             '£8.49',                                                    51),
    ('Pricing',      '10"',            '£8.99',                                                    52),
    ('Pricing',      '12"',            '£10.00',                                                   53),
    ('Stock',        'Availability',   'In stock — all sizes',                                     60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                62),
    ('Build & care', 'Made in',        'United Kingdom',                                            70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                            71)
  ) as v(g, l, val, s)
where p.slug = 'leather-scissors-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
