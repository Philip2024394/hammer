"use client";

import { useEffect, useState } from "react";

// Parses "HH:mm" string in UK time (Europe/London) into the next future
// boundary as ms-since-epoch. If the cutoff has already passed today, the
// next cutoff is tomorrow at the same wall time.
function nextCutoffEpochMs(cutoffHHMM: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(cutoffHHMM.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);

  // Build today's cutoff in Europe/London then convert to absolute ms.
  // We use Intl to figure out the UK offset for "now".
  const now = new Date();
  const ukNow = new Date(now.toLocaleString("en-GB", { timeZone: "Europe/London" }));
  const ukMidnight = new Date(ukNow);
  ukMidnight.setHours(hh, mm, 0, 0);

  // Convert UK wall-time back to UTC by mirroring the offset between
  // local "now" and the UK-displayed "now".
  const offsetMs = ukNow.getTime() - now.getTime();
  let target = ukMidnight.getTime() - offsetMs;
  if (target <= now.getTime()) target += 24 * 60 * 60 * 1000;
  return target;
}

function format(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60
  };
}

export function DispatchCountdown({ cutoffHHMM }: { cutoffHHMM: string | null }) {
  const [target, setTarget] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!cutoffHHMM) return;
    const t = nextCutoffEpochMs(cutoffHHMM);
    setTarget(t);
    const id = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (t && n > t) setTarget(nextCutoffEpochMs(cutoffHHMM));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cutoffHHMM]);

  if (!cutoffHHMM || target == null) return null;

  const remainingMs = target - now;
  const { h, m, s } = format(remainingMs);
  const urgent = remainingMs < 60 * 60 * 1000;        // < 1 hour
  const isToday = remainingMs < 16 * 60 * 60 * 1000;  // cutoff still today

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-3 py-1.5 text-xs ${
        urgent
          ? "border-brand-accent bg-brand-accent/10 text-brand-accent hx-cutoff-urgent"
          : "border-brand-line bg-brand-surface text-brand-muted"
      }`}
      role="timer"
      aria-live="polite"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
      <span className="font-semibold">
        {isToday ? "Order in" : "Next dispatch in"}
      </span>
      <span className="font-mono tabular-nums">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
      <span>
        {isToday ? "for dispatch today" : `at ${cutoffHHMM} UK`}
      </span>
    </div>
  );
}
