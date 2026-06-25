// Xrated Trades — individual job detail page.
// Server-renders the job by slug. notFound() if not live. Lightbox photo
// gallery reuses TradePhotoGallery. The big WhatsApp CTA links direct to
// the customer; for is_example posts we hide the link and show a tradies-
// targeted nudge to post their own real job instead (the whole point of
// example posts is to seed the feed without misleading anyone).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { TradePhotoGallery } from "@/components/trade-off/TradePhotoGallery";
import { ExamplePill } from "@/components/xrated/jobs/ExamplePill";
import { JobReportButton } from "@/components/xrated/jobs/JobReportButton";
import { supabase, type HammerexXratedJob } from "@/lib/supabase";
import { tradeLabel } from "@/lib/tradeOff";
import { jobContactWhatsappUrl } from "@/lib/xratedJobs";
import { BRAND, absolute } from "@/lib/seo";
import { XRATED_BRAND } from "@/lib/xratedTrades";

export const revalidate = 60;

async function loadJob(slug: string): Promise<HammerexXratedJob | null> {
  const res = await supabase
    .from("hammerex_xrated_jobs")
    .select("*")
    .eq("status", "live")
    .eq("slug", slug)
    .maybeSingle();
  if (res.error || !res.data) return null;
  return res.data as HammerexXratedJob;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await loadJob(slug);
  if (!job) {
    return { title: "Job not found — Xrated Trades" };
  }
  const label = tradeLabel(job.trade_slug);
  const title = `${label} in ${job.city} — Xrated Trades`;
  const description = clamp(job.description.replace(/\s+/g, " ").trim(), 160);
  return {
    title,
    description,
    alternates: { canonical: `/trade-off/jobs/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: absolute(`/trade-off/jobs/${slug}`),
      siteName: BRAND.name,
      images: job.photos?.[0] ? [{ url: job.photos[0] }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await loadJob(slug);
  if (!job) notFound();

  const label = tradeLabel(job.trade_slug);
  const whatsappUrl = jobContactWhatsappUrl(job);

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedViewTracker page="job_detail" listingId={null} />
      <XratedHeader />

      <nav
        className="mx-auto max-w-5xl px-4 pt-4 text-xs text-brand-muted"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a href="/" className="hover:text-brand-text">Home</a>
          </li>
          <li>/</li>
          <li>
            <a href="/trade-off" className="hover:text-brand-text">Xrated Trades</a>
          </li>
          <li>/</li>
          <li>
            <a href="/trade-off/jobs" className="hover:text-brand-text">Jobs</a>
          </li>
          <li>/</li>
          <li className="text-brand-text">
            {label} in {job.city}
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-5xl px-4 pt-6">
        <article className="rounded-2xl border border-brand-line bg-brand-surface/60 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {job.is_example && <ExamplePill />}
            <span className="inline-flex items-center rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-brand-muted">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.city}
              {job.postcode_prefix ? ` · ${job.postcode_prefix}` : ""}
            </span>
            <span className="text-xs text-brand-muted">
              Posted {relativeTime(job.created_at)}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
            {label} in {job.city}
          </h1>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
            {job.description}
          </p>

          {job.budget_hint && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text">
              <span className="text-brand-muted">Budget:</span>
              <span>{job.budget_hint}</span>
            </div>
          )}
        </article>
      </section>

      {job.photos && job.photos.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-6">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            Photos from the customer
          </p>
          <div className="mt-3">
            <TradePhotoGallery photos={job.photos} name={`${label} in ${job.city}`} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 pt-8">
        {job.is_example ? null : whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 font-bold text-white shadow-lg transition hover:bg-[#EA580C] active:scale-[0.98]"
            style={{ minHeight: 56 }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.56 3.81 1.62 5.43L2 22l4.83-1.26a9.86 9.86 0 0 0 5.21 1.48h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.42 14.7 2 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.05.8.81-2.98-.2-.31a8.18 8.18 0 0 1-1.26-4.41c0-4.54 3.69-8.23 8.23-8.23 2.2 0 4.27.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23z" />
            </svg>
            <span className="text-sm sm:text-base">
              Message {job.customer_name} on WhatsApp
            </span>
          </a>
        ) : (
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-muted">
            Contact details unavailable for this job.
          </div>
        )}
        <p className="mt-3 text-center text-xs text-brand-muted">
          Hammerex doesn't take a cut. Quote direct, win the job, keep the work.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <JobReportButton jobId={job.id} />
      </section>

      <XratedFooter />
    </main>
  );
}
