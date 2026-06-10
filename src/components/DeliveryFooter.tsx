export function DeliveryFooter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="flex items-start gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-accent/15 text-brand-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7h13l5 5v5h-3" /><path d="M3 7v10h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-brand-text">International delivery</h3>
            <p className="mt-1 text-xs text-brand-muted">
              We ship Hammerex products worldwide via tracked courier. Duties calculated at checkout.
            </p>
          </div>
        </article>

        <article className="flex items-start gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-accent/15 text-brand-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-brand-text">Pay in your currency</h3>
            <p className="mt-1 text-xs text-brand-muted">
              Checkout in IDR, USD, SGD, AUD or EUR. Live FX, no hidden conversion markup.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
