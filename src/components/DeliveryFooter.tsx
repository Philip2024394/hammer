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
            <h3 className="text-sm font-semibold text-brand-text">International shipping — quoted per order</h3>
            <p className="mt-1 text-xs text-brand-muted">
              Dispatched in 4–5 working days. Carrier-estimated air freight transit
              ~5–7 days; sea freight is approximately 3–4 weeks for most countries
              (varies country to country). Shipping cost is confirmed on WhatsApp after
              checkout based on destination, weight and freight method (air or sea).
              Import duties and local taxes are not included and are paid by the buyer
              on arrival.
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
              Settle in GBP, IDR, USD, SGD, AUD or EUR through Hammerex multi-currency
              accounts — at the lowest transaction fees, with live FX and no hidden
              conversion markup.
            </p>
          </div>
        </article>
      </div>

      <nav className="mt-6 flex flex-wrap items-center justify-center gap-1 text-xs font-semibold uppercase tracking-widest text-brand-muted" aria-label="Site links">
        {[
          { href: "/", label: "Home" },
          { href: "/guides", label: "Guides" },
          { href: "/hammerex-group", label: "Hammerex Group" },
          { href: "/purchasing-tips", label: "Purchasing tips" },
          { href: "/partners", label: "Distribution partners" },
          { href: "/terms-and-conditions", label: "Terms & conditions" }
        ].map((l) => (
          <a key={l.href} href={l.href} className="inline-flex min-h-11 items-center rounded-full px-3 transition hover:text-brand-accent">{l.label}</a>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://www.instagram.com/hammerexproductsdirect/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Hammerex on Instagram"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold uppercase tracking-widest text-brand-muted transition hover:border-brand-accent hover:text-brand-accent active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          @hammerexproductsdirect
        </a>
        <a
          href="https://www.youtube.com/@hammerexdirect"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch Hammerex on YouTube"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 text-xs font-semibold uppercase tracking-widest text-brand-muted transition hover:border-red-500 hover:text-red-400 active:scale-95"
        >
          <span aria-hidden="true" className="grid h-5 w-7 place-items-center rounded bg-[#FF0000] text-white">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          @hammerexdirect
        </a>
      </div>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-brand-line bg-brand-surface px-5 py-4">
        <h4 className="text-center text-xs font-bold uppercase tracking-widest text-brand-accent">
          Intellectual property notice
        </h4>
        <p className="mt-2 text-center text-xs leading-relaxed text-brand-muted">
          The Hammerex product line — including designs, dimensions, tooling, branding
          and manufacturing methods used across our Europe, USA and Asia operations — is
          the intellectual property of Hammerex Products and is protected by applicable
          design rights, design patents, trademarks and trade-dress laws. Unauthorised
          manufacture, reproduction, distribution or resale of any Hammerex product
          without the prior written permission of Hammerex Products will be pursued
          through injunctive relief, damages and licensing fees in every jurisdiction in
          which it occurs.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} Hammerex Products. All rights reserved.
      </p>
    </section>
  );
}
