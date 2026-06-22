import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Purchasing Tips",
  description:
    "Why Hammerex quotes every delivery by email or phone — best combined rate for your whole order, free space in the parcel for extras and a real person to talk to. Plus how international freight is actually priced.",
  alternates: { canonical: "/purchasing-tips" },
  openGraph: {
    type: "article",
    title: `Purchasing Tips | ${BRAND.name}`,
    description:
      "Every Hammerex order is shipped after a per-order quote from the team — best combined rate for your basket, never per item. Plus background on freight pricing for larger consignments.",
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
          Every order is quoted by our customer-service team by email or phone —
          best combined rate for your whole basket, never per item.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10">
        <article className="flex flex-col gap-8 text-sm leading-relaxed text-brand-text">
          <Block title="Why we quote delivery per order">
            <p className="text-brand-muted">
              Hammerex products come in <span className="font-semibold text-brand-text">very different sizes and weights</span> —
              a leather belt sits in a flat envelope, a plastering caddy fills a small box,
              a scaffolders kit weighs several kilos. A single fixed checkout shipping rate
              has to assume the heaviest, biggest possible order and charge that to
              everyone, otherwise it loses money on the larger ones.
            </p>
            <p className="mt-3 text-brand-muted">
              We do it the other way round. You add what you want to your basket, submit
              your order details on the checkout page, and our team prices the actual parcel —
              single order group, real weight, real route, real carrier rate — and comes back
              to you by email or phone within <span className="font-semibold text-brand-text">24 hours</span> with
              the genuine combined cost before you pay.
            </p>
          </Block>

          <Block title="Group shipping is cheaper per item">
            <p className="text-brand-muted">
              When the team quotes your delivery as one parcel, the cost of the freight
              is spread across every item in it. The fixed carrier overheads (customs,
              handling, fuel surcharge, minimum-charge billing) are paid once for the
              whole order rather than once per item. The more you consolidate, the lower
              your per-item delivery cost ends up being.
            </p>
          </Block>

          <Block title="Free space in the parcel — bonus opportunity">
            <p className="text-brand-muted">
              When the team builds your parcel, there's often a small amount of unused
              space inside the box for the freight band you're already paying for.
              If there's an extra item you're interested in — a tape clip, a single
              spanner, a folding knife — we'll let you know it can travel along at little
              or no extra freight cost. You're under no obligation; we just flag the
              opportunity so you can decide.
            </p>
          </Block>

          <Block title="Why a fixed checkout rate can cost more">
            <p className="text-brand-muted">
              On a payment-gateway checkout with a fixed shipping rate, that rate has
              to cover the heaviest, biggest possible order — which means smaller orders
              are subsidising larger ones. You pay the same whether you ordered one
              pouch or a full kit. By quoting after the basket is finalised, we can
              charge the actual freight for the actual parcel, which is usually lower
              than any fixed rate that would cover the worst case.
            </p>
            <p className="mt-3 text-brand-muted">
              It adds a short conversation to the order, but it saves money — and
              gives you a person to talk to.
            </p>
          </Block>

          <Block title="Why small orders can look expensive">
            <p className="text-brand-muted">
              Freight is rarely cheap on small parcels, and the reason is simple. Every
              international shipment carries the same fixed administrative cost regardless
              of weight — customs clearance, handling, fuel surcharges and the carrier's
              minimum-charge billing all apply whether the parcel weighs 200 g or 2 kg.
              That fixed overhead is divided across however many items you order, so a
              one-piece order absorbs the entire cost while a multi-piece order spreads
              it.
            </p>
          </Block>

          <Block title="The 2 kg – 7 kg sweet spot">
            <p className="text-brand-muted">
              For most international carriers, freight pricing plateaus after about <span className="font-semibold text-brand-text">2 kilograms</span>.
              From that point onward — typically up to <span className="font-semibold text-brand-text">5&nbsp;to&nbsp;7&nbsp;kilograms</span> — the price stays
              very close to flat. In practice a 5 kg order often costs nearly the same to ship as a 2 kg one.
              Once the carrier's fixed administrative costs are covered, additional weight is billed
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
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-accent">~5–7 days transit · worldwide</p>
                <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                  The choice most customers make for site-ready orders and urgent jobs. Pricing is by
                  weight with the 2 kg / 7 kg sweet-spot dynamic above, so combining items meaningfully
                  reduces the per-item cost.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-brand-muted">
                  Dispatch is 3–5 working days after the quote is accepted and payment is
                  confirmed.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <h3 className="text-sm font-semibold text-brand-text">Sea freight</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-accent">~3–4 weeks · varies by country</p>
                <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                  Significantly cheaper per kilogram, especially on larger or heavier orders. Typical
                  transit is around 3–4 weeks for most destinations, though exact timing varies country
                  to country depending on shipping calendars and the route. The wait can feel long on
                  day one, but the order is always one day closer than yesterday — and the cost saving
                  on arrival is meaningful.
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

          <Block title="Customer service is part of the deal">
            <p className="text-brand-muted">
              Having a real person on the other end of the order is one of the things that makes
              Hammerex worth choosing. Stock questions, size advice, urgent timing, partial dispatch,
              wholesale pricing, add-on parts — whatever the question is, the team is there to help
              before, during and after the order. It costs you nothing and it saves time on both sides.
            </p>
            <a
              href="/checkout"
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black transition hover:opacity-90 active:scale-[0.98]"
            >
              Start a quote request
            </a>
          </Block>

          <Block title="Talk to us — email or phone">
            <p className="text-brand-muted">
              The fastest way to ask a freight question, check stock, request a custom run or kick
              off an order is to submit your basket on the checkout page. Our team will reply by
              email or phone to confirm pricing, freight and dispatch. We aim to answer every
              enquiry within one working day — most are far faster.
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
