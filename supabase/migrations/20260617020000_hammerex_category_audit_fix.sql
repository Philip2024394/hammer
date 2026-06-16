-- Catalog category audit (2026-06-17). Fixes 22 products whose primary
-- category did not match their evident purpose. Biggest single pattern:
-- 9 garden products were primary=landscaping instead of garden.
-- Also a handful of trade misroutes (trowel-belt holders in the wrong
-- trade, roofer's square in carpentry, etc.). Two PPE products that
-- had no primary at all are also addressed here.

-- Helper inline: each block updates products.category_id by joining
-- through hammerex_categories on slug. Cross-listings via
-- hammerex_product_trades are also updated where needed.

-- ============================================================
-- 1) Garden range: 9 products moved from landscaping → garden primary
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'garden')
where slug in (
  'garden-apron',
  'garden-knee-pads',
  'garden-kneeling-mat',
  'garden-shears-belt-holder',
  'garden-tool-belt-standard',
  'garden-tool-roll',
  'garden-tool-tote',
  'garden-waste-bags-compact',
  'gardening-tools-set',
  'seed-storage-pouch',
  'garden-starter-pack'
);

-- Garden products: ensure 'garden' is in cross-list, keep landscaping as
-- secondary so they still appear on /c/landscaping for buyers searching there.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug in (
  'garden-apron',
  'garden-knee-pads',
  'garden-kneeling-mat',
  'garden-shears-belt-holder',
  'garden-tool-belt-standard',
  'garden-tool-roll',
  'garden-tool-tote',
  'garden-waste-bags-compact',
  'gardening-tools-set',
  'seed-storage-pouch',
  'garden-starter-pack'
)
and c.slug = 'garden'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 2) leg-tool-holder: electrical → plastering primary
--    (user-flagged: leg-mounted holders are dominated by plasterer use
--    in the trades; existing cross-list to electrical/scaffolding/etc.
--    is preserved so cross-trade buyers still find it.)
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'plastering')
where slug = 'leg-tool-holder';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'leg-tool-holder' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 3) Trowel-holder belts in the wrong trade
-- ============================================================
-- Brick & Block Layer's Trowel Belt Holder → bricklaying primary
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'bricklaying')
where slug = 'brick-block-trowel-belt-holder';

-- Magnetic Trowel Belt Holder → plastering primary (generic trowel use)
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'plastering')
where slug = 'magnetic-trowel-belt-holder';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'magnetic-trowel-belt-holder' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 4) Pro Hawk Carrier → plastering primary (hawk-holders is a tool-type
--    filter, not a trade; trade primary belongs to plastering).
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'plastering')
where slug = 'hammerex-pro-hawk-carrier';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'hammerex-pro-hawk-carrier' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 5) Adjustable Pliers Belt Holder (SITE PRO) → scaffolding primary
--    (already cross-listed to scaffolding; product name and use are
--    site/scaffolding-led, not plumbing.)
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'scaffolding')
where slug = 'adjustable-pliers-belt-holder';

-- ============================================================
-- 6) Roofer's Square Belt Holder → roofing primary
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'roofing')
where slug = 'roofers-square-belt-holder';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'roofers-square-belt-holder' and c.slug = 'roofing'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 7) Venetian Trowel Wallet → venetian-plastering primary
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'venetian-plastering')
where slug = 'venetian-trowel-wallet';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'venetian-trowel-wallet' and c.slug = 'venetian-plastering'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 8) Taper's Trowel & Pan Backpack → plastering primary
--    (tool-bags-backpacks is a tool-type filter, not a trade.)
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'plastering')
where slug = 'tapers-trowel-pan-backpack';

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'tapers-trowel-pan-backpack' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- ============================================================
-- 9) Leather Work Gloves → tools primary (universal PPE; was carpentry).
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'tools')
where slug = 'leather-work-gloves';

-- ============================================================
-- 10) PPE products that had NO primary category set
-- ============================================================
update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'tools')
where slug = 'heavy-duty-glove-clip' and category_id is null;

update public.hammerex_products
set category_id = (select id from public.hammerex_categories where slug = 'scaffolding')
where slug = 'scaffolders-gloves' and category_id is null;

insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'scaffolders-gloves' and c.slug = 'scaffolding'
on conflict (product_id, category_id) do nothing;
