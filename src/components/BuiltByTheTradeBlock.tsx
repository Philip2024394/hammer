// Origin-story block on the home page. Frames Yogyakarta as a strength,
// not a footnote — named factory city, designed-by-us positioning, and a
// real workshop photo as the visual lead.

export function BuiltByTheTradeBlock() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-brand-line bg-brand-surface p-6 sm:grid-cols-[1fr_1fr] sm:p-10">
        <div className="flex flex-col justify-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Designed by us · Made by us · Shipped direct
          </p>
          <h2 className="text-2xl font-bold text-brand-text sm:text-3xl">
            Yogyakarta, Indonesia — the Hammerex factory.
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">
            Every Hammerex trowel holder, tool bag, leather belt and electrician&apos;s
            pouch is designed in-house and stitched in our own Yogyakarta workshop.
            Cutting, sewing, riveting, QC and pack-out all happen under one roof.
            No outsourced assembly. No reseller markup. Direct from the team that
            built it to the tradesman who&apos;ll use it.
          </p>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs leading-relaxed text-brand-muted sm:grid-cols-2">
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
                <span className="font-semibold text-brand-text">3-year repair warranty.</span>{" "}
                We re-stitch, re-rivet, replace.
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

        <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
          <img
            src="https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasdsdasddfsdf.png?updatedAt=1781539251070"
            alt="Inside the Hammerex factory in Yogyakarta, Indonesia — cutting, stitching and QC stations under one roof"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-10 text-xs uppercase tracking-widest text-white">
            <span className="font-semibold">Hammerex Factory</span>
            <span className="text-brand-accent">Yogyakarta · Indonesia</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
