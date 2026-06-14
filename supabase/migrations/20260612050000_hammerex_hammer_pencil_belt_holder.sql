-- HAMMEREX Hammer & Pencil Belt Holder — premium leather, holds all hammers
-- + 4-pencil station. £14.99 (Rp 299,800 @ 20k/£) with bulk tiers
-- 2/10%, 3/15%, 4/20%. Primary category: carpentry. Cross-listed to EVERY
-- existing category at user request.

-- 1. Product row. Primary category = carpentry.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Hammerex Hammer & Pencil Belt Holder',
  'Premium leather hammer & pencil belt holder — fits all hammer sizes, integrated 4-pencil station, rivet-reinforced, universal belt loop.',
  299800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_18_20%20PM.png?updatedAt=1781266720484',
  true,
  'hammer-pencil-belt-holder', 'HX-HPBH-001', 'Hammerex', 'HX-HPBH', '14:00',
  1, 'United Kingdom',
  E'**HAMMEREX Hammer & Pencil Belt Holder**\n\nBuilt for tradesmen who demand durability, convenience, and reliability on site, the HAMMEREX Hammer & Pencil Belt Holder is crafted from premium leather and manufactured to withstand the toughest daily working conditions.\n\nDesigned for professional use, this heavy-duty holder securely stores hammers of all sizes and brands, accommodating a wide range of shaft and head dimensions. The integrated pencil station provides convenient storage for up to 4 pencils, markers, or small nail pouches, keeping essential items within easy reach throughout the workday.\n\nReinforced with durable rivet studs for added strength, the holder is built to handle demanding site environments while maintaining its shape and performance over time. The universal belt loop design fits virtually all belt sizes, making it a versatile addition to any tool setup.\n\nWhether you''re working on construction sites, scaffolding, carpentry, roofing, or general trade work, the HAMMEREX Hammer & Pencil Belt Holder keeps your essential tools secure, organised, and always within reach.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Heavy-duty rivet reinforcement for maximum durability"},
    {"icon":"check","label":"Holds all hammer shaft sizes and most hammer head designs"},
    {"icon":"check","label":"Pencil station stores up to 4 pencils, markers, or small nail pouches"},
    {"icon":"check","label":"Universal fit for all belt sizes"},
    {"icon":"check","label":"Designed for professional construction, carpentry, scaffolding, and trade work"},
    {"icon":"check","label":"Built to withstand harsh daily site conditions"},
    {"icon":"check","label":"Ready for immediate dispatch"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Buy 2 save 10% · Buy 3 save 15% · Buy 4 save 20% — applied automatically at the quantity step.",
    "Universal belt loop — fits virtually all belt sizes.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'HAMMER + 4-PENCIL STATION', 12,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15},
    {"min":4,"pct":20}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'hammer-pencil-belt-holder');

-- 2. Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_18_20%20PM.png?updatedAt=1781266720484',
  'Hammerex Hammer & Pencil Belt Holder — premium leather with 4-pencil station',
  0
from public.hammerex_products p
where p.slug = 'hammer-pencil-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 3. Cross-list to ALL existing categories.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'hammer-pencil-belt-holder'
on conflict (product_id, category_id) do nothing;

-- 4. What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Hammer & Pencil Belt Holder', 1, 0),
    ('Integrated 4-pencil station',          1, 1),
    ('Universal belt loop',                  1, 2)
  ) as v(l, q, s)
where p.slug = 'hammer-pencil-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 5. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                       0),
    ('Material',     'Reinforcement',  'Heavy-duty rivet studs',                                1),
    ('Capacity',     'Hammers',        'Fits all hammer shaft sizes and most head designs',     10),
    ('Capacity',     'Pencil station', 'Holds up to 4 pencils, markers or small nail pouches',  11),
    ('Fit',          'Belt loop',      'Universal — fits virtually all belt sizes',             20),
    ('Pricing',      'Single unit',    '£14.99',                                                30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15% · Buy 4 -20%',                  31),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',             40),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',             41),
    ('Use',          'Built for',      'Construction, carpentry, scaffolding, roofing, trades', 50),
    ('Build & care', 'Made in',        'United Kingdom',                                        60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        61)
  ) as v(g, l, val, s)
where p.slug = 'hammer-pencil-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
