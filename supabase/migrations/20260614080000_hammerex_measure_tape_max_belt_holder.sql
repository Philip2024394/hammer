-- HAMMEREX Measure Tape Max Belt Holder — premium leather high-position tape
-- holder for tapes up to 10m. Firm fit, strong riveted construction, left or
-- right-hand use. £11.99 GBP (Rp 239,800 @ 20k/£). Primary category:
-- carpentry. Cross-listed to EVERY existing category at user request
-- ("all categories"). Distinct from the leather measure-tape-belt-holder
-- (£9.80, 8m, soft-close) — this is the high-mount Max variant.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Measure Tape Max Belt Holder',
  'Premium leather Max tape belt holder — high-position mount for improved balance, universal fit up to 10m tape measures, riveted, left or right-hand use.',
  239800,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_35_53%20AM.png',
  true,
  'measure-tape-max-belt-holder', 'HX-MTMAX-001', 'Hammerex', 'HX-MTMAX', '14:00',
  1, 'United Kingdom',
  E'# HAMMEREX Measure Tape Max Belt Holder\n\nCarry larger tape measures with confidence using the **HAMMEREX Measure Tape Max Belt Holder**. Crafted from premium leather and designed specifically for professional tradespeople, this heavy-duty holder provides a secure, high-position carry system for tape measures up to 10 metres.\n\nUnlike standard tape holders that sit low and swing during movement, the HAMMEREX Max Holder positions your tape measure higher on the belt for improved comfort, balance, and accessibility throughout the working day. The firm-fitting design keeps your tape measure secure while climbing, bending, lifting, and working in demanding site conditions.\n\nBuilt from durable genuine leather, this holder is designed to withstand daily use on construction sites, scaffolding projects, roofing work, carpentry jobs, and industrial environments. The universal fit design accommodates most major tape measure brands and sizes up to 10m capacity.\n\n### Features\n\n* Universal fit for tape measures up to 10 metres\n* Premium heavy-duty leather construction\n* High-position belt mounting for improved comfort\n* Firm and secure tape measure retention\n* Quick access when needed on site\n* Built for demanding professional use\n* Strong riveted construction for durability\n* Suitable for left or right-hand use\n\n### Benefits\n\n* Holds larger 5m, 8m and 10m tape measures securely\n* Higher carry position reduces movement and swinging\n* Keeps tape measure easily accessible at all times\n* Improves comfort when climbing ladders and scaffolding\n* Durable leather construction built for long-term use\n* Professional-grade design trusted by tradespeople\n\n### Ideal For\n\n* Scaffolders · Builders · Carpenters · Roofers\n* Steel Erectors · Construction Workers · Maintenance Technicians · Industrial Trades\n\nDesigned to keep your tape measure secure, accessible, and firmly positioned throughout the toughest working conditions.\n\n**HAMMEREX – Built For Professionals.**',
  '[
    {"icon":"check","label":"Universal fit for tape measures up to 10 metres"},
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"High-position belt mounting for improved comfort"},
    {"icon":"check","label":"Firm and secure tape measure retention"},
    {"icon":"check","label":"Quick access when needed on site"},
    {"icon":"check","label":"Built for demanding professional use"},
    {"icon":"check","label":"Strong riveted construction for durability"},
    {"icon":"check","label":"Suitable for left or right-hand use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Universal fit — handles 5m, 8m and 10m tape measures.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TAPE MAX BELT HOLDER — HIGH POSITION', 42
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'measure-tape-max-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2014,%202026,%2002_35_53%20AM.png',
  'Hammerex Measure Tape Max Belt Holder — premium leather, high-position mount, fits up to 10m',
  0
from public.hammerex_products p
where p.slug = 'measure-tape-max-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'measure-tape-max-belt-holder'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Measure Tape Max Belt Holder', 1, 0)
  ) as v(l, q, s)
where p.slug = 'measure-tape-max-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Brand',        'Product type',   'Measure Tape Max Belt Holder',                          1),
    ('Material',     'Body',           'Premium genuine leather',                              10),
    ('Material',     'Hardware',       'Strong riveted construction',                          11),
    ('Capacity',     'Tape fit',       'Universal — tape measures up to 10m (5m / 8m / 10m)',  20),
    ('Design',       'Mount position', 'High belt position — improves balance, reduces swing', 30),
    ('Design',       'Hand',           'Suitable for left or right-hand use',                  31),
    ('Pricing',      'Single unit',    '£11.99',                                               40),
    ('Stock',        'Availability',   'In stock',                                             50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            52),
    ('Use',          'Built for',      'Scaffolders, builders, carpenters, roofers, steel erectors, maintenance, industrial', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                        70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        71)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-max-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
