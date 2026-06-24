import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const BUCKET = "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/branding";
const HERO = (slug) => `${BUCKET}/trade-hero-${slug}.png`;
const DRYWALLER_IMG = `${BUCKET}/job-drywaller-wanted.png`;
const SCAFFOLDER_IMG = `${BUCKET}/job-scaffolder-wanted.png`;

const NOW = new Date();
const expiresAt = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

const INTL_JOBS = [
  { country: "US", city: "New York",    trade_slug: "electrician",     customer_name: "Mason",   description: "Need a 200 amp panel upgrade on a Brooklyn brownstone — old fuse box still in place. Licensed electrician only.",        budget_hint: "$2,500 – $4,000", photos: [HERO("electrician")] },
  { country: "US", city: "Los Angeles", trade_slug: "drywaller",        customer_name: "Brittany",description: "Drywall repair on a Mid-Wilshire condo after a water leak — about 30 sq ft of ceiling + a 6 ft wall section.",            budget_hint: "$400 – $800",    photos: [DRYWALLER_IMG] },
  { country: "AU", city: "Sydney",      trade_slug: "plasterer",        customer_name: "Liam",    description: "Skim coat needed in a Bondi terrace — living room and hallway, ~40 sqm. Need it finished before painting on Friday.",      budget_hint: "$800 – $1,500 AUD", photos: [HERO("plasterer")] },
  { country: "AU", city: "Melbourne",   trade_slug: "scaffolder",       customer_name: "Charlie", description: "Tower scaffold for a Fitzroy roof slate replacement. 4-day hire needed, rear lane access.",                                budget_hint: "$700 – $1,200 AUD", photos: [SCAFFOLDER_IMG] },
  { country: "DE", city: "Berlin",      trade_slug: "plumber",          customer_name: "Anna",    description: "Bathroom remodel in Mitte — replace toilet, sink, and connect new walk-in shower. Customer-supplied fixtures already on site.", budget_hint: "€1,200 – €2,500",photos: [HERO("plumber")] },
  { country: "ES", city: "Barcelona",   trade_slug: "bricklayer",       customer_name: "Marco",   description: "Garden wall in Gràcia — 6m of single-skin brick with capstones. Need it matched to existing Catalan terracotta brick.",      budget_hint: "€800 – €1,400",  photos: [HERO("bricklayer")] },
  { country: "IE", city: "Dublin",      trade_slug: "general-builder",  customer_name: "Cian",    description: "Attic conversion in Rathmines — two bedrooms and a small ensuite. Plans drawn, planning approved.",                         budget_hint: "€18,000+",       photos: [HERO("general-builder")] },
  { country: "NL", city: "Amsterdam",   trade_slug: "stonemason",       customer_name: "Femke",   description: "Natural stone path edging in a Jordaan garden — 12m of Belgian bluestone, already sourced. Need it cut and laid clean.",     budget_hint: "€1,000 – €1,800",photos: [HERO("stonemason")] },
  { country: "FR", city: "Paris",       trade_slug: "drywaller",        customer_name: "Hugo",    description: "Cloison sèche pour séparer un grand salon en deux pièces dans le 11e. Environ 3.5m de long, porte standard.",              budget_hint: "€700 – €1,200",  photos: [DRYWALLER_IMG] },
  { country: "IT", city: "Milan",       trade_slug: "plasterer",        customer_name: "Giulia",  description: "Restoration plastering on a Navigli apartment — pre-war cornice work to match. Around 18 sqm of ceiling.",                  budget_hint: "€1,200 – €2,000",photos: [HERO("plasterer")] }
];

// Backfill country='GB' on existing UK jobs (default already GB but be explicit).
await sb.from("hammerex_xrated_jobs").update({ country: "GB" }).eq("is_example", true).is("country", null);

for (let i = 0; i < INTL_JOBS.length; i++) {
  const j = INTL_JOBS[i];
  const slug = `${j.trade_slug}-${j.city.toLowerCase().replace(/\s+/g, "-")}-example-intl-${(i + 1).toString().padStart(2, "0")}`;
  await sb.from("hammerex_xrated_jobs").delete().eq("slug", slug);
  const { error } = await sb.from("hammerex_xrated_jobs").insert({
    slug,
    customer_name: j.customer_name,
    customer_whatsapp: "+0000000000",
    trade_slug: j.trade_slug,
    city: j.city,
    country: j.country,
    description: j.description,
    budget_hint: j.budget_hint,
    photos: j.photos,
    status: "live",
    is_example: true,
    expires_at: expiresAt
  });
  if (error) console.error(`✗ ${slug}: ${error.message}`);
  else console.log(`✓ ${j.country} ${j.city.padEnd(14)} ${j.trade_slug}`);
}

const all = await sb.from("hammerex_xrated_jobs").select("country").eq("status","live");
const tally = {};
(all.data||[]).forEach(r => tally[r.country] = (tally[r.country]||0) + 1);
console.log("\nLive job country distribution:", tally);
