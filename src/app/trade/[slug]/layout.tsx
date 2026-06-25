// Xrated Trades — light-theme wrapper for /trade/<slug> profile pages.
// Scoped to the [slug] segment only — the parent /trade/* tree contains
// Hammerex Trade Portal pages (cart / catalogue / checkout / auth) which
// must stay on the dark Hammerex shop theme.
//
// CSS-var overrides flip every `bg-brand-*` / `text-brand-*` /
// `border-brand-*` Tailwind utility used inside profile components to a
// white surface. XratedHeader (`bg-black/95`) and XratedFooter
// (`bg-black`) hardcode their colours and stay dark.

import type { CSSProperties } from "react";

export default function TradeSlugLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-white text-neutral-900"
      style={
        {
          "--brand-bg": "255 255 255",
          "--brand-surface": "249 250 251",
          "--brand-line": "229 231 235",
          "--brand-text": "17 24 39",
          "--brand-muted": "107 114 128",
          // Match Xrated orange for any `text-brand-accent` consumers.
          "--brand-accent": "249 115 22"
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
