// Shared tier pill for the Xrated admin pages. Lives in a sibling file
// because Next.js 16 forbids non-default exports from app/page.tsx.

import type { XratedTier } from "@/lib/xratedTrades";

export function TierPill({ tier }: { tier: XratedTier }) {
  const cfg: Record<XratedTier, { label: string; cls: string }> = {
    standard: {
      label: "Standard",
      cls: "bg-brand-bg text-brand-muted border border-brand-line"
    },
    app_trial: {
      label: "Trial",
      cls: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
    },
    app_paid: {
      label: "Paid",
      cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
    },
    app_expired: {
      label: "Expired",
      cls: "bg-red-500/15 text-red-300 border border-red-500/30"
    }
  };
  const c = cfg[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  );
}
