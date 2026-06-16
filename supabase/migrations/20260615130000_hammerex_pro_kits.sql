-- Step 2 of the brand consolidation push (2026-06-15):
-- Five flagship "Pro Kit" bundle products. Each kit is a standalone
-- product row (so it shows like any other PDP, lands in the cart and
-- WhatsApp message naturally) — the bundle behaviour is encoded by
-- compare_at_idr = sum-of-singles, which surfaces the existing "−X%"
-- discount badge on the card automatically.
--
-- All five kits sit under £125 (duty-free entry to UK) and are sized
-- to give customers a meaningful "Save £X" on the singles total.

-- =========================================================
-- 1. Plasterer Pro Kit — £99.99 (singles £109.69, save £9.70)
-- =========================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, compare_at_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Plasterer Pro Kit',
  'The complete plasterer''s setup — Pro Backpack Plastering Trowel Bag + Trowel Wallet + Magnetic Trowel Belt Holder. Bundle saves £9.70 vs buying separately.',
  1999800, 2193700,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/22b848b905a646c1.png',
  true,
  'plasterer-pro-kit', 'HX-KIT-PLA-001', 'Hammerex', 'HX-KIT-PLA', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'## Plasterer Pro Kit — built around the Plastering Pro Backpack\n\nA curated three-piece setup designed by working plasterers. Save **£9.70** versus buying each item separately.\n\n### What''s in the kit\n\n* **Hammerex Pro Backpack Plastering Trowel Bag** — D600 water-resistant fabric, twin-lined, holds 3 trowels up to 18", dedicated plastering-board rear compartment (sold individually at £88.00)\n* **Hammerex Trowel Wallet** — premium leather wallet that protects your finishing trowel blade in the bag (sold individually at £9.99)\n* **Hammerex Magnetic Trowel Belt Holder** — keeps a trowel within instant reach on the belt during application (sold individually at £11.70)\n\n### Total bundle price\n\n* Singles total: **£109.69**\n* Pro Kit price: **£99.99**\n* You save: **£9.70**\n\nEvery item is the same product we sell individually — no downgrade. The kit is just a smart starting point for plasterers who want the complete setup on day one.\n\n*All Pro Kits stay under the £125 UK duty-free threshold.*',
  '[
    {"icon":"check","label":"Pro Backpack Plastering Trowel Bag"},
    {"icon":"check","label":"Trowel Wallet"},
    {"icon":"check","label":"Magnetic Trowel Belt Holder"},
    {"icon":"check","label":"Saves £9.70 vs buying separately"},
    {"icon":"check","label":"Designed for working plasterers"},
    {"icon":"check","label":"Stays under £125 — UK duty-free"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Add to cart in one tap — the three items ship together.",
    "Bundle saving £9.70 applied automatically vs singles.",
    "In stock — dispatched within 3 working days.",
    "International delivery quoted on request at checkout."
  ]'::jsonb,
  'PRO KIT', 'PLASTERER PRO KIT — SAVE £9.70', 70
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'plasterer-pro-kit');

-- =========================================================
-- 2. Drywall Pro Kit — £104.99 (singles £115.98, save £10.99)
-- =========================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, compare_at_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Drywall Pro Kit',
  'Drywall finisher''s setup — Drywall Pro Bag + Marker Belt Holder + Hammer & Pencil Belt Holder. Saves £10.99 vs buying separately.',
  2099800, 2319700,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/cddc2ad1108a7271.png',
  true,
  'drywall-pro-kit', 'HX-KIT-DRY-001', 'Hammerex', 'HX-KIT-DRY', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'## Drywall Pro Kit — built around the Drywall Pro Bag\n\nA curated three-piece setup designed for drywall finishers and tapers. Save **£10.99** versus buying each item separately.\n\n### What''s in the kit\n\n* **Hammerex Drywall Pro Bag** — D600 water-resistant, twin-lined, holds an 18" plastering trowel, 2 scrapers, mud pan, drywall board and hand tools (sold individually at £88.00)\n* **Hammerex Marker Belt Holder** — compact leather holder for the markers you live by on site (sold individually at £12.99)\n* **Hammerex Hammer & Pencil Belt Holder** — keeps a hammer on the belt with a four-pencil station (sold individually at £14.99)\n\n### Total bundle price\n\n* Singles total: **£115.98**\n* Pro Kit price: **£104.99**\n* You save: **£10.99**\n\nFull-spec versions of each item — no compromise on materials or stitching.\n\n*All Pro Kits stay under the £125 UK duty-free threshold.*',
  '[
    {"icon":"check","label":"Drywall Pro Bag"},
    {"icon":"check","label":"Marker Belt Holder"},
    {"icon":"check","label":"Hammer & Pencil Belt Holder"},
    {"icon":"check","label":"Saves £10.99 vs buying separately"},
    {"icon":"check","label":"Designed for drywall finishers and tapers"},
    {"icon":"check","label":"Stays under £125 — UK duty-free"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Add to cart in one tap — the three items ship together.",
    "Bundle saving £10.99 applied automatically vs singles.",
    "In stock — dispatched within 3 working days.",
    "International delivery quoted on request at checkout."
  ]'::jsonb,
  'PRO KIT', 'DRYWALL PRO KIT — SAVE £10.99', 71
