"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ProductRequestModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const valid = !!(name.trim() && country.trim() && phone.trim() && email.trim() && qty.trim() && details.trim()) && !submitting;

  async function submit() {
    if (!valid) return;
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/product-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country: country.trim(),
          quantity: qty.trim(),
          details: details.trim()
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErr(json.error || `Submission failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      const ref = encodeURIComponent(json.reference ?? "");
      onClose();
      router.push(`/thank-you?ref=${ref}`);
    } catch (e) {
      setErr((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submit your product request"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
    >
      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-brand-line bg-brand-surface"
      >
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
            Tell us what you need — design, manufacturing or supply, from one piece to 500. The Hammerex team replies by email or phone within 24 hours.
          </p>

          <div className="flex flex-col gap-3">
            <Field label="Full name"            value={name}    onChange={setName}    placeholder="John Smith" />
            <Field label="Country"               value={country} onChange={setCountry} placeholder="United Kingdom" />
            <Field label="Phone number"          value={phone}   onChange={setPhone}   placeholder="+44 7700 900000" inputMode="tel" />
            <Field label="Email"                 value={email}   onChange={setEmail}   placeholder="you@example.com" inputMode="email" />
            <Field label="Quantity of products"  value={qty}     onChange={setQty}     placeholder="e.g. 1, 50, 500" />
            <Field label="Project details"       value={details} onChange={setDetails} placeholder="What product, sizes, materials, deadlines…" multiline />
          </div>
        </div>

        <div className="border-t border-brand-line px-5 py-4">
          {err && (
            <p className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={!valid}
            className={`grid h-12 w-full place-items-center rounded-md text-xs font-bold uppercase tracking-wider ${
              valid ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >
            {submitting ? "Sending…" : "Submit your project"}
          </button>
          <p className="mt-2 text-center text-xs text-brand-muted">We&rsquo;ll reply by email or phone within 24 hours.</p>
        </div>
      </form>
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
