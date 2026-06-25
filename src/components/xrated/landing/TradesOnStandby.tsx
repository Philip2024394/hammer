// Xrated Trades — "Trades On Standby" landing-page list.
// Server component. Renders pre-filtered, pre-sorted tradies as a vertical
// stack of clickable cards. Each card links to the tradie's profile at
// /trade/<slug>. The data side (availability, headline_rate) is set by the
// tradie in their edit dashboard; this component only renders.

import { TRADE_OFF_TRADES } from "@/lib/tradeOff";
import {
  AVAILABILITY_LABELS,
  formatHeadlineRate
} from "@/lib/xratedAvailability";
import type { HammerexTradeOffListing } from "@/lib/supabase";
import { tradeIconFor } from "./tradeIcons";

function labelForTrade(slug: string): string {
  return TRADE_OFF_TRADES.find((t) => t.slug === slug)?.label ?? slug;
}

function availabilityToneClass(value: string | null | undefined): string {
  if (value === "now") return "text-emerald-700";
  if (value === "tomorrow" || value === "this_week") return "text-amber-700";
  return "text-neutral-600";
}

export function TradesOnStandby({
  listings
}: {
  listings: HammerexTradeOffListing[];
}) {
  return (
    <section className="mx-auto mt-6 max-w-6xl px-3 sm:mt-8 sm:px-4">
      <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB300] sm:text-xs">
        Trades On Standby
      </h2>

      {listings.length === 0 ? (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-5 text-center">
          <p className="text-xs text-neutral-500 sm:text-sm">
            No tradies on standby right now — check back soon.
          </p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {listings.map((l) => {
            const Icon = tradeIconFor(l.primary_trade);
            const tradeLabel = labelForTrade(l.primary_trade);
            const availabilityLabel = l.availability
              ? AVAILABILITY_LABELS[l.availability] ?? null
              : null;
            const rate = formatHeadlineRate(l.headline_rate);
            const isNow = l.availability === "now";
            const toneClass = availabilityToneClass(l.availability);

            return (
              <li key={l.id}>
                <a
                  href={`/trade/${l.slug}`}
                  aria-label={`${l.display_name} — ${tradeLabel} in ${l.city}`}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition active:scale-[0.997] hover:border-neutral-300 sm:p-4"
                >
                  {/* LEFT — yellow square icon button */}
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "#FFB300", color: "#1a1a1a" }}
                  >
                    <Icon />
                  </span>

                  {/* MIDDLE — name + city + availability */}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-neutral-900">
                        {tradeLabel}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-neutral-500">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{l.city}</span>
                      </span>
                    </span>
                    {availabilityLabel && (
                      <span
                        className={`mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold ${toneClass}`}
                      >
                        {isNow && (
                          <span
                            aria-hidden="true"
                            className="relative inline-flex h-2 w-2"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {availabilityLabel}
                      </span>
                    )}
                  </span>

                  {/* RIGHT — starting price (hidden on very narrow screens) */}
                  {rate && (
                    <span className="hidden shrink-0 text-sm font-bold text-neutral-900 sm:block">
                      {rate}
                    </span>
                  )}

                  {/* FAR RIGHT — chevron */}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
