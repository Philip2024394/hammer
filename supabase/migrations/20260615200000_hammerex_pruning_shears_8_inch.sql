-- HAMMEREX 8" Professional Pruning Shears — SK-5 steel blade with Teflon
-- coating, ergonomic non-slip handles, heavy-duty spring, integrated
-- safety lock. £14.99 GBP (Rp 299,800 @ 20k/£) — mid-band vs UK retail
-- (Spear & Jackson Razorsharp ~£14, Wilkinson Sword ~£14, Wickes ~£8).
-- Primary: garden. Cross-listed to landscaping, outdoor, new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  '8" Professional Pruning Shears',
  'Bypass pruning shears with SK-5 steel blade and Teflon coating for sap-free cutting. Ergonomic non-slip handles, heavy-duty spring, integrated safety lock. Built for orchard, landscaping and everyday garden work.',
  299800,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2015,%202026,%2011_29_59%20PM.png',
  true,
  'pruning-shears-8-inch', 'HX-PSH-001', 'Hammerex', 'HX-PSH', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'The **Hammerex 8 Inch Professional Pruning Shears** are built for precise, effortless cutting in the garden, orchard, or landscaping environment. Featuring a premium **SK-5 steel blade** with a durable **Teflon coating**, these shears deliver clean cuts while reducing friction and preventing sap build-up.\n\nDesigned for both professional and home users, the **ergonomic handles** provide a comfortable, secure grip for extended use. The **heavy-duty spring mechanism** ensures smooth operation, while the **integrated safety lock** keeps the blade securely closed when not in use.\n\nWhether you''re trimming flowers, pruning shrubs, or cutting small branches, the Hammerex Professional Pruning Shears offer the strength, durability, and reliability needed for everyday gardening tasks.\n\n### Features\n\n* Premium SK-5 steel blade for superior cutting performance\n* Durable Teflon-coated blade for smoother cutting action\n* 8-inch professional-grade design\n* Ergonomic non-slip handles for maximum comfort\n* Heavy-duty spring for reduced hand fatigue\n* Integrated safety lock for safe storage and transport\n* Ideal for pruning branches, shrubs, flowers, and fruit trees\n\n### Application\n\nGardening · Landscaping · Orchard maintenance · Allotment work · Hedge & shrub trimming\n\n**Sharp. Durable. Reliable. Built for Professional Results.**',
  '[
    {"icon":"check","label":"SK-5 steel blade for superior cutting"},
    {"icon":"check","label":"Teflon coating prevents sap build-up"},
    {"icon":"check","label":"8-inch professional-grade size"},
    {"icon":"check","label":"Ergonomic non-slip handles"},
    {"icon":"check","label":"Heavy-duty spring reduces hand fatigue"},
    {"icon":"check","label":"Integrated safety lock"},
    {"icon":"check","label":"For flowers, shrubs, branches, fruit trees"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 worldwide shipping via EMS Air Mail (5–6 days transit)."
  ]'::jsonb,
  null, '8" SHEARS · SK-5 · TEFLON', 37,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'garden'
and not exists (select 1 from public.hammerex_products where slug = 'pruning-shears-8-inch');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2015,%202026,%2011_29_59%20PM.png',
  'Hammerex 8" Professional Pruning Shears — SK-5 steel, Teflon coated, safety lock',
  0
from public.hammerex_products p
where p.slug = 'pruning-shears-8-inch'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to outdoor work surfaces.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('garden', 0),
    ('landscaping', 1),
    ('outdoor', 2),
    ('new-products', 3)
  ) as v(slug, s)
where p.slug = 'pruning-shears-8-inch' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex 8" Professional Pruning Shears', 1, 0)
  ) as v(l, q, s)
where p.slug = 'pruning-shears-8-inch'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Size',          '8 inches',                                            0),
    ('Blade',        'Material',      'SK-5 high-carbon steel',                             10),
    ('Blade',        'Finish',        'Teflon coated — sap-resistant, low friction',        11),
    ('Blade',        'Type',          'Bypass cut for clean shearing on live growth',       12),
    ('Mechanism',    'Spring',        'Heavy-duty return spring',                           20),
    ('Mechanism',    'Safety',        'Integrated safety lock button',                      21),
    ('Handle',       'Grip',          'Ergonomic non-slip handles',                         30),
    ('Pricing',      'Single unit',   '£14.99',                                             40),
    ('Pricing',      'Bulk discounts','Buy 2 -10% · Buy 3 -15%',                            41),
    ('Stock',        'Availability',  'In stock',                                           50),
    ('Dispatch',     'Lead time',     'Dispatched within 3 working days of order',          51),
    ('Dispatch',     'Worldwide',     'Flat £20 EMS Air Mail · 5–6 days transit',           52),
    ('Use',          'Built for',     'Gardeners, landscapers, orchard & grounds teams',    60),
    ('Use',          'Cuts',          'Flowers, shrubs, small branches, fruit trees',       61),
    ('Build & care', 'Made in',       'Indonesia · Hammerex Official Distribution',         70),
    ('Build & care', 'Warranty',      '1 year (manufacturing defects)',                     71)
  ) as v(g, l, val, s)
where p.slug = 'pruning-shears-8-inch'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
