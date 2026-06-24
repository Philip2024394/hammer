"use client";

import { useEffect, useState } from "react";
import { formatPriceForRegion, type Currency } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import type { BeltUpgradeConfig, BeltUpgradeOption, BeltUpgradeOptionId } from "@/lib/beltUpgrade";
import { CollapsibleSection } from "./CollapsibleSection";

// Belt-set upgrade picker. Sits inside ONE yellow accordion (matches the
// width of Thread colour / Brand name / Pro Trade Cover sliders). Inside,
// the two options are presented as picks — the buyer can choose one or
// keep the standard belt. Tapping the magnifier on a row opens a popup
// with the rich details for that specific upgrade.
export function BeltUpgradeSection({
  config,
  selected,
  onSelect,
  currency
}: {
  config: BeltUpgradeConfig;
  selected: BeltUpgradeOptionId | null;
  onSelect: (next: BeltUpgradeOptionId | null) => void;
  currency: Currency;
}) {
  const country = useCountry();
  const [openDetails, setOpenDetails] = useState<BeltUpgradeOption | null>(null);

  // Esc-to-close + body scroll lock while the popup is open.
  useEffect(() => {
    if (!openDetails) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenDetails(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openDetails]);

  const activeLabel = selected
    ? config.options.find((o) => o.id === selected)?.label ?? null
    : null;
  const activePrice = selected
    ? config.options.find((o) => o.id === selected)?.priceIdr ?? 0
    : 0;

  return (
    <CollapsibleSection
      title={config.title}
      selectedLabel={
        activeLabel
          ? `Selected: ${activeLabel} · +${formatPriceForRegion(activePrice, currency, country)}`
          : "Optional · standard belt included by default"
      }
      closeOnSelection={selected}
    >
      <p className="mb-3 text-xs leading-relaxed text-brand-muted">{config.subtitle}</p>

      <ul className="flex flex-col gap-2">
        {config.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <li
              key={opt.id}
              className={`flex flex-col gap-3 rounded-lg border bg-black/20 p-3 sm:flex-row sm:items-stretch ${
                isSelected ? "border-brand-accent" : "border-brand-line"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenDetails(opt)}
                aria-label={`View ${opt.label} details`}
                className={`relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-32 ${opt.tileBgClass ?? "bg-black"}`}
              >
                {opt.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    className="absolute inset-0 h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs uppercase tracking-widest text-brand-muted">
                    Image coming soon
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand-accent text-black shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.5" y2="16.5" />
                  </svg>
                </span>
              </button>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-text">{opt.label}</span>
                  <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-bold text-brand-accent">
                    +{formatPriceForRegion(opt.priceIdr, currency, country)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-brand-muted">{opt.oneLine}</p>
                <button
                  type="button"
                  onClick={() => onSelect(isSelected ? null : opt.id)}
                  aria-pressed={isSelected}
                  className={`mt-auto h-10 rounded-full text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                    isSelected
                      ? "bg-brand-accent text-black hover:opacity-90"
                      : "border border-brand-accent bg-transparent text-brand-accent hover:bg-brand-accent/10"
                  }`}
                >
                  {isSelected ? "Selected ✓ — tap to remove" : "Choose this upgrade"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-3 text-xs font-semibold text-brand-accent hover:opacity-80"
        >Keep standard belt instead</button>
      )}

      {openDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openDetails.label}
          onClick={() => setOpenDetails(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-bg"
          >
            <header className="flex items-start justify-between gap-3 border-b border-brand-line bg-brand-accent/10 px-5 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Belt upgrade</span>
                <h2 className="text-lg font-bold text-brand-text">{openDetails.details.heading}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenDetails(null)}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
              >×</button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {openDetails.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={openDetails.imageUrl}
                  alt={openDetails.label}
                  className={`block aspect-[4/3] w-full object-contain p-3 ${openDetails.tileBgClass ?? "bg-black"}`}
                />
              )}
              <div className="flex flex-col gap-3 p-5">
                {openDetails.details.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-brand-muted">{p}</p>
                ))}
                <ul className="mt-1 flex flex-col gap-1.5 text-sm leading-relaxed text-brand-muted">
                  {openDetails.details.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-brand-accent" aria-hidden="true">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-brand-line bg-brand-surface px-5 py-3">
              <span className="text-sm font-bold text-brand-text">
                +{formatPriceForRegion(openDetails.priceIdr, currency, country)} <span className="text-xs font-medium text-brand-muted">upgrade</span>
              </span>
              <button
                type="button"
                onClick={() => { onSelect(selected === openDetails.id ? null : openDetails.id); setOpenDetails(null); }}
                className="h-11 rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-wider text-black transition active:scale-95 hover:opacity-90"
              >
                {selected === openDetails.id ? "Remove upgrade" : "Add upgrade"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
