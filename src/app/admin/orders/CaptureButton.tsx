"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CaptureButton({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (status !== "authorized") {
    return <span className="text-xs text-brand-muted">—</span>;
  }

  async function onClick() {
    if (loading) return;
    if (!confirm("Capture payment for this order? The buyer's card will be charged immediately.")) {
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/capture`, { method: "POST" });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setErr(j.error || "Capture failed");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-full bg-brand-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
      >
        {loading ? "Capturing…" : "Capture & dispatch"}
      </button>
      {err && <span className="text-[11px] text-red-300">{err}</span>}
    </div>
  );
}
