import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { resolveAppHero } from "@/lib/tradeAppBanners";
import { PremiumHero } from "@/components/xrated/profile/PremiumHero";
import {
  getTrustLevel,
  TRUST_LEVEL_META
} from "@/lib/xratedTrustLevel";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { GuideShareBar } from "@/components/guides/GuideShareBar";
import { TradePhotoGallery } from "@/components/trade-off/TradePhotoGallery";
import { TradeReportButton } from "@/components/trade-off/TradeReportButton";
import { TradeAreaMap } from "@/components/trade-off/TradeAreaMap";
import { TradeMobileActionBar } from "@/components/trade-off/TradeMobileActionBar";
import { TradeProfileUrlChip } from "@/components/trade-off/TradeProfileUrlChip";
import { InstantQuoteForm } from "@/components/trade-off/InstantQuoteForm";
import { ProjectGalleryGrid } from "@/components/trade-off/ProjectGalleryGrid";
import { TradeSocialIcons } from "@/components/trade-off/TradeSocialIcons";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { WhatsappClickTracker } from "@/components/trade-off/WhatsappClickTracker";
import { PreviewModeBar } from "@/components/trade-off/PreviewModeBar";
import { AvatarFrame } from "@/components/xrated/AvatarFrame";
import { HeroTextOverlay } from "@/components/xrated/HeroTextOverlay";
import { XratedCtaButton } from "@/components/xrated/XratedCtaButton";
import { XratedSocialShareStrip } from "@/components/xrated/XratedSocialShareStrip";
import { PortfolioCarousel } from "@/components/xrated/profile/PortfolioCarousel";
import { OperatingHoursPanel } from "@/components/xrated/profile/OperatingHoursPanel";
import { StarRatingRow } from "@/components/xrated/profile/StarRatingRow";
import { ProfileActionTriple } from "@/components/xrated/profile/ProfileActionTriple";
import { ShareIconButton } from "@/components/xrated/profile/ShareIconButton";
import { PricedServicesCarousel } from "@/components/xrated/profile/PricedServicesCarousel";
import { QrFooterDock } from "@/components/xrated/profile/QrFooterDock";
import { ProfileExpandPanels } from "@/components/xrated/profile/ProfileExpandPanels";
import { AboutBio } from "@/components/xrated/profile/AboutBio";
import {
  supabase,
  type HammerexTradeOffListing,
  type HammerexTradeOffProject,
  type HammerexProduct
} from "@/lib/supabase";
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
import { effectiveTier, inkForTheme } from "@/lib/xratedTrades";

export const revalidate = 300;

async function loadListing(slug: string) {
  const res = await supabase
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  const listing = (res.data ?? null) as HammerexTradeOffListing | null;
  if (!listing) return { listing: null, projects: [] as HammerexTradeOffProject[] };

  const projectsRes = await supabase
    .from("hammerex_trade_off_projects")
    .select("*")
    .eq("listing_id", listing.id)
    .order("sort_order", { ascending: true });
  const projects = (projectsRes.data ?? []) as HammerexTradeOffProject[];
  return { listing, projects };
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
  const { listing } = await loadListing(slug);
  if (!listing) return { title: "Tradie not found" };
  const primary = tradeLabel(listing.primary_trade);
  const title = `${listing.display_name} — ${primary} in ${listing.city} | Hammerex Trade Off`;
  const description = clampDescription(stripMarkdown(listing.bio), 160) ||
    `${listing.display_name}, ${primary.toLowerCase()} in ${listing.city}. Free WhatsApp quotation on Hammerex Trade Off.`;
  const url = absolute(`/trade/${listing.slug}`);
  return {
    title,
    description,
    alternates: { canonical: `/trade/${listing.slug}` },
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

// ─────────────────────────────────────────────────────────────────────────
// Shared sub-blocks used by BOTH layouts (premium + standard).
// Kept inside this file so we don't pollute /components with single-use bits.
// ─────────────────────────────────────────────────────────────────────────

function AcceptingBanner({ accepting }: { accepting: boolean }) {
  if (accepting) return null;
  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-semibold text-red-700">
      Currently fully booked — please check back
    </div>
  );
}

function AvailablePill({ themeColor }: { themeColor: string }) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-bold"
      style={{ background: themeColor, color: inkForTheme(themeColor) }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: inkForTheme(themeColor) }}
        aria-hidden="true"
      />
      Available for new jobs
    </span>
  );
}

