// Brand-promise strip rendered directly under the Hero on the home page.
// Two short statements separated by a brand-accent divider — kept static
// (no marquee, no animation) so the headline reads at a glance.
export function BrandStatementStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 py-3 sm:gap-6 sm:py-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-accent sm:text-sm">
          Designed by us
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-brand-accent/50 sm:h-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-accent sm:text-sm">
          Made by us
        </span>
      </div>
    </section>
  );
}
