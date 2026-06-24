"use client";

import { useState, useTransition } from "react";
import { useLocale } from "./LocaleProvider";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n/locales";

// Pill dropdown showing the active language with a flag. Tap → opens a
// small list of the 4 supported locales. Picking one POSTs to
// /api/locale (which writes the `hx_locale` cookie), then reloads so
// every server-rendered string re-resolves in the new locale.

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const active = useLocale();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(next: Locale) {
    if (next === active) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next })
      }).catch(() => {});
      setOpen(false);
      if (typeof window !== "undefined") window.location.reload();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        disabled={pending}
        className={`inline-flex h-11 items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-3 text-xs font-semibold text-brand-text transition hover:border-brand-accent disabled:opacity-50 ${
          compact ? "w-full justify-between" : ""
        }`}
      >
        <span aria-hidden="true">{LOCALE_FLAGS[active]}</span>
        <span>{LOCALE_LABELS[active]}</span>
        <span aria-hidden="true" className={`text-xs transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-1 flex min-w-[200px] flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-bg shadow-lg ${
            compact ? "left-0 right-0" : "right-0"
          }`}
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === active}
                onClick={() => pick(l)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition hover:bg-brand-surface ${
                  l === active ? "bg-brand-accent/10 text-brand-accent" : "text-brand-text"
                }`}
              >
                <span aria-hidden="true">{LOCALE_FLAGS[l]}</span>
                <span>{LOCALE_LABELS[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
