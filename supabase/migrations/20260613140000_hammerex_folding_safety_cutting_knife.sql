-- HAMMEREX Folding Safety Cutting Knife — folding blade with integrated
-- lanyard hole for height-work tool retention, ergonomic anti-slip grip,
-- supplied with 5 standard utility blades, compatible with widely available
-- replacements. £7.99 GBP (Rp 159,800 @ 20k/£). Primary category: carpentry.
-- Cross-listed to EVERY existing category at user request ("add to all
-- category").

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Folding Safety Cutting Knife',
  'Folding safety utility knife — ergonomic anti-slip grip, integrated lanyard hole for working at heights, quick blade change, includes 5 standard utility blades and accepts widely available replacements.',
  159800,
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasdaasdaasdasdaasdasdasdasd.png',
  true,
  'folding-safety-cutting-knife', 'HX-FSCK-001', 'Hammerex', 'HX-FSCK', '14:00',
  1, 'United Kingdom',
  E'The **Hammerex Folding Safety Cutting Knife** is a durable and practical cutting tool designed for professional tradespeople and everyday job site use. Featuring a folding blade design, the knife safely folds back into the handle when not in use, helping protect both the user and the blade during transport and storage.\n\nConstructed with a comfortable ergonomic grip and equipped with a dedicated lanyard hole, this knife is ideal for working at heights where tool retention and safety are essential. The robust folding mechanism provides quick access to the blade while ensuring secure storage between tasks.\n\nSupplied with **5 standard utility blades**, the Hammerex Folding Safety Cutting Knife is compatible with widely available replacement blades, making it a reliable and cost-effective addition to any toolbox.\n\n### Key Features\n\n* Folding blade design for safe storage\n* Lanyard hole for secure tethering when working at heights\n* Includes 5 standard utility blades\n* Compatible with most standard replacement blades\n* Ergonomic anti-slip grip for comfort and control\n* Durable construction built for professional use\n* Compact and lightweight design\n* Quick blade change system\n\n### Ideal For\n\n* Construction & Building Trades\n* Drywall & Plastering Work\n* Roofing & Scaffolding\n* Warehouse & Packaging Tasks\n* General Site Use\n* Working at Heights\n\n### HAMMEREX – BUILT FOR THE TRADE\n\nReliable, durable, and designed with safety in mind, the Hammerex Folding Safety Cutting Knife delivers dependable cutting performance wherever the job takes you.',
  '[
    {"icon":"check","label":"Folding blade design for safe storage"},
    {"icon":"check","label":"Lanyard hole for secure tethering when working at heights"},
    {"icon":"check","label":"Includes 5 standard utility blades"},
    {"icon":"check","label":"Compatible with most standard replacement blades"},
    {"icon":"check","label":"Ergonomic anti-slip grip for comfort and control"},
    {"icon":"check","label":"Durable construction built for professional use"},
    {"icon":"check","label":"Compact and lightweight design"},
    {"icon":"check","label":"Quick blade change system"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Ships with 5 standard utility blades — replacements widely available.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'FOLDING SAFETY UTILITY KNIFE', 28
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'folding-safety-cutting-knife');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasdaasdaasdasdaasdasdasdasd.png',
  'Hammerex Folding Safety Cutting Knife — folding blade with lanyard hole and ergonomic grip',
  0
from public.hammerex_products p
where p.slug = 'folding-safety-cutting-knife'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to ALL existing categories (per user request).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'folding-safety-cutting-knife'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Folding Safety Cutting Knife', 1, 0),
    ('Standard utility blades',               5, 1)
  ) as v(l, q, s)
where p.slug = 'folding-safety-cutting-knife'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                                            0),
    ('Brand',        'Product type',   'Folding Safety Utility Knife',                                        1),
    ('Material',     'Handle',         'Heavy-duty composite construction',                                  10),
    ('Material',     'Grip',           'Ergonomic anti-slip grip',                                            11),
    ('Design',       'Blade storage',  'Folding handle design',                                              20),
    ('Design',       'Safety',         'Integrated lanyard attachment hole',                                  21),
    ('Design',       'Blade change',   'Quick blade change system',                                          22),
    ('Capacity',     'Blade type',     'Standard utility blade',                                              30),
    ('Capacity',     'Compatibility',  'Compatible with widely available standard replacement blades',       31),
    ('Capacity',     'Included blades','5 standard utility blades',                                          32),
    ('Pricing',      'Single unit',    '£7.99',                                                              40),
    ('Stock',        'Availability',   'In stock',                                                            50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                          51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                          52),
    ('Use',          'Ideal for',      'Construction, drywall, plastering, roofing, scaffolding, warehouse', 60),
    ('Use',          'Height work',    'Lanyard hole supports tool tethering when working at heights',       61),
    ('Build & care', 'Made in',        'United Kingdom',                                                      70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                      71)
  ) as v(g, l, val, s)
where p.slug = 'folding-safety-cutting-knife'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
