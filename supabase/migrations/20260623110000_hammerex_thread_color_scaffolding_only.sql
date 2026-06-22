-- Thread-colour option is now scaffolding-only per owner. The picker
-- shows on scaffolding belts + scaffolding tool/belt holders, nothing
-- else. Three non-scaffolding products that had the option enabled
-- get it cleared; four scaffolding belt/holder products that should
-- have had it all along get it added at the standard 71,481 IDR
-- (~£3.00) per-unit fee.
--
-- Colours: orange has been removed from the catalogue entirely; bright
-- vivid green added in its place. See src/lib/threadColor.ts for the
-- canonical palette.

-- 1. Strip the thread-colour option off non-scaffolding products.
update public.hammerex_products
set thread_color_option_idr = null
where slug in (
  'leather-tool-belt-2-inch',         -- Hammerex 2" Heavy Duty Leather Work Belt
  'heavy-duty-leather-tool-belt',     -- Heavy Duty Leather Tool Belt Set
  'site-single-bubble-level-holder'   -- Site Single Bubble Level Holder
);

-- 2. Add the thread-colour option to every scaffolding belt / belt
--    holder that doesn't already have it. 71,481 IDR matches the rate
--    already in use on forgex-7-station / scaffolders-tool-belt /
--    scaffolders-setup-kit / leather-scaffolding-belt.
update public.hammerex_products
set thread_color_option_idr = 71481
where slug in (
  'scaffolders-apex-7-station-tool-belt',
  'scaffolders-tilted-spanner-belt-holder',
  'scaffolding-spanner-belt-holder',
  'tool-lanyard-1-5m'  -- this slug = "Scaffolders Single Bubble Level Belt Holder"
)
and (thread_color_option_idr is null or thread_color_option_idr = 0);
