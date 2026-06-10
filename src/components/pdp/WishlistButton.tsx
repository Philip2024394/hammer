"use client";

import { useEffect, useState } from "react";

const KEY = "hammerex_wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("hammerex:wishlist"));
}

export function WishlistButton({ productId, label = false }: { productId: string; label?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(read().includes(productId));
    const sync = () => setSaved(read().includes(productId));
    window.addEventListener("hammerex:wishlist", sync);
    return () => window.removeEventListener("hammerex:wishlist", sync);
  }, [productId]);

  const toggle = () => {
    const ids = read();
    const next = saved ? ids.filter((i) => i !== productId) : [...ids, productId];
    write(next);
    setSaved(!saved);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
        saved
          ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
          : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
