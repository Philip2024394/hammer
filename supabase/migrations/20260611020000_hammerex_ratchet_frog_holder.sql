-- HammerEx Leather Scaffolding Belt & Tilted Ratchet Frog Holder — £14.50 GBP.
-- Scaffolders-only listing.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'HammerEx Leather Scaffolding Belt & Tilted Ratchet Frog Holder',
  'Angled ratchet frog holder on a heavy-duty leather belt — designed by scaffolders for faster on-site access.',
  290000,
  'https://ik.imagekit.io/pinky/Untitledsdasdasdasdaaaadsfsdf.png?tr=w-1600,q-90,f-auto',
  true,
  'leather-scaffolding-belt-tilted-ratchet-frog-holder', 'HX-LSRFH-001', 'Hammerex', 'HX-LSRFH', '14:00',
  1, 'United Kingdom',
  E'Designed by scaffolders, for scaffolders, the HammerEx Leather Belt and Tilted Ratchet Frog Holder delivers all-day comfort, speed, and efficiency on site.\n\nThe innovative angled holder allows for effortless drop-in and lift-out operation, making it quicker and easier to access your ratchet throughout the working day. Unlike standard vertical holders, the tilted design improves accessibility while reducing unnecessary movement, helping increase productivity and comfort.\n\nManufactured from heavy-duty leather with a reinforced tube-style holder, this system is secured using high-strength bolts and industrial rivets to provide exceptional durability and long service life in demanding site conditions. The robust construction ensures the holder maintains its shape and performance even under daily professional use.\n\nThe adjustable leather belt is designed to fit all waist sizes, providing a secure and comfortable fit for every user. To personalise your belt, thread colour can be selected when ordering, with options including Yellow, Red, or Orange stitching.',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Angled ratchet frog holder for faster access"},
    {"icon":"check","label":"Simple and effective drop-and-lift operation"},
    {"icon":"check","label":"Reinforced tube design for maximum durability"},
    {"icon":"check","label":"Industrial bolt and rivet fixings"},
    {"icon":"check","label":"Fits all waist sizes"},
    {"icon":"check","label":"Choice of thread colour: Yellow, Red, or Orange"},
    {"icon":"check","label":"Built for professional scaffolding use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Choose thread colour when you submit your quote — Yellow, Red, or Orange.",
    "Adjustable belt — fits all waist sizes.",
    "Orders dispatched within 3 working days.",
    "UK delivery and international delivery quoted on request — contact us for details."
  ]'::jsonb,
  null, 'TILTED RATCHET FROG HOLDER', 6
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'leather-scaffolding-belt-tilted-ratchet-frog-holder');

-- Hero image (also seeded as gallery image 0).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledsdasdasdasdaaaadsfsdf.png?tr=w-1600,q-90,f-auto',
  'HammerEx Leather Scaffolding Belt with tilted ratchet frog holder',
  0
from public.hammerex_products p
where p.slug = 'leather-scaffolding-belt-tilted-ratchet-frog-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- What's Included.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, v.u, v.s
from public.hammerex_products p,
  (values
    ('Heavy-duty leather scaffolding belt', 1, 'https://ik.imagekit.io/pinky/Untitledsdasdasdasdaaaadsfsdf.png?tr=w-800,q-85,f-auto', 0),
    ('Tilted ratchet frog holder',          1, null, 1)
  ) as v(l, q, u, s)
where p.slug = 'leather-scaffolding-belt-tilted-ratchet-frog-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',      'Belt',           'Premium heavy-duty leather',                    0),
    ('Material',      'Holder',         'Reinforced tube-style leather',                 1),
    ('Material',      'Fixings',        'High-strength bolts + industrial rivets',       2),
    ('Design',        'Holder angle',   'Tilted — drop-in / lift-out access',           10),
    ('Fit',           'Belt sizing',    'Adjustable — fits all waist sizes',            20),
    ('Personalisation','Thread colour', 'Yellow · Red · Orange',                        30),
    ('Use',           'Built for',      'Professional scaffolding',                     40),
    ('Build & care',  'Made in',        'United Kingdom',                               50),
    ('Build & care',  'Warranty',       '1 year (manufacturing defects)',               51)
  ) as v(g, l, val, s)
where p.slug = 'leather-scaffolding-belt-tilted-ratchet-frog-holder'
and not exists (select 1 from public.hammerex_product_specs ps where ps.product_id = p.id);
