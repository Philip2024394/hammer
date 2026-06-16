-- HAMMEREX Electrician Double Pouch Tool Belt Slide — 3-pocket slide-on
-- belt pouch with magnetic screw lip, tape-measure dock, hammer holder,
-- cable loop and electrical-tape chain hanger. £45 GBP (Rp 900,000 @
-- 20k/£). Sits above the £39.99 Pro Pouch as the upgrade tier — more
-- pockets + project-side workstation + magnetic lip + chain hanger.
-- Primary: electrical. Cross-listed to HVAC (maintenance), carpentry
-- (construction professionals), tool-bags-backpacks and new-products.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, qty_discount_tiers
)
select c.id,
  'Electrician Double Pouch Belt Slide',
  'Slide-on belt pouch with 3 main pockets + project-side workstation, magnetic screw-holder lip, tape-measure dock, universal hammer holder, cable holder loop and insulation-tape chain hanger. Fits belts up to 6 cm wide.',
  900000,
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2017,%202026,%2001_18_58%20AM.png?updatedAt=1781633958472',
  true,
  'electrician-double-pouch-belt-slide', 'HX-EDP-001', 'Hammerex', 'HX-EDP', '14:00',
  1, 'Indonesia · Hammerex Official Distribution',
  E'Designed for professional electricians and tradespeople, the **HAMMEREX Electrician Double Pouch Tool Belt Slide** delivers exceptional organisation, durability and convenience on the job.\n\nFeaturing **3 main storage pockets**, this versatile tool belt provides ample space for essential hand tools, fasteners, connectors and accessories. The integrated **project-side workstation** keeps frequently used items within easy reach, helping improve productivity and efficiency throughout the workday.\n\nThe belt includes a **magnetic screw-holder lip** for quick access to screws, bolts and small metal components, reducing the risk of dropped hardware when working at height or in confined spaces. A dedicated **tape-measure dock** securely accommodates virtually all tape measure sizes, while the heavy-duty **hammer holder** is designed to fit most hammer brands and models.\n\nAn integrated **cable-holder loop** provides a convenient solution for carrying electrical cable, conduit straps, rolls of tape or bundled wire, ensuring essential materials remain organised and easily accessible while working on-site. The addition of an **insulation-tape chain hanger** allows electricians to carry multiple rolls of electrical tape for fast access during installation, maintenance and repair tasks.\n\nConstructed from durable, wear-resistant materials with **reinforced stitching and riveted stress points**, the HAMMEREX Double Pouch Tool Belt Slide is built to withstand demanding jobsite conditions while maintaining its shape and performance.\n\n### Features\n\n* 3 large main storage pockets\n* Integrated project-side workstation\n* Magnetic screw-holder lip\n* Dedicated cable holder loop\n* Insulation-tape chain hanger\n* Fits most tape measure sizes\n* Universal hammer holder\n* Reinforced rivet construction\n* Heavy-duty, durable design\n* Slide-on belt design for quick positioning\n* Suitable for belts up to 6 cm wide\n* Maintains shape under continuous use\n* Ideal for electricians, maintenance technicians and construction professionals\n\n**Built for professionals. Designed to perform.**\n\n**HAMMEREX – Carry More. Work Smarter.**',
  '[
    {"icon":"check","label":"3 main storage pockets"},
    {"icon":"check","label":"Integrated project-side workstation"},
    {"icon":"check","label":"Magnetic screw-holder lip"},
    {"icon":"check","label":"Tape-measure dock — fits most sizes"},
    {"icon":"check","label":"Universal hammer holder"},
    {"icon":"check","label":"Cable holder loop"},
    {"icon":"check","label":"Insulation-tape chain hanger"},
    {"icon":"check","label":"Reinforced stitching + rivet construction"},
    {"icon":"check","label":"Slide-on design — fits belts up to 6 cm"},
    {"icon":"check","label":"Maintains shape under daily use"}
  ]'::jsonb,
  'GBP', 3, false,
  '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Tools shown for illustration — not included.",
    "Belt sold separately — pouch slides onto any belt up to 6 cm wide.",
    "In stock — dispatched within 3 working days.",
    "Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout."
  ]'::jsonb,
  null, 'DOUBLE POUCH · MAGNETIC LIP · CHAIN HANGER', 43,
  '[
    {"min":2,"pct":10},
    {"min":3,"pct":15}
  ]'::jsonb
from public.hammerex_categories c
where c.slug = 'electrical'
and not exists (select 1 from public.hammerex_products where slug = 'electrician-double-pouch-belt-slide');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2017,%202026,%2001_18_58%20AM.png?updatedAt=1781633958472',
  'Hammerex Electrician Double Pouch Belt Slide — 3-pocket pouch with magnetic lip, tape dock, hammer holder, cable loop, tape chain hanger',
  0
from public.hammerex_products p
where p.slug = 'electrician-double-pouch-belt-slide'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list across the trades the listing names.
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
where p.slug = 'electrician-double-pouch-belt-slide' and c.slug = v.slug
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, 'Hammerex Electrician Double Pouch Belt Slide (empty)', 1, null, 0
from public.hammerex_products p
where p.slug = 'electrician-double-pouch-belt-slide'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Durable wear-resistant fabric',                       0),
    ('Material',     'Construction',   'Reinforced stitching + riveted stress points',        1),
    ('Material',     'Shape',          'Maintains shape under continuous daily use',          2),
    ('Capacity',     'Main',           '3 large storage pockets',                            10),
    ('Capacity',     'Workstation',    'Project-side workstation for quick-access items',    11),
    ('Holders',      'Magnetic lip',   'Magnetic screw-holder lip — catches dropped hardware', 20),
    ('Holders',      'Tape measure',   'Tape-measure dock fits most tape sizes',             21),
    ('Holders',      'Hammer',         'Universal hammer holder — fits most brands/models',  22),
    ('Holders',      'Cable loop',     'Cable / conduit-strap / wire-bundle carry loop',     23),
    ('Holders',      'Tape chain',     'Insulation-tape chain hanger — multi-roll carry',    24),
    ('Carry',        'Mounting',       'Slide-on belt design for quick positioning',         30),
    ('Carry',        'Belt fit',       'Fits belts up to 6 cm wide',                         31),
    ('Pricing',      'Single unit',    '£45.00',                                             40),
    ('Pricing',      'Bulk discounts', 'Buy 2 -10% · Buy 3 -15%',                            41),
    ('Stock',        'Availability',   'In stock',                                           50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',          51),
    ('UK / USA / AU','Shipping',       'Flat £20 to UK / USA / AU · others quoted on WhatsApp', 52),
    ('Use',          'Built for',      'Electricians, maintenance techs, construction pros', 60),
    ('Build & care', 'Made in',        'Indonesia · Hammerex Official Distribution',         70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                     71)
  ) as v(g, l, val, s)
where p.slug = 'electrician-double-pouch-belt-slide'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
