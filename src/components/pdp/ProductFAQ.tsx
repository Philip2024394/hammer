// Curated, editorial FAQ rendered on the PDP. Distinct from QABlock which
// holds user-submitted Q&A. The content here is hand-written for SEO so
// each question matches a real long-tail search query (sourced from Google
// "People Also Ask", Reddit, AnswerThePublic). The same data also drives
// FAQPage JSON-LD via faqJsonLd() inlined in the page-level <script>.

export function ProductFAQ({ faq }: { faq: { q: string; a: string }[] | null }) {
  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-lg font-semibold text-brand-text">Frequently asked</h2>
        <p className="mb-6 text-xs text-brand-muted">
          The questions buyers ask before ordering — answered honestly.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {faq.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-brand-line bg-brand-surface p-4 open:bg-brand-bg"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-brand-text">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-block shrink-0 rounded-full bg-brand-accent/15 px-2 text-xs font-bold text-brand-accent transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-brand-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
