import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SLUG = "k11-drywall-tool-station-buyers-guide";

const title = "The Hammerex K11 Tool Station — Redefining Drywall Site Storage";

const meta_description =
  "The Hammerex K11 Drywall Tool Station: 5 knife rows, mud-pan well, reinforced solid-core frame. If you can lift it, it will carry it. Free worldwide delivery.";

const intro =
  "Every drywall professional knows the frustration of arriving on-site and spending valuable time searching for tools. Knives mixed with trowels, mud pans stacked awkwardly, taping tools buried beneath power tools — the result is lost productivity and unnecessary wear on expensive equipment. At Hammerex, we believed there had to be a better way. After years of development, testing, and refinement, the result is the Hammerex K11 Tool Station — a purpose-built drywall storage and transport system engineered specifically for professional tapers, finishers, and plasterers.";

const body_md = `## Not just a toolbox

The first thing you'll notice about the K11 Tool Station is that it isn't a traditional toolbox.

Traditional toolboxes were never designed for drywall professionals. They force tradespeople to compromise, stacking finishing tools on top of one another and wasting time digging through clutter.

The K11 was built from the ground up around the tools drywall professionals use every day. This is a complete tool station designed to organise, protect, transport, and provide quick access to the equipment that earns your living.

## If You Can Lift It – It Will Carry It™

That statement became our design philosophy.

The K11 has been engineered with exceptional load-carrying capability while maintaining structural integrity under the demands of daily site work. Built with robust materials, double-lined construction, and a solid-core reinforced frame, it is designed to withstand the punishment of commercial and residential construction environments.

Whether you're carrying knives, trowels, mud pans, skimming blades, tape, power tools, or site accessories, the K11 is built to handle the load.

## Purpose-built storage for drywall professionals

The K11 Tool Station offers storage solutions tailored specifically to drywall finishing equipment.

### Knife storage

The K11 accommodates up to:

* **5 rows of drywall knives**
* Total knife storage length of **19.5 inches**

Your finishing knives remain organised, protected, and ready for immediate use. No more damaged blades. No more searching through tool bags.

### Trowel storage

The side compartment is designed to accommodate plastering trowels up to **18" x 5"**. Large finishing trowels can be transported safely without being crushed or damaged during transit.

### Skimming blades and spatulas

The K11 provides dedicated storage for:

* Open-end skimming blades
* Spatulas
* Finishing blades
* Specialty drywall tools

Everything has its place.

### Mud pan storage

Professional finishers often carry multiple mud pans to site. The K11 accommodates **1 to 3 mud pans**, nested together for efficient storage. No wasted space. No rattling equipment.

### Site level storage

A dedicated side position allows convenient storage for a site water level, ensuring it remains protected while remaining easily accessible when needed.

### Gable pockets for small tools

Additional gable pockets provide storage for utility knives, tape measures, pencils and markers, scrapers, corner tools, and small site accessories. Every tool has a home.

## Massive internal storage capacity

The external storage features are only part of the story. Open the main compartment and you'll discover approximately:

### 7" × 20" × 14" of internal storage space

This large central compartment is perfect for:

* Power tools
* Electrical tools
* Joint tape rolls
* Consumables
* Fasteners
* Chargers
* Spare accessories

The result is a complete mobile workstation that allows drywall professionals to keep everything in one organised location.

## At a glance — the K11 in numbers

| Spec | K11 Tool Station |
|---|---|
| Knife storage | 5 rows · 19.5" length |
| Trowel slot | Up to 18" × 5" |
| Mud pans | 1–3 nested |
| Main compartment | ~7" × 20" × 14" |
| External dimensions | 520 × 250 × 380 mm |
| Frame | Solid-core, reinforced aluminium edge |
| Carry | Shoulder strap + grab handle |
| Made in | Yogyakarta, Indonesia — Hammerex factory |
| Warranty | 1 year (manufacturing defects) |
| Delivery | Free UK · USA · Australia |

## Built to last

Many products are designed to survive a job. The K11 Tool Station was designed to survive a career.

Through extensive field testing and manufacturing improvements, Hammerex has developed a tool station capable of enduring years of demanding site conditions. With basic care and maintenance, the K11 can provide reliable service year after year.

In fact, we believe many owners will eventually pass their K11 Tool Station on to the next generation of drywall professionals. That's the level of durability we set out to achieve.

## Designed by tradespeople, for tradespeople

The best tools come from understanding the trade.

Every pocket, compartment, holder, and storage position on the K11 exists because drywall professionals asked for it. This wasn't designed in an office — it was developed through real-world site experience and refined through years of practical testing.

The result is a storage system that improves organisation, protects equipment, and increases productivity on every job.

## Who the K11 is for

* **Tapers and finishers** running a 5-knife setup who need every blade protected on the move.
* **Plaster-to-drywall crossover trades** who don't want a separate bag for each discipline.
* **Crew leads and site supervisors** who carry the kit, the spares, and the chargers all in one trip from van to floor.
* **Independent contractors** who want one heirloom-grade station rather than three soft bags that fail at 12 months.

If you load a van for a drywall finish on Monday morning, the K11 was designed for you.

## A note on the trade-off you don't have to make

For years, drywall pros have been forced to choose between **capacity** and **mobility**. Big rigid toolboxes carry the load but punish your back at every step. Soft tool bags move easily but offer no real protection for the edge of a 14" finishing knife or the rim of a £40 mud pan.

The K11 was built to refuse that trade-off. The reinforced frame protects everything inside. The single-shoulder carry plus grab handle keeps it manageable on stairs, scaffolds, and floor lifts. The dimensions are tight enough to fit the floor well of a Transit, square enough to stack without slipping.

That's the engineering choice we made: **structural strength of a hard case, the move-anywhere usability of a bag.**

## The new standard for drywall storage

The Hammerex K11 Tool Station represents more than another storage solution. It represents a commitment to quality, innovation, and craftsmanship.

For drywall finishers, tapers, plasterers, and contractors who demand the best from their equipment, the K11 provides the organisation, capacity, and durability required to meet the challenges of modern construction sites.

Because when your tools are your livelihood, they deserve more than a toolbox. They deserve a tool station.

### Hammerex K11 Tool Station

**The Drywall Tool Master™**

**If You Can Lift It – It Will Carry It™**`;

