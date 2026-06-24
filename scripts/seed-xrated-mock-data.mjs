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

const BUCKET = "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/branding";
const HERO = (slug) => `${BUCKET}/trade-hero-${slug}.png`;

// 8 mock tradies — varied trades, cities, tiers, Standard verification.
// All slugs prefixed `demo-` so they're easy to find/clean later.
const TRADIES = [
  {
    slug: "demo-mike-watson-drywall-manchester",
    display_name: "Mike Watson",
    trading_name: "Watson Drywall & Finishing",
    primary_trade: "drywaller",
    secondary_trades: ["taper-and-finisher"],
    city: "Manchester",
    postcode_prefix: "M14",
    whatsapp: "+447700900101",
    phone: "+441612340101",
    email: "mike.watson@example.com",
    bio: "Drywall finisher with 14 years on commercial and high-end residential sites across the North West. Specialise in 5-knife taper finishes and level-5 skim. Honest quotes, clean exits.",
    photos: [HERO("drywaller"), HERO("plasterer")],
    avatar_url: null,
    hammerex_standard_verified: true,
    hammerex_standard_products: ["k11-drywall-tool-station"],
    hammerex_standard_blurb:
      "Owns the Hammerex K11 Drywall Tool Station — five knife rows, mud-pan well, reinforced solid-core frame. Drywall pros who carry the K11 protect every blade and take pride in their craft.",
    service_postcodes: ["M14", "M15", "M16", "M20", "M21"],
    years_in_trade: 14,
    tier: "app_paid",
    theme_color: "#F97316",
    hero_text_line1: "WATSON DRYWALL",
    hero_text_line2: "Finished right.",
    hero_text_line2_color: "#FFFFFF",
    hero_text_tagline: "Manchester · 14 yrs taping & finishing",
    cta_button_effect: "glow",
    avatar_frame_style: "ring",
    accepting_jobs: true
  },
  {
    slug: "demo-sara-khan-plastering-birmingham",
    display_name: "Sara Khan",
    trading_name: "Khan Plastering Co.",
    primary_trade: "plasterer",
    secondary_trades: ["renderer"],
    city: "Birmingham",
    postcode_prefix: "B12",
    whatsapp: "+447700900102",
    phone: null,
    email: "sara.khan@example.com",
    bio: "Wet plasterer and renderer. Skim, float-and-set, K-rend and silicone systems. Domestic and small commercial. Same-day quotations within Birmingham.",
    photos: [HERO("plasterer")],
    avatar_url: null,
    hammerex_standard_verified: true,
    hammerex_standard_products: ["k9-plastering-tool-station", "plastering-pro-bag"],
    hammerex_standard_blurb:
      "Owns the Hammerex K9 Plastering Tool Station — trowels, hawk, and finishing kit stored properly, not piled in a bucket.",
    service_postcodes: ["B1", "B5", "B12", "B13", "B14"],
    years_in_trade: 9,
    tier: "app_trial",
    theme_color: "#EA580C",
    hero_text_line1: "KHAN PLASTERING",
    hero_text_line2: "Skim. Render. Done.",
    hero_text_line2_color: "#FFFFFF",
    hero_text_tagline: "Birmingham · 9 yrs on the trowel",
    cta_button_effect: "pulse",
    avatar_frame_style: "ring",
    accepting_jobs: true
  },
  {
    slug: "demo-james-oconnor-electrical-london",
    display_name: "James O'Connor",
    trading_name: null,
    primary_trade: "electrician",
    secondary_trades: [],
    city: "London",
    postcode_prefix: "SE15",
    whatsapp: "+447700900103",
    phone: null,
    email: "james.oconnor@example.com",
    bio: "NICEIC registered electrician, 11 years in domestic + light commercial. Rewires, EV chargers, EICRs, fuseboard upgrades. Free written quotes within 24 hours.",
    photos: [HERO("electrician")],
    avatar_url: null,
    hammerex_standard_verified: true,
    hammerex_standard_products: ["electrician-pro-pouch"],
    hammerex_standard_blurb:
      "Owns the Hammerex Electrician Pro Pouch — a professional-grade pouch for the on-site spark.",
    service_postcodes: ["SE1", "SE15", "SE16", "SE17", "SW9", "SW8"],
    years_in_trade: 11,
    tier: "app_trial",
    theme_color: "#F97316",
    hero_text_line1: "O'CONNOR ELECTRICAL",
    hero_text_line2: "Clean wiring, clean exit.",
    hero_text_line2_color: "#FFFFFF",
    hero_text_tagline: "South London · NICEIC · EV chargers",
    cta_button_effect: "none",
    avatar_frame_style: "none",
    accepting_jobs: true
  },
  {
    slug: "demo-tom-bridges-scaffolding-leeds",
    display_name: "Tom Bridges",
    trading_name: "Bridges Access",
    primary_trade: "scaffolder",
    secondary_trades: [],
    city: "Leeds",
    postcode_prefix: "LS6",
    whatsapp: "+447700900104",
    phone: "+441132340104",
    email: "tom.bridges@example.com",
    bio: "CISRS Advanced scaffolder. Tube & fitting + system. Domestic, commercial, scaffold towers up to 6 lifts. Same-week erects in West Yorkshire.",
    photos: [HERO("scaffolder")],
    avatar_url: null,
    hammerex_standard_verified: true,
    hammerex_standard_products: ["scaffolders-setup-kit"],
    hammerex_standard_blurb:
      "Owns the Hammerex Scaffolders Setup Kit — full belt + bag + lanyard system. Kitted out properly for the trade.",
    service_postcodes: ["LS1", "LS6", "LS7", "LS17", "LS25"],
    years_in_trade: 18,
    tier: "app_paid",
    theme_color: "#F97316",
    hero_text_line1: "BRIDGES ACCESS",
    hero_text_line2: "Tube. Fitting. Trusted.",
    hero_text_line2_color: "#FFFFFF",
    hero_text_tagline: "Leeds · CISRS Advanced · 18 yrs",
    cta_button_effect: "shake",
    avatar_frame_style: "pulse",
    accepting_jobs: true
  },
  {
    slug: "demo-lewis-carter-plumbing-bristol",
    display_name: "Lewis Carter",
    trading_name: null,
    primary_trade: "plumber",
    secondary_trades: [],
    city: "Bristol",
    postcode_prefix: "BS6",
    whatsapp: "+447700900105",
    phone: null,
    email: "lewis.carter@example.com",
    bio: "Gas Safe plumber and heating engineer. Boiler installs, bathroom refits, leak detection. Most jobs quoted on the spot. Worcester accredited installer.",
    photos: [HERO("plumber")],
    avatar_url: null,
    hammerex_standard_verified: false,
    hammerex_standard_products: [],
    hammerex_standard_blurb: null,
    service_postcodes: ["BS1", "BS6", "BS7", "BS8", "BS9"],
    years_in_trade: 7,
    tier: "standard",
    theme_color: "#F97316",
    hero_text_line1: null,
    hero_text_line2: null,
    hero_text_line2_color: null,
    hero_text_tagline: null,
    cta_button_effect: "none",
    avatar_frame_style: "none",
    accepting_jobs: true
  },
  {
    slug: "demo-dean-foster-brickwork-liverpool",
    display_name: "Dean Foster",
    trading_name: "Foster Brickwork",
    primary_trade: "bricklayer",
    secondary_trades: ["stonemason"],
    city: "Liverpool",
    postcode_prefix: "L8",
    whatsapp: "+447700900106",
    phone: null,
    email: "dean.foster@example.com",
    bio: "Bricklayer and stone mason. Garden walls, extensions, restoration work on Victorian terraces. Mortar matching a speciality. Free site visits across Merseyside.",
    photos: [HERO("bricklayer"), HERO("stonemason")],
    avatar_url: null,
    hammerex_standard_verified: false,
    hammerex_standard_products: [],
    hammerex_standard_blurb: null,
    service_postcodes: ["L1", "L8", "L17", "L18", "L25"],
    years_in_trade: 12,
    tier: "standard",
    theme_color: "#F97316",
    hero_text_line1: null,
    hero_text_line2: null,
    hero_text_line2_color: null,
    hero_text_tagline: null,
    cta_button_effect: "none",
    avatar_frame_style: "none",
    accepting_jobs: false
  },
  {
    slug: "demo-aaron-hughes-builder-sheffield",
    display_name: "Aaron Hughes",
    trading_name: "Hughes & Sons",
    primary_trade: "general-builder",
    secondary_trades: ["bricklayer", "carpenter"],
    city: "Sheffield",
    postcode_prefix: "S6",
    whatsapp: "+447700900107",
    phone: "+441142340107",
    email: "aaron.hughes@example.com",
    bio: "General builder. Loft conversions, extensions, full house refurbs. 22-year family business. Fully insured, building-control liaison handled in-house.",
    photos: [HERO("general-builder")],
    avatar_url: null,
    hammerex_standard_verified: false,
    hammerex_standard_products: [],
    hammerex_standard_blurb: null,
    service_postcodes: ["S1", "S6", "S7", "S10", "S11"],
    years_in_trade: 22,
    tier: "app_trial",
    theme_color: "#EA580C",
    hero_text_line1: "HUGHES & SONS",
    hero_text_line2: "Lofts. Extensions. Refurbs.",
    hero_text_line2_color: "#FFFFFF",
    hero_text_tagline: "Sheffield · 22 yrs family business",
    cta_button_effect: "glow",
    avatar_frame_style: "ring",
    accepting_jobs: true
  },
  {
    slug: "demo-will-stone-masonry-newcastle",
    display_name: "Will Stone",
    trading_name: "Stone Masonry NE",
    primary_trade: "stonemason",
    secondary_trades: ["bricklayer"],
    city: "Newcastle",
    postcode_prefix: "NE2",
    whatsapp: "+447700900108",
    phone: null,
    email: "will.stone@example.com",
    bio: "Stone mason — natural stone, limestone, and sandstone. Restoration on listed buildings a speciality. Path edging, walling, fireplace surrounds.",
    photos: [HERO("stonemason")],
    avatar_url: null,
    hammerex_standard_verified: false,
    hammerex_standard_products: [],
    hammerex_standard_blurb: null,
    service_postcodes: ["NE1", "NE2", "NE3", "NE4"],
    years_in_trade: 16,
    tier: "standard",
    theme_color: "#F97316",
    hero_text_line1: null,
    hero_text_line2: null,
    hero_text_line2_color: null,
    hero_text_tagline: null,
    cta_button_effect: "none",
    avatar_frame_style: "none",
    accepting_jobs: true
  }
];

