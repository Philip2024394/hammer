// Xrated Trades — standalone header for the public Trade Off surface.
// Only the Xrated logo is shown; no Hammerex chrome, no search, no cart.
// Used on /trade-off* and /trade/* routes. The Hammerex back-link lives
// in the footer (XratedFooter), not here, so focus stays on Xrated.

import { XRATED_BRAND } from "@/lib/xratedTrades";

export function XratedHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px]">
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

        <a
          href="/trade-off/signup"
          className="hidden text-sm font-bold sm:inline-flex sm:items-center sm:gap-1"
          style={{ color: XRATED_BRAND.accent }}
        >
          List your trade — free <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
