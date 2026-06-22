"use client";

import { useEffect, useState } from "react";

// Modal shown when the buyer leaves /cart for /checkout. Explains the
// per-order air-freight quote process before the WhatsApp hand-off.
// Mounting parent owns visibility + the "continue" callback.
//
// "Team online" pill flashes green between 09:00 and 21:00 Asia/Jakarta
// (Hammerex HQ is Yogyakarta — buyers from any timezone see whether the
// Indonesian team is currently reachable).

function isTeamOnlineJakarta(now: Date): boolean {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false
  }).format(now);
  const hour = parseInt(hourStr, 10);
  return hour >= 9 && hour < 21;
}

export function PreCheckoutModal({
  open,
  onContinue,
  onCancel
}: {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!open) return;
    const sync = () => setOnline(isTeamOnlineJakarta(new Date()));
    sync();
    const t = setInterval(sync, 60_000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-checkout-title"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border-2 border-brand-accent bg-brand-bg p-5 shadow-[0_20px_60px_rgba(255,179,0,0.25)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2022,%202026,%2002_49_28%20PM.png"
          alt="Hammerex team rep"
          width="72"
          height="72"
          className="absolute right-4 top-4 h-16 w-16 rounded-xl border border-brand-accent/40 bg-black object-cover sm:h-20 sm:w-20"
        />

        <div className="pr-20 sm:pr-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${online ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.9)]" : "bg-brand-muted"}`}
            />
            {online ? "Team online now" : "Team offline · 9 am – 9 pm WIB"}
          </p>
          <h2 id="pre-checkout-title" className="mt-3 text-base font-bold text-brand-text sm:text-lg">
            Before we connect you to our team
          </h2>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-muted">
          <p>
            Every Hammerex order ships by <span className="font-semibold text-brand-text">air freight</span>,
            so unless free delivery is shown on your items, the delivery
            cost is <span className="font-semibold text-brand-text">quoted per order</span> — based on
            exactly what's in your basket and where it's going.
          </p>
          <p>
            We may also have <span className="font-semibold text-brand-text">new models that aren't on
            the site yet</span>. Our team will let you know if anything new fits your order.
          </p>
          <p>
            It's an important step: we make sure every box is ticked and every question
            answered before we send your final confirmation link. Yes, it adds a little time
            — but isn't that how ordering should work?
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onContinue}
            className="grid h-12 w-full place-items-center rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black transition hover:opacity-90 sm:w-auto sm:px-6"
          >
            Continue to order details →
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-12 w-full place-items-center rounded-full border border-brand-line bg-brand-surface text-xs font-semibold text-brand-text transition hover:border-brand-accent sm:w-auto sm:px-6"
          >
            Keep shopping
          </button>
        </div>
      </div>
    </div>
  );
}
