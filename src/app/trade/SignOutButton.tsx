"use client";

// Sign-out button for the trade portal. Calls POST /api/trade/signout which
// closes the active login event (session duration + total_session_seconds)
// and clears the Supabase session + the hx_trade_event cookie. On success
// we navigate to the home page.

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/trade/signout", { method: "POST" });
    } catch {
      // Server-side already updated; ignore network blips.
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-10 rounded-full border border-brand-line bg-brand-bg px-5 text-xs font-semibold uppercase tracking-widest text-brand-text transition disabled:opacity-40 hover:border-brand-accent hover:text-brand-accent"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
