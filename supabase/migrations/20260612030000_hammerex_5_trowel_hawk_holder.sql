-- HAMMEREX 5 Trowel & Hawk Holder — enrich the existing "5-trowel-carry-holder"
-- record with the full spec, plastering primary category, £27.99 (Rp 559,800)
-- pricing, bulk discount tiers (2/10%, 3/15%, 4/20%) and trade cross-listing.

-- 1. Move the product into the plastering primary category and update copy +
--    pricing + discount tiers. Existing row already has slug 5-trowel-carry-holder.
update public.hammerex_products
set
  category_id = (select id from public.hammerex_categories where slug = 'plastering'),
  name = '5 Trowel & Hawk Holder',
  subtitle = '5 TROWEL + 16" HAWK STORAGE',
  description = '5-trowel carrier with rear hawk storage — twin-layer leather, holds trowels up to 18" × 5" and hawks up to 16".',
  image_url = 'https://ik.imagekit.io/pinky/5%20Trowel%20Carry%20Holder%20with%20Hawk%20Storage.png',
  price_idr = 559800,
  base_currency = 'GBP',
  delivery_quote_only = true,
  dispatch_lead_days = 3,
  warranty_years = 1,
  country_of_assembly = 'United Kingdom',
  is_featured = true,
  home_sort_order = 9,
  overview = E'**5 Trowel Carry Holder with Hawk Storage**\nKeep your plastering and finishing tools organised, protected, and ready for work with the 5 Trowel Carry Holder with Rear Hawk Storage. Designed for professionals, this compact and lightweight holder securely stores up to 5 trowels while protecting blade edges from damage during transport and storage.\n\nThe rear-mounted hawk holder safely accommodates hawks up to 16 inches, making it a complete carrying solution for your essential plastering tools. Built from durable twin-layer materials, the holder offers excellent strength, long-lasting performance, and reliable protection on the job site.',
  features = '[
    {"icon":"check","label":"Holds up to 5 trowels securely"},
    {"icon":"check","label":"Protects trowel edges from damage and wear"},
    {"icon":"check","label":"Fits all trowel sizes up to 18\" × 5\""},
    {"icon":"check","label":"Rear storage compartment fits hawks up to 16\""},
    {"icon":"check","label":"Compact, lightweight and easy to carry"},
    {"icon":"check","label":"Heavy-duty twin-layer construction for added durability"},
    {"icon":"check","label":"Ideal for plasterers, renderers and drywall professionals"}
  ]'::jsonb,
  qty_discount_tiers = '[
    {"min":2,"pct":10},
    {"min":3,"pct":15},
    {"min":4,"pct":20}
  ]'::jsonb,
  purchase_notes = '[
    "Buy 2 save 10% · Buy 3 save 15% · Buy 4 save 20% — applied automatically at the quantity step.",
    "Belt not included — order separately if required.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb
where slug = '5-trowel-carry-holder';

-- 2. Hero image media row (ImageKit asset).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/5%20Trowel%20Carry%20Holder%20with%20Hawk%20Storage.png',
  'Hammerex 5 Trowel & Hawk Holder — twin-layer leather with rear hawk storage',
  0
from public.hammerex_products p
where p.slug = '5-trowel-carry-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 3. Cross-list to plastering + drywall + venetian-plastering (keeping
--    trowel-holders too).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1), ('venetian-plastering', 2), ('trowel-holders', 3)) as v(slug, s)
where p.slug = '5-trowel-carry-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- 3. What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('5 Trowel & Hawk Holder',           1, 0),
    ('Rear hawk storage compartment',    1, 1),
    ('Twin-layer leather construction',  1, 2)
  ) as v(l, q, s)
where p.slug = '5-trowel-carry-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 4. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowels',         'Holds up to 5 trowels securely',              0),
    ('Capacity',     'Hawk storage',    'Rear pocket fits hawks up to 16"',            1),
    ('Compatibility','Max trowel size', 'Up to 18" × 5"',                              10),
    ('Material',     'Construction',    'Heavy-duty twin-layer leather',               20),
    ('Material',     'Edge protection', 'Protects trowel blades during transport',     21),
    ('Pricing',      'Single unit',     '£27.99',                                      30),
    ('Pricing',      'Bulk discounts',  'Buy 2 -10% · Buy 3 -15% · Buy 4 -20%',        31),
    ('Use',          'Built for',       'Plasterers, renderers, drywall professionals',40),
    ('Build & care', 'Made in',         'United Kingdom',                              50),
    ('Build & care', 'Warranty',        '1 year (manufacturing defects)',              51)
  ) as v(g, l, val, s)
where p.slug = '5-trowel-carry-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
