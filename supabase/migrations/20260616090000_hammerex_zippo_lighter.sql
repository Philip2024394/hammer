-- HAMMEREX UV-Printed Zippo Lighter — branded co-brand piece on the
-- genuine Zippo windproof platform. £48 GBP (Rp 960,000 @ 20k/£), 8-day
-- dispatch lead time (UV print + curing + QC). Lives in the
-- tobacco-wallets vertical so the lifestyle range stays segregated from
-- the trade-tools experience.
--
-- LEGAL NOTE FOR FUTURE MAINTAINERS: this listing relies on a real
-- relationship with Zippo Manufacturing Company (or an authorised
-- co-brand printer). Selling UV-printed Zippo lighters without that
-- authorisation is trademark infringement under Zippo's enforcement
-- policy. Confirm authorisation paperwork is on file before scaling
-- this SKU.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Hammerex UV-Printed Zippo Lighter',
  'Genuine Zippo windproof lighter with UV-printed Hammerex branding. Durable all-metal construction, reliable in all conditions, a collector''s piece for tradesmen.',
  960000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2016,%202026,%2008_52_08%20AM.png',
  false,
  'hammerex-zippo-lighter', 'HX-ZIP-001', 'Hammerex × Zippo', 'HX-ZIP', '14:00',
  null, 'Indonesia · Hammerex Official Distribution',
  E'A true American icon, now carrying the Hammerex name.\n\nBuilt on the legendary Zippo lighter platform, this premium lighter combines world-renowned reliability with the bold attitude of Hammerex. Featuring a high-quality **UV-printed Hammerex logo**, it''s designed for tradesmen, builders and hardworking individuals who take pride in the tools and gear they carry.\n\nWhether you''re on the job site, at camp or relaxing after a hard day''s work, the Hammerex Zippo makes a statement. Durable, windproof and instantly recognisable, it''s more than just a lighter — it''s a symbol of craftsmanship, resilience and pride.\n\n**Hammerex — The Brand That Makes a Statement on Every Job Site.**\n\n### Features\n\n* Genuine Zippo windproof lighter\n* Premium UV-printed Hammerex branding\n* Durable all-metal construction\n* Reliable performance in all conditions\n* A collector''s piece for tradesmen and Hammerex supporters\n\n**Carry the legend. Carry Hammerex.**',
  '[
    {"icon":"check","label":"Genuine Zippo windproof lighter"},
    {"icon":"check","label":"Premium UV-printed Hammerex branding"},
    {"icon":"check","label":"Durable all-metal construction"},
    {"icon":"check","label":"Windproof — reliable in all conditions"},
    {"icon":"check","label":"Collector''s piece"}
  ]'::jsonb,
  'GBP', 8, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Dispatch in 8 working days — UV-print, cure and QC each unit individually.",
    "In stock — dispatched within 8 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout.",
    "Lighter ships empty per international postal rules — fluid not included."
  ]'::jsonb,
  null, 'GENUINE ZIPPO · UV-PRINTED HAMMEREX', 203,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'tobacco-wallets'
and not exists (select 1 from public.hammerex_products where slug = 'hammerex-zippo-lighter');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2016,%202026,%2008_52_08%20AM.png',
  'Hammerex UV-Printed Zippo Lighter — genuine Zippo windproof platform, premium UV print',
  0
from public.hammerex_products p
where p.slug = 'hammerex-zippo-lighter'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Vertical-only listing — no trade cross-list.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug = 'hammerex-zippo-lighter' and c.slug = 'tobacco-wallets'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex × Zippo UV-Printed Lighter (empty)', 1, null, 0
from public.hammerex_products p
where p.slug = 'hammerex-zippo-lighter'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Platform',     'Base',           'Genuine Zippo windproof lighter',                    0),
    ('Platform',     'Construction',   'Durable all-metal body',                             1),
    ('Branding',     'Print method',   'Premium UV print (Hammerex logo)',                  10),
    ('Branding',     'Edition',        'Hammerex × Zippo co-brand',                         11),
    ('Performance',  'Wind',           'Windproof flame in all conditions',                  20),
    ('Performance',  'Service',        'Standard Zippo flint + wick service',                21),
    ('Pricing',      'Single unit',    '£48.00',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 8 working days (UV print + cure + QC)', 41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Shipping',     'Fluid',          'Ships empty per international postal rules',         43),
    ('Use',          'Built for',      'Tradesmen, builders, collectors, Hammerex supporters', 50),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       'Subject to Zippo manufacturer warranty',             61)
  ) as v(g, l, val, s)
where p.slug = 'hammerex-zippo-lighter'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
