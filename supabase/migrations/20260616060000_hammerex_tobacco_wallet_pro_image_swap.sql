-- Swap the Pro tobacco wallet hero image to the updated product render.
-- Keeps both the products.image_url and the media row in sync.

update public.hammerex_products
set image_url = 'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdfdsasasdasddssds.png'
where slug = 'tobacco-wallet-pro';

update public.hammerex_product_media
set url = 'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdfdsasasdasddssds.png'
where product_id = (select id from public.hammerex_products where slug = 'tobacco-wallet-pro')
  and sort_order = 0;
