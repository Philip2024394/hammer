import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { GuideShareBar } from "@/components/guides/GuideShareBar";
import { TradePhotoGallery } from "@/components/trade-off/TradePhotoGallery";
import { TradeReportButton } from "@/components/trade-off/TradeReportButton";
import { TradeAreaMap } from "@/components/trade-off/TradeAreaMap";
import { TradeMobileActionBar } from "@/components/trade-off/TradeMobileActionBar";
import { TradeProfileUrlChip } from "@/components/trade-off/TradeProfileUrlChip";
import { supabase, type HammerexTradeOffListing, type HammerexProduct } from "@/lib/supabase";
import {
  absolute,
  BRAND,
  breadcrumbJsonLd,
  clampDescription,
  localBusinessJsonLd,
  stripMarkdown
} from "@/lib/seo";
import {
  HAMMEREX_STANDARD_BLURBS,
  STANDARD_TIER_LABELS,
  standardTierFor,
  tradeLabel,
  whatsappQuoteUrl
} from "@/lib/tradeOff";

export const revalidate = 300;

async function loadListing(slug: string) {
  const res = await supabase
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  return (res.data ?? null) as HammerexTradeOffListing | null;
}

async function loadStandardProducts(slugs: string[]): Promise<HammerexProduct[]> {
  if (slugs.length === 0) return [];
  const res = await supabase
    .from("hammerex_products")
    .select("*")
    .in("slug", slugs);
  return (res.data ?? []) as HammerexProduct[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) return { title: "Tradie not found" };
  const primary = tradeLabel(listing.primary_trade);
  const title = `${listing.display_name} — ${primary} in ${listing.city} | Hammerex Trade Off`;
  const description = clampDescription(stripMarkdown(listing.bio), 160) ||
    `${listing.display_name}, ${primary.toLowerCase()} in ${listing.city}. Free WhatsApp quotation on Hammerex Trade Off.`;
  const url = absolute(`/t/${listing.slug}`);
  return {
    title,
    description,
    alternates: { canonical: `/t/${listing.slug}` },
    openGraph: {
      type: "profile",
      title: `${listing.display_name} — ${primary} in ${listing.city}`,
      description,
      url,
      siteName: BRAND.name
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.display_name} — ${primary} in ${listing.city}`,
      description
    }
  };
}

function formatJoinedMonth(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function TradiePublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  const primary = tradeLabel(listing.primary_trade);
  const cover = listing.photos[0] ?? listing.avatar_url ?? BRAND.logo;
  const tier = standardTierFor(listing.hammerex_standard_products.length);
  const tierLabel = tier ? STANDARD_TIER_LABELS[tier] : null;

  // Pick a blurb for the badge block: prefer the stored blurb, otherwise
  // synthesise from the first matching Hammerex Standard product slug.
  const blurb =
    listing.hammerex_standard_blurb ||
    listing.hammerex_standard_products
      .map((s) => HAMMEREX_STANDARD_BLURBS[s])
      .find(Boolean) ||
    "This tradesperson is verified to the Hammerex Standard — they own one of our flagship trade stations or pro kits.";

  const cityLower = listing.city.toLowerCase();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Trade Off", url: "/trade-off" },
    { name: primary, url: `/trade-off/${listing.primary_trade}` },
    { name: listing.city, url: `/trade-off/${listing.primary_trade}/${encodeURIComponent(cityLower)}` },
    { name: listing.display_name, url: `/t/${listing.slug}` }
  ]);

  const localBusiness = localBusinessJsonLd(listing, primary);
  const waUrl = whatsappQuoteUrl(listing.whatsapp, listing.display_name, primary);
  const gallery = listing.photos.slice(1);
  const initial = (listing.display_name.charAt(0) || "?").toUpperCase();
  const mailto = `mailto:${listing.email}?subject=${encodeURIComponent("Quotation request via Hammerex Trade Off")}`;
  const profileFullUrl = absolute(`/t/${listing.slug}`);
  const toolProducts = await loadStandardProducts(listing.hammerex_standard_products);

  return (
    <main className="pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <Header />

      {/* Powered-by Hammerex chip */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="rounded-full bg-black/40 px-3 py-1.5 text-center text-[13px] text-brand-muted">
          <span aria-hidden="true">⚡</span> Powered by{" "}
          <a href="/trade-off" className="font-semibold text-brand-text hover:text-brand-accent">
            Hammerex Trade Off
          </a>{" "}
          · Free UK trade directory
        </div>
      </div>

      <nav className="mx-auto max-w-6xl px-4 pt-4 text-xs text-brand-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li><a href="/" className="hover:text-brand-text">Home</a></li>
          <li>/</li>
          <li><a href="/trade-off" className="hover:text-brand-text">Trade Off</a></li>
          <li>/</li>
          <li>
            <a href={`/trade-off/${listing.primary_trade}`} className="hover:text-brand-text">
              {primary}
            </a>
          </li>
          <li>/</li>
          <li>
            <a
              href={`/trade-off/${listing.primary_trade}/${encodeURIComponent(cityLower)}`}
              className="hover:text-brand-text"
            >
              {listing.city}
            </a>
          </li>
          <li>/</li>
          <li className="text-brand-text">{listing.display_name}</li>
        </ol>
      </nav>

      {/* Profile URL share chip */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <TradeProfileUrlChip slug={listing.slug} fullUrl={profileFullUrl} />
      </div>

      {/* Hero / identity */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <figure className="relative overflow-hidden rounded-2xl border border-brand-line bg-black">
            <img
              src={cover}
              alt={listing.display_name}
              width={1200}
              height={675}
              className="block aspect-[16/9] w-full object-cover"
            />
            {/* Avatar overlap — LinkedIn / Twitter style */}
            <div className="absolute -bottom-8 left-5 h-20 w-20 overflow-hidden rounded-full border-4 border-brand-bg bg-brand-surface shadow-2xl sm:h-24 sm:w-24">
              {listing.avatar_url ? (
                <img
                  src={listing.avatar_url}
                  alt={`${listing.display_name} profile photo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-accent text-3xl font-bold text-black">
                  {initial}
                </div>
              )}
            </div>
          </figure>

          <div className="flex flex-col pt-10 lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Hammerex Trade Off
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-brand-text sm:text-4xl">
              {listing.display_name}
            </h1>
            {listing.trading_name && (
              <p className="mt-1 text-sm text-brand-muted">{listing.trading_name}</p>
            )}
            <p className="mt-2 text-xs text-brand-muted">
              Joined {formatJoinedMonth(listing.joined_at)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-text">
                {primary}
              </span>
              {listing.secondary_trades.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full border border-brand-line bg-black/40 px-3 py-1 text-xs text-brand-muted"
                >
                  {tradeLabel(s)}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs text-brand-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {listing.city} · {listing.country}
              </span>
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-whatsapp px-6 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] sm:w-fit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.05 4.91A10 10 0 0 0 12 2a10 10 0 0 0-8.94 14.5L2 22l5.62-1.47A10 10 0 1 0 19.05 4.91Zm-7.05 15.4a8.36 8.36 0 0 1-4.27-1.17l-.3-.18-3.34.87.89-3.26-.2-.33A8.32 8.32 0 1 1 12 20.31Zm4.55-6.23c-.25-.13-1.47-.73-1.7-.82s-.39-.13-.55.13-.64.81-.78.97-.29.19-.54.06a6.84 6.84 0 0 1-2-1.24 7.55 7.55 0 0 1-1.4-1.74c-.15-.25 0-.39.11-.51s.25-.29.37-.43a1.6 1.6 0 0 0 .25-.41.46.46 0 0 0 0-.43c-.06-.13-.55-1.33-.76-1.82s-.4-.41-.55-.42h-.47a.91.91 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07 4.83 4.83 0 0 0 1 2.55 11 11 0 0 0 4.21 3.73c.59.25 1 .4 1.4.52a3.41 3.41 0 0 0 1.55.1 2.55 2.55 0 0 0 1.66-1.17 2 2 0 0 0 .15-1.17c-.06-.11-.23-.18-.48-.31Z" />
                </svg>
                Send for quotation
              </a>
              {listing.phone && (
                <a
                  href={`tel:${listing.phone.replace(/\s+/g, "")}`}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand-line bg-brand-surface px-6 text-sm font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent sm:w-fit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  Call
                </a>
              )}
              {listing.email && (
                <a
                  href={mailto}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand-line bg-brand-surface px-6 text-sm font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent sm:w-fit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  Email
                </a>
              )}
            </div>

            <p className="mt-4 text-xs text-brand-muted">
              {listing.report_count > 0 && (
                <>
                  {listing.report_count} report{listing.report_count === 1 ? "" : "s"} —{" "}
                </>
              )}
              please use the report button only for inappropriate listings.
            </p>
          </div>
        </div>
      </section>

      {/* Hammerex Standard badge — the showpiece */}
      {listing.hammerex_standard_verified && (
        <section className="mx-auto max-w-6xl px-4 pb-2 pt-2">
          <div className="overflow-hidden rounded-2xl border-2 border-black bg-brand-accent text-black shadow-xl">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black text-brand-accent">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-black/70">
                  Hammerex Standard
                </p>
                <h2 className="mt-1 text-xl font-bold leading-tight text-black sm:text-2xl">
                  {tierLabel}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-black/90">
                  {blurb}
                </p>
                <a
                  href="/product/k11-drywall-tool-station"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-black underline-offset-4 hover:underline"
                >
                  Why Hammerex Standard matters →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bio */}
      {listing.bio && (
        <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            About
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
            {listing.bio}
          </p>
        </section>
      )}

      {/* Tools I use — verified Hammerex Standard products */}
      {toolProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Tools they use
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-2 py-0.5 text-[13px] font-bold text-black">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              Standard verified
            </span>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {toolProducts.map((p) => (
              <li key={p.id}>
                <a
                  href={`/product/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-brand-accent"
                >
                  <div className="aspect-square w-full overflow-hidden bg-black">
                    <img
                      src={p.image_url || BRAND.logo}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-xs font-semibold text-brand-text group-hover:text-brand-accent">
                      {p.name}
                    </h3>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <a
              href="/trade-off/signup"
              className="inline-flex items-center text-xs text-brand-muted underline-offset-4 hover:text-brand-accent hover:underline"
            >
              Get your own Hammerex Standard verification →
            </a>
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Work in progress
          </h2>
          <div className="mt-3">
            <TradePhotoGallery photos={gallery} name={listing.display_name} />
          </div>
        </section>
      )}

      {/* Areas served */}
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Areas served
        </h2>
        {(typeof listing.lat === "number" && typeof listing.lng === "number") && (
          <div className="mt-3">
            <TradeAreaMap
              lat={listing.lat}
              lng={listing.lng}
              city={listing.city}
              servicePostcodes={listing.service_postcodes}
            />
          </div>
        )}
        <ul className="mt-3 flex flex-wrap gap-2">
          {(listing.service_postcodes.length > 0
            ? listing.service_postcodes
            : [listing.city]
          ).map((area) => (
            <li key={area}>
              <span className="inline-flex h-11 items-center rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold text-brand-text">
                {area}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Share + QR */}
      <section className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2 pt-6">
          <a
            href={`/t/${listing.slug}/qr.png?download=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-brand-line bg-black/40 px-4 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
              <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
              <path d="M3 9V5a2 2 0 0 1 2-2h4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
            </svg>
            Download QR
          </a>
        </div>
        <GuideShareBar url={absolute(`/t/${listing.slug}`)} title={listing.display_name} />
      </section>

      {/* Report */}
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <TradeReportButton listingId={listing.id} />
      </section>

      <DeliveryFooter />

      <TradeMobileActionBar
        waUrl={waUrl}
        phone={listing.phone}
        email={listing.email}
        displayName={listing.display_name}
      />
    </main>
  );
}
