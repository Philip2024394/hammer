-- Policy update 2026-06-17: shipping moves from a single £20 flat lane
-- to a two-tier structure with a £30 minimum order. £28 shipping on
-- £30–£49 carts, £20 flat once the cart reaches £50. Updates per-product
-- purchase_notes and the spec rows so the published copy matches.

update public.hammerex_products
set purchase_notes = (
  select jsonb_agg(
    case
      when v::text like '%Flat £20 shipping to UK%'
        then to_jsonb('UK / USA / Australia: £30 minimum order. £28 shipping on £30–£49, £20 flat once you reach £50. Dispatched via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout.'::text)
      else v
    end
  )
  from jsonb_array_elements(purchase_notes) as v
)
where purchase_notes::text like '%Flat £20 shipping to UK%';

update public.hammerex_product_specs
set value = '£28 (£30–£49 cart) · £20 flat (£50+ cart) · others quoted on WhatsApp'
where label = 'UK / USA / AU'
  and value like 'Flat £20%';
