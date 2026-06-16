-- Seed editorial FAQ on four top products and publish the first long-form
-- /guides article. Each FAQ targets a "People Also Ask" / Reddit long-tail
-- query so a fresh domain can pick up the featured-snippet slot before
-- ranking on the head term. The guide is the hub piece — internal links
-- from the Pruning Shears PDP point to it, and it links back via
-- related_product_slugs.

update public.hammerex_products
set faq = '[
  {
    "q": "What size tool bag do most builders carry?",
    "a": "Most working builders carry a 45–50 cm tool bag — large enough for a daily kit (hand tools, cordless drill, PPE) without becoming a back killer. The Hammerex Professional Work Bag is 48 × 25 × 30 cm, sized to match the most-used commercial size on UK sites."
  },
  {
    "q": "Is 1680D fabric better than 600D?",
    "a": "Yes — significantly. 1680D fabric is roughly three times the thread weight of 600D, with much higher abrasion and tear resistance. 600D is fine for kit you set down occasionally; 1680D is what you want for a bag that lives on concrete, scaffold boards, in a van, and gets thrown around on site."
  },
  {
    "q": "Does the Hammerex work bag come with a shoulder strap?",
    "a": "Yes. A fully adjustable shoulder strap is supplied as standard, plus reinforced twin carry handles for two-handed lifts on heavier loads."
  },
  {
    "q": "Can it be used as a plumber or electrician bag?",
    "a": "Yes. The internal layout suits any general trade — multi-pocket organisation for hand tools, fixings, testers, measuring kit and PPE. Same bag, same spec, used across plumbing, electrical, bricklaying, plastering and general building."
  },
  {
    "q": "Is it waterproof?",
    "a": "It is weather-resistant rather than fully waterproof. The 1680D outer and reinforced base shrug off splashes, light rain and damp concrete. For prolonged downpours, store sensitive items in a sealed inner liner."
  }
]'::jsonb
where slug = 'site-tool-bag';

update public.hammerex_products
set faq = '[
  {
    "q": "How many litres should a gardener''s backpack be?",
    "a": "26 litres is the sweet spot — large enough for a full hand-tool kit (trowels, pruners, secateurs, gloves, twine, spray bottle) without becoming bulky on the back. The Hammerex Garden Tool Backpack is 26 L for exactly this reason."
  },
  {
    "q": "What''s the difference between a gardening backpack and a bucket organiser?",
    "a": "A bucket organiser wraps around a 5-gallon bucket — you carry tools by lifting the bucket. A backpack puts the kit on your shoulders, freeing both hands for ladders, gates and steep ground. Pick the bucket caddy if you mostly work at one spot, the backpack if you walk between jobs."
  },
  {
    "q": "Is the back panel breathable?",
    "a": "Yes — the back panel is padded and breathable, with chest and waist straps to stop the load swinging when you''re moving. The combination of breathable padding plus stabilising straps is what makes a full 26 L kit comfortable for a full day."
  },
  {
    "q": "Can it hold a flask or water bottle?",
    "a": "Yes. Both side panels have mesh stretch pockets that take a standard 750 ml–1 L bottle or insulated flask. Spray bottles fit too."
  },
  {
    "q": "How heavy is the backpack empty?",
    "a": "Approximately 1.35 kg empty. Light enough not to dominate the carry weight even when the bag is loaded."
  }
]'::jsonb
where slug = 'garden-tool-backpack';

update public.hammerex_products
set faq = '[
  {
    "q": "What is SK-5 steel and why does it matter for pruning shears?",
    "a": "SK-5 is a high-carbon tool steel — same family as Japanese kitchen-knife steel. It holds an edge significantly longer than the mild-steel blades used on cheap shears, and it sharpens cleanly back to a working edge. For garden tools cutting live wood, SK-5 is the right balance of hardness and field-sharpenability."
  },
  {
    "q": "Why is the blade Teflon coated?",
    "a": "Two reasons. First, Teflon stops sap building up on the blade — sap is what makes cheap shears stick after an afternoon of pruning. Second, it reduces friction on each cut, which means less hand fatigue over a long pruning session."
  },
  {
    "q": "Bypass or anvil — which one do I want?",
    "a": "Bypass shears (this pair) make clean cuts on living, green wood — flowers, shrubs, fruit-tree prunes. Anvil shears crush rather than slice and are better for dead-wood removal. If you only buy one pair, buy bypass."
  },
  {
    "q": "Are 8-inch shears too big for small hands?",
    "a": "8 inches is the standard professional size — designed to give leverage on harder cuts. The ergonomic handles are shaped for comfortable use across most adult hand sizes. If you have very small hands and only prune soft growth, a 6.5-inch micro pair is a different tool."
  },
  {
    "q": "How often do I need to oil and sharpen them?",
    "a": "A quick wipe with an oily rag after each use stops corrosion (especially after wet days). A few strokes with a diamond file every 10–15 hours of use keeps the edge razor-clean. The blade is field-sharpenable — no need to send away."
  }
]'::jsonb
where slug = 'pruning-shears-8-inch';

