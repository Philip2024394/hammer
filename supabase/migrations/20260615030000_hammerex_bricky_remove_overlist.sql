-- BRICKY trowel stations were initially cross-listed to scaffolding +
-- concrete via hammerex_product_trades. Both products are explicitly built
-- for bricklayers and block layers in the source descriptions; scaffolders
-- and concrete workers aren't the target. Removing those two trade
-- cross-listings. The bricklaying primary, trowel-holders + belt-holders
-- (+ tape-holders for product 2) tool-type links are kept intact.

delete from public.hammerex_product_trades pt
using public.hammerex_products p, public.hammerex_categories c
where pt.product_id = p.id
  and pt.category_id = c.id
  and p.slug in ('bricky-magnet-trowel-station-walkie-talkie', 'bricky-magnet-trowel-station-tape-deck')
  and c.slug in ('scaffolding', 'concrete');
