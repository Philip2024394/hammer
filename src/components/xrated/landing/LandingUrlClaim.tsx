"use client";

// Hero URL-claim widget — the visitor types the slug they want for
// their xratedtrade.com/trade/<slug> URL, then clicks Start free trial.
// We slugify live (lowercase, hyphen-separated, no funky characters)
// so the user always sees a valid preview, and we navigate to the
// signup page with the slug pre-populated.

import { useState } from "react";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function LandingUrlClaim() {
  const [raw, setRaw] = useState("");
  const slug = slugify(raw);
  const placeholder = "your-name";

  function go() {
    const target = slug
      ? `/trade-off/signup?slug=${encodeURIComponent(slug)}`
      : "/trade-off/signup";
    window.location.href = target;
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="flex items-stretch overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-[#FFB300]"
      >
        <span className="hidden select-none items-center bg-neutral-50 pl-3 pr-1 text-xs font-bold text-neutral-500 sm:flex sm:text-sm">
          xratedtrade.com/trade/
        </span>
        <input
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={placeholder}
          aria-label="Choose your profile URL"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={60}
          className="h-12 flex-1 bg-white px-3 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none sm:text-base"
        />
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center gap-1.5 px-4 text-xs font-extrabold uppercase tracking-wider text-neutral-900 transition active:scale-[0.97] sm:px-5 sm:text-sm"
          style={{ background: "#FFB300" }}
        >
          Start free trial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </form>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/85 drop-shadow sm:text-sm">
        <span className="font-bold">Your URL:</span>
        <span className="rounded-md bg-black/35 px-2 py-0.5 font-mono text-xs text-white">
          xratedtrade.com/trade/<span style={{ color: "#FFB300" }}>{slug || placeholder}</span>
        </span>
        <span className="text-white/70">— change later if you need to.</span>
      </p>
    </div>
  );
}
