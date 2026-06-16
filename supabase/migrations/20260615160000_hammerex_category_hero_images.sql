-- Auto-populate category.image_url for every category that doesn't already
-- have one, using the highest home_sort_order primary product as the
-- representative hero photo. CategoryHero then renders that image
-- full-bleed with a dark gradient overlay instead of the icon-only fallback.
--
-- Categories with zero products keep the icon-only fallback (no source
-- image available to use).

update public.hammerex_categories c
  set image_url = sub.image_url
  from (
    select distinct on (p.category_id) p.category_id, p.image_url
    from public.hammerex_products p
    where p.image_url is not null
      and p.image_url <> ''
    order by p.category_id, p.home_sort_order asc nulls last, p.price_idr desc nulls last
  ) sub
  where c.id = sub.category_id
    and (c.image_url is null or c.image_url = '');
