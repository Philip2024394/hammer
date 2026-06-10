export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pt-6">
        <div className="relative h-[260px] overflow-hidden rounded-2xl border border-brand-line sm:h-[340px]">
          <img
            src="https://ik.imagekit.io/pinky/Untitledsadasdasdaaaaa.png?updatedAt=1781088184697"
            alt="Featured products"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/30 to-transparent" />
          <div className="relative flex h-full flex-col justify-end gap-2 p-6">
            <p className="text-xs uppercase tracking-widest text-brand-accent">New season</p>
            <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">Built for everyday utility.</h1>
            <p className="max-w-md text-sm text-brand-muted">
              Tools, gear and essentials — shipped internationally from Hammerex.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
