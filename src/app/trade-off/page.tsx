// Xrated Trades — landing page.
// Server component. Fetches live tradies, live jobs, and aggregate counts
// in parallel, then composes the landing experience: header, SearchHero
// (prominent search bar — the primary funnel), the Xrated banner image
// (no overlay text — it stands alone), stats row, live pulse ticker,
// auto-flipping live jobs spotlight (country-weighted), landscape trade
// cards, featured tradies, how it works, closing CTA, sticky mobile bar.
// Mobile-first throughout.

import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import {
  supabase,
  type HammerexTradeOffListing,
  type HammerexXratedJob
} from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { getCountryFromRequest } from "@/lib/geo";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { SearchHero } from "@/components/xrated/landing/SearchHero";
import { AutoFlipJobsSpotlight } from "@/components/xrated/landing/AutoFlipJobsSpotlight";
import { TradeShowcaseGrid } from "@/components/xrated/landing/TradeShowcaseGrid";
import { FeaturedTradiesRail } from "@/components/xrated/landing/FeaturedTradiesRail";
import { HowItWorks } from "@/components/xrated/landing/HowItWorks";
import { StickyMobileLandingBar } from "@/components/xrated/landing/StickyMobileLandingBar";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
  description:
    "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free standard listing for life. 30-day free trial of the Xrated App for premium profiles. Powered by Hammerex.",
  alternates: { canonical: "/trade-off" },
  openGraph: {
    type: "website",
    title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
    description:
      "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free for life. Powered by Hammerex.",
    url: absolute("/trade-off"),
    siteName: BRAND.name
  },
  twitter: {
    card: "summary_large_image",
    title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
    description:
      "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free for life."
  }
};

