// Admin moderation queue for the Xrated Trades customer-jobs feed.
// Server-rendered. Pulls every job (capped at 500 rows) ordered with
// 'pending' first so the most urgent work sits at the top.
//
// Sections:
//   1. Pending review — full cards + Approve / Reject / Mark as Example.
//   2. Live — compact list with WhatsApp + Reject + drill-in arrow.
//   3. Completed / Rejected / Expired — collapsed summary tables.
//   4. Example posts — separate section with a "Seed new example" CTA.
//
// Every action posts to /api/admin/xrated/jobs/moderate (form-encoded so
// the API can 303-redirect back here on success).

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tradeLabel } from "@/lib/tradeOff";
import { WhatsAppIconButton } from "@/components/admin/WhatsAppIconButton";
import type { HammerexXratedJob } from "@/lib/supabase";
import { JobStatusPill } from "./JobStatusPill";
import { SeedExampleForm } from "./SeedExampleForm";

export const dynamic = "force-dynamic";

type JobRow = Pick<
  HammerexXratedJob,
  | "id"
  | "slug"
  | "customer_name"
  | "customer_whatsapp"
  | "trade_slug"
  | "city"
  | "postcode_prefix"
  | "description"
  | "budget_hint"
  | "photos"
  | "status"
  | "is_example"
  | "report_count"
  | "expires_at"
  | "created_at"
>;

const JOB_COLUMNS =
  "id, slug, customer_name, customer_whatsapp, trade_slug, city, postcode_prefix, description, budget_hint, photos, status, is_example, report_count, expires_at, created_at";

