"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const TIPS = [
  "Pick a thread colour on supported holders — adds 2 working days, but you can match any belt.",
  "Buying 2 or 3 of the same product? Some lines auto-discount at the quantity step.",
  "Use Compare (the three-line icon) to put up to 3 products side-by-side on /compare.",
  "Dispatch is 4–5 working days for every item. Air freight transit ~5–7 days worldwide; sea freight ~3–4 weeks (varies by country).",
  "Delivery is quoted by the Hammerex team within 24 hours of checkout — one combined rate for the whole order, never per item.",
  "Heavy-duty leather is fully repairable — we re-stitch and re-rivet your belts at cost."
];

// Hammerex-only top-level path segments. Any single-segment URL NOT in
// this set is treated as the clean-URL form of a public Xrated profile
// (next.config.mjs rewrites `/<slug>` → `/trade/<slug>` behind the
// scenes while the browser path stays as `/<slug>`).
const HAMMEREX_ROOT_SEGMENTS = new Set<string>([
  "c",
  "product",
  "cart",
  "checkout",
  "compare",
  "guides",
  "saved",
  "search",
  "thank-you",
  "hammerex-group",
  "partners",
  "terms-and-conditions",
  "purchasing-tips",
  "building-merchants",
  "scaffolding-tool-belts-uk",
  "hand-tools",
  "hardware-store-direct",
  "tool-bags",
  "tool-belts",
  "new-tools",
  "construction-tools",
  "trade", // B2B portal landing — Hammerex-side
  "admin",
  "api",
  "dev",
  "bundle",
  "t"
]);

function isXratedRoute(pathname: string): boolean {
  // /trade-off and all sub-routes — the SaaS marketing surface
  if (pathname === "/trade-off" || pathname.startsWith("/trade-off/")) return true;
  // /trade/<slug>(/anything) — legacy URL form for public profiles.
  // Excludes /trade/auth|cart|catalogue|checkout|order which are the
  // Hammerex B2B portal sub-routes (those keep the chip).
  const tradeMatch = pathname.match(/^\/trade\/([^/]+)/);
  if (tradeMatch) {
    const seg = tradeMatch[1];
    const portalPaths = new Set(["auth", "cart", "catalogue", "checkout", "order"]);
    if (!portalPaths.has(seg)) return true;
  }
  // /<slug>(/anything) — clean URL form. Treat as Xrated profile unless
  // the first segment is a known Hammerex root (or root itself).
  if (pathname === "/") return false;
  const cleanMatch = pathname.match(/^\/([^/]+)/);
  if (cleanMatch) {
    const seg = cleanMatch[1];
    if (!HAMMEREX_ROOT_SEGMENTS.has(seg)) return true;
  }
  return false;
}

export function TradeTipFooter() {
  const pathname = usePathname() ?? "";
  const [i, setI] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % TIPS.length), 8000);
    return () => window.clearInterval(id);
  }, []);

  // Hide on Xrated surfaces — these tips are Hammerex-shop specific
  // (freight, leather repair, compare dock) and off-context for the
  // tradesperson-SaaS audience.
  if (isXratedRoute(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 pointer-events-none lg:bottom-0">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="pointer-events-auto mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-line bg-brand-bg/95 px-3 py-1.5 text-xs text-brand-muted backdrop-blur">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-accent text-xs font-bold text-black">i</span>
          <span className="truncate transition-opacity duration-300">{TIPS[i]}</span>
        </div>
      </div>
    </div>
  );
}
