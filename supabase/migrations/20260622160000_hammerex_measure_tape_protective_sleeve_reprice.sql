-- Reprice Measure Tape Belt Holder with Protective Sleeve (HX-MTPS-001)
-- to £19.40 per owner. IDR canonical: £19.40 × 23,827 (src/lib/fx.ts) =
-- 462,244 IDR. Three length variants (5/8/10m) all carried the same
-- price, so they move in lockstep — and the parent fallback price moves
-- with them so SEO and pre-selection PDP renders match.

update public.hammerex_product_variants
set price_idr = 462244
where product_id = (select id from public.hammerex_products where sku = 'HX-MTPS-001');

update public.hammerex_products
set price_idr = 462244
where sku = 'HX-MTPS-001';
