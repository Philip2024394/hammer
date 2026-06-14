-- HAMMEREX® SITE PRO Adjustable Pliers Belt Holder — premium leather holder
-- with center-bolt retention, yellow contrast stitching, riveted, belts up
-- to 60mm. £11.99 GBP (Rp 239,800 @ 20k/£). Primary category: plumbing
-- (most natural — water pump / adjustable pliers are a plumber's signature
-- tool). Cross-listed via hammerex_product_trades to every other trade that
-- routinely needs adjustable pliers: electrical, hvac, scaffolding,
-- steel-fixing, metal-fabrication, carpentry. Also linked to the
-- belt-holders tool-type.
--
-- Image already migrated to Supabase Storage (no ImageKit references).

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex SITE PRO Adjustable Pliers Belt Holder',
  'Premium leather adjustable pliers belt holder — center-bolt retention, riveted, yellow contrast stitching, fits belts up to 60mm. Built for plumbers, electricians, HVAC techs and general site work.',
  239800,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/fb981d594f451841.png',
  true,
  'adjustable-pliers-belt-holder', 'HX-APBH-001', 'Hammerex', 'HX-APBH', '14:00',
  1, 'United Kingdom',
  E'Keep your essential tool secure, accessible, and ready for action with the **HAMMEREX® SITE PRO Adjustable Pliers Belt Holder**. Designed for professional tradespeople, electricians, plumbers, maintenance crews, and DIY users, this heavy-duty leather holder provides reliable carrying comfort and quick tool access throughout the workday.\n\n### Key Features\n\n**Universal Adjustable Pliers Fit**\n* Designed to accommodate most adjustable pliers sizes.\n* Secure retention system keeps tools firmly in place while allowing quick access.\n\n**Premium Leather Construction**\n* Crafted from durable black leather for long-lasting performance.\n* Reinforced edges and heavy-duty rivets provide exceptional strength in demanding jobsite conditions.\n\n**High-Visibility Yellow Stitching**\n* Premium yellow thread stitching enhances durability and delivers a professional SITE PRO appearance.\n\n**Heavy-Duty Belt Compatibility**\n* Fits work belts up to **60 mm (6 cm) wide**.\n* Stable belt loop design minimises movement while walking, climbing, or working.\n\n**Center Bolt Retention Design**\n* Features a reinforced center bolt station for added strength and secure tool positioning.\n* Designed to withstand daily professional use.\n\n**Comfortable All-Day Carry**\n* Low-profile design keeps tools close to the body.\n* Reduces pocket bulk while improving efficiency and accessibility.\n\n### Specifications\n\n* Brand: HAMMEREX®\n* Series: SITE PRO\n* Material: Genuine Heavy-Duty Leather\n* Colour: Black Leather with Yellow Stitching\n* Tool Compatibility: Adjustable Pliers (most sizes)\n* Maximum Belt Width: 60 mm (6 cm)\n* Fastening: Reinforced Rivet Construction\n* Application: Construction, Electrical, Plumbing, Maintenance, Industrial & Workshop Use\n\n### Built for Professionals\n\nStrong. Reliable. Professional. The HAMMEREX® SITE PRO Adjustable Pliers Belt Holder is engineered to keep your pliers secure and within reach, helping you work faster, safer, and more efficiently on every job.',
  '[
    {"icon":"check","label":"Fits most adjustable pliers sizes"},
    {"icon":"check","label":"Premium heavy-duty black leather"},
    {"icon":"check","label":"Reinforced rivet construction"},
    {"icon":"check","label":"High-visibility yellow contrast stitching"},
    {"icon":"check","label":"Center-bolt retention for secure tool positioning"},
    {"icon":"check","label":"Fits work belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Low-profile, comfortable all-day carry"},
    {"icon":"check","label":"Built for construction, electrical, plumbing, HVAC and workshop use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any HAMMEREX leather tool belt up to 60mm wide.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'SITE PRO ADJUSTABLE PLIERS HOLDER', 50
from public.hammerex_categories c
where c.slug = 'plumbing'
and not exists (select 1 from public.hammerex_products where slug = 'adjustable-pliers-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/fb981d594f451841.png',
  'Hammerex SITE PRO Adjustable Pliers Belt Holder — premium leather, center-bolt retention, yellow stitching',
  0
from public.hammerex_products p
where p.slug = 'adjustable-pliers-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Auto-categorisation: cross-list to the trades that genuinely use
-- adjustable pliers, plus the belt-holders tool-type bucket.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('plumbing',           0),
    ('electrical',         1),
    ('hvac',               2),
    ('steel-fixing',       3),
    ('scaffolding',        4),
    ('metal-fabrication',  5),
    ('carpentry',          6),
    ('belt-holders',       7)
  ) as v(slug, s)
where p.slug = 'adjustable-pliers-belt-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex SITE PRO Adjustable Pliers Belt Holder', 1, 0),
    ('Center-bolt retention station',                    1, 1)
  ) as v(l, q, s)
where p.slug = 'adjustable-pliers-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                                  0),
    ('Brand',        'Series',         'SITE PRO',                                                                   1),
    ('Brand',        'Product type',   'Adjustable Pliers Belt Holder',                                              2),
    ('Material',     'Body',           'Genuine heavy-duty leather',                                                10),
    ('Material',     'Colour',         'Black leather with yellow stitching',                                       11),
    ('Material',     'Hardware',       'Reinforced rivet construction',                                             12),
    ('Capacity',     'Tool fit',       'Most adjustable pliers sizes',                                              20),
    ('Design',       'Retention',      'Center-bolt retention station',                                             30),
    ('Design',       'Profile',        'Low-profile, comfortable all-day carry',                                    31),
    ('Fit',          'Belt width',     'Fits belts up to 60mm (6cm) wide',                                          40),
    ('Pricing',      'Single unit',    '£11.99',                                                                    50),
    ('Stock',        'Availability',   'In stock',                                                                  60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                                 61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                                 62),
    ('Use',          'Application',    'Construction, electrical, plumbing, HVAC, maintenance, industrial, workshop', 70),
    ('Use',          'Built for',      'Plumbers, electricians, HVAC techs, scaffolders, maintenance crews, DIY',   71),
    ('Build & care', 'Made in',        'United Kingdom',                                                             80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                             81)
  ) as v(g, l, val, s)
where p.slug = 'adjustable-pliers-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
