-- HAMMEREX Venetian Plastering Trowel Holder & Putty Knife Roll —
-- compact roll-up for up to 4 Venetian trowels plus putty-knife / scraper
-- compartments. £32 GBP (Rp 640,000 @ 20k/£). Sits above the 3-trowel roll
-- holder (£22) and below the 5-trowel + hawk (£27.99) — reflects the
-- 4-trowel slots + dedicated finishing-tool pockets premium.
-- Primary: venetian-plastering. Cross-listed to plastering,
-- tool-bags-backpacks (tool-type) and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Venetian Trowel Holder & Putty Knife Roll',
  'Compact roll-up holder — holds up to 4 Venetian plastering trowels plus dedicated pockets for putty knives, scrapers and finishing tools. Reinforced stitching, comfortable carry handle, protective separation between blades.',
  640000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2016,%202026,%2007_05_15%20AM.png',
  true,
  'venetian-trowel-holder', 'HX-VTH-001', 'Hammerex', 'HX-VTH', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Keep your premium finishing tools protected, organised and ready for work with the **HAMMEREX Venetian Plastering Trowel Holder**. Designed specifically for decorative plasterers, Venetian plaster applicators and finishing professionals, this compact storage roll securely holds up to **4 Venetian plastering trowels** while providing dedicated storage for **putty knives, scrapers and finishing tools**.\n\nCrafted from heavy-duty materials with reinforced stitching, this tool holder protects valuable trowel blades from scratches, dents and damage during transport and storage. Individual compartments keep tools separated and secure, preventing metal-to-metal contact and extending the life of your finishing equipment.\n\nThe compact roll-up design features a comfortable carry handle, making it easy to transport between jobs, workshops and training courses. Whether you''re working with Venetian plaster, microcement, polished plaster, stucco or decorative finishes, your tools remain organised, protected and instantly accessible.\n\n### Features\n\n* Holds up to **4 Venetian plastering trowels**\n* Dedicated pockets for **putty knives, scrapers and finishing tools**\n* Protects trowel blades from scratches and damage\n* Compact roll-up design for easy transport and storage\n* Comfortable integrated carry handle\n* Durable construction with reinforced stitching\n* Keeps tools organised, secure and job-site ready\n* Suitable for professional plasterers, decorators and finishing trades\n\n### Ideal For\n\n* Venetian Plastering\n* Polished Plaster\n* Microcement Application\n* Decorative Finishes\n* Stucco Work\n* Feature Wall Installation\n* Professional Finishing Trades\n\n**Protect your investment, stay organised and carry your finishing tools with confidence using the Hammerex Venetian Plastering Trowel Holder.**',
  '[
    {"icon":"check","label":"Holds up to 4 Venetian trowels"},
    {"icon":"check","label":"Dedicated pockets for putty knives, scrapers and finishing tools"},
    {"icon":"check","label":"Individual compartments prevent metal-to-metal contact"},
    {"icon":"check","label":"Compact roll-up design"},
    {"icon":"check","label":"Comfortable integrated carry handle"},
    {"icon":"check","label":"Reinforced stitching for daily site use"},
    {"icon":"check","label":"For Venetian, microcement, polished plaster, stucco"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Trowels and putty knives shown for illustration — not included.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'VENETIAN TROWEL ROLL · 4 SLOTS', 40,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'venetian-plastering'
and not exists (select 1 from public.hammerex_products where slug = 'venetian-trowel-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2016,%202026,%2007_05_15%20AM.png',
  'Hammerex Venetian Plastering Trowel Holder & Putty Knife Roll — 4 trowel slots + finishing-tool pockets',
  0
from public.hammerex_products p
where p.slug = 'venetian-trowel-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list venetian-plastering primary + plastering + storage tool-type + new-products.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('venetian-plastering', 0),
    ('plastering', 1),
    ('tool-bags-backpacks', 2),
    ('new-products', 3)
  ) as v(slug, s)
where p.slug = 'venetian-trowel-holder' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Venetian Plastering Trowel Holder (roll, 4-slot)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'venetian-trowel-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Capacity',     'Trowels',        'Up to 4 Venetian plastering trowels',                 0),
    ('Capacity',     'Finishing tools','Dedicated pockets for putty knives + scrapers',       1),
    ('Capacity',     'Separation',     'Individual slots prevent blade-to-blade contact',     2),
    ('Material',     'Stitching',      'Reinforced stitching throughout',                    10),
    ('Material',     'Protection',     'Heavy-duty body protects blades in transit',         11),
    ('Design',       'Format',         'Roll-up — compact when stored or carried',           20),
    ('Design',       'Carry',          'Integrated comfortable carry handle',                21),
    ('Pricing',      'Single unit',    '£32.00',                                             30),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            31),
    ('Stock',        'Availability',   'In stock',                                           40),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          41),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 42),
    ('Use',          'Built for',      'Venetian plasterers, microcement & polished plaster crews', 50),
    ('Use',          'Finishes',       'Venetian, microcement, polished plaster, stucco, decorative', 51),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         60),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     61)
  ) as v(g, l, val, s)
where p.slug = 'venetian-trowel-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
