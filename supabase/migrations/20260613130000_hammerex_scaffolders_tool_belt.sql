-- HAMMEREX Scaffolder's Tool Belt — heavy-duty rivet-reinforced belt system
-- with multiple integrated tool holders, multi-hole adjustable fit, steel
-- buckle, quick-access attachment clip. Black with orange contrast stitching.
-- £17.99 GBP (Rp 359,800 @ 20k/£). Primary category: scaffolding;
-- cross-listed to roofing, steel-fixing, carpentry, bricklaying (per the
-- description's "Scaffolding, Construction, Roofing, Steelwork, General
-- Trades" application list).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  E'Hammerex Scaffolder\'s Tool Belt',
  'Heavy-duty rivet-reinforced scaffolder''s tool belt system — multiple integrated tool holders, multi-hole adjustable fit, steel buckle, quick-access attachment clip. Black with orange contrast stitching.',
  359800,
  'https://ik.imagekit.io/pinky/Untitledasdfasdfasdf.png',
  true,
  'scaffolders-tool-belt', 'HX-STB-001', 'Hammerex', 'HX-STB', '14:00',
  1, 'United Kingdom',
  E'The **HAMMEREX Scaffolder''s Tool Belt** is designed for professionals who need durability, comfort, and quick access to essential tools throughout the workday. Built from premium heavy-duty materials and reinforced at every stress point, this belt is engineered to withstand demanding jobsite conditions while keeping your most-used tools secure and within reach.\n\nFeaturing multiple integrated tool holders, reinforced riveted construction, and a fully adjustable belt system, the HAMMEREX Scaffolder''s Belt helps improve efficiency on-site by reducing downtime spent searching for tools.\n\nWhether you''re working on scaffolding, construction, roofing, steel fixing, or general site work, this belt delivers reliable performance day after day.\n\n### Features\n\n* Heavy-duty premium construction for maximum durability\n* Rivet-reinforced stress points for long service life\n* Multiple integrated tool holders for essential scaffolding tools\n* Secure-fit design helps prevent tools from slipping during use\n* Adjustable belt with multiple sizing positions\n* Strong steel buckle for dependable support\n* Quick-access attachment clip for accessories and equipment\n* Comfortable all-day wear design\n* High-visibility HAMMEREX black and orange styling\n\n### Benefits\n\n* Keeps essential tools organised and accessible\n* Reduces time spent reaching into pockets\n* Improves productivity on-site\n* Built to handle harsh construction environments\n* Designed specifically for professional scaffolders and tradespeople\n\n### HAMMEREX\n\nProfessional gear engineered for hardworking tradespeople. Built tough. Built smart. Built to last.',
  '[
    {"icon":"check","label":"Heavy-duty premium construction for maximum durability"},
    {"icon":"check","label":"Rivet-reinforced stress points for long service life"},
    {"icon":"check","label":"Multiple integrated tool holders for essential scaffolding tools"},
    {"icon":"check","label":"Secure-fit design helps prevent tools from slipping during use"},
    {"icon":"check","label":"Adjustable belt with multiple sizing positions"},
    {"icon":"check","label":"Strong steel buckle for dependable support"},
    {"icon":"check","label":"Quick-access attachment clip for accessories and equipment"},
    {"icon":"check","label":"Comfortable all-day wear design"},
    {"icon":"check","label":"High-visibility HAMMEREX black and orange styling"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SCAFFOLDER''S TOOL BELT SYSTEM', 27
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-tool-belt');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledasdfasdfasdf.png',
  E'Hammerex Scaffolder\'s Tool Belt — rivet-reinforced, multi-holder, black with orange contrast stitching',
  0
from public.hammerex_products p
where p.slug = 'scaffolders-tool-belt'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to scaffolding + roofing + steel-fixing + carpentry + bricklaying.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('scaffolding',  0),
    ('roofing',      1),
    ('steel-fixing', 2),
    ('carpentry',    3),
    ('bricklaying',  4)
  ) as v(slug, s)
where p.slug = 'scaffolders-tool-belt' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    (E'HAMMEREX Scaffolder\'s Tool Belt System', 1, 0)
  ) as v(l, q, s)
where p.slug = 'scaffolders-tool-belt'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX',                                                       0),
    ('Material',     'Colour',         'Black with orange contrast stitching',                          10),
    ('Material',     'Construction',   'Reinforced heavy-duty material',                                11),
    ('Material',     'Hardware',       'Rivet-reinforced metal components, steel buckle',               12),
    ('Design',       'Tool holders',   'Multiple integrated holders for essential scaffolding tools',   20),
    ('Design',       'Attachment',     'Quick-access clip for accessories and equipment',               21),
    ('Fit',          'Adjustment',     'Multi-hole adjustable fit',                                     30),
    ('Pricing',      'Single unit',    '£17.99',                                                        40),
    ('Stock',        'Availability',   'In stock',                                                      50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                     51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                     52),
    ('Use',          'Application',    'Scaffolding, construction, roofing, steelwork, general trades', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                                70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                71)
  ) as v(g, l, val, s)
where p.slug = 'scaffolders-tool-belt'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
