-- Full set of construction trades for the home-page category marquee.
-- Existing trades (plastering, drywall, concrete, tiling) stay where they are;
-- this fills in everything else.

insert into public.hammerex_categories (slug, name, image_url, sort_order) values
  ('carpentry',           'Carpentry',             null, 300),
  ('bricklaying',         'Bricklaying',           null, 301),
  ('painting-decorating', 'Painting & Decorating', null, 302),
  ('plumbing',            'Plumbing',              null, 303),
  ('electrical',          'Electrical',            null, 304),
  ('roofing',             'Roofing',               null, 305),
  ('flooring',            'Flooring',              null, 306),
  ('glazing',             'Glazing',               null, 307),
  ('landscaping',         'Landscaping',           null, 308),
  ('steel-fixing',        'Steel Fixing',          null, 309),
  ('scaffolding',         'Scaffolding',           null, 310),
  ('rendering',           'Rendering',             null, 311),
  ('demolition',          'Demolition',            null, 312),
  ('hvac',                'HVAC',                  null, 313)
on conflict (slug) do nothing;
