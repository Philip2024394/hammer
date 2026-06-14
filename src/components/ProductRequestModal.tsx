"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";

export function ProductRequestModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const valid = name.trim() && country.trim() && whatsapp.trim() && email.trim() && qty.trim() && details.trim();

  const href = useMemo(() => {
    if (!valid) return "#";
    const body = [
      "Hi Hammerex — I'd like to discuss a product project.",
      "",
      `📦 Quantity needed: ${qty}`,
      `📝 Project details: ${details}`,
      "",
      "👤 Customer details:",
      `Name: ${name}`,
      `Country: ${country}`,
      `WhatsApp: ${whatsapp}`,
      `Email: ${email}`,
      "",
      "Please get back to me — I understand you reply within 24 hours."
    ].join("\n");
    return quoteUrl(body, adminWhatsapp());
  }, [valid, name, country, whatsapp, email, qty, details]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submit your product request"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text sm:text-base">Submit your project</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-full text-brand-muted hover:bg-black/40 hover:text-brand-accent"
          >×</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <p className="mb-4 text-xs leading-relaxed text-brand-muted">
            Tell us what you need — design, manufacturing or supply, from one piece to 500. We reply within 24 hours.
          </p>

          <div className="flex flex-col gap-3">
            <Field label="Full name"            value={name}     onChange={setName}     placeholder="John Smith" />
            <Field label="Country"               value={country}  onChange={setCountry}  placeholder="United Kingdom" />
            <Field label="WhatsApp number"       value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" />
            <Field label="Email"                 value={email}    onChange={setEmail}    placeholder="you@example.com" inputMode="email" />
            <Field label="Quantity of products"  value={qty}      onChange={setQty}      placeholder="e.g. 1, 50, 500" />
            <Field label="Project details"        value={details}  onChange={setDetails}  placeholder="What product, sizes, materials, deadlines…" multiline />
          </div>
        </div>

        <div className="border-t border-brand-line px-5 py-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!valid}
            onClick={(e) => {
              if (!valid) { e.preventDefault(); return; }
              setTimeout(() => router.push("/thank-you"), 80);
            }}
            className={`grid h-12 place-items-center rounded-md text-xs font-bold uppercase tracking-wider ${
              valid ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >
            Submit via WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-brand-muted">Opens WhatsApp prefilled with your project details.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline, inputMode }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email";
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{label}</span>
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
