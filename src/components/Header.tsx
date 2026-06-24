"use client";

import { useEffect, useState } from "react";
import { CartCount } from "./CartCount";
import { MobileDrawer } from "./MobileDrawer";
import { SearchBar } from "./SearchBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useT } from "./LocaleProvider";

export function Header() {
  const t = useT();
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-brand-line bg-brand-bg/95 backdrop-blur transition-shadow duration-200 ${
          scrolled ? "shadow-[0_8px_24px_-12px_rgba(255,179,0,0.25)]" : ""
        }`}
      >
        <div className="mx-auto flex h-32 max-w-6xl items-center gap-2 px-3 sm:h-40 sm:gap-3 sm:px-4">
          <a href="/" aria-label="Hammerex home" className="block shrink-0 p-0">
            <img
              src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png"
              alt="Hammerex"
              className="block h-32 w-auto p-0 sm:h-36"
              style={{ background: "transparent" }}
            />
          </a>

          <div className="hidden flex-1 sm:block">
            <SearchBar id="search" />
            <div className="mt-1 flex items-center gap-2 text-[13px] text-brand-muted">
              <a
                href="/trade-off"
                className="inline-flex items-center gap-1.5 py-2 font-semibold text-brand-accent hover:underline"
              >
                Trade Off →
                <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black">
                  NEW
                </span>
              </a>
              <span className="text-brand-muted/60">•</span>
              <a href="/guides" className="font-semibold text-brand-accent hover:underline">
                Guides →
              </a>
              <span className="text-brand-muted/70">Trade reads from the workshop</span>
            </div>
          </div>

          <div className="flex-1 sm:hidden" />

          <div className="hidden shrink-0 sm:block">
            <LocaleSwitcher />
          </div>

          <a
            href="/cart"
            aria-label={t("nav.cart")}
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <CartCount />
          </a>

          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={t("nav.openMenu")}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div className="border-t border-brand-line bg-brand-bg/95 px-3 py-2 sm:hidden">
          <SearchBar id="search-m" mobile />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-brand-muted">
            <a
              href="/trade-off"
              className="inline-flex items-center gap-1.5 py-2 font-semibold text-brand-accent hover:underline"
            >
              Trade Off →
              <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black">
                NEW
              </span>
            </a>
            <span className="text-brand-muted/60">•</span>
            <a href="/guides" className="font-semibold text-brand-accent hover:underline">
              Guides →
            </a>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
