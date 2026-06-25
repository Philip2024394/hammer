"use client";

// Xrated Trades — premium-tier priced services horizontal carousel.
// Cards: image (4:3), service name, price + unit, Enquire link → WhatsApp.
//
// Auto-scrolls slowly to the LEFT (continuous marquee). The cards list is
// duplicated once so the translate loops seamlessly. Pause on hover (desktop)
// and pause-on-touch (mobile) so users can read + tap Enquire.

import { useEffect, useRef, useState } from "react";

type PricedService = {
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
};

function formatPrice(price: number, unit: string): string {
  const amount = `£${price.toLocaleString("en-GB")}`;
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
  const [paused, setPaused] = useState(false);
  const animationId = useRef(`xrated-marquee-${Math.random().toString(36).slice(2, 8)}`).current;

  // Tune the scroll speed by total cards — more cards, longer cycle so the
  // velocity per card stays roughly constant. ~12s per card feels right.
  const durationSeconds = Math.max(20, services.length * 12);

  useEffect(() => {
    // Make sure the user can read again shortly after their finger lifts.
    if (!paused) return;
    const t = window.setTimeout(() => setPaused(false), 2000);
    return () => window.clearTimeout(t);
  }, [paused]);

  if (!services || services.length === 0) return null;

  function enquireHref(svc: PricedService): string {
    const text = `Hi — interested in ${svc.name} (${formatPrice(svc.price, svc.unit)}). Can you confirm availability?`;
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }

  // Render the list twice in sequence. The keyframe translates the entire
  // track by exactly -50% so when the second copy lands where the first
  // started, the loop restarts invisibly.
  const cards = [...services, ...services];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
      <div>
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Priced services
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Auto-scrolls — hover or tap a card to pause and read. Tap Enquire to message direct on WhatsApp.
        </p>
      </div>

      <div
        className="relative mt-4 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <ul
          className={`flex w-max gap-4 pb-3`}
          style={{
            animation: `${animationId} ${durationSeconds}s linear infinite`,
            animationPlayState: paused ? "paused" : "running"
          }}
        >
          {cards.map((svc, i) => (
            <li
              key={`${svc.name}-${i}`}
              className="w-[85vw] shrink-0 sm:w-[360px] lg:w-[320px]"
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
                  <h3 className="text-[13px] font-bold text-brand-text">{svc.name}</h3>
                  <p className="text-[13px] font-bold" style={{ color: themeColor }}>
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
      </div>

      <style>{`
        @keyframes ${animationId} {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="${animationId}"] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default PricedServicesCarousel;
