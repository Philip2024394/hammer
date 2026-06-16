-- Reprice Garden Tool Backpack £39.99 → £79.00.
-- Reason: Hammerex positions this as the pro-tier garden carry above
-- entry storage (Bucket Organizer £24.99). Margin headroom to absorb
-- the £20 flat shipping on a 1.35 kg, 26 L item.

update public.hammerex_products
set price_idr = 1580000
where slug = 'garden-tool-backpack';

update public.hammerex_product_specs
set value = '£79.00'
where label = 'Single unit'
  and product_id = (select id from public.hammerex_products where slug = 'garden-tool-backpack');
