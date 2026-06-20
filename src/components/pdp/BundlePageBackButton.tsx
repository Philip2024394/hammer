"use client";

import { useRouter } from "next/navigation";

// Returns the buyer to whichever page they came from (browser history),
// falling back to the bundle's anchor product PDP if there's no history
// (e.g. they landed via a direct link from a marketing email).
export function BundlePageBackButton({
  fallbackHref,
  fallbackLabel
}: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const router = useRouter();
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-bold uppercase tracking-widest text-brand-text transition active:scale-95 hover:border-brand-accent hover:text-brand-accent"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back to {fallbackLabel}
    </button>
  );
}
