import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Purchasing Tips",
  description:
    "Hammerex retail orders ship at £20 flat to UK, USA and Australia. Other countries are quoted on WhatsApp after checkout. Plus background on freight pricing for larger consignments.",
  alternates: { canonical: "/purchasing-tips" },
  openGraph: {
    type: "article",
    title: `Purchasing Tips | ${BRAND.name}`,
    description:
      "£20 flat shipping to UK, USA, Australia. Other countries confirmed on WhatsApp. Freight education for buyers consolidating heavier consignments.",
    url: "/purchasing-tips",
    siteName: BRAND.name,
    images: [{ url: BRAND.logo, alt: `${BRAND.name} purchasing tips` }]
  }
};

export default function PurchasingTipsPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-3xl px-4 pt-10 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Buyer guide
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-text sm:text-4xl">
          Purchasing Tips
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Retail orders ship at £20 flat to UK, USA and Australia. Other countries are confirmed on WhatsApp.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10">
        <article className="flex flex-col gap-8 text-sm leading-relaxed text-brand-text">
          <Block title="Direct retail — £20 flat to UK, USA, Australia">
            <p className="text-brand-muted">
              For everyday retail orders placed on this site, shipping is a flat
              <span className="font-semibold text-brand-text"> £20 per order </span>
              to UK, USA and Australia regardless of basket size. Dispatched within 3 working
              days via EMS Air Mail — 5–6 days transit. Import duties and local taxes are the
              buyer&apos;s responsibility on arrival.
            </p>
            <p className="mt-3 text-brand-muted">
              Shipping to other countries is confirmed on WhatsApp after you submit the
              checkout form — we quote the actual EMS rate to your destination before you pay.
              The sections below explain how freight really works under the hood — useful if
              you&apos;re consolidating a heavier consignment, using your own forwarder, or
              quoting a wholesale order outside the flat-rate retail flow.
            </p>
          </Block>

          <Block title="Why small orders can look expensive">
            <p className="text-brand-muted">
              Freight is rarely cheap on small parcels, and the reason is simple. Every international
              shipment carries the same fixed administrative cost regardless of weight — customs
              clearance, handling, fuel surcharges and the carrier&apos;s minimum-charge billing all apply
              whether the parcel weighs 200 g or 2 kg. That fixed overhead is divided across however
              many items you order, so a one-piece order absorbs the entire cost while a multi-piece
              order spreads it.
            </p>
          </Block>

          <Block title="The 2 kg – 7 kg sweet spot">
            <p className="text-brand-muted">
              For most international carriers, freight pricing plateaus after about <span className="font-semibold text-brand-text">2 kilograms</span>.
              From that point onward — typically up to <span className="font-semibold text-brand-text">5&nbsp;to&nbsp;7&nbsp;kilograms</span> — the price stays
              very close to flat. In practice a 5 kg order often costs nearly the same to ship as a 2 kg one.
              Once the carrier&apos;s fixed administrative costs are covered, additional weight is billed
              at a fraction of the per-item rate.
            </p>
            <p className="mt-3 text-brand-muted">
              If you are planning several purchases over the coming months, ordering them together
              rather than separately can meaningfully reduce your per-item delivery cost.
            </p>
          </Block>

          <Block title="Sea freight vs air freight">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <h3 className="text-sm font-semibold text-brand-text">Air freight</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-accent">5–6 days transit · worldwide</p>
                <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                  The choice most customers make for site-ready orders and urgent jobs. Pricing is by
                  weight with the 2 kg / 7 kg sweet-spot dynamic above, so combining items meaningfully
                  reduces the per-item cost.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-brand-muted">
                  Dispatch is estimated at 3 working days and confirmed on the WhatsApp quote based on
                  production readiness at the moment of order.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <h3 className="text-sm font-semibold text-brand-text">Sea freight</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-accent">30–60 days · sometimes 21</p>
                <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                  Significantly cheaper per kilogram, especially on larger or heavier orders. We have
                  seen consignments land in as little as 21 days depending on destination and shipping
                  calendars. The wait can feel long on day one, but the order is always one day closer
                  than yesterday — and the cost saving on arrival is meaningful.
                </p>
              </div>
            </div>
          </Block>

          <Block title="Self-collection or your own carrier">
            <p className="text-brand-muted">
              We are happy to release goods for collection by your own freight forwarder. Some buyers
              hold negotiated rates with carriers we do not work with — often for specific country
              pairs or trade lanes — and we have no objection to you using them. If you have a
              preferred forwarder, tell us at the quote stage and we will package and label the order
              ready for their collection.
            </p>
          </Block>

          <Block title="We will always find the fairest rate">
            <p className="text-brand-muted">
              Our team checks live rates with multiple carriers for every order. We are not tied to a
              single forwarder and we share the booking detail openly before dispatch. If anything in
              the freight quote surprises you, ask — we will walk you through how it was priced.
            </p>
          </Block>

          <Block title="Understanding makes the checkout cost acceptable">
            <p className="text-brand-muted">
              Freight pricing is rarely intuitive. The more you understand about how international
              shipping is built, the better the value you can extract from every order. Knowing the
              fixed-overhead structure — and the 2 kg / 7 kg plateau — turns a checkout number that
              can initially look high into a price that makes practical sense.
            </p>
          </Block>

          <Block title="Talk to us">
            <p className="text-brand-muted">
              If you have a question about freight, shipping or timing on a specific order, our team
              is happy to discuss it before you commit. International logistics has its own rhythm
              and we would rather explain it once than have a customer surprised at checkout.
            </p>
          </Block>
        </article>
      </section>

      <DeliveryFooter />
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">{title}</h2>
      <div className="mt-3 text-sm">{children}</div>
    </div>
  );
}
