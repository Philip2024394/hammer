-- Add per-product video cover image, used as a click-to-play poster on the
-- PDP video block. When set, the PDP renders the cover with a red YouTube
-- play button overlay instead of loading the YouTube iframe immediately.
--
-- Also wires up HX-FX7-001 (ForgeX 7-Station Scaffolder's Belt) with its
-- product video URL and the requested cover image.

alter table public.hammerex_products
  add column if not exists video_cover_url text;

update public.hammerex_products
set
  video_url = 'https://youtube.com/shorts/B27mxDNcr7M?si=uLDTn0LbxSSGbYWd',
  video_cover_url = 'https://ik.imagekit.io/9mrgsv2rp/scaffolding%20hhasdasdasdd.png'
where sku = 'HX-FX7-001';
