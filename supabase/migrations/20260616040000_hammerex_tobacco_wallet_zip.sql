-- Second SKU in the Tobacco Wallets vertical — leather wallet with rear
-- zip pocket, separated tobacco compartment and soft-close studs.
-- £19.99 GBP (Rp 399,800 @ 20k/£). Sits just above the £18 paper-holder
-- wallet — premium tier of the same range (zip + internal divider).
-- Same isolation pattern: home_sort_order high so it stays off the trade
-- rotation, no cross-listing into trade categories.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Leather Tobacco Wallet — Zip Pocket',
  'Premium leather everyday-carry wallet — separated tobacco compartment, internal divider between cash and tobacco, rear zippered pocket for ATM cards and cash, soft-close press studs. Rounded low-profile front to reduce snagging in workwear pockets.',
  399800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdf.png',
  false,
  'tobacco-wallet-zip', 'HX-TBW-002', 'Hammerex', 'HX-TBW-Z', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'### Secure. Compact. Always with you.\n\nBuilt for workers who demand practicality and durability, the **HAMMEREX Tobacco Wallet** keeps your tobacco, cash and essential cards organised in one compact carry solution. Crafted from premium leather with reinforced stitching, this wallet is designed to withstand the harsh conditions of everyday site work while remaining comfortable in your pocket.\n\nThe intelligently designed interior features a **separated tobacco compartment**, keeping your tobacco fresh and isolated from cash notes and personal items. A dedicated rear lining creates a barrier between tobacco and currency, ensuring your contents remain clean and organised at all times.\n\nThe **rear zippered pocket** provides secure storage for cash, ATM cards, identification and other valuables, giving you quick access when needed without disturbing your tobacco storage area.\n\nFeaturing **soft-close press studs**, the wallet opens and closes smoothly while maintaining a secure hold throughout the day. The rounded, low-profile front edges help reduce snagging and chafing when carried in workwear pockets, making it ideal for busy onsite environments.\n\n### Features\n\n* Premium leather construction\n* Separate tobacco storage compartment\n* Internal divider keeps cash notes away from tobacco\n* Secure rear zip pocket for ATM cards and cash\n* Soft-close snap button closure\n* Reduced front-edge chafing design\n* Compact everyday carry size\n* Heavy-duty stitching for long-lasting durability\n* Ideal for construction sites, workshops and everyday use\n\n### Perfect For\n\n* Tobacco storage · Rolling papers · Filters and tips\n* Cash and cards · Everyday carry\n\n**HAMMEREX – Built Better. Work Smarter.**',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Separated tobacco compartment"},
    {"icon":"check","label":"Internal divider — cash isolated from tobacco"},
    {"icon":"check","label":"Rear zip pocket for cards and cash"},
    {"icon":"check","label":"Soft-close press-stud closure"},
    {"icon":"check","label":"Rounded low-profile front (anti-snag)"},
    {"icon":"check","label":"Heavy-duty reinforced stitching"},
    {"icon":"check","label":"Compact everyday-carry size"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'LEATHER · ZIP POCKET · DIVIDER', 201,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'tobacco-wallets'
and not exists (select 1 from public.hammerex_products where slug = 'tobacco-wallet-zip');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssdsdssdf.png',
  'Hammerex Leather Tobacco Wallet — separated tobacco compartment, rear zip pocket',
  0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-zip'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Vertical-only listing — no trade cross-list.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug = 'tobacco-wallet-zip' and c.slug = 'tobacco-wallets'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Leather Tobacco Wallet — Zip Pocket', 1, null, 0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-zip'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Outer',          'Premium leather',                                     0),
    ('Material',     'Stitching',      'Heavy-duty reinforced stitching',                     1),
    ('Capacity',     'Tobacco',        'Separated tobacco compartment',                      10),
    ('Capacity',     'Cash',           'Internal divider keeps cash isolated from tobacco',  11),
    ('Capacity',     'Cards',          'Rear zip pocket for ATM cards and cash',             12),
    ('Design',       'Closure',        'Soft-close press studs',                             20),
    ('Design',       'Front edge',     'Rounded low-profile (reduced workwear snag)',        21),
    ('Design',       'Profile',        'Compact, pocket-friendly',                           22),
    ('Pricing',      'Single unit',    '£19.99',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Tobacco, papers, filters, lighter, cash, cards',     50),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'tobacco-wallet-zip'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
