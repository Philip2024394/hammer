-- HAMMEREX Plastering Pro Backpack Trowel Bag — D600 water-resistant fabric,
-- twin-lined, double zippers, holds up to 3 plastering trowels up to 18"
-- + rear plastering board compartment + internal storage. Standard carry
-- by default at £88. Backpack straps are a selectable +£10 add-on (handled
-- via backpack_straps_option_idr = 200000 set in the 100000-prefix
-- migration). Tiers 2/-10%, 3/-15%. Primary category: plastering;
-- cross-listed to drywall.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers,
  backpack_straps_option_idr
)
select c.id,
  'Hammerex Pro Backpack Plastering Trowel Bag',
  'Professional plasterer''s trowel bag — industrial D600 water-resistant fabric, twin-lined, heavy-duty double zippers. Holds up to 3 trowels (up to 18"), rear board compartment, internal storage. Add backpack straps for +£10.',
  1760000,
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsd.png',
  true,
  'plastering-pro-bag', 'HX-PPB-001', 'Hammerex', 'HX-PPB', '14:00',
  1, 'United Kingdom',
  E'The NEW **Hammerex Pro Backpack Plastering Trowel Bag** has been designed specifically for professional plasterers who require durable, practical, and reliable tool storage while keeping both hands free on site.\n\nManufactured from industrial-grade **D600 water-resistant fabric**, the bag features a **twin-lined construction** for enhanced durability and long-term performance in demanding working environments. **Heavy-duty double zippers** provide secure access to your tools while ensuring dependable daily use.\n\nThe Hammerex Pro Backpack Trowel Bag comfortably holds up to **three plastering trowels measuring up to 18 inches** in length, keeping your tools protected during transport and storage. A dedicated **rear storage section securely accommodates a plastering board**, while an internal storage compartment provides additional space for accessories, hand tools, and site essentials.\n\nThe base bag ships as a standard carry. **Add the backpack straps option (+£10)** for fully adjustable, padded backpack shoulder straps that allow you to carry your plastering equipment safely and comfortably between jobs — together with an additional adjustable shoulder carry strap for maximum flexibility.\n\n### Features\n\n* Holds up to 3 plastering trowels up to 18" long\n* Dedicated rear storage compartment for a plastering board\n* Internal storage compartment for tools and accessories\n* Industrial-grade D600 water-resistant material\n* Twin-lined construction for increased durability\n* Heavy-duty double zipper system\n* Standard carry — adjustable padded backpack shoulder straps available as +£10 add-on\n* Adjustable shoulder carry strap included with the backpack-strap add-on\n* Comfortable hands-free transport between jobs\n* Designed specifically for professional plasterers',
  '[
    {"icon":"check","label":"Holds up to 3 plastering trowels up to 18\" long"},
    {"icon":"check","label":"Dedicated rear storage compartment for a plastering board"},
    {"icon":"check","label":"Internal storage compartment for tools and accessories"},
    {"icon":"check","label":"Industrial-grade D600 water-resistant material"},
    {"icon":"check","label":"Twin-lined construction for increased durability"},
    {"icon":"check","label":"Heavy-duty double zipper system"},
    {"icon":"check","label":"Standard carry — backpack straps available as +£10 add-on"},
    {"icon":"check","label":"Add-on includes adjustable padded backpack shoulder straps + shoulder carry strap"},
    {"icon":"check","label":"Comfortable hands-free transport between jobs (with strap add-on)"},
    {"icon":"check","label":"Designed specifically for professional plasterers"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Add backpack straps for +£10 — toggle the option above before adding to cart.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'PRO BACKPACK PLASTERING TROWEL BAG', 25,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb,
  200000
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'plastering-pro-bag');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/asdasaaasssfsfsdfsd.png',
  'Hammerex Pro Backpack Plastering Trowel Bag — D600 water-resistant, twin-lined, double-zip',
  0
from public.hammerex_products p
where p.slug = 'plastering-pro-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering + drywall (sibling trades).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('plastering', 0), ('drywall', 1)) as v(slug, s)
where p.slug = 'plastering-pro-bag' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Pro Backpack Plastering Trowel Bag (standard carry)', 1, 0),
    ('Adjustable padded backpack shoulder straps (only with +£10 add-on)', 1, 1),
    ('Adjustable shoulder carry strap (only with +£10 add-on)', 1, 2)
  ) as v(l, q, s)
where p.slug = 'plastering-pro-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Backpack-strap option price is set centrally in the 100000-prefix migration
-- (backpack_straps_option_idr = 200000). This migration intentionally does
-- not re-set it.

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowels',         'Up to 3 plastering trowels (up to 18" long)',         0),
    ('Capacity',     'Plastering board','Dedicated rear storage compartment',                  1),
    ('Capacity',     'Hand tools',      'Internal compartment for tools and accessories',      2),
    ('Material',     'Fabric',          'Industrial-grade D600 water-resistant fabric',       10),
    ('Material',     'Construction',    'Twin-lined construction for enhanced durability',    11),
    ('Material',     'Closure',         'Heavy-duty double zipper system',                    12),
    ('Design',       'Carry style',     'Standard carry (default) · backpack straps available as +£10 add-on', 20),
    ('Design',       'Add-on contents', 'Backpack-strap add-on adds padded shoulder straps + adjustable carry strap', 21),
    ('Pricing',      'Single unit',     '£88.00 (standard carry)',                            30),
    ('Pricing',      'Backpack straps', '+£10.00 — selectable add-on',                        31),
    ('Pricing',      'Bulk discounts',  'Buy 2 -10% · Buy 3 -15%',                            32),
    ('Stock',        'Availability',    'In stock',                                           40),
    ('Dispatch',     'Lead time',       'Dispatched within 3 working days of order',          41),
    ('Dispatch',     'UK delivery',     'Typical UK delivery within 5 working days',          42),
    ('Use',          'Built for',       'Professional plasterers',                            50),
    ('Build & care', 'Made in',         'United Kingdom',                                     60),
    ('Build & care', 'Warranty',        '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'plastering-pro-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
