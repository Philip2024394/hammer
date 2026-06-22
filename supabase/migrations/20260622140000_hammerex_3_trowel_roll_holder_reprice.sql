-- Reprice 3 Trowel Roll Holder (HX-3TRH-001) to £28 per owner.
-- IDR canonical: £28 × 23,827 (src/lib/fx.ts) = 667,156 IDR. Stale
-- "Single unit" spec value bumped from £22.00 → £28.00 in the same
-- pass so the specs table stays consistent with the GBP column.

update public.hammerex_products
set price_idr = 667156
where sku = 'HX-3TRH-001';

update public.hammerex_product_specs
set value = '£28.00'
where label = 'Single unit'
  and product_id = (select id from public.hammerex_products where sku = 'HX-3TRH-001');
