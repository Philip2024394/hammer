-- Standard Hammerex multi-buy (Buy 2 = -10%, Buy 3 = -15%) for the
-- ForgeX 7-Station Scaffolder's Belt. The brand-wide script at
-- scripts/apply-multibuy-everywhere.mjs applies this to every product
-- with an image; Forgex was inserted after the last run so it has no
-- qty_discount_tiers and no rows in hammerex_product_deals.
--
-- Pricing math (matches the script):
--   qty=2 → floor(1167500 * 2 * 0.90 / 100) * 100 = 2,101,500 IDR
--   qty=3 → floor(1167500 * 3 * 0.85 / 100) * 100 = 2,977,100 IDR

update public.hammerex_products
set qty_discount_tiers = '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb
where sku = 'HX-FX7-001';

insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 0, 'Deal 1', 2, 'Buy 2 ' || p.name, 2101500, p.image_url, '?', null
from public.hammerex_products p where p.sku = 'HX-FX7-001'
union all
select p.id, 1, 'Deal 2', 3, 'Buy 3 ' || p.name, 2977100, p.image_url, '??', null
from public.hammerex_products p where p.sku = 'HX-FX7-001';
