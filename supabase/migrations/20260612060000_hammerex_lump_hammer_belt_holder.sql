-- HAMMEREX Lump Hammer Belt Holder — premium leather, retaining strap,
-- fits 60mm belts, rivet-reinforced. £13.99 (Rp 279,800 @ 20k/£) with bulk
-- tiers 2/10%, 3/15%, 4/20%. Primary category: bricklaying. Cross-listed to
-- EVERY existing category at user request.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Hammerex Lump Hammer Belt Holder',
  'Premium leather lump hammer belt holder — secure retaining strap, rivet-reinforced, fits belts up to 60mm wide.',
  279800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_11_59%20PM.png?updatedAt=1781266339025',
  true,
  'lump-hammer-belt-holder', 'HX-LHBH-001', 'Hammerex', 'HX-LHBH', '14:00',
  1, 'United Kingdom',
  E'**HAMMEREX Lump Hammer Belt Holder**\n\nBuilt for professionals who need strength, durability, and quick access to their tools, the HAMMEREX Lump Hammer Belt Holder is crafted from premium leather and engineered to perform in demanding site conditions.\n\nDesigned with a secure retaining strap, this holder safely secures your lump hammer while allowing fast access when needed. The universal design accommodates all major lump hammer brands and models, making it an ideal solution for construction workers, scaffolders, groundworkers, and tradespeople.\n\nConstructed using heavy-duty leather and reinforced with strategically positioned rivets, the holder is built to withstand continuous daily use while maintaining its shape and structure over time. High-stress areas are strengthened with rivet support to improve durability and extend product life in demanding working environments.\n\nThe integrated belt loop fits belts up to 60mm (6cm) wide as standard, providing a secure and comfortable fit. For users requiring larger belt compatibility, oversized belt loop options are available upon request.\n\nThe HAMMEREX Lump Hammer Belt Holder delivers reliable tool retention, professional-grade durability, and all-day convenience for demanding job site conditions.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Secure retaining strap for safe hammer storage"},
    {"icon":"check","label":"Fits all major lump hammer brands and models"},
    {"icon":"check","label":"Reinforced rivet construction for added durability"},
    {"icon":"check","label":"Designed to maintain shape during continuous use"},
    {"icon":"check","label":"Heavy-duty construction for professional site work"},
    {"icon":"check","label":"Fits belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Larger belt loop sizes available on request"},
    {"icon":"check","label":"Suitable for construction, scaffolding, demolition, and general trade work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Buy 2 save 10% · Buy 3 save 15% · Buy 4 save 20% — applied automatically at the quantity step.",
    "Belt loop fits up to 60mm (6cm) belts — request larger sizes via the partners page.",
    "Orders dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'LUMP HAMMER + RETAINING STRAP', 13,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15},
    {"min":4,"pct":20}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'bricklaying'
and not exists (select 1 from public.hammerex_products where slug = 'lump-hammer-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2012,%202026,%2007_11_59%20PM.png?updatedAt=1781266339025',
  'Hammerex Lump Hammer Belt Holder — premium leather with retaining strap',
  0
from public.hammerex_products p
where p.slug = 'lump-hammer-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'lump-hammer-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Lump Hammer Belt Holder', 1, 0),
    ('Secure retaining strap',           1, 1),
    ('Universal belt loop (up to 60mm)', 1, 2)
  ) as v(l, q, s)
where p.slug = 'lump-hammer-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium heavy-duty leather',                            0),
    ('Material',     'Reinforcement',  'Strategically positioned rivet support',                1),
    ('Capacity',     'Hammer fit',     'Fits all major lump hammer brands and models',          10),
    ('Retention',    'Strap',          'Secure retaining strap, quick-release for fast access', 20),
    ('Fit',          'Belt loop',      'Fits belts up to 60mm (6cm) wide as standard',          30),
    ('Fit',          'Custom sizing',  'Larger belt loop sizes available on request',           31),
    ('Pricing',      'Single unit',    '£13.99',                                                40),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15% · Buy 4 -20%',                  41),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',             50),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',             51),
    ('Use',          'Built for',      'Construction, bricklaying, scaffolding, demolition, groundworks', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                        70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        71)
  ) as v(g, l, val, s)
where p.slug = 'lump-hammer-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
