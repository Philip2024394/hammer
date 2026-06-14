-- HAMMEREX Carpenter's Wood Chisel & Hammer Belt Holder — chisel compartment
-- (up to 1½") plus dedicated claw hammer station, premium leather, belts up to 75mm.
-- £16.80 GBP (Rp 336,000 @ 20k/£). Primary category: carpentry.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Wood Chisel And Hammer Holder',
  'Premium leather chisel + claw hammer belt holder — fits chisels up to 1½", all common claw hammer sizes, belts up to 75mm.',
  336000,
  'https://ik.imagekit.io/pinky/Untitledasdaaaaaaasssdsdfsdf.png?updatedAt=1781285001481',
  true,
  'wood-chisel-and-hammer-holder', 'HX-WCHH-001', 'Hammerex', 'HX-WCHH', '14:00',
  1, 'United Kingdom',
  E'**Chisel. Hammer. Always to hand.**\n\nDesigned for professional carpenters and woodworking enthusiasts, the HAMMEREX Carpenter''s Wood Chisel & Hammer Belt Holder keeps your essential tools protected, organised, and within easy reach while you work.\n\nCrafted from premium leather and reinforced with high-quality stud placements, this durable holder is built to withstand the demands of daily workshop and site use. The integrated chisel compartment safely stores and protects wood chisels up to 1½" wide, helping to prevent blade damage while keeping your tools readily accessible.\n\nA dedicated hammer station securely holds claw hammers of all common sizes, with the holder designed to accommodate a wide range of handle and shank profiles for a reliable fit.\n\nWhether you''re fitting doors, framing, cabinet making, or carrying out detailed joinery work, the HAMMEREX Carpenter''s Wood Chisel & Hammer Belt Holder provides a practical and durable solution for keeping your most important tools close at hand.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Heavy-duty reinforced stud placements"},
    {"icon":"check","label":"Stores and protects wood chisels up to 1½\" wide"},
    {"icon":"check","label":"Dedicated claw hammer holder"},
    {"icon":"check","label":"Fits most claw hammer handle and shank sizes"},
    {"icon":"check","label":"Quick access to essential woodworking tools"},
    {"icon":"check","label":"Built for daily site and workshop use"},
    {"icon":"check","label":"Fits work belts up to 75mm wide"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "In stock — dispatched within 3 working days.",
    "Pairs with any HAMMEREX leather tool belt up to 75mm wide.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'CHISEL + HAMMER STATION', 18
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'wood-chisel-and-hammer-holder');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/Untitledasdaaaaaaasssdsdfsdf.png?updatedAt=1781285001481',
  'Hammerex Wood Chisel And Hammer Holder — premium leather, chisel compartment + claw hammer station',
  0
from public.hammerex_products p
where p.slug = 'wood-chisel-and-hammer-holder'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to carpentry only (trade-specific).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'wood-chisel-and-hammer-holder' and c.slug = 'carpentry'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Wood Chisel And Hammer Holder', 1, 0),
    ('Reinforced stud placements',             1, 1),
    ('Universal belt loop (up to 75mm)',       1, 2)
  ) as v(l, q, s)
where p.slug = 'wood-chisel-and-hammer-holder'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                  0),
    ('Material',     'Reinforcement',  'Heavy-duty stud placements',                       1),
    ('Capacity',     'Chisels',        'Compartment fits wood chisels up to 1½" (38mm)',  10),
    ('Capacity',     'Hammer',         'Dedicated station — all common claw hammer sizes', 11),
    ('Design',       'Edge guard',     'Compartment protects chisel cutting edges',        20),
    ('Fit',          'Belt loop',      'Fits belts up to 75mm wide',                       30),
    ('Pricing',      'Single unit',    '£16.80',                                           40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Carpenters, joiners — door fitting, framing, cabinet making, joinery', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'wood-chisel-and-hammer-holder'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
