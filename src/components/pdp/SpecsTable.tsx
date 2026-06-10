import type { HammerexProductSpec } from "@/lib/supabase";

export function SpecsTable({ specs }: { specs: HammerexProductSpec[] }) {
  if (!specs.length) return null;
  const groups = specs.reduce<Record<string, HammerexProductSpec[]>>((acc, s) => {
    (acc[s.group_name] ||= []).push(s);
    return acc;
  }, {});

  return (
    <section id="specs" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">Specifications</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Object.entries(groups).map(([group, rows]) => (
            <div key={group} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
              <h3 className="border-b border-brand-line bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-muted">{group}</h3>
              <dl className="divide-y divide-brand-line">
                {rows.map((r) => (
                  <div key={r.id} className="grid grid-cols-2 gap-4 px-4 py-3">
                    <dt className="text-xs text-brand-muted">{r.label}</dt>
                    <dd className="text-xs font-medium text-brand-text">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
