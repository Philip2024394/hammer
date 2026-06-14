-- HAMMEREX Premium Laptop Case — leather-look case with reinforced stitching
-- and clear front display window. Two closure styles (Zip / Flap) crossed
-- with nine size options (11" → 18"), giving 18 selectable variants. Same
-- price within each size; linear pricing £0.43/inch between user-confirmed
-- endpoints (£17.99 at 11" → £21.00 at 18"), rounded to clean .49/.99/.00
-- endings for retail convention. Optional adjustable shoulder strap is a
-- WhatsApp-quote add-on note (kept off the variant axis to avoid 54
-- combinations). Primary category: carpentry. is_universal=true.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order, is_universal
)
select c.id,
  'Hammerex Premium Laptop Case',
  'Rugged leather-look laptop case — choose your size (11" to 18") and closure style (Zip or Flap). Clear front display window, reinforced stitching, soft inner lining.',
  359800,
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png',
  true,
  'laptop-case', 'HX-LPC-001', 'Hammerex', 'HX-LPC', '14:00',
  1, 'United Kingdom',
  E'# **HAMMEREX Premium Laptop Case – Zip & Flap Styles Available**\n\nBuilt tough for hardworking professionals, the **HAMMEREX Laptop Case** delivers superior protection with a rugged industrial-inspired design. Whether you''re on a construction site, travelling between jobs, or working in the office, this case keeps your laptop safe, secure, and ready to perform.\n\nCrafted from premium leather-look material with reinforced stitching, the HAMMEREX Laptop Case protects against scratches, dust, bumps, and everyday wear. The clear front display window allows you to showcase your HAMMEREX branding while maintaining a professional appearance.\n\nChoose between the secure **Zip Style** for maximum protection or the convenient **Flap Style** for quick access. Both options feature a soft inner lining to help prevent scratches and keep your device protected during transport.\n\n**Key Features:**\n* Available in Zip Closure or Flap Closure styles\n* Premium heavy-duty leather-look exterior\n* Soft protective inner lining\n* Reinforced industrial-strength stitching\n* Clear front display window design\n* Lightweight and easy to carry\n* Optional adjustable shoulder strap available (request on WhatsApp quote)\n* Suitable for work, travel, office, and everyday use\n* Available in all standard laptop sizes from 11" to 18"\n* Custom sizing available upon request\n\n**Available Sizes:**\n\n11" · 12" · 13" · 14" · 15" · 15.6" · 16" · 17" · 18"\n\n**Built to Protect. Designed to Perform.**\n\nHAMMEREX – Built Strong. Works Stronger.',
  '[
    {"icon":"check","label":"Choose Zip or Flap closure"},
    {"icon":"check","label":"Premium heavy-duty leather-look exterior"},
    {"icon":"check","label":"Soft protective inner lining"},
    {"icon":"check","label":"Reinforced industrial-strength stitching"},
    {"icon":"check","label":"Clear front display window"},
    {"icon":"check","label":"Lightweight and easy to carry"},
    {"icon":"check","label":"Optional adjustable shoulder strap (request on quote)"},
    {"icon":"check","label":"Standard sizes 11\" to 18\" — custom sizes on request"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "Pick your laptop size AND closure style above — Zip or Flap, 11\" through 18\".",
    "Optional adjustable shoulder strap — request on the WhatsApp quote.",
    "Custom sizes available — request on the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb,
  null, 'LAPTOP CASE — CHOOSE SIZE & CLOSURE', 47, true
from public.hammerex_categories c
where c.slug = 'carpentry'
and not exists (select 1 from public.hammerex_products where slug = 'laptop-case');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png',
  'Hammerex Premium Laptop Case — Zip and Flap closure styles, sizes 11" to 18"',
  0
from public.hammerex_products p
where p.slug = 'laptop-case'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- No hammerex_product_trades rows needed — is_universal=true makes this
-- appear on every category page via the category loader logic.

-- Eighteen variants — 9 sizes × 2 closure styles. Same price within size.
-- Default: 13" Zip (common laptop size, secure closure).
insert into public.hammerex_product_variants
  (product_id, label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
select p.id, v.label, v.sku, v.price_idr, v.image_url, v.model_number, v.sort_order, v.is_default, v.stock_count
from public.hammerex_products p,
  (values
    ('11" — Zip',  'HX-LPC-11Z',  359800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-11Z',   0, false, 30),
    ('11" — Flap', 'HX-LPC-11F',  359800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-11F',   1, false, 30),
    ('12" — Zip',  'HX-LPC-12Z',  369800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-12Z',   2, false, 30),
    ('12" — Flap', 'HX-LPC-12F',  369800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-12F',   3, false, 30),
    ('13" — Zip',  'HX-LPC-13Z',  379800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-13Z',   4, true,  35),
    ('13" — Flap', 'HX-LPC-13F',  379800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-13F',   5, false, 35),
    ('14" — Zip',  'HX-LPC-14Z',  389800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-14Z',   6, false, 35),
    ('14" — Flap', 'HX-LPC-14F',  389800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-14F',   7, false, 35),
    ('15" — Zip',  'HX-LPC-15Z',  399800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-15Z',   8, false, 35),
    ('15" — Flap', 'HX-LPC-15F',  399800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-15F',   9, false, 35),
    ('15.6" — Zip',  'HX-LPC-156Z', 405800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-156Z', 10, false, 35),
    ('15.6" — Flap', 'HX-LPC-156F', 405800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-156F', 11, false, 35),
    ('16" — Zip',  'HX-LPC-16Z',  409800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-16Z',  12, false, 30),
    ('16" — Flap', 'HX-LPC-16F',  409800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-16F',  13, false, 30),
    ('17" — Zip',  'HX-LPC-17Z',  415800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-17Z',  14, false, 25),
    ('17" — Flap', 'HX-LPC-17F',  415800, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-17F',  15, false, 25),
    ('18" — Zip',  'HX-LPC-18Z',  420000, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-18Z',  16, false, 20),
    ('18" — Flap', 'HX-LPC-18F',  420000, 'https://ik.imagekit.io/9mrgsv2rp/Untitleddsadasdasdsdsesadasddfssdfsdfdsfs.png', 'HX-LPC-18F',  17, false, 20)
  ) as v(label, sku, price_idr, image_url, model_number, sort_order, is_default, stock_count)
where p.slug = 'laptop-case'
on conflict (product_id, label) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Premium Laptop Case (size & closure as selected)', 1, 0),
    ('Soft inner lining',                                          1, 1),
    ('Clear front display window',                                 1, 2)
  ) as v(l, q, s)
where p.slug = 'laptop-case'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Brand',        'Brand',          'HAMMEREX®',                                                          0),
    ('Brand',        'Product type',   'Premium Laptop Case',                                                1),
    ('Material',     'Body',           'Premium leather-look exterior',                                     10),
    ('Material',     'Lining',         'Soft protective inner lining',                                       11),
    ('Material',     'Stitching',      'Reinforced industrial-strength stitching',                          12),
    ('Design',       'Closure style',  'Zip or Flap (pick at variant)',                                     20),
    ('Design',       'Display window', 'Clear front display window',                                        21),
    ('Design',       'Shoulder strap', 'Optional adjustable shoulder strap — request on WhatsApp quote',    22),
    ('Capacity',     'Sizes',          '11" / 12" / 13" / 14" / 15" / 15.6" / 16" / 17" / 18" — pick above', 30),
    ('Capacity',     'Custom',         'Custom sizes available — request on WhatsApp quote',                31),
    ('Pricing',      '11"',            '£17.99',                                                            40),
    ('Pricing',      '12"',            '£18.49',                                                            41),
    ('Pricing',      '13"',            '£18.99',                                                            42),
    ('Pricing',      '14"',            '£19.49',                                                            43),
    ('Pricing',      '15"',            '£19.99',                                                            44),
    ('Pricing',      '15.6"',          '£20.29',                                                            45),
    ('Pricing',      '16"',            '£20.49',                                                            46),
    ('Pricing',      '17"',            '£20.79',                                                            47),
    ('Pricing',      '18"',            '£21.00',                                                            48),
    ('Pricing',      'Closure',        'Zip and Flap priced the same within each size',                     49),
    ('Stock',        'Availability',   'In stock — all sizes and closure styles',                           50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',                         51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',                         52),
    ('Use',          'Built for',      'Work, travel, office, jobsite, everyday',                           60),
    ('Build & care', 'Made in',        'United Kingdom',                                                     70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                                     71)
  ) as v(g, l, val, s)
where p.slug = 'laptop-case'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
