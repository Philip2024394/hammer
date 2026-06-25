import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { XratedHeader } from "@/components/xrated/XratedHeader";
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
import { AvatarFrame } from "@/components/xrated/AvatarFrame";
import { HeroTextOverlay } from "@/components/xrated/HeroTextOverlay";
import { XratedCtaButton } from "@/components/xrated/XratedCtaButton";
import { RunningMarquee } from "@/components/xrated/RunningMarquee";
import { XratedSocialShareStrip } from "@/components/xrated/XratedSocialShareStrip";
import { ServicesChips } from "@/components/xrated/profile/ServicesChips";
import { PortfolioCarousel } from "@/components/xrated/profile/PortfolioCarousel";
import { OperatingHoursPanel } from "@/components/xrated/profile/OperatingHoursPanel";
import { FaqAccordion } from "@/components/xrated/profile/FaqAccordion";
import { ContactFormPanel } from "@/components/xrated/profile/ContactFormPanel";
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
  whatsappDigits,
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
    <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs font-semibold text-red-300">
      Currently fully booked — please check back
    </div>
  );
}

function AvailablePill({ themeColor }: { themeColor: string }) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold"
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
    <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
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

export default async function TradiePublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
    effectiveTier(listing) === "app_trial" || effectiveTier(listing) === "app_paid";

  return (
    <main className="pb-20 md:pb-0">
      <XratedViewTracker page="profile" listingId={listing.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <XratedHeader />

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

      <XratedFooter />

      {/* Older mobile action bar — suppressed on premium tier because the
          QrFooterDock already shows a big WhatsApp button on mobile, and
          stacking both creates a double sticky bar. */}
      {!isPremium && (
        <TradeMobileActionBar
          waUrl={waUrl}
          phone={listing.phone}
          email={listing.email}
          displayName={listing.display_name}
        />
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
  const theme = listing.theme_color || "#F97316";
  const ctaInk = listing.button_text_color || inkForTheme(theme);
  const waBase = `https://wa.me/${whatsappDigits(listing.whatsapp)}`;
  const qrPngUrl = `/trade/${listing.slug}/qr.png`;

  return (
    <>
      {/* 1. Banner hero — left-aligned text overlay.
          Mobile: 4:3 so the hero text + action buttons inside the banner
          have room to breathe (16:9 was too short on 375 px). */}
      <section className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[21/9]">
          <img
            src={cover}
            alt={listing.display_name}
            className="block h-full w-full object-cover"
          />
          {/* Left-half dark gradient so hero text reads against the photo. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 75%)"
            }}
            aria-hidden="true"
          />
          <HeroTextOverlay
            line1={listing.hero_text_line1}
            line2={listing.hero_text_line2}
            line2Color={listing.hero_text_line2_color}
            tagline={listing.hero_text_tagline}
            effect={listing.hero_text_effect}
          />

          {/* Share icon — top-right of the banner, icon-only (no label).
              Tapping opens a popover with social platforms + copy link + WA. */}
          <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
            <ShareIconButton
              shareUrl={profileFullUrl}
              shareTitle={`${listing.display_name} on Xrated Trades`}
              themeColor={theme}
            />
          </div>

          {/* Contact + Visit buttons sit INSIDE the banner under the tagline.
              Anchor hrefs drive the expand panels below — no client state
              passed across the server boundary. */}
          <div className="absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
            <ProfileActionTriple
              whatsappHref="#contact-panel"
              visitHref="#visit-panel"
              shareHref="#share"
              themeColor={theme}
              variant="overlay"
            />
          </div>
        </div>
      </section>

      {/* 3. Profile container — overlaps the bottom 20% of the banner so
          the card straddles the photo (LinkedIn-style overlay).
          Layout: Name + verified mark + AVATAR sit on the top row; stars
          and location underneath the name on the left; Contact us button
          anchored to the BOTTOM-RIGHT of the card. */}
      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-20">
        <div className="relative rounded-2xl bg-brand-surface p-4 shadow-2xl sm:p-5">
          {/* Top row: name (left) + avatar (right) */}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="truncate text-lg font-bold leading-tight text-brand-text sm:text-2xl">
                  {listing.display_name}
                </h1>
                {listing.hammerex_standard_verified && (
                  <span
                    className="inline-block align-middle"
                    title="Hammerex Standard verified"
                    aria-label="Verified"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" aria-hidden="true">
                      <path d="m12 1 3 5 6 1-4.5 4.5L18 18l-6-3-6 3 1.5-6.5L3 7l6-1Z" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="mt-1">
                <StarRatingRow
                  rating_avg={listing.rating_avg}
                  rating_count={listing.rating_count}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {listing.city}
                  {listing.country ? `, ${listing.country}` : ""}
                </span>
                <a
                  href="#visit-panel"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-text underline-offset-4 hover:underline"
                >
                  Visit us
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="shrink-0">
              <AvatarFrame
                src={listing.avatar_url}
                name={listing.display_name}
                size={72}
                style={listing.avatar_frame_style}
                themeColor={theme}
              />
            </div>
          </div>

          {/* Bottom row: Contact us pill anchored to the right */}
          <div className="mt-3 flex justify-end">
            <a
              href="#contact-panel"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] font-bold uppercase tracking-wider transition active:scale-[0.97]"
              style={{ background: theme, color: ctaInk }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.05 4.91A10 10 0 0 0 12 2a10 10 0 0 0-8.94 14.5L2 22l5.62-1.47A10 10 0 1 0 19.05 4.91Zm-7.05 15.4a8.36 8.36 0 0 1-4.27-1.17l-.3-.18-3.34.87.89-3.26-.2-.33A8.32 8.32 0 1 1 12 20.31Z" />
              </svg>
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* Inline expand panel sits right under the profile container. */}
      <ProfileExpandPanels
        contactPanel={
          <>
            <FaqAccordion items={listing.faq_items ?? []} themeColor={theme} />
            {listing.contact_form_enabled && (
              <ContactFormPanel
                listingId={listing.id}
                displayName={listing.display_name}
                themeColor={theme}
              />
            )}
          </>
        }
        visitPanel={
          <>
            {listing.visit_us_enabled &&
              typeof listing.lat === "number" &&
              typeof listing.lng === "number" && (
                <div className="mx-auto max-w-3xl px-4 pt-6">
                  <TradeAreaMap
                    lat={listing.lat}
                    lng={listing.lng}
                    city={listing.city}
                    servicePostcodes={listing.service_postcodes}
                  />
                  <p className="mt-3 text-[13px] font-semibold text-brand-text">
                    {listing.city}
                    {listing.country ? `, ${listing.country}` : ""}
                    {listing.postcode_prefix ? ` · ${listing.postcode_prefix}` : ""}
                  </p>
                </div>
              )}
            <OperatingHoursPanel
              hours={listing.operating_hours ?? {}}
              themeColor={theme}
              bare={false}
            />
            <div className="mx-auto max-w-3xl px-4 pt-4">
              <TradeSocialIcons listing={listing} />
            </div>
          </>
        }
      />

      {/* 4. About — eyebrow is the company name; bio capped at 5 lines. */}
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-8">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: theme }}
        >
          {listing.trading_name || listing.display_name}
        </h2>
        <div className="mt-3">
          <AboutBio
            text={listing.bio || "No bio provided yet."}
            themeColor={theme}
          />
        </div>
      </section>

      {/* 5. Services badges */}
      <ServicesChips services={listing.services_offered ?? []} themeColor={theme} />

      {/* 6. Priced services carousel */}
      <PricedServicesCarousel
        services={listing.priced_services ?? []}
        whatsappBase={waBase}
        themeColor={theme}
      />

      {/* 7. Running marquee — uses the new promo_text column */}
      {listing.promo_text && (
        <div className="mt-8">
          <RunningMarquee text={listing.promo_text} themeColor={theme} />
        </div>
      )}

      {/* 10. Portfolio carousel */}
      {projects.length > 0 && (
        <PortfolioCarousel projects={projects} themeColor={theme} />
      )}

      {/* 14. Tools I use cross-sell */}
      <ToolsIUseBlock toolProducts={toolProducts} tierLabel={tierLabel} />

      {/* Primary CTA — themed WhatsApp button kept for users who scroll past */}
      <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
        <XratedCtaButton
          href={waUrl}
          label={`Request quote from ${listing.display_name}`}
          themeColor={theme}
          textColor={ctaInk}
          effect={listing.cta_button_effect}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.05 4.91A10 10 0 0 0 12 2a10 10 0 0 0-8.94 14.5L2 22l5.62-1.47A10 10 0 1 0 19.05 4.91Zm-7.05 15.4a8.36 8.36 0 0 1-4.27-1.17l-.3-.18-3.34.87.89-3.26-.2-.33A8.32 8.32 0 1 1 12 20.31Z" />
            </svg>
          }
        />
      </section>

      {/* Share strip anchor — referenced by the action triple's Share button */}
      <section id="share" className="mx-auto max-w-3xl px-4 pt-6 scroll-mt-20">
        <XratedSocialShareStrip
          url={profileFullUrl}
          displayName={listing.display_name}
        />
      </section>

      {/* Report */}
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-6">
        <TradeReportButton listingId={listing.id} />
      </section>

      {/* 15. Sticky QR + Contact footer dock (above the global XratedFooter) */}
      <QrFooterDock
        qrPngUrl={qrPngUrl}
        whatsappHref={waUrl}
        themeColor={theme}
      />
    </>
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
        <div className="rounded-full bg-black/40 px-3 py-1.5 text-center text-[13px] text-brand-muted">
          <span aria-hidden="true">⚡</span> Powered by{" "}
          <a href="/trade-off" className="font-semibold text-brand-text hover:text-brand-accent">
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
            className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 text-[12px] font-semibold text-amber-200 transition hover:border-amber-300 hover:text-amber-100"
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
          <figure className="relative overflow-hidden rounded-2xl border border-brand-line bg-black">
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

            <div className="mt-4">
              <TradeSocialIcons listing={listing} />
            </div>

            <div className="mt-6">
              <InstantQuoteForm
                slug={listing.slug}
                displayName={listing.display_name}
                tradeLabel={primary}
                whatsapp={listing.whatsapp}
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
        <GuideShareBar url={profileFullUrl} title={listing.display_name} />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <TradeReportButton listingId={listing.id} />
      </section>
    </>
  );
}
