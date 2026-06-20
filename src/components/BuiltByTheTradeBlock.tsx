// Origin-story block on the home page. Frames Yogyakarta as a strength,
// not a footnote — named factory city, designed-by-us positioning, and a
// real workshop photo as the visual lead.

export function BuiltByTheTradeBlock() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:gap-6 sm:rounded-3xl sm:p-10 sm:grid-cols-[1fr_1fr]">
        <div className="order-2 flex flex-col justify-center gap-3 sm:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent sm:text-xs">
            Designed by us · Made by us · Shipped direct
          </p>
          <h2 className="text-xl font-bold leading-tight text-brand-text sm:text-3xl">
            Yogyakarta, Indonesia — the Hammerex factory.
          </h2>
          <p className="text-[13px] leading-relaxed text-brand-muted sm:text-sm">
            Every Hammerex trowel holder, tool bag, leather belt and electrician&apos;s
            pouch is designed in-house and stitched in our own Yogyakarta workshop.
            Cutting, sewing, riveting, QC and pack-out all happen under one roof.
            No outsourced assembly. No reseller markup. Direct from the team that
            built it to the tradesman who&apos;ll use it.
          </p>
          <ul className="mt-1 grid grid-cols-1 gap-2 text-[13px] leading-relaxed text-brand-muted sm:mt-2 sm:gap-1.5 sm:text-xs sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-accent">✓</span>
              <span>
                <span className="font-semibold text-brand-text">In-house design.</span>{" "}
                Tools built around real site problems.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-accent">✓</span>
              <span>
                <span className="font-semibold text-brand-text">CCTV-recorded QC.</span>{" "}
                Every unit inspected before pack.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-accent">✓</span>
              <span>
                <span className="font-semibold text-brand-text">Direct shipment.</span>{" "}
                EMS Air Mail Jakarta → your door.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-accent">✓</span>
              <span>
                <span className="font-semibold text-brand-text">1-year full warranty + 3-year repair service.</span>{" "}
                Year 1 we cover everything. Years 2–3 we still re-stitch, re-rivet, replace — you cover postage.
              </span>
            </li>
          </ul>
          <a
            href="/hammerex-group"
            className="mt-2 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent transition hover:opacity-80"
          >
            Read the Hammerex story →
          </a>
        </div>

        <figure className="relative order-1 aspect-[16/10] overflow-hidden rounded-xl bg-black sm:order-2 sm:aspect-[4/3] sm:rounded-2xl">
          <img
            src="https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasdsdasddfsdf.png?updatedAt=1781539251070"
            alt="Inside the Hammerex factory in Yogyakarta, Indonesia — cutting, stitching and QC stations under one roof"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2.5 pt-8 text-xs uppercase tracking-widest text-white sm:px-4 sm:pb-3 sm:pt-10 sm:text-xs">
            <span className="font-semibold">Hammerex Factory</span>
            <span className="text-brand-accent">Yogyakarta · Indonesia</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
