// Shared helpers for admin pages. Pulled out of page.tsx because
// Next.js 16 forbids arbitrary named exports from app/page.tsx files.

export function funnelFromEvents(events: { event_type: string; session_id: string | null }[]) {
  const stages: { key: string; label: string }[] = [
    { key: "pdp_view",         label: "Product view" },
    { key: "cart_view",        label: "Cart view" },
    { key: "checkout_view",    label: "Checkout view" },
    { key: "checkout_success", label: "Paid" }
  ];
  const sessionsByStage = stages.map((s) => ({
    ...s,
    sessions: new Set(
      events.filter((e) => e.event_type === s.key && e.session_id).map((e) => e.session_id as string)
    )
  }));
  const top = sessionsByStage[0].sessions.size || 0;
  return sessionsByStage.map((s, i) => {
    const prev = i === 0 ? top : sessionsByStage[i - 1].sessions.size;
    const dropOff = i === 0 ? 0 : (prev === 0 ? 0 : 1 - s.sessions.size / prev);
    return {
      key: s.key,
      label: s.label,
      sessions: s.sessions.size,
      sharePctOfTop: top ? Math.round((s.sessions.size / top) * 100) : 0,
      dropOffPct: Math.round(dropOff * 100)
    };
  });
}

// Per-session duration: max(created_at) - min(created_at) for each
// session_id. Single-event sessions count as 0s (bounces).
export function summariseSessions(events: { session_id: string | null; created_at: string }[]) {
  const range: Record<string, { min: number; max: number; count: number }> = {};
  for (const e of events) {
    if (!e.session_id) continue;
    const t = new Date(e.created_at).getTime();
    if (!Number.isFinite(t)) continue;
    const slot = range[e.session_id] ?? (range[e.session_id] = { min: t, max: t, count: 0 });
    if (t < slot.min) slot.min = t;
    if (t > slot.max) slot.max = t;
    slot.count++;
  }
  const durations = Object.values(range).map((r) => Math.max(0, Math.round((r.max - r.min) / 1000)));
  const totalSessions = durations.length;
  if (totalSessions === 0) {
    return { totalSessions: 0, avgSeconds: 0, medianSeconds: 0, durations: [] as number[] };
  }
  const sorted = [...durations].sort((a, b) => a - b);
  const avg = Math.round(durations.reduce((s, n) => s + n, 0) / totalSessions);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
  return { totalSessions, avgSeconds: avg, medianSeconds: median, durations };
}

export function formatMinutes(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
