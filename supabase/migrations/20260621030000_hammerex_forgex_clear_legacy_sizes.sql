-- The ForgeX 7-Station belt was inserted with product.sizes populated
-- (32"-48"), but those exact waist sizes are already served by the
-- BeltSizeSelector via the beltSizingFor() lib config. Result: two size
-- pickers rendered on the PDP (collapsible dropdown at top, pills at
-- bottom).
--
-- The belt-sizing lib is the canonical source for wearable belts, so we
-- clear the legacy column on this product. Other belt-bearing products
-- already have sizes=[] for the same reason.

update public.hammerex_products
set sizes = '[]'::jsonb
where sku = 'HX-FX7-001';
