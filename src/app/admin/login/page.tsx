"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const pw = String(fd.get("password") ?? password);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-xl">
      <h1 className="text-lg font-bold text-brand-text">Hammerex Admin</h1>
      <p className="mt-1 text-xs text-brand-muted">Enter the admin password to continue.</p>
      <label className="mt-5 block">
        <span className="block text-xs font-semibold uppercase tracking-widest text-brand-muted">Password</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="mt-2 h-12 w-full rounded-full border border-brand-line bg-brand-bg px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          placeholder="••••••••"
        />
      </label>
      {err && (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {err}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 h-12 w-full rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-bg px-4">
      <Suspense fallback={<div className="text-xs text-brand-muted">Loading…</div>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
