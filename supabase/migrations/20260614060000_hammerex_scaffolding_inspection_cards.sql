-- HAMMEREX Scaffolding Inspection Cards & Holder System — durable
-- weather-resistant scaffold-tag holder with inspection cards. Four
-- selectable pack options (Single / 10 / 25 / 50) implemented as variants.
-- Prices intentionally seeded as 0 (placeholder pending user confirmation
-- per pack size). Primary category: scaffolding.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Scaffolding Inspection Cards & Holder System',
  'Weather-resistant scaffold inspection tag holder with cards — for compliant, visible inspection records on site. Choose Single Kit or Pack of 10 / 25 / 50.',
  0,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
  true,
  'scaffolding-inspection-card-system', 'HX-SIC-001', 'Hammerex', 'HX-SIC', '14:00',
  1, 'United Kingdom',
  E'**HAMMEREX Scaffolding Inspection Cards & Holder System**\n\nStay compliant, organised, and site-ready with the **HAMMEREX Scaffolding Inspection Card System**. Designed for professional scaffolders, site managers, and construction teams, this essential safety tagging system provides a clear and reliable method of recording scaffold inspections, status updates, and safety information directly on-site.\n\nManufactured from durable, weather-resistant materials, the holder securely protects inspection cards from dirt, moisture, and site damage while ensuring critical safety information remains visible at all times. Ideal for commercial construction projects, industrial sites, maintenance work, and scaffolding contractors.\n\n### Features\n\n* Heavy-duty scaffold inspection holder\n* Durable and weather-resistant construction\n* Clear and professional safety identification system\n* Quick card insertion and replacement\n* Suitable for internal and external site use\n* Helps maintain compliance with workplace safety requirements\n* Easy-to-read inspection and status records\n* Essential for scaffold safety management\n\n### Available Purchase Options\n\n**Single Holder Kit**\n\n* 1 × Scaffold Inspection Holder\n* Inspection Cards Included\n\n**Pack Options Available**\n\n* Pack of 10\n* Pack of 25\n* Pack of 50\n\nIdeal for contractors, scaffold companies, maintenance teams, and large construction projects requiring multiple inspection points.\n\n### Applications\n\n* Scaffolding Inspections\n* Construction Sites\n* Industrial Facilities\n* Maintenance Projects\n* Access Equipment Monitoring\n* Safety Compliance Management\n\n### Why Choose HAMMEREX?\n\nHAMMEREX products are built for demanding job sites where durability, reliability, and professional performance matter. Our Scaffolding Inspection Card System helps ensure inspection records remain visible, protected, and accessible, improving site safety and compliance throughout the project lifecycle.\n\n**HAMMEREX – Built For Professionals.**',
  '[
    {"icon":"check","label":"Heavy-duty scaffold inspection holder"},
    {"icon":"check","label":"Durable and weather-resistant construction"},
    {"icon":"check","label":"Clear and professional safety identification system"},
    {"icon":"check","label":"Quick card insertion and replacement"},
    {"icon":"check","label":"Suitable for internal and external site use"},
    {"icon":"check","label":"Helps maintain compliance with workplace safety requirements"},
    {"icon":"check","label":"Easy-to-read inspection and status records"},
    {"icon":"check","label":"Essential for scaffold safety management"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your pack size above — Single Kit / Pack of 10 / 25 / 50.",
    "Single Kit includes 1 holder + inspection cards.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'INSPECTION CARD SYSTEM — CHOOSE PACK', 40
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolding-inspection-card-system');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
  'Hammerex Scaffolding Inspection Cards & Holder System — weather-resistant scaffold tag',
  0
from public.hammerex_products p
where p.slug = 'scaffolding-inspection-card-system'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to scaffolding only.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'scaffolding-inspection-card-system' and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;

-- Four pack-size variants. Placeholder price 0 — user will confirm each pack.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Single Holder Kit', 'HX-SIC-1',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
       'HX-SIC-1',  0, true,  120),
    ('Pack of 10',        'HX-SIC-10', 0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
       'HX-SIC-10', 1, false,  80),
    ('Pack of 25',        'HX-SIC-25', 0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
       'HX-SIC-25', 2, false,  40),
    ('Pack of 50',        'HX-SIC-50', 0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2003_33_10%20AM.png',
       'HX-SIC-50', 3, false,  20)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'scaffolding-inspection-card-system'
on conflict (product_id, label) do nothing;

-- What's-in-box (single-kit baseline; pack sizes scale up).
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Scaffold Inspection Holder',         1, 0),
    ('Inspection Cards (per holder)',      1, 1),
    ('Pack quantity per selected option',  1, 2)
  ) as v(l, q, s)
where p.slug = 'scaffolding-inspection-card-system'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                          0),
    ('Brand',        'Product type',   'Scaffold Inspection Card & Holder System',                          1),
    ('Material',     'Construction',   'Heavy-duty, weather-resistant — internal and external site use',   10),
    ('Capacity',     'Pack options',   'Single Kit / Pack of 10 / 25 / 50 — pick above',                   20),
    ('Use',          'Application',    'Scaffolding inspections, construction sites, industrial facilities, maintenance, access equipment monitoring', 30),
    ('Use',          'Built for',      'Scaffolders, site managers, contractors, maintenance teams',       31),
    ('Use',          'Compliance',     'Helps maintain workplace safety inspection records',               32),
    ('Pricing',      'Per pack',       'Price set per pack option at the picker above',                    40),
    ('Stock',        'Availability',   'In stock — all pack options',                                      50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                        52),
    ('Build & care', 'Made in',        'United Kingdom',                                                    60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                    61)
  ) as v(g, l, val, s)
where p.slug = 'scaffolding-inspection-card-system'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
