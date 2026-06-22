-- HX-TPNG-001 — Tool Pouch Next Gen
-- Primary trade: electrical (sits with the other electrician pouches).
-- Cross-listed to tool-pouches (new tool-type category).
-- shipping_per_unit_idr = 0 → triggers brand-wide free-UK / £10-other
-- surcharge logic in BuyColumn.tsx (line 246+).
--
-- Pricing math (FX 23,827 IDR/£, rounded to nearest 1k):
--   single  = £43               = 1,025,000 IDR
--   buy 2 -10% = 2*1025000*0.90 = 1,845,000 IDR
--   buy 3 -15% = 3*1025000*0.85 = 2,614,000 IDR (rounded)

insert into public.hammerex_products (
  category_id, name, description,
  price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly,
  base_currency, dispatch_lead_days, delivery_quote_only,
  shipping_per_unit_idr,
  purchase_notes, subtitle, badge_label, home_sort_order,
  qty_discount_tiers, compare_with
)
select c.id,
  'Tool Pouch Next Gen',
  'The next-generation Hammerex belt-mount tool pouch.',
  1025000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2006_45_08%20AM.png',
  true,
  'tool-pouch-next-gen', 'HX-TPNG-001', 'Hammerex', 'HX-TPNG', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  'GBP', 3, false,
  0,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Free delivery to the UK. £10 flat EMS air-freight to all other countries."
  ]'::jsonb,
  'TOOL POUCH · NEXT GEN', null, 41,
  '[{"min":2,"pct":10},{"min":3,"pct":15}]'::jsonb,
  ARRAY['electrician-pro-pouch','electrician-single-pouch-belt-slide']
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'tool-pouch-next-gen');

-- Three banner images: hero (0), gallery 1, gallery 2.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image', v.url, p.name || ' — banner ' || (v.s + 1), v.s
from public.hammerex_products p,
  (values
    ('https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2006_45_08%20AM.png', 0),
    ('https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2006_50_04%20AM.png', 1),
    ('https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2006_43_09%20AM.png', 2)
  ) as v(url, s)
where p.slug = 'tool-pouch-next-gen'
and not exists (
  select 1 from public.hammerex_product_media m
  where m.product_id = p.id and m.url = v.url
);

-- Multi-buy deals — banner swaps the gallery image when the deal button is tapped.
insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 0, 'Deal 1', 2, 'Buy 2 ' || p.name, 1845000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2006_57_39%20AM.png',
  null, null
from public.hammerex_products p
where p.slug = 'tool-pouch-next-gen'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = 2
);

insert into public.hammerex_product_deals
  (product_id, sort_order, label, qty, name, price_idr, banner_url, icon_emoji, description)
select p.id, 1, 'Deal 2', 3, 'Buy 3 ' || p.name, 2614000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2007_02_52%20AM.png',
  null, null
from public.hammerex_products p
where p.slug = 'tool-pouch-next-gen'
and not exists (
  select 1 from public.hammerex_product_deals d
  where d.product_id = p.id and d.qty = 3
);

-- Cross-list to other trades + the tool-pouches tool-type category.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('electrical', 0),
    ('hvac', 1),
    ('carpentry', 2),
    ('tool-bags-backpacks', 3),
    ('tool-pouches', 4),
    ('new-products', 5)
  ) as v(slug, s)
where p.slug = 'tool-pouch-next-gen' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;
