export function WarrantyTimeline({ warrantyYears }: { warrantyYears: number }) {
  const steps = [
    { n: "01", t: "Receive your tool", d: "Track shipment to your door. Open carefully — keep the box for 30 days." },
    { n: "02", t: "Register within 30 days", d: "Enter your serial number on the warranty portal to unlock the full term." },
    { n: "03", t: `Use it for ${warrantyYears} year${warrantyYears === 1 ? "" : "s"}`, d: "Covered against manufacturing defects, parts and labour." },
    { n: "04", t: "Need service? Submit a claim", d: "Pre-paid return label. Repair or replace within 5 business days of receipt." }
  ];
  return (
    <section id="warranty" className="border-t border-brand-line py-6">
      <div className="mx-auto max-w-6xl px-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3">
            <h2 className="text-lg font-semibold text-brand-text">{warrantyYears}-year warranty journey</h2>
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black transition group-open:rotate-180">▾</span>
          </summary>
          <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-brand-line bg-brand-surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-accent text-xs font-bold text-black">{s.n}</span>
                <h3 className="text-sm font-semibold text-brand-text">{s.t}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted">{s.d}</p>
              {i < steps.length - 1 && (
                <span className="absolute right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-brand-accent/40 lg:block" />
              )}
            </li>
          ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
