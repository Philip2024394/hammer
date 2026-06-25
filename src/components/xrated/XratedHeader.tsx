"use client";

// Xrated Trades — standalone header for the public Trade Off surface.
// Logo on the left. "List your trade" CTA on the right — but hidden on
// individual tradesperson profile pages (`/trade/<slug>`) since those are
// the "premium app" surface and the sign-up nudge is off-brand there.
// Search lives BELOW the header on the landing page (see SearchHero).

import { usePathname } from "next/navigation";
import { XRATED_BRAND } from "@/lib/xratedTrades";

export function XratedHeader() {
  const pathname = usePathname() ?? "";
  // /trade/<slug> = tradesperson profile (premium app surface) → hide CTA.
  // /trade-off/* paths keep the CTA so customers can still sign up.
  const isProfilePage = pathname.startsWith("/trade/");

  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-4">
        <a
          href="/trade-off"
          aria-label={`${XRATED_BRAND.name} home`}
          className="block shrink-0 p-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XRATED_BRAND.logoUrl}
            alt={XRATED_BRAND.name}
            className="block h-10 w-auto object-contain sm:h-12"
            style={{ background: "transparent" }}
          />
        </a>

        {!isProfilePage && (
          <a
            href="/trade-off/signup"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-bold sm:h-12 sm:px-4 sm:text-sm"
            style={{ color: XRATED_BRAND.accent, minHeight: 44 }}
          >
            <span className="sm:hidden">List your trade</span>
            <span className="hidden sm:inline">
              List your trade — free <span aria-hidden="true">→</span>
            </span>
          </a>
        )}
      </div>
    </header>
  );
}
