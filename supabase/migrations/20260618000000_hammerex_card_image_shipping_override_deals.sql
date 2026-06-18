-- 20260618 schema backfill
-- Captures three sets of changes that were applied directly to the
-- linked Supabase project during the 2026-06-17 / 2026-06-18 session
-- via the Management API but were not previously written into source
-- control. Re-running this migration on a fresh database produces an
-- equivalent schema.

-- 1. Category card override fields used by CategoryGrid + ToolTypesGrid
--    so a category tile can render a full-bleed branded illustration
--    (with optional overlay label) instead of the default icon + name.
ALTER TABLE hammerex_categories
  ADD COLUMN IF NOT EXISTS card_image_url text,
  ADD COLUMN IF NOT EXISTS card_show_label boolean NOT NULL DEFAULT false;

-- 2. Per-product shipping override. When set, each cart line of this
--    product contributes qty x shipping_per_unit_idr to the shipping
--    total instead of the standard tier-based rate. Used for products
--    where the bag price already absorbs the per-unit air-freight cost.
ALTER TABLE hammerex_products
  ADD COLUMN IF NOT EXISTS shipping_per_unit_idr integer;

-- 3. Multi-Purchase deals — the "Buy 2 / 3 / N" landscape banners that
--    appear in the gallery row above the Add-to-cart button on a PDP.
--    Each row defines an alternate listing (banner, name, price, qty)
--    that swaps the displayed banner + name + price on the product page.
CREATE TABLE IF NOT EXISTS hammerex_product_deals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES hammerex_products(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  qty           integer NOT NULL DEFAULT 2,
  label         text NOT NULL,
  banner_url    text NOT NULL,
  name          text NOT NULL,
  price_idr     integer NOT NULL,
  description   text,
  icon_emoji    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hammerex_product_deals_product_id_idx
  ON hammerex_product_deals(product_id, sort_order);
