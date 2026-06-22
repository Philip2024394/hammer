-- Reprice 5 Trowel & Hawk Holder (HX-5TCH-001) to £38 per owner.
-- IDR canonical: £38 × 23,827 (src/lib/fx.ts) = 905,426 IDR. Stale
-- "Single unit" spec value bumped from £27.99 → £38.00 in the same
-- pass so the specs table stays consistent with the GBP column.

update public.hammerex_products
set price_idr = 905426
where sku = 'HX-5TCH-001';

update public.hammerex_product_specs
set value = '£38.00'
where label = 'Single unit'
  and product_id = (select id from public.hammerex_products where sku = 'HX-5TCH-001');
