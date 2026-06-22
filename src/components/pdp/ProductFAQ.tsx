// Curated, editorial FAQ rendered on the PDP. Distinct from QABlock which
// holds user-submitted Q&A. The content here is hand-written for SEO so
// each question matches a real long-tail search query (sourced from Google
// "People Also Ask", Reddit, AnswerThePublic). The same data also drives
// FAQPage JSON-LD via faqJsonLd() inlined in the page-level <script>.
//
// Renders product-specific FAQ entries (if the product has any) followed by
// the brand-wide workshop FAQ — every PDP fills with at least 12 honest
// Q&As that cover shipping, dispatch, factory provenance, branding,
// warranty, multi-buy maths, etc.

import { WORKSHOP_FAQ } from "@/lib/workshopFaq";

export function ProductFAQ({ faq }: { faq: { q: string; a: string }[] | null }) {
  const productFaq = faq ?? [];

  return (
    <section id="faq" className="border-t border-brand-line py-6">
      <div className="mx-auto max-w-6xl px-4">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3">
            <h2 className="text-lg font-semibold text-brand-text">Got a question? We've got the answer.</h2>
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent text-black transition group-open:rotate-180">▾</span>
          </summary>
          <p className="mb-4 text-xs text-brand-muted">
            Plain answers from the people who actually make the product. Tap a question to expand.
          </p>

          {productFaq.length > 0 && (
            <>
              <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-brand-accent">
                About this product
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {productFaq.map((f, i) => (
                  <FaqItem key={`p-${i}`} q={f.q} a={f.a} />
                ))}
              </div>
            </>
          )}

          <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-brand-accent">
            About Hammerex
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WORKSHOP_FAQ.map((f, i) => (
              <FaqItem key={`w-${i}`} q={f.q} a={f.a} />
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group/q rounded-2xl border border-brand-line bg-brand-surface p-4 open:bg-brand-bg">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-brand-text">
        <span>{q}</span>
        <span
          aria-hidden="true"
          className="mt-0.5 inline-block shrink-0 rounded-full bg-brand-accent/15 px-2 text-xs font-bold text-brand-accent transition group-open/q:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-xs leading-relaxed text-brand-muted">{a}</p>
    </details>
  );
}
