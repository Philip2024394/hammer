-- HAMMEREX Water Repellent Apron — premium synthetic leather, water/oil
-- repellent, front pocket, quick-release buckle. Five user-selectable colour
-- variants. Standard / Jumbo size handled as a "specify on WhatsApp" note
-- (single price across sizes — user gave one price; sizes are listed in
-- specs as a customer choice on the quote).
--
-- Price: £6.70 GBP per colour = Rp 134,000 IDR (20k/£). Creates two NEW
-- trade categories: barber + farming, per user instruction. Cross-listed to
-- both. Not added to the home-page CategoryGrid TRADE_SLUGS whitelist.

-- 1. New trade categories.
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('barber',  'Barber',
   'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
   321),
  ('farming', 'Farming',
   'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
   322)
on conflict (slug) do nothing;

-- 2. Parent product. Primary category = barber (alphabetical first of the two
--    requested trades); cross-list adds farming below.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Water Repellent Apron',
  'Premium synthetic-leather apron — water, oil and stain repellent. Front pocket, quick-release buckle. Choose your colour. Standard or Jumbo size on request.',
  134000,
  'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
  true,
  'water-repellent-apron', 'HX-WRA-001', 'Hammerex', 'HX-WRA', '14:00',
  1, 'United Kingdom',
  E'Stay protected and work with confidence using the **HAMMEREX Water Repellent Apron**. Designed for professionals and home users alike, this premium synthetic leather apron provides excellent protection against water, oil, stains, and everyday spills.\n\nCrafted from durable, high-quality synthetic leather, the apron combines functionality, comfort, and long-lasting performance. Whether you''re cooking, grilling, butchering, crafting, cleaning, or working in a workshop, this apron helps keep your clothes clean while maintaining a professional appearance.\n\n## Key Features\n\n### Water & Oil Resistant\nThe premium synthetic leather surface repels water, oil, and liquids, helping protect your clothing from splashes, stains, and messes.\n\n### Practical Front Pocket\nFeatures a large front storage pocket — perfect for kitchen utensils, towels, tools, recipe cards, phones, and other essentials within easy reach.\n\n### Adjustable Buckle System\nEquipped with a quick-release buckle fastening system for easy wearing and removal without the hassle of tying straps.\n\n### Durable & Easy to Clean\nBuilt for daily use with strong stitching and quality materials. Simply wipe clean after use for quick maintenance.\n\n### Comfortable Fit\nDesigned for both men and women with adjustable straps for a secure and comfortable fit during extended wear.\n\n## Available in two sizes\n\n* **Standard** — 76 × 58 cm, neck tie 51 cm, waist belt 56 cm, front pocket 22 × 23 cm\n* **Jumbo** — 105 × 58 cm, front pocket 30 × 30 cm, adjustable buckle\n\nLet us know your preferred size when you send the WhatsApp quote.\n\n## Available Colours\n\n* Light Brown (Coksu)\n* Dark Brown\n* Black\n* Red\n* Turquoise\n\n## Ideal For\n\n* Home Cooking · Professional Kitchens · BBQ & Grilling · Catering\n* Butchers · Bakers · Coffee Shops\n* Workshops & Crafting · Cleaning & Maintenance Work\n\nHAMMEREX Water Repellent Aprons are designed to deliver reliable protection, comfort, and durability for everyday use. **Built to work as hard as you do.**',
  '[
    {"icon":"check","label":"Premium synthetic leather — water, oil & stain repellent"},
    {"icon":"check","label":"Large front pocket for utensils, towels, tools, phones"},
    {"icon":"check","label":"Quick-release adjustable buckle fastening"},
    {"icon":"check","label":"Strong stitching, easy to wipe clean"},
    {"icon":"check","label":"Adjustable straps for a comfortable fit (men or women)"},
    {"icon":"check","label":"Available in Standard (76×58cm) or Jumbo (105×58cm)"},
    {"icon":"check","label":"5 colours: Light Brown / Dark Brown / Black / Red / Turquoise"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your colour above — five colours available.",
    "Standard or Jumbo size — let us know your preference when you send the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'WATER REPELLENT APRON — CHOOSE COLOUR', 36
from public.hammerex_categories c
where c.slug = 'barber'
and not exists (select 1 from public.hammerex_products where slug = 'water-repellent-apron');

-- 3. Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
  'Hammerex Water Repellent Apron — synthetic leather, water/oil resistant, five colours',
  0
from public.hammerex_products p
where p.slug = 'water-repellent-apron'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- 4. Cross-list to barber + farming.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('barber', 0), ('farming', 1)) as v(slug, s)
where p.slug = 'water-repellent-apron' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- 5. Five colour variants. £6.70 each (same price across colours and sizes —
--    Standard/Jumbo is a quote-time choice, not a separate variant).
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Light Brown (Coksu)', 'HX-WRA-LBR', 134000,
       'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
       'HX-WRA-LBR', 0, true,  50),
    ('Dark Brown',          'HX-WRA-DBR', 134000,
       'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
       'HX-WRA-DBR', 1, false, 50),
    ('Black',               'HX-WRA-BLK', 134000,
       'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
       'HX-WRA-BLK', 2, false, 50),
    ('Red',                 'HX-WRA-RED', 134000,
       'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
       'HX-WRA-RED', 3, false, 50),
    ('Turquoise',           'HX-WRA-TRQ', 134000,
       'https://ik.imagekit.io/pinky/UntitledcxzxczxczcxasdasdasDDDDSASD.png',
       'HX-WRA-TRQ', 4, false, 50)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'water-repellent-apron'
on conflict (product_id, label) do nothing;

-- 6. What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Water Repellent Apron (colour as selected, size on quote)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'water-repellent-apron'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- 7. Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'Hammerex',                                              0),
    ('Brand',        'Product type',   'Water Repellent Apron',                                 1),
    ('Material',     'Body',           'Premium synthetic leather — water & oil resistant',    10),
    ('Material',     'Stitching',      'Heavy-duty reinforced stitching',                      11),
    ('Material',     'Fastening',      'Quick-release adjustable buckle',                      12),
    ('Capacity',     'Colours',        'Light Brown / Dark Brown / Black / Red / Turquoise',   20),
    ('Sizes',        'Standard',       '76 × 58 cm · neck tie 51 cm · waist belt 56 cm · front pocket 22 × 23 cm', 30),
    ('Sizes',        'Jumbo',          '105 × 58 cm · front pocket 30 × 30 cm · adjustable buckle',                31),
    ('Sizes',        'Pick size on',   'WhatsApp quote — let us know Standard or Jumbo',       32),
    ('Use',          'Ideal for',      'Cooking, BBQ, catering, butchers, bakers, coffee shops, workshops, cleaning', 40),
    ('Pricing',      'Per colour',     '£6.70 — same price across colours and sizes',          50),
    ('Stock',        'Availability',   'In stock — all colours',                               60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',            61),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',            62),
    ('Build & care', 'Made in',        'United Kingdom',                                        70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                        71)
  ) as v(g, l, val, s)
where p.slug = 'water-repellent-apron'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
