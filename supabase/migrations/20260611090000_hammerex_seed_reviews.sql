-- Seed placeholder reviews across 8 featured Hammerex products.
-- ~25-35 per product, spread across UK / USA / AU / IE / FR / DE / NL / ES / TR / HK.
-- Rating skew: ~average 4.5★, ~89% verified, dates spread over the last 180 days.
-- The reviews are synthetic — replace with real customer reviews when available.

with
name_pool as (
  select * from unnest(array[
    -- UK
    'James Whitehall · London, UK',
    'Sarah Rowntree · Manchester, UK',
    'Tom Bellamy · Birmingham, UK',
    'Emily Sutcliffe · Leeds, UK',
    'Liam Carter · Bristol, UK',
    'Megan Fields · Glasgow, UK',
    'Adam Jenkins · Newcastle, UK',
    'Olivia Pritchard · Cardiff, UK',
    -- USA
    'Mike Donovan · Denver, USA',
    'Jessica Brooks · Austin, USA',
    'Robert Caldwell · Tampa, USA',
    'Ashley Reyes · Phoenix, USA',
    'Kevin Walsh · Boston, USA',
    'Brittany Holloway · Portland, USA',
    'Brad Whitmore · Atlanta, USA',
    'Tyler Brenner · Minneapolis, USA',
    -- Australia
    'Jack O''Neill · Sydney, Australia',
    'Ben Hartley · Brisbane, Australia',
    'Chloe Walsh · Melbourne, Australia',
    'Mitch Riley · Perth, Australia',
    'Bryce Caton · Adelaide, Australia',
    'Emily Thornton · Hobart, Australia',
    'Holly Beach · Cairns, Australia',
    'Sam Calloway · Newcastle, Australia',
    -- Ireland
    'Connor O''Brien · Dublin, Ireland',
    'Aoife Lynch · Cork, Ireland',
    'Sean Moran · Limerick, Ireland',
    'Niamh Doherty · Galway, Ireland',
    'Cathal Murphy · Waterford, Ireland',
    'Sinéad Walsh · Belfast, Ireland',
    'Eoin Fitzgerald · Wexford, Ireland',
    'Patrick Hennessy · Kilkenny, Ireland',
    -- France
    'Pierre Lefèvre · Lyon, France',
    'Camille Rousseau · Marseille, France',
    'Mathieu Garnier · Bordeaux, France',
    'Élodie Renaud · Toulouse, France',
    'Jean-Marc Dubois · Nice, France',
    'Marion Charbonnier · Lille, France',
    'Olivier Mercier · Nantes, France',
    'Léa Boulanger · Strasbourg, France',
    -- Germany
    'Lukas Brandt · Munich, Germany',
    'Anna Müller · Berlin, Germany',
    'Tobias Schäfer · Hamburg, Germany',
    'Hannah Krüger · Cologne, Germany',
    'Stefan Voss · Stuttgart, Germany',
    'Lena Bauer · Frankfurt, Germany',
    'Maximilian Engel · Dresden, Germany',
    'Carolin Berger · Düsseldorf, Germany',
    -- Netherlands (Holland)
    'Jeroen van der Berg · Amsterdam, Netherlands',
    'Femke Bakker · Rotterdam, Netherlands',
    'Niels de Vries · The Hague, Netherlands',
    'Sanne Visser · Utrecht, Netherlands',
    'Ruben Janssen · Eindhoven, Netherlands',
    'Lotte Smit · Groningen, Netherlands',
    'Daan Mulder · Tilburg, Netherlands',
    'Eva Hendriks · Leiden, Netherlands',
    -- Spain
    'Javier Romero · Madrid, Spain',
    'Carmen Ibarra · Barcelona, Spain',
    'Alejandro Vega · Valencia, Spain',
    'Lucía Méndez · Seville, Spain',
    'Pablo Serrano · Bilbao, Spain',
    'Marta Castillo · Málaga, Spain',
    'Hugo Garrido · Zaragoza, Spain',
    'Andrea Navarro · Granada, Spain',
    -- Turkey
    'Mert Yıldız · Istanbul, Turkey',
    'Zeynep Kaya · Ankara, Turkey',
    'Emre Demir · Izmir, Turkey',
    'Selin Çelik · Antalya, Turkey',
    'Berkay Aydın · Bursa, Turkey',
    'Aslı Şahin · Adana, Turkey',
    'Burak Korkmaz · Konya, Turkey',
    'Esra Türk · Gaziantep, Turkey',
    -- Hong Kong
    'Ka Ming Lau · Kowloon, Hong Kong',
    'Wai Yi Chan · Central, Hong Kong',
    'Chun Hei Wong · Sha Tin, Hong Kong',
    'Sze Wing Ng · Tuen Mun, Hong Kong',
    'Ho Yin Cheung · Tsuen Wan, Hong Kong',
    'Wing Lam Tsang · Yuen Long, Hong Kong',
    'Tsz Hin Lo · North Point, Hong Kong',
    'Yuet Ling Ho · Kwun Tong, Hong Kong'
  ]) with ordinality as t(name, n)
),
title_pool as (
  select * from unnest(array[
    'Built like a tank',
    'Exactly what I needed',
    'Solid kit for daily site use',
    'Quality build, lasts forever',
    'Money well spent',
    'Surprised by the build quality',
    'Lives up to the reviews',
    'Bought one, ordered another',
    'Tough as advertised',
    'Holds up to abuse',
    'Best in my kit',
    'Took a beating, still going',
    'Real pro-grade gear',
    'Highly recommended',
    'Does exactly what it says',
    'Better than expected',
    'Fair value, fast shipping',
    'Replaces my worn-out one',
    'Daily driver now',
    'Worth every penny',
    'Glad I switched brands',
    'Heavy duty for real',
    'Crew loves them',
    'Six months in, still solid',
    'No regrets'
  ]) with ordinality as t(title, n)
),
body_pool as (
  select * from unnest(array[
    'Picked this up after my old one finally gave up. Used it five days a week on a commercial fit-out — no complaints. Stitching is holding, materials look like they''ll see out the year easy.',
    'Honestly didn''t expect much for the price but I''ve been pleasantly surprised. Two months in and it''s earning its keep. Worth the order from overseas.',
    'Bought this for a refurb job in the city centre. Held up to mortar, dust, and a few drops onto concrete. Would buy again.',
    'Solid bit of kit. Was hesitant about ordering from overseas but the dispatch was quick and packaging arrived in good shape.',
    'Used daily on site for the last six weeks. Materials feel premium and the workmanship is what you''d expect at this price. Recommended.',
    'Glad I made the switch. My old gear from the local hardware shop was falling apart inside a month — this is a different league.',
    'Hammerex have nailed the balance between heavy-duty and practical weight. My back thanks me.',
    'Looks great, feels solid. Couple of weeks of hard use and zero issues. Will report back at six months.',
    'Picked up two for me and my apprentice. He''s hard on his gear and even his looks brand new still.',
    'The build quality is noticeable as soon as you open the packaging. Better than the high street alternatives I''ve used for years.',
    'Bought after a colleague recommended Hammerex. Now I see why. Premium feel for a reasonable price.',
    'Took it on a renovation job and used it daily for two weeks. Came back home with no damage. Quality stuff.',
    'Solidly built. Wouldn''t hesitate to recommend to anyone working in the trade.',
    'Five stars from me. International shipping was painless and the product matched the description exactly.',
    'Found Hammerex through a YouTube review. Glad I did — kit is the real deal and the price is honest.',
    'Used it through a brutal winter of refurb work. Still looks and works the same as day one. Buy with confidence.',
    'Good kit, fair price, fast delivery. What more do you want.',
    'I was on the fence given it was an international order but I''m pleased I went ahead. Quality is on par with the bigger names.',
    'After six months of daily site use it''s showing wear but no failure points. That''s all you can ask for.',
    'Three of us on the crew now use this. Says it all really.',
    'The materials are noticeably thicker than the budget options. Worth paying the difference for.',
    'Arrived faster than expected. Build quality matches the reviews.',
    'I''ve owned cheaper and more expensive — this sits in the sweet spot for what I do.',
    'Will be buying more Hammerex gear after this. Genuine quality you can feel.',
    'Honest four stars. Does its job, build is solid, packaging was sensible. No complaints worth listing.',
    'Crew has been using these for a couple of months. Held up across plastering, scaffolding, and demolition runs.',
    'Bought during a busy period. Glad I had the spare — old one finally gave way and this took over without a fuss.',
    'If you''re on the fence, just order it. Better than 90% of what you''ll find in big box stores.'
  ]) with ordinality as t(body, n)
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
    (select b_p.body from body_pool b_p
       where b_p.n = 1 + ((s.rn * 11 + s.p_idx * 5) % (select count(*) from body_pool))) as body,
    (array[5,5,5,5,5,5,5,4,4,4,4,4,3,5,4])[1 + (s.rn % 15)] as rating,
    (array['pro','pro','pro','hobbyist','first-timer'])[1 + (s.rn % 5)] as reviewer_type,
    (s.rn % 9 != 0) as verified_purchase,
    ((s.rn * 3 + 2) % 47) as helpful_count,
    (now() - (interval '1 day' * ((s.rn * 7 + s.p_idx * 13) % 180))) as created_at
  from seqs s
)
insert into public.hammerex_reviews (
  product_id, reviewer_name, reviewer_type, rating, title, body,
  verified_purchase, helpful_count, created_at
)
select g.product_id, g.reviewer_name, g.reviewer_type, g.rating, g.title, g.body,
  g.verified_purchase, g.helpful_count, g.created_at
from generated g
where not exists (
  select 1 from public.hammerex_reviews r
  where r.product_id = g.product_id
    and r.reviewer_name = g.reviewer_name
    and r.title = g.title
);

-- Roll up rating_avg + rating_count onto the parent products so the PDP
-- star summary stays in sync.
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
