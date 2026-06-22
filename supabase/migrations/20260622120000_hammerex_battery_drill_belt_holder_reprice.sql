-- Reprice Battery Drill Belt Holder (HX-BDBH-001) to £23 per owner.
-- IDR canonical: £23 × 23,827 (src/lib/fx.ts) = 548,021 IDR, displays
-- as £23.00 in the GBP column. Stale "Single unit" spec row updated in
-- the same migration so the spec table doesn't keep saying £17.80.

update public.hammerex_products
set price_idr = 548021
where sku = 'HX-BDBH-001';

update public.hammerex_product_specs
set value = '£23.00'
where label = 'Single unit'
  and product_id = (select id from public.hammerex_products where sku = 'HX-BDBH-001');