from public.hammerex_categories c
where c.slug = 'drywall'
and not exists (select 1 from public.hammerex_products where slug = 'drywall-pro-kit');

-- =========================================================
-- 3. Scaffolder's Setup — £64.99 (singles £74.88, save £9.89)
-- =========================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, compare_at_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Scaffolder''s Setup',
  'Scaffolder''s four-piece kit — Scaffolder''s Tool Belt + Spanner Holder + Tool Lanyard + Hi-Vis Safety Glasses. Saves £9.89 vs buying separately.',
  1299800, 1497600,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/77fef2cc7719c2d7.png',
  true,
  'scaffolders-setup-kit', 'HX-KIT-SCA-001', 'Hammerex', 'HX-KIT-SCA', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'## Scaffolder''s Setup — the working scaffolder''s starter kit\n\nA four-piece kit covering the tool belt, the spanner holder, the lanyard and the PPE — everything a scaffolder needs to start a shift. Save **£9.89** versus buying each piece individually.\n\n### What''s in the kit\n\n* **Hammerex Scaffolder''s Tool Belt** — rivet-reinforced multi-holder belt with steel buckle, multi-hole adjustment (sold individually at £44.99)\n* **Hammerex Scaffolders Tilted Spanner Belt Holder** — premium leather drop-station with tilted entry for one-handed access (sold individually at £13.99)\n* **Hammerex Tool Lanyard 1.5m** — strong tether for working at height (sold individually at £8.00)\n* **Hammerex Hi-Visibility Safety Glasses** — impact-resistant lens (sold individually at £7.90)\n\n### Total bundle price\n\n* Singles total: **£74.88**\n* Setup price: **£64.99**\n* You save: **£9.89**\n\n*All Pro Kits stay under the £125 UK duty-free threshold.*',
  '[
    {"icon":"check","label":"Scaffolder''s Tool Belt"},
    {"icon":"check","label":"Scaffolders Tilted Spanner Belt Holder"},
    {"icon":"check","label":"Tool Lanyard 1.5m"},
    {"icon":"check","label":"Hi-Visibility Safety Glasses"},
    {"icon":"check","label":"Saves £9.89 vs buying separately"},
    {"icon":"check","label":"Stays under £125 — UK duty-free"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Add to cart in one tap — all four items ship together.",
    "Bundle saving £9.89 applied automatically vs singles.",
    "In stock — dispatched within 3 working days.",
    "International delivery quoted on request at checkout."
  ]'::jsonb,
  'PRO KIT', 'SCAFFOLDER''S SETUP — SAVE £9.89', 72
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-setup-kit');

-- =========================================================
-- 4. Carpenter Starter Pack — £39.99 (singles £45.78, save £5.79)
-- =========================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, compare_at_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Carpenter Starter Pack',
  'Carpenter''s belt essentials — Hammer & Pencil Holder + Marker Holder + Folding Cutter Knife + Tool Lanyard. Saves £5.79 vs buying separately.',
  799800, 915600,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/adsasdasdasdasdsadasddasdasdsasdqweqweadsasawdsdasdasdaasdaasdasdaasdasdasdasd.png',
  true,
  'carpenter-starter-pack', 'HX-KIT-CAR-001', 'Hammerex', 'HX-KIT-CAR', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'## Carpenter Starter Pack — load your belt the right way\n\nA four-piece belt-essentials kit. Save **£5.79** versus singles.\n\n### What''s in the kit\n\n* **Hammerex Hammer & Pencil Belt Holder** — hammer station with four-pencil holder (sold individually at £14.99)\n* **Hammerex Marker Belt Holder** — compact leather marker holder (sold individually at £12.99)\n* **Hammerex Folding Safety Cutter Knife** — 5 standard utility blades included, lanyard hole for height work (sold individually at £9.80)\n* **Hammerex Tool Lanyard 1.5m** — tether your knife or markers (sold individually at £8.00)\n\n### Total bundle price\n\n* Singles total: **£45.78**\n* Pack price: **£39.99**\n* You save: **£5.79**\n\n*All Pro Kits stay under the £125 UK duty-free threshold.*',
  '[
    {"icon":"check","label":"Hammer & Pencil Belt Holder"},
    {"icon":"check","label":"Marker Belt Holder"},
    {"icon":"check","label":"Folding Safety Cutter Knife (+ 5 blades)"},
    {"icon":"check","label":"Tool Lanyard 1.5m"},
    {"icon":"check","label":"Saves £5.79 vs buying separately"},
    {"icon":"check","label":"Stays under £125 — UK duty-free"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Add to cart in one tap — all four items ship together.",
    "Bundle saving £5.79 applied automatically vs singles.",
    "In stock — dispatched within 3 working days.",
    "International delivery quoted on request at checkout."
  ]'::jsonb,
  'PRO KIT', 'CARPENTER STARTER PACK — SAVE £5.79', 73
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'carpenter-starter-pack');

