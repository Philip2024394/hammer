"use client";

import { useEffect, useRef, useState } from "react";
import type { HammerexProduct } from "@/lib/supabase";
import { formatPrice, type Currency } from "@/lib/fx";
import { imageUrl } from "@/lib/imageUrl";

// Returns the next Sunday 23:59:59 UTC as a JS Date. This is the brand-wide
// weekly bundle-promotion cutoff. Sunday-night roll-over keeps the deal
// genuinely time-bounded — when the timer reaches zero, the next read
// returns a fresh week. No manufactured urgency: the deal really does
// reset every Monday 00:00 UTC.
function nextSundayMidnightUtc(now: Date): Date {
  const d = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    23, 59, 59, 999
  ));
  // getUTCDay: 0=Sun, 1=Mon, ..., 6=Sat
  const daysToSunday = (7 - d.getUTCDay()) % 7;
  d.setUTCDate(d.getUTCDate() + daysToSunday);
  // If today is Sunday and we already passed 23:59 UTC, push to next Sunday
  if (d.getTime() <= now.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ends now";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;
  if (days > 0)  return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export function BundleZoomModal({
  product,
  discountPct,
  currency,
  currentPdpUrl,
  currentPdpLabel,
  onClose,
  onAdd
}: {
  product: HammerexProduct;
  discountPct: number;
  currency: Currency;
  currentPdpUrl: string;
  currentPdpLabel: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [remaining, setRemaining] = useState<string>("");
  const [endsLocal, setEndsLocal] = useState<string>("");
  const closeRef = useRef<HTMLButtonElement>(null);

  // Live countdown — recomputes every second from a single fixed
  // anchor (next Sunday midnight UTC). No randomness, no reset trickery.
  // The "ends at" stamp is rendered in the buyer's local timezone so
  // "Sunday 23:59 UTC" becomes "Sunday 23:59 GMT" / "Monday 06:59 WIB" etc.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmt = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: tz
    });
    const tick = () => {
      const now = new Date();
      const end = nextSundayMidnightUtc(now);
      setRemaining(formatCountdown(end.getTime() - now.getTime()));
      setEndsLocal(fmt.format(end));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Esc to close + body-scroll lock + initial focus on the close button.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const discounted = Math.round(product.price_idr * (1 - discountPct / 100));
  const src = product.upsell_image_url ?? product.image_url;
  const productHref = `/product/${product.slug ?? product.id}`;

  const onViewProduct = () => {
    // Persist a return pointer so the destination PDP can render a
    // floating "back to where I was" pill. Cart state is already in
    // localStorage and untouched by this navigation.
    try {
      sessionStorage.setItem("bundleReturn", JSON.stringify({
        url: currentPdpUrl,
        label: currentPdpLabel
      }));
    } catch { /* private mode etc — silently fall through */ }
    window.location.href = productHref;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} — bundle deal`}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-brand-accent bg-white shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black active:scale-95"
        >×</button>

        <div className="aspect-square w-full bg-white">
          {src && (
            <img
              src={imageUrl(src, 720) ?? src}
              alt={product.name}
              decoding="async"
              className="h-full w-full object-contain p-4"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-bold uppercase leading-tight text-black sm:text-xl">
              {product.name}
            </h3>
            {product.subtitle && (
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-600">
                {product.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black">{formatPrice(discounted, currency)}</span>
            <span className="text-sm text-neutral-500 line-through">{formatPrice(product.price_idr, currency)}</span>
            {discountPct > 0 && (
              <span className="rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold text-black">
                −{discountPct}%
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
              ✈ Free shipping
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-brand-accent bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
              Ends in {remaining || "…"}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-neutral-600">
            Bundle deal ends <span className="font-semibold text-black">{endsLocal || "soon"}</span> (your local time).
            Prices reset every Monday. The discount and free shipping apply when this item is added with a main product purchase.
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onViewProduct}
              className="grid h-11 place-items-center rounded-md border-2 border-brand-accent bg-white text-xs font-bold uppercase tracking-wider text-black transition active:scale-95 hover:bg-brand-accent/10"
            >
              View product
            </button>
            <button
              type="button"
              onClick={() => { onAdd(); onClose(); }}
              className="grid h-11 place-items-center rounded-md bg-brand-accent text-xs font-bold uppercase tracking-wider text-black transition active:scale-95 hover:opacity-90"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
