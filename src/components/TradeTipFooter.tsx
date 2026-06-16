"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Pick a thread colour on supported holders — adds 2 working days, but you can match any belt.",
  "Buying 2 or 3 of the same product? Some lines auto-discount at the quantity step.",
  "Tap the heart on any card to save it — your wishlist survives across visits, no login needed.",
  "Use Compare (the three-line icon) to put up to 3 products side-by-side on /compare.",
  "Dispatch is ~3 working days for most items (confirmed on the WhatsApp quote). Then 5–6 days transit worldwide.",
  "Flat £20 shipping to UK, USA and Australia — one fee per order via EMS Air Mail. Other countries confirmed on WhatsApp.",
  "Heavy-duty leather is fully repairable — we re-stitch and re-rivet your belts at cost."
];

export function TradeTipFooter() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % TIPS.length), 8000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 pointer-events-none lg:bottom-0">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="pointer-events-auto mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-line bg-brand-bg/95 px-3 py-1.5 text-xs text-brand-muted backdrop-blur">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-accent text-[10px] font-bold text-black">i</span>
          <span className="truncate transition-opacity duration-300">{TIPS[i]}</span>
        </div>
      </div>
    </div>
  );
}
