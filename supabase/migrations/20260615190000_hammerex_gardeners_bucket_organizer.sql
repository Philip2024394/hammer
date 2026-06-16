-- HAMMEREX Gardeners Bucket Organizer — 14-pocket caddy that wraps a
-- standard 5-gal (19L) bucket. 1680D polyester, PVC backing, fabric carry
-- handles, water-resistant. £24.99 GBP (Rp 499,800 @ 20k/£) — sits mid-band
-- vs Bucket Boss / generic Amazon 1680D organizers (~£18–£30 online).
-- Primary category: garden. Cross-listed to landscaping, outdoor,
-- tool-bags-backpacks (tool-type filter) and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Gardeners Bucket Organizer',
  '14-pocket heavy-duty bucket caddy — fits any standard 5-gallon (19L) bucket. 1680D polyester with PVC backing, reinforced stitching, padded fabric carry handles. Keeps trowels, pruners, secateurs, gloves, twine and hand tools organised and within reach.',
  499800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasd.png',
  true,
  'gardeners-bucket-organizer', 'HX-GBO-001', 'Hammerex', 'HX-GBO', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Keep your gardening tools organised, protected, and always within easy reach with the **HAMMEREX® Gardeners Bucket Organizer**. Designed for gardeners, landscapers, groundskeepers, and outdoor professionals, this heavy-duty bucket caddy transforms a standard 5-gallon (19L) bucket into a portable workstation.\n\nConstructed from durable **1680D polyester with reinforced stitching**, the organiser is built to withstand demanding outdoor environments while keeping your essential tools neatly arranged and ready for use. The integrated fabric carry handles make transportation comfortable and convenient, allowing you to move your tools effortlessly around the garden, greenhouse, allotment, or job site.\n\n### Key Features\n\n* **14 Storage Pockets & Tool Loops** — organise trowels, pruners, gloves, markers, twine, hand forks, secateurs and more. Multiple pocket sizes accommodate a wide range of gardening tools and accessories.\n* **Heavy-Duty Construction** — premium 1680D polyester with reinforced webbing and stitching. Designed for long-lasting performance in outdoor conditions.\n* **Fits Most Standard 5-Gallon (19L) Buckets** — wraps securely around common bucket sizes, turning an ordinary bucket into an efficient storage and carrying solution.\n* **Comfortable Fabric Carry Handles** — built-in padded fabric handles provide easy lifting and transportation. Carry your tools safely without relying on the bucket handle alone.\n* **Water-Resistant Material** — helps protect your tools and accessories from everyday moisture and dirt.\n* **Quick Access Design** — keep frequently used tools visible and accessible while working. Spend less time searching and more time gardening.\n\n### Ideal For\n\n* Gardeners\n* Landscapers\n* Grounds Maintenance Teams\n* Garden Centres\n* Allotment Owners\n* DIY Enthusiasts\n* Outdoor Professionals\n\nWhether you''re planting, pruning, landscaping, or maintaining outdoor spaces, the HAMMEREX® Gardeners Bucket Organizer keeps your essential tools organised, protected, and ready for the task ahead.\n\n**HAMMEREX® – Work Hard. Grow Better.**',
  '[
    {"icon":"check","label":"14 storage pockets & tool loops"},
    {"icon":"check","label":"1680D polyester with PVC backing"},
    {"icon":"check","label":"Reinforced webbing and stitching"},
    {"icon":"check","label":"Fits any standard 5-gallon (19L) bucket"},
    {"icon":"check","label":"Padded fabric carry handles"},
    {"icon":"check","label":"Water-resistant material"},
    {"icon":"check","label":"Approx. 68 × 32 cm"},
    {"icon":"check","label":"Black with Hammerex yellow stitching"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Bucket not included — wraps any standard 5-gallon (19L) bucket.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 worldwide shipping via EMS Air Mail (5–6 days transit)."
  ]'::jsonb,
  null, '14-POCKET BUCKET CADDY', 36,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'garden'
and not exists (select 1 from public.hammerex_products where slug = 'gardeners-bucket-organizer');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasd.png',
  'Hammerex Gardeners Bucket Organizer — 14-pocket 1680D caddy, fits 5-gallon bucket',
  0
from public.hammerex_products p
where p.slug = 'gardeners-bucket-organizer'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to outdoor work surfaces + storage tool-type.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('garden', 0),
    ('landscaping', 1),
    ('outdoor', 2),
    ('tool-bags-backpacks', 3),
    ('new-products', 4)
  ) as v(slug, s)
where p.slug = 'gardeners-bucket-organizer' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Gardeners Bucket Organizer (1680D, 14 pocket)', 1, 0)
  ) as v(l, q, s)
where p.slug = 'gardeners-bucket-organizer'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Width',         'Approx. 68 cm',                                       0),
    ('Dimensions',   'Height',        'Approx. 32 cm',                                       1),
    ('Dimensions',   'Bucket fit',    'Most standard 5-gallon (19L) buckets',                2),
    ('Capacity',     'Pockets',       '14 storage pockets & tool loops',                    10),
    ('Capacity',     'Use case',      'Trowels, pruners, secateurs, gloves, twine, markers',11),
    ('Material',     'Fabric',        '1680D polyester with PVC backing',                   20),
    ('Material',     'Stitching',     'Reinforced webbing and stitching',                   21),
    ('Material',     'Water resist',  'Water-resistant for outdoor conditions',             22),
    ('Design',       'Carry',         'Padded fabric carry handles (bucket-independent)',   30),
    ('Design',       'Colour',        'Black with Hammerex yellow stitching',               31),
    ('Pricing',      'Single unit',   '£24.99',                                             40),
    ('Pricing',      'Bulk discounts','Buy 2 -10% · Buy 3 -15%',                            41),
    ('Stock',        'Availability',  'In stock',                                           50),
    ('Dispatch',     'Lead time',     'Dispatched within 3 working days of order',          51),
    ('Dispatch',     'Worldwide',     'Flat £20 EMS Air Mail · 5–6 days transit',           52),
    ('Use',          'Built for',     'Gardeners, landscapers, grounds teams, allotments',  60),
    ('Use',          'Environments',  'Gardens, greenhouses, allotments, job sites',        61),
    ('Build & care', 'Made in',       'Indonesia · Hammerex Official Distribution',         70),
    ('Build & care', 'Warranty',      '1 year (manufacturing defects)',                     71)
  ) as v(g, l, val, s)
where p.slug = 'gardeners-bucket-organizer'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
