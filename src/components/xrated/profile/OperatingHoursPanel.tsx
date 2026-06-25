// Xrated Trades — premium-tier "Operating hours" panel.
// Server component: pure render from the `operating_hours` jsonb.
// Highlights today's row in brand orange. Days missing render "Closed".

type Hours = { open: string; close: string } | null;
type HoursMap = Record<string, Hours>;

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" }
];

// Date.getDay() — 0 = Sunday … 6 = Saturday
const DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function todayKey(): string {
  return DAY_KEY_BY_INDEX[new Date().getDay()];
}

export function OperatingHoursPanel({
  hours,
  themeColor
}: {
  hours: HoursMap;
  themeColor: string;
}) {
  const keys = Object.keys(hours || {});
  if (keys.length === 0) return null;

  const today = todayKey();

  return (
    <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
      <h2
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: themeColor }}
      >
        Operating hours
      </h2>
      <ul className="mt-3 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface/40">
        {DAYS.map(({ key, label }) => {
          const slot = hours[key] ?? null;
          const isToday = key === today;
          const text =
            slot && slot.open && slot.close ? `${slot.open} – ${slot.close}` : "Closed";
          return (
            <li
              key={key}
              className="flex items-center justify-between border-b border-brand-line/40 px-4 py-3 last:border-b-0"
              style={
                isToday
                  ? { background: `${themeColor}1A`, color: themeColor }
                  : undefined
              }
            >
              <span
                className={`text-[13px] font-semibold ${
                  isToday ? "" : "text-brand-text"
                }`}
              >
                {label}
                {isToday && (
                  <span className="ml-2 text-[11px] font-bold uppercase tracking-wide opacity-80">
                    Today
                  </span>
                )}
              </span>
              <span
                className={`text-[13px] ${
                  isToday ? "font-bold" : slot ? "text-brand-text" : "text-brand-muted"
                }`}
              >
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
