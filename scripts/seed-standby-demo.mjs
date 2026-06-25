// One-off seed — populates the new availability + headline_rate columns
// for the 5 paid+trial demo tradies so the "Trades On Standby" feed has
// real cards on the landing page. The 3 free-tier demos are left with
// availability=null so they don't appear in the feed (matching the
// behaviour we want for free-tier listings during the soft launch).

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
const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const UPDATES = [
  {
    slug: "demo-mike-watson-drywall-manchester",
    availability: "now",
    headline_rate: { amount: 35, unit: "per m²", currency: "GBP" }
  },
  {
    slug: "demo-sara-khan-plastering-birmingham",
    availability: "tomorrow",
    headline_rate: { amount: 280, unit: "per day", currency: "GBP" }
  },
  {
    slug: "demo-james-oconnor-electrical-london",
    availability: "this_week",
    headline_rate: { amount: 65, unit: "per hour", currency: "GBP" }
  },
  {
    slug: "demo-tom-bridges-scaffolding-leeds",
    availability: "next_week",
    headline_rate: { amount: 850, unit: "per project", currency: "GBP" }
  },
  {
    slug: "demo-aaron-hughes-builder-sheffield",
    availability: "now",
    headline_rate: { amount: 320, unit: "per day", currency: "GBP" }
  }
];

for (const upd of UPDATES) {
  const { slug, ...patch } = upd;
  const res = await sb
    .from("hammerex_trade_off_listings")
    .update(patch)
    .eq("slug", slug)
    .select("slug, availability, headline_rate");
  if (res.error) {
    console.error(slug, "FAILED:", res.error.message);
  } else if (!res.data || res.data.length === 0) {
    console.warn(slug, "no row matched — skipped");
  } else {
    console.log(slug, "→", res.data[0].availability, res.data[0].headline_rate);
  }
}

// Defensive: clear standby for the 3 free-tier demos in case a previous
// run set them. Idempotent.
const FREE_TIER_SLUGS = [
  "demo-lewis-carter-plumbing-bristol",
  "demo-dean-foster-brickwork-liverpool",
  "demo-will-stone-masonry-newcastle"
];
const clr = await sb
  .from("hammerex_trade_off_listings")
  .update({ availability: null, headline_rate: null })
  .in("slug", FREE_TIER_SLUGS)
  .select("slug");
if (clr.error) console.error("clear free-tier failed:", clr.error.message);
else console.log("cleared free-tier:", (clr.data ?? []).map((r) => r.slug).join(", "));

console.log("done.");
