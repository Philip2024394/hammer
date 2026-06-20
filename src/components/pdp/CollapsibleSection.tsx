"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Reusable yellow-header accordion used by the BuyColumn upsells (thread
// colour, company branding, etc.). Each instance is independent — open one
// doesn't close another, since the upsells are not mutually exclusive.
//
// `selectedLabel` (optional) renders a one-line "selected" badge in the
// closed header so the buyer can see their current pick at a glance without
// expanding.
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
  // Auto-close after a selection is made. We deliberately skip the first
  // render so the slider doesn't slam shut on mount; only react to actual
  // user-driven changes from here on out.
  const isFirstSelectionRender = useRef(true);
  useEffect(() => {
    if (isFirstSelectionRender.current) {
      isFirstSelectionRender.current = false;
      return;
    }
    setOpen(false);
  }, [closeOnSelection]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  // Measure the body height each time it opens so the slide-down transition
  // has a real target value. Also re-measures on window resize and on
  // child-content changes via ResizeObserver so dynamic content (e.g. the
  // company-name input revealing) doesn't get clipped.
  useEffect(() => {
    if (!open || !bodyRef.current) {
      setMaxHeight(0);
      return;
    }
    const measure = () => {
      if (bodyRef.current) setMaxHeight(bodyRef.current.scrollHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(bodyRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [open]);

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
        style={{ maxHeight }}
        className="overflow-hidden bg-brand-surface transition-[max-height] duration-300 ease-out"
      >
        <div ref={bodyRef} className="p-4">
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
  );
}
