import { HOME_FAQ } from "@/lib/homeFaq";

// Visible FAQ block on the home page. Required pair to the FAQPage JSON-LD
// emitted in src/app/page.tsx — Google only awards the FAQ rich result when
// the same Q/A text is visible to the user. Rendered as native <details>
// elements so it works without JS and stays in flow.
export function HomeFaqSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="text-xl font-bold leading-tight text-brand-text sm:text-2xl">
        Construction tools, tool belts &amp; tool bags — common questions
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-brand-muted sm:text-sm">
        Quick answers for tradesmen, hardware stores and building merchants buying direct from the Hammerex workshop.
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:gap-3">
        {HOME_FAQ.map((entry, i) => (
          <li key={i}>
            <details className="group rounded-2xl border border-brand-line bg-brand-surface p-4 transition open:border-brand-accent">
              <summary className="flex cursor-pointer items-start justify-between gap-3 text-sm font-bold text-brand-text marker:content-[''] sm:text-base">
                <span>{entry.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand-line text-brand-accent transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[13px] leading-relaxed text-brand-muted sm:text-sm">
                {entry.a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
