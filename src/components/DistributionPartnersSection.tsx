export function DistributionPartnersSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
        <a
          href="/partners"
          aria-label="Become a Hammerex distribution partner"
          className="block aspect-[4/3] overflow-hidden rounded-2xl border border-brand-line bg-black transition hover:border-brand-accent"
        >
          <img
            src="https://ik.imagekit.io/9mrgsv2rp/Untitledbvfsdfasdasdasdfsdfsdsdf.png"
            alt="Built for professionals. Backed by partners — become a Hammerex distribution partner"
            loading="lazy"
            decoding="async"
            width="800"
            height="600"
            className="block h-full w-full object-cover object-center"
          />
        </a>

        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-line bg-black">
          <img
            src="https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2004_13_00%20AM.png"
            alt="Hammerex freight — international distribution"
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
