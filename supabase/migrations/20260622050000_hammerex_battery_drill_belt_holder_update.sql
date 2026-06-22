-- HX-BDBH-001 — Hammerex Battery Drill Belt Holder
-- Reprice to £39 (free UK / £10 EMS to other countries), swap hero + gallery
-- banners, update deal banners + recalc deal prices, populate description /
-- overview / features / specs / what-in-box.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single   = £39              = 929,000 IDR
--   buy 2 -10% = 2*929000*0.90  = 1,672,200 IDR
--   buy 3 -15% = 3*929000*0.85  = 2,369,000 IDR (rounded)

update public.hammerex_products
set price_idr = 929000,
    shipping_per_unit_idr = 0,
    image_url = 'https://ik.imagekit.io/9mrgsv2rp/Untitledsdfsdfdsdsdsd.png',
    description = $txt$Hammerex Battery Drill Belt Holder — premium leather holster with magnetic screw holder, drill bit + hex bit loops, deep one-handed drill retention, fits all standard work belts.$txt$,
    overview = $body$HAMMEREX Battery Drill Belt Holder

Keep your drill and accessories secure, organized, and always within reach with the **Hammerex Battery Drill Belt Holder**. Designed for professional tradespeople and serious DIY users, this heavy-duty holder provides a safe and convenient way to carry your cordless drill while working on site.

Manufactured from **durable leather with a reinforced solid inner core**, the holder is built to withstand demanding job site conditions while maintaining its shape and performance over time.

### Features

* **Universal Fit Design** — suitable for most cordless battery drills and impact drivers.
* **Integrated Magnetic Screw Holder** — convenient top-mounted magnet securely holds screws, fixings and small metal parts for quick access while working.
* **Multiple Drill Bit & Hex Bit Storage** — dedicated front storage loops keep drill bits, driver bits and hex bits organised and easily accessible.
* **Fits All Standard Belt Sizes** — designed to work with virtually all work belts and tool belts.
* **Secure Drill Retention** — deep holster design keeps your drill stable and secure while allowing quick one-handed access.
* **Heavy-Duty Construction** — premium leather construction with reinforced stitching and solid inner support for maximum durability.
* **Built for Professional Use** — ideal for construction workers, electricians, carpenters, scaffolders, roofers, plasterers, maintenance engineers and general tradespeople.

### Specifications

* Brand: Hammerex
* Material: Premium Leather
* Belt Compatibility: Fits all standard work belts
* Storage: Drill holder, magnetic screw holder, drill bit holders, hex bit holders
* Colour: Black with Yellow Stitching
* Application: Suitable for cordless drills and impact drivers

### Package Includes

1 × Hammerex Battery Drill Belt Holder

Designed for fast access, maximum durability, and all-day comfort on the job site.$body$,
    features = '[
      {"icon":"check","label":"Universal fit — most cordless drills + impact drivers"},
      {"icon":"check","label":"Integrated top-mounted magnetic screw holder"},
      {"icon":"check","label":"Front loops for drill bits + driver bits + hex bits"},
      {"icon":"check","label":"Fits all standard work belts"},
      {"icon":"check","label":"Deep holster — secure one-handed drill access"},
      {"icon":"check","label":"Premium leather with reinforced solid inner core"},
      {"icon":"check","label":"Black leather with signature yellow stitching"}
    ]'::jsonb,
    purchase_notes = '[
      "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
      "Drill shown for illustration — not included.",
      "Belt sold separately — holder fits all standard work belts.",
      "In stock — dispatched within 3 working days.",
      "Free delivery to the UK. £10 flat EMS air-freight to all other countries."
    ]'::jsonb
where sku = 'HX-BDBH-001';

-- Wipe old media + insert 2 new banners.
delete from public.hammerex_product_media
where product_id = (select id from public.hammerex_products where sku='HX-BDBH-001');

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, p.name || ' — banner ' || (v.s + 1), v.s
from public.hammerex_products p,
  (values
    ('https://ik.imagekit.io/9mrgsv2rp/Untitledsdfsdfdsdsdsd.png', 0),
    ('https://ik.imagekit.io/9mrgsv2rp/Untitleddsfsdfsdsdfdf.png', 1)
  ) as v(url, s)
where p.sku = 'HX-BDBH-001';

-- Update existing deal banners + recalc prices for the £39 base.
update public.hammerex_product_deals d
set banner_url='https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2008_31_50%20AM.png',
    price_idr = 1672200
from public.hammerex_products p
where d.product_id = p.id and p.sku='HX-BDBH-001' and d.qty=2;

update public.hammerex_product_deals d
set banner_url='https://ik.imagekit.io/9mrgsv2rp/Untitledsdfsdfsd.png',
    price_idr = 2369000
from public.hammerex_products p
where d.product_id = p.id and p.sku='HX-BDBH-001' and d.qty=3;

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Specifications', 'Brand',              'Hammerex',                                                 0),
    ('Specifications', 'Material',           'Premium leather with reinforced solid inner core',         1),
    ('Specifications', 'Colour',             'Black with yellow stitching',                              2),
    ('Specifications', 'Belt compatibility', 'Fits all standard work belts',                             3),
    ('Specifications', 'Storage',            'Drill holster · magnetic screw holder · drill + hex bit loops', 4),
    ('Specifications', 'Application',        'Cordless drills + impact drivers',                         5)
  ) as v(g, l, val, s)
where p.sku = 'HX-BDBH-001'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Battery Drill Belt Holder', 1, null, 0
from public.hammerex_products p
where p.sku = 'HX-BDBH-001'
and not exists (
  select 1 from public.hammerex_what_in_box w where w.product_id = p.id
);
