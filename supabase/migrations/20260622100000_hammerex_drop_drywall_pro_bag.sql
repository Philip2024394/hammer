-- Remove the Drywall Pro Bag (HX-DPB-001) per owner. Cascade clears
-- media, specs, what's-in-box, trade/category cross-links, variants,
-- bundle items, pair_with, deals and deal_breakers. Any compare_with
-- arrays that referenced this product are left intact (the column is
-- a uuid[]; verified empty at delete time via the management API).

delete from public.hammerex_products where sku = 'HX-DPB-001';
