import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabase, type HammerexTradeOffListing } from "@/lib/supabase";
import { BRAND, absolute } from "@/lib/seo";
import { TRADE_OFF_TRADES, tradeLabel } from "@/lib/tradeOff";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hammerex Trade Off — UK trade directory",
  description:
    "Find a real tradesperson on Hammerex Trade Off. Drywallers, plasterers, electricians, scaffolders and more — free WhatsApp quotation, verified Hammerex Standard tradies first.",
  alternates: { canonical: "/trade-off" },
  openGraph: {
    type: "website",
    title: `Hammerex Trade Off — UK trade directory | ${BRAND.name}`,
    description:
      "Find a real tradesperson. Free WhatsApp quotation, verified Hammerex Standard tradies first.",
    url: absolute("/trade-off"),
    siteName: BRAND.name
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammerex Trade Off — UK trade directory",
    description:
      "Find a real tradesperson. Free WhatsApp quotation, verified Hammerex Standard tradies first."
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

      <section className="border-b border-brand-line bg-brand-bg">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:pt-16">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Hammerex Trade Off
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-text sm:text-5xl">
            Find a real tradesperson.
            <br />
            <span className="text-brand-accent">Free. WhatsApp direct.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">
            No middlemen. No paywall. No fake reviews.
            <br />
            Hammerex Standard verified tradies first — the rest by recent join date.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/trade-off/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-accent px-6 text-sm font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
            >
              List your trade (free)
            </a>
            <p className="text-xs text-brand-muted">
              {listings.length} live {listings.length === 1 ? "tradie" : "tradies"} on Trade Off
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Browse by trade
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TRADE_OFF_TRADES.map((t) => (
            <li key={t.slug}>
              <a
                href={`/trade-off/${t.slug}`}
                className="inline-flex h-11 items-center rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
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
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-brand-accent px-5 text-xs font-bold text-black transition hover:brightness-110"
            >
              List your trade (free)
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
      href={`/t/${listing.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-brand-accent"
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
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-bold text-black shadow-lg">
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
            <div className="flex h-full w-full items-center justify-center bg-brand-accent text-base font-bold text-black">
              {initial}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-brand-text group-hover:text-brand-accent">
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
