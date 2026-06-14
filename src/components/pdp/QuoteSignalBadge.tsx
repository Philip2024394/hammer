"use client";

import { useEffect, useState } from "react";
import { fetchQuoteSignal } from "@/lib/quoteSignals";

// Honest "X people quoted this in the last 7 days" badge. Only renders when
// the real count is at or above the display threshold.
export function QuoteSignalBadge({ productId }: { productId: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void fetchQuoteSignal(productId).then((v) => { if (active) setN(v); });
    return () => { active = false; };
  }, [productId]);

  if (n == null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-surface px-2.5 py-1 text-xs text-brand-muted">
      <span className="grid h-2 w-2 place-items-center rounded-full bg-brand-accent" aria-hidden="true" />
      {n} {n === 1 ? "person" : "people"} quoted this in the last 7 days
    </span>
  );
}
