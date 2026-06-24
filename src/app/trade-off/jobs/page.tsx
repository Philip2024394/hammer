// Xrated Trades — public live jobs feed.
// Server component. Filters by ?trade=<slug> and ?city=<text>.
// RLS guarantees only status='live' rows leak through anon — we still
// .eq('status','live') to be explicit and to keep the query plan clean.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { supabase, type HammerexXratedJob } from "@/lib/supabase";
import { TRADE_OFF_TRADES, tradeLabel } from "@/lib/tradeOff";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { BRAND, absolute } from "@/lib/seo";
import { JobCard } from "@/components/xrated/jobs/JobCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Live customer jobs — Xrated Trades",
  description:
    "Browse current customer projects on Xrated Trades. Message customers direct on WhatsApp. Free for tradies, free for customers, no middleman.",
  alternates: { canonical: "/trade-off/jobs" },
  openGraph: {
    type: "website",
    title: "Live customer jobs — Xrated Trades",
    description:
      "Browse current customer projects on Xrated Trades. Message customers direct on WhatsApp.",
    url: absolute("/trade-off/jobs"),
    siteName: BRAND.name
  }
};

type SearchParams = Promise<{ trade?: string; city?: string }>;

async function loadJobs(tradeSlug: string | null, cityFilter: string | null) {
  let q = supabase
    .from("hammerex_xrated_jobs")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false });

  if (tradeSlug && TRADE_OFF_TRADES.find((t) => t.slug === tradeSlug)) {
    q = q.eq("trade_slug", tradeSlug);
  }
  if (cityFilter && cityFilter.length >= 2) {
    q = q.ilike("city", `%${cityFilter}%`);
  }

  const res = await q;
  return (res.data ?? []) as HammerexXratedJob[];
}

export default async function JobsFeedPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tradeSlug = (sp.trade ?? "").trim() || null;
  const cityFilter = (sp.city ?? "").trim() || null;

  const jobs = await loadJobs(tradeSlug, cityFilter);
  const activeTradeLabel = tradeSlug ? tradeLabel(tradeSlug) : null;

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedViewTracker page="jobs_feed" listingId={null} />
      <XratedHeader />

      <section className="border-b border-brand-line bg-black/40">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-10">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            Xrated Trades · Jobs
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-text sm:text-4xl">
            Live jobs on Xrated Trades
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-brand-muted sm:text-sm">
            Browse current customer projects. Message them direct on WhatsApp. No
            middleman, no commission — Hammerex doesn't take a cut.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/trade-off/jobs/post"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#EA580C] active:scale-[0.98]"
            >
              Post your project (free)
            </a>
            <p className="text-xs text-brand-muted">
              Customers post here for free — usually live within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: XRATED_BRAND.accent }}
        >
          Filter by trade
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <a
              href={cityFilter ? `/trade-off/jobs?city=${encodeURIComponent(cityFilter)}` : "/trade-off/jobs"}
              className={`inline-flex h-11 items-center rounded-full border px-4 text-xs font-semibold transition ${
                tradeSlug === null
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-brand-line bg-brand-surface text-brand-text hover:border-[#F97316] hover:text-[#F97316]"
              }`}
            >
              All trades
            </a>
          </li>
          {TRADE_OFF_TRADES.map((t) => {
            const on = tradeSlug === t.slug;
            const q = new URLSearchParams();
            q.set("trade", t.slug);
            if (cityFilter) q.set("city", cityFilter);
            return (
              <li key={t.slug}>
                <a
                  href={`/trade-off/jobs?${q.toString()}`}
                  className={`inline-flex h-11 items-center rounded-full border px-4 text-xs font-semibold transition ${
                    on
                      ? "border-[#F97316] bg-[#F97316] text-white"
                      : "border-brand-line bg-brand-surface text-brand-text hover:border-[#F97316] hover:text-[#F97316]"
                  }`}
                >
                  {t.label}
                </a>
              </li>
            );
          })}
        </ul>

        <form
          method="GET"
          action="/trade-off/jobs"
          className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {tradeSlug && <input type="hidden" name="trade" value={tradeSlug} />}
          <label htmlFor="city-filter" className="sr-only">
            City
          </label>
          <input
            id="city-filter"
            type="text"
            name="city"
            defaultValue={cityFilter ?? ""}
            placeholder="Filter by city (e.g. Manchester)"
            maxLength={80}
            className="h-11 w-full rounded-lg border border-brand-line bg-brand-bg px-3 text-xs text-brand-text placeholder:text-brand-muted focus:border-[#F97316] focus:outline-none sm:max-w-xs"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-line bg-brand-surface px-5 text-xs font-semibold text-brand-text transition hover:border-[#F97316] hover:text-[#F97316]"
          >
            Apply
          </button>
          {(cityFilter || tradeSlug) && (
            <a
              href="/trade-off/jobs"
              className="inline-flex h-11 items-center justify-center rounded-lg px-3 text-xs text-brand-muted transition hover:text-brand-text"
            >
              Clear filters
            </a>
          )}
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            {activeTradeLabel ? `${activeTradeLabel} jobs` : "All live jobs"}
            {cityFilter ? ` in ${cityFilter}` : ""}
          </h2>
          <span className="text-xs text-brand-muted">
            {jobs.length} live {jobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>
        {jobs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="text-sm font-semibold text-brand-text">
              No jobs match. Be the first to post.
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              Posting takes about a minute. You'll hear back direct on WhatsApp.
            </p>
            <a
              href="/trade-off/jobs/post"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#F97316] px-5 text-xs font-bold text-white transition hover:bg-[#EA580C]"
            >
              Post your project (free)
            </a>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j) => (
              <li key={j.id}>
                <JobCard job={j} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <XratedFooter />
    </main>
  );
}
