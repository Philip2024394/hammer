"use client";

import { useEffect, useState } from "react";
import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";
import { logQuoteClick } from "@/lib/quoteSignals";

export function WhatsAppFAB({ productId, productName, sku }: { productId: string; productName: string; sku: string | null }) {
  const [stickyVisible, setStickyVisible] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
    const sentinel = document.getElementById("pdp-buy-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting), { threshold: 0 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const text = sku
    ? `Hi Hammerex — I'd like to ask about ${productName} (Ref: ${sku}).${pageUrl ? ` ${pageUrl}` : ""}`
    : `Hi Hammerex — I'd like to ask about ${productName}.${pageUrl ? ` ${pageUrl}` : ""}`;
  const href = quoteUrl(text, adminWhatsapp());

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={sku ? `Quote on WhatsApp about Ref ${sku}` : "Quote on WhatsApp"}
      onClick={() => { void logQuoteClick(productId, "pdp_fab"); }}
      className={`fixed right-4 z-30 inline-flex items-center gap-2 rounded-full bg-brand-whatsapp px-4 py-3 text-sm font-bold text-black shadow-[0_12px_32px_-8px_rgba(37,211,102,0.45)] transition-all duration-300 ease-out active:scale-95 hover:opacity-90 md:right-6 ${
        stickyVisible
          ? "bottom-[calc(80px+56px+env(safe-area-inset-bottom))] md:bottom-6"
          : "bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-6"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.5 3.5A11.85 11.85 0 0 0 3 19.7L2 22l2.4-1.05A11.86 11.86 0 1 0 20.5 3.5Zm-8.4 18a9.8 9.8 0 0 1-5-1.36l-.36-.22-2.84.62.6-2.77-.23-.37A9.83 9.83 0 1 1 12.1 21.5Zm5.6-7.32c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.36.22-.66.07-1.78-.89-2.95-1.59-4.12-3.6-.31-.54.31-.5.89-1.67.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.23-.57-.47-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.06 2.89 1.21 3.09.15.2 2.09 3.19 5.07 4.48 1.77.76 2.46.83 3.34.7.54-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden sm:inline">Quote on WhatsApp</span>
      <span className="sm:hidden">Quote</span>
    </a>
  );
}
