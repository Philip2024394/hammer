"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { FreightSelector } from "@/components/checkout/FreightSelector";
import { FieldIcon as _FieldIcon, Globe, HeaderIcon, Mail, MapPin, Phone, Receipt, Truck, User } from "@/components/checkout/Icons";
import { cart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/fx";
import { adminWhatsapp, buildQuoteMessage, quoteUrl, type FreightChoice } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [freight, setFreight] = useState<FreightChoice>("sea");
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
  const formValid = name.trim() && country.trim() && address.trim() && whatsapp.trim() && email.trim() && lines.length > 0;

  const href = useMemo(() => {
    if (!formValid) return "#";
    const message = buildQuoteMessage({ lines, freight, name, country, address, whatsapp, email });
    return quoteUrl(message, adminWhatsapp());
  }, [formValid, lines, freight, name, country, address, whatsapp, email]);

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

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-brand-text">Checkout</h1>
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4">
          <HeaderIcon icon={<Truck size={18} />} />
          <div>
            <p className="text-sm font-semibold text-brand-text">Delivery is quoted per order.</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">
              Because shipping cost depends on the destination country and the quantities in your cart, we quote each order direct at today's rates. Pick your preferred freight option below, share your details, and we confirm the delivery price on WhatsApp before you pay.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <FreightSelector value={freight} onChange={setFreight} />

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-text">
                <HeaderIcon icon={<User size={16} />} />
                Your details
              </legend>
              <Field label="Full name"        icon={<User size={14} />}   value={name}     onChange={setName}     placeholder="John Smith" />
              <Field label="Country"           icon={<Globe size={14} />}  value={country}  onChange={setCountry}  placeholder="United Kingdom" />
              <Field label="Delivery address" icon={<MapPin size={14} />} value={address}  onChange={setAddress}  placeholder="123 High Street, London, EC1A 1BB" multiline />
              <Field label="WhatsApp number"  icon={<Phone size={14} />}  value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" />
              <Field label="Email"             icon={<Mail size={14} />}   value={email}    onChange={setEmail}    placeholder="you@example.com" inputMode="email" />
            </fieldset>
          </div>

          <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <HeaderIcon icon={<Receipt size={16} />} />
              Order summary
            </h2>
            <ul className="mb-4 flex flex-col gap-3">
              {lines.map((l) => (
                <li key={`${l.productId}::${l.size ?? ""}`} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                    {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-brand-text">{l.name}</div>
                    <div className="text-brand-muted">{l.size ? `${l.size} · ` : ""}{l.qty}× {formatPrice(l.unitPriceIdr, "IDR")}</div>
                  </div>
                  <div className="text-xs font-semibold text-brand-text">{formatPrice(l.unitPriceIdr * l.qty, "IDR")}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-line pt-3 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="text-brand-text">{formatPrice(subtotal, "IDR")}</span>
              </div>
              <div className="mt-1 flex justify-between text-brand-muted">
                <span>Delivery</span>
                <span className="text-brand-accent">Quoted</span>
              </div>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!formValid}
              onClick={(e) => { if (!formValid) e.preventDefault(); }}
              className={`mt-5 grid h-12 place-items-center rounded-full text-sm font-semibold ${
                formValid ? "bg-brand-accent text-black hover:opacity-90" : "bg-brand-surface text-brand-muted border border-brand-line"
              }`}
            >
              Quote me delivery via WhatsApp
            </a>
            <p className="mt-2 text-[11px] text-brand-muted">
              Opens WhatsApp with your details and cart pre-filled. We reply with a delivery price for your selected freight method.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, icon, value, onChange, placeholder, multiline, inputMode }: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email";
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
          rows={3}
          className="rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-full border border-brand-line bg-brand-surface px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      )}
    </label>
  );
}
