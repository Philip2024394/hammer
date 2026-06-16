-- Tighten the £20 flat-shipping copy across product purchase_notes and specs.
-- Policy clarification 2026-06-16: £20 flat applies only to UK, USA and
-- Australia. Other destinations are confirmed on WhatsApp after checkout.

update public.hammerex_products
set purchase_notes = (
  select jsonb_agg(
    case
      when v::text like '%Flat £20 worldwide shipping%'
        then to_jsonb('Flat £20 shipping to UK, USA and Australia via EMS Air Mail (5–6 days transit). Other countries are confirmed on WhatsApp after checkout.'::text)
      else v
    end
  )
  from jsonb_array_elements(purchase_notes) as v
)
where purchase_notes::text like '%Flat £20 worldwide shipping%';

update public.hammerex_product_specs
set value = 'Flat £20 to UK / USA / AU · others quoted on WhatsApp'
where label = 'Worldwide'
  and value like 'Flat £20 EMS%';

update public.hammerex_product_specs
set label = 'UK / USA / AU'
where label = 'Worldwide';
