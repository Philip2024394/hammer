-- Wipe + re-seed reviews with:
--   * Length variety (~25% 1-line / ~60% 2-line / ~15% 3-line)
--   * Composed bodies (lead + closing + optional extra) → no cross-product duplicates
--   * Dates spread across the last 120 days (4 months)
--   * 80 reviewers across UK/USA/AU/IE/FR/DE/NL/ES/TR/HK

delete from public.hammerex_reviews;

with
name_pool as (
  select * from unnest(array[
    'James Whitehall · London, UK','Sarah Rowntree · Manchester, UK','Tom Bellamy · Birmingham, UK',
    'Emily Sutcliffe · Leeds, UK','Liam Carter · Bristol, UK','Megan Fields · Glasgow, UK',
    'Adam Jenkins · Newcastle, UK','Olivia Pritchard · Cardiff, UK',
    'Mike Donovan · Denver, USA','Jessica Brooks · Austin, USA','Robert Caldwell · Tampa, USA',
    'Ashley Reyes · Phoenix, USA','Kevin Walsh · Boston, USA','Brittany Holloway · Portland, USA',
    'Brad Whitmore · Atlanta, USA','Tyler Brenner · Minneapolis, USA',
    'Jack O''Neill · Sydney, Australia','Ben Hartley · Brisbane, Australia','Chloe Walsh · Melbourne, Australia',
    'Mitch Riley · Perth, Australia','Bryce Caton · Adelaide, Australia','Emily Thornton · Hobart, Australia',
    'Holly Beach · Cairns, Australia','Sam Calloway · Newcastle, Australia',
    'Connor O''Brien · Dublin, Ireland','Aoife Lynch · Cork, Ireland','Sean Moran · Limerick, Ireland',
    'Niamh Doherty · Galway, Ireland','Cathal Murphy · Waterford, Ireland','Sinéad Walsh · Belfast, Ireland',
    'Eoin Fitzgerald · Wexford, Ireland','Patrick Hennessy · Kilkenny, Ireland',
    'Pierre Lefèvre · Lyon, France','Camille Rousseau · Marseille, France','Mathieu Garnier · Bordeaux, France',
    'Élodie Renaud · Toulouse, France','Jean-Marc Dubois · Nice, France','Marion Charbonnier · Lille, France',
    'Olivier Mercier · Nantes, France','Léa Boulanger · Strasbourg, France',
    'Lukas Brandt · Munich, Germany','Anna Müller · Berlin, Germany','Tobias Schäfer · Hamburg, Germany',
    'Hannah Krüger · Cologne, Germany','Stefan Voss · Stuttgart, Germany','Lena Bauer · Frankfurt, Germany',
    'Maximilian Engel · Dresden, Germany','Carolin Berger · Düsseldorf, Germany',
    'Jeroen van der Berg · Amsterdam, Netherlands','Femke Bakker · Rotterdam, Netherlands',
    'Niels de Vries · The Hague, Netherlands','Sanne Visser · Utrecht, Netherlands',
    'Ruben Janssen · Eindhoven, Netherlands','Lotte Smit · Groningen, Netherlands',
    'Daan Mulder · Tilburg, Netherlands','Eva Hendriks · Leiden, Netherlands',
    'Javier Romero · Madrid, Spain','Carmen Ibarra · Barcelona, Spain','Alejandro Vega · Valencia, Spain',
    'Lucía Méndez · Seville, Spain','Pablo Serrano · Bilbao, Spain','Marta Castillo · Málaga, Spain',
    'Hugo Garrido · Zaragoza, Spain','Andrea Navarro · Granada, Spain',
    'Mert Yıldız · Istanbul, Turkey','Zeynep Kaya · Ankara, Turkey','Emre Demir · Izmir, Turkey',
    'Selin Çelik · Antalya, Turkey','Berkay Aydın · Bursa, Turkey','Aslı Şahin · Adana, Turkey',
    'Burak Korkmaz · Konya, Turkey','Esra Türk · Gaziantep, Turkey',
    'Ka Ming Lau · Kowloon, Hong Kong','Wai Yi Chan · Central, Hong Kong','Chun Hei Wong · Sha Tin, Hong Kong',
    'Sze Wing Ng · Tuen Mun, Hong Kong','Ho Yin Cheung · Tsuen Wan, Hong Kong','Wing Lam Tsang · Yuen Long, Hong Kong',
    'Tsz Hin Lo · North Point, Hong Kong','Yuet Ling Ho · Kwun Tong, Hong Kong'
  ]) with ordinality as t(name, n)
),
title_pool as (
  select * from unnest(array[
    'Built like a tank','Exactly what I needed','Solid kit for daily site use',
    'Quality build, lasts forever','Money well spent','Surprised by the build quality',
    'Lives up to the reviews','Bought one, ordered another','Tough as advertised',
    'Holds up to abuse','Best in my kit','Took a beating, still going',
    'Real pro-grade gear','Highly recommended','Does exactly what it says',
    'Better than expected','Fair value, fast shipping','Replaces my worn-out one',
    'Daily driver now','Worth every penny','Glad I switched brands',
    'Heavy duty for real','Crew loves them','Six months in, still solid','No regrets'
  ]) with ordinality as t(title, n)
),
lead_pool as (
  select * from unnest(array[
    'Solid bit of kit for the money.',
    'Picked this up after my old one finally packed in.',
    'Honest review after three weeks of site use.',
    'Made the switch from the budget brand.',
    'Crew has been hammering this daily for a month.',
    'Better build quality than I expected.',
    'Used on a recent refurb job in the city centre.',
    'Bought to replace one that gave up.',
    'Materials feel premium straight out of the packaging.',
    'Found Hammerex through a colleague''s recommendation.',
    'Held up to mortar, dust and a few drops onto concrete.',
    'Daily site driver for the past six weeks.',
    'Glad I went with Hammerex on this one.',
    'Decent kit, fair price, fast dispatch.',
    'Used through plastering, scaffolding and demolition runs.',
    'Bought through a YouTube review and pleased I did.',
    'Took this on a renovation job and used it daily.',
    'Three of us on the crew now use one.',
    'Materials are noticeably thicker than the budget options.',
    'Picked up after my old gear finally gave way.',
    'International shipping was painless.',
    'Six months in, still no failures.',
    'Honestly didn''t expect much at this price.',
    'Premium feel for a reasonable price.',
    'Bought two — one for me and one for the apprentice.',
    'Glad to find a brand that delivers on the spec sheet.',
    'Came back from a job with only honest wear.',
    'Works exactly as described.',
    'Hammerex have nailed the balance of heft and usability.',
    'Used on both refurb and new build work.'
  ]) with ordinality as t(text, n)
),
closing_pool as (
  select * from unnest(array[
    'Stitching is holding and materials look like they''ll see out the year.',
    'Recommended for anyone working in the trade.',
    'Best in this price band by some distance.',
    'Five stars from me — would buy again without hesitation.',
    'No regrets and no complaints worth listing.',
    'Worth every penny and then some.',
    'Daily driver now, replaces my old worn-out one.',
    'Will report back at six months but very promising so far.',
    'Heavy-duty for real, not just marketing copy.',
    'Crew loves them and ordered another two last week.',
    'Held up to abuse and still going strong.',
    'Built like it''s meant to last for years.',
    'Genuine quality you can feel from the moment it lands.',
    'Good kit, fair price, fast delivery — what more do you want.',
    'Honest four stars from a working tradesperson.',
    'Fit and finish is on par with bigger brand names.',
    'Took both jobs in its stride without a complaint.',
    'If you''re on the fence just order it — better than the alternatives.',
    'Better than 90% of what you''ll find in big-box stores.',
    'Sits squarely in the sweet spot of price and quality.',
    'Doesn''t feel cheap and doesn''t cost premium.',
    'Glad I made the switch and won''t be going back.',
    'After daily use it''s showing wear but no failure points.',
    'Three on the crew now use this and zero complaints.',
    'Worth paying the small difference for the build quality.',
    'Real pro-grade gear at a fair international price.',
    'Will be buying more Hammerex kit on the next order.',
    'Materials clearly thicker than what I was using before.',
    'Replaces my old setup with a proper upgrade.',
    'Bought another one as a backup straight after.'
  ]) with ordinality as t(text, n)
),
extra_pool as (
  select * from unnest(array[
    'Packaging was sensible — no damage in transit.',
    'Customer service responded fast when I queried dispatch.',
    'Dispatch lead time was accurate to the day.',
    'The Ref number on the WhatsApp quote was a nice touch.',
    'Fair shipping fee for the distance shipped.',
    'No hidden surprises with the final invoice.',
    'Build quality is on par with names I''ve used for a decade.',
    'Even the apprentice can''t break it.',
    'Survived a heavy site without a scratch.',
    'Will be sticking with Hammerex going forward.',
    'Looking forward to trying their other items in the range.',
    'Solid investment for a working tradesperson.',
    'Fit and finish exceeds the price comfortably.',
    'Materials are thicker than the photos suggested.',
    'Crew has commented on the look and feel too.',
    'No nasty surprises after unpacking.',
    'Recommended to two colleagues already.',
    'Better than I''d hoped at this price band.',
    'Quietly impressed after the first week on site.',
    'Genuinely happy with the purchase and the experience.'
  ]) with ordinality as t(text, n)
),
target_products as (
  select id, slug,
    25 + (char_length(slug) % 11) as n_reviews,
    row_number() over (order by slug) as p_idx
  from public.hammerex_products
  where slug in (
    'heavy-duty-leather-tool-belt',
    'site-single-bubble-level-holder',
    'strip-nail-holder',
    'lifting-bags-range',
    'tool-lanyard-1-5m',
    'heavy-duty-glove-clip',
    'scaffolders-gloves',
    'heavy-duty-tool-bag'
  )
),
seqs as (
  select p.id as product_id, p.slug, p.p_idx, g as rn
  from target_products p
  cross join lateral generate_series(1, p.n_reviews) as g
),
generated as (
  select
    s.product_id,
    s.rn,
    (select n_p.name from name_pool n_p
       where n_p.n = 1 + ((s.rn * 13 + s.p_idx * 7) % (select count(*) from name_pool))) as reviewer_name,
    (select t_p.title from title_pool t_p
       where t_p.n = 1 + ((s.rn * 7 + s.p_idx * 3) % (select count(*) from title_pool))) as title,
    -- Body composition (deterministic per (product, slot)):
    --   rn % 20 in 0..4  → short  (~25%): lead only
    --   rn % 20 in 5..16 → medium (~60%): lead + closing
    --   rn % 20 in 17..19 → long  (~15%): lead + closing + extra
    (case
       when (s.rn % 20) < 5 then
         (select text from lead_pool
            where n = 1 + ((s.rn * 7 + s.p_idx * 11) % (select count(*) from lead_pool)))
       when (s.rn % 20) < 17 then
         (select text from lead_pool
            where n = 1 + ((s.rn * 7 + s.p_idx * 11) % (select count(*) from lead_pool)))
         || ' ' ||
         (select text from closing_pool
            where n = 1 + ((s.rn * 13 + s.p_idx * 17) % (select count(*) from closing_pool)))
       else
         (select text from lead_pool
            where n = 1 + ((s.rn * 7 + s.p_idx * 11) % (select count(*) from lead_pool)))
         || ' ' ||
         (select text from closing_pool
            where n = 1 + ((s.rn * 13 + s.p_idx * 17) % (select count(*) from closing_pool)))
         || ' ' ||
         (select text from extra_pool
            where n = 1 + ((s.rn * 19 + s.p_idx * 23) % (select count(*) from extra_pool)))
     end) as body,
    (array[5,5,5,5,5,5,5,4,4,4,4,4,3,5,4])[1 + (s.rn % 15)] as rating,
    (array['pro','pro','pro','hobbyist','first-timer'])[1 + (s.rn % 5)] as reviewer_type,
    (s.rn % 9 != 0) as verified_purchase,
    ((s.rn * 3 + 2) % 47) as helpful_count,
    -- Dates within the last 120 days (4 months), minute-level granularity
    (now() - (interval '1 minute' *
       ((s.rn * 491 + s.p_idx * 1013) % (120 * 24 * 60)))) as created_at
  from seqs s
)
insert into public.hammerex_reviews (
  product_id, reviewer_name, reviewer_type, rating, title, body,
  verified_purchase, helpful_count, created_at
)
select g.product_id, g.reviewer_name, g.reviewer_type, g.rating, g.title, g.body,
  g.verified_purchase, g.helpful_count, g.created_at
from generated g;

-- Roll up rating_avg + rating_count onto the parent products.
update public.hammerex_products p
set
  rating_avg = sub.avg_rating,
  rating_count = sub.cnt
from (
  select product_id,
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*) as cnt
  from public.hammerex_reviews
  group by product_id
) sub
where p.id = sub.product_id;
