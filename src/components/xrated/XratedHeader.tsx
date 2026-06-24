// Xrated Trades — standalone header for the public Trade Off surface.
// Shows the Xrated logo, a search bar that posts to /trade-off/search,
// and the "List your trade" CTA on desktop. Used on /trade-off* and
// /trade/* routes. The Hammerex back-link lives in the footer
// (XratedFooter), not here, so focus stays on Xrated.
//
// Pages can pre-fill the search input by passing `defaultQuery` — the
// search results page uses this to echo the current `q` back into the
// box. Most callers render `<XratedHeader />` with no props.

import { XRATED_BRAND } from "@/lib/xratedTrades";

export function XratedHeader({ defaultQuery = "" }: { defaultQuery?: string } = {}) {
  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-4 sm:h-[72px] sm:gap-4">
        <a
          href="/trade-off"
          aria-label={`${XRATED_BRAND.name} home`}
          className="block shrink-0 p-0"
        >
          <img
            src={XRATED_BRAND.logoUrl}
            alt={XRATED_BRAND.name}
            className="block h-10 w-auto object-contain sm:h-12"
            style={{ background: "transparent" }}
          />
        </a>

        <form
          action="/trade-off/search"
          method="get"
          role="search"
          className="flex min-w-0 flex-1 items-center justify-center"
        >
          <label htmlFor="xrated-header-search" className="sr-only">
            Search Xrated Trades
          </label>
          <div className="relative w-full max-w-xl">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-muted"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              id="xrated-header-search"
              type="search"
              name="q"
              defaultValue={defaultQuery}
              placeholder="Search trades, cities, jobs…"
              autoComplete="off"
              maxLength={120}
              className="h-11 w-full rounded-full border border-brand-line bg-black/60 pl-9 pr-3 text-xs text-brand-text placeholder:text-brand-muted focus:border-[#F97316] focus:outline-none sm:text-sm"
            />
          </div>
        </form>

        <a
          href="/trade-off/signup"
          className="hidden shrink-0 text-sm font-bold sm:inline-flex sm:items-center sm:gap-1"
          style={{ color: XRATED_BRAND.accent }}
        >
          List your trade — free <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
