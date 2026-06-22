-- Reprice Measure Tape Belt Holder Slider (HX-MTBS-001) to £13.70 per
-- owner. IDR canonical: £13.70 × 23,827 (src/lib/fx.ts) = 326,430 IDR.
-- Stale "Single unit" spec value bumped from £12.99 → £13.70 in the
-- same pass so the specs table stays consistent with the GBP column.

update public.hammerex_products
set price_idr = 326430
where sku = 'HX-MTBS-001';

update public.hammerex_product_specs
set value = '£13.70'
where label = 'Single unit'
  and product_id = (select id from public.hammerex_products where sku = 'HX-MTBS-001');
