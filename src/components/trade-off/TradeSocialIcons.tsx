// Trade Off social icons row.
// Renders a horizontal strip of brand icons for each social field the tradie
// has populated. Skips any whose helper returns null (so an unset field never
// shows). Order is fixed: Instagram, Facebook, TikTok, YouTube, Website.
//
// Each icon is a 40x40 chip inside a 44x44 tap target (border padding).
// Hover swaps the border to brand-accent. SVGs are inline single-colour glyphs
// in the Simple-Icons style — no extra dependency, no remote fonts.

import {
  TRADE_SOCIAL_FIELDS,
  resolveSocialUrl,
  type TradeSocialKey
} from "@/lib/tradeOffSocial";
import type { HammerexTradeOffListing } from "@/lib/supabase";

type SocialListing = Pick<
  HammerexTradeOffListing,
  "instagram" | "facebook" | "tiktok" | "youtube" | "website"
>;

function iconFor(key: TradeSocialKey) {
  switch (key) {
    case "instagram":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6Z" />
        </svg>
      );
    case "website":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
      );
  }
}

export function TradeSocialIcons({ listing }: { listing: SocialListing }) {
  const items = TRADE_SOCIAL_FIELDS.map((f) => {
    const raw = (listing as Record<string, string | null | undefined>)[f.key];
    const url = resolveSocialUrl(f.key, raw);
    return url ? { key: f.key, label: f.label, url } : null;
  }).filter((x): x is { key: TradeSocialKey; label: string; url: string } => x !== null);

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Social media">
      {items.map((it) => (
        <li key={it.key}>
          <a
            href={it.url}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={it.label}
            title={it.label}
            className="grid h-11 w-11 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
          >
            {iconFor(it.key)}
          </a>
        </li>
      ))}
    </ul>
  );
}
