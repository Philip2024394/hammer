-- HAMMEREX Stainless Steel Tool Attachment Carabiner — heavy-duty clip for
-- attaching tool lanyards, pouches, tape measures, gloves, keys, etc. 78mm
-- × 42mm. Six selectable colour variants in hammerex_product_variants.
-- Prices intentionally seeded as 0 (placeholder pending user confirmation).
-- Primary category: scaffolding. Cross-listed to drywall-accessories +
-- professional-tool-storage (the two existing "accessories" groupings —
-- user typed "asessories category" singular which is ambiguous; covering
-- both to surface the product under either accessory banner).
-- Note: this is NOT certified for climbing, fall arrest, or any
-- safety-critical use — copy reflects that.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Stainless Steel Tool Attachment Carabiner',
  'Stainless steel tool-attachment carabiner — quick-release clip for tool lanyards, pouches, tape measures, gloves and keys. 78mm × 42mm. Choose your colour.',
  0,
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
  true,
  'stainless-steel-tool-carabiner', 'HX-CAR-001', 'Hammerex', 'HX-CAR', '14:00',
  1, 'United Kingdom',
  E'Keep essential tools and accessories within easy reach on site with the **Hammerex Stainless Steel Tool Attachment Carabiner**. Designed for construction professionals, plasterers, drywall installers, electricians, and general tradespeople, this heavy-duty clip provides a quick and secure attachment point for tool lanyards, pouches, tape measures, gloves, keys, and other site essentials.\n\nManufactured from durable stainless steel, the carabiner offers excellent strength, corrosion resistance, and long-lasting performance in demanding working environments. Whether attached to a tool belt, work trousers, backpack, scaffold harness, or storage bag, it provides fast access to frequently used equipment while helping to keep your workspace organised.\n\nThe quick-release design allows tools and accessories to be attached or removed in seconds, making it ideal for busy construction sites where efficiency matters.\n\n### Features\n\n* Heavy-duty stainless steel construction\n* Rust and corrosion resistant\n* Ideal for tool lanyards and tool tether systems\n* Suitable for attaching tape measures, gloves, keys, pouches, and accessories\n* Quick attachment and removal design\n* Strong and reliable for everyday site use\n* Lightweight and compact\n* Suitable for tool belts, backpacks, work bags, and harnesses\n\n### Dimensions\n\n* Length: 78mm\n* Width: 42mm (widest point)\n\n### Ideal For\n\n* Construction workers\n* Plasterers and drywall installers\n* Bricklayers\n* Electricians\n* Carpenters\n* Scaffolders\n* General trade professionals\n\n### Available Colours\n\n* Purple\n* Green\n* Blue\n* Orange\n* Black\n* Black / Orange Screw Edition\n\n**Please Note:** This product is designed for tool attachment, storage, and organisation purposes. It is **not** intended or certified for climbing, lifting personnel, fall arrest, or safety-critical applications.\n\nFast dispatch available with international shipping options.',
  '[
    {"icon":"check","label":"Heavy-duty stainless steel construction"},
    {"icon":"check","label":"Rust and corrosion resistant"},
    {"icon":"check","label":"Ideal for tool lanyards and tool tether systems"},
    {"icon":"check","label":"Attach tape measures, gloves, keys, pouches and accessories"},
    {"icon":"check","label":"Quick attachment and removal design"},
    {"icon":"check","label":"Strong and reliable for everyday site use"},
    {"icon":"check","label":"Lightweight and compact (78mm × 42mm)"},
    {"icon":"check","label":"Pairs with tool belts, backpacks, work bags and harnesses"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your colour above — six finishes including a Black / Orange Screw Edition.",
    "NOT certified for climbing, fall arrest or any safety-critical application — tool attachment only.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'TOOL ATTACHMENT CARABINER — CHOOSE COLOUR', 30
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'stainless-steel-tool-carabiner');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
  'Hammerex Stainless Steel Tool Attachment Carabiner — six colours, 78mm × 42mm',
  0
from public.hammerex_products p
where p.slug = 'stainless-steel-tool-carabiner'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to scaffolding + drywall-accessories + professional-tool-storage.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('scaffolding',              0),
    ('drywall-accessories',      1),
    ('professional-tool-storage',2)
  ) as v(slug, s)
where p.slug = 'stainless-steel-tool-carabiner' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- Six colour variants. Placeholder price 0 — user will confirm.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Purple',                       'HX-CAR-PUR',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-PUR',  0, true,  40),
    ('Green',                        'HX-CAR-GRN',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-GRN',  1, false, 40),
    ('Blue',                         'HX-CAR-BLU',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-BLU',  2, false, 40),
    ('Orange',                       'HX-CAR-ORG',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-ORG',  3, false, 40),
    ('Black',                        'HX-CAR-BLK',  0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-BLK',  4, false, 40),
    ('Black / Orange Screw Edition', 'HX-CAR-BOSE', 0,
       'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2013,%202026,%2007_02_51%20PM.png',
       'HX-CAR-BOSE', 5, false, 30)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'stainless-steel-tool-carabiner'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Stainless Steel Tool Attachment Carabiner (colour as selected)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'stainless-steel-tool-carabiner'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',         'Hammerex',                                                                 0),
    ('Brand',        'Product type',  'Tool Attachment Carabiner',                                                1),
    ('Material',     'Body',          'Stainless steel — rust & corrosion resistant',                            10),
    ('Dimensions',   'Length',        '78mm',                                                                    20),
    ('Dimensions',   'Width',         '42mm (widest point)',                                                     21),
    ('Capacity',     'Colours',       'Purple / Green / Blue / Orange / Black / Black-Orange Screw Edition',     30),
    ('Use',          'Designed for',  'Tool lanyards, pouches, tape measures, gloves, keys, site essentials',    40),
    ('Use',          'Pairs with',    'Tool belts, backpacks, work bags, scaffold harnesses',                    41),
    ('Safety',       'Not certified', 'NOT for climbing, lifting personnel, fall arrest, or safety-critical use',50),
    ('Pricing',      'Per colour',    'Price set per colour at the colour picker above',                         60),
    ('Stock',        'Availability',  'In stock — all colours',                                                  70),
    ('Dispatch',     'Lead time',     'Dispatched within 3 working days of order',                               71),
    ('Dispatch',     'UK delivery',   'Typical UK delivery within 5 working days',                               72),
    ('Build & care', 'Made in',       'United Kingdom',                                                           80),
    ('Build & care', 'Warranty',      '1 year (manufacturing defects)',                                           81)
  ) as v(g, l, val, s)
where p.slug = 'stainless-steel-tool-carabiner'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
