-- Strip every customer-facing mention of "duty-free" and "£125" from the
-- Pro Kit product copy. Per user 2026-06-15: duty handling is addressed
-- only in the Terms & Conditions (Hammerex is a manufacturer; customs and
-- carrier issues are the buyer's responsibility). The product cards
-- themselves must not mention duty or thresholds.

-- 1. Remove the "duty-free" tag line from every features list.
update public.hammerex_products
  set features = (
    select jsonb_agg(item)
    from jsonb_array_elements(features) as item
    where item->>'label' not ilike '%duty-free%'
      and item->>'label' not ilike '%£125%'
  )
  where (features::text ilike '%duty-free%' or features::text ilike '%£125%');

-- 2. Strip the trailing "Stays under £125 ..." italic line from overviews.
update public.hammerex_products
  set overview = regexp_replace(
    overview,
    E'\\n\\n\\*All Pro Kits stay under the £125 UK duty-free threshold\\.\\*',
    '',
    'g'
  )
  where overview ilike '%duty-free%' or overview ilike '%£125%';
