-- HAMMEREX universal-product flag — `is_universal` lets the catalogue
-- distinguish "shows on every category page" accessories (tape holders,
-- knives, gloves, the 2" leather belt) from trade-specific products. The
-- category page (/c/[slug]) now includes products where primary category
-- matches OR is_universal = true, while still ignoring the generic
-- cross-list table (which previously caused Scaffolding cards to appear
-- on the Carpentry page).

alter table public.hammerex_products
  add column if not exists is_universal boolean not null default false;

-- Mark the 12 products that were intentionally cross-listed across every
-- trade as universal.
update public.hammerex_products
  set is_universal = true
  where slug in (
    'measure-tape-pro-holder',
    'slim-measure-tape-belt-holder',
    'measure-tape-belt-holder-protective-sleeve',
    'measure-tape-belt-holder-slider',
    'measure-tape-max-belt-holder',
    'folding-safety-cutting-knife',
    'measure-tape-belt-holder',
    'hammer-pencil-belt-holder',
    'lump-hammer-belt-holder',
    'battery-drill-belt-holder',
    'leather-work-gloves',
    'leather-tool-belt-2-inch'
  );
