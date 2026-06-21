import { supabase } from "@/lib/supabase";
import { funnelFromEvents } from "../page";

export const dynamic = "force-dynamic";

type Event = {
  event_type: string;
  product_id: string | null;
  country: string | null;
  session_id: string | null;
  path: string | null;
  created_at: string;
};

export default async function AdminTrafficPage() {
  const since30 = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  const res = await supabase
    .from("hammerex_page_events")
    .select("event_type,product_id,country,session_id,path,created_at")
    .gte("created_at", since30)
    .order("created_at", { ascending: false })
    .limit(5000);
  const events = (res.data ?? []) as Event[];

  const funnel = funnelFromEvents(events);

  // Country: unique sessions + last visit + breakdown by stage
  type C = { sessions: Set<string>; bestStage: string };
  const STAGE_RANK: Record<string, number> = {
    pdp_view: 1, cart_view: 2, checkout_view: 3, checkout_started: 4, checkout_success: 5
  };
  const byCountry: Record<string, C> = {};
  for (const e of events) {
    const c = (e.country || "??").toUpperCase();
    const slot = byCountry[c] ?? (byCountry[c] = { sessions: new Set(), bestStage: e.event_type });
    if (e.session_id) slot.sessions.add(e.session_id);
    if ((STAGE_RANK[e.event_type] ?? 0) > (STAGE_RANK[slot.bestStage] ?? 0)) slot.bestStage = e.event_type;
  }
  const countries = Object.entries(byCountry)
    .map(([c, v]) => ({ country: c, sessions: v.sessions.size, bestStage: v.bestStage }))
    .sort((a, b) => b.sessions - a.sessions);

  // Top PDPs by sessions
  const byProduct: Record<string, Set<string>> = {};
  for (const e of events) {
    if (e.event_type !== "pdp_view" || !e.product_id || !e.session_id) continue;
    (byProduct[e.product_id] ?? (byProduct[e.product_id] = new Set())).add(e.session_id);
  }
  const topPdps = Object.entries(byProduct)
    .map(([id, s]) => ({ id, sessions: s.size }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  const productNames = new Map<string, { name: string; slug: string | null }>();
  if (topPdps.length > 0) {
    const pr = await supabase
      .from("hammerex_products")
      .select("id,name,slug")
      .in("id", topPdps.map((p) => p.id));
    for (const p of (pr.data ?? []) as { id: string; name: string; slug: string | null }[]) {
      productNames.set(p.id, { name: p.name, slug: p.slug });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Traffic · last 30 days</h1>

      <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-text">Funnel drop-off</h2>
        {funnel[0].sessions === 0 ? (
          <p className="text-sm text-brand-muted">No funnel data yet. Browse a PDP, add to cart, and visit /checkout to seed events.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {funnel.map((f, i) => (
              <li key={f.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-text">{f.label}</span>
                  <span className="text-xs text-brand-muted">{f.sessions} sessions · {f.sharePctOfTop}% of top</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-brand-bg">
                  <div className="h-full bg-brand-accent" style={{ width: `${f.sharePctOfTop}%` }} />
                </div>
                {i > 0 && f.dropOffPct > 0 && (
                  <div className="text-xs text-red-300">Drop-off vs previous stage: –{f.dropOffPct}%</div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-surface">
        <header className="border-b border-brand-line px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-text">
          Countries
        </header>
        {countries.length === 0 ? (
          <p className="p-4 text-sm text-brand-muted">No country data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-brand-muted">
              <tr className="border-b border-brand-line">
                <th className="px-4 py-2 text-left">Country</th>
                <th className="px-4 py-2 text-right">Sessions</th>
                <th className="px-4 py-2 text-left">Deepest stage</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.country} className="border-b border-brand-line last:border-b-0">
                  <td className="px-4 py-2 text-brand-text">{c.country}</td>
                  <td className="px-4 py-2 text-right text-brand-text">{c.sessions}</td>
                  <td className="px-4 py-2 text-xs uppercase text-brand-muted">{c.bestStage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-surface">
        <header className="border-b border-brand-line px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-text">
          Top product pages
        </header>
        {topPdps.length === 0 ? (
          <p className="p-4 text-sm text-brand-muted">No PDP views yet.</p>
        ) : (
          <ul className="divide-y divide-brand-line">
            {topPdps.map((p) => {
              const meta = productNames.get(p.id);
              const slug = meta?.slug ?? p.id;
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                  <a href={`/product/${slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-brand-accent">
                    {meta?.name ?? p.id}
                  </a>
                  <span className="text-xs text-brand-muted">{p.sessions} sessions</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
