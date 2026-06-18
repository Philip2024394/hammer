-- Brand reframe 2026-06-17: flip the origin tag from defensive disclaimer
-- ("Indonesia · Hammerex Official Distribution") to confident origin
-- story ("Yogyakarta, Indonesia — Hammerex factory"). Western trade
-- buyers respond to a named factory city + "made by us" framing far
-- better than to a generic country label. Same fact, different posture.

update public.hammerex_products
set country_of_assembly = 'Yogyakarta, Indonesia — Hammerex factory'
where country_of_assembly = 'Indonesia · Hammerex Official Distribution';

-- Spec rows mirror the country_of_assembly text in the Build & care group.
update public.hammerex_product_specs
set value = 'Yogyakarta, Indonesia — Hammerex factory'
where label = 'Made in'
  and value = 'Indonesia · Hammerex Official Distribution';
