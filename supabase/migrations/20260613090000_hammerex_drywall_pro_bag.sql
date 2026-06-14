-- HAMMEREX Drywall Pro Bag — professional drywall tapers bag with D600
-- water-resistant fabric, twin-lined construction, holds 18" trowel + 2
-- scrapers + mud pan + drywall board + hand tools. £88 GBP (Rp 1,760,000
-- @ 20k/£) with bulk tiers 2/10%, 3/15%. Optional backpack straps or
-- standard carry — customer specifies on WhatsApp quote (no variant axis
-- so cart composite key stays productId+size+threadColor).
-- Primary category: drywall; cross-listed to plastering.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Drywall Pro Bag',
  'Professional drywall tapers bag — D600 water-resistant fabric, twin-lined construction, holds an 18" plastering trowel, 2 scraper knives, mud pan, drywall board and hand tools. Optional backpack straps or standard carry.',
  1760000,
  'https://ik.imagekit.io/pinky/asdasaaasss.png',
  true,
  'drywall-pro-bag', 'HX-DPB-001', 'Hammerex', 'HX-DPB', '14:00',
  1, 'United Kingdom',
  E'The **Drywall Pro Tapers Bag** is designed specifically for professional drywall finishers and plasterers who need a durable, practical, and organized tool storage solution on site.\n\nAvailable with **optional backpack straps** or a standard carry design, this versatile bag provides easy access to your essential tools while keeping everything secure and protected during transport.\n\n### Key Features\n\n* Stores **1 plastering trowel up to 18 inches**\n* Front storage for **2 scraper knives**\n* Side holder for a **mud pan**\n* Rear storage compartment for a **drywall board**\n* Large internal compartment for additional hand tools, accessories, and site essentials\n* Heavy-duty **D600 water-resistant fabric**\n* **Twin-lined construction** for enhanced durability and long service life\n* Designed for professional daily site use\n\n### Built for Professionals\n\nWhether you''re working on residential, commercial, or renovation projects, the Drywall Pro Tapers Bag keeps your tools organized, protected, and ready for the job. The practical layout allows quick access to frequently used tools while providing ample internal storage for everything else you need throughout the day.',
  '[
    {"icon":"check","label":"Stores 1 plastering trowel up to 18 inches"},
    {"icon":"check","label":"Front storage for 2 scraper knives"},
    {"icon":"check","label":"Side holder for a mud pan"},
    {"icon":"check","label":"Rear compartment for a drywall board"},
    {"icon":"check","label":"Large internal compartment for hand tools and site essentials"},
    {"icon":"check","label":"Heavy-duty D600 water-resistant fabric"},
    {"icon":"check","label":"Twin-lined construction for enhanced durability"},
    {"icon":"check","label":"Available with optional backpack straps or standard carry"},
    {"icon":"check","label":"Designed for professional daily site use"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Choose optional backpack straps or standard carry — let us know your preference when you send the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'DRYWALL PRO TAPERS BAG', 24,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'drywall'
and not exists (select 1 from public.hammerex_products where slug = 'drywall-pro-bag');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/asdasaaasss.png',
  'Hammerex Drywall Pro Tapers Bag — D600 water-resistant fabric, twin-lined, optional backpack straps',
  0
from public.hammerex_products p
where p.slug = 'drywall-pro-bag'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to drywall + plastering (drywall finishers and plasterers).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values ('drywall', 0), ('plastering', 1)) as v(slug, s)
where p.slug = 'drywall-pro-bag' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Drywall Pro Tapers Bag (carry style as specified)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'drywall-pro-bag'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowel',          'Holds 1 plastering trowel up to 18 inches',           0),
    ('Capacity',     'Scraper knives',  'Front storage for 2 scraper knives',                  1),
    ('Capacity',     'Mud pan',         'Side holder for a mud pan',                           2),
    ('Capacity',     'Drywall board',   'Rear compartment for a drywall board',                3),
    ('Capacity',     'Hand tools',      'Large internal compartment for tools and accessories', 4),
    ('Material',     'Fabric',          'Heavy-duty D600 water-resistant fabric',             10),
    ('Material',     'Construction',    'Twin-lined construction for enhanced durability',    11),
    ('Design',       'Carry options',   'Optional backpack straps or standard carry design',  20),
    ('Pricing',      'Single unit',     '£88.00',                                             30),
    ('Pricing',      'Bulk discounts',  'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',    'In stock',                                           40),
    ('Dispatch',     'Lead time',       'Dispatched within 3 working days of order',          41),
    ('Dispatch',     'UK delivery',     'Typical UK delivery within 5 working days',          42),
    ('Use',          'Built for',       'Drywall finishers, plasterers, tapers',              50),
    ('Use',          'Projects',        'Residential, commercial, renovation site use',       51),
    ('Build & care', 'Made in',         'United Kingdom',                                     60),
    ('Build & care', 'Warranty',        '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'drywall-pro-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
