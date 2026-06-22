"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewModerationActions({ id, status }: { id: string; status: "pending" | "approved" | "rejected" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const [err, setErr] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(action);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
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
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex gap-2">
        {status !== "approved" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => act("approve")}
            className="h-9 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
          >
            {busy === "approve" ? "…" : "Approve"}
          </button>
        )}
        {status !== "rejected" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => act("reject")}
            className="h-9 rounded-full border border-red-500/60 px-4 text-xs font-bold uppercase tracking-widest text-red-300 transition disabled:opacity-40 hover:bg-red-500/10"
          >
            {busy === "reject" ? "…" : "Reject"}
          </button>
        )}
      </div>
      {err && <p className="max-w-[220px] rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-300">{err}</p>}
    </div>
  );
}
