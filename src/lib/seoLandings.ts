// SEO alias landing pages — thin top-level URLs that capture high-volume
// generic Google queries (/tool-belts, /tool-bags, /construction-tools, etc.)
// and route the buyer into the existing category catalogue. Each landing has
// its own title, meta description, H1, intro copy and curated category slug
// list — so Google sees a unique, keyword-dense page rather than another
// duplicate of /c/[slug]. The actual products are reused from the category
// tables; we are NOT duplicating SKUs.
//
// Routes are defined under src/app/{slug}/page.tsx; each renders
// SeoLandingPage with the matching key.
export type SeoLandingConfig = {
  slug: string;
  // <title> — keyword-leading, ≤70 chars.
  title: string;
  // <h1> visible heading. Slightly more human than the title.
  h1: string;
  // <meta description> — ≤160 chars.
  metaDescription: string;
  // Long-form intro copy (~150 words). Required for the page to look unique
  // to Google. Plain text; rendered as paragraphs split on blank lines.
  intro: string;
  // Category slugs surfaced as the product grid. These already exist in the
  // hammerex_categories table — the landing page simply pulls products from
  // them. Order matters: first category = most prominent.
  categorySlugs: string[];
  // Single category to drive the canonical "shop all" CTA at the foot of the
  // page. Falls back to the first categorySlugs entry when null.
  ctaCategorySlug?: string | null;
  // Page-specific FAQ (3-5 Qs). Emitted as visible accordion + FAQPage JSON-LD.
  faq: { q: string; a: string }[];
};