const NOW = new Date();
const trialEnd = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
const paidEnd = new Date(NOW.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

for (const t of TRADIES) {
  const tierExtras =
    t.tier === "app_trial"
      ? { trial_started_at: NOW.toISOString(), trial_expires_at: trialEnd }
      : t.tier === "app_paid"
        ? {
            trial_started_at: NOW.toISOString(),
            trial_expires_at: trialEnd,
            paid_expires_at: paidEnd,
            last_payment_plan: "annual"
          }
        : {};

  const payload = {
    slug: t.slug,
    display_name: t.display_name,
    trading_name: t.trading_name,
    primary_trade: t.primary_trade,
    secondary_trades: t.secondary_trades,
    city: t.city,
    country: "United Kingdom",
    postcode_prefix: t.postcode_prefix,
    service_postcodes: t.service_postcodes,
    whatsapp: t.whatsapp,
    phone: t.phone,
    email: t.email,
    bio: t.bio,
    years_in_trade: t.years_in_trade,
    avatar_url: t.avatar_url,
    photos: t.photos,
    status: "live",
    hammerex_standard_verified: t.hammerex_standard_verified,
    hammerex_standard_products: t.hammerex_standard_products,
    hammerex_standard_blurb: t.hammerex_standard_blurb,
    theme_color: t.theme_color,
    button_text_color: "#FFFFFF",
    cta_button_effect: t.cta_button_effect,
    hero_text_line1: t.hero_text_line1,
    hero_text_line2: t.hero_text_line2,
    hero_text_line2_color: t.hero_text_line2_color,
    hero_text_tagline: t.hero_text_tagline,
    hero_text_effect: "none",
    avatar_frame_style: t.avatar_frame_style,
    profile_placement: "center",
    accepting_jobs: t.accepting_jobs,
    tier: t.tier,
    ...tierExtras
  };

  await sb.from("hammerex_trade_off_listings").delete().eq("slug", t.slug);
  const { error } = await sb.from("hammerex_trade_off_listings").insert(payload);
  if (error) {
    console.error(`✗ ${t.slug}: ${error.message}`);
  } else {
    console.log(`✓ tradie ${t.slug}  tier=${t.tier}  verified=${t.hammerex_standard_verified}`);
  }
}

// 10 mock example jobs across the trades + cities
const JOBS = [
  { trade_slug: "drywaller", city: "Manchester", postcode_prefix: "M14", description: "Need drywall installed in a spare bedroom, around 12 sqm. Standard ceiling height. Plasterboard and skim ready for paint. Honest quote please.", budget_hint: "£600 – £1,000", photos: [HERO("drywaller")], customer_name: "Hannah" },
  { trade_slug: "plasterer", city: "Birmingham", postcode_prefix: "B14", description: "Skim coat on the living room and dining room — 35 sqm walls + 22 sqm ceilings. Furniture cleared. Want a level-5 finish.", budget_hint: "£600 – £1,000", photos: [HERO("plasterer")], customer_name: "Ryan" },
  { trade_slug: "electrician", city: "London", postcode_prefix: "SE15", description: "Rewire upstairs ring main on a 1930s house. Three bedrooms, plus replace bathroom extractor fan. Looking for an NICEIC sparky.", budget_hint: "£1,000 – £2,500", photos: [HERO("electrician")], customer_name: "Priya" },
  { trade_slug: "plumber", city: "Leeds", postcode_prefix: "LS6", description: "Replace bathroom toilet + sink with new units. Customer-supplied units already on site. Half-day job ideally.", budget_hint: "£300 – £600", photos: [HERO("plumber")], customer_name: "Lewis" },
  { trade_slug: "scaffolder", city: "Bristol", postcode_prefix: "BS6", description: "Tower scaffold required for chimney pointing, 3-day hire. Two-storey terrace, rear access OK. Erect Monday, dismantle Wednesday.", budget_hint: "£300 – £600", photos: [HERO("scaffolder")], customer_name: "Ben" },
  { trade_slug: "bricklayer", city: "Liverpool", postcode_prefix: "L8", description: "Garden wall repair — 4-metre run, single-skin brick, weathered cap stones to be reset. Bricks already match, sample available.", budget_hint: "£300 – £600", photos: [HERO("bricklayer")], customer_name: "Megan" },
  { trade_slug: "general-builder", city: "Sheffield", postcode_prefix: "S6", description: "Loft conversion — two bedrooms plus en-suite. Architect plans drawn, building control submitted. Need a builder to project-manage end-to-end.", budget_hint: "£5,000+", photos: [HERO("general-builder")], customer_name: "Tom" },
  { trade_slug: "stonemason", city: "Newcastle", postcode_prefix: "NE2", description: "Stone path edging — around 10 metres of natural stone. Pieces already sourced, need them dressed and laid.", budget_hint: "£600 – £1,000", photos: [HERO("stonemason")], customer_name: "Helen" },
  { trade_slug: "plasterer", city: "Manchester", postcode_prefix: "M21", description: "Quick patch job — chunk of plaster come off behind a radiator. Roughly A4 size. Just want it skimmed and ready for paint.", budget_hint: "Under £100", photos: [HERO("plasterer")], customer_name: "Joel" },
  { trade_slug: "drywaller", city: "Leeds", postcode_prefix: "LS25", description: "Stud wall to split a large bedroom into two, with a door. About 3 m long, plasterboard + skim. No services in the wall.", budget_hint: "£300 – £600", photos: [HERO("drywaller")], customer_name: "Sasha" }
];

for (let i = 0; i < JOBS.length; i++) {
  const j = JOBS[i];
  const baseSlug = `${j.trade_slug}-${j.city.toLowerCase().replace(/\s+/g, "-")}-example-${(i + 1).toString().padStart(2, "0")}`;
  await sb.from("hammerex_xrated_jobs").delete().eq("slug", baseSlug);
  const { error } = await sb.from("hammerex_xrated_jobs").insert({
    slug: baseSlug,
    customer_name: j.customer_name,
    customer_whatsapp: "+0000000000",
    trade_slug: j.trade_slug,
    city: j.city,
    postcode_prefix: j.postcode_prefix,
    description: j.description,
    budget_hint: j.budget_hint,
    photos: j.photos,
    status: "live",
    is_example: true,
    expires_at: new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });
  if (error) {
    console.error(`✗ job ${baseSlug}: ${error.message}`);
  } else {
    console.log(`✓ job   ${baseSlug}`);
  }
}

console.log("\nDone.");
