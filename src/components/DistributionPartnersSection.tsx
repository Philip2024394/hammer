export function DistributionPartnersSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
        <div className="flex flex-col justify-between rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-6">
          <div>
            <h2 className="text-sm font-bold uppercase leading-tight tracking-wide text-brand-text sm:text-xl">
              Distribution Partners
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:mt-3 sm:text-sm">
              Hammerex partners with retailers and wholesale distributors worldwide.
              Transparent pricing, protected territories and fair monthly targets — designed
              around real demand in your market.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/partners"
              className="grid h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 sm:h-12 sm:text-xs"
            >
              <span>Become a partner</span>
              <span aria-hidden="true">→</span>
            </a>
            <p className="text-xs text-brand-muted sm:text-xs">
              Retail welcomed from 30 kg mixed product orders.
            </p>
          </div>
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-line bg-black">
          <img
            src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/d329efdf5c688fce.png"
            alt="Hammerex distribution partners"
            loading="lazy"
            decoding="async"
            width="800"
            height="600"
            className="block h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
