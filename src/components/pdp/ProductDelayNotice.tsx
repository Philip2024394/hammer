// Optional dispatch-delay marquee shown directly under the gallery/banner
// section on a PDP. Slug-keyed so only products currently affected by a
// production backlog display it — promote to a `delay_notice` column on
// `hammerex_products` if more than 2-3 products need this at once.
const DELAY_NOTICES: Record<string, string> = {
  "electrician-pro-pouch":
    "Possible dispatch delay on this product — we're currently at maximum factory output. We're working to stay within stated lead times, and our team will confirm your delivery window when your order is processed."
};

export function ProductDelayNotice({ slug }: { slug: string | null }) {
  const message = slug ? DELAY_NOTICES[slug] : null;
  if (!message) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div
        className="hammerex-marquee-mask relative overflow-hidden rounded-full border border-brand-accent/40 bg-brand-accent/5 py-2"
        aria-label="Production notice"
      >
        <span
          className="hammerex-marquee-track px-4 text-xs font-semibold uppercase tracking-wider text-brand-accent"
          style={{ animationDuration: "60s" }}
        >
          ⚠ {message}&nbsp;&nbsp;·&nbsp;&nbsp;⚠ {message}&nbsp;&nbsp;·&nbsp;&nbsp;⚠ {message}&nbsp;&nbsp;·&nbsp;&nbsp;
        </span>
      </div>
    </section>
  );
}
