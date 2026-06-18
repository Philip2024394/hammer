-- HAMMEREX Professional Plastering Bag — carry-style trowel + hawk bag,
-- holds 2× 18" trowels and 1× 18" hawk plus front pockets for hand tools.
-- £56 GBP (Rp 1,120,000 @ 20k/£). Sits below the £104.99 backpack-style
-- Plastering Pro Bag (HX-PPB-001) as the entry tier of the plastering
-- carry range — same trowel capacity but carry handles only (no straps).
-- Primary: plastering. Cross-listed to drywall, rendering,
-- venetian-plastering, tool-bags-backpacks and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Professional Plastering Bag',
  'Carry-style plastering bag — 2× 18" trowel slots + 1× 18" hawk compartment, front pockets for hand tools, water-repellent industrial fabric, rigid lined structure that holds shape loaded or empty. Heavy-duty carry handles + reinforced stress points.',
  1120000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2017,%202026,%2006_02_40%20AM.png',
  true,
  'plasterer-carry-bag', 'HX-PCB-001', 'Hammerex', 'HX-PCB', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'**Built Strong. Works Stronger.**\n\nThe **HAMMEREX Professional Plastering Bag** has been specifically designed for plasterers, renderers and tradesmen who need a durable, organised and reliable way to transport their essential tools to and from site.\n\nFeaturing dedicated storage for **up to two plastering trowels up to 18 inches** and a **plastering hawk up to 18 inches**, this heavy-duty bag keeps your most important tools protected, organised and ready for work.\n\nConstructed from **industrial-grade materials** and reinforced with **heavy-duty industrial stitching**, the bag is built to withstand the demands of daily site use. The water-repellent outer fabric helps protect your tools from light rain, splashes and harsh jobsite conditions.\n\nThe bag incorporates a **rigid lined structure** that helps maintain its shape whether fully loaded or empty, making tool access quick and convenient throughout the working day.\n\n### Key Features\n\n* Holds **2 plastering trowels up to 18"**\n* Fits **1 plastering hawk up to 18"**\n* Multiple **front storage pockets** for smaller tools, pencils, markers, knives, scrapers, measuring tools and accessories\n* Large internal compartment for additional site essentials\n* Industrial-strength stitching for maximum durability\n* Water-repellent outer material\n* Structured lined construction helps maintain bag shape\n* Heavy-duty carry handles and reinforced stress points\n* Designed specifically for plasterers, renderers and construction professionals\n\n### Built for the Trade\n\nWhether you''re carrying finishing trowels, plastering hawks, small hand tools or everyday site essentials, the HAMMEREX Plastering Bag provides the durability, organisation and professional appearance demanded by modern tradesmen.\n\n**HAMMEREX – Built Strong. Works Stronger.**',
  '[
    {"icon":"check","label":"Holds 2 plastering trowels up to 18\""},
    {"icon":"check","label":"Fits 1 plastering hawk up to 18\""},
    {"icon":"check","label":"Multiple front storage pockets for hand tools"},
    {"icon":"check","label":"Large internal compartment for site essentials"},
    {"icon":"check","label":"Industrial-strength stitching"},
    {"icon":"check","label":"Water-repellent outer material"},
    {"icon":"check","label":"Rigid lined structure — holds shape loaded or empty"},
    {"icon":"check","label":"Heavy-duty carry handles + reinforced stress points"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Trowels and hawk shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "UK / USA / Australia: £30 minimum order. £28 shipping on £30–£49, £20 flat once you reach £50. Dispatched via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'CARRY BAG · 2 × 18" TROWEL + 18" HAWK', 45,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'plasterer-carry-bag');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2017,%202026,%2006_02_40%20AM.png',
  'Hammerex Professional Plastering Bag — carry-style with 2 × 18" trowel slots, 18" hawk compartment, front pockets',
  0
from public.hammerex_products p
where p.slug = 'plasterer-carry-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering-adjacent trades + storage tool-type.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('plastering', 0),
    ('rendering', 1),
    ('drywall', 2),
    ('venetian-plastering', 3),
    ('tool-bags-backpacks', 4),
    ('new-products', 5)
  ) as v(slug, s)
where p.slug = 'plasterer-carry-bag' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Professional Plastering Bag (empty)', 1, null, 0
from public.hammerex_products p
where p.slug = 'plasterer-carry-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowels',        'Holds 2 plastering trowels up to 18"',                 0),
    ('Capacity',     'Hawk',           'Fits 1 plastering hawk up to 18"',                     1),
    ('Capacity',     'Front',          'Multiple front pockets for hand tools, markers, knives, scrapers', 2),
    ('Capacity',     'Main',           'Large internal compartment for site essentials',       3),
    ('Material',     'Fabric',         'Industrial-grade water-repellent outer',              10),
    ('Material',     'Stitching',      'Heavy-duty industrial stitching',                     11),
    ('Material',     'Structure',      'Rigid lined construction — holds shape loaded or empty', 12),
    ('Carry',        'Handles',        'Heavy-duty carry handles + reinforced stress points', 20),
    ('Pricing',      'Single unit',    '£56.00',                                              30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                             31),
    ('Stock',        'Availability',   'In stock',                                            40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',           41),
    ('UK / USA / AU','Shipping',       '£28 (£30–£49 cart) · £20 flat (£50+ cart) · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Plasterers, renderers, drywall finishers',            50),
    ('Use',          'Environments',   'Construction sites, workshops, training courses',     51),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',          60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                      61)
  ) as v(g, l, val, s)
where p.slug = 'plasterer-carry-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
