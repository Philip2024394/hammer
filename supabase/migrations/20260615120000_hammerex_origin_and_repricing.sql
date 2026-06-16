-- Step 1 of the brand consolidation push (2026-06-15):
--   1) Country-of-origin sweep — replace every "United Kingdom" mention
--      with "Indonesia · Hammerex Official Distribution" (the real
--      manufacturing setup). Honest country claim is non-negotiable under
--      UK Trading Standards and saves us from a CMA complaint.
--   2) Repricing — align prices with eBay.co.uk-equivalent products
--      while leaving the flagships (Drywall Pro Bag / Plastering Pro Bag)
--      where they are. Small items absorb a slice of air-freight recovery.

-- =========================================================
-- 1. Country of origin sweep
-- =========================================================

update public.hammerex_products
  set country_of_assembly = 'Indonesia · Hammerex Official Distribution'
  where country_of_assembly = 'United Kingdom';

update public.hammerex_product_specs
  set value = 'Indonesia · Hammerex Official Distribution'
  where value = 'United Kingdom';

-- Update the brand metadata on products that misleadingly stamped
-- "Made in United Kingdom" inside their overview prose. We can't fix the
-- middle of the long-form copy here (per-product migration text is too
-- variable to scan); the spec table + country_of_assembly is the binding
-- canonical claim, so update them. PDP authors should sweep overview
-- prose in a future pass.

-- =========================================================
-- 2. Repricing
-- =========================================================

-- Scaffolder's Tool Belt: £17.99 -> £44.99 (was deeply under UK market)
update public.hammerex_products
  set price_idr = 899800
  where slug = 'scaffolders-tool-belt';
update public.hammerex_product_specs
  set value = '£44.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'scaffolders-tool-belt');

-- Garden Waste Bags: £2 each -> £6.99 each (both Square / Round variants)
update public.hammerex_products
  set price_idr = 139800
  where slug = 'garden-waste-bags-compact';
update public.hammerex_product_variants
  set price_idr = 139800
  where sku in ('HX-GWB-CP-SQ', 'HX-GWB-CP-RD');
update public.hammerex_product_specs
  set value = '£6.99 — Square and Round priced the same'
  where label = 'Per bag'
    and product_id = (select id from public.hammerex_products where slug = 'garden-waste-bags-compact');

-- Slim Measure Tape Belt Holder: £6.99 -> £8.99
update public.hammerex_products
  set price_idr = 179800
  where slug = 'slim-measure-tape-belt-holder';
update public.hammerex_product_specs
  set value = '£8.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'slim-measure-tape-belt-holder');

-- Bucket Trowel: £7.99 -> £9.99
update public.hammerex_products
  set price_idr = 199800
  where slug = 'bucket-trowel';
update public.hammerex_product_specs
  set value = '£9.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'bucket-trowel');

-- Marker Belt Holder: £10.99 -> £12.99
update public.hammerex_products
  set price_idr = 259800
  where slug = 'marker-belt-holder';
update public.hammerex_product_specs
  set value = '£12.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'marker-belt-holder');

-- Garden Tool Belt (was 'standard'): £13.70 -> £14.99
update public.hammerex_products
  set price_idr = 299800
  where slug = 'garden-tool-belt-standard';
update public.hammerex_product_specs
  set value = '£14.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'garden-tool-belt-standard');

-- Garden Knee Pads: £14.65 -> £14.99
update public.hammerex_products
  set price_idr = 299800
  where slug = 'garden-knee-pads';
update public.hammerex_product_specs
  set value = '£14.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'garden-knee-pads');

-- Phone Belt Case: £19.99 -> £17.99 (DROP — get into easy-buy territory)
update public.hammerex_products
  set price_idr = 359800
  where slug = 'phone-belt-case';
update public.hammerex_product_variants
  set price_idr = 359800
  where product_id = (select id from public.hammerex_products where slug = 'phone-belt-case');
update public.hammerex_product_specs
  set value = '£17.99 — same price across all four sizes'
  where label = 'Per size'
    and product_id = (select id from public.hammerex_products where slug = 'phone-belt-case');

-- Insulated Worker Lunch Bag: £23.00 -> £24.99
update public.hammerex_products
  set price_idr = 499800
  where slug = 'insulated-worker-lunch-bag';
update public.hammerex_product_specs
  set value = '£24.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'insulated-worker-lunch-bag');

-- BRICKY Magnet Trowel Station + Walkie Talkie Deck: £26.00 -> £29.99
update public.hammerex_products
  set price_idr = 599800
  where slug = 'bricky-magnet-trowel-station-walkie-talkie';
update public.hammerex_product_specs
  set value = '£29.99'
  where label = 'Single unit'
    and product_id = (select id from public.hammerex_products where slug = 'bricky-magnet-trowel-station-walkie-talkie');
