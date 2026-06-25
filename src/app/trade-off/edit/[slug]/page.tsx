// Hammerex Trade Off — edit flow
// Server shell that validates the magic-link token, loads the listing,
// and hands it to the shared TradeOffForm in "edit" mode.
//
// If the token is missing or invalid, we render a friendly error with a
// WhatsApp escape hatch — not a 404, so tradies who fat-finger the URL
// still get a useful page.

import type { Metadata } from "next";
import Link from "next/link";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminWhatsapp } from "@/lib/whatsapp";
import { whatsappDigits } from "@/lib/tradeOff";
import { effectiveTier, trialDaysRemaining } from "@/lib/xratedTrades";
import { maybeExpireListingTier } from "@/lib/xratedTier";
import { TradeOffForm, type TradeOffFormInitial } from "../../signup/TradeOffForm";
import { PremiumCustomisationPanel } from "./PremiumCustomisationPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit your Trade Off profile | Hammerex",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<{ token?: string | string[] }>;
type Params = Promise<{ slug: string }>;

export default async function TradeOffEditPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const rawToken = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!slug || !token) return <InvalidLink reason="missing-token" />;

  const row = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!row.data) return <InvalidLink reason="not-found" />;
  if (row.data.edit_token !== token) return <InvalidLink reason="bad-token" />;

  // Lazy tier expiry — keeps the dashboard accurate without a cron.
  await maybeExpireListingTier(row.data.id);
  const refreshed = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("id", row.data.id)
    .maybeSingle();
  if (refreshed.data) row.data = refreshed.data;

  const tier = effectiveTier({
    tier: row.data.tier ?? "standard",
    trial_expires_at: row.data.trial_expires_at ?? null
  });
  const trialDays =
    tier === "app_trial" ? trialDaysRemaining(row.data.trial_expires_at) : null;
  const upgradeHref = `/trade-off/upgrade?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;
  const adminWaDigits = whatsappDigits(adminWhatsapp());
  const billingWaUrl = `https://wa.me/${adminWaDigits}?text=${encodeURIComponent(
    `Hi Xrated Trades — manage billing for ${row.data.display_name} (${row.data.slug}).`
  )}`;

  const initial: TradeOffFormInitial = {
    display_name: row.data.display_name ?? "",
    trading_name: row.data.trading_name ?? "",
    primary_trade: row.data.primary_trade ?? "",
    secondary_trades: Array.isArray(row.data.secondary_trades) ? row.data.secondary_trades : [],
    city: row.data.city ?? "",
    country: row.data.country ?? "United Kingdom",
    postcode_prefix: row.data.postcode_prefix ?? "",
    service_postcodes: Array.isArray(row.data.service_postcodes)
      ? row.data.service_postcodes.join(", ")
      : "",
    whatsapp: row.data.whatsapp ?? "",
    phone: row.data.phone ?? "",
    email: row.data.email ?? "",
    website: row.data.website ?? "",
    instagram: row.data.instagram ?? "",
    facebook: row.data.facebook ?? "",
    tiktok: row.data.tiktok ?? "",
    youtube: row.data.youtube ?? "",
    bio: row.data.bio === "(draft)" ? "" : row.data.bio ?? "",
    years_in_trade:
      row.data.years_in_trade === null || row.data.years_in_trade === undefined
        ? ""
        : String(row.data.years_in_trade),
    start_year:
      row.data.start_year === null || row.data.start_year === undefined
        ? ""
        : String(row.data.start_year),
    avatar_url: row.data.avatar_url ?? "",
    photos: Array.isArray(row.data.photos) ? row.data.photos : []
  };

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedHeader />
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Trade Off · Edit profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          {row.data.display_name}
        </h1>
        <p className="mt-3 text-xs text-brand-muted">
          Status:{" "}
          <span
            className={
              row.data.status === "live"
                ? "font-semibold text-brand-success"
                : "font-semibold text-brand-text"
            }
          >
            {row.data.status.toUpperCase()}
          </span>
          {row.data.status === "hidden" && (
            <span className="ml-2 text-brand-muted">
              (hidden — message Hammerex on WhatsApp to appeal)
            </span>
          )}
        </p>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-4">
        <a
          href={`/trade-off/edit/${encodeURIComponent(slug)}/projects?token=${encodeURIComponent(token)}`}
          className="inline-flex h-11 items-center rounded-lg border border-brand-accent bg-brand-accent/10 px-4 text-xs font-bold text-brand-accent transition hover:bg-brand-accent hover:text-black"
        >
          Manage your verified work →
        </a>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-6">
        <TierStatusCard
          tier={tier}
          trialDays={trialDays}
          upgradeHref={upgradeHref}
          billingWaUrl={billingWaUrl}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10">
        <TradeOffForm
          mode={{ kind: "edit", slug, editToken: token }}
          initial={initial}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        {tier === "app_trial" || tier === "app_paid" ? (
          <PremiumCustomisationPanel
            slug={slug}
            editToken={token}
            initial={{
              theme_color: row.data.theme_color ?? "#F97316",
              button_text_color: row.data.button_text_color ?? "#FFFFFF",
              cta_button_effect: row.data.cta_button_effect ?? "none",
              hero_text_line1: row.data.hero_text_line1 ?? "",
              hero_text_line2: row.data.hero_text_line2 ?? "",
              hero_text_line2_color: row.data.hero_text_line2_color ?? "#F97316",
              hero_text_tagline: row.data.hero_text_tagline ?? "",
              hero_text_effect: row.data.hero_text_effect ?? "none",
              avatar_frame_style: row.data.avatar_frame_style ?? "none",
              profile_placement: row.data.profile_placement ?? "center",
              running_marquee: row.data.running_marquee ?? "",
              promo_text: row.data.promo_text ?? "",
              accepting_jobs: row.data.accepting_jobs ?? true,
              services_offered: Array.isArray(row.data.services_offered)
                ? row.data.services_offered
                : [],
              priced_services: Array.isArray(row.data.priced_services)
                ? row.data.priced_services.map((p: { name?: unknown; image_url?: unknown; price?: unknown; unit?: unknown }) => ({
                    name: typeof p.name === "string" ? p.name : "",
                    image_url: typeof p.image_url === "string" ? p.image_url : "",
                    price: typeof p.price === "number" ? p.price : 0,
                    unit: typeof p.unit === "string" ? p.unit : "per project"
                  }))
                : [],
              faq_items: Array.isArray(row.data.faq_items)
                ? row.data.faq_items
                : [],
              operating_hours:
                row.data.operating_hours && typeof row.data.operating_hours === "object"
                  ? row.data.operating_hours
                  : {},
              contact_form_enabled: row.data.contact_form_enabled ?? false,
              visit_us_enabled: row.data.visit_us_enabled ?? false
            }}
          />
        ) : (
          <div className="rounded-xl border border-brand-line bg-brand-surface p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Premium customisation
            </p>
            <p className="mt-2 text-sm text-brand-text">
              Upgrade to Xrated App to customise your theme colour, hero text
              animations, avatar frame and CTA effects.
            </p>
            <Link
              href={upgradeHref}
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand-accent px-4 text-xs font-bold text-black transition hover:opacity-90"
            >
              See upgrade options →
            </Link>
          </div>
        )}
      </section>
      <XratedFooter />
    </main>
  );
}

function TierStatusCard({
  tier,
  trialDays,
  upgradeHref,
  billingWaUrl
}: {
  tier: "standard" | "app_trial" | "app_paid" | "app_expired";
  trialDays: number | null;
  upgradeHref: string;
  billingWaUrl: string;
}) {
  if (tier === "app_trial") {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <p className="text-sm font-bold text-emerald-300">
          Xrated App — Trial active
          {trialDays !== null && ` · ${trialDays} day${trialDays === 1 ? "" : "s"} remaining`}
        </p>
        <p className="mt-1 text-xs text-brand-muted">
          You're on the premium tier free until the trial ends. Upgrade now to
          keep your custom theme, hero text and CTA effects live after that.
        </p>
        <Link
          href={upgradeHref}
          className="mt-3 inline-flex h-10 items-center rounded-lg bg-brand-accent px-4 text-xs font-bold text-black transition hover:opacity-90"
        >
          Upgrade to keep premium features →
        </Link>
      </div>
    );
  }
  if (tier === "app_paid") {
    return (
      <div className="rounded-xl border border-brand-accent bg-brand-accent/10 p-4">
        <p className="text-sm font-bold text-brand-accent">Xrated App — Paid</p>
        <p className="mt-1 text-xs text-brand-muted">
          Thanks for supporting Xrated Trades. All premium features are unlocked.
        </p>
        <a
          href={billingWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-10 items-center rounded-lg border border-brand-line bg-brand-surface px-4 text-xs font-bold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
        >
          Manage billing → WhatsApp
        </a>
      </div>
    );
  }
  if (tier === "app_expired") {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
        <p className="text-sm font-bold text-amber-300">
          Trial expired · You're back on Standard
        </p>
        <p className="mt-1 text-xs text-brand-muted">
          Your premium customisations are paused. Upgrade to bring them back.
        </p>
        <Link
          href={upgradeHref}
          className="mt-3 inline-flex h-10 items-center rounded-lg bg-amber-400 px-4 text-xs font-bold text-black transition hover:opacity-90"
        >
          Upgrade now →
        </Link>
      </div>
    );
  }
  // standard
  return (
    <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
      <p className="text-sm font-bold text-brand-text">Free standard listing</p>
      <p className="mt-1 text-xs text-brand-muted">
        Try the Xrated App tier free for 30 days — custom theme, hero text
        effects, avatar frame and a running marquee.
      </p>
      <Link
        href={upgradeHref}
        className="mt-3 inline-flex h-10 items-center rounded-lg border border-brand-accent bg-brand-accent/10 px-4 text-xs font-bold text-brand-accent transition hover:bg-brand-accent hover:text-black"
      >
        Start your 30-day free trial →
      </Link>
    </div>
  );
}

function InvalidLink({ reason }: { reason: string }) {
  const wa = adminWhatsapp().replace(/\D/g, "");
  const msg = encodeURIComponent(
    "Hi Hammerex — I'm trying to edit my Trade Off profile but my link isn't working. Can you help?"
  );
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedHeader />
      <section className="mx-auto max-w-xl px-4 pb-16 pt-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Trade Off
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">
          This link is invalid or has expired.
        </h1>
        <p className="mt-4 text-xs text-brand-muted">
          The edit URL you used doesn't match a live profile. Double-check the
          link in your bookmarks — the token after <code>?token=</code> must be
          exact.
        </p>
        <p className="mt-2 text-[11px] text-brand-muted">Reference: {reason}</p>
        <a
          href={`https://wa.me/${wa}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-brand-whatsapp px-6 text-xs font-bold text-white transition hover:opacity-90"
        >
          Message Hammerex on WhatsApp
        </a>
      </section>
      <XratedFooter />
    </main>
  );
}
