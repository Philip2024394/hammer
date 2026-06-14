-- Seed 4 PLACEHOLDER Deal Breaker add-ons attached to the Heavy Duty Leather
-- Tool Belt Set. Replace these rows with real items when ready — they are kept
-- non-featured and (intentionally) without a category so they don't pollute
-- the trade carousels or the home featured strip.
--
-- Pricing (GBP @ 20,000 IDR):
--   Tool Lanyard 1.5m         £8  RRP  / £5  DB  → 160,000 / 100,000
--   Heavy Duty Glove Clip     £6  RRP  / £4  DB  → 120,000 /  80,000
--   Scaffolders Gloves (Pair) £12 RRP  / £8  DB  → 240,000 / 160,000
--   Heavy Duty Tool Bag       £30 RRP  / £22 DB  → 600,000 / 440,000

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, is_accessory,
  badge_label, subtitle, home_sort_order
)
select null,
  v.name, v.description, v.price_idr, v.image_url, false,
  v.slug, v.sku, 'Hammerex', v.model_number, '14:00',
  1, 'United Kingdom', v.overview, v.features::jsonb,
  'GBP', 3, true, true,
  null, v.subtitle, null
from (values
  ('Hammerex Tool Lanyard 1.5m', 'Heavy-duty 1.5m tool lanyard with carabiner — keeps tools secured at height.',
   160000,
   'https://ik.imagekit.io/pinky/Untitledsdfasdaaaasdasdasd.png?tr=w-1600,q-90,f-auto',
   'tool-lanyard-1-5m', 'HX-LNYRD-001', 'HX-LNYRD',
   E'Heavy-duty 1.5m elasticated tool lanyard with steel carabiner — keeps your tools tethered when working at height. Compatible with podgers, hammers and adjustable spanners up to 1.5kg.',
   '[
     {"icon":"check","label":"1.5m elasticated lanyard"},
     {"icon":"check","label":"Steel carabiner clip"},
     {"icon":"check","label":"Working load up to 1.5kg"},
     {"icon":"check","label":"Heat- and abrasion-resistant"}
   ]',
   'TOOL LANYARD 1.5M'),

  ('Heavy Duty Glove Clip', 'Leather glove clip — keeps gloves on the belt when not in use.',
   120000,
   'https://ik.imagekit.io/pinky/Untitledsdfasdaaaasdasdasd.png?tr=w-1600,q-90,f-auto',
   'heavy-duty-glove-clip', 'HX-GCLIP-001', 'HX-GCLIP',
   E'Heavy-duty leather glove clip with riveted construction — clips onto belts up to 6cm and keeps gloves secure and accessible. Suits leather, nitrile and impact gloves.',
   '[
     {"icon":"check","label":"Leather body with reinforced rivets"},
     {"icon":"check","label":"Fits belts up to 6cm wide"},
     {"icon":"check","label":"Suits leather, nitrile and impact gloves"}
   ]',
   'GLOVE CLIP'),

  ('Scaffolders Gloves (Pair)', 'High-grip scaffolders gloves with reinforced palm and knuckle protection.',
   240000,
   'https://ik.imagekit.io/pinky/UntitledfsdfsdfssssdddzxZxasdasd.png?tr=w-1600,q-90,f-auto',
   'scaffolders-gloves', 'HX-SGLV-001', 'HX-SGLV',
   E'High-grip scaffolders gloves — reinforced palm, knuckle bumper protection, breathable back. Sized M / L / XL (specify when quoting).',
   '[
     {"icon":"check","label":"Reinforced palm grip"},
     {"icon":"check","label":"Knuckle bumper protection"},
     {"icon":"check","label":"Breathable back for long days"},
     {"icon":"check","label":"Sizes M / L / XL available"}
   ]',
   'SCAFFOLDERS GLOVES'),

  ('Hammerex Heavy Duty Tool Bag', 'Heavy-duty open-top tool bag with reinforced base and twin carry handles.',
   600000,
   'https://ik.imagekit.io/pinky/ChatGPT%20Image%20Jun%2011,%202026,%2002_20_05%20PM.png?tr=w-1600,q-90,f-auto',
   'heavy-duty-tool-bag', 'HX-TBAG-001', 'HX-TBAG',
   E'Heavy-duty open-top tool bag with reinforced base and twin carry handles. Internal pockets for podgers, hammers, levels and small parts. Built for daily site abuse.',
   '[
     {"icon":"check","label":"Reinforced base and twin handles"},
     {"icon":"check","label":"Internal pockets for hand tools"},
     {"icon":"check","label":"Water-resistant fabric"},
     {"icon":"check","label":"Heavy-duty stitching throughout"}
   ]',
   'TOOL BAG')
) as v(name, description, price_idr, image_url, slug, sku, model_number, overview, features, subtitle)
where not exists (select 1 from public.hammerex_products where slug = v.slug);

-- Link the four placeholders as Deal Breaker add-ons on the Heavy Duty Leather
-- Tool Belt Set. Deal Breaker prices (IDR):
--   lanyard 100,000 · glove clip 80,000 · gloves 160,000 · tool bag 440,000
insert into public.hammerex_deal_breakers (anchor_product_id, item_product_id, deal_price_idr, sort_order)
select anchor.id, item.id, v.deal_price_idr, v.sort_order
from public.hammerex_products anchor,
  public.hammerex_products item,
  (values
    ('tool-lanyard-1-5m',   100000, 0),
    ('heavy-duty-glove-clip', 80000, 1),
    ('scaffolders-gloves',  160000, 2),
    ('heavy-duty-tool-bag', 440000, 3)
  ) as v(item_slug, deal_price_idr, sort_order)
where anchor.slug = 'heavy-duty-leather-tool-belt'
and item.slug = v.item_slug
on conflict (anchor_product_id, item_product_id) do nothing;