update public.hammerex_products
set faq = '[
  {
    "q": "Does it fit any 5-gallon bucket?",
    "a": "Yes. The organiser wraps any standard 5-gallon (19 L) bucket — the size sold by every UK builders'' merchant and DIY chain. Slightly tapered buckets, straight-sided buckets, lidded or open — they all work."
  },
  {
    "q": "Is the bucket included?",
    "a": "No. The bucket is intentionally left out — they''re inexpensive and easy to source locally, and shipping bulky empty buckets internationally would defeat the £20 flat shipping. Buy a bucket from any builders'' merchant or hardware store."
  },
  {
    "q": "How many tools does it hold?",
    "a": "14 dedicated pockets and tool loops, sized for a typical gardener''s daily kit — trowels, pruners, secateurs, hand fork, dibber, twine, gloves, markers, plus larger interior space inside the bucket itself for waste or harvested produce."
  },
  {
    "q": "Is the fabric waterproof?",
    "a": "Water-resistant. 1680D polyester with PVC backing handles dew, light rain and damp soil contact. The PVC backing means moisture from a wet bucket doesn''t soak through into the tool pockets."
  },
  {
    "q": "Can I use it as a tradesman tool caddy too?",
    "a": "Yes. The pocket layout suits any kit of medium hand tools — many tradespeople use bucket organisers exactly like this for site work. The Hammerex caddy is built to the same 1680D spec as the trade range."
  }
]'::jsonb
where slug = 'gardeners-bucket-organizer';

-- First guide. Targets the long-tail query "how to choose pruning shears"
-- (UK + EU + US monthly searches in the thousands; Reddit thread density
-- is low for the exact phrase). Internal-links the SK-5 shears PDP.

