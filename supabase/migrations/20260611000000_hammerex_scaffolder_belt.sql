-- Heavy Duty Leather Tool Belt Set (scaffolders) — £19.99 GBP.
-- Same quote-on-delivery flow as the other GBP products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features, stock_count,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Heavy Duty Leather Tool Belt Set',
  'Twin-buckle leather belt for scaffolders — rear lanyard points on every holder.',
  399800,
  'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZxasdasd.png?tr=w-1600,q-90,f-auto',
  true,
  'heavy-duty-leather-tool-belt', 'HX-HDLTB-001', 'Hammerex', 'HX-HDLTB', 1.2, '14:00',
  1, 'United Kingdom',
  E'Built for professional scaffolders and construction workers. Premium heavy-duty leather, twin buckle fastening for stability through long days on site.\n\nEvery holder has a dedicated rear lanyard attachment point — lanyards stay behind the holder, clear of your tools, while keeping you within site safety standards.\n\nDesigned to carry: adjustable ratchet, 2× podgers, scaffold hammer, site level (various designs and sizes), tape measure up to 8 metres, and work gloves via the integrated glove clip.\n\nCustom belt sizing and choice of thread colours available to match company branding.\n\nBuilt for scaffolders. Made to last.',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Twin buckle fastening for strength and security"},
    {"icon":"check","label":"Individual rear-mounted lanyard points on every holder"},
    {"icon":"check","label":"Reinforced riveted construction"},
    {"icon":"check","label":"Adjustable fit — suits all waist sizes"},
    {"icon":"check","label":"Custom sizing + thread colour options available"}
  ]'::jsonb,
  35, 'GBP', 3, true,
  '[
    "Custom belt sizing available — ask when you submit your quote.",
    "Choice of thread colours available to match company branding.",
    "Orders dispatched within 3 working days.",
    "Delivery is quoted at checkout — sea or air, your choice."
  ]'::jsonb,
  null, 'TWIN-BUCKLE LEATHER BELT', 4
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'heavy-duty-leather-tool-belt');

-- Hero image (also seeded as gallery image 0)
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZxasdasd.png?tr=w-1600,q-90,f-auto',
  'Heavy Duty Leather Tool Belt Set — full belt with all holders',
  0
from public.hammerex_products p
where p.slug = 'heavy-duty-leather-tool-belt'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- What's Included
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('Heavy-duty leather belt (twin buckle)', 1, 'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZxasdasd.png?tr=w-800,q-85,f-auto', 0),
    ('Ratchet holder',                         1, null, 1),
    ('Twin podger holder',                      1, null, 2),
    ('Scaffold hammer holder',                  1, null, 3),
    ('Site level holder',                       1, null, 4),
    ('Tape measure holder (up to 8 m)',         1, null, 5),
    ('Integrated glove clip',                   1, null, 6),
    ('Rear lanyard points (every holder)',      1, null, 7)
  ) as v(l, q, u, s)
where p.slug = 'heavy-duty-leather-tool-belt'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',      'Belt',          'Premium heavy-duty leather',              0),
    ('Material',      'Construction',  'Reinforced riveted, pressure-glued seams', 1),
    ('Fastening',     'Buckle',        'Twin buckle',                            10),
    ('Fastening',     'Sizing',        'Adjustable · custom sizes available',     11),
    ('Compatibility', 'Tape measure',  'Holder fits up to 8 m',                  20),
    ('Compatibility', 'Lanyards',      'Rear attachment point on every holder',  21),
    ('Physical',      'Weight',        '~1.2 kg',                                30),
    ('Build & care',  'Made in',       'United Kingdom',                         40),
    ('Build & care',  'Warranty',      '1 year (manufacturing defects)',         41)
  ) as v(g, l, val, s)
where p.slug = 'heavy-duty-leather-tool-belt'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id);
