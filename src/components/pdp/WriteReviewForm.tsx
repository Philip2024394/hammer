"use client";

import { useMemo, useState } from "react";
import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";

type YesNo = "" | "Yes" | "Mostly" | "No";
type Timing = "" | "Yes" | "Slightly late" | "Late";
type Expect = "" | "Exceeded" | "Met" | "Below";
type Recommend = "" | "Yes" | "Maybe" | "No";

export function WriteReviewForm({
  productName,
  productSku,
  onClose
}: {
  productName: string;
  productSku: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");

  const [overall, setOverall] = useState(0);
  const [quality, setQuality] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [service, setService] = useState(0);
  const [value, setValue] = useState(0);

  const [asDescribed, setAsDescribed] = useState<YesNo>("");
  const [onTime, setOnTime] = useState<Timing>("");
  const [metExpectations, setMetExpectations] = useState<Expect>("");
  const [serviceMet, setServiceMet] = useState<YesNo>("");
  const [wouldOrderAgain, setWouldOrderAgain] = useState<Recommend>("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const valid = name.trim() && whatsapp.trim() && country.trim() && overall > 0;

  const messageHref = useMemo(() => {
    if (!valid) return "#";
    const lines: (string | null)[] = [
      "Hi Hammerex — product review submission.",
      "",
      `PRODUCT: ${productName}`,
      productSku ? `Ref: ${productSku}` : null,
      "",
      "REVIEWER",
      `Name: ${name}`,
      `Country: ${country}`,
      `WhatsApp: ${whatsapp}`,
      "",
      "RATINGS",
      `Overall: ${overall}/5`,
      quality > 0  ? `Quality: ${quality}/5`   : null,
      delivery > 0 ? `Delivery: ${delivery}/5` : null,
      service > 0  ? `Service: ${service}/5`   : null,
      value > 0    ? `Value: ${value}/5`       : null,
      "",
      "DIAGNOSTIC",
      asDescribed     ? `Was the product as described? ${asDescribed}`            : null,
      onTime          ? `Was it delivered on time? ${onTime}`                     : null,
      metExpectations ? `Did it meet your expectations? ${metExpectations}`       : null,
      serviceMet      ? `Was Hammerex service as stated on site? ${serviceMet}`   : null,
      wouldOrderAgain ? `Would you order from Hammerex again? ${wouldOrderAgain}` : null,
      "",
      title.trim() ? `TITLE: ${title.trim()}` : null,
      body.trim() ? "REVIEW:" : null,
      body.trim() || null,
      "",
      "PHOTOS: please attach any photos of the product on site or in use directly to this WhatsApp chat after sending — they get added to your review."
    ];
    return quoteUrl(lines.filter(Boolean).join("\n"), adminWhatsapp());
  }, [valid, productName, productSku, name, country, whatsapp,
      overall, quality, delivery, service, value,
      asDescribed, onTime, metExpectations, serviceMet, wouldOrderAgain,
      title, body]);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-accent bg-brand-bg">
      <header className="flex items-start justify-between gap-3 border-b border-brand-line bg-brand-accent/10 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent">Write a review</h3>
          <p className="mt-1 truncate text-xs text-brand-muted">{productName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-muted hover:bg-black/40 hover:text-brand-accent"
        >×</button>
      </header>

      <div className="px-5 py-5">
        <Section title="Your details">
          <Field label="Name" required value={name} onChange={setName} placeholder="Full name" />
          <Field label="WhatsApp" required value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" />
          <Field label="Country" required value={country} onChange={setCountry} placeholder="United Kingdom" />
        </Section>

        <Section title="Overall rating" required>
          <StarPicker value={overall} onChange={setOverall} />
        </Section>

        <Section title="Rate by area" subtitle="Optional — helps us improve where it matters">
          <PillarRow label="Quality"  value={quality}  onChange={setQuality} />
          <PillarRow label="Delivery" value={delivery} onChange={setDelivery} />
          <PillarRow label="Service"  value={service}  onChange={setService} />
          <PillarRow label="Value"    value={value}    onChange={setValue} />
        </Section>

        <Section title="Quick check" subtitle="A few quick answers so we know exactly where to act">
          <Choice label="Was the product as described?"               value={asDescribed}     onChange={(v) => setAsDescribed(v as YesNo)}        options={["Yes", "Mostly", "No"]} />
          <Choice label="Was it delivered on time?"                   value={onTime}          onChange={(v) => setOnTime(v as Timing)}            options={["Yes", "Slightly late", "Late"]} />
          <Choice label="Did it meet your expectations?"              value={metExpectations} onChange={(v) => setMetExpectations(v as Expect)}   options={["Exceeded", "Met", "Below"]} />
          <Choice label="Was Hammerex service as stated on the site?" value={serviceMet}      onChange={(v) => setServiceMet(v as YesNo)}         options={["Yes", "Mostly", "No"]} />
          <Choice label="Would you order from Hammerex again?"        value={wouldOrderAgain} onChange={(v) => setWouldOrderAgain(v as Recommend)} options={["Yes", "Maybe", "No"]} />
        </Section>

        <Section title="Your review">
          <Field label="Title" value={title} onChange={setTitle} placeholder="A short title (optional)" />
          <Field label="Review" value={body} onChange={setBody} placeholder="Tell other tradespeople about your experience" multiline />
        </Section>
      </div>

      <footer className="border-t border-brand-line bg-brand-accent/5 px-5 py-4">
        <a
          href={messageHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!valid}
          onClick={(e) => {
            if (!valid) { e.preventDefault(); return; }
            setTimeout(() => onClose(), 80);
          }}
          className={`grid h-12 place-items-center rounded-full text-xs font-bold uppercase tracking-widest ${
            valid ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
          }`}
        >
          Submit review via WhatsApp
        </a>
        <p className="mt-2 text-center text-xs text-brand-muted">
          Opens WhatsApp prefilled with your review and diagnostic answers. We publish verified reviews after our team confirms the purchase.
        </p>
      </footer>
    </div>
  );
}

function Section({
  title, subtitle, required, children
}: {
  title: string;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          {title} {required && <span className="text-brand-accent">*</span>}
        </h4>
        {subtitle && <span className="text-xs text-brand-muted">{subtitle}</span>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, inputMode, required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email";
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label} {required && <span className="text-brand-accent">*</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="rounded-xl border border-brand-line bg-black px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-full border border-brand-line bg-black px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      )}
    </label>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          aria-pressed={value === n}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-accent/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-brand-accent"
            fill={n <= display ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-xs text-brand-muted">
        {display > 0 ? `${display} / 5` : "Tap a star to rate"}
      </span>
    </div>
  );
}

function PillarRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-brand-text">{label}</span>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(value === n ? 0 : n)}
            aria-label={`${label} ${n} star${n === 1 ? "" : "s"}`}
            className="grid h-7 w-7 place-items-center rounded-full hover:bg-brand-accent/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-brand-accent"
              fill={n <= display ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function Choice({
  label, value, onChange, options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-brand-text">{label}</span>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? "" : opt)}
              className={`h-11 rounded-full border text-xs font-semibold transition ${
                active
                  ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                  : "border-brand-line bg-black/30 text-brand-muted hover:border-brand-accent"
              }`}
            >{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