export const SEO_LANDINGS: Record<string, SeoLandingConfig> = {
  "tool-belts": {
    slug: "tool-belts",
    title: "Tool Belts UK & Worldwide — Leather Trade Belts Direct from the Maker",
    h1: "Tool Belts — Leather Trade Belts Direct from the Hammerex Workshop",
    metaDescription:
      "Tool belts for plasterers, electricians, scaffolders, carpenters & drywallers. Full-grain leather, stitched and riveted in Yogyakarta. Worldwide shipping direct.",
    intro:
      "A tool belt is the working belt that keeps your hand tools — tape, pliers, hammer, knife, fixings — at arm's reach all day. Hammerex tool belts are designed, stitched and riveted in our own Yogyakarta workshop and shipped direct to tradesmen worldwide, with no reseller markup between the maker and you.\n\nOur tool belt range covers full leather work belts, scaffolders' setup belts, plasterer kits, drywaller and electrician pouch slides, carpenter and bricklayer rigs, and modular pouches and holders that fit standard 2\" trade belts. Every belt is full-grain leather with brass-bound rivets, contrast stitching and reinforced stress points — built for full-time site use, not weekend DIY. Flat £20 EMS Air Mail shipping to UK, USA and Australia; other countries quoted on WhatsApp.",
    categorySlugs: ["belts", "trowel-holders", "belt-holders", "scaffolding", "electrical", "plastering"],
    ctaCategorySlug: "belts",
    faq: [
      {
        q: "What is the best tool belt for a tradesman?",
        a: "The right tool belt depends on the trade. Plasterers and drywallers want a wide leather belt with hawk, trowel, knife and tape holders. Electricians need pouch-slide systems with insulated tool pockets. Scaffolders want a riveted heavy-duty belt with lanyard tethering. All three are stocked direct from the Hammerex workshop."
      },
      {
        q: "Where can I buy a leather tool belt direct from the maker?",
        a: "Direct from hammerex.com. Every Hammerex tool belt is cut, stitched and riveted in our Yogyakarta workshop and shipped to your door via EMS Air Mail. No hardware-store or building-merchant markup."
      },
      {
        q: "Do you ship tool belts to the UK and USA?",
        a: "Yes. Flat £20 shipping to UK, USA and Australia with 4–5 working day dispatch and ~5–7 day air freight transit. Other destinations are quoted on WhatsApp."
      },
      {
        q: "How long does a Hammerex tool belt last?",
        a: "Built for daily site use — full-grain leather, brass-bound rivets, double-row stitching. Covered by a 1-year manufacturing-defect warranty and optional 3-year Pro Trade Cover for re-stitching, rivet replacement and slider service."
      }
    ]
  },
  "tool-bags": {
    slug: "tool-bags",
    title: "Tool Bags & Backpacks for Tradesmen — Direct from the Workshop",
    h1: "Tool Bags & Tool Backpacks — Trade-Grade Carry Direct",
    metaDescription:
      "Heavy-duty tool bags, tool backpacks and trade slings for builders, electricians and plumbers. Stitched in Yogyakarta. Worldwide shipping direct from Hammerex.",
    intro:
      "A tool bag carries the rest of your toolkit between van, site and house — everything that doesn't ride on your tool belt. Hammerex tool bags are built like our belts: heavy-duty canvas and leather, double-row stitching, reinforced base panels and brass-bound rivets at every stress point.\n\nThe range covers tool backpacks for electricians and tilers, plasterer sling bags, contractor holdalls, framer and joiner tote bags, and modular pouches for site phones and tablets. Designed in-house, made in our Yogyakarta workshop, shipped direct. The hardware-store-direct alternative to the marked-up trade brands you find at building merchants. Flat £20 EMS Air Mail shipping to UK, USA and Australia.",
    categorySlugs: ["tool-bags-backpacks", "phone-laptop-cases", "lunch-hydration"],
    ctaCategorySlug: "tool-bags-backpacks",
    faq: [
      {
        q: "What is the best tool bag for a tradesman?",
        a: "A tool bag is the carry container for your wider toolkit. Electricians and plumbers usually run a backpack-style bag; carpenters and contractors run a heavy holdall or sling. Hammerex makes both — full canvas and leather construction, brass-bound rivets, reinforced base panels."
      },
      {
        q: "Are Hammerex tool bags waterproof?",
        a: "The canvas is water-resistant and treated for site exposure. Heavy weatherproofing (full waterproof seal) is not standard — most trades work covered or in vans and prefer the ventilation. Custom waterproof variants can be quoted on WhatsApp."
      },
      {
        q: "Can hardware stores stock Hammerex tool bags wholesale?",
        a: "Yes. Trade resellers, hardware stores and building merchants can join the Hammerex distribution-partner programme via the Partners page for wholesale pricing and lead times."
      }
    ]
  },
  "construction-tools": {
    slug: "construction-tools",
    title: "Construction Tools Direct — Hand Tools, Tool Belts & Site Gear",
    h1: "Construction Tools — Trade-Grade Hand Tools Direct from the Maker",
    metaDescription:
      "Construction tools and hand tools for trades — tool belts, pouches, trowels, holders, PPE. Stitched in Yogyakarta. Direct shipping worldwide.",
    intro:
      "Construction tools cover everything a tradesman needs on site: hand tools, tool belts, pouches, trowels, holders, PPE, workwear, lunch and hydration gear. Hammerex designs and makes the trade-side of that catalogue — leather and canvas trade gear — in our own Yogyakarta workshop.\n\nWe are the maker-direct alternative to building merchants and the marked-up hardware-store brands. Plasterers, drywallers, scaffolders, electricians, plumbers, bricklayers, tilers, carpenters and stone masons all carry Hammerex tool belts and tool bags. Direct from the workshop, no resellers — which means you pay the trade price, not the retail price. Flat £20 EMS Air Mail to UK, USA and Australia; other countries on WhatsApp.",
    categorySlugs: [
      "belts",
      "tool-bags-backpacks",
      "belt-holders",
      "trowels",
      "trowel-holders",
      "gloves-ppe",
      "aprons-workwear"
    ],
    ctaCategorySlug: null,
    faq: [
      {
        q: "What counts as construction tools?",
        a: "On the trade-belt side: tool belts, pouches, holders, sleeves, wallets and modular site carry. Plus the hand tools that mount in them — trowels, tape measures, knives, hammers. Hammerex makes the belt and carry side of construction tools direct from our workshop."
      },
      {
        q: "Where can builders buy construction tools direct?",
        a: "Hammerex sells direct to tradesmen — no hardware-store or building-merchant chain in the middle. Order through hammerex.com and we dispatch within 4–5 working days from Yogyakarta via EMS Air Mail."
      },
      {
        q: "Do you supply construction tools wholesale?",
        a: "Yes — trade resellers, hardware stores and building merchants can apply via the Partners page for wholesale pricing, MOQs and lead times."
      }
    ]
  },
  "hand-tools": {
    slug: "hand-tools",
    title: "Hand Tools for Trades — Trowels, Hammers, Knives & Trade Carry",
    h1: "Hand Tools & Trade Carry — Direct from the Hammerex Workshop",
    metaDescription:
      "Hand tools for tradesmen — trowels, knives, hammers, and the belt pouches and holders that carry them. Made in Yogyakarta. Direct shipping worldwide.",
    intro:
      "Hand tools are the working tools that move with you — trowels, hammers, tape measures, knives, cutters, pliers. They live on your tool belt, in your apron, or in your tool bag. Hammerex makes the belt-and-carry side of the hand-tools catalogue: full-leather pouches, hammer holders, knife sheaths, trowel holders, hawk holders, tape pouches and modular site wallets.\n\nDirect from the Yogyakarta workshop. Trade-grade build, no reseller markup, no hardware-store middleman. Plasterers, electricians, scaffolders, carpenters and tilers all use Hammerex carry around their hand tools. Worldwide shipping with flat £20 EMS Air Mail to UK, USA and Australia.",
    categorySlugs: [
      "trowels",
      "knives-cutters",
      "hammer-holders",
      "tape-holders",
      "trowel-holders",
      "belt-holders",
      "drill-holders"
    ],
    ctaCategorySlug: null,
    faq: [
      {
        q: "What are the most common hand tools tradesmen carry?",
        a: "Tape measure, hammer, utility knife, pliers, pencil — every trade carries these. Trowel for plasterers and bricklayers, screwdrivers and stripping tools for electricians, levels for tilers and carpenters. Hammerex makes the belt pouches and holders that carry every one of these."
      },
      {
        q: "Where can I buy hand tools direct from the maker?",
        a: "Direct from hammerex.com. Designed, stitched and riveted in our Yogyakarta workshop and shipped via EMS Air Mail worldwide."
      },
      {
        q: "Are Hammerex hand tools and pouches trade-grade?",
        a: "Yes. Every belt, pouch and holder is built for full-time daily site use — full-grain leather, brass-bound rivets, contrast stitching and reinforced stress points. 1-year defect warranty + optional 3-year Pro Trade Cover."
      }
    ]
  },
  "hardware-store-direct": {
    slug: "hardware-store-direct",
    title: "Hardware Store Direct — Tool Belts, Tool Bags & Trade Hand Tools",
    h1: "Hardware-Store-Direct Prices — Trade Tools from the Maker",
    metaDescription:
      "Skip the hardware-store markup. Tool belts, tool bags and trade hand tools direct from the Hammerex workshop in Yogyakarta. Worldwide shipping.",
    intro:
      "Hardware stores and trade counters are convenient but they sit between the maker and the tradesman — and the markup adds up over a working life. Hammerex is the hardware-store-direct alternative. Same trade-grade build (full-grain leather, brass-bound rivets, contrast stitching), same product categories you'd find on a hardware-store wall — tool belts, tool bags, hand-tool holders, PPE — but ordered direct from the workshop and shipped to your door.\n\nWe also supply hardware stores, builders' merchants and trade resellers wholesale through our distribution-partner programme — you get retail-floor inventory, we get to keep the maker-to-tradesman chain short.",
    categorySlugs: [
      "belts",
      "tool-bags-backpacks",
      "trowel-holders",
      "hammer-holders",
      "tape-holders",
      "knives-cutters"
    ],
    ctaCategorySlug: null,
    faq: [
      {
        q: "How is buying direct cheaper than a hardware store?",
        a: "Hardware-store pricing has to cover the chain: importer, distributor, retail margin, shelf space, staff. Buying direct from the Hammerex workshop skips every layer between us and you — same product, lower price."
      },
      {
        q: "Can hardware stores stock Hammerex direct?",
        a: "Yes. Hardware stores, builders' merchants and trade counters can join the distribution-partner programme via the Partners page for wholesale pricing, MOQs and lead times."
      },
      {
        q: "Is delivery as fast as ordering from a hardware store?",
        a: "4–5 working day dispatch from Yogyakarta + ~5–7 day air freight transit on EMS Air Mail. Slower than a local hardware-store collection on the same day, but priced for the difference — and for most trade buyers the saving outweighs the wait."
      }
    ]
  },
  "building-merchants": {
    slug: "building-merchants",
    title: "Building Merchants — Wholesale Tool Belts, Tool Bags & Trade Carry",
    h1: "Building Merchants — Wholesale Trade Carry from the Maker",
    metaDescription:
      "Building merchants and trade counters: stock Hammerex tool belts, tool bags and hand-tool carry direct from the Yogyakarta workshop. Wholesale lead times on the Partners page.",
    intro:
      "Building merchants and trade counters compete on availability and price. Hammerex supplies the trade-carry side of your inventory direct from the maker — tool belts, tool bags, modular pouches, hand-tool holders and trade workwear — at wholesale lead times that work with your buying cycle. No middlemen, no licensed-brand markup.\n\nDesigned and stitched in our own Yogyakarta workshop with full QC and CCTV-recorded production. You can place a small trial order (10 pieces minimum of any product) to check the build before scaling up; once you're set up, we work to your inventory cadence with MOQs and lead times agreed up front. Apply via the Partners page.",
    categorySlugs: [
      "belts",
      "tool-bags-backpacks",
      "trowel-holders",
      "hammer-holders",
      "gloves-ppe",
      "aprons-workwear"
    ],
    ctaCategorySlug: null,
    faq: [
      {
        q: "Do you supply building merchants wholesale?",
        a: "Yes. Tool belts, tool bags, pouches, holders and trade workwear at wholesale pricing for building merchants, trade counters and hardware stores. Apply via the Partners page."
      },
      {
        q: "What is the minimum order for a building merchant?",
        a: "Trial orders start at 10 pieces of any single product so you can verify quality before scaling. Production-line MOQs are agreed per category once you're onboarded."
      },
      {
        q: "How fast can you fulfil a building-merchant order?",
        a: "4–5 working day dispatch on production-line stock; larger orders are scheduled against the next available production slot — typically 3–6 weeks depending on volume and category."
      }
    ]
  },
  "new-tools": {
    slug: "new-tools",
    title: "New Tools — Latest Tool Belts, Tool Bags & Trade Hand Tools",
    h1: "New Tools — Latest from the Hammerex Workshop",
    metaDescription:
      "Newest tool belts, tool bags and trade hand tools from the Hammerex Yogyakarta workshop. Latest designs direct to tradesmen worldwide.",
    intro:
      "New tools land on the Hammerex catalogue most weeks — refreshed tool belts, new pouch slides, updated trowel holders, fresh tool-bag designs, and seasonal trade workwear. Everything is designed in-house in our Yogyakarta workshop and shipped direct to tradesmen — so when something is new here, it's new everywhere; there's no hardware-store or building-merchant lag while inventory catches up.\n\nBrowse the newest belts and bags below, or follow the workshop on Instagram (@hammerexproductsdirect) to see the next drop before it lands on the site.",
    categorySlugs: [
      "belts",
      "tool-bags-backpacks",
      "trowel-holders",
      "belt-holders",
      "scaffolding",
      "electrical"
    ],
    ctaCategorySlug: null,
    faq: [
      {
        q: "How often are new tools added?",
        a: "Most weeks — we run a continuous workshop release cycle on belts and pouches and add new SKUs whenever the production line lands a finished design."
      },
      {
        q: "Where do I see the latest tools first?",
        a: "Instagram @hammerexproductsdirect carries workshop drops before they land on the site. The catalogue updates within a couple of days."
      },
      {
        q: "Are new tools the same trade-grade build as the rest of the range?",
        a: "Yes. New tools follow the same brief — full-grain leather, brass-bound rivets, contrast stitching, reinforced stress points — and ship under the same 1-year defect warranty and optional 3-year Pro Trade Cover."
      }
    ]
  }
};

export const SEO_LANDING_SLUGS = Object.keys(SEO_LANDINGS);
