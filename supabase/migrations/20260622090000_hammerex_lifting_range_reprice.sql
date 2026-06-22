-- Reprice the three lifting-bags-range variants (and the parent fallback
-- price) per owner's GBP targets — 30kg bag £20, 50kg bag £23, 50kg
-- bucket £34. IDR is canonical; values derived from src/lib/fx.ts
-- (1 GBP = 23,827 IDR, verified 2026-06-17) so the customer-facing GBP
-- column renders the requested whole-pound figures.

update public.hammerex_product_variants
set price_idr = 476540
where label = '30kg Lifting Bag'
  and product_id = (select id from public.hammerex_products where slug = 'lifting-bags-range');

update public.hammerex_product_variants
set price_idr = 548021
where label = '50kg Lifting Bag'
  and product_id = (select id from public.hammerex_products where slug = 'lifting-bags-range');

update public.hammerex_product_variants
set price_idr = 810118
where label = '50kg Lifting Bucket'
  and product_id = (select id from public.hammerex_products where slug = 'lifting-bags-range');

-- Parent fallback price tracks the default (30kg) variant so SEO and
-- pre-selection PDP renders show £20 instead of the old £15 figure.
update public.hammerex_products
set price_idr = 476540
where slug = 'lifting-bags-range';
