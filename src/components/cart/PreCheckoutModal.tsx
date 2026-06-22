"use client";

import { useEffect, useState } from "react";

// Modal shown when the buyer leaves /cart for /checkout. Explains the
// per-order air-freight quote process before the team submission and
// issues a per-session ticket number so the buyer can refer to their
// enquiry. Mounting parent owns visibility + the "continue" callback.
//
// "Team online" pill flashes green between 09:00 and 21:00 Asia/Jakarta
// (Hammerex HQ is Yogyakarta — buyers from any timezone see whether the
// Indonesian team is currently reachable). Outside that window the pill
// shows a live countdown to the next 09:00 Asia/Jakarta opening.

function isTeamOnlineJakarta(now: Date): boolean {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false
  }).format(now);
  const hour = parseInt(hourStr, 10);
  return hour >= 9 && hour < 21;
}

// Next 09:00 Asia/Jakarta in UTC. Jakarta = UTC+7 (no DST), so 09:00 WIB
// is always 02:00 UTC. Returns today's 02:00 UTC if it's still in the
// future, otherwise tomorrow's 02:00 UTC.
function nextJakartaOpenUtc(now: Date): Date {
  const target = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    2, 0, 0, 0
  ));
  if (target.getTime() <= now.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Ticket id format: HX-YYMMDD-XXXX (4 chars, alphanumeric, ambiguous
// chars I/O/0/1 excluded so it's easy to read aloud over phone/email).
// The ticket is generated client-side on first modal open and held in
// sessionStorage so a refresh doesn't change it during the same session.
function generateTicket(): string {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HX-${y}${m}${day}-${rand}`;
}

function readOrCreateTicket(): string {
  if (typeof window === "undefined") return "HX-PENDING";
  try {
    const cached = window.sessionStorage.getItem("hx_ticket");
    if (cached) return cached;
    const next = generateTicket();
    window.sessionStorage.setItem("hx_ticket", next);
    return next;
  } catch {
    return generateTicket();
  }
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
  const [now, setNow] = useState(() => new Date());
  const [ticket, setTicket] = useState<string>("HX-PENDING");

  useEffect(() => {
    if (!open) return;
    setTicket(readOrCreateTicket());
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const online = isTeamOnlineJakarta(now);
  const msUntilOpen = nextJakartaOpenUtc(now).getTime() - now.getTime();
  const countdown = formatCountdown(msUntilOpen);

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
          width="144"
          height="144"
          className="absolute right-4 top-4 h-32 w-32 object-contain sm:h-40 sm:w-40"
        />

        <div className="pr-32 sm:pr-44">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${online ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.9)]" : "bg-amber-400 animate-pulse"}`}
            />
            {online ? "Team online now" : `Back online in ${countdown}`}
          </p>
          <h2 id="pre-checkout-title" className="mt-3 text-base font-bold text-brand-text sm:text-lg">
            Before we connect you to our team
          </h2>
        </div>

        <div className="mt-4 rounded-xl border border-brand-accent/40 bg-brand-accent/5 px-3 py-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
              Your ticket
            </span>
            <span className="font-mono text-sm font-bold tracking-wider text-brand-accent">
              {ticket}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-brand-muted">
            Tickets are processed in the order they&rsquo;re received. Keep this
            number — it lets our team find your enquiry instantly when we email
            or call you back.
          </p>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-muted">
          <p>
            <span className="font-semibold text-brand-text">Every order is confirmed by our team direct from your dashboard submission.</span>
            {" "}For items shipped by air freight, we quote the combined delivery cost —
            best rate, never per item — within 24 hours, by email or phone.
          </p>
          <p>
            For items already marked <span className="font-semibold text-brand-text">free delivery</span>,
            no delivery quote is needed, but the team still confirms your order details with
            you before dispatch.
          </p>
          <p>
            We may also have <span className="font-semibold text-brand-text">new models that aren&rsquo;t on
            the site yet</span>. Our team will let you know if anything new fits your order.
          </p>
          <p>
            It&rsquo;s an important step: we make sure every box is ticked and every question
            answered before we send your final confirmation link. Yes, it adds a little time
            — but isn&rsquo;t that how ordering should work?
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
