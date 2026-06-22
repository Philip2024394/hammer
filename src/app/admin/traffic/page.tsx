import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { funnelFromEvents, summariseSessions, formatMinutes } from "../helpers";

export const dynamic = "force-dynamic";

type Event = {
  event_type: string;
  product_id: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  session_id: string | null;
  path: string | null;
  created_at: string;
};

const DURATION_BUCKETS = [
  { label: "Bounce (< 30s)",  min: 0,    max: 30 },
  { label: "30s – 2m",        min: 30,   max: 120 },
  { label: "2m – 5m",         min: 120,  max: 300 },
  { label: "5m – 15m",        min: 300,  max: 900 },
  { label: "15m+",            min: 900,  max: Infinity }
] as const;

export default async function AdminTrafficPage() {
  const since30 = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  const res = await supabaseAdmin
    .from("hammerex_page_events")
    .select("event_type,product_id,country,city,region,session_id,path,created_at")
    .gte("created_at", since30)
    .order("created_at", { ascending: false })
    .limit(5000);
  const events = (res.data ?? []) as Event[];

  const funnel = funnelFromEvents(events);
  const session = summariseSessions(events);

  const bucketCounts = DURATION_BUCKETS.map(() => 0);
  for (const d of session.durations) {
    for (let i = 0; i < DURATION_BUCKETS.length; i++) {
      const b = DURATION_BUCKETS[i];
      if (d >= b.min && d < b.max) { bucketCounts[i]++; break; }
    }
  }
  const bucketTop = Math.max(1, ...bucketCounts);

  // Country breakdown: unique sessions + deepest funnel stage hit
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

  // City breakdown: keyed by "city|country|region" so identical city
  // names in different regions/countries stay separate.
  type CityRow = { city: string; country: string; region: string | null; sessions: Set<string> };
  const byCity: Record<string, CityRow> = {};
  for (const e of events) {
    if (!e.city) continue;
    const country = (e.country ?? "").toUpperCase();
    const region = e.region ?? null;
    const key = `${e.city}|${country}|${region ?? ""}`;
    const slot = byCity[key] ?? (byCity[key] = { city: e.city, country, region, sessions: new Set() });
    if (e.session_id) slot.sessions.add(e.session_id);
  }
  const cities = Object.values(byCity)
    .map((c) => ({ city: c.city, country: c.country, region: c.region, sessions: c.sessions.size }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25);

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

  const productNames = new Map<string, { name: string; slug: string | null; category_id: string | null }>();
  if (topPdps.length > 0 || Object.keys(byProduct).length > 0) {
    const allProductIds = Array.from(new Set(events.filter((e) => e.product_id).map((e) => e.product_id as string)));
    if (allProductIds.length > 0) {
      const pr = await supabaseAdmin
        .from("hammerex_products")
        .select("id,name,slug,category_id")
        .in("id", allProductIds);
      for (const p of (pr.data ?? []) as { id: string; name: string; slug: string | null; category_id: string | null }[]) {
        productNames.set(p.id, { name: p.name, slug: p.slug, category_id: p.category_id });
      }
    }
  }

  // Category breakdown: every PDP view attributed to its product's
  // primary category. Each category page view (path starts with /c/) is
  // also counted by matching the slug against the categories list.
  const categoryRes = await supabaseAdmin
    .from("hammerex_categories")
    .select("id, slug, name");
  const cats = (categoryRes.data ?? []) as { id: string; slug: string; name: string }[];
  const catById = new Map(cats.map((c) => [c.id, c]));
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const sessionsByCategory: Record<string, Set<string>> = {};
  for (const e of events) {
    let catId: string | null = null;
    if (e.event_type === "pdp_view" && e.product_id) {
      catId = productNames.get(e.product_id)?.category_id ?? null;
    } else if (e.path && e.path.startsWith("/c/")) {
      const slug = e.path.replace(/^\/c\//, "").split(/[/?#]/)[0];
      catId = catBySlug.get(slug)?.id ?? null;
    }
    if (!catId || !e.session_id) continue;
    (sessionsByCategory[catId] ?? (sessionsByCategory[catId] = new Set())).add(e.session_id);
  }
  const topCategories = Object.entries(sessionsByCategory)
    .map(([id, s]) => ({ id, sessions: s.size, meta: catById.get(id) }))
    .filter((c) => c.meta)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Traffic · last 30 days</h1>

      <section className="rounded-2xl border border-brand-line bg-brand-surface p-4">
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Time on site</h2>
          <span className="text-xs text-brand-muted">
            {session.totalSessions} sessions · avg {formatMinutes(session.avgSeconds)} · median {formatMinutes(session.medianSeconds)}
          </span>
        </header>
        {session.totalSessions === 0 ? (
          <p className="text-sm text-brand-muted">No session data yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {DURATION_BUCKETS.map((b, i) => {
              const n = bucketCounts[i];
              const pct = Math.round((n / bucketTop) * 100);
              return (
                <li key={b.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-text">{b.label}</span>
                    <span className="text-brand-muted">{n} {n === 1 ? "session" : "sessions"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-bg">
                    <div className="h-full bg-brand-accent" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            Cities
          </header>
          {cities.length === 0 ? (
            <p className="p-4 text-sm text-brand-muted">
              No city data yet. Vercel deploys populate city automatically; localhost and free-tier Cloudflare don&rsquo;t.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-brand-muted">
                <tr className="border-b border-brand-line">
                  <th className="px-4 py-2 text-left">City</th>
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c) => (
                  <tr key={`${c.city}-${c.region}-${c.country}`} className="border-b border-brand-line last:border-b-0">
                    <td className="px-4 py-2 text-brand-text">{c.city}</td>
                    <td className="px-4 py-2 text-xs text-brand-muted">{c.region ?? "—"}</td>
                    <td className="px-4 py-2 text-xs text-brand-muted">{c.country || "??"}</td>
                    <td className="px-4 py-2 text-right text-brand-text">{c.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-brand-line bg-brand-surface">
        <header className="border-b border-brand-line px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-text">
          Top categories
        </header>
        {topCategories.length === 0 ? (
          <p className="p-4 text-sm text-brand-muted">No category traffic yet.</p>
        ) : (
          <ul className="divide-y divide-brand-line">
            {topCategories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <a href={`/c/${c.meta?.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-brand-accent">
                  {c.meta?.name ?? c.id}
                </a>
                <span className="text-xs text-brand-muted">{c.sessions} sessions</span>
              </li>
            ))}
          </ul>
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
