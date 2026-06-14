-- Convert the Skimming Rule Sleeve from a single product with a `sizes` array
-- to a product with six per-size variants. Each variant carries its own SKU,
-- price and bag-length info. Linear pricing: £0.005 per mm of bag length.
--
--   Rule 600mm  → 650mm bag  → £12.99 / 259,800
--   Rule 800mm  → 850mm bag  → £13.99 / 279,800
--   Rule 900mm  → 950mm bag  → £14.49 / 289,800
--   Rule 1000mm → 1050mm bag → £14.99 / 299,800
--   Rule 1200mm → 1250mm bag → £15.99 / 319,800
--   Rule 1800mm → 1850mm bag → £19.00 / 380,000
--
-- All sizes in stock.

-- 1. Clear the simple sizes array (variants handle this now) and set the
--    parent product's default price to the 600mm bag price.
update public.hammerex_products
set sizes = null,
    price_idr = 259800,
    subtitle = 'SKIMMING RULE SLEEVE — CHOOSE BAG SIZE'
where slug = 'skimming-rule-sleeve';

-- 2. Six variants — 600mm default, all in stock.
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('Fits 600mm rule (650mm bag)',  'HX-SRS-600',  259800,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-650', 0, true,  120),
    ('Fits 800mm rule (850mm bag)',  'HX-SRS-800',  279800,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-850', 1, false, 110),
    ('Fits 900mm rule (950mm bag)',  'HX-SRS-900',  289800,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-950', 2, false, 100),
    ('Fits 1000mm rule (1050mm bag)','HX-SRS-1000', 299800,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-1050', 3, false,  95),
    ('Fits 1200mm rule (1250mm bag)','HX-SRS-1200', 319800,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-1250', 4, false,  80),
    ('Fits 1800mm rule (1850mm bag)','HX-SRS-1800', 380000,
       'https://ik.imagekit.io/pinky/Untitleddsadasdasdasdasdsfsdfsdf.png',
       'HX-SRS-1850', 5, false,  65)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'skimming-rule-sleeve'
on conflict (product_id, label) do nothing;

-- 3. Update purchase notes to remove the now-stale "Pick your rule length"
--    line that was tied to the old sizes array.
update public.hammerex_products
set purchase_notes = '[
  "Pick your skim-rule size above — each bag is sewn 50mm longer than the rule it carries.",
  "Compatible with Refina, NELA, Marshalltown and DeWalt skimming rules.",
  "Orders dispatched within 3 working days.",
  "UK delivery available — international shipping quoted on request."
]'::jsonb
where slug = 'skimming-rule-sleeve';

-- 4. Refresh the size-range spec line.
update public.hammerex_product_specs
set value = '600 / 800 / 900 / 1000 / 1200 / 1800 mm rules (bag is +50mm)'
where label = 'Rule lengths'
and product_id = (select id from public.hammerex_products where slug = 'skimming-rule-sleeve');
