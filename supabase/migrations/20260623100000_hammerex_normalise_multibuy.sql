-- Normalise multi-buy pricing across the whole catalogue. Canonical rule
-- per owner: buy 2 → 10% off, buy 3 → 15% off. Anything else (4-tier
-- ladders, 5%/10% outliers, stale deal totals from before repricing) is
-- a bug.
--
-- Two fixes:
--   1. `qty_discount_tiers` JSONB: every non-empty array becomes the
--      canonical [{min:2,pct:10},{min:3,pct:15}]. Empty arrays stay
--      empty (those products are intentionally opted out of multi-buy).
--   2. `hammerex_product_deals.price_idr` is recomputed from the
--      current parent product price + the canonical 10/15 discount
--      for qty in (2,3). Without this, deal totals show stale percent
--      ages (or, in some cases, negative ones) on the PDP.

-- 1. Normalise the qty_discount_tiers column on every non-empty row.
update public.hammerex_products
set qty_discount_tiers = '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb
where qty_discount_tiers is not null
  and jsonb_array_length(qty_discount_tiers) > 0
  and qty_discount_tiers <> '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb;

-- 2. Recompute deal totals from the current unit price.
update public.hammerex_product_deals d
set price_idr = case d.qty
  when 2 then round(p.price_idr * 2 * 0.90)::integer
  when 3 then round(p.price_idr * 3 * 0.85)::integer
  else d.price_idr
end
from public.hammerex_products p
where d.product_id = p.id
  and d.qty in (2, 3);
