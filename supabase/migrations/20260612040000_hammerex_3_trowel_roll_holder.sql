-- HAMMEREX 3 Trowel Roll Holder — compact 3-trowel roll, twin reinforced
-- eyelets, hangs on workshop board or site wall. £22.00 (Rp 440,000 @ 20k/£)
-- with bulk tiers 2/10%, 3/15%, 4/20%. Primary category: plastering;
-- cross-listed to drywall, venetian-plastering, trowel-holders.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  '3 Trowel Roll Holder',
  'Compact 3-trowel roll holder — protects trowel blades, two reinforced eyelets for wall or rack hanging, fits trowels up to 18" × 5".',
  440000,
  'https://ik.imagekit.io/pinky/nnnnnnnnnnnnnnnnn.png',
  true,
  '3-trowel-roll-holder', 'HX-3TRH-001', 'Hammerex', 'HX-3TRH', '14:00',
  1, 'United Kingdom',
  E'**Hammerex 3-Trowel Holder Roll**\n\nKeep your finishing tools protected, organised, and ready for work with the Hammerex 3-Trowel Holder Roll — our most compact trowel storage solution.\n\nDesigned to securely hold up to 3 trowels measuring up to 18" × 5", this durable roll protects blades from damage during transport and storage while keeping your tools neatly organised throughout the workday.\n\nIts compact design makes it easy to carry around the job site, load into your tool bag, or store away at the end of the day. For added convenience, the holder features two reinforced eyelets, allowing it to be hung on a site wall, workshop board, or storage area for quick access and tidy organisation.\n\nBuilt for professionals who value protection, organisation and portability.',
  '[
    {"icon":"check","label":"Holds up to 3 trowels up to 18\" × 5\""},
    {"icon":"check","label":"Compact and lightweight design"},
    {"icon":"check","label":"Protects trowel blades during transport and storage"},
    {"icon":"check","label":"Easy to carry on-site"},
    {"icon":"check","label":"Two reinforced eyelets for hanging on walls or storage racks"},
    {"icon":"check","label":"Keeps tools organised and readily accessible"},
    {"icon":"check","label":"Ideal for plasterers, renderers and finishing professionals"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Buy 2 save 10% · Buy 3 save 15% · Buy 4 save 20% — applied automatically at the quantity step.",
    "Dispatched within 3 working days of order.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, '3 TROWEL + 2 EYELETS', 10,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15},
    {"min":4,"pct":20}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = '3-trowel-roll-holder');

-- Hero media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/nnnnnnnnnnnnnnnnn.png',
  'Hammerex 3 Trowel Roll Holder — compact roll with reinforced eyelets',
  0
from public.hammerex_products p
where p.slug = '3-trowel-roll-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list across plastering + drywall + venetian-plastering + trowel-holders.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1), ('venetian-plastering', 2), ('trowel-holders', 3)) as v(slug, s)
where p.slug = '3-trowel-roll-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex 3-Trowel Roll Holder', 1, 0),
    ('Two reinforced hanging eyelets', 1, 1)
  ) as v(l, q, s)
where p.slug = '3-trowel-roll-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowels',         'Holds up to 3 trowels',                            0),
    ('Capacity',     'Max trowel size', 'Up to 18" × 5"',                                   1),
    ('Storage',      'Eyelets',         'Two reinforced eyelets for wall or rack hanging',  10),
    ('Storage',      'Portability',     'Rolls compact for tool-bag carry or site storage', 11),
    ('Material',     'Blade protection','Cushions and protects trowel blades in transport', 20),
    ('Pricing',      'Single unit',     '£22.00',                                           30),
    ('Pricing',      'Bulk discounts',  'Buy 2 -10% · Buy 3 -15% · Buy 4 -20%',             31),
    ('Dispatch',     'Lead time',       'Dispatched within 3 working days of order',        40),
    ('Dispatch',     'UK delivery',     'Typical UK delivery within 5 working days',        41),
    ('Use',          'Built for',       'Plasterers, renderers, finishing professionals',   50),
    ('Build & care', 'Made in',         'United Kingdom',                                   60),
    ('Build & care', 'Warranty',        '1 year (manufacturing defects)',                   61)
  ) as v(g, l, val, s)
where p.slug = '3-trowel-roll-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
