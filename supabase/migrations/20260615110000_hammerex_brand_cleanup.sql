-- Brand cleanup batch on 2026-06-15.
--   1) Delete the two functionally-duplicate products that were originally
--      sent in pairs with identical marketing copy.
--   2) Tighten the is_universal flag — only true cross-trade essentials
--      (tape measures, the welcome-gift knife, PPE, phone case, base belt)
--      stay flagged. Trade-specific holders no longer pollute every
--      category page.
--   3) Flag three flagship products with a BEST PICK badge for the home
--      page Pro Picks rail.

-- ============================================================
-- 1. Remove duplicates
-- ============================================================

-- Hi-Vis Safety Glasses: keep the universal £7.90 version, delete the
-- £7.99 "Tinted Edition" that was sent with verbatim-identical copy.
delete from public.hammerex_products where slug = 'hi-vis-safety-glasses-tinted';

-- Garden Tool Belt: keep the £13.70 version, delete the £19.99 "Pro" that
-- was sent with verbatim-identical copy.
delete from public.hammerex_products where slug = 'garden-tool-belt-pro';

-- Rename the surviving Garden Tool Belt to plain "Hammerex Garden Tool
-- Belt" since there's no edition to differentiate any more.
update public.hammerex_products
  set name = 'Hammerex Garden Tool Belt',
      subtitle = 'GARDEN TOOL BELT'
where slug = 'garden-tool-belt-standard';

-- ============================================================
-- 2. Tighten is_universal — only true cross-trade items keep the flag.
-- ============================================================

-- Trade-specific holders that should NOT appear on every category page.
update public.hammerex_products
  set is_universal = false
where slug in (
  'hammer-pencil-belt-holder',
  'lump-hammer-belt-holder',
  'battery-drill-belt-holder',
  'handsaw-protective-sleeve'
);

-- ============================================================
-- 3. Flagship Pro Picks
-- ============================================================
update public.hammerex_products
  set badge_label = 'PRO PICK'
where slug in (
  'drywall-pro-bag',
  'plastering-pro-bag',
  'scaffolders-tool-belt'
);
