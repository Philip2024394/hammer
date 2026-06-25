"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { FieldIcon as _FieldIcon, Globe, HeaderIcon, Mail, MapPin, Phone, Receipt, Truck, User } from "@/components/checkout/Icons";
import { cart, type CartLine } from "@/lib/cart";
import { formatPriceForRegion, shouldShowPrice, QUOTE_AT_CHECKOUT_LABEL } from "@/lib/fx";
import { useCountry } from "@/components/CountryProvider";
import { threadColorLabel } from "@/lib/threadColor";
import { logQuoteClick } from "@/lib/quoteSignals";
import { TrackPageEvent } from "@/components/TrackPageEvent";
import { useT } from "@/components/LocaleProvider";

export default function CheckoutPage() {
  const router = useRouter();
  const t = useT();
  const visitorCountry = useCountry();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Xrated annual-member perk — populated by /api/xrated-member/check on
  // blur of either the email or WhatsApp field.
  const [memberCheck, setMemberCheck] = useState<{
    is_annual_member: boolean;
    listing_id: string | null;
    display_name: string | null;
    slug: string | null;
  }>({ is_annual_member: false, listing_id: null, display_name: null, slug: null });

  async function checkMember(currentEmail: string, currentWhatsapp: string) {
    const e = currentEmail.trim();
    const w = currentWhatsapp.trim();
    if (!e && !w) {
      setMemberCheck({ is_annual_member: false, listing_id: null, display_name: null, slug: null });
      return;
    }
    try {
      const url = `/api/xrated-member/check?email=${encodeURIComponent(e)}&whatsapp=${encodeURIComponent(w)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();
      if (json && typeof json.is_annual_member === "boolean") {
        setMemberCheck({
          is_annual_member: json.is_annual_member,
          listing_id: typeof json.listing_id === "string" ? json.listing_id : null,
          display_name: typeof json.display_name === "string" ? json.display_name : null,
          slug: typeof json.slug === "string" ? json.slug : null
        });
      }
    } catch {
      // best-effort — no banner just means no banner
    }
  }

  useEffect(() => {
    const sync = () => setLines(cart.read());
    sync();
    setReady(true);
    return cart.subscribe(sync);
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  const hasPaidLine = lines.some((l) => l.unitPriceIdr > 0);
  const formValid = !!(name.trim() && country.trim() && whatsapp.trim() && email.trim() && address.trim() && lines.length > 0 && hasPaidLine);

  async function submit() {
    if (!formValid || submitting) return;
    setErr(null);
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        country: country.trim(),
        address: address.trim(),
        voucher_code: voucherCode.trim() || null,
        is_annual_member: memberCheck.is_annual_member,
        member_listing_id: memberCheck.listing_id,
        lines: lines.map((l) => ({
          productId: l.productId,
          slug: l.slug,
          name: l.name,
          sku: l.sku,
          image: l.image,
          unitPriceIdr: l.unitPriceIdr,
          qty: l.qty,
          size: l.size,
          variantLabel: l.variantLabel,
          threadColor: l.threadColor,
          backpackStraps: l.backpackStraps,
          beltSize: l.beltSize ?? null,
          beltUpgrade: l.beltUpgrade ?? null,
          customBrandName: l.customBrandName ?? null,
          repairCover: l.repairCover ?? false
        }))
      };
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErr(json.error || `Submission failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      for (const l of lines) void logQuoteClick(l.productId, "checkout_quote");
      cart.clear();
      const ref = encodeURIComponent(json.reference ?? "");
      router.push(`/thank-you?ref=${ref}`);
    } catch (e) {
      setErr((e as Error).message);
      setSubmitting(false);
    }
  }

  if (!ready) return <main><Header /></main>;

  if (lines.length === 0) {
    return (
      <main>
        <Header />
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold text-brand-text">{t("checkout.title")}</h1>
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">{t("cart.empty")}</p>
            <a href="/" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90">{t("cart.emptyCta")}</a>
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
        <h1 className="mb-2 text-2xl font-bold text-brand-text">{t("checkout.title")}</h1>
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4">
          <HeaderIcon icon={<Truck size={18} />} />
          <div>
            <p className="text-sm font-semibold text-brand-text">
              {t("checkout.banner")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">
              {t("checkout.bannerBody")}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void submit(); }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
        >
          <div className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-text">
                <HeaderIcon icon={<User size={16} />} />
                {t("checkout.yourDetails")}
              </legend>
              <Field label={t("checkout.fullName")}        icon={<User size={14} />}   value={name}     onChange={setName}     placeholder="John Smith" autoComplete="name" name="name" />
              <Field label={t("checkout.email")}             icon={<Mail size={14} />}   value={email}    onChange={setEmail}    onBlur={() => void checkMember(email, whatsapp)} placeholder="you@example.com" inputMode="email" type="email" autoComplete="email" name="email" />
              <Field label={t("checkout.phone")}     icon={<Phone size={14} />}  value={whatsapp} onChange={setWhatsapp} onBlur={() => void checkMember(email, whatsapp)} placeholder="+44 7700 900000" inputMode="tel" type="tel" autoComplete="tel" name="phone" />
              <Field label={t("checkout.country")}           icon={<Globe size={14} />}  value={country}  onChange={setCountry}  placeholder="United Kingdom" autoComplete="country-name" name="country" />
              <Field label={t("checkout.deliveryAddress")} icon={<MapPin size={14} />} value={address} onChange={setAddress} placeholder="123 High Street, London, EC1A 1BB" multiline autoComplete="street-address" name="address" />
              <label className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                  <span aria-hidden="true">🎁</span>
                  Got a voucher? Enter code (optional)
                </span>
                <input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="XRATED-XXXX-XXXX"
                  autoComplete="off"
                  name="voucher_code"
                  className="h-12 rounded-full border border-brand-line bg-brand-surface px-4 font-mono text-sm uppercase tracking-widest text-brand-text placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
                />
                <span className="text-xs text-brand-muted">
                  Xrated Trades members got one on signup. We&rsquo;ll honour it on this order.
                </span>
              </label>
            </fieldset>

            {err && (
              <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={!formValid || submitting}
              className={`grid h-14 place-items-center rounded-full text-sm font-bold uppercase tracking-widest shadow-[0_4px_16px_rgba(255,179,0,0.35)] ${
                formValid && !submitting ? "bg-brand-accent text-black hover:opacity-90" : "bg-brand-surface text-brand-muted border border-brand-line"
              }`}
            >
              {submitting ? t("checkout.sending") : t("checkout.quoteMeDelivery") + " →"}
            </button>
            {!formValid && lines.length > 0 && hasPaidLine && !submitting && (
              <p className="-mt-3 text-xs text-brand-muted">
                {t("checkout.fillEveryField")}
              </p>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-5">
            {memberCheck.is_annual_member && (
              <div className="mb-4 rounded-xl border border-emerald-400/60 bg-emerald-50 p-3 text-emerald-900">
                <p className="text-sm font-extrabold">
                  <span aria-hidden="true">🎉</span> Xrated Annual Member — 5% off applied
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  Hi {memberCheck.display_name ?? "there"}, your annual
                  membership unlocks a permanent 5% discount on every Hammerex
                  order.
                </p>
              </div>
            )}
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <HeaderIcon icon={<Receipt size={16} />} />
              {t("checkout.orderSummary")}
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
                    <div className="text-brand-muted">{l.size ? `${l.size} · ` : ""}{l.qty}× {l.unitPriceIdr === 0 ? (l.variantLabel === "WELCOME GIFT" ? t("common.free") : QUOTE_AT_CHECKOUT_LABEL) : formatPriceForRegion(l.unitPriceIdr, "IDR", visitorCountry)}</div>
                  </div>
                  <div className="text-xs font-semibold text-brand-text">{l.unitPriceIdr === 0 ? (l.variantLabel === "WELCOME GIFT" ? <span className="text-brand-accent">{t("common.free")}</span> : <span className="text-brand-accent">{QUOTE_AT_CHECKOUT_LABEL}</span>) : formatPriceForRegion(l.unitPriceIdr * l.qty, "IDR", visitorCountry)}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-line pt-3 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Items subtotal</span>
                <span className="text-brand-text">{shouldShowPrice(visitorCountry) ? formatPriceForRegion(subtotal, "IDR", visitorCountry) : <span className="text-brand-accent">Quote requested at checkout</span>}</span>
              </div>
              {memberCheck.is_annual_member && (
                <div className="mt-1 flex justify-between text-emerald-700">
                  <span>Xrated Annual Member discount</span>
                  <span className="font-semibold">−5%</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-brand-muted">
                <span>Delivery</span>
                <span className="text-brand-accent">Quoted within 24h</span>
              </div>
              {shouldShowPrice(visitorCountry) && dominantCurrency !== "IDR" && (
                <div className="mt-1 flex justify-between text-brand-muted">
                  <span>Indicative items total</span>
                  <span className="text-brand-accent">{formatPriceForRegion(subtotal, dominantCurrency, visitorCountry)}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!formValid || submitting}
              className={`mt-5 grid h-12 w-full place-items-center rounded-full text-sm font-semibold ${
                formValid && !submitting ? "bg-brand-accent text-black hover:opacity-90" : "bg-brand-surface text-brand-muted border border-brand-line"
              }`}
            >
              {submitting ? t("checkout.sending") : t("checkout.quoteMeDelivery")}
            </button>
            {!hasPaidLine && lines.length > 0 && (
              <p className="mt-2 rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-2 text-xs text-brand-accent">
                🎁 {t("checkout.welcomeGiftAddPaid")}
              </p>
            )}
            <p className="mt-2 text-xs text-brand-muted">
              Hits the Hammerex order desk. We reply by email or phone — usually within 24 hours — with a combined delivery quote before any payment is taken.
            </p>
          </aside>
        </form>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-brand-line bg-brand-bg/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-brand-muted">
              {lines.reduce((s, l) => s + l.qty, 0)} {lines.reduce((s, l) => s + l.qty, 0) === 1 ? t("cart.item") : t("cart.items")}
              {" · delivery quoted within 24h"}
            </span>
            <span className="truncate text-sm font-bold text-brand-text">
              {shouldShowPrice(visitorCountry)
                ? (dominantCurrency !== "IDR" ? formatPriceForRegion(subtotal, dominantCurrency, visitorCountry) : formatPriceForRegion(subtotal, "IDR", visitorCountry))
                : <span className="text-brand-accent">Quote requested at checkout</span>}
            </span>
          </div>
          <button
            type="button"
            disabled={!formValid || submitting}
            onClick={() => void submit()}
            className={`grid h-12 place-items-center rounded-full px-4 text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] ${
              formValid && !submitting ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >{submitting ? t("checkout.sending") : t("checkout.quoteMeDelivery")}</button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon, value, onChange, onBlur, placeholder, multiline, inputMode, type, autoComplete, name }: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
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
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={name}
          rows={3}
          className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
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
