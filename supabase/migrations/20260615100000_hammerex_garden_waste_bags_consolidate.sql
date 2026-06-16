-- Correction: there is ONE Garden Waste Bags product at £2 with two size
-- variants (Square / Round), not two separate products. The earlier batch
-- migration mistakenly split it into a £16.99 "Heavy Duty" and a £2
-- "Compact". Consolidating:
--   - Delete the £16.99 Heavy Duty product entirely (cascade-deletes its
--     variants, media, specs, what_in_box rows).
--   - Rename the £2 Compact product to the canonical "Garden Waste Bags"
--     (slug stays `garden-waste-bags-compact` to keep external links stable —
--     no SEO benefit to flipping the slug back).

delete from public.hammerex_products where slug = 'garden-waste-bags-heavy-duty';

update public.hammerex_products
  set name = 'Hammerex Garden Waste Bags',
      description = 'Heavy-duty reusable woven polypropylene garden waste bags — choose Square (150L) or Round (95L). Reinforced webbing handles, water-resistant. £2 each.',
      subtitle = 'GARDEN WASTE BAGS — £2 EACH (CHOOSE SHAPE)'
where slug = 'garden-waste-bags-compact';

-- Update the variant labels and the "Edition" spec to match the merged
-- (single-product) state — restore the proper capacity numbers so customers
-- see the real Square / Round sizes.
update public.hammerex_product_variants
  set label = 'Square — 71 × 38 × 57 cm · ~150L'
where sku = 'HX-GWB-CP-SQ';
update public.hammerex_product_variants
  set label = 'Round — 45cm dia × 60cm · ~95L'
where sku = 'HX-GWB-CP-RD';

delete from public.hammerex_product_specs
where product_id = (select id from public.hammerex_products where slug = 'garden-waste-bags-compact')
  and group_name = 'Brand'
  and label = 'Edition';
