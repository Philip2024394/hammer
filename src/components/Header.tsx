"use client";

import { useState } from "react";

export function Header() {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 border-b border-brand-line bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <a href="/" className="shrink-0 text-base font-bold tracking-tight text-brand-text">
          Hammerex
        </a>

        <div className="flex-1">
          <label className="sr-only" htmlFor="search">Search products</label>
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-full border border-brand-line bg-brand-surface px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
        </div>

        <button
          type="button"
          aria-label="Cart"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
