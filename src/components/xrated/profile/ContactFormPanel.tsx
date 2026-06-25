"use client";

// Xrated Trades — premium-tier inline contact-form panel.
// Posts to /api/trade-off/messages. Client component because it owns
// the local form state and submit lifecycle. Best-effort UX:
//  - 50–500 char message floor enforced client-side AND server-side
//  - On success, swap the panel for a thank-you confirmation
//  - On failure, surface the server error inline
//
// Enquiry pre-fill: when the priced-services modal fires its "Enquire"
// button, it writes a {name, price, unit} payload to sessionStorage and
// navigates to #contact-panel. We read that on mount + on hashchange,
// pre-populate the message textarea (only if the user hasn't typed yet),
// and surface a small "Enquiring about: …" pill above the textarea.

import { useEffect, useState } from "react";

const ENQUIRY_KEY = "xrated_enquiry_service";

type EnquirySubject = {
  name: string;
  price: number;
  unit: string;
};

function formatPrice(price: number, unit: string): string {
  const amount = `£${price.toLocaleString("en-GB")}`;
  if (!unit) return amount;
  const u = unit.trim();
  if (u.toLowerCase() === "from") return `From ${amount}`;
  return `${amount} ${u}`;
}

function buildPrefillMessage(svc: EnquirySubject): string {
  return `Hi, I'm interested in ${svc.name} (${formatPrice(svc.price, svc.unit)}). Can you confirm availability and arrange a quote?`;
}

export function ContactFormPanel({
  listingId,
  displayName,
  themeColor
}: {
  listingId: string;
  displayName: string;
  themeColor: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [subject, setSubject] = useState<EnquirySubject | null>(null);

  // Read sessionStorage pre-fill on mount + whenever the hash flips to
  // #contact-panel (which is what the carousel modal triggers). Only
  // overwrite the textarea if the user hasn't typed anything yet so we
  // never destroy in-progress drafts.
  useEffect(() => {
    function readPrefill() {
      try {
        const raw = sessionStorage.getItem(ENQUIRY_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<EnquirySubject>;
        if (
          !parsed ||
          typeof parsed.name !== "string" ||
          typeof parsed.price !== "number" ||
          typeof parsed.unit !== "string"
        ) {
          return;
        }
        const svc: EnquirySubject = {
          name: parsed.name,
          price: parsed.price,
          unit: parsed.unit
        };
        setSubject(svc);
        setMessage((curr) => (curr.trim().length === 0 ? buildPrefillMessage(svc) : curr));
        // Clear so a refresh / next visit doesn't re-prefill.
        sessionStorage.removeItem(ENQUIRY_KEY);
      } catch {
        // Ignore JSON / storage errors.
      }
    }
    readPrefill();
    function onHash() {
      if (window.location.hash === "#contact-panel") readPrefill();
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function emailLooksValid(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function clearSubject() {
    setSubject(null);
    // Also clear the prefilled message text if it still matches the auto
    // prefill — don't wipe a draft the user has edited.
    setMessage((curr) => {
      if (!subject) return curr;
      return curr === buildPrefillMessage(subject) ? "" : curr;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();
    const m = message.trim();
    if (n.length < 2) {
      setErr("Please enter your name.");
      return;
    }
    if (!emailLooksValid(em)) {
      setErr("Please enter a valid email.");
      return;
    }
    if (m.length < 50) {
      setErr("Message must be at least 50 characters.");
      return;
    }
    if (m.length > 500) {
      setErr("Message must be 500 characters or fewer.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/trade-off/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          sender_name: n,
          sender_email: em,
          sender_phone: ph || null,
          message: m
        })
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!json.ok) {
        setErr(json.error || "Could not send your message — please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
        <div
          className="rounded-2xl border p-5 text-center"
          style={{ borderColor: themeColor, background: `${themeColor}14` }}
        >
          <p className="text-[13px] font-bold" style={{ color: themeColor }}>
            Message sent to {displayName}.
          </p>
          <p className="mt-1 text-[13px] text-brand-muted">
            They'll respond directly. No payment is taken on this page.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-2 pt-8">
      <h2
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: themeColor }}
      >
        Contact {displayName}
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        Drop a quick brief — they'll reply by email. 50–500 characters.
      </p>
      <form
        onSubmit={submit}
        className="mt-4 space-y-3 rounded-2xl border border-brand-line bg-brand-surface p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
              Your name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              minLength={2}
              maxLength={80}
              className="mt-1.5 h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={120}
              className="mt-1.5 h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Phone (optional)
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xxx xxx xxx"
            maxLength={32}
            className="mt-1.5 h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
        </label>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Message ({message.trim().length}/500)
          </span>
          {subject && (
            <div className="mt-1.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold"
                style={{
                  background: `${themeColor}1F`,
                  color: themeColor,
                  border: `1px solid ${themeColor}`
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                </svg>
                Enquiring about: {subject.name}
                <button
                  type="button"
                  onClick={clearSubject}
                  aria-label="Clear enquiry subject"
                  className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-current transition hover:bg-black/20"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What needs doing, where, and any rough timing or budget. 50 characters minimum."
            required
            minLength={50}
            maxLength={500}
            rows={5}
            className="mt-1.5 w-full rounded-md border border-brand-line bg-brand-bg px-3 py-2 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
        </div>
        {err && (
          <p className="text-[13px] font-semibold text-red-300" role="alert">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-lg px-5 text-[13px] font-bold transition disabled:opacity-50"
          style={{
            background: themeColor,
            color: "#000"
          }}
        >
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </section>
  );
}
