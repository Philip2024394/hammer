-- HX-TPNG-001 — populate description, overview body, feature bullets and
-- dimension specs supplied by the owner.

update public.hammerex_products
set description = $txt$Hammerex™ Next-Gen Tool Pouch — industrial-grade denim with riveted stress points, wide-mouth main compartment, multiple front organiser pockets, reinforced leather hammer loop, fits belts up to 3" wide.$txt$,
    overview = $body$HAMMEREX™ NEXT-GEN TOOL POUCH

**BUILT SMARTER. BUILT STRONGER. BUILT TO OUTPERFORM.**

The **HAMMEREX™ Next-Gen Tool Pouch** is engineered for professional tradespeople who demand durability, organization, and fast tool access on the job site. Constructed from **premium industrial-grade denim fabric** with reinforced riveted stress points and heavy-duty stitching, this pouch is designed to withstand daily abuse in demanding work environments.

The **wide-mouth main compartment** provides quick access to your essential tools while **multiple front storage pockets** keep screwdrivers, pliers, markers, utility knives, and other hand tools organized and within easy reach. A **reinforced leather hammer loop** offers secure hammer storage, while the **universal belt tunnel design** fits most work belts up to 3 inches wide.

Whether you're a carpenter, electrician, framer, builder, contractor, maintenance technician, or DIY enthusiast, the **HAMMEREX™ Tool Pouch** delivers professional-grade performance, comfort, and reliability throughout the workday.

### Features

* Premium industrial-grade denim fabric construction
* Reinforced riveted stress points for maximum durability
* Heavy-duty stitching with signature HAMMEREX yellow thread
* Large wide-mouth main storage compartment
* Multiple front organizer pockets
* Reinforced leather hammer loop
* Universal belt fit — accommodates belts up to 3" (76 mm) wide
* Water and dust resistant construction
* Lightweight yet rugged design
* Built for professional trade use

### Dimensions

* Height: 11.2 in (28.45 cm)
* Width: 8.6 in (21.84 cm)
* Depth: 3.3 in (8.38 cm)

### Ideal For

* Carpenters · Electricians · Framers · Builders
* Contractors · Maintenance Workers · Handymen · DIY Projects

**HAMMEREX™ — WORK HARD. CARRY SMART.**$body$,
    features = '[
      {"icon":"check","label":"Premium industrial-grade denim fabric construction"},
      {"icon":"check","label":"Reinforced riveted stress points for maximum durability"},
      {"icon":"check","label":"Heavy-duty stitching with signature HAMMEREX yellow thread"},
      {"icon":"check","label":"Large wide-mouth main storage compartment"},
      {"icon":"check","label":"Multiple front organizer pockets"},
      {"icon":"check","label":"Reinforced leather hammer loop"},
      {"icon":"check","label":"Universal belt fit — up to 3 inch (76 mm) belts"},
      {"icon":"check","label":"Water and dust resistant construction"},
      {"icon":"check","label":"Lightweight yet rugged design"},
      {"icon":"check","label":"Built for professional trade use"}
    ]'::jsonb
where sku = 'HX-TPNG-001';

-- Dimension specs (idempotent — won't duplicate if rerun).
insert into public.hammerex_product_specs (product_id, group_name, label, value, sort_order)
select p.id, v.g, v.l, v.val, v.s
from public.hammerex_products p,
  (values
    ('Dimensions', 'Height', '11.2 in (28.45 cm)', 0),
    ('Dimensions', 'Width',  '8.6 in (21.84 cm)',  1),
    ('Dimensions', 'Depth',  '3.3 in (8.38 cm)',   2)
  ) as v(g, l, val, s)
where p.sku = 'HX-TPNG-001'
and not exists (
  select 1 from public.hammerex_product_specs ps
  where ps.product_id = p.id and ps.label = v.l and ps.group_name = v.g
);
