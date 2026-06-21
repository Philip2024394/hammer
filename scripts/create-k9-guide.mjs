import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "k9-plastering-tool-station-buyers-guide";
const HERO = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2011_40_43%20AM.png";

const body_md = `## Why the K9 has lasted on UK sites for 12 years

The K9 Plastering Tool Station was developed for plasterers and renderers who want **every blade protected and every tool in one bag** — no rolled-up canvas wrap, no tools rattling against each other in a generic site bag. It became the bag UK plastering firms specified because it solves the three problems every plasterer hits:

1. **Trowel edges get nicked** when carried loose. Replacement blades aren't cheap, and a nicked edge ruins a perfect skim.
2. **Hawk boards warp** when bent inside a bag. A dedicated rigid compartment keeps them flat for years.
3. **Spirit levels migrate** to the bottom of the bag, gather plaster dust, and snap.

The K9 was built around all three: dedicated trowel slots that hold the blades parallel and proud, a rigid hawk pocket that mirrors the hawk's own shape, and a fixed spirit level / spatula pole holder on the same side as the hawk.

## What the K9 actually holds

| Item | Capacity |
|---|---|
| Side trowels | 2 × 18" × 5" — front-loading slots |
| Gable trowel | 1 × 14" × 5" — angled top slot |
| Plastering hawk | 1 × up to 18" × 18" — rigid rear compartment |
| Spirit level / spatula pole | Fixed mount on the hawk-side panel |
| Inner workspace | 20" × 10" × 8" (L × W × H) for skim rule, spatulas, mixer paddle |

The inner compartment is lined with **fiber-flex certified washable lining** — important because plaster dust gets into everything, and this lining can be wiped down or sponged out without breaking down.

## Genuine leather — and why it matters here

Most "leather-look" tool bags on the market are PVC or PU stuck onto a fabric backing. Two seasons of site abuse and the surface flakes off in your hands.

The K9 is **genuine leather** with reinforced corners and top edges. It's the same leather we use on the Hammerex scaffolders' belts — full-grain, industrially sewn, with heavy-duty stitching at every stress point. The reinforced corners are the part that takes the most abuse when the bag is dragged across scaffolding boards or set down on aggregate — that's where the cheaper bags fail first.

## K9 vs Plasterer's Backpack vs Plastering Caddy

We make three plastering carries. They're for different jobs:

- **K9 Plastering Tool Station** — a rigid carry case. Best for the plasterer who travels with a full kit and needs every tool protected. Carry handle + shoulder option. £188 free UK delivery.
- **Plasterer's Backpack** — soft pack with 4 trowel slots, hawk slot, large internal compartment. Best for the plasterer who wants hands-free carry and packs lighter (1 hawk + 4 trowels max). £96 free UK delivery.
- **Plastering Caddy** — wrap-style 5-trowel + hawk caddy. Best for the plasterer who already has a bag and needs a tool-protection insert. £44 free UK delivery.

A common combination: **K9 for kit travel** + **Plasterer's Backpack** for daily carry on the same site. The K9 lives in the van, the backpack walks onto the scaffold.

## What about the K11?

The K11 Drywall Tool Station shares the K9's frame language but is built for **tapers and drywall finishers** — 5 knife rows, a 16" mud pan compartment, aluminium edge protectors and stainless steel upper corners. Plasterers who do crossover finishing work often order both. See the K11 product page for the full spec.

## Buying direct vs through a reseller

The K9 has been on the UK market for over a decade through wholesale distribution. We've now cut the distributor — every K9 ships **direct from the Yogyakarta factory** that makes it, via EMS air freight, with **free UK delivery**.

That's why the direct price is £188 versus the £175–£200 you'll see on reseller listings: same product, same factory, just no middleman cut. Dispatch is within 48 hours. Trade and bulk pricing are available — message us via the Partners page for territory-protected wholesale.

## How to look after a leather tool station

- **Wipe down after dusty days.** Plaster dust dries out leather over time. A damp cloth and a light leather conditioner once a quarter is plenty.
- **Don't store damp.** If the bag is wet from rain, empty it and let the inside air-dry before zipping it back up.
- **Keep edges away from sharp aggregate.** The corner reinforcements are tough, but a six-month leather habit pays back in five-year leather life.
- **Hammerex Pro Trade Cover** (3-year repair service — re-stitching, rivet replacement, slider service, leather conditioning) is available as a one-off £15 add-on on the product page.
`;

