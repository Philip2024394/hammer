"use client";

// Collapsible form to create a new trade account. POSTs to
// /api/admin/trade-accounts. Server generates the HMX-T-NNNN
// number — we only collect the company/contact fields. On
// success we router.refresh() so the new row lands at the top
// of the table without a hard reload.

import { useRouter } from "next/navigation";
import { useState } from "react";

const CURRENCIES = ["GBP", "USD", "EUR", "IDR"] as const;
type Currency = (typeof CURRENCIES)[number];

type FormState = {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  country: string;
  currency: Currency;
  notes: string;
};

const EMPTY: FormState = {
  company_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  country: "",
  currency: "GBP",
  notes: ""
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;

export function NewAccountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const company_name = state.company_name.trim();
    const contact_email = state.contact_email.trim().toLowerCase();
    const country = state.country.trim().toUpperCase();

    if (!company_name) {
      setErr("Company name is required.");
      return;
    }
    if (!EMAIL_RE.test(contact_email)) {
      setErr("Contact email is not a valid email address.");
      return;
    }
    if (!COUNTRY_RE.test(country)) {
      setErr("Country must be a 2-letter ISO code (e.g. GB, ID, US).");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/trade-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name,
          contact_name: state.contact_name.trim() || null,
          contact_email,
          contact_phone: state.contact_phone.trim() || null,
          country,
          currency: state.currency,
          notes: state.notes.trim() || null
        })
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        trade_account_no?: string;
      };
      if (!res.ok || !json.ok) {
        setErr(json.error || `Create failed (${res.status}).`);
        setBusy(false);
        return;
      }
      setOk(`Created ${json.trade_account_no ?? "account"}.`);
      setState(EMPTY);
      setBusy(false);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-brand-text">
          {open ? "New trade account" : "+ New trade account"}
        </span>
        <span className="text-xs text-brand-muted">{open ? "Hide" : "Open form"}</span>
      </button>

      {open && (
        <form onSubmit={onSubmit} className="grid gap-3 border-t border-brand-line px-5 py-4 sm:grid-cols-2">
          <Field label="Company name *" htmlFor="company_name">
            <input
              id="company_name"
              required
              value={state.company_name}
              onChange={(e) => update("company_name", e.target.value)}
              className={INPUT_CLS}
              autoComplete="off"
            />
          </Field>

          <Field label="Contact name" htmlFor="contact_name">
            <input
              id="contact_name"
              value={state.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              className={INPUT_CLS}
              autoComplete="off"
            />
          </Field>

          <Field label="Contact email *" htmlFor="contact_email">
            <input
              id="contact_email"
              type="email"
              required
              value={state.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              className={INPUT_CLS}
              autoComplete="off"
            />
          </Field>

          <Field label="Contact phone" htmlFor="contact_phone">
            <input
              id="contact_phone"
              value={state.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
              className={INPUT_CLS}
              autoComplete="off"
            />
          </Field>

          <Field label="Country (ISO-2) *" htmlFor="country">
            <input
              id="country"
              required
              maxLength={2}
              value={state.country}
              onChange={(e) => update("country", e.target.value.toUpperCase())}
              className={`${INPUT_CLS} uppercase`}
              placeholder="GB"
              autoComplete="off"
            />
          </Field>

          <Field label="Currency *" htmlFor="currency">
            <select
              id="currency"
              value={state.currency}
              onChange={(e) => update("currency", e.target.value as Currency)}
              className={INPUT_CLS}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes" htmlFor="notes" full>
            <textarea
              id="notes"
              value={state.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className={`${INPUT_CLS} min-h-[64px] resize-y`}
            />
          </Field>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <div className="min-h-[24px] text-xs">
              {err && (
                <span className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-red-300">
                  {err}
                </span>
              )}
              {ok && (
                <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                  {ok}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const INPUT_CLS =
  "w-full rounded-[10px] border border-brand-line bg-black/30 px-3 py-2 text-[13px] text-brand-text outline-none transition focus:border-brand-accent";

function Field({
  label,
  htmlFor,
  full,
  children
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">{label}</span>
      {children}
    </label>
  );
}
