// Xrated Trades — landing page.
// Server component. Pivoted from a two-sided directory to a SaaS-for-
// tradies positioning: the shareable trade profile that replaces a
// tradesperson's website, quote form and business card with one
// link. Customer-facing search, TradesOnStandby and live-jobs flows
// have been removed; the page now sells exclusively to tradies.
// Hero CTA: start the 30-day free trial.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { supabase, type HammerexTradeOffListing } from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { TradeIconChips } from "@/components/xrated/landing/TradeIconChips";
import { StickyMobileLandingBar } from "@/components/xrated/landing/StickyMobileLandingBar";

export const revalidate = 300;

export const metadata: Metadata = {
  title:
    "Xrated Trades — The Shareable Trade Profile for UK Tradies. Replace Your Website, Quote Form & Business Card.",
  description:
    "The shareable trade profile UK tradies put on their van, in their Instagram bio, and on every business card. Reviews, photos, prices, quote form, contact, QR code — one link. 30-day free trial, then £15/mo. Powered by Hammerex.",
  alternates: { canonical: "/trade-off" },
  openGraph: {
    type: "website",
    title:
      "Xrated Trades — The Shareable Trade Profile for UK Tradies. One link replaces your website.",
    description:
      "One link replaces your website, your quote form, and your business card. Reviews, photos, prices, contact, QR code — every customer you ever quote sees the same professional profile. 30-day free trial, then £15/mo.",
    url: absolute("/trade-off"),
    siteName: BRAND.name
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Xrated Trades — The Shareable Trade Profile for UK Tradies",
    description:
      "One link replaces your website, your quote form, and your business card. 30-day free trial."
  }
};

