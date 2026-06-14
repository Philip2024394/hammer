-- HAMMEREX Tool-Type Taxonomy — second navigation axis. Categories now have
-- an `is_tool_type` flag distinguishing trade categories (current) from
-- tool-type buckets like "Tape Holders" / "Knives & Cutters" / etc. The
-- category page loader will use the `hammerex_product_trades` junction
-- table for tool-type categories (any product flagged into it shows up),
-- and the existing primary+universal logic for trade categories.

-- 1. Schema flag on categories.
alter table public.hammerex_categories
  add column if not exists is_tool_type boolean not null default false;

-- 2. Mark the existing tool-type-style groupings.
update public.hammerex_categories
  set is_tool_type = true
  where slug in (
    'trowel-holders',
    'tool-bags-backpacks',
    'hawk-holders',
    'drywall-accessories',
    'professional-tool-storage'
  );

-- 3. Create the new tool-type categories. (Sort order 400+ keeps them after
-- everything else; the home grid pulls them by is_tool_type, not sort_order.)
insert into public.hammerex_categories (slug, name, image_url, sort_order, is_tool_type) values
  ('tape-holders',       'Tape Holders',          null, 400, true),
  ('knives-cutters',     'Knives & Cutters',      null, 401, true),
  ('hammer-holders',     'Hammer Holders',        null, 402, true),
  ('belt-holders',       'Belt Holders',          null, 403, true),
  ('phone-laptop-cases', 'Phone & Laptop Cases',  null, 404, true),
  ('gloves-ppe',         'Gloves & PPE',          null, 405, true),
  ('aprons-workwear',    'Aprons & Workwear',     null, 406, true),
  ('lunch-hydration',    'Lunch & Hydration',     null, 407, true),
  ('trowels',            'Trowels',               null, 408, true),
  ('sleeves-wallets',    'Sleeves & Wallets',     null, 409, true)
on conflict (slug) do update set is_tool_type = excluded.is_tool_type;

-- 4. Link products to tool-type categories via the existing trades table.
--    Each VALUES row is (product_slug, category_slug, sort_order).
--    Idempotent via on conflict do nothing.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p
join (
  values
    -- TAPE HOLDERS
    ('measure-tape-belt-holder',                        'tape-holders',       0),
    ('slim-measure-tape-belt-holder',                   'tape-holders',       1),
    ('measure-tape-pro-holder',                         'tape-holders',       2),
    ('measure-tape-belt-holder-slider',                 'tape-holders',       3),
    ('measure-tape-max-belt-holder',                    'tape-holders',       4),
    ('measure-tape-belt-holder-protective-sleeve',      'tape-holders',       5),

    -- KNIVES & CUTTERS
    ('folding-safety-cutting-knife',                    'knives-cutters',     0),

    -- HAMMER HOLDERS
    ('lump-hammer-belt-holder',                         'hammer-holders',     0),
    ('hammer-pencil-belt-holder',                       'hammer-holders',     1),
    ('wood-chisel-and-hammer-holder',                   'hammer-holders',     2),
    ('double-wood-chisel-tape-holder',                  'hammer-holders',     3),

    -- BELT HOLDERS (generic catch-all)
    ('pliers-belt-holder',                              'belt-holders',       0),
    ('garden-shears-belt-holder',                       'belt-holders',       1),
    ('scaffolders-tilted-spanner-belt-holder',          'belt-holders',       2),
    ('3-spanner-belt-holder',                           'belt-holders',       3),
    ('battery-drill-belt-holder',                       'belt-holders',       4),
    ('leather-scissors-belt-holder',                    'belt-holders',       5),
    ('marker-belt-holder',                              'belt-holders',       6),
    ('roofers-square-belt-holder',                      'belt-holders',       7),
    ('site-single-bubble-level-holder',                 'belt-holders',       8),

    -- PHONE & LAPTOP CASES
    ('phone-belt-case',                                 'phone-laptop-cases', 0),
    ('laptop-case',                                     'phone-laptop-cases', 1),

    -- GLOVES & PPE
    ('leather-work-gloves',                             'gloves-ppe',         0),
    ('pro-safety-glasses',                              'gloves-ppe',         1),
    ('scaffolders-gloves',                              'gloves-ppe',         2),
    ('hammerex-tool-safety-lanyard-90cm',               'gloves-ppe',         3),
    ('tool-lanyard-1-5m',                               'gloves-ppe',         4),
    ('heavy-duty-glove-clip',                           'gloves-ppe',         5),
    ('headlamp-1200lm',                                 'gloves-ppe',         6),

    -- APRONS & WORKWEAR
    ('water-repellent-apron',                           'aprons-workwear',    0),
    ('leather-tool-belt-2-inch',                        'aprons-workwear',    1),
    ('scaffolders-tool-belt',                           'aprons-workwear',    2),
    ('heavy-duty-leather-tool-belt',                    'aprons-workwear',    3),
    ('tool-belt',                                       'aprons-workwear',    4),
    ('trowel-leg-pouch',                                'aprons-workwear',    5),

    -- LUNCH & HYDRATION
    ('insulated-worker-lunch-bag',                      'lunch-hydration',    0),

    -- TROWELS (the actual trowel tools)
    ('bucket-trowel',                                   'trowels',            0),
    ('stone-dashing-trowel',                            'trowels',            1),
    ('magic-trowel',                                    'trowels',            2),
    ('skimming-rule-blade',                             'trowels',            3),
    ('wall-texture-sponge-trowel',                      'trowels',            4),

    -- SLEEVES & WALLETS
    ('spatula-protective-wallet',                       'sleeves-wallets',    0),
    ('handsaw-protective-sleeve',                       'sleeves-wallets',    1),
    ('skimming-rule-sleeve',                            'sleeves-wallets',    2),
    ('trowel-wallet',                                   'sleeves-wallets',    3),
    ('venetian-trowel-wallet',                          'sleeves-wallets',    4),

    -- Existing tool-type groupings — top up with current products.
    ('3-trowel-roll-holder',                            'trowel-holders',     0),
    ('5-trowel-carry-holder',                           'trowel-holders',     1),
    ('magnetic-trowel-belt-holder',                     'trowel-holders',     2),
    ('brick-block-trowel-belt-holder',                  'trowel-holders',     3),

    ('drywall-pro-bag',                                 'tool-bags-backpacks', 0),
    ('plastering-pro-bag',                              'tool-bags-backpacks', 1),
    ('lifting-bags-range',                              'tool-bags-backpacks', 2),
    ('tapers-trowel-pan-backpack',                      'tool-bags-backpacks', 3),
    ('electrician-sling-bag',                           'tool-bags-backpacks', 4),
    ('heavy-duty-tool-bag',                             'tool-bags-backpacks', 5),
    ('steel-tool-box',                                  'tool-bags-backpacks', 6),

    ('hammerex-pro-hawk-carrier',                       'hawk-holders',       0),
    ('5-trowel-carry-holder',                           'hawk-holders',       1),

    ('strip-nail-holder',                               'drywall-accessories', 0)
) as v(prod_slug, cat_slug, s) on p.slug = v.prod_slug
join public.hammerex_categories c on c.slug = v.cat_slug
on conflict (product_id, category_id) do nothing;
