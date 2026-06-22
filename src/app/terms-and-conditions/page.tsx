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

          <Block title="Customs duties, taxes and carrier responsibility">
            <p>
              Hammerex Products is a{" "}
              <span className="font-semibold text-brand-text">manufacturer of goods</span>, not
              a carrier or customs broker. All international consignments are dispatched{" "}
              <span className="font-semibold text-brand-text">DDU (Delivered Duty Unpaid)</span>{" "}
              and are carried by{" "}
              <span className="font-semibold text-brand-text">EMS (Express Mail Service)</span>{" "}
              or an equivalent international postal carrier nominated at the time of dispatch.
            </p>
            <p className="mt-3 text-brand-muted">
              Import duties, VAT, GST, customs clearance fees, brokerage charges and any other
              taxes or levies imposed by the destination country are the{" "}
              <span className="font-semibold text-brand-text">sole responsibility of the buyer</span>.
              Hammerex Products is not responsible for any such charges, nor for parcels delayed,
              detained, returned or destroyed by customs in the destination country.
            </p>
            <p className="mt-3 text-brand-muted">
              We strongly recommend that buyers check their own country's import duty rates,
              VAT thresholds and customs procedures for the relevant product category before
              placing the order. Hammerex Products cannot advise on any specific country's
              customs treatment of any specific order.
            </p>
          </Block>

          <Block title="Tracking, delivery delays and carrier service issues">
            <p>
              Once a consignment is handed to{" "}
              <span className="font-semibold text-brand-text">EMS</span> or any other nominated
              carrier, that carrier — not Hammerex — controls the routing, transit times,
              delivery attempts, redelivery scheduling and any holding at sorting offices or
              customs facilities. The carrier is operating under its own published terms of
              service.
            </p>
            <p className="mt-3 text-brand-muted">
              <span className="font-semibold text-brand-text">It is the buyer's responsibility</span>{" "}
              to monitor the tracking number issued at dispatch and to deal directly with the
              carrier and the destination country's customs authority for any issue concerning
              the in-transit parcel — including but not limited to: delays in transit, missed
              delivery attempts, redelivery rescheduling, customs holds, requests for additional
              import paperwork, payment of duties or taxes, or return-to-sender events.
            </p>
            <p className="mt-3 text-brand-muted">
              Hammerex Products is a manufacturer and cannot intervene in the operations of an
              independent carrier or a foreign customs authority. Hammerex will provide the
              original dispatch documentation, the consignment reference and the airway bill on
              request, which is everything we can do to support a buyer-initiated investigation.
              Beyond that, the carrier and the customs authority are the correct points of
              contact.
            </p>
            <p className="mt-3 text-brand-muted">
              By placing an order with Hammerex Products, you acknowledge that the carrier and
              the destination customs authority are independent third parties, and that
              Hammerex Products cannot be held responsible for the service standard, decisions
              or delays of any third-party organisation.
            </p>
          </Block>

          <Block title="Quality control and CCTV evidence chain">
            <p>
              Every Hammerex item passes through multiple quality-control stations during
              manufacturing and a final inspection at dispatch. Each station is recorded by
              CCTV, and a date- and order-stamped video log is retained for{" "}
              <span className="font-semibold text-brand-text">at least 12 months</span> after
              dispatch.
            </p>
            <p className="mt-3 text-brand-muted">
              The CCTV record allows us to verify the condition of every product at the moment
              it leaves our workshop. If a damage or defect claim is raised after dispatch, we
              will check our CCTV record for that order before issuing a decision. This is in
              place to protect both honest customers (whose genuine complaints are confirmed
              and resolved quickly) and Hammerex (against fraudulent claims that the product
              was supplied defective when it was not).
            </p>
            <p className="mt-3 text-brand-muted">
              By placing an order with Hammerex, you acknowledge that our internal CCTV record
              forms part of the evidence we may rely on when assessing post-delivery damage or
              defect claims.
            </p>
          </Block>

          <Block title="Inspect your order on receipt">
            <p>
              Every customer is asked to{" "}
              <span className="font-semibold text-brand-text">inspect their order within 48 hours of delivery</span>
              {" "}and to record short photographs or a video of each item being unpacked.
            </p>
            <p className="mt-3 text-brand-muted">
              Any concern about the condition or specification of an item must be reported to
              the Hammerex team by email or phone within that 48-hour window, supported by your
              unpacking photographs or video, your order reference and the courier tracking
              number. Reports received within this window will be treated as on-arrival claims
              and resolved promptly.
            </p>
            <p className="mt-3 text-brand-muted">
              This inspection requirement does not override any statutory right available to you
              as a consumer. Latent defects (faults that could not reasonably be detected on
              inspection) remain covered for the period set out in the warranty section below
              and under the UK Consumer Rights Act 2015.
            </p>
          </Block>

          <section id="warranty-and-repair" className="flex flex-col gap-4">
          <Block title="1-Year full warranty">
            <p>
              In addition to your statutory rights under the UK Consumer Rights Act 2015,
              Hammerex offers a{" "}
              <span className="font-semibold text-brand-text">12-month full warranty</span>{" "}
              against confirmed manufacturing defects on every product we sell. The warranty
              runs from the date of dispatch and is non-transferable.
            </p>
            <p className="mt-3 font-semibold text-brand-text">How year-1 cover works</p>
            <ul className="mt-2 flex flex-col gap-1 text-brand-muted">
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Contact the Hammerex team by email or phone with your order reference, photographs of the issue and a short description of the fault.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>We check the CCTV dispatch record for your order and confirm whether the fault is consistent with a manufacturing defect.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>If the claim is accepted, we issue a repair reference and a return address. <span className="font-semibold text-brand-text">Hammerex covers postage in both directions</span> using a tracked carrier of our choice.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>We repair the item at no charge for parts or labour and ship it back to you with <span className="font-semibold text-brand-text">return postage paid by Hammerex</span>. Where a repair is not economically possible, we may offer a replacement of the same or comparable specification at our discretion.</li>
            </ul>
            <p className="mt-3 text-brand-muted">
              Typical repair turnaround is 7 to 14 working days from receipt of the item at our
              workshop, subject to the nature of the repair and parts availability.
            </p>
          </Block>

          <Block title="Years 2–3 — workshop repair service">
            <p>
              Industrial-grade materials are built to take site abuse, but on a working tool
              bag in daily use, certain consumables eventually wear: zippers, stitching,
              fasteners, clings and rivets. Hammerex offers an extended workshop repair
              service for{" "}
              <span className="font-semibold text-brand-text">years 2 and 3 from dispatch</span>{" "}
              to keep your product working.
            </p>
            <p className="mt-3 font-semibold text-brand-text">How year-2 and year-3 cover works</p>
            <ul className="mt-2 flex flex-col gap-1 text-brand-muted">
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Contact the Hammerex team by email or phone with photographs and a short description of the issue.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>If the repair falls within scope, we issue a repair reference and a return address. <span className="font-semibold text-brand-text">The customer covers postage in both directions</span> using a carrier of their choice (we recommend a tracked service).</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Hammerex covers <span className="font-semibold text-brand-text">parts and labour at no extra charge</span> for smaller repairs (zippers, stitching, fasteners, clings, rivets and similar consumables).</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Where the work needed is substantial (full re-line, frame replacement, etc.) we will quote in advance and only proceed with your written approval.</li>
            </ul>
            <p className="mt-3 text-brand-muted">
              The year-2/3 repair service is a goodwill offering on top of your statutory rights
              and is not a manufacturer warranty. It does not extend the year-1 full-cover
              warranty period and does not apply to damage caused by misuse, accident,
              modification or third-party repair (see the next section).
            </p>
          </Block>

          <Block title="What the warranty does NOT cover">
            <p className="text-brand-muted">
              The 12-month full warranty covers manufacturing defects — that is, faults
              traceable to the materials, assembly or workmanship of the product. The years
              2–3 repair service covers consumable wear within reason. Neither covers:
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-brand-muted">
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Cosmetic wear from regular use (faded leather, scuffed corners, surface fading). Functional wear on consumables (zippers, stitching, fasteners, clings, rivets) is covered by the year-2/3 workshop repair service above.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Damage caused by accident, drop, impact or contact with sharp tools (cuts, punctures, slashes).</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Damage caused by misuse, including loading the product beyond its stated capacity, exposure to corrosive substances, or use outside the application the product is designed for.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Damage caused by modification, repair or alteration carried out by anyone other than Hammerex or a Hammerex-authorised repairer.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Damage caused by improper storage, including prolonged exposure to extreme moisture, heat or direct sunlight.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Cosmetic marks, stains, paint splashes, plaster residue and similar discolouration arising from on-site use — these are not defects.</li>
              <li className="flex gap-2"><span className="text-brand-accent">·</span>Items where the manufacturing identifier (SKU, batch label or stitch code) has been removed or altered.</li>
            </ul>
            <p className="mt-3 text-brand-muted">
              Where a returned item is found to be outside the warranty after inspection, we
              will contact you with photographs and a written explanation. You may then choose
              to pay for a quoted out-of-warranty repair, or have the item returned to you at
              your cost. Items left unclaimed for more than 30 days from notification may be
              recycled at our discretion.
            </p>
          </Block>
          </section>

          <Block title="Refunds and returns">
            Hammerex operates a <span className="font-semibold text-brand-text">72-hour return
            window from receipt of the order</span>. To return an item that you are unhappy
            with, send it back to Hammerex unused, in its original packaging, with your invoice
            and the reason for return enclosed. Once we receive and inspect the item, the
            agreed refund is issued via the original payment route, covering the
            <span className="font-semibold text-brand-text"> full product price</span>. The
            delivery charge is <span className="font-semibold text-brand-text">not refunded</span>
            — shipping is fulfilled by an independent courier and that service has already been
            provided. The buyer is responsible for return shipping costs unless the return is
            the result of a confirmed manufacturing defect within the 12-month warranty period,
            in which case Hammerex covers postage in both directions (see warranty section above).
          </Block>

          <Block title="Talk to us first">
            Most concerns are resolved fastest by speaking to our team before escalating. We
            respond within one working day and we will always treat a genuine complaint with
            respect. Reach us by email or phone on the contact details listed at checkout.
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
