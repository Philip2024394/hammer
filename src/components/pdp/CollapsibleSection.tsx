"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Reusable yellow-header accordion used by the BuyColumn upsells (thread
// colour, company branding, etc.). Each instance is independent — open one
// doesn't close another, since the upsells are not mutually exclusive.
//
// `selectedLabel` (optional) renders a one-line "selected" badge in the
// closed header so the buyer can see their current pick at a glance without
// expanding.
//
// Height animation uses the CSS-grid `1fr ↔ 0fr` trick rather than a
// JS-measured max-height. That avoids any chance of a stale measurement
// pinning the body to zero height (which was happening intermittently in
// Strict-Mode dev with ResizeObserver).
export function CollapsibleSection({
  title,
  selectedLabel,
  defaultOpen = false,
  closeOnSelection,
  children
}: {
  title: string;
  selectedLabel?: string | null;
  defaultOpen?: boolean;
  /**
   * When this value changes (from its previous value, ignoring the first
   * render), the slider auto-collapses. Use for "made a selection → close
   * the slider" UX. Pass the currently-selected option / state, e.g.
   * `closeOnSelection={threadColor}` for the thread picker.
   */
  closeOnSelection?: unknown;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Auto-close on selection change. Compare against the initial value
  // captured in a ref (rather than a "first render" flag), so Strict-Mode's
  // double-effect mount can't accidentally trigger a setOpen(false) on
  // initial mount.
  const lastSelectionRef = useRef(closeOnSelection);
  useEffect(() => {
    if (lastSelectionRef.current === closeOnSelection) return;
    lastSelectionRef.current = closeOnSelection;
    setOpen(false);
  }, [closeOnSelection]);

  const safeId = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const headerId = `collapsible-${safeId}-header`;
  const bodyId = `collapsible-${safeId}-body`;

  return (
    <div className={`overflow-hidden rounded-xl border ${
      selectedLabel ? "border-brand-accent shadow-[0_0_0_1px_rgba(255,179,0,0.35)]" : "border-brand-line"
    }`}>
      <button
        type="button"
        id={headerId}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-3 bg-brand-accent px-4 py-3 text-left text-black transition active:scale-[0.995] hover:opacity-95"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
          {selectedLabel && (
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {selectedLabel}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/15 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        className="grid bg-brand-surface transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            {/* "Optional" tag — bold red, sits as the first piece of text in
                every collapsible body so the buyer instantly understands the
                section is an opt-in upgrade, not a required choice. */}
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-400">
              Optional
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
