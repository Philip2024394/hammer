-- Fix Pro Kit images. The first kit migration used hardcoded image hashes
-- pulled from memory, and 4 of the 5 hashes were wrong (one pointed at a
-- hero banner, one at the safety glasses, etc). Setting each kit to its
-- anchor product's actual image_url dynamically so this can't drift again.

update public.hammerex_products
  set image_url = (select image_url from public.hammerex_products where slug = 'plastering-pro-bag')
  where slug = 'plasterer-pro-kit';

update public.hammerex_products
  set image_url = (select image_url from public.hammerex_products where slug = 'drywall-pro-bag')
  where slug = 'drywall-pro-kit';

update public.hammerex_products
  set image_url = (select image_url from public.hammerex_products where slug = 'scaffolders-tool-belt')
  where slug = 'scaffolders-setup-kit';

update public.hammerex_products
  set image_url = (select image_url from public.hammerex_products where slug = 'hammer-pencil-belt-holder')
  where slug = 'carpenter-starter-pack';

update public.hammerex_products
  set image_url = (select image_url from public.hammerex_products where slug = 'garden-tool-belt-standard')
  where slug = 'garden-starter-pack';

-- Also realign the hero media row so the PDP gallery uses the same image.
update public.hammerex_product_media
  set url = (select image_url from public.hammerex_products where slug = 'plastering-pro-bag')
  where product_id = (select id from public.hammerex_products where slug = 'plasterer-pro-kit')
    and kind = 'image';

update public.hammerex_product_media
  set url = (select image_url from public.hammerex_products where slug = 'drywall-pro-bag')
  where product_id = (select id from public.hammerex_products where slug = 'drywall-pro-kit')
    and kind = 'image';

update public.hammerex_product_media
  set url = (select image_url from public.hammerex_products where slug = 'scaffolders-tool-belt')
  where product_id = (select id from public.hammerex_products where slug = 'scaffolders-setup-kit')
    and kind = 'image';

update public.hammerex_product_media
  set url = (select image_url from public.hammerex_products where slug = 'hammer-pencil-belt-holder')
  where product_id = (select id from public.hammerex_products where slug = 'carpenter-starter-pack')
    and kind = 'image';

update public.hammerex_product_media
  set url = (select image_url from public.hammerex_products where slug = 'garden-tool-belt-standard')
  where product_id = (select id from public.hammerex_products where slug = 'garden-starter-pack')
    and kind = 'image';