export default async function TradeOffLandingPage() {
  // We still fetch a slim listings count so the "X tradies already on
  // Xrated" social-proof stat is honest. No jobs fetch — the jobs board
  // was killed with the directory pivot.
  const { data } = await supabase
    .from("hammerex_trade_off_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "live");
  void data;
  const { count: tradieCount } = await supabase
    .from("hammerex_trade_off_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "live");
  const liveTradieCount = tradieCount ?? 0;

  // Featured demo profile for the "see a live profile" link in the
  // hero. Pinned to Mike Watson — that's the showcase profile carrying
  // every shipped feature (mock reviews + avatars, Meet the team, video
  // tile, services tabbed gallery, full Trust-and-Logistics on /contact,
  // services subpage with red catchment map). Fallback resolves to the
  // most-verified live profile if Mike is ever removed, then to the
  // signup page if the listings table is empty.
  const SHOWCASE_SLUG = "demo-mike-watson-drywall-manchester";
  const mikeRes = await supabase
    .from("hammerex_trade_off_listings")
    .select("slug")
    .eq("slug", SHOWCASE_SLUG)
    .eq("status", "live")
    .maybeSingle();
  let featuredHref = "/trade-off/signup";
  if (mikeRes.data) {
    featuredHref = `/trade/${SHOWCASE_SLUG}`;
  } else {
    const fallback = await supabase
      .from("hammerex_trade_off_listings")
      .select("slug")
      .eq("status", "live")
      .order("hammerex_standard_verified", { ascending: false })
      .limit(1)
      .maybeSingle();
    const fallbackSlug = (fallback.data as Pick<HammerexTradeOffListing, "slug"> | null)?.slug;
    if (fallbackSlug) featuredHref = `/trade/${fallbackSlug}`;
  }

  return (
    <main className="bg-white pb-24 md:pb-0">
      <XratedViewTracker page="landing" listingId={null} />
      <XratedHeader />

      {/* HERO — pivot. Was search-led; now value-prop-led. */}
      <section className="relative w-full overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={XRATED_BRAND.heroImageUrl}
          alt={`${XRATED_BRAND.name} — ${XRATED_BRAND.tagline}`}
          className="block h-[360px] w-full object-cover sm:h-[520px]"
        />
        <div className="absolute inset-y-0 left-0 flex items-center px-5 sm:px-10">
          <div className="max-w-md sm:max-w-xl">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
              style={{ color: XRATED_BRAND.accent }}
            >
              {XRATED_BRAND.name}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-[1.05] text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              The shareable trade profile
              <br />
              that replaces your{" "}
              <span style={{ color: XRATED_BRAND.accent }}>website</span>,{" "}
              <span style={{ color: XRATED_BRAND.accent }}>quote form</span>
              <br />
              and{" "}
              <span style={{ color: XRATED_BRAND.accent }}>business card</span>.
            </h1>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-white drop-shadow sm:text-sm">
              One link. Your work, your prices, your reviews, your contact form
              — every customer you ever quote sees the same professional
              profile. No website needed.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <a
                href="/trade-off/signup"
                className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-xs font-extrabold uppercase tracking-wider text-neutral-900 transition active:scale-[0.98] sm:h-12 sm:px-6 sm:text-sm"
                style={{
                  background: XRATED_BRAND.accent,
                  boxShadow: `0 4px 14px ${XRATED_BRAND.accent}55`
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Start 30-day free trial
              </a>
              <a
                href={featuredHref}
                className="inline-flex h-12 items-center gap-2 rounded-lg border-2 px-5 text-xs font-bold uppercase tracking-wider text-white transition active:scale-[0.98] sm:px-6 sm:text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.85)",
                  background: "rgba(0,0,0,0.25)",
                  backdropFilter: "blur(2px)"
                }}
              >
                See a live profile
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            </div>

            <p className="mt-3 text-xs text-white/85 drop-shadow">
              No card on signup · Cancel any time · {liveTradieCount} live profiles on Xrated
            </p>
          </div>
        </div>
      </section>

      {/* Trial pricing strip — replaces the old directory-metric stats. */}
      <section
        className="border-y border-neutral-200"
        style={{ background: "#FFB30010" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs font-semibold text-neutral-700 sm:text-sm">
            <span className="font-extrabold text-neutral-900">30-day free trial</span>
            <span className="mx-2 text-neutral-400">·</span>
            <span className="font-extrabold text-neutral-900">£15/mo or £140/yr</span>
            <span className="mx-2 text-neutral-400">·</span>
            Set up in 60 seconds
            <span className="mx-2 text-neutral-400">·</span>
            <span style={{ color: XRATED_BRAND.accent }}>No card on signup</span>
          </p>
        </div>
      </section>

      {/* Why tradies switch — 3-up value prop grid. */}
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-10 sm:pt-14">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          Why tradies switch to Xrated
        </h2>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          One link. Built for the way you actually work — site, van, WhatsApp, customer.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: "link",
              title: "One link replaces your website",
              body:
                "No Squarespace. No annual domain renewal. No broken WordPress. Your xratedtrade.com/<your-name> URL is your front door, and it just works."
            },
            {
              icon: "form",
              title: "Quote form built in",
              body:
                "Customers fill in postcode, project type, budget and photos before they reach you. Read it first, decide if it's worth your time, reply in one tap."
            },
            {
              icon: "star",
              title: "Verified reviews on autopilot",
              body:
                "Customers leave reviews tied to specific services. Your best work earns the most stars. Bad reviews can be disputed with evidence."
            }
          ].map((v) => (
            <li
              key={v.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: XRATED_BRAND.accent, color: "#0A0A0A" }}
              >
                <ValueIcon name={v.icon} />
              </span>
              <p className="mt-3 text-sm font-extrabold text-neutral-900">
                {v.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                {v.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Built for every trade — was "Browse by trade" search funnel. */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          Built for every trade
        </h2>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          Plasterers, electricians, plumbers, scaffolders, roofers, decorators
          — every Xrated profile is set up for your specific trade out of the box.
        </p>
        <div className="mt-4">
          <TradeIconChips />
        </div>
      </section>

      {/* How it works — tradie flow, 4 steps. */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          How it works
        </h2>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          From signup to your first customer enquiry — under an hour, end to end.
        </p>
        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: 1,
              title: "Sign up in 60 seconds",
              body:
                "Email + your trade. No card on signup. 30 days to try everything at no cost."
            },
            {
              step: 2,
              title: "Build your profile",
              body:
                "Bio, services, prices, photos, intro video, team, FAQ. 15 minutes total. Help text on every field."
            },
            {
              step: 3,
              title: "Share your URL",
              body:
                "Put xratedtrade.com/<your-name> on your van, in your WhatsApp bio, on every business card and quote email."
            },
            {
              step: 4,
              title: "Convert",
              body:
                "Customers contact you via the form. You reply on WhatsApp or email. You get paid direct. No platform fee on jobs."
            }
          ].map((s) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <span
                className="absolute -top-3 left-5 inline-flex h-7 w-10 items-center justify-center rounded-md text-xs font-extrabold"
                style={{ background: XRATED_BRAND.accent, color: "#0A0A0A" }}
              >
                {s.step}
              </span>
              <p className="mt-2 text-sm font-extrabold text-neutral-900">
                {s.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA — gets the visitor signing up. */}
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div
          className="overflow-hidden rounded-2xl px-5 py-8 text-center sm:px-10 sm:py-12"
          style={{ background: "#0A0A0A" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            One link. Every customer.
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
            Start your 30-day free trial today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs text-white/80 sm:text-sm">
            No card on signup. Full access for 30 days. £15/mo or £140/yr after
            that — cancel any time. Powered by Hammerex.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/trade-off/signup"
              className="inline-flex h-12 items-center gap-2 rounded-lg px-6 text-xs font-extrabold uppercase tracking-wider text-neutral-900 transition active:scale-[0.98] sm:text-sm"
              style={{
                background: XRATED_BRAND.accent,
                boxShadow: `0 4px 14px ${XRATED_BRAND.accent}55`
              }}
            >
              Start free trial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <a
              href={featuredHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 sm:text-sm"
            >
              See a live profile
            </a>
          </div>
        </div>
      </section>

      <XratedFooter />

      <StickyMobileLandingBar />
    </main>
  );
}

function ValueIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const
  };
  if (name === "link") {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
      </svg>
    );
  }
  if (name === "form") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor" stroke="none">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
