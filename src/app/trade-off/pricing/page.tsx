// Xrated Trades — pricing page.
// Single SaaS tier (£15/mo or £140/yr) with a 30-day free trial. No
// directory tier, no "Standard" free-for-life fallback after the
// pivot away from a two-sided marketplace.
//
// Layout: hero strapline → two-card comparison (monthly / annual) →
// "what you get" feature checklist → FAQ → closing CTA. Server-
// rendered, no client state needed.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { BRAND, absolute, faqJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Pricing — Xrated Trades. £15/mo or £140/yr. 30-day free trial. Powered by Hammerex.",
  description:
    "One simple price for UK tradies. £15 per month or £140 per year — 30-day free trial, no card on signup. Annual members get a 5% Hammerex shop discount and a free knife voucher. Cancel any time.",
  alternates: { canonical: "/trade-off/pricing" },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: "Xrated Trades — Pricing. £15/mo or £140/yr. 30-day free trial.",
    description:
      "One simple price for UK tradies. £15 per month or £140 per year — 30-day free trial, no card on signup. Cancel any time.",
    url: absolute("/trade-off/pricing")
  }
};

const FEATURES = [
  "Shareable xratedtrade.com/your-name URL",
  "Built-in qualified-lead contact form (postcode, project type, photos)",
  "Photo gallery + video tile + Meet-the-team grid",
  "Verified reviews tied to specific services",
  "Per-service pricing with the Enquire-prefill flow",
  "Auto-generated QR code for your van + business cards",
  "WhatsApp + email direct contact (no platform fee on jobs)",
  "Custom thread-colour and trust-level badge on every profile",
  "X-Rated trust-level system (Verified → Trusted → Elite)",
  "FAQ slider, opening-hours marquee, office-hours widget",
  "Dedicated services subpage with red-circle catchment map",
  "Hammerex shop integration — free knife voucher on signup",
  "5% Hammerex shop discount for annual members",
  "All future updates included while your subscription is active"
];

const PRICING_FAQ = [
  {
    q: "Is there really a 30-day free trial?",
    a:
      "Yes. You sign up with email + your trade, get full access to every feature for 30 days, and we ask for nothing on signup — no card, no bank details. If you decide it is not for you, the profile auto-archives and that is it."
  },
  {
    q: "What happens after the trial?",
    a:
      "You pick monthly (£15/mo) or annual (£140/yr — two months free vs monthly). You can keep your URL, your profile, your reviews and your photo gallery for as long as the subscription is active. Cancel any time from the dashboard."
  },
  {
    q: "What is the difference between monthly and annual?",
    a:
      "Annual costs £140 instead of £180 (you save £40 / two months) AND unlocks two extra perks: a 5% Hammerex shop discount on every order, and a free Hammerex knife voucher delivered when you sign up. The discount alone covers the annual fee for most working tradies."
  },
  {
    q: "Is there a platform fee on the jobs I win?",
    a:
      "No. Xrated Trades charges only the monthly / annual subscription. We take nothing from the jobs you win. Customer contact lands in your WhatsApp or email and you bill them direct — Xrated is never in the money flow."
  },
  {
    q: "Can I cancel any time?",
    a:
      "Yes. Cancel from your dashboard at any time. Monthly subscribers stop at the end of the current month; annual subscribers can ask for a prorated refund within 30 days of payment."
  },
  {
    q: "What if I am a sole trader vs a company?",
    a:
      "Same product, same price. The Meet-the-team grid auto-hides for solo tradies. Companies with 2+ tradesmen can add team-member cards from the dashboard."
  },
  {
    q: "Do you offer team / crew pricing?",
    a:
      "For now, one subscription = one tradesperson / one URL. If you have a 5+ person crew and want everyone on Xrated, contact us and we will quote a team plan with a single billing relationship."
  }
];

