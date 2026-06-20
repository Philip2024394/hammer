"use client";

import { useEffect, useState } from "react";

// Reads sessionStorage.bundleReturn (set by BundleZoomModal when the buyer
// taps "View product"). If present, renders a floating yellow pill at the
// bottom-right of the current PDP letting the buyer hop back to the
// originating product page without losing cart state (cart lives in
// localStorage, untouched by this navigation).
//
// Self-clears on click. Also self-clears if the buyer is already on the
// return URL (no point showing a self-pointing back button).
export function BundleReturnButton() {
  const [target, setTarget] = useState<{ url: string; label: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bundleReturn");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { url: string; label: string };
      if (!parsed?.url || !parsed?.label) return;
      // Don't render the pill if we're already on the return URL.
      if (typeof window !== "undefined" && window.location.pathname === new URL(parsed.url, window.location.origin).pathname) {
        sessionStorage.removeItem("bundleReturn");
        return;
      }
      setTarget(parsed);
    } catch { /* private mode / parse failure — silently hide */ }
  }, []);

  if (!target) return null;

  const onBack = () => {
    try { sessionStorage.removeItem("bundleReturn"); } catch { /* noop */ }
    window.location.href = target.url;
  };

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={`Back to ${target.label}`}
      className="fixed bottom-6 right-4 z-40 grid h-12 max-w-[calc(100vw-32px)] place-items-center rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-wider text-black shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition active:scale-95 hover:opacity-90 sm:right-6"
    >
      <span className="truncate">← Back to {target.label}</span>
    </button>
  );
}
