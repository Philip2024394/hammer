-- HAMMEREX Insulated Worker Lunch Bag — confirm price at £23.00
-- (460,000 IDR @ 20k/£). Replaces the placeholder 0 set in 20260614170000.

update public.hammerex_products
  set price_idr = 460000
  where slug = 'insulated-worker-lunch-bag';

update public.hammerex_product_specs
  set value = '£23.00'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'insulated-worker-lunch-bag');
