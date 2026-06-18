import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hammerex Group",
  description:
    "Hammerex Group — a registered manufacturer of construction tools, PPE and trade accessories. Fifteen years of innovative product design, audited standards and direct world-market distribution.",
  alternates: { canonical: "/hammerex-group" },
  openGraph: {
    type: "article",
    title: `Hammerex Group | ${BRAND.name}`,
    description:
      "Manufacturer of innovative construction tools and accessories from our Yogyakarta factory. Standards, innovation, daily operations and the retail-across-Asia distribution model.",
    url: "/hammerex-group",
    siteName: BRAND.name,
    images: [{ url: "https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasdsdasddfsdf.png", alt: `${BRAND.name} factory in Yogyakarta, Indonesia` }]
  }
};

export default function HammerexGroupPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:pt-14">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          The Hammerex Group
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-text sm:text-5xl lg:text-[60px]">
          Fifteen years of building better tools for the trades.
        </h1>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-brand-muted sm:text-base">
          Hammerex is a registered manufacturing business engineering innovative tools,
          PPE and trade accessories for construction and daily professional use. Fifteen
          years on from the first Hammerex product landing on the market, the company
          has grown from strength to strength — adding categories, partners and markets
          year on year — while keeping the same operating principle that started it all:
          solve a real problem, build it to last, sell it at a fair price.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <figure className="overflow-hidden rounded-2xl border border-brand-line bg-black">
          <img
            src="https://ik.imagekit.io/9mrgsv2rp/Untitledewrwerwerwerwerwerwerasdasdsdasddfsdf.png"
            alt="Inside the Hammerex factory in Yogyakarta, Indonesia — cutting, stitching and quality-inspection stations"
            loading="lazy"
            decoding="async"
            className="block aspect-[16/9] w-full object-cover"
          />
          <figcaption className="border-t border-brand-line px-4 py-3 text-xs uppercase tracking-widest text-brand-muted">
            Inside the Hammerex factory in Yogyakarta, Indonesia — cutting, stitching and quality inspection under one roof.
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <article className="flex flex-col gap-6 text-sm leading-relaxed text-brand-text">
          <Block title="Our story" eyebrow="From one product to a full range">
            Fifteen years ago Hammerex entered the market with a single, purpose-engineered
            tool designed to do one job better than anything else available at the time.
            That product earned its place in the trades by performance, not marketing —
            and it set the standard the company has carried forward ever since. Every
            item added to the range since has been measured against the same brief:
            does it solve a real problem on site, is it built to outlast the alternatives,
            and is it priced honestly. Every year since launch has added new products,
            new partners and new markets.
          </Block>

          <Block title="Standards" eyebrow="Compliance and quality">
            Hammerex is a registered company operating in full compliance with the laws
            and standards required for manufacturing, export licensing and product
            safety. Materials are audited against published specifications. Every
            production batch is inspected before stock release, and safety-critical
            items are independently tested. Our certifications and operating permits
            are maintained current as a baseline expectation, not a one-time achievement.
          </Block>

          <Block title="Innovation" eyebrow="Designed in-house, tested on real sites">
            Hammerex is a product company, not a re-seller. Every item in the range is
            designed in-house and tested in real working environments before it ships.
            Most product ideas come from conversations with the people who use them —
            builders, scaffolders, plasterers, carpenters, electricians and contractors
            telling us what they actually need from a tool, holder, belt or bag. New
            SKUs are added every quarter on the back of that feedback, and existing
            products are revised when better materials or constructions become available.
          </Block>

          <Block title="Daily operations" eyebrow="What our weeks look like">
            Manufacturing runs five days a week from our Yogyakarta factory. Cutting,
            sewing, riveting, quality inspection and pack-out all happen under one
            roof. Every batch is inspected before stock leaves the building, and
            dispatch goes direct via EMS Air Mail — no middleman warehouse, no
            reseller stage between us and the customer. The team is reachable on
            WhatsApp during working hours for queries on orders, freight, partnership
            applications or product advice, and most enquiries are responded to
            within one working day.
          </Block>

          <Block title="Where Hammerex sells today" eyebrow="Retail across Asia · direct to UK, USA, Australia">
            Hammerex products are stocked through retail outlets across Asia and shipped
            direct to tradesmen in the UK, USA and Australia from our Yogyakarta factory.
            Our retail range covers more than thirty trade categories — from scaffolding,
            plastering and carpentry to electrical, metal fabrication and joinery. We are
            actively building out international wholesale partnerships in protected
            territories. Direct retail orders to UK, USA and Australia ship via EMS Air
            Mail (£28 on £30–£49 carts · £20 flat once you reach £50, 5–6 days transit).
            Other destinations are quoted on WhatsApp after checkout.
          </Block>

          <Block title="Our aim" eyebrow="What we are building toward">
            Hammerex aims to be the manufacturer of choice for tradespeople who want
            products engineered for real use, not catalogue listings — innovative tools
            and accessories for construction and everyday professional work. We grow
            through partnership, not pressure: with our distributors, with our retail
            customers, and with the end users who put our products on a belt at six in
            the morning and trust them through to the end of the day.
          </Block>

          <Block title="Strength to strength" eyebrow="Where we go from here">
            From a single product at launch to a multi-category catalogue serving ten
            markets and counting, the trajectory is steady and deliberate. We have no
            interest in being the biggest tool brand on the shelf — we are interested in
            being the brand the trade reaches for first. That ambition shapes every
            product we make and every partnership we sign, and it is the standard we
            measure ourselves against year after year.
          </Block>
        </article>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat number="15" label="Years on the market" />
          <Stat number="30+" label="Trade categories served" />
          <Stat number="Asia" label="Retail outlets across the region" />
        </div>
      </section>

      <DeliveryFooter />
    </main>
  );
}

function Block({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-sm font-bold uppercase tracking-widest text-brand-accent">
        {title}
      </h2>
      <div className="mt-3 text-sm text-brand-muted">{children}</div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-5">
      <div className="text-3xl font-extrabold text-brand-accent">{number}</div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </p>
    </div>
  );
}
