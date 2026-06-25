"use client";

// Xrated Trades — premium-tier priced services horizontal carousel.
// Cards: image (4:3), service name, price + unit, Enquire link → WhatsApp.
// 1-up mobile, 2-up sm, 3-up lg. Snap-scroll with prev/next buttons.

import { useCallback, useRef } from "react";

type PricedService = {
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
};

function formatPrice(price: number, unit: string): string {
  // £ is canonical for Xrated Trades (UK directory). FX is indicative
  // elsewhere; service quotes are explicitly UK-priced.
  const amount = `£${price.toLocaleString("en-GB")}`;
  // Unit examples: "per project", "per m²", "per hour", "per day", "from".
  if (!unit) return amount;
  const u = unit.trim();
  if (u.toLowerCase() === "from") return `From ${amount}`;
  return `${amount} ${u}`;
}

export function PricedServicesCarousel({
  services,
  whatsappBase,
  themeColor
}: {
  services: PricedService[];
  whatsappBase: string;
  themeColor: string;
}) {
  const scrollerRef = useRef<HTMLUListElement | null>(null);

  const scrollByCards = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-priced-card]");
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.9;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (!services || services.length === 0) return null;

  function enquireHref(svc: PricedService): string {
    // Prefill the WA message with the service name and price hint.
    const text = `Hi — interested in ${svc.name} (${formatPrice(svc.price, svc.unit)}). Can you confirm availability?`;
    // whatsappBase is `https://wa.me/<digits>` (no ?text= attached yet)
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: themeColor }}
          >
            Priced services
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Swipe — tap Enquire to message direct on WhatsApp.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => scrollByCards(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="More services"
            onClick={() => scrollByCards(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        ref={scrollerRef}
        className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((svc, i) => (
          <li
            key={`${svc.name}-${i}`}
            data-priced-card
            className="snap-start shrink-0 basis-[88%] sm:basis-[48%] lg:basis-[32%]"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface/40">
              <div className="relative aspect-[4/3] w-full bg-black">
                {svc.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={svc.image_url}
                    alt={svc.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-brand-muted">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-[13px] font-bold text-brand-text">
                  {svc.name}
                </h3>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: themeColor }}
                >
                  {formatPrice(svc.price, svc.unit)}
                </p>
                <a
                  href={enquireHref(svc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-brand-line bg-black/30 px-3 text-[13px] font-bold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                >
                  Enquire
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PricedServicesCarousel;
