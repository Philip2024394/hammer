-- Optional "Thread color" pick on selected scaffolding leather goods.
-- Customer picks one of red/orange/yellow/white/black on the PDP; the
-- per-product delta (in product-base IDR) is added to the unit price.
-- Belt Set: £3 GBP ≈ Rp 60,000. Single Level Holder: £1.50 GBP ≈ Rp 30,000.
-- FX rate 1 GBP = 20,000 IDR (lib/fx.ts).

alter table public.hammerex_products
  add column if not exists thread_color_option_idr numeric null;

update public.hammerex_products
  set thread_color_option_idr = 60000
  where slug = 'heavy-duty-leather-tool-belt';

update public.hammerex_products
  set thread_color_option_idr = 30000
  where slug = 'site-single-bubble-level-holder';
