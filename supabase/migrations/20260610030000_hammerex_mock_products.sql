-- 3 mock products with full PDP data so each has a real product page.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  stock_count, compare_at_idr, qty_discount_tiers
)
select c.id, v.name, v.description, v.price_idr, v.image_url, v.is_featured,
       v.slug, v.sku, v.brand, v.model_number, v.weight_kg, v.dispatch_cutoff_local::time,
       v.warranty_years, v.country_of_assembly, v.overview, v.features::jsonb,
       v.stock_count, v.compare_at_idr, v.qty_discount_tiers::jsonb
from (values
  (
    'Impact Wrench 18V',
    '18V brushless impact wrench — 600Nm break-away.',
    2650000,
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80',
    true,
    'impact-wrench-18v', 'HX-IW18-001', 'Hammerex', 'HX-IW18', 1.9, '14:00', 2, 'Indonesia',
    'Pro-grade 18V brushless impact wrench. Three-speed control, all-metal hammer mechanism, tri-LED ring light. Built for heavy mechanical work.',
    '[
      {"icon":"bolt","label":"600 Nm break-away torque"},
      {"icon":"gauge","label":"3-speed selector, up to 2,500 IPM"},
      {"icon":"battery","label":"18V Li-ion platform compatible"},
      {"icon":"weight","label":"1.9 kg — balanced grip"},
      {"icon":"chuck","label":"1/2\" square anvil with detent ball"},
      {"icon":"lamp","label":"Tri-LED ring work light"}
    ]',
    12, 2950000, '[{"min":2,"pct":5}]',
    'tools'
  ),
  (
    'Steel Tool Box',
    'Cantilever steel tool box, 5 trays, lockable.',
    580000,
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80',
    true,
    'steel-tool-box', 'HX-TB5-001', 'Hammerex', 'HX-TB5', 4.8, '14:00', 1, 'Indonesia',
    'All-steel cantilever tool box with 5 trays. Double padlockable, powder-coated against rust. The job-site classic.',
    '[
      {"icon":"weight","label":"Heavy-gauge steel, 4.8 kg"},
      {"icon":"chuck","label":"5 cantilever trays, full extension"},
      {"icon":"bolt","label":"Twin padlock loops, lid keeper"},
      {"icon":"lamp","label":"Powder-coated rust resistance"}
    ]',
    28, null, '[]',
    'tools'
  ),
  (
    'Pro Safety Glasses',
    'Anti-fog, anti-scratch, UV400 polycarbonate.',
    145000,
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    true,
    'pro-safety-glasses', 'HX-SG5-001', 'Hammerex', 'HX-SG5', 0.08, '14:00', 1, 'Indonesia',
    'Pro safety glasses — anti-fog double-side coating, anti-scratch hard lens, UV400. Buy by the job-site, not by the pair.',
    '[
      {"icon":"gauge","label":"ANSI Z87.1 + EN166 certified"},
      {"icon":"lamp","label":"Anti-fog dual-side coating"},
      {"icon":"weight","label":"22 g — featherweight"},
      {"icon":"chuck","label":"Anti-scratch hard lens"}
    ]',
    75, null, '[{"min":3,"pct":10},{"min":5,"pct":15}]',
    'safety'
  )
) as v(
  name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  stock_count, compare_at_idr, qty_discount_tiers, cat_slug
)
left join public.hammerex_categories c on c.slug = v.cat_slug
where not exists (select 1 from public.hammerex_products p where p.slug = v.slug);

