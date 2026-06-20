"use client";

import { useEffect, useState } from "react";
import { formatPrice, type Currency } from "@/lib/fx";
import type { CustomBrandingConfig } from "@/lib/customBranding";

// Renders the "Your Company Brand Name" upsell in the BuyColumn — sits next
// to the thread-colour picker. When enabled, the buyer types their company
// name; the cart line carries that name through to the WhatsApp quote so
// the artwork team knows exactly what to print. The +£10 upcharge is added
// at the unit-price stage in BuyColumn.
export function CustomBrandingSection({
  config,
  enabled,
  onToggle,
  name,
  onNameChange,
  currency
}: {
  config: CustomBrandingConfig;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  name: string;
  onNameChange: (next: string) => void;
  currency: Currency;
}) {
  const [zoom, setZoom] = useState(false);
  // Whether the company-name input has received focus yet. Used to flash
  // the input with the rim-flash animation until the buyer taps it.
  const [hasFocusedName, setHasFocusedName] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  return (
    <div className="rounded-xl border border-brand-line bg-black/40 p-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-brand-text">Your company brand name</span>
          <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">
            +{formatPrice(config.priceIdr, currency)} each · artwork included
          </span>
        </div>
        <p className="text-xs leading-relaxed text-brand-muted">
          Add your company name + logo to each belt holder. Hammerex&apos;s X stays on the
          two sliders. Artwork support is included — <span className="font-semibold text-brand-text">our admin will confirm
          all branding details with you at checkout</span> and send a mock-up for approval before
          production starts.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary toggle — replaces the previous checkbox so the choice
              is read as an action button (better tap-target + clearer
              affordance on mobile). Pressed/active state inverts colours. */}
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            aria-pressed={enabled}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-widest transition active:scale-95 ${
              enabled
                ? "bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] hover:opacity-90"
                : "border-2 border-brand-accent bg-transparent text-brand-accent hover:bg-brand-accent/10"
            }`}
          >
            {enabled ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Branding added — type your name
              </>
            ) : (
              "Add custom branding"
            )}
          </button>
        </div>
      </div>

      {zoom && config.sampleImageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Logo placement reference"
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.sampleImageUrl}
            alt="Logo placement on the scaffolding belt — full view"
            onClick={(e) => e.stopPropagation()}
            className="block max-h-[88vh] max-w-full rounded-xl object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Close enlarged view"
            className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >×</button>
        </div>
      )}

      {enabled && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          {config.sampleImageUrl && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-32">
              <div
                aria-hidden="true"
                className="grid h-32 w-full place-items-center overflow-hidden rounded-lg border border-brand-line bg-black sm:h-28"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.sampleImageUrl}
                  alt="Logo placement reference"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <button
                type="button"
                onClick={() => setZoom(true)}
                aria-label="Enlarge logo placement reference"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black shadow-[0_1px_6px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
                View example
              </button>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Company name (max 24 characters)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value.slice(0, 24))}
              onFocus={() => setHasFocusedName(true)}
              placeholder="Enter your company name here"
              maxLength={24}
              // Flash with the brand-accent rim animation until the buyer
              // taps the field, so they don't miss that they still need to
              // type their company name after enabling branding. The
              // placeholder is bumped to a brighter brand-accent tint so
              // the instruction reads as a call to action, not greyed-out
              // hint text.
              className={`h-11 rounded-lg border bg-brand-surface px-3 text-sm text-brand-text outline-none placeholder:font-semibold placeholder:text-brand-accent/70 focus:border-brand-accent ${
                !hasFocusedName && !name.trim()
                  ? "hx-rim-flash border-brand-accent"
                  : "border-brand-line"
              }`}
              aria-label="Company name to print on the belt"
            />
            <p className="text-xs text-brand-muted">
              <span className="font-semibold text-brand-accent">Our admin will confirm all details with you at checkout</span> —
              you&apos;ll send your logo file on WhatsApp, we&apos;ll send a mock-up for approval, and only then
              do we cut and stitch. Nothing is locked in until you sign off.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