function HammerexStandardBadge({
  listing,
  tierLabel,
  blurb
}: {
  listing: HammerexTradeOffListing;
  tierLabel: string | null;
  blurb: string;
}) {
  if (!listing.hammerex_standard_verified) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-2 pt-4">
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
            <p className="mt-3 text-sm leading-relaxed text-black/90">{blurb}</p>
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
  );
}

function ToolsIUseBlock({
  toolProducts,
  tierLabel
}: {
  toolProducts: HammerexProduct[];
  tierLabel: string | null;
}) {
  if (toolProducts.length === 0) return null;
  return (
    <section className="w-full px-4 pb-2 pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Tools I use
        </h2>
        <p className="text-xs text-brand-muted">
          Verified by Hammerex — these are the kit they own.
        </p>
      </div>
      {tierLabel && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-2.5 py-1 text-[13px] font-bold text-black">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            {tierLabel}
          </span>
        </div>
      )}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {toolProducts.map((p) => (
          <li key={p.id}>
            <a
              href={`/product/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface transition hover:border-brand-accent"
            >
              <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-brand-bg">
                <img
                  src={p.image_url || BRAND.logo}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain p-3 transition group-hover:scale-[1.03]"
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
      <div className="mt-4 rounded-xl border border-brand-line bg-brand-surface/60 px-4 py-3">
        <p className="text-xs text-brand-muted">
          Hammerex Standard verifies real working trade kit.{" "}
          <a
            href="/trade-off/signup"
            className="font-semibold text-brand-accent underline-offset-4 hover:underline"
          >
            Get yours →
          </a>
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page entry point
// ─────────────────────────────────────────────────────────────────────────

export default async function TradiePublicProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const previewRaw = Array.isArray(sp.preview) ? sp.preview[0] : sp.preview;
  // Standard-tier preview override. The whole profile is already public so
  // we don't need a signed token — anyone can preview, the tradie's owner
  // is the only person likely to care. A fixed top-bar makes it obvious.
  const previewStandard = previewRaw === "standard";
  const { listing, projects } = await loadListing(slug);
  if (!listing) notFound();

  const primary = tradeLabel(listing.primary_trade);
  const cover = listing.photos[0] ?? listing.avatar_url ?? BRAND.logo;
  const tier = standardTierFor(listing.hammerex_standard_products.length);
  const tierLabel = tier ? STANDARD_TIER_LABELS[tier] : null;

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
    { name: listing.display_name, url: `/trade/${listing.slug}` }
  ]);

  const localBusiness = localBusinessJsonLd(listing, primary);
  const waUrl = whatsappQuoteUrl(listing.whatsapp, listing.display_name, primary);
  const profileFullUrl = absolute(`/trade/${listing.slug}`);
  const toolProducts = await loadStandardProducts(listing.hammerex_standard_products);

  const isPremium =
    !previewStandard &&
    (effectiveTier(listing) === "app_trial" || effectiveTier(listing) === "app_paid");

  return (
    <main className="flex flex-1 flex-col pb-20 md:pb-0">
      <XratedViewTracker page="profile" listingId={listing.id} />
      {previewStandard && <PreviewModeBar slug={listing.slug} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <XratedHeader />

      {/* Per-trade default hero banner — Standard tier only. PremiumLayout
          renders its own banner WITH the profile card overlaid on the left. */}
      {!isPremium && (() => {
        const heroUrl = resolveAppHero({
          custom_app_hero_url: listing.custom_app_hero_url,
          primary_trade: listing.primary_trade,
          tier: listing.tier,
          last_payment_plan: listing.last_payment_plan
        });
        if (!heroUrl) return null;
        return (
          <section className="relative h-[320px] w-full overflow-hidden bg-neutral-900 sm:h-[480px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroUrl}
              alt={`${listing.display_name} — ${tradeLabel(listing.primary_trade)} hero`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 60%)"
              }}
            />
          </section>
        );
      })()}

      {isPremium ? (
        <PremiumLayout
          listing={listing}
          projects={projects}
          toolProducts={toolProducts}
          tierLabel={tierLabel}
          blurb={blurb}
          waUrl={waUrl}
          profileFullUrl={profileFullUrl}
        />
      ) : (
        <StandardLayout
          listing={listing}
          projects={projects}
          toolProducts={toolProducts}
          tierLabel={tierLabel}
          blurb={blurb}
          waUrl={waUrl}
          profileFullUrl={profileFullUrl}
        />
      )}

      <div className="mt-auto">
        <XratedFooter />
      </div>

      {/* Older mobile action bar — suppressed on premium tier because the
          QrFooterDock already shows a big WhatsApp button on mobile, and
          stacking both creates a double sticky bar.
          Wrapped in WhatsappClickTracker so the WA tap fires the same
          conversion beacon the QrFooterDock uses on the premium layout. */}
      {!isPremium && (
        <WhatsappClickTracker listingId={listing.id}>
          <TradeMobileActionBar
            waUrl={waUrl}
            phone={listing.phone}
            email={listing.email}
            displayName={listing.display_name}
          />
        </WhatsappClickTracker>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PREMIUM layout — app_trial / app_paid tiers
// ─────────────────────────────────────────────────────────────────────────

function PremiumLayout({
  listing,
  projects,
  toolProducts,
  tierLabel,
  waUrl,
  profileFullUrl
}: {
  listing: HammerexTradeOffListing;
  projects: HammerexTradeOffProject[];
  toolProducts: HammerexProduct[];
  tierLabel: string | null;
  blurb: string;
  waUrl: string;
  profileFullUrl: string;
}) {
  return (
    <>
      <PremiumHero listing={listing} waUrl={waUrl} />

      {/* Trust-level header sits under the hero as the page-2 entry.
          FAQ + contact form live on /trade/<slug>/contact — the hero
          Message button routes there. */}
      <TrustLevelBadge listing={listing} />

      <AboutAndVideo listing={listing} />
      <PricingPanel listing={listing} />
      <ServicesIconRow services={listing.services_offered ?? []} />
      <TrustAndLogisticsPanel listing={listing} />
      <RecentWorkGrid listing={listing} projects={projects} />
      <ServiceAreaAndHours listing={listing} />
      <ClientsCarousel listing={listing} />
      <ToolsIUseBlock toolProducts={toolProducts} tierLabel={tierLabel} />
      <ShareAndContactCta
        listing={listing}
        waUrl={waUrl}
        profileFullUrl={profileFullUrl}
      />
      <BottomTrustStrip />
    </>
  );
}
// ─── Section: About Us (left) + Video (right) ─────────────────────────
function AboutAndVideo({ listing }: { listing: HammerexTradeOffListing }) {
  const bioParas = (listing.bio || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const bullets = (listing.services_offered ?? []).slice(0, 4);
  // Cover image for the video panel: the second portfolio photo if present,
  // else the first photo, else the avatar. Click-to-play is a phase-2 wire.
  const cover =
    listing.photos[1] ??
    listing.photos[0] ??
    listing.avatar_url ??
    null;

  return (
    <section className="w-full px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">About Us</h2>
          {bioParas.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {listing.display_name} is based in {listing.city} with hands-on
              experience across all aspects of {tradeLabel(listing.primary_trade).toLowerCase()}.
            </p>
          ) : (
            bioParas.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-neutral-600">
                {p}
              </p>
            ))
          )}
          {bullets.length > 0 && (
            <ul className="mt-4 space-y-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-neutral-800">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Video panel — click-to-play facade for now. */}
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5">
          <div className="aspect-video w-full">
            {cover ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={cover}
                alt={`${listing.display_name} — work sample`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-neutral-200" />
            )}
          </div>
          <button
            type="button"
            aria-label="Play introduction video"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/10 transition active:scale-95">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Our Services (horizontal icon row) ──────────────────────
function ServicesIconRow({ services }: { services: string[] }) {
  // Take first 5 services + a "More" tile. Empty state collapses cleanly.
  const tiles = services.slice(0, 5);
  if (tiles.length === 0) return null;

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">Our Services</h2>
        <a href="#services-panel" className="text-xs font-bold text-[#FFB300] hover:underline">
          View all &rsaquo;
        </a>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {tiles.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2 text-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                i === 0 ? "bg-[#FFB300]/15 ring-2 ring-[#FFB300]" : "bg-neutral-100"
              }`}
            >
              <ServiceIcon name={s} active={i === 0} />
            </div>
            <span
              className={`text-xs font-semibold ${
                i === 0 ? "text-neutral-900 underline decoration-[#FFB300] decoration-2 underline-offset-4" : "text-neutral-700"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-neutral-700">More</span>
        </div>
      </div>
    </section>
  );
}

function ServiceIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#FFB300" : "#525252";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={name}>
      <rect x="3" y="6" width="18" height="3" />
      <rect x="3" y="11" width="18" height="3" />
      <rect x="3" y="16" width="18" height="3" />
    </svg>
  );
}

// ─── Section: Recent Work (4-photo grid) ──────────────────────────────
function RecentWorkGrid({
  listing,
  projects
}: {
  listing: HammerexTradeOffListing;
  projects: HammerexTradeOffProject[];
}) {
  // Prefer project after-photos, else fall back to listing photo gallery.
  const projectPhotos = projects
    .map((p) => p.after_url ?? p.during_url ?? p.before_url)
    .filter((u): u is string => !!u);
  const photos = (projectPhotos.length > 0 ? projectPhotos : listing.photos).slice(0, 4);
  if (photos.length === 0) return null;

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">Recent Work</h2>
        <a href="#gallery-panel" className="text-xs font-bold text-[#FFB300] hover:underline">
          View gallery &rsaquo;
        </a>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {photos.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-200 ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${listing.display_name} — recent work ${i + 1}`}
              className="h-full w-full object-cover transition hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section: Featured client review (one card carousel) ──────────────
function ClientsCarousel({ listing }: { listing: HammerexTradeOffListing }) {
  // No reviews table yet — render a single placeholder card when the
  // listing carries a rating, else skip the whole section.
  if (!listing.rating_avg) return null;
  const rating = listing.rating_avg.toFixed(1);

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">What Our Clients Say</h2>
        <a href="#reviews-panel" className="text-xs font-bold text-[#FFB300] hover:underline">
          View all reviews &rsaquo;
        </a>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous review"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 hover:border-[#FFB300] hover:text-[#FFB300] sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB300" aria-hidden="true">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-neutral-900">{rating}</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end sm:gap-6">
            <p className="text-sm leading-relaxed text-neutral-700">
              Excellent work! {listing.display_name} delivered on time, on budget
              and the finish was spotless. Communication throughout was great —
              would recommend without hesitation.
            </p>
            <div className="text-right">
              <p className="text-sm font-bold text-neutral-900">Sarah J.</p>
              <p className="text-xs text-neutral-500">{listing.city}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#FFB300]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Verified Review
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Next review"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 hover:border-[#FFB300] hover:text-[#FFB300] sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

// ─── Section: Share + Get in touch dark CTA strip ─────────────────────
function ShareAndContactCta({
  listing,
  waUrl,
  profileFullUrl
}: {
  listing: HammerexTradeOffListing;
  waUrl: string;
  profileFullUrl: string;
}) {
  const phoneHref = listing.phone
    ? `tel:${listing.phone.replace(/[^0-9+]/g, "")}`
    : null;
  // Display URL trims the scheme so the dark pill reads cleanly.
  const displayUrl = profileFullUrl.replace(/^https?:\/\//, "");

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-black p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">
        {/* LEFT — Share this profile */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "#FFB300" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Share this profile</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Let others know about our services
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 text-xs text-neutral-200">
              <span className="truncate font-mono">{displayUrl}</span>
              <button
                type="button"
                aria-label="Copy share URL"
                className="ml-auto shrink-0 text-neutral-400 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Get in touch today */}
        <div>
          <p className="text-sm font-extrabold text-white">Get in touch today</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            We&apos;re ready to help with your next project.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-neutral-900 transition active:scale-[0.97] sm:text-sm"
              style={{ background: "#FFB300" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Message Us
            </a>
            <a
              href={phoneHref ?? "#"}
              aria-disabled={!phoneHref}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 bg-transparent text-xs font-bold transition active:scale-[0.97] sm:text-sm"
              style={
                phoneHref
                  ? { borderColor: "#FFB300", color: "#FFB300" }
                  : { borderColor: "rgba(255,179,0,0.4)", color: "rgba(255,179,0,0.4)", pointerEvents: "none" }
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Bottom 3-up trust strip ─────────────────────────────────
function BottomTrustStrip() {
  return (
    <section className="w-full px-4 pb-10 pt-6 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TrustCell
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          }
          title="Free Quotes"
          subtitle="No obligation"
        />
        <TrustCell
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          }
          title="Fast Response"
          subtitle="Usually replies within 1 hour"
        />
        <TrustCell
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
          title="Quality Guaranteed"
          subtitle="We stand by our work"
        />
      </div>
    </section>
  );
}

// ─── Section: Trust-level badge band (page-2 entry) ───────────────────
function TrustLevelBadge({ listing }: { listing: HammerexTradeOffListing }) {
  const level = getTrustLevel(listing);
  const meta = TRUST_LEVEL_META[level];
  // Render 5 "X" marks — earned ones in brand yellow, unearned in muted.
  return (
    <section className="w-full px-4 pt-6 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-neutral-900 px-5 py-4 text-white sm:flex-row sm:py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: meta.accent }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-extrabold">
              X-Rated Level {level} — {meta.label}
            </p>
            <p className="text-xs text-neutral-400">{meta.sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1" aria-label={`Trust level ${level} of 5`}>
          {[1, 2, 3, 4, 5].map((i) => {
            const earned = i <= level;
            return (
              <span
                key={i}
                className="text-base font-extrabold"
                style={{ color: earned ? meta.accent : "rgba(255,255,255,0.18)" }}
                aria-hidden="true"
              >
                X
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustCell({
  icon,
  title,
  subtitle
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFB300]/15">
        {icon}
      </span>
      <div>
        <p className="text-sm font-extrabold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Section: Pricing (headline rate + priced_services grid) ──────────
function PricingPanel({ listing }: { listing: HammerexTradeOffListing }) {
  const headline = listing.headline_rate;
  const services = listing.priced_services ?? [];
  if (!headline && services.length === 0) return null;

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">Pricing</h2>
        {headline && (
          <span className="text-xs font-bold text-[#FFB300]">
            From £{headline.amount.toLocaleString("en-GB")} {headline.unit}
          </span>
        )}
      </div>
      {services.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              {svc.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={svc.image_url}
                  alt={svc.name}
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="text-sm font-extrabold text-neutral-900">{svc.name}</p>
                {svc.description && (
                  <p className="text-xs text-neutral-500">{svc.description}</p>
                )}
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-neutral-900">
                    £{svc.price.toLocaleString("en-GB")}
                  </span>
                  <span className="text-xs text-neutral-500">{svc.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Section: Service area map + operating hours, side by side ────────
function ServiceAreaAndHours({ listing }: { listing: HammerexTradeOffListing }) {
  const hasMap =
    typeof listing.lat === "number" &&
    typeof listing.lng === "number" &&
    Number.isFinite(listing.lat) &&
    Number.isFinite(listing.lng);
  const hasHours =
    listing.operating_hours && Object.keys(listing.operating_hours).length > 0;
  if (!hasMap && !hasHours) return null;

  return (
    <section className="w-full px-4 pt-8 sm:px-6">
      <div className="grid gap-4 md:grid-cols-2">
        {hasMap && (
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
              Service area
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Based in {listing.city} — typical 5km service radius shown.
            </p>
            <div className="mt-3">
              <TradeAreaMap
                lat={listing.lat}
                lng={listing.lng}
                city={listing.city}
                servicePostcodes={listing.service_postcodes ?? []}
              />
            </div>
            {(listing.service_postcodes ?? []).length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {listing.service_postcodes.slice(0, 12).map((p) => (
                  <li key={p}>
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-900">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {hasHours && (
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
              Opening hours
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Today is highlighted — outside these hours, leave a message.
            </p>
            <div className="mt-3">
              <OperatingHoursPanel
                hours={listing.operating_hours}
                themeColor="#FFB300"
                bare
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────────────────────
// STANDARD layout — free-for-life tier (unchanged from current page, plus
// a small "Standard listing" eyebrow + Upgrade pill, and the accepting-jobs
// pill if jobs are open).
// ─────────────────────────────────────────────────────────────────────────

function StandardLayout({
  listing,
  projects,
  toolProducts,
  tierLabel,
  blurb,
  waUrl,
  profileFullUrl
}: {
  listing: HammerexTradeOffListing;
  projects: HammerexTradeOffProject[];
  toolProducts: HammerexProduct[];
  tierLabel: string | null;
  blurb: string;
  waUrl: string;
  profileFullUrl: string;
}) {
  const primary = tradeLabel(listing.primary_trade);
  const cover = listing.photos[0] ?? listing.avatar_url ?? BRAND.logo;
  const gallery = listing.photos.slice(1);
  const cityLower = listing.city.toLowerCase();
  const initial = (listing.display_name.charAt(0) || "?").toUpperCase();
  const mailto = `mailto:${listing.email}?subject=${encodeURIComponent("Quotation request via Hammerex Trade Off")}`;

  return (
    <>
      {/* Powered-by chip */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="rounded-full bg-neutral-100 px-3 py-1.5 text-center text-[13px] text-brand-muted">
          <span aria-hidden="true">⚡</span> Powered by{" "}
          <a href="/trade-off" className="font-semibold text-brand-text hover:text-[#FFB300]">
            Hammerex Trade Off
          </a>{" "}
          · Free UK trade directory
        </div>
      </div>

      {/* Standard listing eyebrow + Upgrade pill */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-widest text-brand-muted">
            Standard listing
          </p>
          <a
            href={`/trade-off/upgrade?slug=${encodeURIComponent(listing.slug)}`}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition hover:border-amber-400 hover:text-amber-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            Upgrade to Xrated App for free — try 30 days
          </a>
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

      <div className="mx-auto max-w-6xl px-4 pt-3">
        <TradeProfileUrlChip slug={listing.slug} fullUrl={profileFullUrl} />
      </div>

      {/* Hero / identity */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <figure className="relative overflow-hidden rounded-2xl border border-brand-line bg-neutral-100">
            <img
              src={cover}
              alt={listing.display_name}
              width={1200}
              height={675}
              className="block aspect-[16/9] w-full object-cover"
            />
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Hammerex Trade Off
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-brand-text sm:text-4xl">
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
                  className="inline-flex items-center rounded-full border border-brand-line bg-neutral-100 px-3 py-1 text-xs text-brand-muted"
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

            <div className="mt-4">
              <TradeSocialIcons listing={listing} />
            </div>

            <div className="mt-6">
              <InstantQuoteForm
                slug={listing.slug}
                displayName={listing.display_name}
                tradeLabel={primary}
                whatsapp={listing.whatsapp}
                listingId={listing.id}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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

      <HammerexStandardBadge listing={listing} tierLabel={tierLabel} blurb={blurb} />

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

      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Verified work
          </h2>
          <div className="mt-3">
            <ProjectGalleryGrid projects={projects} />
          </div>
        </section>
      )}

      <ToolsIUseBlock toolProducts={toolProducts} tierLabel={tierLabel} />

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

      <section className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2 pt-6">
          <a
            href={`/trade/${listing.slug}/qr.png?download=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-brand-line bg-neutral-50 px-4 text-xs font-semibold text-brand-text transition hover:border-[#FFB300] hover:text-[#FFB300]"
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
        <GuideShareBar url={profileFullUrl} title={listing.display_name} />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <TradeReportButton listingId={listing.id} />
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Trust & logistics summary panel — only renders on the premium profile
// when at least one trust signal is populated. Designed to fit between
// the profile card and the Company Details / About row.
// ─────────────────────────────────────────────────────────────────────────

function TrustAndLogisticsPanel({ listing }: { listing: HammerexTradeOffListing }) {
  const hasAnyTrust =
    listing.is_insured ||
    listing.has_own_transport ||
    listing.has_own_tools ||
    listing.dbs_checked ||
    listing.free_site_visits ||
    (listing.qualifications && listing.qualifications.length > 0) ||
    (listing.trade_memberships && listing.trade_memberships.length > 0) ||
    typeof listing.minimum_job_gbp === "number" ||
    typeof listing.years_in_trade === "number" ||
    (listing.current_status_note && listing.current_status_note.trim().length > 0) ||
    (listing.quote_availability && listing.quote_availability.trim().length > 0);

  if (!hasAnyTrust) return null;

  const insuredLabel =
    listing.is_insured && typeof listing.insurance_cover_gbp === "number"
      ? `£${Math.round(listing.insurance_cover_gbp / 1_000_000) >= 1 && listing.insurance_cover_gbp % 1_000_000 === 0
          ? `${listing.insurance_cover_gbp / 1_000_000}M`
          : listing.insurance_cover_gbp.toLocaleString("en-GB")} cover`
      : listing.is_insured
        ? "Insured"
        : "Not confirmed";

  return (
    <section className="w-full px-4 pt-6 sm:pt-8">
      <h2 className="text-lg font-bold text-neutral-900">
        What to know before you message
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <TrustCard
          label="Insured"
          status={listing.is_insured ? "yes" : "no"}
          detail={insuredLabel}
        />
        <TrustCard
          label="Own transport"
          status={listing.has_own_transport ? "yes" : "no"}
          detail={listing.has_own_transport ? "Has own van / vehicle" : "Not confirmed"}
        />
        <TrustCard
          label="Own tools"
          status={listing.has_own_tools ? "yes" : "no"}
          detail={listing.has_own_tools ? "Brings own kit" : "Not confirmed"}
        />
        <TrustCard
          label="DBS checked"
          status={listing.dbs_checked ? "yes" : "no"}
          detail={listing.dbs_checked ? "Background-checked" : "Not confirmed"}
        />
        <TrustCard
          label="Free site visits"
          status={listing.free_site_visits ? "yes" : "no"}
          detail={
            listing.quote_availability && listing.quote_availability.trim().length > 0
              ? listing.quote_availability
              : listing.free_site_visits
                ? "Free quote visit"
                : "Not confirmed"
          }
        />
      </div>

      {(listing.qualifications?.length > 0 || listing.trade_memberships?.length > 0) && (
        <div className="mt-4 space-y-3">
          {listing.qualifications?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Qualifications
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {listing.qualifications.map((q) => (
                  <li key={q}>
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-900">
                      {q}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {listing.trade_memberships?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Memberships
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {listing.trade_memberships.map((m) => (
                  <li key={m}>
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-[#FFB300]/10 px-3 py-1 text-xs font-semibold text-neutral-900">
                      {m}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(typeof listing.years_in_trade === "number" ||
        typeof listing.minimum_job_gbp === "number") && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {typeof listing.years_in_trade === "number" && (
            <li>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-900">
                {listing.years_in_trade}+ yrs in trade
              </span>
            </li>
          )}
          {typeof listing.minimum_job_gbp === "number" && (
            <li>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-900">
                Minimum job £{listing.minimum_job_gbp.toLocaleString("en-GB")}
              </span>
            </li>
          )}
        </ul>
      )}

      {listing.current_status_note && listing.current_status_note.trim().length > 0 && (
        <p className="mt-3 text-[13px] italic text-neutral-500">
          {`💼 ${listing.current_status_note.trim()}`}
        </p>
      )}
    </section>
  );
}

function TrustCard({
  label,
  status,
  detail
}: {
  label: string;
  status: "yes" | "no" | "muted";
  detail: string;
}) {
  const tickColor = "#10B981";
  const crossColor = "#9CA3AF";
  const isYes = status === "yes";
  return (
    <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white p-3">
      <span
        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: isYes ? `${tickColor}1A` : `${crossColor}1A` }}
        aria-hidden="true"
      >
        {isYes ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tickColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={crossColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500">{detail}</p>
      </div>
    </div>
  );
}
