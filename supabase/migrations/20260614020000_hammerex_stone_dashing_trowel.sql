-- HAMMEREX Stone Dashing Trowel — pebble-dash / roughcast / stone-render
-- application trowel for renderers, plasterers and masons. £8.50 GBP
-- (Rp 170,000 @ 20k/£). Primary category: plastering.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Stone Dashing Trowel',
  'Heavy-duty stone dashing trowel — built for pebble dashing, roughcasting and stone-render finishes. Balanced design for efficient loading and uniform application.',
  170000,
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsdhhjhjhjfsdfsdf.png',
  true,
  'stone-dashing-trowel', 'HX-SDT-001', 'Hammerex', 'HX-SDT', '14:00',
  1, 'United Kingdom',
  E'Built for professional renderers, plasterers, and masonry tradesmen, the **Hammerex Stone Dashing Trowel** is designed to deliver consistent results when applying pebble dash, roughcast, and stone-render finishes. Crafted for durability and comfort, this heavy-duty tool provides excellent control while handling demanding site conditions.\n\nManufactured from high-quality materials, the HammerEX Stone Dashing Trowel is engineered to withstand daily professional use while maintaining reliable performance. The balanced design allows for efficient loading and throwing of aggregate materials, helping users achieve a uniform finish with less effort.\n\n### Features\n\n* Heavy-duty construction for long service life\n* Ideal for pebble dashing, roughcasting, and stone render applications\n* Ergonomic handle for improved comfort and control\n* Balanced design for accurate material distribution\n* Built to withstand demanding professional site conditions\n* Suitable for both commercial and residential rendering projects\n\n### Benefits\n\n* Increases application efficiency\n* Provides better control during dashing work\n* Durable construction for everyday professional use\n* Comfortable grip reduces user fatigue\n* Trusted HammerEX quality built for tradespeople\n\n**HammerEX – Built Tough. Built for the Trade.**',
  '[
    {"icon":"check","label":"Heavy-duty construction for long service life"},
    {"icon":"check","label":"Ideal for pebble dashing, roughcasting and stone render"},
    {"icon":"check","label":"Ergonomic handle for improved comfort and control"},
    {"icon":"check","label":"Balanced design for accurate material distribution"},
    {"icon":"check","label":"Built to withstand demanding professional site conditions"},
    {"icon":"check","label":"Suitable for commercial and residential rendering projects"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'STONE DASHING TROWEL', 37
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'stone-dashing-trowel');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsdhhjhjhjfsdfsdf.png',
  'Hammerex Stone Dashing Trowel — heavy-duty pebble-dash / roughcast / stone-render trowel',
  0
from public.hammerex_products p
where p.slug = 'stone-dashing-trowel'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'stone-dashing-trowel' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Stone Dashing Trowel', 1, 0)
  ) as v(l, q, s)
where p.slug = 'stone-dashing-trowel'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                            0),
    ('Brand',        'Product type',   'Stone Dashing Trowel',                                                1),
    ('Material',     'Construction',   'Heavy-duty — built for daily professional use',                      10),
    ('Material',     'Handle',         'Ergonomic grip for comfort and control',                             11),
    ('Design',       'Balance',        'Balanced for efficient loading and accurate distribution',           20),
    ('Use',          'Application',    'Pebble dashing, roughcasting, stone render finishes',                30),
    ('Use',          'Built for',      'Renderers, plasterers, masonry tradesmen',                           31),
    ('Use',          'Projects',       'Commercial and residential rendering',                               32),
    ('Pricing',      'Single unit',    '£8.50',                                                              40),
    ('Stock',        'Availability',   'In stock',                                                           50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                          51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                          52),
    ('Build & care', 'Made in',        'United Kingdom',                                                      60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                      61)
  ) as v(g, l, val, s)
where p.slug = 'stone-dashing-trowel'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