insert into public.hammerex_guides (
  slug, title, meta_description, intro, body_md, hero_image_url, faq, related_product_slugs, published
)
values (
  'how-to-choose-pruning-shears',
  'How to choose pruning shears (a buyer''s guide for UK gardeners)',
  'A practical guide to choosing pruning shears in 2026 — bypass vs anvil, SK-5 vs cheap steel, blade size, ergonomic handles, when to upgrade. Written by the Hammerex team.',
  'Most pruning shears under £10 are made the same way — soft steel, no coating, a flimsy spring that fails inside a year. Spend a little more and the same tool lasts a decade. This guide explains what to look for, what to ignore, and when a £15 pair beats a £40 one.',
  E'## Bypass vs anvil — pick this first\n\nThere are two cutting actions and they do different jobs.\n\n**Bypass shears** work like scissors — two sharp blades slide past each other and slice the wood cleanly. The cut surface heals well and the plant carries on growing. Bypass is the right choice for **anything alive** — green shoots, rose stems, soft prunes, fruit-tree work.\n\n**Anvil shears** have one sharp blade pressing onto a flat metal anvil. They crush rather than slice, which makes a messy cut on living wood (and stresses the plant) but works fine on dead wood you''re just removing. Use anvil for **dead, woody stems**.\n\nIf you only buy one pair, buy bypass. Most home and professional gardeners only ever need bypass — dead-wood removal happens rarely enough that a hand-saw covers it.\n\n## The blade steel decides how long it lasts\n\nThis is where cheap shears fall apart. A £6 pair from a supermarket uses unspecified mild steel that rolls or chips on the first hard cut, dulls within a season, and can''t be sharpened back to a working edge.\n\nLook for these on the spec sheet:\n\n- **SK-5 high-carbon tool steel** — the standard for professional Japanese-style blades. Holds an edge for years, sharpens cleanly with a diamond file. The [Hammerex 8" Professional Pruning Shears](/product/pruning-shears-8-inch) use SK-5.\n- **SK-2 / similar carbon tool steels** — also good, slightly softer than SK-5.\n- **"Stainless steel" with no further detail** — usually a soft 420-grade stainless. Avoid for anything beyond very light work.\n- **"Hardened steel"** — marketing word, tells you nothing.\n\n## Teflon coating is not a gimmick\n\nThe single biggest annoyance with pruning shears is **sap build-up**. A pair of un-coated steel blades becomes sticky and stiff after an hour of pruning anything resinous. A Teflon (PTFE) coating on the blade does two things: it stops sap adhering, and it reduces friction so each cut takes less hand strength.\n\nIf you''re going to use the shears for more than 15 minutes at a stretch, coated blades save your hands and your tempo. Uncoated is fine for occasional snipping.\n\n## Blade size — 8 inches is the professional standard\n\nThe overall length you''ll see in the spec is the closed-blade length, measured tip-to-handle.\n\n- **6.5"** — small, light, fine work. Right for delicate cuts and small hands. Not enough leverage on harder wood.\n- **8"** — the **professional standard**. Enough leverage for most live-wood cuts up to ~22 mm diameter, balanced size for full-day comfort.\n- **9–10"** — for hardier cuts or larger users. Heavier in the hand, less precise on small stems.\n\nFor most gardeners doing a mix of soft growth and small branches, **8 inches is the right pair**.\n\n## Handle ergonomics matter more than people think\n\nA pruning session is hundreds of squeeze-release cycles. Cheap shears use flat plastic handles that hot-spot the palm and bruise the side of the index finger within 30 minutes. The features that matter:\n\n- **Soft rubber or TPE-overmoulded grip** — diffuses pressure across the palm.\n- **Spring assist** — the spring opens the blade for you so each cycle is a squeeze only, not a squeeze-and-pull.\n- **Safety lock** — a thumb-flick catch that holds the blade closed in storage, transit, or in a pocket. Non-negotiable for site bags and toolboxes.\n\n## How much should you spend?\n\nFor a UK home gardener doing two to three pruning sessions a year, a £15 pair of SK-5 + Teflon + spring + lock outlives three or four £6 pairs. Real cost per cut is far lower.\n\nFor a professional landscaper or allotment-holder doing weekly work, **£15–£20 is the value sweet spot** — buys you the right steel and the right ergonomics. The £40+ Felco premium is genuinely better but the marginal lift over a good £15–£20 pair is small for most users.\n\n## What to skip\n\n- Anything marked "garden shears" rather than "pruning shears" — those are hedge shears, a different tool.\n- Multi-tool combos that include scissors / saws — none of the three tools are good.\n- Pretty colours over spec.\n\n## Quick recap\n\nBypass blade, SK-5 steel, Teflon coating, spring assist, safety lock, 8 inches, soft-grip handle. That is the spec sheet that lasts ten years.\n\nThe [Hammerex 8" Professional Pruning Shears](/product/pruning-shears-8-inch) tick every box on that list at £14.99 — which is exactly why we built them.',
  'https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2015,%202026,%2011_29_59%20PM.png',
  '[
    {
      "q": "Are bypass or anvil pruning shears better?",
      "a": "Bypass for living wood (cleaner cut, plant heals better) and anvil for dead wood. Most gardeners only ever need bypass — buy one pair of good bypass shears and a small hand-saw for the rare dead-wood job."
    },
    {
      "q": "What size pruning shears for a UK garden?",
      "a": "8 inches is the professional standard and the right size for most UK gardeners. It gives enough leverage on small branches and rose canes while staying light enough for a full afternoon of work."
    },
    {
      "q": "Is SK-5 better than stainless steel?",
      "a": "Yes — for pruning shear blades, SK-5 high-carbon tool steel holds an edge longer and sharpens back cleanly. Generic stainless (usually 420-grade) is softer and dulls quickly. SK-5 needs a wipe of oil after use to prevent corrosion; that''s the only real trade-off."
    },
    {
      "q": "Why do my pruning shears get sticky?",
      "a": "Sap build-up on un-coated blades. Wipe them down with white spirit after each session, or buy shears with a Teflon-coated blade — sap doesn''t adhere to PTFE so the blade stays clean cut after cut."
    },
    {
      "q": "How much should I spend on pruning shears in the UK?",
      "a": "£15–£20 is the sweet spot — buys you SK-5 steel, Teflon coating, spring assist and a safety lock. Anything cheaper compromises on the steel and will dull inside a season. Anything over £40 (e.g. Felco F2) is genuinely better but the marginal lift over a good £15–£20 pair is small for most users."
    }
  ]'::jsonb,
  array['pruning-shears-8-inch','garden-tool-backpack','gardeners-bucket-organizer'],
  true
)
on conflict (slug) do nothing;
