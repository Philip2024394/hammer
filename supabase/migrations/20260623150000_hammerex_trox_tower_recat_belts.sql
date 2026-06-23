-- Move Scaffolders Belt TROX (HX-TRX-001) and Scaffolders Belt TOWER (HX-TWR-001)
-- from the scaffolding category to the belts category as their primary, so they
-- render on the /c/scaffolding "Belts" tab (which pulls by category) and not on
-- the "Products" tab. Their scaffolding cross-list entry is added so they still
-- surface under scaffolding-related listings via product_trades.

update public.hammerex_products
   set category_id = (select id from public.hammerex_categories where slug = 'belts')
 where slug in ('scaffolders-belt-trox', 'scaffolders-belt-tower');

-- Drop the now-redundant belts cross-list (their primary IS belts now)…
delete from public.hammerex_product_trades
 where category_id = (select id from public.hammerex_categories where slug = 'belts')
   and product_id in (
     select id from public.hammerex_products
      where slug in ('scaffolders-belt-trox', 'scaffolders-belt-tower')
   );

-- …and add a scaffolding cross-list so they remain discoverable from
-- scaffolding-trade browsing (non-primary, sort_order 2 to sit after belts+new-products).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 2
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug in ('scaffolders-belt-trox', 'scaffolders-belt-tower')
  and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;
