-- New vertical: Tobacco Wallets. Brand stretch from trade tools into
-- leather everyday-carry. Starts with a single SKU — the Premium Leather
-- Tobacco Wallet with Paper Holder, £18 GBP (Rp 360,000 @ 20k/£).
-- Category is NOT a tool_type — it's a standalone vertical and is hidden
-- from the home-page primary rotation by giving it a high sort_order so
-- the trade buyer experience is not diluted.

insert into public.hammerex_categories (slug, name, image_url, sort_order, is_tool_type)
values (
  'tobacco-wallets',
  'Tobacco Wallets',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssds.png',
  900,
  false
)
on conflict (slug) do nothing;

-- Product.
insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Premium Leather Tobacco Wallet',
  'Premium leather everyday-carry wallet — integrated rolling-paper compartment, dedicated pockets for tobacco, filters, lighter, cash and cards. Snap closure, reinforced stitching, slim pocket-friendly profile.',
  360000,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssds.png',
  false,
  'tobacco-wallet-leather', 'HX-TBW-001', 'Hammerex', 'HX-TBW', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Keep your smoking essentials organised, protected and always within reach with the **HAMMEREX Premium Leather Tobacco Wallet**. Crafted from durable, high-quality leather, this compact wallet is designed to securely store your tobacco, rolling papers, filters, lighter, cash and cards in one convenient carry case.\n\nThe integrated paper holder keeps rolling papers flat, dry and easily accessible, while dedicated compartments help organise all your smoking accessories. Strong snap closures and reinforced stitching ensure your contents stay secure whether you''re at home, travelling or on the go.\n\nDesigned for everyday use, the slim and compact profile fits comfortably into your pocket, backpack or glove box without taking up unnecessary space. Combining practical functionality with rugged craftsmanship, this tobacco wallet is built to provide years of reliable service.\n\n### Features\n\n* Premium quality leather construction\n* Dedicated rolling-paper storage compartment\n* Holds tobacco, papers, filters, lighter, cash and cards\n* Secure snap-button closure\n* Compact and pocket-friendly design\n* Durable reinforced stitching\n* Organised multi-pocket layout\n* Ideal for everyday carry and travel\n\n### Benefits\n\n* Keeps smoking accessories organised and protected\n* Prevents rolling papers from bending or tearing\n* Quick access to tobacco and rolling essentials\n* Compact design fits easily in pockets and bags\n* Stylish handcrafted appearance with long-lasting durability\n\n### Perfect For\n\n* Tobacco Storage · Rolling Papers · Filters & Tips\n* Cash & Cards · Everyday Carry · Travel Use\n\n**HAMMEREX – Built Better. Work Smarter.** Premium quality, practical design and everyday convenience in one compact tobacco wallet.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Dedicated rolling-paper compartment"},
    {"icon":"check","label":"Pockets for tobacco, filters, lighter, cash, cards"},
    {"icon":"check","label":"Snap-button closure"},
    {"icon":"check","label":"Reinforced stitching"},
    {"icon":"check","label":"Slim pocket-friendly profile"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'PREMIUM LEATHER · PAPER HOLDER', 200,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'tobacco-wallets'
and not exists (select 1 from public.hammerex_products where slug = 'tobacco-wallet-leather');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledwerwerweerererdfssdfasdasdssds.png',
  'Hammerex Premium Leather Tobacco Wallet — paper holder + tobacco + cards + cash',
  0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-leather'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- No cross-listing — this is a deliberately segregated vertical so it does
-- not appear on trade-category pages.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, 0
from public.hammerex_products p,
  public.hammerex_categories c
where p.slug = 'tobacco-wallet-leather' and c.slug = 'tobacco-wallets'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Premium Leather Tobacco Wallet', 1, null, 0
from public.hammerex_products p
where p.slug = 'tobacco-wallet-leather'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Outer',          'Premium leather',                                     0),
    ('Material',     'Stitching',      'Reinforced stitching',                                1),
    ('Capacity',     'Paper holder',   'Dedicated rolling-paper compartment',                10),
    ('Capacity',     'Pockets',        'Tobacco · filters · lighter · cash · cards',         11),
    ('Design',       'Closure',        'Snap-button closure',                                20),
    ('Design',       'Profile',        'Slim and pocket-friendly',                           21),
    ('Pricing',      'Single unit',    '£18.00',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Tobacco, papers, filters, lighter, cash, cards',     50),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'tobacco-wallet-leather'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
