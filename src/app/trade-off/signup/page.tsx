// Hammerex Trade Off — onboarding wizard
// Single-screen vertical form. Form lives in TradeOffForm so the same UX
// can be reused by the /trade-off/edit/[slug] page.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { TradeOffForm } from "./TradeOffForm";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";

export const metadata: Metadata = {
  title: "Join Trade Off — list yourself for free | Hammerex",
  description:
    "Add your trade profile to Hammerex Trade Off. Free for life, WhatsApp-only, no commissions. Customers find you, you quote.",
  alternates: { canonical: "/trade-off/signup" }
};

export default function TradeOffSignupPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedViewTracker page="signup" listingId={null} />
      <XratedHeader />
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Trade Off · Sign up
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-brand-text sm:text-4xl">
          List yourself on Trade Off
        </h1>
        <p className="mt-3 max-w-xl text-xs text-brand-muted sm:text-sm">
          Free for life. Photos of your work, where you operate, a WhatsApp number.
          That's it — no reviews, no ratings, no commission. We send customers
          your way; the job stays between you and them.
        </p>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <TradeOffForm mode={{ kind: "create" }} />
      </section>
      <XratedFooter />
    </main>
  );
}
