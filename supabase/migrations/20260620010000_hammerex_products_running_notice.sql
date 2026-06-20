-- Add a per-product `running_notice` column so each PDP can carry its own
-- live marquee message under the hero image (delivery delays, stock notes,
-- promo announcements, etc). When null, the ProductTicker falls back to
-- the brand-wide rotating messages defined client-side.

alter table public.hammerex_products
  add column if not exists running_notice text;

comment on column public.hammerex_products.running_notice is
  'Per-product marquee text rendered under the hero image on the PDP. Null = use default brand-wide rotation.';
