"use client";

import { useEffect, useState } from "react";

// Renders the belt-waist-size pill row that appears underneath the trowel
// size selector when the active variant includes a leather belt. The first
// pill flashes red (`hx-flash-red`) when `flashFirst` is true, matching the
// SizeSelector pattern. A "View size guide" button opens a lightbox of the
// belt-measure illustration.
export function BeltSizeSelector({
  sizes,
  value,
  onChange,
  guideUrl,
  flashFirst = false
}: {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  guideUrl: string;
  flashFirst?: boolean;
}) {
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setGuideOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [guideOpen]);

  if (!sizes.length) return null;

  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-3" id="hx-belt-size-selector">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-brand-muted">
          Belt waist size{" "}
          <span className="ml-1 text-xs text-brand-text">— made to fit</span>
        </span>
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-xs ${flashFirst && !value ? "text-red-400" : "text-brand-muted"}`}>
          {flashFirst && !value
            ? "Please pick your waist size — tap one above to continue."
            : "Belt is cut to fit your waist — no excess strap."}
        </p>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
        >
          {/* Ruler/tape-measure icon — three short tick marks on a horizontal
              rule. Pure stroke so it inherits the button's black text colour
              cleanly on the yellow surface. */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="9" width="20" height="6" rx="1" />
            <line x1="6" y1="9" x2="6" y2="12" />
            <line x1="10" y1="9" x2="10" y2="13" />
            <line x1="14" y1="9" x2="14" y2="12" />
            <line x1="18" y1="9" x2="18" y2="13" />
          </svg>
          View size guide
        </button>
      </div>

      {guideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Belt size guide"
          onClick={() => setGuideOpen(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guideUrl}
            alt="How to measure your waist for the leather belt"
            onClick={(e) => e.stopPropagation()}
            className="block max-h-[88vh] max-w-full rounded-xl object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            aria-label="Close size guide"
            className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >×</button>
        </div>
      )}
    </div>
  );
}
