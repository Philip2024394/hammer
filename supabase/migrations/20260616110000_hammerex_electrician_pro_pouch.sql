-- HAMMEREX Electrician Pro Pouch™ — belt-mount tool pouch with multimeter
-- holster, tape clip, electrical-tape holder and hammer loop. Heavy-duty
-- ballistic fabric, riveted stress points, fits belts up to 3" wide.
-- £39.99 GBP (Rp 799,800 @ 20k/£). Sits alongside the Leg Tool Holder
-- (£39.99) — same tier, different mounting style: leg vs belt-pouch.
-- Primary: electrical. Cross-listed to HVAC (maintenance), carpentry
-- (general construction), tool-bags-backpacks and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Electrician Pro Pouch',
  'Belt-mount electrician''s pouch — heavy-duty ballistic fabric, riveted stress points, dedicated multimeter holster, front tape-measure clip, integrated electrical-tape holder and reinforced hammer loop. 12" H × 10" W × 5" D. Fits belts up to 3" wide.',
  799800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitledxzxzxasdssa.png',
  true,
  'electrician-pro-pouch', 'HX-EPP-001', 'Hammerex', 'HX-EPP', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Stay organised and work efficiently with the **HAMMEREX Electrician Pro Pouch™**, a durable and versatile tool belt holder designed specifically for electricians, technicians, installers and maintenance professionals.\n\nConstructed from premium **heavy-duty ballistic fabric** with reinforced stitching and **riveted stress points**, this pouch is built to withstand the demands of daily job-site use while keeping your essential tools organised and within easy reach.\n\nThe pouch features a practical storage layout designed around the tools electricians use most. A large **rear pocket** provides space for cable ties, long fasteners, markers and other slim accessories. The spacious **main compartment** accommodates hand tools and everyday job-site essentials, while two **front utility pockets** offer quick access to frequently used items.\n\nA dedicated side holder securely carries a **multimeter or testing device**, while the **front-mounted tape-measure clip** keeps your tape measure readily accessible. An integrated **electrical-tape holder** provides convenient storage for insulation tape, and the **reinforced hammer loop** ensures your hammer remains secure and within reach throughout the workday.\n\nThe universal belt attachment fits belts up to **3 inches wide**, delivering comfort and stability for all-day wear.\n\n### Storage Features\n\n* Large rear pocket for cable ties, markers and slim accessories\n* Spacious main tool compartment\n* Two front utility pockets for quick-access tools\n* Dedicated multimeter holder\n* Front tape-measure clip\n* Integrated electrical-tape holder\n* Reinforced hammer loop\n* Durable water-resistant construction\n\n### Ideal For\n\n* Electricians · Electrical Contractors · Maintenance Technicians\n* Service Professionals · Installers · Construction Workers · DIY Professionals\n\n**HAMMEREX Electrician Pro Pouch™ — Designed for the Tools You Use Every Day.**',
  '[
    {"icon":"check","label":"Heavy-duty ballistic fabric construction"},
    {"icon":"check","label":"Riveted stress points + reinforced stitching"},
    {"icon":"check","label":"Dedicated multimeter holster"},
    {"icon":"check","label":"Front tape-measure clip"},
    {"icon":"check","label":"Integrated electrical-tape holder"},
    {"icon":"check","label":"Reinforced hammer loop"},
    {"icon":"check","label":"Large rear pocket for cable ties, markers"},
    {"icon":"check","label":"Two front utility pockets"},
    {"icon":"check","label":"Fits belts up to 3 inch (76 mm) wide"},
    {"icon":"check","label":"Reinforced ergonomic carry handle"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "Belt sold separately — pouch fits any standard tool belt up to 3 inches wide.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'ELECTRICIAN PRO POUCH · BELT MOUNT', 42,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'electrician-pro-pouch');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitledxzxzxasdssa.png',
  'Hammerex Electrician Pro Pouch — ballistic-fabric belt pouch with multimeter holster + tape clip + hammer loop',
  0
from public.hammerex_products p
where p.slug = 'electrician-pro-pouch'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list across trades the listing names.
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, v.s
from public.hammerex_products p,
  public.hammerex_categories c,
  (values
    ('electrical', 0),
    ('hvac', 1),
    ('carpentry', 2),
    ('tool-bags-backpacks', 3),
    ('new-products', 4)
  ) as v(slug, s)
where p.slug = 'electrician-pro-pouch' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Electrician Pro Pouch (empty)', 1, null, 0
from public.hammerex_products p
where p.slug = 'electrician-pro-pouch'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions',   'Height',         '12 inch (30 cm)',                                     0),
    ('Dimensions',   'Width',          '10 inch (25 cm)',                                     1),
    ('Dimensions',   'Depth',          '5 inch (13 cm)',                                      2),
    ('Material',     'Body',           'Premium heavy-duty ballistic fabric',                10),
    ('Material',     'Construction',   'Reinforced industrial stitching with heavy-duty rivets', 11),
    ('Material',     'Colour',         'Black with high-visibility yellow stitching',        12),
    ('Capacity',     'Main',           'Spacious main tool compartment',                     20),
    ('Capacity',     'Front',          'Two front utility pockets for quick-access tools',   21),
    ('Capacity',     'Rear',           'Large rear pocket for cable ties + markers + slim accessories', 22),
    ('Holders',      'Multimeter',     'Dedicated side multimeter / tester holster',         30),
    ('Holders',      'Tape measure',   'Front quick-access tape clip',                       31),
    ('Holders',      'Electrical tape','Integrated side electrical-tape holder',             32),
    ('Holders',      'Hammer',         'Reinforced hammer loop',                             33),
    ('Carry',        'Belt',           'Universal belt attachment — fits belts up to 3" (76 mm)', 40),
    ('Carry',        'Handle',         'Reinforced ergonomic carry grip',                    41),
    ('Pricing',      'Single unit',    '£39.99',                                             50),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            51),
    ('Stock',        'Availability',   'In stock',                                           60),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          61),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 62),
    ('Use',          'Built for',      'Electricians, contractors, maintenance, installers', 70),
    ('Use',          'Environments',   'Construction sites, service jobs, installation work',71),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         80),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     81)
  ) as v(g, l, val, s)
where p.slug = 'electrician-pro-pouch'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
