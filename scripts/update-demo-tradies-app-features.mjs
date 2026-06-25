// One-off updater — backfills the new premium mini-app feature columns
// onto the existing demo tradies WITHOUT re-seeding (which would wipe
// edits / projects). Looks rows up by slug and only touches the new
// jsonb / array / boolean fields added in 20260625160000.

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

// (slug -> patch). Only the demo tradies on paid + trial tiers get the new
// fields populated; the two free-tier demos stay untouched so we can keep
// using them as the "no premium features" reference.
const UPDATES = [
  {
    slug: "demo-mike-watson-drywall-manchester",
    operating_hours: {
      mon: { open: "08:00", close: "17:30" },
      tue: { open: "08:00", close: "17:30" },
      wed: { open: "08:00", close: "17:30" },
      thu: { open: "08:00", close: "17:30" },
      fri: { open: "08:00", close: "16:00" },
      sat: { open: "09:00", close: "13:00" }
    },
    services_offered: [
      "Level-5 skim",
      "Knife taping",
      "Mud-pan finish",
      "Plasterboard supply + fit",
      "Patch & make-good",
      "Bay corner detailing"
    ],
    faq_items: [
      { q: "Do you quote on-site?", a: "Yes — free same-week site visits inside the M60." },
      { q: "Do you do small patch jobs?", a: "Small patches under £150 are fine; we'll quote a one-hit visit so you're not paying for half a day." },
      { q: "Do you supply materials?", a: "Yes. We price boards, beads, and joint compound at trade — itemised so you can see exactly what's on the bill." },
      { q: "How long does a level-5 finish take?", a: "Typical 4×3 m room: 2 days for boarding + taping, 1 day for finish, then 24 h to dry before paint." }
    ],
    contact_form_enabled: true,
    visit_us_enabled: true
  },
  {
    slug: "demo-sara-khan-plastering-birmingham",
    operating_hours: {
      mon: { open: "08:30", close: "17:00" },
      tue: { open: "08:30", close: "17:00" },
      wed: { open: "08:30", close: "17:00" },
      thu: { open: "08:30", close: "17:00" },
      fri: { open: "08:30", close: "16:30" }
    },
    services_offered: [
      "Skim & float",
      "Float-and-set",
      "K-rend rendering",
      "Silicone systems",
      "Patch repairs",
      "Decorative finishes"
    ],
    faq_items: [
      { q: "Do you do silicone systems?", a: "Yes — silicone topcoats on top of K-rend or insulated render boards. Colour matched on request." },
      { q: "Same-day quotes?", a: "Same-day for Birmingham postcodes; usually next-day for the Black Country." },
      { q: "Do you take card payments?", a: "Bank transfer preferred. Card via SumUp link for jobs under £500 if you need it." }
    ],
    contact_form_enabled: true,
    visit_us_enabled: false
  },
  {
    slug: "demo-james-oconnor-electrical-london",
    operating_hours: {
      mon: { open: "07:30", close: "18:00" },
      tue: { open: "07:30", close: "18:00" },
      wed: { open: "07:30", close: "18:00" },
      thu: { open: "07:30", close: "18:00" },
      fri: { open: "07:30", close: "17:00" },
      sat: { open: "09:00", close: "13:00" }
    },
    services_offered: [
      "Full / partial rewires",
      "EV charger installs",
      "EICR reports",
      "Fuseboard upgrades",
      "Smart lighting",
      "Emergency callouts"
    ],
    faq_items: [
      { q: "Are you NICEIC registered?", a: "Yes — all certificates uploaded to the NICEIC portal and emailed to you on completion." },
      { q: "Do you do EV chargers?", a: "Zappi, Ohme, and Pod Point — DNO notification handled. OZEV grant paperwork included if you qualify." },
      { q: "Out of hours?", a: "24-hour emergency callout for South London — see the contact form." }
    ],
    contact_form_enabled: true,
    visit_us_enabled: false
  },
  {
    slug: "demo-tom-bridges-scaffolding-leeds",
    operating_hours: {
      mon: { open: "07:00", close: "17:00" },
      tue: { open: "07:00", close: "17:00" },
      wed: { open: "07:00", close: "17:00" },
      thu: { open: "07:00", close: "17:00" },
      fri: { open: "07:00", close: "16:00" }
    },
    services_offered: [
      "Tube & fitting",
      "System scaffolding",
      "Chimney scaffolds",
      "Tower hire",
      "Loading bays",
      "Emergency safety repairs"
    ],
    faq_items: [
      { q: "How quick can you erect?", a: "Standard 2-storey domestic: same week if you call by Wednesday." },
      { q: "Are you CISRS-carded?", a: "Yes — CISRS Advanced. Cards available for sign-off on commercial sites." },
      { q: "Do you do edge protection?", a: "Yes — flat roofs and pitched. We supply edge guards as part of the standard erect, not as an extra." },
      { q: "Hire periods?", a: "First 4 weeks included in the erect price; extensions billed weekly thereafter." }
    ],
    contact_form_enabled: true,
    visit_us_enabled: true
  },
  {
    slug: "demo-aaron-hughes-builder-sheffield",
    operating_hours: {
      mon: { open: "07:30", close: "17:30" },
      tue: { open: "07:30", close: "17:30" },
      wed: { open: "07:30", close: "17:30" },
      thu: { open: "07:30", close: "17:30" },
      fri: { open: "07:30", close: "16:30" },
      sat: { open: "09:00", close: "13:00" }
    },
    services_offered: [
      "Loft conversions",
      "Single-storey extensions",
      "Full refurbs",
      "Kitchen knock-throughs",
      "Project management",
      "Building-control liaison"
    ],
    faq_items: [
      { q: "Do you handle building control?", a: "Yes — we submit to your council on your behalf and meet the inspector at each stage." },
      { q: "Are you fully insured?", a: "£2 m public liability + £5 m employer's liability. Certificates available." },
      { q: "Can I see recent jobs?", a: "Browse the verified work section above — we update after each completion." }
    ],
    contact_form_enabled: true,
    visit_us_enabled: false
  }
];

for (const u of UPDATES) {
  const { slug, ...patch } = u;
  const { data, error } = await sb
    .from("hammerex_trade_off_listings")
    .update(patch)
    .eq("slug", slug)
    .select("id, slug")
    .maybeSingle();
  if (error) {
    console.error(`X ${slug}: ${error.message}`);
  } else if (!data) {
    console.warn(`? ${slug}: row not found, skipping`);
  } else {
    console.log(`OK ${slug} updated`);
  }
}

console.log("\nDone.");