-- Gallery media (3 per product).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, v.alt, v.sort
from public.hammerex_products p,
  (values
    ('impact-wrench-18v', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80', 'Impact wrench — front', 0),
    ('impact-wrench-18v', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', 'Impact wrench — side', 1),
    ('impact-wrench-18v', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', 'Impact wrench in use', 2),

    ('steel-tool-box', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80', 'Steel tool box closed', 0),
    ('steel-tool-box', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', 'Steel tool box open', 1),
    ('steel-tool-box', 'https://images.unsplash.com/photo-1521989588531-cf2073a3a9f4?auto=format&fit=crop&w=1200&q=80', 'On the job', 2),

    ('pro-safety-glasses', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', 'Safety glasses front', 0),
    ('pro-safety-glasses', 'https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=1200&q=80', 'On the worker', 1),
    ('pro-safety-glasses', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80', 'Lens detail', 2)
  ) as v(slug, url, alt, sort)
where v.slug = p.slug
and not exists (
  select 1 from public.hammerex_product_media m where m.product_id = p.id and m.url = v.url
);

-- Specs.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    -- Impact Wrench
    ('impact-wrench-18v', 'Power',       'Voltage',          '18V',                       0),
    ('impact-wrench-18v', 'Power',       'Battery',          '4.0Ah Li-ion (sold separately)', 1),
    ('impact-wrench-18v', 'Performance', 'Max torque',       '600 Nm break-away',         10),
    ('impact-wrench-18v', 'Performance', 'No-load speed',    '0–2,400 RPM',               11),
    ('impact-wrench-18v', 'Performance', 'Impact rate',      '0–2,500 IPM',               12),
    ('impact-wrench-18v', 'Performance', 'Anvil',            '1/2" square, detent ball',  13),
    ('impact-wrench-18v', 'Physical',    'Weight (bare)',    '1.9 kg',                    20),
    ('impact-wrench-18v', 'Physical',    'Length',           '198 mm',                    21),
    ('impact-wrench-18v', 'Build & care','Warranty',         '2 years',                   30),

    -- Steel Tool Box
    ('steel-tool-box',    'Capacity',    'Tray count',       '5 cantilever trays',         0),
    ('steel-tool-box',    'Capacity',    'External size',    '460 × 220 × 240 mm',         1),
    ('steel-tool-box',    'Build',       'Material',         'Powder-coated steel',       10),
    ('steel-tool-box',    'Build',       'Weight (empty)',   '4.8 kg',                    11),
    ('steel-tool-box',    'Security',    'Padlock loops',    '2 (padlocks not included)', 20),
    ('steel-tool-box',    'Build & care','Warranty',         '1 year',                    30),

    -- Safety Glasses
    ('pro-safety-glasses','Compliance',  'Standards',        'ANSI Z87.1 + EN166',         0),
    ('pro-safety-glasses','Compliance',  'UV protection',    'UV400',                      1),
    ('pro-safety-glasses','Lens',        'Material',         'Polycarbonate',             10),
    ('pro-safety-glasses','Lens',        'Coatings',         'Anti-fog (both sides) + anti-scratch', 11),
    ('pro-safety-glasses','Physical',    'Weight',           '22 g',                      20),
    ('pro-safety-glasses','Build & care','Warranty',         '1 year',                    30)
  ) as v(slug, g, l, val, s)
where v.slug = p.slug
and not exists (
  select 1 from public.hammerex_product_specs ps where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);

-- What's in the box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('impact-wrench-18v', 'Impact wrench (bare tool)', 1, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&q=70', 0),
    ('impact-wrench-18v', 'Belt hook',                  1, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=70', 1),
    ('impact-wrench-18v', 'User manual',                1, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=70', 2),

    ('steel-tool-box', 'Steel tool box',             1, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=70', 0),
    ('steel-tool-box', 'Removable tray dividers',    4, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=70', 1),

    ('pro-safety-glasses', 'Safety glasses',          1, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=70', 0),
    ('pro-safety-glasses', 'Microfibre cleaning bag', 1, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=70', 1)
  ) as v(slug, l, q, u, s)
where v.slug = p.slug
and not exists (
  select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l
);

-- Cross-sell: Impact Wrench pairs well with the existing 50pc bit set + extra battery.
insert into public.hammerex_pair_with (product_id, accessory_product_id, reason, sort_order)
select iw.id, acc.id, v.reason, v.sort
from public.hammerex_products iw,
  (values
    ('extra-4ah-battery', 'Required — sold separately. Get a genuine 4Ah pack.', 0),
    ('50pc-bit-set',      'Extend the wrench beyond sockets for driver work.',   1)
  ) as v(acc_slug, reason, sort)
join public.hammerex_products acc on acc.slug = v.acc_slug
where iw.slug = 'impact-wrench-18v'
and not exists (
  select 1 from public.hammerex_pair_with pw where pw.product_id = iw.id and pw.accessory_product_id = acc.id
);
