// /trade — Hammerex Trade Portal entry.
//
// Public landing. If the visitor is signed in AND has an active trade
// account, we render the post-login welcome surface (Phase 2 will replace
// this stub with the wholesale catalogue). Otherwise we render the
// email-only magic-link login form.
//
// Deeper trade paths (/trade/catalogue, /trade/cart, /trade/checkout etc.)
// are gated by middleware to return 404 when unauthenticated. The login
// surface itself is public so search engines and curious visitors don't
// trigger a 404 storm.

import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { TradeLoginForm } from "./TradeLoginForm";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "Trade Portal",
  description: "Sign in to the Hammerex trade portal. Wholesale access for vetted trade buyers.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function TradePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const account = await getCurrentTradeAccount();
  const sp = await searchParams;

  if (account) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] bg-brand-bg px-4 py-12">
          <div className="mx-auto max-w-2xl rounded-2xl border border-brand-line bg-brand-surface p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Trade Portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-brand-text">
              Welcome, {account.company_name}
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Trade account: <span className="font-mono text-brand-text">{account.trade_account_no}</span>
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              Signed in as <span className="text-brand-text">{account.contact_email}</span>
            </p>

            <div className="mt-6 rounded-xl border border-brand-line bg-brand-bg p-4">
              <p className="text-sm text-brand-text">
                Your wholesale catalogue is coming soon.
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                Phase 2 will surface trade-priced products, multi-line orders,
                and bulk-quote requests here. For now your account is linked
                and your visit is logged.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-brand-muted">
                Lifetime sign-ins: <span className="text-brand-text">{account.login_count}</span>
              </p>
              <SignOutButton />
            </div>
          </div>
        </main>
        <DeliveryFooter />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-brand-bg px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Trade Portal
          </p>
          <h1 className="mt-2 text-xl font-bold text-brand-text">Sign in</h1>
          <p className="mt-2 text-sm text-brand-muted">
            Wholesale access for vetted trade buyers. Enter your account email
            and we will send you a one-tap sign-in link.
          </p>

          <Suspense fallback={null}>
            <TradeLoginForm initialError={sp.error} initialSent={sp.sent === "1"} />
          </Suspense>

          <p className="mt-5 text-xs text-brand-muted">
            Trade account access is by invitation. If you need an account,{" "}
            <a href="/partners" className="text-brand-accent underline-offset-2 hover:underline">
              contact us via the Partners page
            </a>
            .
          </p>
        </div>
      </main>
      <DeliveryFooter />
    </>
  );
}
