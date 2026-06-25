// Xrated Trades — shared premium hero block.
//
// Renders banner + left-overlay profile card + stats grid. Used on the
// public profile (`/trade/<slug>`), the contact subpage
// (`/trade/<slug>/contact`), and any future subpage that needs the
// "always show the hero" identity strip the user asked for.
//
// Pure server component — derives everything (rating, trust badges, hero
// image) from the listing record. No client state.

import type { HammerexTradeOffListing } from "@/lib/supabase";
import { tradeLabel } from "@/lib/tradeOff";
import { resolveAppHero } from "@/lib/tradeAppBanners";

export function PremiumHero({
  listing,
  waUrl,
  currentPage = "profile"
}: {
  listing: HammerexTradeOffListing;
  waUrl: string;
  /** When set to "contact", the yellow Message button morphs to a
   *  "Home page" link back to the public profile so the customer can
   *  always retreat to the landing page from any subpage. */
  currentPage?: "profile" | "contact";
}) {
  const isContact = currentPage === "contact";
  const primaryCta = isContact
    ? {
        href: `/trade/${listing.slug}`,
        label: "Home page",
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 12 9-9 9 9" />
            <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
          </svg>
        )
      }
    : {
        href: `/trade/${listing.slug}/contact`,
        label: "Message",
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      };
  const primary = tradeLabel(listing.primary_trade);
  const tradeServiceLabel = `${primary} Service`;
  const subtitle =
    (listing.services_offered ?? []).slice(0, 2).join(" & ") ||
    (listing.trading_name ?? "");
  const rating =
    typeof listing.rating_avg === "number" && listing.rating_avg > 0
      ? listing.rating_avg.toFixed(1)
      : null;
  const reviewCount = listing.rating_count ?? 0;
  const phoneHref = listing.phone
    ? `tel:${listing.phone.replace(/[^0-9+]/g, "")}`
    : null;

  const trustBadges = [
    listing.is_insured ? { label: "Fully insured", icon: "shield" } : null,
    listing.qualifications && listing.qualifications.length > 0
      ? { label: "Licensed", icon: "license" }
      : null,
    listing.trade_memberships && listing.trade_memberships.length > 0
      ? { label: "Registered", icon: "check" }
      : null
  ].filter((b): b is { label: string; icon: string } => b !== null);

  const heroUrl = resolveAppHero({
    custom_app_hero_url: listing.custom_app_hero_url,
    primary_trade: listing.primary_trade,
    tier: listing.tier,
    last_payment_plan: listing.last_payment_plan
  });

  return (
    <>
      <section className="relative h-[260px] w-full overflow-hidden bg-neutral-900 sm:h-[380px]">
        {heroUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroUrl}
            alt={`${listing.display_name} — ${primary} hero`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 70%)"
          }}
        />

        <div className="absolute inset-y-0 left-0 z-10 flex w-full items-center px-3 sm:px-8">
          <div className="w-full max-w-md">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div
                  className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white sm:h-24 sm:w-24"
                  style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.45)" }}
                >
                  {listing.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={listing.avatar_url}
                      alt={listing.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black">
                      <span className="text-3xl font-extrabold sm:text-4xl" style={{ color: "#FFB300" }}>X</span>
                    </div>
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-black"
                  style={{ background: "#FFB300" }}
                  aria-label="Verified"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {listing.accepting_jobs && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                    style={{ background: "#0F7A3F" }}
                  >
                    Available now
                  </span>
                )}

                <h1
                  className="mt-2 flex items-center gap-1.5 text-lg font-extrabold leading-tight text-white sm:text-2xl"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                >
                  <span className="truncate">{tradeServiceLabel}</span>
                  <span
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full sm:h-5 sm:w-5"
                    style={{ background: "#FFB300" }}
                    aria-label="Verified"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </h1>
                {subtitle && (
                  <p
                    className="mt-0.5 truncate text-xs text-neutral-200 sm:text-sm"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                  >
                    {subtitle}
                  </p>
                )}

                <div
                  className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  <span className="inline-flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="font-semibold">{listing.city}</span>
                  </span>
                  {rating && (
                    <span className="inline-flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB300" aria-hidden="true">
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-semibold">{rating}</span>
                      <span className="text-neutral-300">({reviewCount} reviews)</span>
                    </span>
                  )}
                </div>

                {trustBadges.length > 0 && (
                  <div
                    className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                  >
                    {trustBadges.map((b) => (
                      <span key={b.label} className="inline-flex items-center gap-1">
                        <span
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                          style={{ background: "rgba(255,179,0,0.22)" }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span className="font-semibold">{b.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={primaryCta.href}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-neutral-900 shadow-lg transition active:scale-[0.97] sm:text-sm"
                style={{ background: "#FFB300" }}
              >
                {primaryCta.icon}
                {primaryCta.label}
              </a>
              <a
                href={phoneHref ?? "#"}
                aria-disabled={!phoneHref}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold shadow-lg backdrop-blur-sm transition active:scale-[0.97] sm:text-sm"
                style={
                  phoneHref
                    ? { borderColor: "#FFB300", color: "#FFB300", background: "rgba(0,0,0,0.35)" }
                    : { borderColor: "rgba(255,179,0,0.4)", color: "rgba(255,179,0,0.4)", background: "rgba(0,0,0,0.35)", pointerEvents: "none" }
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                Call Now
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold shadow-lg backdrop-blur-sm transition active:scale-[0.97] sm:text-sm"
                style={{ borderColor: "#FFB300", color: "#FFB300", background: "rgba(0,0,0,0.35)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.05 4.91A10 10 0 0 0 12 2a10 10 0 0 0-8.94 14.5L2 22l5.62-1.47A10 10 0 1 0 19.05 4.91Zm-7.05 15.4a8.36 8.36 0 0 1-4.27-1.17l-.3-.18-3.34.87.89-3.26-.2-.33A8.32 8.32 0 1 1 12 20.31Z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-4 pb-4 sm:-mt-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-1 overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl sm:grid-cols-5">
          <StatTile
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB300" aria-hidden="true">
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
            }
            value={rating ?? "—"}
            label="Rating"
          />
          <StatTile
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            }
            value={String(reviewCount || 0)}
            label="Jobs Completed"
          />
          <StatTile
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            value="97%"
            label="On-Time Rate"
          />
          <StatTile
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            value={
              listing.years_in_trade && listing.years_in_trade > 0
                ? `${listing.years_in_trade}+`
                : "—"
            }
            label="Years Experience"
          />
          <StatTile
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            value={listing.is_insured ? "Fully" : "—"}
            label="Insured"
          />
        </div>
      </section>
    </>
  );
}

function StatTile({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-neutral-900 px-2 py-3 text-center sm:py-4">
      {icon}
      <span className="text-base font-extrabold text-white sm:text-lg">{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </span>
    </div>
  );
}
