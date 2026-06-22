import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Row = { id: string; q: string; results_count: number; country: string | null; created_at: string };

export default async function AdminSearchPage() {
  const since30 = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  const res = await supabaseAdmin
    .from("hammerex_search_queries")
    .select("id,q,results_count,country,created_at")
    .gte("created_at", since30)
    .order("created_at", { ascending: false })
    .limit(1000);
  const rows = (res.data ?? []) as Row[];

  type Agg = { count: number; zero: number; lastAt: string; countries: Set<string> };
  const byQ: Record<string, Agg> = {};
  for (const r of rows) {
    const k = r.q.toLowerCase().trim();
    const a = byQ[k] ?? (byQ[k] = { count: 0, zero: 0, lastAt: r.created_at, countries: new Set() });
    a.count++;
    if (r.results_count === 0) a.zero++;
    if (r.country) a.countries.add(r.country);
    if (new Date(r.created_at) > new Date(a.lastAt)) a.lastAt = r.created_at;
  }
  const ranked = Object.entries(byQ).sort((a, b) => b[1].count - a[1].count);
  const zeroResultRanked = ranked.filter(([, a]) => a.zero > 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Searches · last 30 days</h1>
      <p className="text-sm text-brand-muted">
        {rows.length} total searches · {ranked.length} unique terms · {zeroResultRanked.length} with at least one zero-result hit
      </p>

      <section className="rounded-2xl border border-brand-line bg-brand-surface">
        <header className="border-b border-brand-line px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-text">
          Top terms
        </header>
        {ranked.length === 0 ? (
          <p className="p-4 text-sm text-brand-muted">No searches captured yet. Try the site search bar to seed data.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-brand-muted">
              <tr className="border-b border-brand-line">
                <th className="px-4 py-2 text-left">Query</th>
                <th className="px-4 py-2 text-right">Searches</th>
                <th className="px-4 py-2 text-right">Zero-result</th>
                <th className="px-4 py-2 text-left">Countries</th>
                <th className="px-4 py-2 text-right">Last</th>
              </tr>
            </thead>
            <tbody>
              {ranked.slice(0, 100).map(([q, a]) => (
                <tr key={q} className="border-b border-brand-line last:border-b-0">
                  <td className="px-4 py-2">
                    <a href={`/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-brand-accent">
                      {q}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-right text-brand-text">{a.count}</td>
                  <td className="px-4 py-2 text-right">
                    {a.zero > 0 ? <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">{a.zero}</span> : <span className="text-brand-muted">0</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-brand-muted">{Array.from(a.countries).join(", ") || "—"}</td>
                  <td className="px-4 py-2 text-right text-xs text-brand-muted">{new Date(a.lastAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
