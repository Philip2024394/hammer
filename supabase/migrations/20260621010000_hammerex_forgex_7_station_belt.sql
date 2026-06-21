-- New product: HAMMEREX ForgeX™ 7 Station Scaffolder's Belt
-- Category: scaffolding. Free UK delivery (shipping_per_unit_idr=0). Non-UK
-- buyers get the standard +£10 air-freight surcharge per unit via the
-- runtime logic in BuyColumn (no per-row config needed for that).
--
-- Price: £49 → 1,167,500 IDR at 23,827 IDR/£. Round to nearest 100.
-- Thread colour option: 71,481 IDR (≈£3) — same as scaffolders-setup-kit.
--
-- Option configs (belt waist size, belt upgrade swap, custom branding,
-- repair cover, thread colour palette) are added to the corresponding
-- lib/*.ts files in the same change so the PDP renders the full feature
-- stack the moment this product page loads.

insert into public.hammerex_products (
  category_id, slug, name, subtitle, description, overview,
  image_url, sizes, features, price_idr, shipping_per_unit_idr,
  base_currency, brand, sku, stock_count, dispatch_lead_days,
  thread_color_option_idr
)
select
  c.id,
  'forgex-7-station-scaffolders-belt',
  'HAMMEREX ForgeX™ 7 Station Scaffolder''s Belt',
  '7 stations · 2" solid-core leather · bubble level holder · twin/single scaffolder holders',
  E'Heavy-duty 2" solid-core leather scaffolder''s belt with seven purpose-built stations — bubble level holder, sliding glove + lanyard clips, 8 m tape holder, hammer holder, twin scaffolder holder and single scaffolder holder. Built for professional scaffolders.',
  E'Built for professional scaffolders who demand durability, comfort, and maximum tool organization, the HAMMEREX ForgeX™ 7 Station Scaffolder''s Belt is engineered to perform in the toughest site conditions.\n\nCrafted from premium heavy-duty materials and fitted with a robust 2" solid-core leather belt, the ForgeX™ provides outstanding support and all-day comfort while carrying essential scaffolding tools. Every station has been strategically positioned to improve efficiency and keep your most-used tools within easy reach.\n\nThe 7 stations: a purpose-built bubble-level holder, a heavy-duty sliding glove clip and movable lanyard clip (both repositionable around the belt), a tape measure holder rated to 8 metres for one-handed access at height, a reinforced hammer station, a twin scaffolder holder for spanners + commonly used scaffolding tools, and an additional single scaffolder holder for individual tools or accessories.\n\nProfessional-grade leather construction, practical tool organization, and site-proven durability — a belt system trusted by scaffolders every day, whether you''re erecting, modifying, or dismantling scaffolding.',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2001_49_53%20PM.png',
  '["32\"","34\"","36\"","38\"","40\"","42\"","44\"","46\"","48\""]'::jsonb,
  '[
    {"icon":"🛠","label":"7-station tool system, scaffolder-optimised"},
    {"icon":"📏","label":"2\" solid-core leather belt"},
    {"icon":"💧","label":"Integrated single-bubble level holder"},
    {"icon":"🔁","label":"Sliding glove + lanyard clips, repositionable"},
    {"icon":"📐","label":"Heavy-duty tape measure holder (8 m)"},
    {"icon":"🔨","label":"Reinforced hammer station"},
    {"icon":"🔧","label":"Twin scaffolder holder (spanners + tools)"},
    {"icon":"🪛","label":"Single scaffolder holder for individual tools"}
  ]'::jsonb,
  1167500,
  0,
  'GBP',
  'Hammerex',
  'HX-FX7-001',
  100,
  3,
  71481
from public.hammerex_categories c where c.slug = 'scaffolding'
on conflict (slug) do nothing;

insert into public.hammerex_product_categories (product_id, category_id, is_primary)
select p.id, c.id, true
from public.hammerex_products p, public.hammerex_categories c
where p.slug = 'forgex-7-station-scaffolders-belt' and c.slug = 'scaffolding'
on conflict do nothing;

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, 'Construction', 'Belt width', '2 inch (50mm) solid-core leather', 1 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Construction', 'Material', 'Premium heavy-duty leather', 2 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Bubble level holder', 'Single-pocket level, protected', 1 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Sliding clips', 'Glove clip + lanyard clip, repositionable', 2 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Tape holder', 'Tapes up to 8 metres', 3 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Hammer holder', 'Reinforced, fast retrieval', 4 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Twin scaffolder', 'Dual holder for spanners + scaffolding tools', 5 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Stations', 'Single scaffolder', 'Additional holder for individual tools', 6 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Shipping', 'UK', 'Free UK delivery · 5 days', 1 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt'
union all
select p.id, 'Shipping', 'International', '+£10 per unit air freight via EMS', 2 from public.hammerex_products p where p.slug = 'forgex-7-station-scaffolders-belt';
