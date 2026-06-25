"use client";

// Xrated Trades — Services-as-tabs gallery.
//
// Replaces the old standalone "Our Services" icon row + "Pricing"
// carousel. Each service becomes a tab; clicking a tab swaps the
// content card below to that service's images + description +
// optional price + Enquire button. Cover image opens a lightbox with
// every photo for that service.
//
// Data source: priced_services rows when populated (they carry image
// / description / price). When a tradesperson only has services_offered
// (string labels), we still render text-only tabs with a "Contact for
// a quote" card so the section never looks empty.

import { useCallback, useEffect, useRef, useState } from "react";
import { TradeIcon } from "@/lib/tradeIcons";
import { EnquireButton } from "./EnquireButton";

export type PricedService = {
  name: string;
  image_url: string | null;
  image_urls?: string[];
  price: number;
  unit: string;
  description?: string | null;
};

function imagesOf(svc: PricedService): string[] {
  const all = [svc.image_url, ...(svc.image_urls ?? [])].filter(
    (u): u is string => !!u
  );
  return Array.from(new Set(all)).slice(0, 3);
}

type Tab = {
  name: string;
  service: PricedService | null;
};

export function ServicesTabbedGallery({
  slug,
  pricedServices,
  servicesOffered
}: {
  slug: string;
  pricedServices: PricedService[];
  servicesOffered: string[];
}) {
  // Build the tab list — priced rows first (richer), then any text-only
  // services_offered that aren't already represented by a priced row.
  const tabs: Tab[] = (() => {
    const pricedByName = new Map(
      pricedServices.map((p) => [p.name.toLowerCase(), p])
    );
    const out: Tab[] = pricedServices.map((p) => ({
      name: p.name,
      service: p
    }));
    for (const name of servicesOffered) {
      if (!pricedByName.has(name.toLowerCase())) {
        out.push({ name, service: null });
      }
    }
    return out;
  })();

  const [active, setActive] = useState(0);
  const [gridMode, setGridMode] = useState(false);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    startIndex: number;
    service: PricedService;
  } | null>(null);

  if (tabs.length === 0) return null;
  const safeActive = Math.min(active, tabs.length - 1);
  const current = tabs[safeActive];

  function openLightbox(svc: PricedService, startIndex: number) {
    const imgs = imagesOf(svc);
    if (imgs.length === 0) return;
    setLightbox({ images: imgs, startIndex, service: svc });
  }

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          Our Services
        </h2>
        <button
          type="button"
          onClick={() => setGridMode((v) => !v)}
          aria-label={gridMode ? "Show tabs" : "Compare all services"}
          aria-expanded={gridMode}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition active:scale-[0.97]"
          style={{ background: "#FFB300" }}
        >
          {gridMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          )}
        </button>
      </div>

      {/* Tab row */}
      <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
        {tabs.map((t, i) => {
          const isActive = !gridMode && i === safeActive;
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => {
                setGridMode(false);
                setActive(i);
              }}
              aria-pressed={isActive}
              className="flex flex-col items-center gap-2 text-center transition"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-[#FFB300] text-neutral-900 ring-2 ring-[#FFB300]"
                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
              >
                <span className="h-7 w-7">
                  <TradeIcon name={t.name} />
                </span>
              </span>
              <span
                className={`max-w-[5.5rem] truncate text-xs font-semibold ${
                  isActive
                    ? "text-neutral-900 underline decoration-[#FFB300] decoration-2 underline-offset-4"
                    : "text-neutral-700"
                }`}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      {gridMode ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.map((t) => (
            <ServiceCard
              key={t.name}
              tab={t}
              slug={slug}
              onOpenLightbox={openLightbox}
            />
          ))}
        </div>
      ) : (
        <ServiceCarousel
          tabs={tabs}
          activeIndex={safeActive}
          onActiveChange={setActive}
          slug={slug}
          onOpenLightbox={openLightbox}
        />
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          service={lightbox.service}
          slug={slug}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}

// Horizontal carousel of every service card. Clicking a tab scrolls
// the carousel so the picked card sits centered on screen; swiping
// updates the active tab to whichever card is closest to centre.
function ServiceCarousel({
  tabs,
  activeIndex,
  onActiveChange,
  slug,
  onOpenLightbox
}: {
  tabs: Tab[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
  slug: string;
  onOpenLightbox: (svc: PricedService, startIndex: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const programmaticScroll = useRef(false);

  // Scroll the carousel so the active card is centered. Triggered when
  // the customer taps a tab or the gallery first mounts.
  const scrollToActive = useCallback(() => {
    const scroller = scrollerRef.current;
    const target = cardRefs.current[activeIndex];
    if (!scroller || !target) return;
    const cardCenter = target.offsetLeft + target.offsetWidth / 2;
    const scrollerCenter = scroller.clientWidth / 2;
    const next = cardCenter - scrollerCenter;
    programmaticScroll.current = true;
    scroller.scrollTo({ left: Math.max(0, next), behavior: "smooth" });
    // Programmatic-scroll flag lifts after the smooth animation settles.
    window.setTimeout(() => {
      programmaticScroll.current = false;
    }, 600);
  }, [activeIndex]);

  useEffect(() => {
    scrollToActive();
  }, [scrollToActive]);

  // While the user drags the carousel by hand, sync the active tab to
  // whichever card sits closest to centre.
  function onScroll() {
    if (programmaticScroll.current) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = activeIndex;
    let bestDist = Infinity;
    cardRefs.current.forEach((node, i) => {
      if (!node) return;
      const cardCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        closest = i;
      }
    });
    if (closest !== activeIndex) onActiveChange(closest);
  }

  return (
    <div className="relative mt-5">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Lead spacer so the first card can sit centered. */}
        <span aria-hidden="true" className="shrink-0 basis-[8%] sm:basis-[18%]" />
        {tabs.map((t, i) => (
          <div
            key={t.name}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            className="w-[78%] shrink-0 snap-center sm:w-[60%] lg:w-[44%]"
          >
            <ServiceCard
              tab={t}
              slug={slug}
              onOpenLightbox={onOpenLightbox}
              large={i === activeIndex}
            />
          </div>
        ))}
        {/* Trailing spacer so the last card can sit centered too. */}
        <span aria-hidden="true" className="shrink-0 basis-[8%] sm:basis-[18%]" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
      />
    </div>
  );
}

function ServiceCard({
  tab,
  slug,
  onOpenLightbox,
  large
}: {
  tab: Tab;
  slug: string;
  onOpenLightbox: (svc: PricedService, startIndex: number) => void;
  large?: boolean;
}) {
  const { name, service: svc } = tab;

  // Text-only service (no priced row): minimal CTA card.
  if (!svc) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-extrabold text-neutral-900">{name}</p>
        <p className="text-xs text-neutral-500">
          No fixed price published — every job is quoted on site after a quick
          chat about scope, materials, and access.
        </p>
        <EnquireButton slug={slug} name={name} price={0} unit="" />
      </div>
    );
  }

  const images = imagesOf(svc);
  const cover = images[0];
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {cover && (
        <button
          type="button"
          onClick={() => onOpenLightbox(svc, 0)}
          aria-label={`View ${svc.name} photo`}
          className={`group relative w-full overflow-hidden ${large ? "aspect-[16/9]" : "aspect-video"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={svc.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
          {images.length > 1 && (
            <span
              aria-hidden="true"
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-xs font-bold text-white"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              {images.length}
            </span>
          )}
        </button>
      )}

      <div className="flex flex-1 flex-col gap-1 p-4 sm:p-5">
        <p className={`font-extrabold text-neutral-900 ${large ? "text-base sm:text-lg" : "text-sm"}`}>
          {svc.name}
        </p>
        {svc.description && (
          <p className="text-xs leading-relaxed text-neutral-500">
            {svc.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-1">
            <span className={`font-extrabold text-neutral-900 ${large ? "text-2xl" : "text-lg"}`}>
              £{svc.price.toLocaleString("en-GB")}
            </span>
            <span className="text-xs text-neutral-500">{svc.unit}</span>
          </div>
          <EnquireButton
            slug={slug}
            name={svc.name}
            price={svc.price}
            unit={svc.unit}
          />
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  images,
  startIndex,
  service,
  slug,
  onClose
}: {
  images: string[];
  startIndex: number;
  service: PricedService;
  slug: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const safe = Math.min(Math.max(index, 0), images.length - 1);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(images.length - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, images.length]);

  const hasPrev = safe > 0;
  const hasNext = safe < images.length - 1;

  function enquire() {
    try {
      sessionStorage.setItem(
        "xrated_enquiry_service",
        JSON.stringify({
          name: service.name,
          price: service.price,
          unit: service.unit
        })
      );
    } catch {
      // ignore
    }
    window.location.href = `/trade/${slug}/contact#contact-panel`;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${service.name} — photo viewer`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-4 bg-white shadow-2xl"
        style={{ borderColor: "#FFB300" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {hasPrev && (
          <button
            type="button"
            onClick={() => setIndex(safe - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/80"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={() => setIndex(safe + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/80"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        <div className="aspect-video w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[safe]}
            alt={`${service.name} — photo ${safe + 1} of ${images.length}`}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold text-neutral-900 sm:text-lg">
              {service.name}
            </p>
            {service.description && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                {service.description}
              </p>
            )}
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-neutral-900">
                £{service.price.toLocaleString("en-GB")}
              </span>
              <span className="text-xs text-neutral-500">{service.unit}</span>
            </p>
            {images.length > 1 && (
              <p className="mt-1 text-xs font-bold text-neutral-400">
                Photo {safe + 1} of {images.length}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-700 transition hover:border-neutral-500"
            >
              Close
            </button>
            <button
              type="button"
              onClick={enquire}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-extrabold text-neutral-900 shadow-sm transition active:scale-[0.97]"
              style={{ background: "#FFB300" }}
            >
              Enquire about this
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
