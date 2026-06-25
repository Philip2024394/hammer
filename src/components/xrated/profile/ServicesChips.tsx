// Xrated Trades — premium-tier "Services" chip row.
// Server component. Renders the tradie's free-text services_offered array
// as themed chips. v1 is visual-only (no gallery filter wiring yet).
// 44 px tap target, 13 px text floor.

export function ServicesChips({
  services,
  themeColor
}: {
  services: string[];
  themeColor: string;
}) {
  if (!services || services.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
      <h2
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: themeColor }}
      >
        Services
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {services.map((s) => (
          <li key={s}>
            <span
              className="inline-flex h-11 items-center rounded-full border bg-brand-surface px-4 text-[13px] font-semibold text-brand-text"
              style={{ borderColor: themeColor }}
            >
              {s}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
