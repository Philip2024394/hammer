"use client";

import { useEffect, useState } from "react";
import { CartCount } from "./CartCount";
import { MobileDrawer } from "./MobileDrawer";
import { WishlistCount } from "./WishlistCount";
import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";

export function Header() {
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = quoteUrl("Hi Hammerex — I have a question about your products.", adminWhatsapp());

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-brand-line bg-brand-bg/95 backdrop-blur transition-shadow duration-200 ${
          scrolled ? "shadow-[0_8px_24px_-12px_rgba(255,179,0,0.25)]" : ""
        }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center gap-2 px-3 sm:h-24 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <a href="/" aria-label="Hammerex home" className="block shrink-0 p-0">
            <img
              src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png"
              alt="Hammerex"
              className="block h-16 w-auto p-0 sm:h-20"
              style={{ background: "transparent" }}
            />
          </a>

          <div className="hidden flex-1 sm:block">
            <label className="sr-only" htmlFor="search">Search products</label>
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="h-11 w-full rounded-full border border-brand-line bg-brand-surface px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div className="flex-1 sm:hidden" />

          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-whatsapp transition hover:border-brand-whatsapp active:scale-95 sm:grid"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.5 3.5A11.85 11.85 0 0 0 3 19.7L2 22l2.4-1.05A11.86 11.86 0 1 0 20.5 3.5Zm-8.4 18a9.8 9.8 0 0 1-5-1.36l-.36-.22-2.84.62.6-2.77-.23-.37A9.83 9.83 0 1 1 12.1 21.5Zm5.6-7.32c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.36.22-.66.07-1.78-.89-2.95-1.59-4.12-3.6-.31-.54.31-.5.89-1.67.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.23-.57-.47-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.06 2.89 1.21 3.09.15.2 2.09 3.19 5.07 4.48 1.77.76 2.46.83 3.34.7.54-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.13-.27-.2-.57-.35Z" />
            </svg>
          </a>

          <a
            href="/saved"
            aria-label="Saved"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <WishlistCount />
          </a>

          <a
            href="/cart"
            aria-label="Cart"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <CartCount />
          </a>
        </div>

        <div className="border-t border-brand-line bg-brand-bg/95 px-3 py-2 sm:hidden">
          <label className="sr-only" htmlFor="search-m">Search products</label>
          <input
            id="search-m"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-full border border-brand-line bg-brand-surface px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
        </div>
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
