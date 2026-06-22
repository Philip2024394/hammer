-- HX-BDH-002 — Hammerex Battery Drill Holder (adjustable drop-in cradle)
-- Distinct product from HX-BDBH-001 (leather pouch-style belt holder). This
-- one is the adjustable drop-in cradle that fits compact + full-size drills,
-- left or right hand, belts up to 4" wide.
--
-- Primary category: drill-holders. shipping_per_unit_idr=0 triggers the
-- brand-wide free-UK / £10-other surcharge logic in BuyColumn.tsx.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single   = £47               = 1,120,000 IDR
--   buy 2 -10% = 2*1120000*0.90  = 2,016,000 IDR

insert into public.hammerex_products (
  category_id, name, description, overview,
  price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly,
  base_currency, dispatch_lead_days, delivery_quote_only,
  shipping_per_unit_idr,
  features, purchase_notes,
  subtitle, badge_label, home_sort_order,
  qty_discount_tiers, compare_with
)
select c.id,
  'Hammerex Battery Drill Holder',
  $txt$Adjustable drop-in battery drill holster — fits compact to full-size drills, customisable handle position for stability, suits left or right-hand use, fits belts up to 4" wide.$txt$,
  $body$The **HAMMEREX Battery Drill Belt Holder** is designed to keep your drill secure, accessible, and ready for action at all times. Built for tradespeople who demand efficiency on-site, this holder allows you to simply drop your drill into place and continue working without the hassle of setting tools down or searching for them later.

Its **adjustable design** accommodates compact, standard and larger battery drills, making it one of the most versatile drill holders available. The **handle position can be adjusted** to suit different drill styles, reducing unwanted movement, handle shake and drill tilt while you work.

### Features

* Fast drop-in design for quick drill access
* Adjustable to suit compact and full-size battery drills
* Customizable handle positioning for improved stability
* Reduces drill movement and unwanted tilting
* Heavy-duty construction built for jobsite use
* Fits most tool belts from narrow belts up to 4" wide
* Suitable for left or right-hand use

Whether you're climbing ladders, working on scaffolding, roofing, framing or general construction, the HAMMEREX Battery Drill Belt Holder keeps your drill exactly where you need it — secure, accessible and ready for the next task.

**Work smarter. Carry safer. Keep your drill within reach with HAMMEREX.**$body$,
  1120000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2008_44_54%20AM.png',
  true,
  'hammerex-battery-drill-holder', 'HX-BDH-002', 'Hammerex', 'HX-BDH', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  'GBP', 3, false,
  0,
  '[
    {"icon":"check","label":"Fast drop-in design for quick drill access"},
    {"icon":"check","label":"Adjustable for compact and full-size battery drills"},
    {"icon":"check","label":"Customisable handle positioning for stability"},
    {"icon":"check","label":"Reduces drill movement and unwanted tilting"},
    {"icon":"check","label":"Heavy-duty jobsite construction"},
    {"icon":"check","label":"Fits tool belts up to 4 inch (102 mm) wide"},
    {"icon":"check","label":"Suitable for left or right-hand use"}
  ]'::jsonb,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Drill shown for illustration — not included.",
    "Belt sold separately — fits most belts up to 4 inches wide.",
    "In stock — dispatched within 3 working days.",
    "Free delivery to the UK. £10 flat EMS air-freight to all other countries."
  ]'::jsonb,
  'ADJUSTABLE DROP-IN · LEFT OR RIGHT HAND', null, 38,
  '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb,
  ARRAY['battery-drill-belt-holder','drill-carry-pouch']
from public.hammerex_categories c
where c.slug = 'drill-holders'
and not exists (select 1 from public.hammerex_products where slug = 'hammerex-battery-drill-holder');

-- Hero banner.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2008_44_54%20AM.png',
  p.name || ' — hero', 0
from public.hammerex_products p
where p.slug = 'hammerex-battery-drill-holder'
and not exists (
  select 1 from public.hammerex_product_media m where m.product_id = p.id
);

-- Buy 2 deal banner (no Buy 3 banner supplied — auto -15% tier still kicks
-- in at qty=3 via qty_discount_tiers, just no promotional banner for it).
insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 0, 'Deal 1', 2, 'Buy 2 ' || p.name, 2016000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2008_54_08%20AM.png',
  null, null
from public.hammerex_products p
where p.slug = 'hammerex-battery-drill-holder'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = 2
);

-- Cross-list to trades the listing fits.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('drill-holders', 0),
    ('electrical', 1),
    ('carpentry', 2),
    ('hvac', 3),
    ('tool-bags-backpacks', 4),
    ('new-products', 5)
  ) as v(slug, s)
where p.slug = 'hammerex-battery-drill-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;
