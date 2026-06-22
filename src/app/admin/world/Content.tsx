"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { PresenceDot } from "./Map";

// Map needs window/document → load it client-side only.
const WorldMap = dynamic(() => import("./Map").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black text-xs text-brand-muted">
      Loading map…
    </div>
  )
});

type CountryCount = { country: string; sessions: number };
type Presence = {
  online_now: PresenceDot[];
  last_24h_by_country: CountryCount[];
  total_sessions_24h: number;
  online_count: number;
  window_minutes: number;
  server_time: string;
};

const POLL_MS = 30_000;

export function WorldContent() {
  const [data, setData] = useState<Presence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/presence", { cache: "no-store" });
        const json = (await res.json()) as Presence & { ok: boolean; error?: string };
        if (!alive) return;
        if (!json.ok) {
          setErr(json.error || `Presence fetch failed (${res.status}).`);
          return;
        }
        setData(json);
        setErr(null);
        setLastFetched(new Date().toLocaleTimeString());
      } catch (e) {
        if (alive) setErr((e as Error).message);
      }
    }
    void load();
    const t = window.setInterval(load, POLL_MS);
    return () => { alive = false; window.clearInterval(t); };
  }, []);

  const dots = data?.online_now ?? [];
  const countries = data?.last_24h_by_country ?? [];
  const top24h = useMemo(() => {
    const max = Math.max(1, ...countries.map((c) => c.sessions));
    return countries.slice(0, 30).map((c) => ({ ...c, pct: Math.round((c.sessions / max) * 100) }));
  }, [countries]);

  return (
    <div className="grid h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden">
        <WorldMap dots={dots} />

        <div className="pointer-events-none absolute left-4 top-4 z-[400] flex flex-col gap-2">
          <div className="pointer-events-auto rounded-2xl border border-brand-line bg-brand-bg/85 px-4 py-3 text-xs backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="relative grid h-3 w-3 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-green-400/70" />
                <span className="relative h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="font-bold text-brand-text">
                {data?.online_count ?? 0} online now
              </span>
            </div>
            <div className="mt-1 text-[10px] text-brand-muted">
              Active in the last {data?.window_minutes ?? 5} minutes
            </div>
          </div>
          {err && (
            <div className="pointer-events-auto rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
              {err}
            </div>
          )}
        </div>
      </div>

      <aside className="flex h-full flex-col overflow-hidden border-t border-brand-line bg-brand-surface lg:border-l lg:border-t-0">
        <header className="border-b border-brand-line px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Last 24 hours</h2>
          <p className="mt-1 text-xs text-brand-muted">
            {data?.total_sessions_24h ?? 0} unique sessions · {countries.length} countries
          </p>
          {lastFetched && (
            <p className="mt-1 text-[10px] text-brand-muted">Refreshed {lastFetched}</p>
          )}
        </header>
        <ul className="flex-1 divide-y divide-brand-line overflow-y-auto">
          {top24h.length === 0 ? (
            <li className="p-6 text-center text-xs text-brand-muted">
              No traffic in the last 24 hours yet.
            </li>
          ) : (
            top24h.map((c) => (
              <li key={c.country} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-text">{c.country || "??"}</span>
                  <span className="text-brand-muted">{c.sessions} session{c.sessions === 1 ? "" : "s"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-bg">
                  <div className="h-full bg-brand-accent" style={{ width: `${c.pct}%` }} />
                </div>
              </li>
            ))
          )}
        </ul>
        <footer className="border-t border-brand-line px-4 py-2 text-[10px] text-brand-muted">
          Polls every 30s. Green = precise lat/lon. Amber = country centroid fallback.
        </footer>
      </aside>
    </div>
  );
}
