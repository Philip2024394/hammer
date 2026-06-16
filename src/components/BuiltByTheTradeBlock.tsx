// "Built by the trade" trust block — short founder/factory story for the
// home page. The copy here is intentionally generic until the user provides
// the real story; swap the paragraph and replace the photo URL with a
// genuine workshop / founder photo when ready.
//
// Update points:
//   - the paragraph text below
//   - the photo (currently the Hammerex logo as a clean placeholder)
//   - the optional metric chips at the bottom (orders shipped, etc.) once
//     there's honest data to display
export function BuiltByTheTradeBlock() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-brand-line bg-brand-surface p-6 sm:grid-cols-[1fr_1fr] sm:p-10">
        <div className="flex flex-col justify-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Built by the trade
          </p>
          <h2 className="text-2xl font-bold text-brand-text sm:text-3xl">
            Made in the workshop. Tested on site.
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">
            Hammerex is a small manufacturing team designing tool gear we use
            ourselves. Every belt holder, bag and trowel ships out of our own
            workshop after being reviewed and stitched by hand. We deal direct
            with customers on WhatsApp because tradespeople deserve a real
            human at the other end of the order, not a ticket queue.
          </p>
          <p className="text-xs text-brand-muted">
            <span className="font-semibold text-brand-text">Note for the team:</span>{" "}
            replace this paragraph with the real founder bio + a workshop
            photo when ready.
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
          <img
            src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png"
            alt="Hammerex"
            className="absolute inset-0 h-full w-full object-contain p-8"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
