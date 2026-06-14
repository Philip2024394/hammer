-- HAMMEREX Venetian Trowel Wallet — side-loading premium leather wallet for
-- Venetian/finishing trowels. Soft-close fastening, hanging hook.
-- £9.99 GBP (Rp 199,800 @ 20k/£). Primary category: plastering.
-- Note: "All sizes available" — customer specifies size on WhatsApp at quote.

insert into public.hammerex_products (
  category_id, name, description, price_idr, image_url, is_featured,
  slug, sku, brand, model_number, dispatch_cutoff_local,
  warranty_years, country_of_assembly, overview, features,
  base_currency, dispatch_lead_days, delivery_quote_only, purchase_notes,
  badge_label, subtitle, home_sort_order
)
select c.id,
  'Hammerex Venetian Trowel Wallet',
  'Premium leather side-loading wallet for Venetian and finishing trowels — soft-close fastening, integrated hanging hook, available in all popular sizes.',
  199800,
  'https://ik.imagekit.io/pinky/FDSFSDFSDFSDFSDFSfsdfsdfs.png?updatedAt=1781301809054',
  true,
  'venetian-trowel-wallet', 'HX-VTW-001', 'Hammerex', 'HX-VTW', '14:00',
  1, 'United Kingdom',
  E'**Protect the polish. Protect the blade.**\n\nProtect your finishing tools with the HAMMEREX Venetian Trowel Wallet, designed specifically for professional plasterers, decorators, and Venetian plaster specialists. Crafted from premium leather, this durable wallet provides a secure and practical storage solution for your valuable trowels both on-site and during transport.\n\nThe side-loading design allows your Venetian trowel to slide easily into the wallet, providing excellent protection for the blade and polished surfaces. A soft-close fastening keeps the trowel securely in place while preventing unnecessary wear or damage during storage.\n\nFor added convenience, the integrated hanging hook allows the wallet to be easily stored on-site, in workshops, vans, or at home at the end of the working day.\n\nThe HAMMEREX Venetian Trowel Wallet is the perfect solution for tradespeople who want to protect their investment and keep their finishing tools in top condition for years to come.',
  '[
    {"icon":"check","label":"Premium leather construction"},
    {"icon":"check","label":"Side-loading trowel insertion design"},
    {"icon":"check","label":"Soft-close fastening for secure storage"},
    {"icon":"check","label":"Protects polished trowel blades from scratches and damage"},
    {"icon":"check","label":"Integrated hanging hook for easy storage"},
    {"icon":"check","label":"Suitable for site, workshop, and transport use"},
    {"icon":"check","label":"Durable design built for daily professional use"},
    {"icon":"check","label":"Available in all popular Venetian trowel sizes"}
  ]'::jsonb,
  'GBP', 3, true,
  '[
    "All popular Venetian trowel sizes available — let us know your size when you send the WhatsApp quote.",
    "In stock — dispatched within 3 working days.",
    "UK delivery available — international shipping quoted on request."
  ]'::jsonb,
  null, 'VENETIAN TROWEL WALLET', 22
from public.hammerex_categories c
where c.slug = 'plastering'
and not exists (select 1 from public.hammerex_products where slug = 'venetian-trowel-wallet');

-- Hero image media row.
insert into public.hammerex_product_media (product_id, kind, url, alt, sort_order)
select p.id, 'image',
  'https://ik.imagekit.io/pinky/FDSFSDFSDFSDFSDFSfsdfsdfs.png?updatedAt=1781301809054',
  'Hammerex Venetian Trowel Wallet — premium leather, side-loading with hanging hook',
  0
from public.hammerex_products p
where p.slug = 'venetian-trowel-wallet'
and not exists (select 1 from public.hammerex_product_media m where m.product_id = p.id);

-- Cross-list to plastering only (trade-specific — Venetian finishing).
insert into public.hammerex_product_trades (product_id, category_id, sort_order)
select p.id, c.id, c.sort_order
from public.hammerex_products p
cross join public.hammerex_categories c
where p.slug = 'venetian-trowel-wallet' and c.slug = 'plastering'
on conflict (product_id, category_id) do nothing;

-- What's-in-box.
insert into public.hammerex_what_in_box (product_id, label, qty, image_url, sort_order)
select p.id, v.l, v.q, null, v.s
from public.hammerex_products p,
  (values
    ('Hammerex Venetian Trowel Wallet (size as specified)', 1, 0),
    ('Integrated hanging hook',                              1, 1),
    ('Soft-close fastening',                                 1, 2)
  ) as v(l, q, s)
where p.slug = 'venetian-trowel-wallet'
and not exists (select 1 from public.hammerex_what_in_box w where w.product_id = p.id and w.label = v.l);

-- Specifications.
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Material',     'Body',           'Premium leather',                                  0),
    ('Design',       'Loading',        'Side-loading — protects blade and polished face',  10),
    ('Design',       'Closure',        'Soft-close fastening',                             11),
    ('Design',       'Storage',        'Integrated hanging hook',                          12),
    ('Capacity',     'Trowel fit',     'All popular Venetian / finishing trowel sizes',    20),
    ('Pricing',      'Single unit',    '£9.99',                                            40),
    ('Stock',        'Availability',   'In stock',                                         50),
    ('Dispatch',     'Lead time',      'Dispatched within 3 working days of order',        51),
    ('Dispatch',     'UK delivery',    'Typical UK delivery within 5 working days',        52),
    ('Use',          'Built for',      'Plasterers, decorators, Venetian plaster specialists', 60),
    ('Build & care', 'Made in',        'United Kingdom',                                   70),
    ('Build & care', 'Warranty',       '1 year (manufacturing defects)',                   71)
  ) as v(g, l, val, s)
where p.slug = 'venetian-trowel-wallet'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
