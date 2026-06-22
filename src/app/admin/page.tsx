import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400 * 1000).toISOString();
}

export default async function AdminOverviewPage() {
  const since30 = isoDaysAgo(30);

  const [searches30, events30] = await Promise.all([
    supabaseAdmin.from("hammerex_search_queries").select("id,q,results_count").gte("created_at", since30),
    supabaseAdmin.from("hammerex_page_events").select("event_type,session_id,country").gte("created_at", since30)
  ]);

  const searches = (searches30.data ?? []) as { q: string; results_count: number }[];
  const events = (events30.data ?? []) as { event_type: string; session_id: string | null; country: string | null }[];

  const queryCounts: Record<string, { count: number; zero: number }> = {};
  for (const s of searches) {
    const k = s.q.toLowerCase().trim();
    if (!queryCounts[k]) queryCounts[k] = { count: 0, zero: 0 };
    queryCounts[k].count++;
    if (s.results_count === 0) queryCounts[k].zero++;
  }
  const topQ = Object.entries(queryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const countryCounts: Record<string, Set<string>> = {};
  for (const e of events) {
    const c = (e.country || "??").toUpperCase();
    if (!countryCounts[c]) countryCounts[c] = new Set();
    if (e.session_id) countryCounts[c].add(e.session_id);
  }
  const topC = Object.entries(countryCounts)
    .map(([c, s]) => ({ country: c, sessions: s.size }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const funnel = funnelFromEvents(events);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Overview · last 30 days</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Searches (30d)" value={searches.length.toString()} sub={`${Object.keys(queryCounts).length} unique terms`} />
        <Card label="Sessions (30d)" value={new Set(events.map((e) => e.session_id).filter(Boolean)).size.toString()} sub={`${events.length} page events`} />
        <Card label="PDPs viewed (30d)" value={events.filter((e) => e.event_type === "pdp_view").length.toString()} sub="WhatsApp-only — orders not tracked in-app" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Top searches" cta={{ href: "/admin/search", label: "All →" }}>
          {topQ.length === 0 ? <Empty>No searches yet.</Empty> : (
            <ul className="divide-y divide-brand-line">
              {topQ.map(([q, { count, zero }]) => (
                <li key={q} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate text-brand-text">{q}</span>
                  <span className="shrink-0 text-xs text-brand-muted">
                    {count}× {zero > 0 && <span className="ml-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">{zero} no-result</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top countries" cta={{ href: "/admin/traffic", label: "Breakdown →" }}>
          {topC.length === 0 ? <Empty>No traffic yet.</Empty> : (
            <ul className="divide-y divide-brand-line">
              {topC.map((c) => (
                <li key={c.country} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="text-brand-text">{c.country}</span>
                  <span className="text-xs text-brand-muted">{c.sessions} sessions</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Funnel · drop-off" cta={{ href: "/admin/traffic", label: "Detail →" }}>
          <FunnelList funnel={funnel} />
        </Panel>
      </div>

    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-text">{value}</div>
      {sub && <div className="mt-1 text-xs text-brand-muted">{sub}</div>}
    </div>
  );
}

function Panel({ title, children, cta }: { title: string; children: React.ReactNode; cta?: { href: string; label: string } }) {
  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">{title}</h2>
        {cta && <Link href={cta.href} className="text-xs text-brand-accent hover:underline">{cta.label}</Link>}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-brand-line p-3 text-xs text-brand-muted">{children}</p>;
}

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

function FunnelList({ funnel }: { funnel: ReturnType<typeof funnelFromEvents> }) {
  if (funnel[0].sessions === 0) return <Empty>No funnel data yet.</Empty>;
  return (
    <ol className="flex flex-col gap-2">
      {funnel.map((f, i) => (
        <li key={f.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-text">{f.label}</span>
            <span className="text-brand-muted">{f.sessions} · {f.sharePctOfTop}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-bg">
            <div className="h-full bg-brand-accent" style={{ width: `${f.sharePctOfTop}%` }} />
          </div>
          {i > 0 && f.dropOffPct > 0 && (
            <div className="text-[11px] text-red-300">–{f.dropOffPct}% vs previous stage</div>
          )}
        </li>
      ))}
    </ol>
  );
}
