-- Third SKU in the Tobacco Wallets vertical — the "best" tier of the
-- good/better/best ladder. Combines all features from the previous two:
-- lined cash compartment + dedicated tobacco pouch + rear zip pocket +
-- integrated rolling-paper station. £22 GBP (Rp 440,000 @ 20k/£). Sits
-- above the £19.99 zip wallet.
-- Same vertical isolation as the others: no trade cross-list, hidden
-- from home rotation.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Leather Tobacco Wallet — Pro',
  'Premium genuine-leather wallet — dedicated tobacco pouch + separate lined cash compartment + rear zip pocket for cards / coins + integrated rolling-paper station. Soft-close press stud, compact everyday-carry profile.',
  440000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdfdsasasdasd.png',
  false,
  'tobacco-wallet-pro', 'HX-TBW-003', 'Hammerex', 'HX-TBW-PRO', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Keep your essentials organised in one premium leather wallet designed for everyday convenience.\n\nThe **Hammerex Tobacco Wallet** features a dedicated tobacco storage section with a separate lined cash compartment, ensuring your banknotes stay clean, protected and completely isolated from your tobacco. No more folded notes mixed with loose tobacco.\n\nA secure rear zipper pocket provides additional storage for ATM cards, coins and small valuables, while the integrated rolling-paper station keeps your papers neatly organised and ready when needed.\n\nCrafted from durable genuine leather with premium stitching and a soft-close press-stud button, this wallet combines practicality, durability and classic style in one compact design.\n\n### Features\n\n* Separate lined cash compartment away from tobacco storage\n* Dedicated tobacco pouch section\n* Rear zip-close pocket for ATM cards, coins and valuables\n* Integrated rolling-paper station\n* Soft-close press-stud fastening\n* Premium genuine leather construction\n* Compact and practical everyday-carry design\n\nBuilt for convenience, crafted to last — the Hammerex Tobacco Wallet keeps everything in its place.\n\n**HAMMEREX – Built Better. Work Smarter.**',
  '[
    {"icon":"check","label":"Dedicated tobacco pouch section"},
    {"icon":"check","label":"Separate lined cash compartment"},
    {"icon":"check","label":"Rear zip pocket for cards, coins, valuables"},
    {"icon":"check","label":"Integrated rolling-paper station"},
    {"icon":"check","label":"Soft-close press-stud fastening"},
    {"icon":"check","label":"Premium genuine leather"},
    {"icon":"check","label":"Premium stitching throughout"},
    {"icon":"check","label":"Compact everyday-carry profile"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'LEATHER · TOBACCO + CASH + ZIP + PAPER STATION', 202,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'tobacco-wallets'
and not exists (select 1 from public.hammerex_products where slug = 'tobacco-wallet-pro');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdfdsasasdasd.png',
  'Hammerex Leather Tobacco Wallet Pro — lined cash + tobacco + zip + paper station',
  0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-pro'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Vertical-only listing — no trade cross-list.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug = 'tobacco-wallet-pro' and c.slug = 'tobacco-wallets'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Leather Tobacco Wallet — Pro', 1, null, 0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-pro'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Outer',          'Premium genuine leather',                              0),
    ('Material',     'Stitching',      'Premium stitching throughout',                         1),
    ('Capacity',     'Tobacco',        'Dedicated tobacco pouch section',                     10),
    ('Capacity',     'Cash',           'Separate lined cash compartment (banknote-safe)',     11),
    ('Capacity',     'Cards & coins',  'Rear zip pocket for ATM cards, coins, valuables',     12),
    ('Capacity',     'Paper station',  'Integrated rolling-paper station',                    13),
    ('Design',       'Closure',        'Soft-close press-stud fastening',                     20),
    ('Design',       'Profile',        'Compact everyday-carry size',                         21),
    ('Pricing',      'Single unit',    '£22.00',                                              30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                             31),
    ('Stock',        'Availability',   'In stock',                                            40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',           41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Tobacco, papers, filters, lighter, cash, cards, coins', 50),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',          60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                      61)
  ) as v(g, l, val, s)
where p.slug = 'tobacco-wallet-pro'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
