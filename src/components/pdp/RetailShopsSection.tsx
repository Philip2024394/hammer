"use client";

import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";

// B2B / retail-shop CTA — rendered on every PDP under "In the box". Pitches
// the small-order trial (min 10 pcs) at builders' merchants, tool shops and
// other resellers. Single WhatsApp hand-off into Hammerex sales — no form,
// no commitment, low-friction enquiry.
export function RetailShopsSection({ productName, productSku }: { productName: string; productSku: string | null }) {
  const message =
    `Hi Hammerex — I run a retail shop / reseller and I'd like to trial the ${productName}${productSku ? ` (Ref ${productSku})` : ""} for my customers. ` +
    `Please send wholesale pricing and lead times for an order of 10 pieces. Thanks.`;
  const href = quoteUrl(message, adminWhatsapp());

  return (
    <section id="retail-shops" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border-2 border-brand-accent bg-black p-5 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
            <img
              src="https://ik.imagekit.io/9mrgsv2rp/Untitledsdasdsdadsasd.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-20 w-20 shrink-0 object-contain sm:h-[125px] sm:w-[125px]"
            />

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Retail shops &amp; resellers
              </p>
              <h2 className="mt-1 text-base font-bold leading-tight text-brand-text sm:text-xl">
                Try 10 pieces of any same product.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
                Run a builders&apos; merchant, tool shop or trade counter? You can place a small
                trial order from <span className="font-semibold text-brand-text">10 pieces minimum</span> of any product
                to see the quality firsthand before scaling up. Get in touch with your shop name and the
                products you&apos;d like to trial — we&apos;ll send pricing and lead times.
              </p>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-12 w-full shrink-0 place-items-center rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90 sm:w-auto sm:text-sm"
            >
              Open WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
