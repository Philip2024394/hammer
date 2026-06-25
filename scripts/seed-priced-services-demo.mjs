// Seed the two demo premium tradies (Mike Watson + Tom Bridges) with the
// new rating/promo/priced-services fields so the rebuilt PremiumLayout
// has real content to render. Idempotent — re-runs overwrite the same rows.
//
// Trade-hero images are reused as placeholder service images; once each
// tradie supplies their own gallery shots we'll swap them in via the
// edit form.

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

const UPDATES = [
  {
    slug: "demo-mike-watson-drywall-manchester",
    rating_avg: 4.8,
    rating_count: 23,
    promo_text: "Free same-week site visits across Greater Manchester",
    priced_services: [
      {
        name: "Level-5 skim coat",
        image_url: HERO("drywaller"),
        price: 22,
        unit: "per m²"
      },
      {
        name: "Plasterboard supply + fit",
        image_url: HERO("plasterer"),
        price: 18,
        unit: "per m²"
      },
      {
        name: "Knife taping (single room)",
        image_url: HERO("drywaller"),
        price: 280,
        unit: "per project"
      },
      {
        name: "Patch & make-good (small jobs)",
        image_url: HERO("plasterer"),
        price: 150,
        unit: "from"
      },
      {
        name: "Bay corner detailing",
        image_url: HERO("drywaller"),
        price: 85,
        unit: "per corner"
      }
    ]
  },
  {
    slug: "demo-tom-bridges-scaffolding-leeds",
    rating_avg: 4.9,
    rating_count: 47,
    promo_text: "Tower scaffolds available next week — limited slots",
    priced_services: [
      {
        name: "Domestic tube & fitting (2-storey)",
        image_url: HERO("scaffolder"),
        price: 850,
        unit: "from"
      },
      {
        name: "Chimney scaffold",
        image_url: HERO("scaffolder"),
        price: 420,
        unit: "per project"
      },
      {
        name: "System scaffolding (per lift)",
        image_url: HERO("scaffolder"),
        price: 320,
        unit: "per lift"
      },
      {
        name: "Tower hire (weekly)",
        image_url: HERO("scaffolder"),
        price: 120,
        unit: "per week"
      }
    ]
  }
];

let okCount = 0;
for (const u of UPDATES) {
  const res = await sb
    .from("hammerex_trade_off_listings")
    .update({
      rating_avg: u.rating_avg,
      rating_count: u.rating_count,
      promo_text: u.promo_text,
      priced_services: u.priced_services
    })
    .eq("slug", u.slug)
    .select("slug")
    .maybeSingle();
  if (res.error) {
    console.error(`✗ ${u.slug}: ${res.error.message}`);
  } else if (!res.data) {
    console.warn(`! ${u.slug}: row not found`);
  } else {
    okCount++;
    console.log(`✓ ${u.slug} — ${u.priced_services.length} priced services, ${u.rating_avg}★ (${u.rating_count})`);
  }
}
console.log(`\nDone. ${okCount}/${UPDATES.length} updated.`);
