-- HAMMEREX Tool Roll Organiser (spanners + see-through zip pockets).
-- Heavy-duty canvas + reinforced trim, multiple spanner slots, see-through
-- zip pockets for fasteners. £28 GBP (Rp 560,000 @ 20k/£). Universal
-- cross-trade product so primary = 'tools' + is_universal flag.
-- Cross-listed to every trade the listing names plus the tool-bags-backpacks
-- tool-type filter and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers,
  is_universal
)
select c.id,
  'Tool Roll Organiser — Spanners & Tools',
  'Heavy-duty canvas tool roll — multiple spanner slots and see-through zip pockets for fasteners and small parts. Rolls into a compact carry pack with snap closures and an integrated handle. Built for mechanics, scaffolders, electricians, plumbers and general trades.',
  560000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsdsasdasdgdfgfsdf.png',
  true,
  'tool-roll-organiser', 'HX-TRO-001', 'Hammerex', 'HX-TRO', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'### Keep your tools organised. Protected. Ready for action.\n\nThe **HAMMEREX Tool Roll Organiser** is built for trades, mechanics, scaffolders, fitters and construction professionals who demand durability and organisation on every job site.\n\nDesigned with multiple tool compartments and heavy-duty see-through zip pockets, this organiser keeps your spanners, sockets, fasteners, screws and accessories neatly arranged and easy to find. Simply roll it up, secure the snap fasteners, and carry your complete tool kit wherever the job takes you.\n\n### Key Features\n\n✔ **Heavy-Duty Construction** — durable canvas and reinforced materials designed to withstand tough worksite conditions.\n\n✔ **See-Through Zip Pockets** — quickly identify small parts, screws, washers, cable clips and accessories without opening every compartment.\n\n✔ **Dedicated Spanner Storage** — multiple sized slots securely hold spanners, ratchets, extensions, sockets and hand tools.\n\n✔ **Compact Roll-Up Design** — rolls into a convenient carry pack, saving space in toolboxes, vehicles and site storage areas.\n\n✔ **Secure Fastening System** — heavy-duty snap closures keep your tools safely secured during transport.\n\n✔ **Comfort Carry Handle** — built-in handle allows easy transport between jobs and work areas.\n\n### Perfect For\n\n* Construction Workers · Mechanics · Scaffolders\n* Electricians · Plumbers · Maintenance Technicians\n* DIY Enthusiasts\n\n### Built Better. Work Smarter.\n\nWhether you''re working on-site, in the workshop or on the road, the HAMMEREX Tool Roll Organiser keeps your tools secure, organised and always within reach.',
  '[
    {"icon":"check","label":"Heavy-duty canvas with reinforced trim"},
    {"icon":"check","label":"Multiple spanner / ratchet / socket slots"},
    {"icon":"check","label":"See-through zip pockets for fasteners and parts"},
    {"icon":"check","label":"Compact roll-up portable design"},
    {"icon":"check","label":"Heavy-duty snap closures"},
    {"icon":"check","label":"Integrated comfort carry handle"},
    {"icon":"check","label":"Black with Hammerex yellow trim"},
    {"icon":"check","label":"Universal across building, mechanical and maintenance trades"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'TOOL ROLL · SPANNER + ZIP POCKETS', 41,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb,
  true
from public.hammerex_categories c
where c.slug = 'tools'
and not exists (select 1 from public.hammerex_products where slug = 'tool-roll-organiser');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsdsasdasdgdfgfsdf.png',
  'Hammerex Tool Roll Organiser — canvas spanner roll with see-through zip pockets',
  0
from public.hammerex_products p
where p.slug = 'tool-roll-organiser'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list across every trade the listing names.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('tools', 0),
    ('auto', 1),
    ('scaffolding', 2),
    ('electrical', 3),
    ('plumbing', 4),
    ('carpentry', 5),
    ('metal-fabrication', 6),
    ('tool-bags-backpacks', 7),
    ('new-products', 8)
  ) as v(slug, s)
where p.slug = 'tool-roll-organiser' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Tool Roll Organiser (empty)', 1, null, 0
from public.hammerex_products p
where p.slug = 'tool-roll-organiser'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Heavy-duty canvas with reinforced trim',              0),
    ('Material',     'Stitching',      'Reinforced stitching throughout',                     1),
    ('Capacity',     'Spanners',       'Multiple sized slots for spanners + ratchets + sockets', 10),
    ('Capacity',     'Fasteners',      'See-through zip pockets for screws, washers, clips', 11),
    ('Design',       'Format',         'Roll-up — compact when stored or carried',           20),
    ('Design',       'Closure',        'Heavy-duty snap fasteners',                          21),
    ('Design',       'Carry',          'Integrated comfort carry handle',                    22),
    ('Design',       'Colour',         'Black with Hammerex yellow trim',                    23),
    ('Pricing',      'Single unit',    '£28.00',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Mechanics, scaffolders, electricians, plumbers, general trades', 50),
    ('Use',          'Environments',   'Construction sites, workshops, service vehicles',    51),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'tool-roll-organiser'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
