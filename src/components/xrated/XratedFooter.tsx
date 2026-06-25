// Xrated Trades — standalone footer for /trade-off* and /trade/* routes.
// Only one link back to Hammerex (the "Hammerex shop →" bottom-row link),
// so tradies and customers who want the parent shop can find it, but the
// focus stays on Xrated. Uses Hammerex yellow accent (#FFB300) for headings.

import { XRATED_BRAND } from "@/lib/xratedTrades";

export function XratedFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <section>
            <img
              src={XRATED_BRAND.logoUrl}
              alt={XRATED_BRAND.name}
              className="block h-9 w-auto object-contain"
              style={{ background: "transparent" }}
            />
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              The shareable trade profile for UK tradies — replaces your
              website, quote form and business card with one link.
            </p>
            <a
              href="/trade-off/signup"
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-xs font-extrabold text-neutral-900 transition active:scale-[0.98]"
              style={{ background: XRATED_BRAND.accent }}
            >
              Start 30-day free trial
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <p className="mt-2 text-xs text-white/60">
              No card on signup · Cancel any time
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: XRATED_BRAND.accent }}
            >
              For tradies
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <a href="/trade-off/signup" className="hover:text-white">
                  Start free trial
                </a>
              </li>
              <li>
                <a href="/trade-off/pricing" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/trade-off" className="hover:text-white">
                  How it works
                </a>
              </li>
              <li className="text-white/60">
                Edit your profile —{" "}
                <span className="text-white/70">use the link in your signup email</span>
              </li>
            </ul>
          </section>

          <section>
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: XRATED_BRAND.accent }}
            >
              Why Xrated
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li className="text-white/70">
                One link replaces your website
              </li>
              <li className="text-white/70">
                Quote form built in
              </li>
              <li className="text-white/70">
                Verified reviews tied to specific services
              </li>
              <li className="text-white/70">
                Direct WhatsApp / email — no platform fee on jobs
              </li>
              <li className="text-white/70">
                Free Hammerex knife voucher on signup
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {XRATED_BRAND.name} — powered by{" "}
            <a href="/trade-off" className="text-white/80 hover:text-white">
              {XRATED_BRAND.domain}
            </a>
          </p>
          <a
            href="/"
            className="text-white/70 transition hover:text-white"
          >
            Hammerex shop →
          </a>
        </div>
      </div>
    </footer>
  );
}
