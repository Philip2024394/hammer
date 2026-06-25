// Xrated Trades — customer job post form (server shell).
// Pure shell that drops the Xrated chrome around the client form. Letting
// the form be the only client-side surface keeps the SEO copy crawlable.

import type { Metadata } from "next";
import { XratedHeader } from "@/components/xrated/XratedHeader";
import { XratedFooter } from "@/components/xrated/XratedFooter";
import { XratedViewTracker } from "@/components/trade-off/XratedViewTracker";
import { XRATED_BRAND } from "@/lib/xratedTrades";
import { BRAND, absolute } from "@/lib/seo";
import { JobPostForm } from "./JobPostForm";

export const metadata: Metadata = {
  title: "Post your project — free | Xrated Trades",
  description:
    "Post a job on Xrated Trades. Free, direct, no middleman. Verified UK tradespeople will message you on WhatsApp.",
  alternates: { canonical: "/trade-off/jobs/post" },
  openGraph: {
    type: "website",
    title: "Post your project — free | Xrated Trades",
    description:
      "Post a job on Xrated Trades. Free, direct, no middleman.",
    url: absolute("/trade-off/jobs/post"),
    siteName: BRAND.name
  }
};

export default function JobPostPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <XratedViewTracker page="job_post" listingId={null} />
      <XratedHeader />

      <section className="border-b border-brand-line bg-brand-surface">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-10">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: XRATED_BRAND.accent }}
          >
            Xrated Trades · Post a job
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-text sm:text-4xl">
            Post your job — free, direct, no middleman
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-brand-muted sm:text-sm">
            Tell us what you need. Verified UK tradespeople reach out direct on WhatsApp —
            you compare quotes, you pick. No commission, no upsell, no account required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <JobPostForm />
      </section>

      <XratedFooter />
    </main>
  );
}
