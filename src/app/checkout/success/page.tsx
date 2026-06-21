import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";
import { TrackPageEvent } from "@/components/TrackPageEvent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you for your order — Hammerex",
  description:
    "Your Hammerex order has been received. Payment confirmation usually clears within 24 hours, after which we begin preparing your order for dispatch.",
  robots: { index: false, follow: false }
};

export default async function StripeSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <main>
      <Header />
      <ClearCartOnSuccess />
      <TrackPageEvent eventType="checkout_success" />
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-brand-accent bg-brand-accent/10 p-8 text-center">
          <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
            Thank you for your order
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
            From the team at Hammerex Products
          </p>

          <div className="mt-6 flex flex-col gap-4 text-left text-sm leading-relaxed text-brand-muted sm:text-center">
            <p>
              Payment confirmation usually comes through within{" "}
              <span className="font-semibold text-brand-text">24 hours</span>.
              As soon as it lands, we get straight on packing your order ready for dispatch.
            </p>
            <p>
              If we need anything further from you along the way, one of our team will be
              in touch directly.
            </p>
            <p>
              Thank you again for supporting Hammerex Products. We wish you many years of
              continued success on the tools — from all of us at the team.
            </p>
          </div>

          {session_id && (
            <p className="mt-8 text-xs text-brand-muted">
              Order reference:{" "}
              <span className="font-mono text-brand-text">{session_id.slice(-12)}</span>
            </p>
          )}

          <a
            href="/"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-brand-accent px-6 text-xs font-bold uppercase tracking-widest text-black"
          >
            Continue shopping
          </a>
        </div>
      </section>
    </main>
  );
}
