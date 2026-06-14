import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { PartnersApplicationForm } from "@/components/PartnersApplicationForm";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Distribution Partners",
  description:
    "Retail and wholesale distribution partnerships with Hammerex. Protected territories, transparent pricing, fair monthly targets.",
  alternates: { canonical: "/partners" },
  openGraph: {
    type: "website",
    title: `Distribution Partners | ${BRAND.name}`,
    description:
      "Apply to distribute Hammerex tools and PPE — retail welcomed from 30 kg mixed orders, wholesale by territory.",
    url: "/partners",
    siteName: BRAND.name,
    images: [{ url: BRAND.logo, alt: `${BRAND.name} distribution partners` }]
  }
};

export default function PartnersPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:pt-14 sm:pb-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Distribution partners · Retail &amp; Wholesale
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-brand-text sm:text-5xl lg:text-[64px]">
              Products with{" "}
              <span className="text-brand-accent">no market competition.</span>{" "}
              Distribute what others can&apos;t.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
              Hammerex engineers tools and PPE that don&apos;t share shelves with anyone else.
              The distribution programme is built on transparent pricing, protected territories
              and fair monthly volume targets — shaped around real demand in your market rather
              than blanket terms.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="grid h-12 place-items-center rounded-full bg-brand-accent px-6 text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
              >
                Apply now
              </a>
              <a
                href="#programme"
                className="grid h-12 place-items-center rounded-full border border-brand-line bg-brand-surface px-6 text-xs font-bold uppercase tracking-widest text-brand-text hover:border-brand-accent"
              >
                Programme details
              </a>
            </div>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-brand-bg lg:aspect-square">
            <img
              src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/89eca7553db90793.png"
              alt="Hammerex distribution — retail and wholesale partners"
              className="block h-full w-full object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section id="programme" className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent/15 text-brand-accent">
                <Shop />
              </span>
              <h2 className="text-lg font-semibold text-brand-text">Retail Distribution</h2>
            </div>
            <p className="text-sm leading-relaxed text-brand-muted">
              Open to independent retailers, tool merchants and trade counters. Each retail
              partner is allocated a dedicated trading area and pricing tier confirmed once your
              application is reviewed.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-brand-muted">
              <li className="flex gap-2"><Tick /><span>Minimum order from <span className="text-brand-text">30 kg</span> of mixed Hammerex products.</span></li>
              <li className="flex gap-2"><Tick /><span>Samples available on request at our published list prices.</span></li>
              <li className="flex gap-2"><Tick /><span>Counter displays and promotional stands available on qualifying volume orders.</span></li>
              <li className="flex gap-2"><Tick /><span>Dedicated trading area for each retail outlet — no overlapping accounts.</span></li>
              <li className="flex gap-2"><Tick /><span>Retail pricing confirmed individually based on territory and product mix.</span></li>
            </ul>
          </article>

          <article className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent/15 text-brand-accent">
                <Truck />
              </span>
              <h2 className="text-lg font-semibold text-brand-text">Wholesale Distribution</h2>
            </div>
            <p className="text-sm leading-relaxed text-brand-muted">
              Appointed wholesale distributors are granted an allocated regional area with
              clearly defined monthly volume targets. Sole-territory appointments are available
              where stock commitment supports a protected market.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-brand-muted">
              <li className="flex gap-2"><Tick /><span>Protected regional allocation with agreed monthly volume targets.</span></li>
              <li className="flex gap-2"><Tick /><span>Required to stock the full Hammerex product line.</span></li>
              <li className="flex gap-2"><Tick /><span>Sole-territory option available subject to stock and volume commitment.</span></li>
              <li className="flex gap-2"><Tick /><span>Co-funded promotional materials, display stands and POS support on qualifying orders.</span></li>
              <li className="flex gap-2"><Tick /><span>Direct access to our sourcing team for branded or custom orders.</span></li>
              <li className="flex gap-2"><Tick /><span>Wholesale pricing confirmed once distributor details are reviewed.</span></li>
            </ul>
          </article>
        </div>
      </section>

      <PartnersApplicationForm />

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
          <h3 className="text-sm font-semibold text-brand-text">What happens next</h3>
          <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <li className="rounded-xl border border-brand-line bg-black/30 p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">1 · Review</span>
              <p className="mt-1 text-xs text-brand-muted">Our team reviews your application within two working days.</p>
            </li>
            <li className="rounded-xl border border-brand-line bg-black/30 p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">2 · Pricing & terms</span>
              <p className="mt-1 text-xs text-brand-muted">Retail or wholesale pricing, territory and monthly targets confirmed in writing.</p>
            </li>
            <li className="rounded-xl border border-brand-line bg-black/30 p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">3 · First order</span>
              <p className="mt-1 text-xs text-brand-muted">Samples or first stocking order dispatched with promotional materials where applicable.</p>
            </li>
          </ol>
        </div>
      </section>

      <DeliveryFooter />
    </main>
  );
}

function Shop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l2-5h14l2 5" /><path d="M3 9v11h18V9" /><path d="M9 20v-6h6v6" />
    </svg>
  );
}
function Truck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h13v9H3z" /><path d="M16 10h4l1 2v4h-5" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-accent" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
