"use client";

export function SizeSelector({ sizes, value, onChange, flashFirst = false }: {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  flashFirst?: boolean;
}) {
  if (!sizes.length) return null;
  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-brand-muted">Size</span>
        {value && <span className="text-xs font-semibold text-brand-text">{value}</span>}
      </div>
      <ul className="flex flex-wrap gap-2">
        {sizes.map((s, i) => {
          const isSelected = value === s;
          const shouldFlash = flashFirst && i === 0 && !isSelected;
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => onChange(s)}
                aria-pressed={isSelected}
                className={`min-h-11 min-w-[3rem] rounded-full border px-4 py-2 text-sm font-semibold ${
                  isSelected
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : shouldFlash
                      ? "hx-flash-red"
                      : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
                }`}
              >{s}</button>
            </li>
          );
        })}
      </ul>
      {!value && (
        <p className={`mt-2 text-xs ${flashFirst ? "text-red-400" : "text-brand-muted"}`}>
          {flashFirst ? "Please pick a size — tap one above to continue." : "Select a size to add to cart."}
        </p>
      )}
    </div>
  );
}
