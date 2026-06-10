-- Design refresh — match the home-page mockup:
-- yellow-banner section headers, 6 trade categories, 3 design products
-- with BEST-SELLER style cards (badge, subtitle, feature checklist).

alter table public.hammerex_products
  add column if not exists badge_label text,
  add column if not exists subtitle text,
  add column if not exists home_sort_order integer default 100;

-- Six trade-specific categories per the design.
insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('trowel-holders',            'Trowel Holders',             null, 200),
  ('tool-bags-backpacks',       'Tool Bags & Backpacks',      null, 201),
  ('hawk-holders',              'Hawk Holders',               null, 202),
  ('drywall-accessories',       'Drywall Accessories',        null, 203),
  ('professional-tool-storage', 'Professional Tool Storage',  null, 204),
  ('new-products',              'New Products',               null, 205)
on conflict (slug) do nothing;

-- Product 1: 5 Trowel Carry Holder — BEST SELLER, £49
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features, stock_count,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  '5 Trowel Carry Holder',
  '5-trowel + hawk-storage carrier — twin-layer construction.',
  980000,
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  true,
  '5-trowel-carry-holder', 'HX-5TCH-001', 'Hammerex', 'HX-5TCH', 0.8, '14:00',
  1, 'United Kingdom',
  'Carry up to five trowels plus a hawk in one rugged twin-layer carrier. Built for taper pros who don''t want to swap belts mid-job.',
  '[
    {"icon":"check","label":"Holds up to 5 trowels"},
    {"icon":"check","label":"Fits trowels up to 18\" × 5\""},
    {"icon":"check","label":"Rear hawk storage up to 16\""},
    {"icon":"check","label":"Lightweight & durable twin-layer construction"}
  ]'::jsonb,
  25, 'GBP', 3, true,
  '["Belt not included — must be ordered separately.","Orders dispatched within 3 working days.","Delivery is quoted at checkout — sea or air, your choice."]'::jsonb,
  'BEST SELLER', '+ HAWK STORAGE', 1
from public.hammerex_categories c
where c.slug = 'trowel-holders'
and not exists (select 1 from public.hammerex_products where slug = '5-trowel-carry-holder');

-- Product 2: Taper's Trowel & Pan Backpack — £89
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features, stock_count,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  E'Taper\'s Trowel & Pan Backpack',
  E'Professional taper''s backpack with stainless mud-pan storage.',
  1780000,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  true,
  'tapers-trowel-pan-backpack', 'HX-TTPB-001', 'Hammerex', 'HX-TTPB', 1.8, '14:00',
  1, 'United Kingdom',
  E'Job-site backpack designed for tapers. Padded adjustable straps, stainless mud-pan compartment, dedicated tool sleeves throughout.',
  '[
    {"icon":"check","label":"Professional backpack design"},
    {"icon":"check","label":"Stainless steel mud pan storage"},
    {"icon":"check","label":"Multiple tool compartments"},
    {"icon":"check","label":"Comfortable & adjustable padded straps"}
  ]'::jsonb,
  18, 'GBP', 3, true,
  '["Mud pan included.","Orders dispatched within 3 working days.","Delivery is quoted at checkout — sea or air, your choice."]'::jsonb,
  null, E'TAPER\'S RIG', 2
from public.hammerex_categories c
where c.slug = 'tool-bags-backpacks'
and not exists (select 1 from public.hammerex_products where slug = 'tapers-trowel-pan-backpack');

-- Product 3: Hammerex Professional Hawk Carrier — £39
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, weight_kg, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features, stock_count,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Professional Hawk Carrier',
  'Hawk holster with positive retention system, fits up to 16".',
  780000,
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  true,
  'hammerex-pro-hawk-carrier', 'HX-PHC-001', 'Hammerex', 'HX-PHC', 0.5, '14:00',
  1, 'United Kingdom',
  'Pro hawk carrier with positive retention system. Fits hawks up to 16". Twin-layer construction stands up to daily site work.',
  '[
    {"icon":"check","label":"Secure hawk retention system"},
    {"icon":"check","label":"Fits hawks up to 16\""},
    {"icon":"check","label":"Lightweight & durable"},
    {"icon":"check","label":"Twin-layer construction"}
  ]'::jsonb,
  22, 'GBP', 3, true,
  '["Belt not included — must be ordered separately.","Orders dispatched within 3 working days.","Delivery is quoted at checkout — sea or air, your choice."]'::jsonb,
  null, 'PROFESSIONAL HAWK CARRIER', 3
from public.hammerex_categories c
where c.slug = 'hawk-holders'
and not exists (select 1 from public.hammerex_products where slug = 'hammerex-pro-hawk-carrier');
