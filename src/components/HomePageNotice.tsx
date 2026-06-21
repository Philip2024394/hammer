// Running-marquee notice strip placed directly under the Hero on the home
// page. Uses the existing hammerex-marquee animation defined in globals.css.
// The message string below is editable in one place — keep it short so the
// marquee reads at a glance.
const NOTICE =
  "Production update: a handful of products are dispatching slightly later than usual this week as we work through a manufacturing backlog. We're catching up — standard 4–5 working-day dispatch resumes in the coming week. Thanks for your patience.";

export function HomePageNotice() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div
        className="hammerex-marquee-mask relative overflow-hidden rounded-full border border-brand-accent/40 bg-brand-accent/5 py-2"
        aria-label="Production notice"
      >
        <span
          className="hammerex-marquee-track px-4 text-xs font-semibold uppercase tracking-wider text-brand-accent"
          style={{ animationDuration: "90s" }}
        >
          ⚠ {NOTICE}&nbsp;&nbsp;·&nbsp;&nbsp;⚠ {NOTICE}&nbsp;&nbsp;·&nbsp;&nbsp;
        </span>
      </div>
    </section>
  );
}
