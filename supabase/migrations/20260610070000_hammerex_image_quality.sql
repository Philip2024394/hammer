-- Bump product image resolution / quality so cards don't look blurred.
--   Unsplash w=600/q=70 → w=1200/q=85
--   Unsplash w=600/q=80 → w=1200/q=85
--   Unsplash w=800/q=80 → w=1600/q=88
--   Trowel Leg Pouch ImageKit asset → add transform query for retina quality

update public.hammerex_products
  set image_url = replace(image_url, 'w=600&q=70', 'w=1200&q=85')
  where image_url like '%w=600&q=70%';

update public.hammerex_products
  set image_url = replace(image_url, 'w=600&q=80', 'w=1200&q=85')
  where image_url like '%w=600&q=80%';

update public.hammerex_products
  set image_url = replace(image_url, 'w=800&q=80', 'w=1600&q=88')
  where image_url like '%w=800&q=80%';

update public.hammerex_products
  set image_url = 'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZx.png?tr=w-1600,q-90,f-auto'
  where slug = 'trowel-leg-pouch';

-- Bundle item images render in 200–300px tiles; bump from w=400/q=70 → w=800/q=85.
-- Accessory products share the same image_url as their bundle tile, so the
-- preceding update already lifted them too.

-- What's-in-box visual grid (currently w=400/q=70 → w=800/q=85).
update public.hammerex_what_in_box
  set image_url = replace(image_url, 'w=400&q=70', 'w=800&q=85')
  where image_url like '%w=400&q=70%';
