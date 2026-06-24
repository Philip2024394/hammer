import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexTradeOffListing } from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { TRADE_OFF_TRADES, tradeLabel } from "@/lib/tradeOff";
import { XRATED_BRAND } from "@/lib/xratedTrades";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
  description:
    "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free standard listing for life. 30-day free trial of the Xrated App for premium profiles. Powered by Hammerex.",
  alternates: { canonical: "/trade-off" },
  openGraph: {
    type: "website",
    title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
    description:
      "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free for life. Powered by Hammerex.",
    url: absolute("/trade-off"),
    siteName: BRAND.name
  },
  twitter: {
    card: "summary_large_image",
    title: "Xrated Trades — Find Trades. View Real Work. Get Quotes Fast.",
    description:
      "Xrated Trades is a free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free for life."
  }
};

export default async function TradeOffLandingPage() {
  const res = await supabase
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("status", "live")
    .order("hammerex_standard_verified", { ascending: false })
    .order("joined_at", { ascending: false });
  const listings = (res.data ?? []) as HammerexTradeOffListing[];

  return (
    <main>
      <Header />

      {/* Xrated Trades hero — orange brand, background image, dark overlay */}
      <section className="relative isolate overflow-hidden border-b border-brand-line">
        <img
          src={XRATED_BRAND.heroImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/85"
        />
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:pt-16">
          <img
            src={XRATED_BRAND.logoUrl}
            alt={XRATED_BRAND.name}
            className="block h-12 w-auto object-contain sm:h-16"
            style={{ background: "transparent" }}
          />
          <p
            className="mt-4 text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            UK Trade Directory · Powered by Hammerex
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-5xl">
            {XRATED_BRAND.name}
          </h1>
          <p
            className="mt-3 text-xl font-semibold leading-snug sm:text-2xl"
            style={{ color: XRATED_BRAND.accent }}
          >
            {XRATED_BRAND.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            Free UK directory of working tradespeople. Real photos, verified work, WhatsApp direct. Free standard listing for life. 30-day free trial of Xrated App for premium profiles.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/trade-off/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#EA580C] active:scale-[0.98]"
            >
              List your trade — free
            </a>
            <p className="text-xs text-white/75">
              {listings.length} live {listings.length === 1 ? "tradie" : "tradies"} on Xrated Trades
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: XRATED_BRAND.accent }}
        >
          Browse by trade
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TRADE_OFF_TRADES.map((t) => (
            <li key={t.slug}>
              <a
                href={`/trade-off/${t.slug}`}
                className="inline-flex h-11 items-center rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold text-brand-text transition hover:border-[#F97316] hover:text-[#F97316]"
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            All live tradies
          </h2>
        </div>
        {listings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="text-sm font-semibold text-brand-text">
              No live listings yet — be the first.
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              List your trade in under two minutes. Free for life.
            </p>
            <a
              href="/trade-off/signup"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#F97316] px-5 text-xs font-bold text-white transition hover:bg-[#EA580C]"
            >
              List your trade — free
            </a>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeliveryFooter />
    </main>
  );
}

function ListingCard({ listing }: { listing: HammerexTradeOffListing }) {
  const photo = listing.photos[0] ?? listing.avatar_url ?? BRAND.logo;
  const primary = tradeLabel(listing.primary_trade);
  const initial = (listing.display_name.charAt(0) || "?").toUpperCase();
  return (
    <a
      href={`/trade/${listing.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-[#F97316]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={photo}
          alt={listing.display_name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
        {listing.hammerex_standard_verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#F97316] px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            Standard
          </span>
        )}
        <div className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-full border-2 border-brand-bg bg-brand-surface shadow-lg">
          {listing.avatar_url ? (
            <img
              src={listing.avatar_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F97316] text-base font-bold text-white">
              {initial}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-brand-text group-hover:text-[#F97316]">
          {listing.display_name}
        </h3>
        {listing.trading_name && (
          <p className="mt-0.5 text-xs text-brand-muted">{listing.trading_name}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-brand-line bg-black/40 px-2.5 py-1 text-xs font-semibold text-brand-text">
            {primary}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-brand-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {listing.city}
          </span>
        </div>
      </div>
    </a>
  );
}
