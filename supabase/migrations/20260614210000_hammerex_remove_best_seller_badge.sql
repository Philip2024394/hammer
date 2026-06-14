-- Remove the "BEST SELLER" badge from the 5 Trowel Carry Holder card.
-- Per user 2026-06-14: don't surface a best-seller claim without honest
-- sales data behind it.

update public.hammerex_products
  set badge_label = null
  where slug = '5-trowel-carry-holder'
    and badge_label = 'BEST SELLER';
