// Xrated Trades — premium-tier FAQ accordion.
// Server component using native <details>/<summary> for collapse behaviour
// (no JS required). Visual lifted from the guides FAQ section.

export function FaqAccordion({
  items,
  themeColor
}: {
  items: { q: string; a: string }[];
  themeColor: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
      <h2
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: themeColor }}
      >
        FAQ
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        The questions customers ask before booking.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-brand-line bg-brand-surface p-4 open:bg-brand-bg"
          >
            <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-3 text-[13px] font-semibold text-brand-text">
              <span>{f.q}</span>
              <span
                aria-hidden="true"
                className="mt-0.5 inline-block shrink-0 rounded-full px-2 text-xs font-bold transition group-open:rotate-45"
                style={{ background: `${themeColor}26`, color: themeColor }}
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-[13px] leading-relaxed text-brand-muted">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
