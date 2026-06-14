import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Hammerex Products terms governing orders, freight booking, dispatch, claims, customs duties and refunds.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: {
    type: "article",
    title: `Terms and Conditions | ${BRAND.name}`,
    description:
      "Terms covering manufacturing, freight booking on your behalf, dispatch, claims, customs duties and refunds.",
    url: "/terms-and-conditions",
    siteName: BRAND.name,
    images: [{ url: BRAND.logo, alt: `${BRAND.name} terms` }]
  }
};

export default function TermsPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-3xl px-4 pt-10 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Legal</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-text sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          The terms governing orders placed with Hammerex Products.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10">
        <article className="flex flex-col gap-6 text-sm leading-relaxed">
          <Block title="About Hammerex Products">
            Hammerex Products is a registered manufacturing business operating in full compliance
            with all applicable laws and standards required for export licensing, daily commercial
            operations and product safety. Our registrations, certifications and operating permits
            are maintained current at all times.
          </Block>

          <Block title="Product specifications, materials and images">
            <p>
              Hammerex Products continuously refines and improves its product range. Materials,
              components, finishes, dimensions and design details may be changed, upgraded or
              substituted at any time and may differ from the photographs, illustrations,
              measurements or descriptions shown on this website.
            </p>
            <p className="mt-3 text-brand-muted">
              Our production and design schedule sometimes runs ahead of our digital updates —
              due to editing, content production and publishing lead times, the version of a
              product you receive may incorporate refinements that are not yet reflected
              online. We reserve the right to make these changes{" "}
              <span className="font-semibold text-brand-text">without prior notice</span>.
            </p>
            <p className="mt-3 text-brand-muted">
              What does not change is the Hammerex Products identity: the colour palette, the
              brand marks and the quality standards you know us for are consistent on every item
              that leaves our factory.
            </p>
          </Block>

          <Block title="Our role in your order">
            <p>
              Hammerex Products manufactures and dispatches goods.{" "}
              <span className="font-semibold text-brand-text">We are not a freight company.</span> When
              you place an international order with us, you authorise Hammerex to book outbound
              freight with a third-party courier on your behalf, using the most competitive rate
              available at the time of dispatch.
            </p>
          </Block>

          <Block title="Freight insurance">
            Freight insurance is optional and must be requested explicitly at the time of order.
            If you require insurance against loss or damage in transit, you must inform our team
            in writing before dispatch. Insurance premiums, where requested, are added to the
            freight invoice. Without an explicit insurance request, the order is dispatched
            uninsured and the standard carrier liability limits apply.
          </Block>

          <Block title="Once your order has been dispatched">
            Once your consignment is handed over to the freight company, the order becomes subject
            to that carrier&apos;s published terms, schedules and liability framework. Hammerex
            Products has no operational control over transit times, routing decisions or delivery
            scheduling beyond what the carrier publicly commits to. Estimated delivery windows
            quoted at checkout are advisory and based on the carrier&apos;s standard service levels
            for your destination.
          </Block>

          <Block title="Reporting lost or damaged consignments">
            <p>
              Any loss or damage must be reported to Hammerex Products{" "}
              <span className="font-semibold text-brand-text">within 24 hours of receiving the consignment</span>.
              A formal written report must be submitted to our team containing:
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-brand-muted">
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Clear photographs of the damage or evidence of loss</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>A copy of your original purchase receipt or order reference</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>The tracking number issued at dispatch</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>A brief description of the issue</li>
            </ul>
            <p className="mt-3 text-brand-muted">
              On receipt of a complete written report, Hammerex will act on your behalf with the
              carrier to investigate the claim and pursue the most appropriate resolution. We
              treat every complaint seriously and will keep you informed throughout.
            </p>
          </Block>

          <Block title="Damage visible at the point of delivery">
            If damage is visible at the moment of delivery, please refuse the consignment or note
            the damage on the delivery driver&apos;s documentation before signing. In most jurisdictions
            an in-transit damage claim is most effectively pursued directly with the delivery
            company at the point of handover. Please flag the issue to the delivery operative and
            then notify Hammerex within 24 hours as set out above.
          </Block>

          <Block title="Matters outside Hammerex control">
            <p className="text-brand-muted">
              While we will always work to resolve issues, the following situations fall outside
              our liability:
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-brand-muted">
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Delivery attempted but refused or missed because no one was available at the address provided</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Parcels held at a collection point and not collected within the carrier&apos;s holding period</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Tracking numbers issued and never used by the recipient to arrange delivery or collection</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Consignments held in customs at the destination country</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Delays caused by force majeure, weather, industrial action or carrier capacity</li>
            </ul>
            <p className="mt-3 text-brand-muted">
              In each of these cases the carrier&apos;s standard policy applies and Hammerex cannot
              intervene beyond providing the original dispatch documentation.
            </p>
          </Block>

          <Block title="Customs duties and import taxes">
            <p>
              All international consignments are dispatched{" "}
              <span className="font-semibold text-brand-text">DDU (Delivered Duty Unpaid)</span> unless
              explicitly agreed otherwise in writing. Import duties, VAT, GST, customs clearance
              fees and any other taxes levied by the destination country are the responsibility
              of the buyer.
            </p>
            <p className="mt-3 text-brand-muted">
              We strongly recommend checking your country&apos;s import duty and tax rates for the
              relevant product category before placing the order. Hammerex is not responsible for
              unexpected duty charges or for parcels delayed or returned due to unpaid duties at
              the destination.
            </p>
          </Block>

          <Block title="Refunds and returns">
            Refunds are processed once the product has been returned to Hammerex and inspected.
            On confirmation of receipt and condition, the agreed refund is issued via the original
            payment route. The buyer is responsible for return shipping costs unless the return is
            the result of a confirmed manufacturing defect.
          </Block>

          <Block title="Talk to us first">
            Most concerns are resolved fastest by speaking to our team before escalating. We
            respond within one working day and we will always treat a genuine complaint with
            respect. Reach us via WhatsApp on the number listed at checkout.
          </Block>
        </article>

        <p className="mt-8 text-xs text-brand-muted">
          These terms may be updated from time to time to reflect changes in carrier policy,
          regulation or business practice. The version in effect is the version published on this
          page at the time of order.
        </p>
      </section>

      <DeliveryFooter />
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">{title}</h2>
      <div className="mt-3 text-sm text-brand-text">{children}</div>
    </div>
  );
}
