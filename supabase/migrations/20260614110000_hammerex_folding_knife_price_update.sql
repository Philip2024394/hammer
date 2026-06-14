-- HAMMEREX Folding Safety Cutting Knife — price update: £7.99 → £9.80
-- (159,800 IDR → 196,000 IDR at 20k/£). Bringing into line with the new
-- listing price used by the welcome-gift popup.

update public.hammerex_products
  set price_idr = 196000
  where slug = 'folding-safety-cutting-knife';

-- Refresh the price line in the specs table.
update public.hammerex_product_specs
  set value = '£9.80'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'folding-safety-cutting-knife');
