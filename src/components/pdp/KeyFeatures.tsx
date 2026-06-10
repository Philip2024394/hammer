import type { ReactNode } from "react";

type Feature = { icon: string; label: string };

const icons: Record<string, ReactNode> = {
  bolt: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  battery: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2M10 11v2M14 11v2"/></svg>,
  lamp: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4"/><path d="M8 14a6 6 0 1 1 8 0v2H8v-2z"/></svg>,
  chuck: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>,
  gauge: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l4-4"/><path d="M21 12a9 9 0 1 0-18 0"/></svg>,
  weight: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l3 18H3z"/><circle cx="12" cy="10" r="2"/></svg>
};

export function KeyFeatures({ features }: { features: Feature[] | null }) {
  if (!features?.length) return null;
  return (
    <section id="features" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">Key features</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-brand-line bg-brand-surface p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-accent/15 text-brand-accent">
                {icons[f.icon] ?? icons.bolt}
              </span>
              <span className="text-sm leading-snug text-brand-text">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