export default async function AdminXratedJobsPage() {
  const res = await supabaseAdmin
    .from("hammerex_xrated_jobs")
    .select(JOB_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500);

  const jobs = (res.data ?? []) as JobRow[];

  // 'pending' is most urgent — group it first.
  const pending = jobs.filter((j) => j.status === "pending" && !j.is_example);
  // 'live' but not example
  const live = jobs.filter((j) => j.status === "live" && !j.is_example);
  const completed = jobs.filter((j) => j.status === "completed" && !j.is_example);
  const rejected = jobs.filter((j) => j.status === "rejected" && !j.is_example);
  const expired = jobs.filter((j) => j.status === "expired" && !j.is_example);
  const examples = jobs.filter((j) => j.is_example);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Xrated Jobs — moderation</h1>
        <p className="text-xs text-brand-muted">
          Customers post a project; you flip it to live (or reject). Tradies
          message the customer on WhatsApp directly — Hammerex never
          touches money. Examples are seeded by you to give the feed shape
          before density.
        </p>
      </header>

      {res.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Failed to load jobs: {res.error.message}
        </div>
      )}

      {/* PENDING — most urgent */}
      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Pending review"
          count={pending.length}
          accent="amber"
        />
        {pending.length === 0 ? (
          <EmptyHint copy="Nothing in the queue. Customers will post here." />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {pending.map((j) => (
              <PendingCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>

      {/* LIVE */}
      <section className="flex flex-col gap-3">
        <SectionHeading title="Live" count={live.length} accent="emerald" />
        {live.length === 0 ? (
          <EmptyHint copy="No live customer jobs yet." />
        ) : (
          <details className="rounded-2xl border border-brand-line bg-brand-surface">
            <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-accent">
              Show {live.length} live job{live.length === 1 ? "" : "s"}
            </summary>
            <div className="divide-y divide-brand-line">
              {live.map((j) => (
                <LiveRow key={j.id} job={j} />
              ))}
            </div>
          </details>
        )}
      </section>

      {/* COMPLETED */}
      <CollapsedSection
        title="Completed"
        accent="muted"
        rows={completed}
      />

      {/* REJECTED */}
      <CollapsedSection
        title="Rejected"
        accent="red"
        rows={rejected}
      />

      {/* EXPIRED */}
      <CollapsedSection
        title="Expired"
        accent="muted"
        rows={expired}
      />

      {/* EXAMPLES */}
      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Example posts"
          count={examples.length}
          accent="yellow"
        />
        <SeedExampleForm />
        {examples.length === 0 ? (
          <EmptyHint copy="Seed a few to give the feed shape." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-line bg-brand-surface">
            <table className="min-w-full divide-y divide-brand-line text-sm">
              <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
                <tr>
                  <Th>Trade</Th>
                  <Th>City</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Seeded</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {examples.map((j) => (
                  <tr key={j.id} className="hover:bg-brand-bg/40">
                    <Td>{tradeLabel(j.trade_slug)}</Td>
                    <Td>{j.city}</Td>
                    <Td className="max-w-md truncate">{j.description}</Td>
                    <Td>
                      <JobStatusPill status={j.status} />
                    </Td>
                    <Td>{shortDate(j.created_at)}</Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/xrated/jobs/${j.id}`}
                        className="text-xs font-semibold uppercase tracking-widest text-brand-accent hover:opacity-80"
                      >
                        Open
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ----- Section components -----

function PendingCard({ job }: { job: JobRow }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-brand-surface p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-brand-text">
            {tradeLabel(job.trade_slug)}
          </span>
          <span className="text-xs text-brand-muted">•</span>
          <span className="text-xs text-brand-muted">{job.city}</span>
          {job.postcode_prefix && (
            <>
              <span className="text-xs text-brand-muted">•</span>
              <span className="text-xs text-brand-muted">
                {job.postcode_prefix}
              </span>
            </>
          )}
          <JobStatusPill status={job.status} />
          {job.report_count > 0 && (
            <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
              {job.report_count} report{job.report_count === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <span className="text-xs text-brand-muted">
          {relativeTime(job.created_at)}
        </span>
      </header>

      <p className="whitespace-pre-wrap text-sm text-brand-text">
        {job.description}
      </p>

      {job.budget_hint && (
        <div className="text-xs text-brand-muted">
          <span className="uppercase tracking-widest">Budget:</span>{" "}
          {job.budget_hint}
        </div>
      )}

      {job.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.photos.slice(0, 5).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${job.id}-${i}`}
              src={p}
              alt={`Photo ${i + 1}`}
              className="h-20 w-20 rounded-lg border border-brand-line object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-brand-line pt-3">
        <div className="flex items-center gap-2">
          <WhatsAppIconButton
            whatsapp={job.customer_whatsapp}
            name={job.customer_name}
          />
          <div className="text-xs">
            <div className="font-semibold text-brand-text">
              {job.customer_name}
            </div>
            <div className="text-brand-muted">{job.customer_whatsapp}</div>
          </div>
        </div>
        <Link
          href={`/admin/xrated/jobs/${job.id}`}
          className="text-xs font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-accent"
        >
          Details →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <ModerateForm jobId={job.id} status="live">
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-bg transition hover:opacity-90"
          >
            Approve → Live
          </button>
        </ModerateForm>
        <ModerateForm jobId={job.id} status="rejected">
          <button
            type="submit"
            className="rounded-full border border-red-500/50 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-300 transition hover:bg-red-500/20"
          >
            Reject
          </button>
        </ModerateForm>
        <ModerateForm jobId={job.id} status="live" markAsExample>
          <button
            type="submit"
            className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-300 transition hover:bg-yellow-500/20"
          >
            Mark as example
          </button>
        </ModerateForm>
      </div>
    </article>
  );
}

function LiveRow({ job }: { job: JobRow }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <WhatsAppIconButton
          whatsapp={job.customer_whatsapp}
          name={job.customer_name}
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-brand-text">
            {tradeLabel(job.trade_slug)} · {job.city}
            {job.postcode_prefix ? ` · ${job.postcode_prefix}` : ""}
          </div>
          <div className="truncate text-xs text-brand-muted">
            {job.customer_name} · {relativeTime(job.created_at)}
            {job.report_count > 0 && (
              <span className="ml-2 text-red-300">
                · {job.report_count} report{job.report_count === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ModerateForm jobId={job.id} status="rejected">
          <button
            type="submit"
            className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-300 transition hover:bg-red-500/20"
          >
            Reject
          </button>
        </ModerateForm>
        <Link
          href={`/admin/xrated/jobs/${job.id}`}
          aria-label="Open job"
          title="Open job"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-brand-bg text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function CollapsedSection({
  title,
  accent,
  rows
}: {
  title: string;
  accent: "amber" | "emerald" | "red" | "yellow" | "muted";
  rows: JobRow[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={title} count={rows.length} accent={accent} />
      {rows.length === 0 ? (
        <EmptyHint copy={`No ${title.toLowerCase()} jobs.`} />
      ) : (
        <details className="rounded-2xl border border-brand-line bg-brand-surface">
          <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-accent">
            Show {rows.length} {title.toLowerCase()} job
            {rows.length === 1 ? "" : "s"}
          </summary>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-line text-sm">
              <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
                <tr>
                  <Th>Trade</Th>
                  <Th>City</Th>
                  <Th>Customer</Th>
                  <Th>Posted</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {rows.map((j) => (
                  <tr key={j.id} className="hover:bg-brand-bg/40">
                    <Td>{tradeLabel(j.trade_slug)}</Td>
                    <Td>{j.city}</Td>
                    <Td>{j.customer_name}</Td>
                    <Td>{shortDate(j.created_at)}</Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/xrated/jobs/${j.id}`}
                        className="text-xs font-semibold uppercase tracking-widest text-brand-accent hover:opacity-80"
                      >
                        Open
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

function SectionHeading({
  title,
  count,
  accent
}: {
  title: string;
  count: number;
  accent: "amber" | "emerald" | "red" | "yellow" | "muted";
}) {
  const accentCls: Record<typeof accent, string> = {
    amber: "text-amber-300",
    emerald: "text-emerald-300",
    red: "text-red-300",
    yellow: "text-yellow-300",
    muted: "text-brand-muted"
  };
  return (
    <h2 className="flex items-baseline gap-2 text-sm font-bold uppercase tracking-widest">
      <span className={accentCls[accent]}>{title}</span>
      <span className="text-xs text-brand-muted">(count: {count})</span>
    </h2>
  );
}

function EmptyHint({ copy }: { copy: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-line p-4 text-xs text-brand-muted">
      {copy}
    </div>
  );
}

// Tiny shared form helper. Submits form-encoded to /api/admin/xrated/jobs/moderate
// so the route can 303-redirect us back. No client JS required.
function ModerateForm({
  jobId,
  status,
  markAsExample,
  redirectTo,
  children
}: {
  jobId: string;
  status: HammerexXratedJob["status"];
  markAsExample?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action="/api/admin/xrated/jobs/moderate"
      method="post"
      className="inline-flex"
    >
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="status" value={status} />
      {markAsExample && (
        <input type="hidden" name="mark_as_example" value="true" />
      )}
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}
      {children}
    </form>
  );
}

function Th({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 text-left font-semibold ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-3 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return shortDate(iso);
}

