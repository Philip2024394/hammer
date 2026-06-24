// Shared status pill for the Xrated Jobs admin pages. Mirrors the sibling
// TierPill pattern (sibling file beside page.tsx because Next.js 16 forbids
// non-default exports from app/page.tsx).

import type { HammerexXratedJob } from "@/lib/supabase";

type JobStatus = HammerexXratedJob["status"];

export function JobStatusPill({ status }: { status: JobStatus }) {
  const cfg: Record<JobStatus, { label: string; cls: string }> = {
    pending: {
      label: "Pending",
      cls: "bg-amber-500/15 text-amber-300 border border-amber-500/30"
    },
    live: {
      label: "Live",
      cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
    },
    completed: {
      label: "Completed",
      cls: "bg-brand-bg text-brand-muted border border-brand-line"
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-500/15 text-red-300 border border-red-500/30"
    },
    expired: {
      label: "Expired",
      cls: "bg-brand-bg text-brand-muted/70 border border-brand-line opacity-70"
    }
  };
  const c = cfg[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export function ExamplePill() {
  return (
    <span className="inline-flex items-center rounded-full border border-yellow-500/40 bg-yellow-500/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
      Example
    </span>
  );
}
