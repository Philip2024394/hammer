"use client";

export function SizeSelector({ sizes, value, onChange }: {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
}) {
  if (!sizes.length) return null;
  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-brand-muted">Size</span>
        {value && <span className="text-xs font-semibold text-brand-text">{value}</span>}
      </div>
      <ul className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onChange(s)}
              aria-pressed={value === s}
              className={`min-w-[3rem] rounded-full border px-4 py-2 text-sm font-semibold ${
                value === s
                  ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                  : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
              }`}
            >{s}</button>
          </li>
        ))}
      </ul>
      {!value && <p className="mt-2 text-[11px] text-brand-muted">Select a size to add to cart.</p>}
    </div>
  );
}
