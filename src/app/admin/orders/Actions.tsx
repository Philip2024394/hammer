"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "mark_quoted" | "mark_closed" | "reopen";

export function OrderActions({ id, status }: { id: string; status: "pending" | "quoted" | "closed" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | Action>(null);
  const [err, setErr] = useState<string | null>(null);

  async function act(action: Action) {
    setBusy(action);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/quote-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErr(json.error || `Action failed (${res.status}).`);
        setBusy(null);
        return;
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {status !== "quoted" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => act("mark_quoted")}
            className="h-8 rounded-full bg-brand-accent px-3 text-[11px] font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy === "mark_quoted" ? "…" : "Mark quoted"}
          </button>
        )}
        {status !== "closed" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => act("mark_closed")}
            className="h-8 rounded-full border border-brand-line px-3 text-[11px] font-bold uppercase tracking-widest text-brand-text transition disabled:opacity-40 hover:border-brand-accent"
          >
            {busy === "mark_closed" ? "…" : "Mark closed"}
          </button>
        )}
        {status !== "pending" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => act("reopen")}
            className="h-8 rounded-full border border-brand-line px-3 text-[11px] font-bold uppercase tracking-widest text-brand-muted transition disabled:opacity-40 hover:text-brand-text"
          >
            {busy === "reopen" ? "…" : "Reopen"}
          </button>
        )}
      </div>
      {err && <p className="max-w-[240px] rounded-lg border border-red-500/40 bg-red-500/10 p-1.5 text-[10px] text-red-300">{err}</p>}
    </div>
  );
}
