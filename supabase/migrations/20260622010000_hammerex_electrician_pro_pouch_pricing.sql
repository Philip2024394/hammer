-- HX-EPP-001 — Electrician Pro Pouch (belt-mount):
-- Reprice to £49 (free UK delivery, £10 EMS to other countries).
-- shipping_per_unit_idr = 0 → triggers brand-wide "free UK / £10 other"
-- surcharge logic in BuyColumn.tsx (line 246+). Same pattern used for
-- HX-ESP-001 in migration 20260622000000.
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single  = £49  = 1,168,000 IDR

update public.hammerex_products
set price_idr = 1168000,
    shipping_per_unit_idr = 0,
    purchase_notes = '[
      "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
      "Tools shown for illustration — not included.",
      "Belt sold separately — pouch fits any standard tool belt up to 3 inches wide.",
      "In stock — dispatched within 3 working days.",
      "Free delivery to the UK. £10 flat EMS air-freight to all other countries."
    ]'::jsonb
where sku = 'HX-EPP-001';

-- Pricing spec row.
update public.hammerex_product_specs ps
set value = '£49.00'
from public.hammerex_products p
where ps.product_id = p.id
  and p.sku = 'HX-EPP-001'
  and ps.group_name = 'Pricing'
  and ps.label = 'Single unit';

-- Shipping spec row — old row was group_name='UK / USA / AU', label='Shipping'.
update public.hammerex_product_specs ps
set group_name = 'Shipping', label = 'Worldwide',
    value = 'Free to UK · £10 EMS air-freight to all other countries'
from public.hammerex_products p
where ps.product_id = p.id
  and p.sku = 'HX-EPP-001'
  and ps.label = 'Shipping';