const intro = "The K9 Plastering Tool Station is the bag UK plastering firms keep specifying after 12 years. Here's what it holds, why it lasts, how it compares to the Plasterer's Backpack and Plastering Caddy, and what to look for in a proper plastering carry before you buy.";

const meta_description = "Hammerex K9 Plastering Tool Station buyer's guide — capacity, materials, trowel + hawk fit, K9 vs Plasterer's Backpack vs K11, direct-from-factory pricing, and how to care for a leather tool station. Free UK delivery on the K9.";

const faq = [
  {
    q: "What size plastering tool station do I need?",
    a: "Most plasterers need a station that fits 18\" side trowels and an 18\" hawk — that's the standard professional kit. The K9 fits two 18\" × 5\" side trowels, a 14\" × 5\" gable trowel, and an 18\" × 18\" hawk in dedicated rigid compartments, plus a spirit level holder. If you carry 5+ trowels, look at the Plastering Caddy (5-trowel wrap) or pair the K9 with the Plasterer's Backpack."
  },
  {
    q: "Is the K9 genuine leather?",
    a: "Yes. The K9 is full-grain genuine leather with reinforced corners and top edges — the same leather we use on Hammerex scaffolders' belts. Industrial sewn at every stress point. The lining is a separate fiber-flex certified washable layer that can be wiped down after dusty work."
  },
  {
    q: "K9 vs Plasterer's Backpack — which one?",
    a: "K9 is a rigid case — best for protecting your full kit during travel and storage. Plasterer's Backpack is a soft hands-free carry — best for daily site use with 4 trowels + hawk. Many UK plasterers buy both: K9 lives in the van, backpack walks onto the scaffold. The K9 is £188, the backpack is £96, both with free UK delivery."
  },
  {
    q: "What's the difference between the K9 and the K11?",
    a: "The K9 is built for plasterers — 3 trowel slots, hawk compartment, spirit level holder. The K11 is built for drywall tapers — 5 knife rows, mud pan compartment, plus trowel and hawk capacity for crossover finishing work. Same frame language; different interior layouts. K11 also adds aluminium edge protectors and stainless steel upper corners."
  },
  {
    q: "How long does the K9 last on real site conditions?",
    a: "Reinforced corners, industrial stitching, full-grain leather — with reasonable care (wipe-down after dusty days, light conditioner once a quarter, don't store damp), the K9 lasts the working life of a plasterer. Some UK plasterers are still using bags they bought 10+ years ago. The 3-Year Pro Trade Cover (£15 one-off) extends the warranty on wearing parts."
  },
  {
    q: "How fast is delivery on the K9?",
    a: "Dispatched within 48 hours of order from the Yogyakarta factory, posted EMS air freight. Typical UK delivery is 5–6 working days. UK delivery is free. Non-UK destinations are quoted on WhatsApp at checkout."
  },
  {
    q: "Why is the K9 cheaper direct than at resellers?",
    a: "We sold the K9 through UK wholesale distribution for 12 years. The reseller price reflects the distributor's margin. We now sell direct from the factory — same product, same factory, no middleman cut. That's why the direct price is £188 vs the £175–£200 you'll see on reseller listings, and why direct buyers also get free UK delivery."
  }
];

const data = {
  slug: SLUG,
  title: "The K9 Plastering Tool Station — buyer's guide",
  meta_description,
  intro,
  body_md,
  hero_image_url: HERO,
  faq,
  related_product_slugs: [
    "k9-plastering-tool-station",
    "plastering-backpack",
    "k11-drywall-tool-station",
    "plastering-caddy"
  ],
  published: true
};

const existing = await s.from("hammerex_guides").select("id").eq("slug", SLUG).maybeSingle();
if (existing.data) {
  const upd = await s.from("hammerex_guides").update(data).eq("id", existing.data.id);
  if (upd.error) throw upd.error;
  console.log("✓ K9 guide refreshed");
} else {
  const ins = await s.from("hammerex_guides").insert(data);
  if (ins.error) throw ins.error;
  console.log("✓ K9 guide created");
}
console.log("\nLive at: /guides/" + SLUG);
