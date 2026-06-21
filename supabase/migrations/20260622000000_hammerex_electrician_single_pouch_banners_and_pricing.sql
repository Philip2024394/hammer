-- HX-ESP-001 — Electrician Single Pouch Belt Slide:
-- 1) Reprice to £46 (free UK delivery, £10 EMS to other countries).
--    shipping_per_unit_idr=0 → triggers the brand-wide "free UK / £10 other"
--    surcharge logic in BuyColumn.tsx (line 234+).
-- 2) Add two extra hero banners to the PDP gallery (sort_order 1 + 2; the
--    existing hero is already at sort_order 0).
-- 3) Add buy 2 / buy 3 multi-buy deal banners using the standard 10% / 15%
--    discount tiers already on the product.
--
-- Pricing math (matches scripts/apply-multibuy-everywhere.mjs convention):
--   single   = £46            = 1,096,000 IDR (rounded to nearest 1k)
--   qty=2  -10% = 2 × 1096000 × 0.90 = 1,972,800 IDR
--   qty=3  -15% = 3 × 1096000 × 0.85 = 2,794,800 IDR

update public.hammerex_products
set price_idr = 1096000,
    shipping_per_unit_idr = 0,
    purchase_notes = '[
      "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
      "Tools shown for illustration — not included.",
      "Belt sold separately — pouch slides onto any belt up to 6 cm wide.",
      "In stock — dispatched within 3 working days.",
      "Free delivery to the UK. £10 flat EMS air-freight to all other countries."
    ]'::jsonb
where sku = 'HX-ESP-001';

-- Refresh the Pricing + Shipping spec rows so they match the new pricing.
update public.hammerex_product_specs ps
set value = '£46.00'
from public.hammerex_products p
where ps.product_id = p.id
  and p.sku = 'HX-ESP-001'
  and ps.group_name = 'Pricing'
  and ps.label = 'Single unit';

update public.hammerex_product_specs ps
set group_name = 'Shipping', label = 'Worldwide',
    value = 'Free to UK · £10 EMS air-freight to all other countries'
from public.hammerex_products p
where ps.product_id = p.id
  and p.sku = 'HX-ESP-001'
  and ps.label = 'Shipping';

-- Extra gallery banners (sort_order 1 + 2; hero already at 0).
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_46_40%20AM.png',
  p.name || ' — banner 2', 1
from public.hammerex_products p
where p.sku = 'HX-ESP-001'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id
    and m.url = 'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_46_40%20AM.png'
);

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_16_15%20AM.png',
  p.name || ' — banner 3', 2
from public.hammerex_products p
where p.sku = 'HX-ESP-001'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id
    and m.url = 'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_16_15%20AM.png'
);

-- Multi-buy deals — banner swaps the gallery image when the deal button is tapped.
insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 0, 'Deal 1', 2, 'Buy 2 ' || p.name, 1972800,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_49_55%20AM.png',
  null, null
from public.hammerex_products p
where p.sku = 'HX-ESP-001'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = 2
);

insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 1, 'Deal 2', 3, 'Buy 3 ' || p.name, 2794800,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_51_08%20AM.png',
  null, null
from public.hammerex_products p
where p.sku = 'HX-ESP-001'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = 3
);
