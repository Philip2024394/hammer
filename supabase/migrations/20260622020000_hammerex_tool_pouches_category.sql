-- Add "Tool Pouches" tool-type category for the Shop by Tool Type grid,
-- cross-list the existing pouch products into it, then the grid will pick
-- up the tile via the slug added to TOOL_TYPE_SLUGS in ToolTypesGrid.tsx.
-- Card image reuses HX-EPP-001 hero so the tile is not blank.

insert into public.hammerex_categories (slug, name, sort_order, is_tool_type, card_image_url, image_url)
values (
  'tool-pouches',
  'Tool Pouches',
  403,
  true,
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/a74f5ad2427052f1.png',
  'https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/a74f5ad2427052f1.png'
)
on conflict (slug) do nothing;

-- Cross-list pouch products (skips the gardening seed-storage pouch).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('HX-EPP-001', 0),
    ('HX-ESP-001', 1),
    ('HX-EDP-001', 2),
    ('HX-TLP-001', 3),
    ('HX-PCH-01',  4)
  ) as v(sku, s)
where p.sku = v.sku and c.slug = 'tool-pouches'
on conflict (product_id, category_id) do nothing;