export default function PricingPage() {
  return (
    <main className="bg-white pb-24 md:pb-0">
      <XratedHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(PRICING_FAQ)) }}
      />

      {/* Hero strapline */}
      <section className="mx-auto max-w-5xl px-4 pb-2 pt-10 sm:px-6 sm:pt-14">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: XRATED_BRAND.accent }}
        >
          Pricing
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
          One simple price.{" "}
          <span style={{ color: XRATED_BRAND.accent }}>
            Free for 30 days.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          One link replaces your website, quote form and business card.
          We charge tradies; we never charge customers. No platform fee
          on the jobs you win. Cancel any time.
        </p>
      </section>

      {/* Two-up tier comparison */}
      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {/* Monthly card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Monthly
            </p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-neutral-900 sm:text-5xl">
                £15
              </span>
              <span className="text-sm text-neutral-500">/ month</span>
            </p>
            <p className="mt-1.5 text-xs text-neutral-500">
              First 30 days free · No card on signup
            </p>
            <a
              href="/trade-off/signup"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg border-2 px-4 text-sm font-extrabold transition active:scale-[0.98]"
              style={{
                borderColor: XRATED_BRAND.accent,
                color: "#0A0A0A"
              }}
            >
              Start free trial
            </a>
            <ul className="mt-6 space-y-2 text-xs text-neutral-600 sm:text-sm">
              <li className="flex items-start gap-2">
                <Tick />
                Full premium profile + all features
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                Cancel any time, no exit fee
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                Free Hammerex knife voucher on signup
              </li>
            </ul>
          </div>

          {/* Annual card — featured */}
          <div
            className="relative rounded-2xl border-2 bg-white p-6 sm:p-8"
            style={{
              borderColor: XRATED_BRAND.accent,
              boxShadow: `0 12px 32px ${XRATED_BRAND.accent}33`
            }}
          >
            <span
              className="absolute -top-3 right-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-neutral-900"
              style={{ background: XRATED_BRAND.accent }}
            >
              Best value · Save £40
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Annual
            </p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-neutral-900 sm:text-5xl">
                £140
              </span>
              <span className="text-sm text-neutral-500">/ year</span>
            </p>
            <p className="mt-1.5 text-xs text-neutral-500">
              ~£11.67/mo · First 30 days free · No card on signup
            </p>
            <a
              href="/trade-off/signup"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-extrabold text-neutral-900 shadow-sm transition active:scale-[0.98]"
              style={{ background: XRATED_BRAND.accent }}
            >
              Start free trial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <ul className="mt-6 space-y-2 text-xs text-neutral-700 sm:text-sm">
              <li className="flex items-start gap-2">
                <Tick />
                Everything in monthly
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                <span>
                  <span className="font-bold">5% off every Hammerex order</span>{" "}
                  — the discount alone covers the annual fee for most tradies
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                Free Hammerex knife voucher delivered on signup
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                Custom hero banner upload — your photo, your branding
              </li>
              <li className="flex items-start gap-2">
                <Tick />
                Priority email + WhatsApp support
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          What you get on either tier
        </h2>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          Every feature we have shipped — yours from minute one of the
          free trial. No locked tiers, no usage caps.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
            >
              <Tick />
              <span className="text-xs text-neutral-800 sm:text-sm">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          Pricing — common questions
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {PRICING_FAQ.map((qa) => (
            <li key={qa.q}>
              <details className="group rounded-2xl border border-neutral-200 bg-white p-4 open:border-[#FFB300]">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-3 text-sm font-bold text-neutral-900 marker:content-[''] sm:text-base">
                  <span>{qa.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition group-open:rotate-45"
                    style={{ background: XRATED_BRAND.accent, color: "#0A0A0A" }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  {qa.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto mt-12 max-w-5xl px-4 pb-2 sm:px-6">
        <div
          className="overflow-hidden rounded-2xl px-5 py-8 text-center sm:px-10 sm:py-12"
          style={{ background: "#0A0A0A" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            One link. Every customer.
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
            Start your 30-day free trial.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs text-white/80 sm:text-sm">
            No card on signup. Full access for 30 days. £15/mo or £140/yr after
            that — cancel any time.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/trade-off/signup"
              className="inline-flex h-12 items-center gap-2 rounded-lg px-6 text-xs font-extrabold uppercase tracking-wider text-neutral-900 transition active:scale-[0.98] sm:text-sm"
              style={{
                background: XRATED_BRAND.accent,
                boxShadow: `0 4px 14px ${XRATED_BRAND.accent}55`
              }}
            >
              Start free trial
            </a>
            <a
              href="/trade-off"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 sm:text-sm"
            >
              Back to overview
            </a>
          </div>
        </div>
      </section>

      <XratedFooter />
    </main>
  );
}

function Tick() {
  return (
    <span
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${XRATED_BRAND.accent}26` }}
      aria-hidden="true"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