-- =========================================================
-- 5. Garden Starter Pack — £47.99 (singles £52.72, save £4.73)
-- =========================================================
insert into public.hammerex_products (
  category_id, name, description, price_idr, compare_at_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Garden Starter Pack',
  'Garden starter kit — Garden Tool Belt + Knee Pads + Garden Apron + Garden Waste Bag. Saves £4.73 vs buying separately.',
  959800, 1054400,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/00fe3bb0be46f1e0.png',
  true,
  'garden-starter-pack', 'HX-KIT-GAR-001', 'Hammerex', 'HX-KIT-GAR', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'## Garden Starter Pack — everything to kit out the new gardener\n\nA four-piece pack for the gardener, allotment-keeper or landscaper just getting properly equipped. Save **£4.73** versus singles.\n\n### What''s in the kit\n\n* **Hammerex Garden Tool Belt** — water-bottle holder + multi-pocket layout (sold individually at £14.99)\n* **Hammerex Garden Knee Pads** — high-density foam, water-resistant outer (sold individually at £14.99)\n* **Hammerex Garden Apron** — 1680D polyester with multiple pockets and utility loops (sold individually at £15.75)\n* **Hammerex Garden Waste Bag** — heavy-duty woven polypropylene (Square shape, sold individually at £6.99)\n\n### Total bundle price\n\n* Singles total: **£52.72**\n* Pack price: **£47.99**\n* You save: **£4.73**\n\n*All Pro Kits stay under the £125 UK duty-free threshold.*',
  '[
    {"icon":"check","label":"Garden Tool Belt"},
    {"icon":"check","label":"Garden Knee Pads"},
    {"icon":"check","label":"Garden Apron"},
    {"icon":"check","label":"Garden Waste Bag (Square)"},
    {"icon":"check","label":"Saves £4.73 vs buying separately"},
    {"icon":"check","label":"Stays under £125 — UK duty-free"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Add to cart in one tap — all four items ship together.",
    "Bundle saving £4.73 applied automatically vs singles.",
    "In stock — dispatched within 3 working days.",
    "International delivery quoted on request at checkout."
  ]'::jsonb,
  'PRO KIT', 'GARDEN STARTER PACK — SAVE £4.73', 74
from public.hammerex_categories c
where c.slug = 'landscaping'
and not exists (select 1 from public.hammerex_products where slug = 'garden-starter-pack');

-- =========================================================
-- Hero image + what's-in-box rows for every kit
-- =========================================================
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', p.image_url, p.name, 0
from public.hammerex_products p
where p.slug in ('plasterer-pro-kit', 'drywall-pro-kit', 'scaffolders-setup-kit', 'carpenter-starter-pack', 'garden-starter-pack')
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Plasterer Pro Kit — what's in box
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Pro Backpack Plastering Trowel Bag', 1, 0),
    ('Hammerex Trowel Wallet',                      1, 1),
    ('Hammerex Magnetic Trowel Belt Holder',        1, 2)
  ) as v(l, q, s)
where p.slug = 'plasterer-pro-kit'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Drywall Pro Kit — what's in box
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Drywall Pro Bag',                 1, 0),
    ('Hammerex Marker Belt Holder',              1, 1),
    ('Hammerex Hammer & Pencil Belt Holder',     1, 2)
  ) as v(l, q, s)
where p.slug = 'drywall-pro-kit'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Scaffolder's Setup — what's in box
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Scaffolder''s Tool Belt',                     1, 0),
    ('Hammerex Scaffolders Tilted Spanner Belt Holder',      1, 1),
    ('Hammerex Tool Lanyard 1.5m',                           1, 2),
    ('Hammerex Hi-Visibility Safety Glasses',                1, 3)
  ) as v(l, q, s)
where p.slug = 'scaffolders-setup-kit'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Carpenter Starter Pack — what's in box
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Hammer & Pencil Belt Holder',         1, 0),
    ('Hammerex Marker Belt Holder',                  1, 1),
    ('Hammerex Folding Safety Cutter Knife (+ 5 blades)', 1, 2),
    ('Hammerex Tool Lanyard 1.5m',                   1, 3)
  ) as v(l, q, s)
where p.slug = 'carpenter-starter-pack'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Garden Starter Pack — what's in box
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Garden Tool Belt',           1, 0),
    ('Hammerex Garden Knee Pads',           1, 1),
    ('Hammerex Garden Apron',               1, 2),
    ('Hammerex Garden Waste Bag (Square)',  1, 3)
  ) as v(l, q, s)
where p.slug = 'garden-starter-pack'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- =========================================================
-- Update ProPicks to use the kits instead of single flagships
-- =========================================================
-- Remove the old PRO PICK badges from individual products
update public.hammerex_products
  set badge_label = null
  where slug in ('drywall-pro-bag', 'plastering-pro-bag', 'scaffolders-tool-belt')
    and badge_label = 'PRO PICK';
