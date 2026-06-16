-- Placeholder hero image for the 26 categories that still have no
-- image_url (categories with zero products in them, so the prior
-- auto-fill couldn't pick a representative product photo). Each gets
-- the same generic Hammerex workshop hero — placeholder only, intended
-- to be replaced per-category as the user uploads dedicated trade
-- photography.

update public.hammerex_categories
  set image_url = 'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/5e90c14e2eeae2ca.png'
  where image_url is null
     or image_url = '';
