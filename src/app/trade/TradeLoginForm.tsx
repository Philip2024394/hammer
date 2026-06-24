"use client";

// Email-only magic-link login form for the trade portal. Calls Supabase
// Auth directly from the browser (signInWithOtp). The `emailRedirectTo`
// points to /trade/auth/callback which exchanges the code, links the auth
// user to the trade account, and writes the login event.
//
// TODO(SMTP): Supabase's default SMTP is rate-limited to ~30 emails/hour
// and routes from a noreply@supabase address — fine for early sign-ins,
// not fine for production. Wire custom SMTP (streetlocallive@gmail.com or
// a hammerex@... mailbox) in the Supabase dashboard before launch.

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function TradeLoginForm({
  initialError,
  initialSent
}: {
  initialError?: string;
  initialSent?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(!!initialSent);
  const [err, setErr] = useState<string | null>(
    initialError === "not_authorised"
      ? "That email is not registered as an active trade account. Please contact us via the Partners page."
      : initialError
        ? "Sign-in failed. Please try again."
        : null
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/trade/auth/callback`,
          // We don't want Supabase auto-creating a user for emails that
          // aren't in our trade-account whitelist, BUT we still want the
          // magic-link email to send (so we don't leak which emails are
          // and aren't trade buyers). So leave shouldCreateUser at its
          // default (true) — the callback handler enforces the whitelist
          // on landing and signs out + redirects if not authorised.
        }
      });
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch (e2) {
      setErr((e2 as Error).message);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-5 rounded-xl border border-brand-line bg-brand-bg p-4">
        <p className="text-sm font-semibold text-brand-text">Check your email</p>
        <p className="mt-1 text-xs text-brand-muted">
          We have sent a sign-in link to <span className="text-brand-text">{email}</span>.
          Open it on this device to land back here signed in.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail(""); }}
          className="mt-3 text-xs text-brand-accent underline-offset-2 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5">
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-widest text-brand-muted">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-12 w-full rounded-full border border-brand-line bg-brand-bg px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          placeholder="you@company.co.uk"
        />
      </label>
      {err && (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {err}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || email.trim().length === 0}
        className="mt-4 h-12 w-full rounded-full bg-brand-accent text-xs font-bold uppercase tracking-widest text-black transition disabled:opacity-40 hover:opacity-90"
      >
        {loading ? "Sending…" : "Send login link"}
      </button>
    </form>
  );
}
