-- Swap the drywall category hero from the old Unsplash placeholder to a
-- branded ImageKit asset chosen by the owner. The URL is written here as
-- delivered; the daily ImageKit→Supabase migration job (scripts/
-- migrate_images.mjs + scripts/rewrite_urls.mjs) will rehome it under
-- Supabase Storage on next run so no production read ever hits ImageKit.

update public.hammerex_categories
set image_url = 'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2006_11_17%20AM.png?updatedAt=1781737899537'
where slug = 'drywall';
