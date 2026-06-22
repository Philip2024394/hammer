-- HX-SA7-001 — Scaffolders Apex 7 Station Tool Belt
-- Sibling to HX-FX7-001 (ForgeX 7 Station Scaffolder's Belt). Primary
-- trade category: scaffolding (mirrors HX-FX7-001 placement).
-- shipping_per_unit_idr=0 triggers free-UK / £10-other surcharge logic.
--
-- Note: source copy used the brand label "Scaffolders Belt Max" — replaced
-- here with "Scaffolders Apex 7 Station Tool Belt" so the body matches the
-- product name buyers see.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single   = £48              = 1,144,000 IDR
--   buy 2 -10% = 2*1144000*0.90 = 2,059,200 IDR
--   buy 3 -15% = 3*1144000*0.85 = 2,917,000 IDR (auto-discount, no banner)

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
  'Scaffolders Apex 7 Station Tool Belt',
  $txt$Heavy-duty 7-station scaffolders belt — spring-loaded tape deck (up to 8 m tape), bolt-fixed metal hammer loop, curved single-bubble-level holder, three Frog metal-edge tool holders.$txt$,
  $body$Built for professionals who demand durability, efficiency, and reliability on every job.

The **Scaffolders Apex 7 Station Tool Belt** is truly the master of the scaffolding game. This compact yet feature-packed belt system ticks every box, combining rugged construction with practical tool organisation to keep you working faster and smarter at height.

At the heart of the system is the innovative **spring-loaded tape holder deck**, designed to securely lock in tape measures up to **8 metres** in length. A simple push releases the tape instantly, providing quick access when every second counts.

The integrated **metal hammer loop** is securely bolt-fixed to the tape deck, allowing your hammer to drop effortlessly into position while remaining safely within reach throughout the workday.

A specially designed **curved level holder** is also included, engineered to firmly secure your **single bubble level** while keeping it instantly accessible. The shaped design prevents movement during work, ensuring your level stays safely in place when climbing, erecting, and dismantling scaffolding.

For maximum durability, the belt includes **three additional Frog metal-edge tool holders** — a combination of double and single holders engineered to withstand the toughest site conditions. Reinforced metal edging protects against wear and tear, ensuring long-lasting performance where ordinary holders fail.

### Features

* Heavy-duty scaffolders belt system
* Spring-loaded tape holder deck
* Securely holds tape measures up to 8 metres
* Quick-release tape mechanism
* Integrated metal hammer loop
* Curved holder for single bubble levels
* Three additional Frog metal-edge tool holders
* Combination of single and double holders
* Reinforced metal-edge construction
* Built for maximum durability and daily site use
* Fully adjustable belt fits all waist sizes
* Custom thread colour options available on request

Whether you're erecting, dismantling, or inspecting scaffolding, the **Scaffolders Apex 7 Station Tool Belt** delivers the strength, convenience, and professional-grade performance you need to stay organised and productive on site.$body$,
  1144000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdsdfdfsdasdsdsdasd.png',
  true,
  'scaffolders-apex-7-station-tool-belt', 'HX-SA7-001', 'Hammerex', 'HX-SA7', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  'GBP', 3, false,
  0,
  '[
    {"icon":"check","label":"Heavy-duty 7-station scaffolders belt system"},
    {"icon":"check","label":"Spring-loaded tape holder deck — up to 8 m tapes"},
    {"icon":"check","label":"Quick-release tape mechanism"},
    {"icon":"check","label":"Integrated bolt-fixed metal hammer loop"},
    {"icon":"check","label":"Curved single-bubble-level holder"},
    {"icon":"check","label":"Three Frog metal-edge tool holders (single + double)"},
    {"icon":"check","label":"Reinforced metal-edge construction"},
    {"icon":"check","label":"Fully adjustable belt — fits all waist sizes"},
    {"icon":"check","label":"Custom thread colour available on request"}
  ]'::jsonb,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Free UK delivery — £10 flat to all other countries."
  ]'::jsonb,
  'SCAFFOLDERS · 7-STATION TOOL BELT', null, 36,
  '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb,
  ARRAY['forgex-7-station-scaffolders-belt','scaffolders-tool-belt']
from public.hammerex_categories c
where c.slug = 'scaffolding'
and not exists (select 1 from public.hammerex_products where slug = 'scaffolders-apex-7-station-tool-belt');

-- 2 banners.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, p.name || ' — banner ' || (v.s + 1), v.s
from public.hammerex_products p,
  (values
    ('https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdsdfdfsdasdsdsdasd.png', 0),
    ('https://ik.imagekit.io/9mrgsv2rp/Untitledsdfsdfdsdsdsddasd.png',         1)
  ) as v(url, s)
where p.slug = 'scaffolders-apex-7-station-tool-belt'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id and m.url = v.url
);

-- Cross-list to belts + new-products (mirrors HX-FX7-001 visibility surfaces).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('belts', 0),
    ('new-products', 1)
  ) as v(slug, s)
where p.slug = 'scaffolders-apex-7-station-tool-belt' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;
