// Xrated Trades — landing page.
// Server component. Fetches live tradies, live jobs, and aggregate counts
// in parallel, then composes the landing experience: header, SearchHero
// (prominent search bar — the primary funnel), the Xrated banner image
// (no overlay text — it stands alone), stats row, live pulse ticker,
// auto-flipping live jobs spotlight (country-weighted), landscape trade
// cards, featured tradies, how it works, closing CTA, sticky mobile bar.
// Mobile-first throughout.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import {
  supabase,
  type HammerexTradeOffListing,
  type HammerexXratedJob
} from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { LandingSearchBar } from "@/components/xrated/landing/LandingSearchBar";
import { TradeIconChips } from "@/components/xrated/landing/TradeIconChips";
import { TradesOnStandby } from "@/components/xrated/landing/TradesOnStandby";
import { availabilityRank } from "@/lib/xratedAvailability";
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
  // Parallel fetches — listings (ranked) + recent jobs (used only for the
  // city/jobcount stats now that the spotlight is gone) + headcount-only
  // query so the hero number reflects the full live feed.
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

  return (
    <main className="bg-white pb-24 md:pb-0">
      <XratedViewTracker page="landing" listingId={null} />
      <XratedHeader />

      {/* Xrated landing hero — sits DIRECTLY under the header. Banner
          image's natural left side is white, so text overlays as dark on
          the white half — no gradient needed. */}
      <section className="relative w-full overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={XRATED_BRAND.heroImageUrl}
          alt={`${XRATED_BRAND.name} — ${XRATED_BRAND.tagline}`}
          className="block h-[320px] w-full object-cover sm:h-[480px]"
        />
        <div className="absolute inset-y-0 left-0 flex items-center px-5 sm:px-10">
          <div className="max-w-md sm:max-w-lg">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
              style={{ color: XRATED_BRAND.accent }}
            >
              {XRATED_BRAND.name}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-[1.05] text-neutral-900 sm:text-4xl md:text-5xl">
              Find Trades.
              <br />
              View Real Work.
              <br />
              <span style={{ color: XRATED_BRAND.accent }}>Get Quotes Fast.</span>
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white drop-shadow sm:text-sm">
              Free UK directory of working tradespeople — message direct on WhatsApp, no middleman.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Primary — yellow Find Trades with magnifying glass */}
              <a
                href="#search"
                className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-xs font-bold uppercase tracking-wider text-neutral-900 transition active:scale-[0.98] sm:h-12 sm:px-5 sm:text-sm"
                style={{
                  background: XRATED_BRAND.accent,
                  boxShadow: `0 4px 14px ${XRATED_BRAND.accent}55`
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                Find Trades
              </a>

              {/* Secondary — white with yellow border ring */}
              <a
                href="/trade-off/signup"
                className="inline-flex h-11 items-center gap-2 rounded-lg border-2 bg-white px-4 text-xs font-bold uppercase tracking-wider text-neutral-900 transition active:scale-[0.98] sm:h-12 sm:px-5 sm:text-sm"
                style={{ borderColor: XRATED_BRAND.accent }}
              >
                List trade
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Long search bar sits flush UNDER the hero — overlapping by ~28px
          so it looks anchored to the banner. Cities list is built from the
          live tradies + jobs union so the dropdown reflects real supply. */}
      <LandingSearchBar
        cities={Array.from(citySet)
          .map((c) => c.replace(/(^|\s|-)\w/g, (m) => m.toUpperCase()))
          .sort()}
      />

      {/* Circular trade-icon chip row under the search bar */}
      <TradeIconChips />

      {/* Trades On Standby — tradies who've opted-in with an availability
          + headline rate. Soonest-available first, capped at 10. */}
      <TradesOnStandby
        listings={listings
          .filter((l) => l.accepting_jobs === true && l.availability !== null)
          .sort(
            (a, b) => availabilityRank(a.availability) - availabilityRank(b.availability)
          )
          .slice(0, 10)}
      />

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

      <XratedFooter />

      <StickyMobileLandingBar />
    </main>
  );
}
