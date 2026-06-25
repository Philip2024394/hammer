// One-off seed — populates the "Trust & logistics" columns for the 5
// paid+trial demo tradies so the "What to know before you message"
// section renders on the premium profile pages.
//
// Each persona gets a different combination so the public layout is
// exercised across yes/no states, custom insurance amounts, varying
// quote turnarounds, current-status notes, and ready dates.

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
    // Mike Watson — drywaller. Fully kitted, "go anywhere" tradie.
    slug: "demo-mike-watson-drywall-manchester",
    is_insured: true,
    insurance_cover_gbp: 2_000_000,
    qualifications: ["NVQ Level 3 Drylining", "CSCS Gold Card", "Site Safety Plus"],
    trade_memberships: ["FMB", "TrustMark"],
    dbs_checked: true,
    has_own_transport: true,
    has_own_tools: true,
    minimum_job_gbp: 250,
    free_site_visits: true,
    quote_availability: "Weekday evenings + Saturdays",
    quote_turnaround_hours: 24,
    current_status_note: "Finishing extension in Salford — ready 14 Jul for new starts",
    ready_date: "2026-07-14"
  },
  {
    // Sara Khan — plasterer. Insured but doesn't drive; comes by public
    // transport so customers need to expect a longer arrival window.
    slug: "demo-sara-khan-plastering-birmingham",
    is_insured: true,
    insurance_cover_gbp: 1_000_000,
    qualifications: ["NVQ Level 2 Plastering", "C&G Plastering"],
    trade_memberships: ["Guild of Master Craftsmen"],
    dbs_checked: false,
    has_own_transport: false,
    has_own_tools: true,
    minimum_job_gbp: 180,
    free_site_visits: true,
    quote_availability: "By appointment, weekdays",
    quote_turnaround_hours: 48,
    current_status_note: "Wedding cake of a Victorian skim in Edgbaston — taking new bookings from August",
    ready_date: "2026-08-01"
  },
  {
    // Tom Bridges — scaffolder. Heavy kit, big rigs; large minimum job.
    slug: "demo-tom-bridges-scaffolding-leeds",
    is_insured: true,
    insurance_cover_gbp: 5_000_000,
    qualifications: ["CISRS Advanced", "CISRS Inspector", "Working at Height"],
    trade_memberships: ["NAS", "CISRS"],
    dbs_checked: true,
    has_own_transport: true,
    has_own_tools: true,
    minimum_job_gbp: 850,
    free_site_visits: true,
    quote_availability: "Same week, site survey required",
    quote_turnaround_hours: 48,
    current_status_note: "On a 4-week residential rig in Headingley — quoting Q3 work now",
    ready_date: "2026-09-01"
  },
  {
    // James O'Connor — electrician. Most certs, fastest turnaround, no
    // minimum job (small EICR work welcome).
    slug: "demo-james-oconnor-electrical-london",
    is_insured: true,
    insurance_cover_gbp: 2_000_000,
    qualifications: [
      "18th Edition",
      "Part P",
      "C&G 2391",
      "ECS Gold Card",
      "EV Charge Installer"
    ],
    trade_memberships: ["NICEIC", "TrustMark", "Which? Trusted Trader"],
    dbs_checked: true,
    has_own_transport: true,
    has_own_tools: true,
    minimum_job_gbp: 95,
    free_site_visits: false,
    quote_availability: "Same-day for emergency callouts",
    quote_turnaround_hours: 12,
    current_status_note: "Booked to Christmas, taking January 2027 work and emergency callouts",
    ready_date: "2027-01-05"
  },
  {
    // Aaron Hughes — general builder. Insured, transport yes, tools yes,
    // free quotes within 24 hours.
    slug: "demo-aaron-hughes-builder-sheffield",
    is_insured: true,
    insurance_cover_gbp: 5_000_000,
    qualifications: ["CSCS Manager", "SMSTS", "First Aid at Work"],
    trade_memberships: ["FMB", "TrustMark", "Checkatrade"],
    dbs_checked: true,
    has_own_transport: true,
    has_own_tools: true,
    minimum_job_gbp: 500,
    free_site_visits: true,
    quote_availability: "Site visits Tue/Thu mornings",
    quote_turnaround_hours: 24,
    current_status_note: "Wrapping a loft conversion in Crookes — ready for kitchen/bathroom jobs from late July",
    ready_date: "2026-07-28"
  }
];

for (const upd of UPDATES) {
  const { slug, ...patch } = upd;
  const res = await sb
    .from("hammerex_trade_off_listings")
    .update(patch)
    .eq("slug", slug)
    .select("slug, is_insured, insurance_cover_gbp, qualifications, trade_memberships");
  if (res.error) {
    console.error(slug, "FAILED:", res.error.message);
  } else if (!res.data || res.data.length === 0) {
    console.warn(slug, "no row matched — skipped");
  } else {
    const r = res.data[0];
    console.log(
      slug,
      "→ insured:",
      r.is_insured,
      "cover:",
      r.insurance_cover_gbp,
      "quals:",
      (r.qualifications ?? []).length,
      "memb:",
      (r.trade_memberships ?? []).length
    );
  }
}

console.log("done.");