const faq = [
  {
    q: "What's included with the Hammerex K11 Tool Station?",
    a: "The K11 ships as a complete tool station with 5 knife rows, trowel slot, mud-pan well, hawk position, site-level slot, gable pockets, and a 7\" × 20\" × 14\" internal compartment. Tools shown in photos are not included — the station is built to carry your existing kit."
  },
  {
    q: "Does the K11 fit a full 5-knife taper set including 14\" finishers?",
    a: "Yes. The 5 knife rows are sized for 19.5\" total length so you can run a full taper set (6\", 8\", 10\", 12\", 14\") without leaving any blade unprotected."
  },
  {
    q: "Can I carry 3 mud pans at once?",
    a: "Yes. The mud-pan well is designed to nest 1–3 standard pans together for efficient transport — no rattling, no wasted space."
  },
  {
    q: "How is the K11 different from the K9 Plastering Tool Station?",
    a: "Same chassis, different cockpit. The K9 is optimised for plasterers (trowels, hawk, scrim, render gun accessories). The K11 is optimised for drywall tapers and finishers (5-knife rows, mud-pan well, joint-tape compartment). If you do both trades, many crews carry one of each."
  },
  {
    q: "Where is the K11 made?",
    a: "Built at the Hammerex factory in Yogyakarta, Indonesia, using genuine leather, solid-core panels, stainless-steel edges, and a reinforced aluminium base."
  },
  {
    q: "What does delivery cost?",
    a: "Free worldwide delivery — UK, USA, and Australia included. Typical transit 5–6 working days, dispatched within 48 hours of order."
  },
  {
    q: "Is there a bulk / multi-buy discount?",
    a: "Yes. Buy 2 and save 5%. Buy 3 and save 10%. Applied automatically at the quantity step on the product page."
  },
  {
    q: "How long is the warranty?",
    a: "1 year against manufacturing defects. With basic care the K11 is engineered to last many years of daily site use — many owners will pass theirs on to the next generation."
  }
];

const HERO_IK = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2024,%202026,%2006_53_10%20PM.png";

const related_product_slugs = [
  "k11-drywall-tool-station",
  "drywall-pro-kit",
  "k9-plastering-tool-station"
];

for (const s of related_product_slugs) {
  const { data } = await sb.from("hammerex_products").select("slug").eq("slug", s).maybeSingle();
  if (!data) console.warn(`  ! related product slug missing: ${s}`);
}

const payload = {
  slug: SLUG,
  title,
  meta_description,
  intro,
  body_md,
  hero_image_url: HERO_IK,
  faq,
  related_product_slugs,
  published: true
};

const existing = await sb.from("hammerex_guides").select("id").eq("slug", SLUG).maybeSingle();
if (existing.data) {
  const { error } = await sb.from("hammerex_guides").update(payload).eq("id", existing.data.id);
  if (error) throw error;
  console.log(`✓ updated existing guide ${SLUG}`);
} else {
  const { error } = await sb.from("hammerex_guides").insert(payload);
  if (error) throw error;
  console.log(`✓ inserted guide ${SLUG}`);
}

console.log("\nDone. Now run scripts/migrate_images.mjs && scripts/rewrite_urls.mjs.");
