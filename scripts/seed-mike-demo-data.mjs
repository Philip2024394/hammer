// Seed Mike Watson's demo profile with the social links, website,
// and Trusted Trades recommendations so the premium app surfaces show
// their full feature set live.

import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.tools.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.HAMMEREX_NEW_PROJECT_REF || "msdonkkechxzgagyguoe";

// All slugs Mike recommends already exist as live demo profiles —
// confirmed in the audit earlier (Tom Bridges, Sara Khan, James
// O'Connor, Aaron Hughes, Will Stone, Dean Foster, Lewis Carter).
const recommendations = [
  {
    slug: "demo-tom-bridges-scaffolding-leeds",
    note:
      "Tom and I have worked extensions together for 5 years. If you need scaffold up before the plasterers arrive, he's the only crew I trust to turn around in 24 hours."
  },
  {
    slug: "demo-james-oconnor-electrical-london",
    note:
      "James wired the whole of my last 6 jobs that needed rewires. Tidiest sparky I've ever worked with — never had to chase him back to a site."
  },
  {
    slug: "demo-aaron-hughes-builder-sheffield",
    note:
      "Aaron's the lead builder I sub-contract for whenever a client wants their whole back wall taken out and rebuilt. Honest pricing, never a cost-overrun call."
  },
  {
    slug: "demo-dean-foster-brickwork-liverpool",
    note:
      "Dean does the brickwork on every garden wall I quote for in the North West. Bookable within a week, prices fair, never had a single comeback in 3 years."
  }
];

// The social handles/URLs — using realistic-looking handles tied to
// Mike's name + trade so the icons feel authentic.
const social = {
  instagram: "@mikewatsondrywall",
  tiktok: "@mikewatsondrywall",
  facebook: "mikewatsondrywall",
  twitter: "@mikewatsondrywall",
  snapchat: "mikewatson_drywall",
  reddit: "u/mikewatsondrywall",
  youtube: "@mikewatsondrywall",
  google: "g.co/kgs/mikewatsondrywall",
  website: "mikewatsondrywall.co.uk"
};

const sql = `
update public.hammerex_trade_off_listings
set
  instagram = $1,
  tiktok    = $2,
  facebook  = $3,
  twitter   = $4,
  snapchat  = $5,
  reddit    = $6,
  youtube   = $7,
  google    = $8,
  website   = $9,
  recommendations = $10::jsonb
where slug = 'demo-mike-watson-drywall-manchester'
returning slug, website, instagram, facebook, recommendations;
`;

// The Management API runs queries as raw SQL with no parameter binding,
// so we inline-quote the values. SAFE here because these are static
// strings under our control, not user input.
function q(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

const inlinedSql = `
update public.hammerex_trade_off_listings
set
  instagram = ${q(social.instagram)},
  tiktok    = ${q(social.tiktok)},
  facebook  = ${q(social.facebook)},
  twitter   = ${q(social.twitter)},
  snapchat  = ${q(social.snapchat)},
  reddit    = ${q(social.reddit)},
  youtube   = ${q(social.youtube)},
  google    = ${q(social.google)},
  website   = ${q(social.website)},
  recommendations = ${q(JSON.stringify(recommendations))}::jsonb
where slug = 'demo-mike-watson-drywall-manchester'
returning slug, website, instagram, recommendations;
`;
void sql;

const r = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: inlinedSql })
  }
);
console.log("HTTP", r.status);
console.log((await r.text()).slice(0, 1200));
