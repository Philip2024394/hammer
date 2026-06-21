-- Add a second banner image to the ForgeX 7-Station Scaffolder's Belt.
-- Forgex currently has zero rows in hammerex_product_media — the PDP
-- gallery is rendering the fallback product.image_url alone. Once any
-- media row exists, the fallback path is skipped, so we must insert
-- the existing primary as banner 1 (sort_order 0) alongside the new
-- banner 2 (sort_order 1), otherwise the primary image vanishes from
-- the gallery.

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', p.image_url, p.name || ' — main banner', 0
from public.hammerex_products p
where p.sku = 'HX-FX7-001' and p.image_url is not null;

insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2006_52_26%20PM.png',
  p.name || ' — banner 2', 1
from public.hammerex_products p
where p.sku = 'HX-FX7-001';
