-- HAMMEREX Measure Tape Pro Holder — set confirmed/extrapolated prices.
--   5m  = £13.00 → 260,000 IDR (user-confirmed)
--   8m  = £14.19 → 283,800 IDR (linear, £0.398/m between confirmed sizes)
--   10m = £14.99 → 299,800 IDR (user-confirmed)
-- Parent product.price_idr is aligned to the default variant (5m = £13.00).
-- The "Per size / Pricing" spec line is replaced with a concrete breakdown.

update public.hammerex_product_variants
  set price_idr = case sku
    when 'HX-MTP-5M'  then 260000
    when 'HX-MTP-8M'  then 283800
    when 'HX-MTP-10M' then 299800
    else price_idr
  end
where product_id = (select id from public.hammerex_products where slug = 'measure-tape-pro-holder')
  and sku in ('HX-MTP-5M','HX-MTP-8M','HX-MTP-10M');

update public.hammerex_products
  set price_idr = 260000
  where slug = 'measure-tape-pro-holder';

-- Replace the old "Per size / Price set per size at the size picker above"
-- spec with concrete per-size prices.
delete from public.hammerex_product_specs
where product_id = (select id from public.hammerex_products where slug = 'measure-tape-pro-holder')
  and group_name = 'Pricing'
  and label = 'Per size';

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Pricing', '5 Meter',  '£13.00', 50),
    ('Pricing', '8 Meter',  '£14.19', 51),
    ('Pricing', '10 Meter', '£14.99', 52)
  ) as v(g, l, val, s)
where p.slug = 'measure-tape-pro-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
