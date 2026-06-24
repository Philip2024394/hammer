// Single-job admin drill-in.
// Shows the full job + reports + a moderation actions panel. Every action
// posts to /api/admin/xrated/jobs/moderate as a form-encoded submit so the
// route 303-redirects back to this page with the fresh state.

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tradeLabel } from "@/lib/tradeOff";
import { WhatsAppIconButton } from "@/components/admin/WhatsAppIconButton";
import type { HammerexXratedJob } from "@/lib/supabase";
import { JobStatusPill, ExamplePill } from "../JobStatusPill";

export const dynamic = "force-dynamic";

type JobRow = HammerexXratedJob;

type ReportRow = {
  id: string;
  reason: string | null;
  reporter_ip: string | null;
  created_at: string;
};

const JOB_COLUMNS =
  "id, slug, customer_name, customer_whatsapp, trade_slug, city, postcode_prefix, description, budget_hint, photos, status, is_example, report_count, expires_at, created_at, updated_at";

// Cheap UUID guard so a bad URL doesn't get sent to Postgres as a raw query.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminXratedJobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const res = await supabaseAdmin
    .from("hammerex_xrated_jobs")
    .select(JOB_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (res.error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
        Failed to load job: {res.error.message}
      </div>
    );
  }
  if (!res.data) {
    notFound();
  }
  const job = res.data as JobRow;

  const reportsRes = await supabaseAdmin
    .from("hammerex_xrated_job_reports")
    .select("id, reason, reporter_ip, created_at")
    .eq("job_id", job.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const reports = (reportsRes.data ?? []) as ReportRow[];

  const redirectTo = `/admin/xrated/jobs/${job.id}`;

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-brand-muted">
        <Link href="/admin/xrated/jobs" className="hover:text-brand-accent">
          ← All jobs
        </Link>
      </nav>

      <header className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">
            {tradeLabel(job.trade_slug)} · {job.city}
          </h1>
          <JobStatusPill status={job.status} />
          {job.is_example && <ExamplePill />}
          {job.report_count > 0 && (
            <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">
              {job.report_count} report{job.report_count === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 text-xs text-brand-muted sm:grid-cols-3">
          <Info label="Posted">{formatDateTime(job.created_at)}</Info>
          <Info label="Expires">{formatDateTime(job.expires_at)}</Info>
          <Info label="Updated">{formatDateTime(job.updated_at)}</Info>
          {job.postcode_prefix && (
            <Info label="Postcode prefix">{job.postcode_prefix}</Info>
          )}
          {job.budget_hint && (
            <Info label="Budget hint">{job.budget_hint}</Info>
          )}
          <Info label="Slug">{job.slug}</Info>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm text-brand-text">
            {job.description}
          </p>

          {job.photos.length > 0 && (
            <>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Photos
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {job.photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${job.id}-${i}`}
                    src={p}
                    alt={`Photo ${i + 1}`}
                    className="h-32 w-full rounded-lg border border-brand-line object-cover"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Customer
          </h2>
          <div className="flex items-center gap-3">
            <WhatsAppIconButton
              whatsapp={job.customer_whatsapp}
              name={job.customer_name}
            />
            <div className="text-sm">
              <div className="font-semibold text-brand-text">
                {job.customer_name}
              </div>
              <div className="text-xs text-brand-muted">
                {job.customer_whatsapp}
              </div>
              {job.is_example && (
                <div className="mt-1 text-xs text-yellow-300">
                  Example post — never links out
                </div>
              )}
            </div>
          </div>

          <h2 className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
            Moderation actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <ModerateAction
              jobId={job.id}
              status="live"
              redirectTo={redirectTo}
              className="bg-emerald-500 text-brand-bg"
            >
              Approve → Live
            </ModerateAction>
            <ModerateAction
              jobId={job.id}
              status="rejected"
              redirectTo={redirectTo}
              className="border border-red-500/50 bg-red-500/10 text-red-300"
            >
              Reject
            </ModerateAction>
            <ModerateAction
              jobId={job.id}
              status="live"
              markAsExample
              redirectTo={redirectTo}
              className="border border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
            >
              Mark as example
            </ModerateAction>
            <ModerateAction
              jobId={job.id}
              status="completed"
              redirectTo={redirectTo}
              className="border border-brand-line bg-brand-bg text-brand-muted"
            >
              Mark completed
            </ModerateAction>
            <ModerateAction
              jobId={job.id}
              status="expired"
              redirectTo={redirectTo}
              className="border border-brand-line bg-brand-bg text-brand-muted"
            >
              Expire
            </ModerateAction>
            <ModerateAction
              jobId={job.id}
              status="pending"
              redirectTo={redirectTo}
              className="border border-amber-500/50 bg-amber-500/10 text-amber-300"
            >
              Send back to pending
            </ModerateAction>
          </div>
        </aside>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Reports ({job.report_count})
        </h2>
        {reports.length === 0 ? (
          <p className="text-xs text-brand-muted">
            No reports for this job.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-line text-sm">
              <thead className="bg-brand-bg text-xs uppercase tracking-widest text-brand-muted">
                <tr>
                  <Th>When</Th>
                  <Th>Reason</Th>
                  <Th>Reporter IP</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {reports.map((r) => (
                  <tr key={r.id}>
                    <Td>{formatDateTime(r.created_at)}</Td>
                    <Td className="max-w-md whitespace-pre-wrap">
                      {r.reason ?? <span className="text-brand-muted">—</span>}
                    </Td>
                    <Td className="text-brand-muted">
                      {r.reporter_ip ?? "—"}
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

function ModerateAction({
  jobId,
  status,
  markAsExample,
  redirectTo,
  className,
  children
}: {
  jobId: string;
  status: HammerexXratedJob["status"];
  markAsExample?: boolean;
  redirectTo: string;
  className: string;
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
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <button
        type="submit"
        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition hover:opacity-90 ${className}`}
      >
        {children}
      </button>
    </form>
  );
}

function Info({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-brand-muted">
        {label}
      </div>
      <div className="text-sm text-brand-text">{children}</div>
    </div>
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
    <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
