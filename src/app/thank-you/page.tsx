import { Header } from "@/components/Header";

export const dynamic = "force-static";

export const metadata = {
  title: "Thanks — Hammerex"
};

export default function ThankYouPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-brand-accent/40 bg-brand-accent/10 text-brand-accent">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide text-brand-text sm:text-3xl">
          Thanks — your request is on its way.
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
          The Hammerex team will be in touch shortly via WhatsApp — usually within 24 hours. We appreciate your support and look forward to working with you.
        </p>

        <a
          href="/"
          className="mt-8 grid h-12 grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-brand-accent px-6 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 sm:text-sm"
        >
          <span>View products</span>
          <span aria-hidden="true">→</span>
        </a>

        <p className="mt-6 text-xs text-brand-muted">
          Didn't see WhatsApp open? Reload the previous tab and resubmit, or message us on{" "}
          <a href="https://wa.me/6281392000050" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">
            WhatsApp
          </a>
          .
        </p>
      </section>
    </main>
  );
}
