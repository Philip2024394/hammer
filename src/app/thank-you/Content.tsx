"use client";

import { useSearchParams } from "next/navigation";

export function ThankYouContent() {
  const params = useSearchParams();
  const ref = params.get("ref")?.trim();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-brand-accent/40 bg-brand-accent/10 text-brand-accent">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>

      <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide text-brand-text sm:text-3xl">
        Thanks — your request is in.
      </h1>

      {ref && (
        <div className="mt-5 rounded-2xl border border-brand-accent/40 bg-brand-accent/10 px-5 py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Your reference</span>
          <div className="mt-1 font-mono text-lg font-bold tracking-wider text-brand-accent">
            {ref}
          </div>
        </div>
      )}

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
        The Hammerex team has your order and contact details. We&rsquo;ll be in touch by
        email or phone within 24 hours with a combined delivery quote for your whole
        order &mdash; no payment is taken until you&rsquo;ve seen and accepted it.
      </p>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-text sm:text-base">
        We appreciate your interest in Hammerex products and look forward to quoting you at the soonest.
      </p>

      <a
        href="/"
        className="mt-8 grid h-12 grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-brand-accent px-6 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 sm:text-sm"
      >
        <span>View products</span>
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
