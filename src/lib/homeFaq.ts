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
    a: "Yes — we ship worldwide. Once you've added items to your basket and submitted your order on WhatsApp, the Hammerex team prices delivery for the whole order — best combined rate, never per item — within 24 hours, before any payment is taken. Most items dispatch 3–5 working days after payment is confirmed; air freight transit is typically 5–7 days to the UK, USA and Australia, longer to more remote destinations."
  },
  {
    q: "Are Hammerex tool belts and tool bags good for full-time trade use?",
    a: "Yes. Our leather belt and pouch range uses full-grain hide, brass-bound rivets and contrast yellow stitching; canvas bags, pouches and backpacks are made from heavy-duty ballistic fabric with reinforced stress points and matched workshop hardware. Every product carries a 1-year manufacturing-defect warranty, with optional 3-year Pro Trade Cover available on leather belts and pouches for re-stitching, rivet replacement and slider service."
  },
  {
    q: "What categories of hand tools and trade gear do you make?",
    a: "Tool belts and waist-belt slides, tool pouches, single and double belt-slide pouches, hammer holders, tape holders, knife and cutter holders, trowel holders, hawk holders, drill holders, electrician pouches, scaffolder kits, plastering bags, drywall accessories, tool bags and backpacks, gloves and PPE, aprons and workwear. The full catalogue is laid out by trade on the home page and by tool type in the 'Shop by Tool Type' grid."
  },
  {
    q: "Can hardware stores and building merchants stock Hammerex direct?",
    a: "Yes. Hammerex runs a distribution-partner programme for hardware stores, building merchants and trade resellers — fill out the application form on the Partners page and we will get back to you with trade pricing, MOQ and lead times."
  }
];