export default async function TradeOffLandingPage() {
  // Detect the visitor's country server-side so the spotlight can weight
  // its display list ~70% local / ~30% international.
  const [h, c] = await Promise.all([headers(), cookies()]);
  const userCountry = getCountryFromRequest(h, c);

  // Parallel fetches — listings (ranked) + spotlight jobs (top 20 so the
  // country-weighted shuffle has enough to pick from) + headcount-only query
  // for the live jobs stat so the hero number reflects the full live feed,
  // not just what the spotlight cycles through.
  const [listingsRes, spotlightJobsRes, jobsCountRes] = await Promise.all([
    supabase
      .from("hammerex_trade_off_listings")
      .select("*")
      .eq("status", "live")
      .order("hammerex_standard_verified", { ascending: false })
      .order("joined_at", { ascending: false }),
    supabase
      .from("hammerex_xrated_jobs")
      .select("*")
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("hammerex_xrated_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "live")
  ]);

  const listings = (listingsRes.data ?? []) as HammerexTradeOffListing[];
  const jobs = (spotlightJobsRes.data ?? []) as HammerexXratedJob[];

  // Live stats — tradies from the listings fetch, jobs from the count-only
  // query (so we don't silently cap at the spotlight's limit), cities from
  // the union of listing cities + job cities so customer demand counts too.
  const tradieCount = listings.length;
  const jobCount = jobsCountRes.count ?? jobs.length;
  const citySet = new Set<string>();
  for (const l of listings) {
    const c = l.city?.trim().toLowerCase();
    if (c) citySet.add(c);
  }
  for (const j of jobs) {
    const c = j.city?.trim().toLowerCase();
    if (c) citySet.add(c);
  }
  const cityCount = citySet.size;

  // Per-trade tradie count for the showcase tiles. Counts a tradie under
  // every trade they list (primary + secondary) so the badge reflects
  // searchable supply, not just the primary heading.
  const countsBySlug: Record<string, number> = {};
  for (const l of listings) {
    countsBySlug[l.primary_trade] = (countsBySlug[l.primary_trade] ?? 0) + 1;
    for (const s of l.secondary_trades ?? []) {
      countsBySlug[s] = (countsBySlug[s] ?? 0) + 1;
    }
  }

  // Featured tradies — app_paid first, then verified Standard, then the rest.
  // Top 6 of whatever survives.
  const tierWeight = (l: HammerexTradeOffListing): number => {
    if (l.tier === "app_paid") return 0;
    if (l.tier === "app_trial") return 1;
    if (l.hammerex_standard_verified) return 2;
    return 3;
  };
  const featured = [...listings]
    .sort((a, b) => {
      const w = tierWeight(a) - tierWeight(b);
      if (w !== 0) return w;
      return (
        new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
      );
    })
    .slice(0, 6);

  return (
    <main className="bg-white pb-24 md:pb-0">
      <XratedViewTracker page="landing" listingId={null} />
      <XratedHeader />

      {/* The new primary funnel — search-first. */}
      <SearchHero />

      {/* Xrated landing hero — banner image with text overlay on the LEFT.
          Left-side dark gradient so the headline reads against any photo. */}
      <section className="relative w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={XRATED_BRAND.heroImageUrl}
          alt={`${XRATED_BRAND.name} — ${XRATED_BRAND.tagline}`}
          className="block h-[320px] w-full object-cover sm:h-[480px]"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 80%)"
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-y-0 left-0 flex items-center px-5 sm:px-10">
          <div className="max-w-md sm:max-w-lg">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] drop-shadow sm:text-sm"
              style={{ color: XRATED_BRAND.accent }}
            >
              {XRATED_BRAND.name}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-[1.05] text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              Find Trades.
              <br />
              View Real Work.
              <br />
              <span style={{ color: XRATED_BRAND.accent }}>Get Quotes Fast.</span>
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/85 drop-shadow sm:text-sm">
              Free UK directory of working tradespeople — message direct on WhatsApp, no middleman.
            </p>
          </div>
        </div>
      </section>

      {/* Stats strip — single line, brand orange highlights. */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs font-semibold text-neutral-700 sm:text-sm">
            <span className="text-neutral-900">{tradieCount}</span> verified tradies
            <span className="mx-2 text-neutral-400">·</span>
            <span className="text-neutral-900">{jobCount}</span> live jobs
            <span className="mx-2 text-neutral-400">·</span>
            <span className="text-neutral-900">{cityCount}</span> cities
            <span className="mx-2 text-neutral-400">·</span>
            <span style={{ color: XRATED_BRAND.accent }}>Free for life</span>
          </p>
        </div>
      </section>

      <AutoFlipJobsSpotlight jobs={jobs} userCountry={userCountry} />

      <TradeShowcaseGrid countsBySlug={countsBySlug} />

      <FeaturedTradiesRail tradies={featured} />

      <HowItWorks />

      {/* Closing CTA — primary funnel is "Find a tradesperson"; the "List
          your trade" half stays as a secondary nudge for tradies. */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:pb-20">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-neutral-200 p-6 md:border-b-0 md:border-r md:p-10">
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: XRATED_BRAND.accent }}
              >
                Customers
              </p>
              <h3 className="mt-2 text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl">
                Find a tradesperson — fast.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                Search by trade or city. WhatsApp them direct. No middleman,
                no commission. Free for customers, forever.
              </p>
              <a
                href="/trade-off/search"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#FFB300] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#E5A500] active:scale-[0.98] sm:w-auto"
              >
                Find a tradesperson
              </a>
            </div>
            <div className="p-6 md:p-10">
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: XRATED_BRAND.accent }}
              >
                Tradespeople
              </p>
              <h3 className="mt-2 text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl">
                List your trade — free.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                A profile with real photos, your city, your WhatsApp.
                30-day free trial of the Xrated App for premium features.
              </p>
              <a
                href="/trade-off/signup"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 text-sm font-bold text-neutral-900 transition hover:border-[#FFB300] hover:text-[#FFB300] active:scale-[0.98] sm:w-auto"
              >
                List your trade — free
              </a>
            </div>
          </div>
        </div>
      </section>

      <XratedFooter />

      <StickyMobileLandingBar />
    </main>
  );
}
