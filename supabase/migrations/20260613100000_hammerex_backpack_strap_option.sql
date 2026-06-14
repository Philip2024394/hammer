-- Optional "Backpack straps" add-on for the Drywall Pro Bag and Plastering
-- Pro Backpack Trowel Bag. Customer toggles "Add backpack straps" on the
-- PDP; the per-product delta (in product-base IDR) is added to the unit
-- price. £10 GBP ≈ Rp 200,000 (lib/fx.ts 1 GBP = 20,000 IDR).

alter table public.hammerex_products
  add column if not exists backpack_straps_option_idr numeric null;

-- Drywall Pro Bag: set the £10 add-on price. The Plastering Pro Bag is
-- inserted in a later migration and sets its own value inline.
update public.hammerex_products
  set backpack_straps_option_idr = 200000
  where slug = 'drywall-pro-bag';

-- Drywall Pro Bag copy correction: straps are NOT included at £88; they are
-- a +£10 selectable add-on. Refresh description, overview, features list,
-- purchase notes, and the "Carry options" / Pricing specs.
update public.hammerex_products
set
  description = 'Professional drywall tapers bag — D600 water-resistant fabric, twin-lined construction, holds an 18" plastering trowel, 2 scraper knives, mud pan, drywall board and hand tools. Add backpack straps for +£10.',
  overview = E'The **Drywall Pro Tapers Bag** is designed specifically for professional drywall finishers and plasterers who need a durable, practical, and organized tool storage solution on site.\n\nThe base bag ships as a standard carry. **Add the backpack straps option (+£10)** for hands-free transport between jobs.\n\n### Key Features\n\n* Stores **1 plastering trowel up to 18 inches**\n* Front storage for **2 scraper knives**\n* Side holder for a **mud pan**\n* Rear storage compartment for a **drywall board**\n* Large internal compartment for additional hand tools, accessories, and site essentials\n* Heavy-duty **D600 water-resistant fabric**\n* **Twin-lined construction** for enhanced durability and long service life\n* Designed for professional daily site use\n\n### Built for Professionals\n\nWhether you''re working on residential, commercial, or renovation projects, the Drywall Pro Tapers Bag keeps your tools organized, protected, and ready for the job. The practical layout allows quick access to frequently used tools while providing ample internal storage for everything else you need throughout the day.',
  features = '[
    {"icon":"check","label":"Stores 1 plastering trowel up to 18 inches"},
    {"icon":"check","label":"Front storage for 2 scraper knives"},
    {"icon":"check","label":"Side holder for a mud pan"},
    {"icon":"check","label":"Rear compartment for a drywall board"},
    {"icon":"check","label":"Large internal compartment for hand tools and site essentials"},
    {"icon":"check","label":"Heavy-duty D600 water-resistant fabric"},
    {"icon":"check","label":"Twin-lined construction for enhanced durability"},
    {"icon":"check","label":"Standard carry — backpack straps available as +£10 add-on"},
    {"icon":"check","label":"Designed for professional daily site use"}
  ]'::jsonb,
  purchase_notes = '[
    "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step.",
    "Add backpack straps for +£10 — toggle the option above before adding to cart.",
    "In stock — dispatched within 3 working days.",
    "Typical UK delivery within 5 working days.",
    "International shipping quoted on request."
  ]'::jsonb
where slug = 'drywall-pro-bag';

-- Replace the old "Carry options" + Pricing specs with the corrected wording.
delete from public.hammerex_product_specs
where product_id = (select id from public.hammerex_products where slug = 'drywall-pro-bag')
  and ((group_name = 'Design'  and label = 'Carry options')
    or (group_name = 'Pricing' and label in ('Single unit', 'Bulk discounts')));

insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Design',  'Carry style',     'Standard carry (default) · backpack straps available as +£10 add-on', 20),
    ('Pricing', 'Single unit',     '£88.00 (standard carry)',                                              30),
    ('Pricing', 'Backpack straps', '+£10.00 — selectable add-on',                                          31),
    ('Pricing', 'Bulk discounts',  'Buy 2 -10% · Buy 3 -15%',                                              32)
  ) as v(g, l, val, s)
where p.slug = 'drywall-pro-bag'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
