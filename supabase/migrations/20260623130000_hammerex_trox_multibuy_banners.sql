-- HX-TRX-001 — multibuy deal rows for the Trox scaffolders belt.
-- Banners are owner-supplied; prices match the existing buy-2 -10% /
-- buy-3 -15% schedule already encoded in qty_discount_tiers.
--
-- Math (base 929,000 IDR, roundDown100):
--   qty 2 = 929000 * 2 * 0.90 = 1,672,200
--   qty 3 = 929000 * 3 * 0.85 = 2,368,900

insert into public.hammerex_product_deals (
  product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description
)
select p.id, v.sort_order, v.label, v.qty, v.name, v.price_idr, v.banner_url, v.icon_emoji, null
from public.hammerex_products p,
  (values
    (0, 'Deal 1', 2, 'Buy 2 Scaffolders Belt TROX', 1672200,
     'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxcxcxcxcasdasdsadasd.png',
     E'✨'),
    (1, 'Deal 2', 3, 'Buy 3 Scaffolders Belt TROX', 2368900,
     'https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxcxcxcxcasdasdsadasdsadasd.png',
     E'\U0001F525')
  ) as v(sort_order, label, qty, name, price_idr, banner_url, icon_emoji)
where p.slug = 'scaffolders-belt-trox'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = v.qty
);
