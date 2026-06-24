// Xrated Trades — search results page.
// Server component. Reads `q` from searchParams and runs two parallel
// Supabase queries against the live tradies and live jobs feeds. Renders
// reused card markup so the look matches /trade-off and /trade-off/jobs.
// RLS guarantees only status='live' rows leak through anon — we still
// .eq('status','live') to be explicit and to keep the query plan clean.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import {
  supabase,
  type HammerexTradeOffListing,
  type HammerexXratedJob
} from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { tradeLabel } from "@/lib/tradeOff";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { JobCard } from "@/components/xrated/jobs/JobCard";

export const revalidate = 0;

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({
  searchParams
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const title = q
    ? `Search "${q}" — Xrated Trades`
    : "Search — Xrated Trades";
  const description = q
    ? `Tradies and jobs on Xrated Trades matching "${q}".`
    : "Search Xrated Trades for tradies, cities, or live customer jobs.";
  return {
    title,
    description,
    alternates: {
      canonical: q ? `/trade-off/search?q=${encodeURIComponent(q)}` : "/trade-off/search"
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: absolute(q ? `/trade-off/search?q=${encodeURIComponent(q)}` : "/trade-off/search"),
      siteName: BRAND.name
    }
  };
}

// Supabase `.or()` takes a comma-separated filter string. ILIKE pattern
// values must not contain commas or parentheses or they'll break the
// PostgREST parser — sanitise to a safe subset before interpolating.
function sanitiseForOr(input: string): string {
  return input.replace(/[,()%]/g, " ").replace(/\s+/g, " ").trim();
}

async function searchTradies(q: string): Promise<HammerexTradeOffListing[]> {
  const safe = sanitiseForOr(q);
  if (!safe) return [];
  const pattern = `%${safe}%`;
  const orFilter = [
    `display_name.ilike.${pattern}`,
    `trading_name.ilike.${pattern}`,
    `bio.ilike.${pattern}`,
    `city.ilike.${pattern}`,
    `primary_trade.ilike.${pattern}`
  ].join(",");
  const res = await supabase
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("status", "live")
    .or(orFilter)
    .order("hammerex_standard_verified", { ascending: false })
    .order("joined_at", { ascending: false })
    .limit(20);
  return (res.data ?? []) as HammerexTradeOffListing[];
}

async function searchJobs(q: string): Promise<HammerexXratedJob[]> {
  const safe = sanitiseForOr(q);
  if (!safe) return [];
  const pattern = `%${safe}%`;
  const orFilter = [
    `description.ilike.${pattern}`,
    `city.ilike.${pattern}`,
    `trade_slug.ilike.${pattern}`
  ].join(",");
  const res = await supabase
    .from("hammerex_xrated_jobs")
    .select("*")
    .eq("status", "live")
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(20);
  return (res.data ?? []) as HammerexXratedJob[];
}

export default async function XratedSearchPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const rawQ = (sp.q ?? "").trim();
  const q = rawQ.toLowerCase();
  const hasQuery = q.length >= 2;

  const [tradies, jobs] = hasQuery
    ? await Promise.all([searchTradies(q), searchJobs(q)])
    : [[] as HammerexTradeOffListing[], [] as HammerexXratedJob[]];

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedViewTracker page="search" listingId={null} />
      <XratedHeader />

      <section className="border-b border-brand-line bg-black/40">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs text-brand-muted"
          >
            <a href="/" className="hover:text-brand-text">
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a href="/trade-off" className="hover:text-brand-text">
              Xrated Trades
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-brand-text">Search</span>
            {rawQ && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-brand-text">&ldquo;{rawQ}&rdquo;</span>
              </>
            )}
          </nav>

          <p
            className="mt-4 text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            Xrated Trades · Search
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
            {hasQuery ? (
              <>
                Results for <span style={{ color: XRATED_BRAND.accent }}>&ldquo;{rawQ}&rdquo;</span>
              </>
            ) : (
              "Search Xrated Trades"
            )}
          </h1>
          {hasQuery && (
            <p className="mt-2 text-xs text-brand-muted sm:text-sm">
              {tradies.length} {tradies.length === 1 ? "tradie" : "tradies"} ·{" "}
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </p>
          )}
        </div>
      </section>

      {!hasQuery ? (
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="text-sm font-semibold text-brand-text">
              Start typing to search Xrated Trades — tradies, cities, or jobs.
            </p>
            <p className="mt-2 text-xs text-brand-muted">
              Use the search bar at the top of the page. Try a trade name
              (&ldquo;plasterer&rdquo;), a city, or a keyword from a job.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/trade-off"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F97316] px-5 text-xs font-bold text-white transition hover:bg-[#EA580C]"
              >
                Browse all tradies
              </a>
              <a
                href="/trade-off/jobs"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-line bg-brand-surface px-5 text-xs font-semibold text-brand-text transition hover:border-[#F97316] hover:text-[#F97316]"
              >
                Browse live jobs
              </a>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-8 pt-8">
            <div className="flex items-baseline justify-between gap-2">
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: XRATED_BRAND.accent }}
              >
                Tradies matching &ldquo;{rawQ}&rdquo;
              </h2>
              <span className="text-xs text-brand-muted">
                {tradies.length} {tradies.length === 1 ? "result" : "results"}
              </span>
            </div>
            {tradies.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface p-8 text-center">
                <p className="text-sm font-semibold text-brand-text">
                  No tradies match.
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  Try a shorter keyword, a trade, or a city.
                </p>
                <a
                  href="/trade-off"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-brand-line bg-brand-surface px-5 text-xs font-semibold text-brand-text transition hover:border-[#F97316] hover:text-[#F97316]"
                >
                  Back to /trade-off
                </a>
              </div>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tradies.map((l) => (
                  <li key={l.id}>
                    <ListingCard listing={l} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: XRATED_BRAND.accent }}
              >
                Jobs matching &ldquo;{rawQ}&rdquo;
              </h2>
              <span className="text-xs text-brand-muted">
                {jobs.length} {jobs.length === 1 ? "result" : "results"}
              </span>
            </div>
            {jobs.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface p-8 text-center">
                <p className="text-sm font-semibold text-brand-text">
                  No jobs match.
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  Customers post jobs daily — check back soon, or browse all
                  live jobs.
                </p>
                <a
                  href="/trade-off/jobs"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-brand-line bg-brand-surface px-5 text-xs font-semibold text-brand-text transition hover:border-[#F97316] hover:text-[#F97316]"
                >
                  Browse all live jobs
                </a>
              </div>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <JobCard job={j} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <XratedFooter />
    </main>
  );
}

// Reused tradie card markup — mirrors the ListingCard on /trade-off so
// search results feel native. Kept inline to avoid coupling the landing
// page to an exported component just for this consumer.
function ListingCard({ listing }: { listing: HammerexTradeOffListing }) {
  const photo = listing.photos[0] ?? listing.avatar_url ?? BRAND.logo;
  const primary = tradeLabel(listing.primary_trade);
  const initial = (listing.display_name.charAt(0) || "?").toUpperCase();
  return (
    <a
      href={`/trade/${listing.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-[#F97316]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={photo}
          alt={listing.display_name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
        {listing.hammerex_standard_verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#F97316] px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            Standard
          </span>
        )}
        <div className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-full border-2 border-brand-bg bg-brand-surface shadow-lg">
          {listing.avatar_url ? (
            <img
              src={listing.avatar_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F97316] text-base font-bold text-white">
              {initial}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-brand-text group-hover:text-[#F97316]">
          {listing.display_name}
        </h3>
        {listing.trading_name && (
          <p className="mt-0.5 text-xs text-brand-muted">{listing.trading_name}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-brand-line bg-black/40 px-2.5 py-1 text-xs font-semibold text-brand-text">
            {primary}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-brand-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {listing.city}
          </span>
        </div>
      </div>
    </a>
  );
}
