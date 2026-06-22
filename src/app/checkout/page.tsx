"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { CheckoutDealBreakers } from "@/components/checkout/CheckoutDealBreakers";
import { FieldIcon as _FieldIcon, Globe, HeaderIcon, Mail, MapPin, Phone, Receipt, Truck, User } from "@/components/checkout/Icons";
import { cart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/fx";
import { threadColorLabel } from "@/lib/threadColor";
import { adminWhatsapp, buildQuoteMessage, quoteUrl } from "@/lib/whatsapp";
import { logQuoteClick } from "@/lib/quoteSignals";
import { TrackPageEvent } from "@/components/TrackPageEvent";

export default function CheckoutPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const sync = () => setLines(cart.read());
    sync();
    setReady(true);
    return cart.subscribe(sync);
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  const hasPaidLine = lines.some((l) => l.unitPriceIdr > 0);
  const formValid = name.trim() && country.trim() && address.trim() && whatsapp.trim() && email.trim() && lines.length > 0 && hasPaidLine;

  const href = useMemo(() => {
    if (!formValid) return "#";
    const message = buildQuoteMessage({ lines, name, country, address, whatsapp, email });
    return quoteUrl(message, adminWhatsapp());
  }, [formValid, lines, name, country, address, whatsapp, email]);

  if (!ready) return <main><Header /></main>;

  if (lines.length === 0) {
    return (
      <main>
        <Header />
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold text-brand-text">Checkout</h1>
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">Your cart is empty.</p>
            <a href="/" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90">Continue shopping</a>
          </div>
        </section>
      </main>
    );
  }

  const dominantCurrency = (lines.find((l) => l.baseCurrency && l.baseCurrency !== "IDR")?.baseCurrency ?? "IDR") as "IDR" | "USD" | "SGD" | "AUD" | "EUR" | "GBP";

  return (
    <main className="pb-[calc(72px+56px+env(safe-area-inset-bottom))] lg:pb-0">
      <Header />
      <TrackPageEvent eventType="checkout_view" />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-brand-text">Checkout</h1>
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4">
          <HeaderIcon icon={<Truck size={18} />} />
          <div>
            <p className="text-sm font-semibold text-brand-text">
              Delivery is quoted by the Hammerex team — within 24 hours.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">
              Fill in your details below and submit on WhatsApp. We calculate the
              <span className="font-semibold text-brand-text"> best combined rate</span> for your whole
              order as a single package — never per item. You only pay once you've seen and
              accepted the delivery quote. Dispatch follows 3–5 working days after payment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <CheckoutDealBreakers />

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-text">
                <HeaderIcon icon={<User size={16} />} />
                Your details
              </legend>
              <Field label="Full name"        icon={<User size={14} />}   value={name}     onChange={setName}     placeholder="John Smith" autoComplete="name" name="name" />
              <Field label="Country"           icon={<Globe size={14} />}  value={country}  onChange={setCountry}  placeholder="United Kingdom" autoComplete="country-name" name="country" />
              <Field label="Delivery address" icon={<MapPin size={14} />} value={address}  onChange={setAddress}  placeholder="123 High Street, London, EC1A 1BB" multiline autoComplete="street-address" name="address" />
              <Field label="WhatsApp number"  icon={<Phone size={14} />}  value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" type="tel" autoComplete="tel" name="whatsapp" />
              <Field label="Email"             icon={<Mail size={14} />}   value={email}    onChange={setEmail}    placeholder="you@example.com" inputMode="email" type="email" autoComplete="email" name="email" />
            </fieldset>
          </div>

          <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <HeaderIcon icon={<Receipt size={16} />} />
              Order summary
            </h2>
            <ul className="mb-4 flex flex-col gap-3">
              {lines.map((l) => (
                <li key={`${l.productId}::${l.size ?? ""}::${l.threadColor ?? ""}::${l.variantId ?? ""}::${l.backpackStraps ? "bp1" : "bp0"}`} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                    {l.image && <img src={l.image} alt={l.name} loading="lazy" decoding="async" width="56" height="56" className="h-full w-full object-contain" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-brand-text">{l.name}</div>
                    {l.sku && <div className="font-semibold text-brand-accent">Ref: {l.sku}</div>}
                    {l.threadColor && <div className="text-brand-muted">Thread: {threadColorLabel(l.threadColor)}</div>}
                    {l.backpackStraps && <div className="text-brand-accent">+ Backpack straps add-on</div>}
                    {l.variantLabel === "WELCOME GIFT" && <div className="font-bold uppercase tracking-widest text-brand-accent">🎁 Welcome gift</div>}
                    <div className="text-brand-muted">{l.size ? `${l.size} · ` : ""}{l.qty}× {l.unitPriceIdr === 0 ? "FREE" : formatPrice(l.unitPriceIdr, "IDR")}</div>
                  </div>
                  <div className="text-xs font-semibold text-brand-text">{l.unitPriceIdr === 0 ? <span className="text-brand-accent">FREE</span> : formatPrice(l.unitPriceIdr * l.qty, "IDR")}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-line pt-3 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Items subtotal</span>
                <span className="text-brand-text">{formatPrice(subtotal, "IDR")}</span>
              </div>
              <div className="mt-1 flex justify-between text-brand-muted">
                <span>Delivery</span>
                <span className="text-brand-accent">Quoted within 24h</span>
              </div>
              {dominantCurrency !== "IDR" && (
                <div className="mt-1 flex justify-between text-brand-muted">
                  <span>Indicative items total</span>
                  <span className="text-brand-accent">{formatPrice(subtotal, dominantCurrency)}</span>
                </div>
              )}
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!formValid}
              onClick={(e) => {
                if (!formValid) { e.preventDefault(); return; }
                for (const l of lines) void logQuoteClick(l.productId, "checkout_wa");
                cart.clear();
                setTimeout(() => router.push("/thank-you"), 80);
              }}
              className={`mt-5 grid h-12 place-items-center rounded-full text-sm font-semibold ${
                formValid ? "bg-brand-accent text-black hover:opacity-90" : "bg-brand-surface text-brand-muted border border-brand-line"
              }`}
            >
              Quote me delivery via WhatsApp
            </a>
            {!hasPaidLine && lines.length > 0 && (
              <p className="mt-2 rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-2 text-xs text-brand-accent">
                🎁 Your welcome gift comes with your first paid order — add at least one item to claim it.
              </p>
            )}
            <p className="mt-2 text-xs text-brand-muted">
              Opens WhatsApp with your order pre-filled. The Hammerex team replies with a
              combined delivery quote within 24 hours — best rate for the whole order, not
              per item — before any payment is taken.
            </p>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-brand-line bg-brand-bg/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-brand-muted">
              {lines.reduce((s, l) => s + l.qty, 0)} item{lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "s"}
              {" · delivery quoted within 24h"}
            </span>
            <span className="truncate text-sm font-bold text-brand-text">
              {dominantCurrency !== "IDR" ? formatPrice(subtotal, dominantCurrency) : formatPrice(subtotal, "IDR")}
            </span>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!formValid}
            onClick={(e) => {
              if (!formValid) { e.preventDefault(); return; }
              cart.clear();
              setTimeout(() => router.push("/thank-you"), 80);
            }}
            className={`grid h-12 place-items-center rounded-full px-4 text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] ${
              formValid ? "bg-brand-whatsapp text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >Quote on WhatsApp</a>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon, value, onChange, placeholder, multiline, inputMode, type, autoComplete, name }: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email";
  type?: "text" | "tel" | "email";
  autoComplete?: string;
  name?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
        {icon && <_FieldIcon icon={icon} />}
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={name}
          rows={3}
          className="rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          type={type ?? "text"}
          autoComplete={autoComplete}
          name={name}
          className="h-12 rounded-full border border-brand-line bg-brand-surface px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      )}
    </label>
  );
}
