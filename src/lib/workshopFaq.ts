// Brand-wide "Honest answers from the workshop" FAQ. Appended to every PDP
// (plus piped into FAQPage JSON-LD) so we earn SERP coverage on the long-
// tail queries buyers actually type before ordering: shipping, dispatch
// times, factory provenance, custom branding, multi-buy maths, Pro Trade
// Cover, etc.
//
// Tone: plain-spoken, no marketing fluff. The point is for the answer to
// be the kind of thing the workshop foreman would say to a tradesman on the
// phone — short, true, useful.

export type WorkshopFaqItem = { q: string; a: string };

export const WORKSHOP_FAQ: WorkshopFaqItem[] = [
  {
    q: "Where does Hammerex ship from?",
    a: "Every Hammerex product is made in our own Yogyakarta, Indonesia factory and dispatched from there via EMS air freight. We don't drop-ship; the same workshop that stitches the leather packs and posts the order."
  },
  {
    q: "How long until my order is dispatched?",
    a: "Standard dispatch is within 48 hours of order confirmation, posted to EMS. Custom thread colour, custom company branding, and Pro Trade Cover orders add roughly +2 working days to dispatch because they're cut, stitched and finished to spec."
  },
  {
    q: "How long does Hammerex UK delivery take?",
    a: "Typical UK delivery is 5-6 working days from EMS pickup. We send tracking on dispatch. Free UK delivery is available on selected products; non-UK destinations are confirmed on WhatsApp at checkout."
  },
  {
    q: "Is Hammerex a new brand?",
    a: "No. Hammerex has been supplying the UK trade through wholesale distribution for over 12 years. We now sell direct from the factory so the buyer keeps the margin the distributor used to take."
  },
  {
    q: "Does Hammerex offer custom company branding on belts?",
    a: "Yes — most leather belts and tool pouches can be laser-printed with your company name and logo for +£10 per item. Open the \"Your company brand name\" slider on the product page; our admin confirms artwork with you via WhatsApp and sends a mock-up for approval before production starts."
  },
  {
    q: "What is the Hammerex Pro Trade Cover?",
    a: "Beyond the standard 1-year defect warranty, the Pro Trade Cover keeps your belt in service for 3 full years on the parts that wear under daily site use — re-stitching, rivet/stud replacement, buckle service, slider replacement, and leather conditioning. You post the belt to us, we fix it and post it back. You pay postage both ways; we cover all labour and materials. Unlimited claims for 3 years from delivery."
  },
  {
    q: "Can I get a custom thread colour on a Hammerex belt?",
    a: "Yes. Black is the house thread colour and is included free. Six other colours (Yellow, Red, Brown, Orange, Green, White) carry a small per-unit fee and add +2 working days to dispatch while we stitch your order to spec. Selectable on the product page in the \"Thread colour\" slider."
  },
  {
    q: "How do Hammerex multi-buy discounts work?",
    a: "Buy 2 saves 10%, buy 3 saves 15% — applied automatically at the quantity step on most products. No code, no waiting. Bulk and trade pricing beyond that is available — message us via the Partners page for a territory-protected wholesale account."
  },
  {
    q: "What currencies can I pay in?",
    a: "Checkout in GBP, IDR, USD, SGD, AUD, or EUR through Hammerex multi-currency accounts. Live FX, no hidden conversion markup. Your final invoice is in your selected currency."
  },
  {
    q: "How are Hammerex products made?",
    a: "We use the right material for the job — different leathers across our range, faux leather, and synthetic fabrics where they outperform leather (water resistance, weight, washability). Cutting, stitching, riveting, QC and pack-out all happen under one roof in Yogyakarta. Every unit is inspected on CCTV-recorded QC before pack — no outsourced assembly, no reseller in the chain."
  },
  {
    q: "Do you offer wholesale or trade accounts?",
    a: "Yes. We run a distribution-partner programme with transparent pricing, protected territories and fair monthly targets — designed around real demand in your market. Retail welcomed from 30 kg mixed product orders. Apply via the Partners page on the site."
  },
  {
    q: "How do I track my Hammerex order?",
    a: "We send the EMS tracking number on WhatsApp the day your order is dispatched. EMS provides updates from collection through customs to your door — typical UK transit is 5-6 working days. If anything stalls, message us on WhatsApp and we'll chase EMS for you."
  }
];
