import type { ReactNode } from "react";
import type { HammerexProductSpec } from "@/lib/supabase";

export function SpecsTable({ specs }: { specs: HammerexProductSpec[] }) {
  if (!specs.length) return null;
  const groups = specs.reduce<Record<string, HammerexProductSpec[]>>((acc, s) => {
    (acc[s.group_name] ||= []).push(s);
    return acc;
  }, {});
  const entries = Object.entries(groups);

  return (
    <section id="specs" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">Specifications</h2>
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
          {entries.map(([group, rows], i) => (
            <div key={group} className={i > 0 ? "border-t border-brand-line" : ""}>
              <h3 className="flex items-center gap-2 border-b border-brand-line bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-accent">
                <span className="text-brand-accent">{groupIcon(group)}</span>
                {group}
              </h3>
              <dl className="divide-y divide-brand-line">
                {rows.map((r) => (
                  <div key={r.id} className="flex flex-col gap-0.5 px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4">
                    <dt className="text-xs uppercase tracking-wider text-brand-muted">{r.label}</dt>
                    <dd className="text-sm font-medium text-brand-text sm:text-xs">{r.value}</dd>
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

const ICON_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

function groupIcon(group: string): ReactNode {
  const g = group.toLowerCase();
  if (g.includes("capacity"))      return <svg {...ICON_PROPS}><path d="M3 8h13l5 5v3h-2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M3 8v10h2" /></svg>;
  if (g.includes("material"))      return <svg {...ICON_PROPS}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>;
  if (g.includes("handle"))        return <svg {...ICON_PROPS}><path d="M4 12a8 8 0 0 1 16 0" /><path d="M4 12v4M20 12v4" /></svg>;
  if (g.includes("fasten"))        return <svg {...ICON_PROPS}><rect x="3" y="9" width="18" height="6" rx="1" /><path d="M7 9V7a5 5 0 0 1 10 0v2" /></svg>;
  if (g.includes("compat") || g.includes("fit")) return <svg {...ICON_PROPS}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>;
  if (g.includes("dimension") || g.includes("physical")) return <svg {...ICON_PROPS}><path d="M3 21V3h18" /><path d="M3 9h6M3 15h6M9 21v-6M15 21v-6" /></svg>;
  if (g.includes("use"))           return <svg {...ICON_PROPS}><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-3-6.7" /></svg>;
  if (g.includes("care"))          return <svg {...ICON_PROPS}><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>;
  if (g.includes("build"))         return <svg {...ICON_PROPS}><path d="M14 6l4 4-8 8H6v-4z" /><path d="M14 6l3-3 4 4-3 3" /></svg>;
  return <svg {...ICON_PROPS}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" /></svg>;
}
