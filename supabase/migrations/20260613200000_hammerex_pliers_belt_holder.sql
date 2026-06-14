-- HAMMEREX Pliers Belt Holder — premium leather pliers belt holder with
-- reinforced solid inner core, yellow contrast stitching, heavy-duty rivets,
-- universal fit for most pliers/cutters, belts up to 60mm. £11.99 GBP
-- (Rp 239,800 @ 20k/£). Primary category: electrical (per user "can
-- electrician"); cross-listed to scaffolding + carpentry to match the
-- description's "electricians, scaffolders, mechanics, construction
-- workers" audience.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Pliers Belt Holder',
  'Premium leather pliers belt holder — reinforced solid inner core, yellow contrast stitching, heavy-duty riveted, universal fit for most pliers and cutters, belts up to 60mm.',
  239800,
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasd.png?updatedAt=1781339752452',
  true,
  'pliers-belt-holder', 'HX-PBH-001', 'Hammerex', 'HX-PBH', '14:00',
  1, 'United Kingdom',
  E'Keep your pliers secure and within easy reach with the **Hammerex Pliers Belt Holder**. Designed for professional tradespeople, electricians, scaffolders, mechanics, and construction workers, this durable holder provides quick access to your tools while keeping your hands free on the job.\n\nManufactured from premium leather with a reinforced solid inner core, the holder is built to withstand daily site use and harsh working environments. The universal design securely accommodates most sizes and styles of pliers, making it a practical addition to any tool belt setup.\n\n### Features\n\n* Premium heavy-duty leather construction\n* Reinforced solid inner core for maximum durability\n* Fits most sizes and types of pliers\n* Quick-access open design\n* Secure tool retention during movement and climbing\n* Fits belts up to 6cm wide\n* Heavy-duty riveted construction\n* Suitable for professional and DIY use\n* Durable yellow contrast stitching\n* Built for construction, electrical, mechanical, and site work\n\n### Built to Hold. Made to Last.\n\nDesigned for tradespeople who need reliable tool storage, the Hammerex Pliers Belt Holder keeps your pliers protected, accessible, and ready for work throughout the day.',
  '[
    {"icon":"check","label":"Premium heavy-duty leather construction"},
    {"icon":"check","label":"Reinforced solid inner core for maximum durability"},
    {"icon":"check","label":"Fits most sizes and types of pliers"},
    {"icon":"check","label":"Quick-access open design"},
    {"icon":"check","label":"Secure tool retention during movement and climbing"},
    {"icon":"check","label":"Fits belts up to 60mm (6cm) wide"},
    {"icon":"check","label":"Heavy-duty riveted construction"},
    {"icon":"check","label":"Durable yellow contrast stitching"},
    {"icon":"check","label":"Built for construction, electrical, mechanical and site work"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pairs with any HAMMEREX leather tool belt up to 60mm wide.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'UNIVERSAL PLIERS BELT HOLDER', 34
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'pliers-belt-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasd.png?updatedAt=1781339752452',
  'Hammerex Pliers Belt Holder — premium leather, yellow contrast stitching, riveted construction',
  0
from public.hammerex_products p
where p.slug = 'pliers-belt-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to electrical + scaffolding + carpentry (per the description's
-- electricians / scaffolders / construction workers application list).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('electrical', 0), ('scaffolding', 1), ('carpentry', 2)) as v(slug, s)
where p.slug = 'pliers-belt-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Pliers Belt Holder',           1, 0),
    ('Universal belt loop (up to 60mm)',      1, 1)
  ) as v(l, q, s)
where p.slug = 'pliers-belt-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                          0),
    ('Material',     'Body',           'Premium leather',                                  10),
    ('Material',     'Colour',         'Black leather with yellow contrast stitching',     11),
    ('Material',     'Inner core',     'Reinforced solid core — keeps shape under load',   12),
    ('Material',     'Hardware',       'Heavy-duty riveted construction',                  13),
    ('Capacity',     'Tool fit',       'Universal — fits most pliers and cutters',         20),
    ('Design',       'Access',         'Quick-access open design',                         30),
    ('Design',       'Retention',      'Secure hold during movement and climbing',         31),
    ('Fit',          'Belt width',     'Fits belts up to 60mm (6cm) wide',                 40),
    ('Pricing',      'Single unit',    '£11.99',                                           50),
    ('Stock',        'Availability',   'In stock',                                         60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        62),
    ('Use',          'Built for',      'Electricians, scaffolders, mechanics, construction', 70),
    ('Build & care', 'Made in',        'United Kingdom',                                   80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   81)
  ) as v(g, l, val, s)
where p.slug = 'pliers-belt-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
