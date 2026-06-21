// Home-page FAQ surface targeted at high-volume informational queries that
// commonly precede catalogue browsing. Emitted as FAQPage JSON-LD on the home
// page so Google can pick any of these for the AI Overview / featured-snippet
// panel and route the click to hammerex.com instead of a generic merchant.
//
// Each entry is purposely written to cover a target keyword phrase ("tool
// belt", "tool bag", "construction tools", "hand tools", "hardware store
// direct", "building merchants") at least once in the answer body.
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "What is a tool belt and which trades need one?",
    a: "A tool belt is a heavy-duty leather or webbing belt worn around the waist with pouches and holders that keep hand tools — tape, pliers, hammer, knife, fixings — in reach all day. Plasterers, drywallers, scaffolders, electricians, carpenters, bricklayers and tilers all rely on tool belts. Hammerex tool belts are stitched and riveted in our Yogyakarta workshop and shipped direct, so they cost less than the equivalent product at a building merchant or hardware store."
  },
  {
    q: "What's the difference between a tool bag and a tool belt?",
    a: "A tool belt rides on your waist and keeps a few critical hand tools at arm's reach while you work. A tool bag is a carry container — usually a heavy-duty canvas or leather sling, backpack or holdall — for transporting the rest of your kit between van, site and house. Most tradesmen use both: a belt for the working tools, a bag for the wider toolkit. Hammerex sells both ranges direct from the workshop."
  },
  {
    q: "Where can I buy construction tools and trade products direct?",
    a: "Hammerex is a maker-direct construction tools supplier. We design, stitch, rivet and pack every belt, pouch, holder and tool bag in our own Yogyakarta workshop and ship internationally with no reseller markup. Buying direct means you skip the hardware store and building-merchant margin and get the same trade-grade product at a lower price."
  },
  {
    q: "Do you ship tool belts and tool bags to the UK, USA and Australia?",
    a: "Yes. Flat £20 EMS Air Mail shipping to UK, USA and Australia, with most products in production-line stock for 4–5 working day dispatch. Air freight transit is around 5–7 working days. Other countries are quoted on WhatsApp based on weight and destination."
  },
  {
    q: "Are Hammerex tools good for full-time trade use?",
    a: "Every Hammerex product is designed around a real on-site problem and is built for daily trade use — full-grain leather, brass-bound rivets, contrast stitching and reinforced stress points. We back this with a 1-year manufacturing-defect warranty plus optional 3-year Pro Trade Cover for re-stitching, rivet replacement and slider service across normal site wear."
  },
  {
    q: "What categories of hand tools and trade gear do you make?",
    a: "Tool belts and waist-belt slides, single and double pouches, hammer holders, tape holders, knife and cutter holders, trowel holders, hawk holders, drill holders, electrician pouches, scaffolder kits, plastering bags, drywall accessories, tool bags and backpacks, gloves and PPE, aprons and workwear. The full catalogue is laid out by trade on the home page."
  },
  {
    q: "Can hardware stores and building merchants stock Hammerex direct?",
    a: "Yes. Hammerex runs a distribution-partner programme for hardware stores, building merchants and trade resellers — fill out the application form on the Partners page and we will get back to you with trade pricing, MOQ and lead times."
  }
];
