// Trade portal session helpers.
//
// Two cookies are at play:
//
//   1. Supabase auth cookies, managed by `@supabase/ssr` (sb-*-auth-token).
//      These prove the buyer is signed in as a Supabase Auth user.
//   2. `hx_trade_event`, an httpOnly server-set cookie that stores the
//      hammerex_trade_login_events.id row created at sign-in. We use it on
//      sign-out to close the event (set signed_out_at + duration). The
//      cookie value is just the UUID — no signing — because the row is
//      always cross-checked against the current auth user before update.
//
// The trade account lookup (`getCurrentTradeAccount`) is the single point
// of truth for "is this user allowed into the trade portal?". A user is
// admitted only if a hammerex_trade_accounts row exists with their email
// AND status = 'active'. Anything else gets a 404 (not 403 — we don't
// advertise the portal's gating to outsiders).

import "server-only";
import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "./supabaseAdmin";

export const TRADE_EVENT_COOKIE = "hx_trade_event";
const TRADE_EVENT_MAX_AGE = 60 * 60 * 12; // 12h — matches admin session

export type TradeAccount = {
  id: string;
  trade_account_no: string;
  auth_user_id: string | null;
  company_name: string;
  contact_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  country: string;
  currency: string;
  status: string;
  last_login_at: string | null;
  login_count: number;
  total_session_seconds: number;
};

/**
 * Build a Supabase client bound to the current request's cookies. Use this
 * from Server Components, Route Handlers, and Server Actions. The client
 * will read and write the Supabase session cookies on the response.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Server Components cannot set cookies; that's fine — middleware /
          // route handlers will refresh on the next request.
        }
      }
    }
  });
}

/** Fetch the trade account tied to the currently signed-in Supabase user.
 *  Returns null if there is no session OR no active trade account.        */
export async function getCurrentTradeAccount(): Promise<TradeAccount | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user?.email) return null;

  // Look up by auth_user_id first (cheap after link), fall back to email
  // for the very first sign-in (account exists but not yet linked).
  const { data: byId } = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("id,trade_account_no,auth_user_id,company_name,contact_email,contact_name,contact_phone,country,currency,status,last_login_at,login_count,total_session_seconds")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (byId) return byId as TradeAccount;

  const { data: byEmail } = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("id,trade_account_no,auth_user_id,company_name,contact_email,contact_name,contact_phone,country,currency,status,last_login_at,login_count,total_session_seconds")
    .ilike("contact_email", user.email)
    .eq("status", "active")
    .maybeSingle();
  return (byEmail as TradeAccount | null) ?? null;
}

/** Best-effort extraction of the client IP from request headers. */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export async function getUserAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent");
}

export async function getCountryInferred(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    null
  );
}

export function tradeEventCookieAttrs() {
  return {
    name: TRADE_EVENT_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TRADE_EVENT_MAX_AGE
  };
}

export type LinkResult =
  | { ok: true; account: TradeAccount; loginEventId: string }
  | { ok: false; reason: "no_email" | "not_authorised" };

/**
 * Given a freshly-signed-in Supabase user, link them to a hammerex trade
 * account (if one exists), increment login_count + last_login_at, and
 * insert a hammerex_trade_login_events row. Returns the new event id so
 * the caller can stash it in the hx_trade_event cookie.
 *
 * Used by both the magic-link callback handler and the dev-impersonate
 * shortcut.
 */
export async function linkAuthUserToTradeAccount(user: {
  id: string;
  email?: string | null;
}): Promise<LinkResult> {
  const email = user.email;
  if (!email) return { ok: false, reason: "no_email" };

  const { data: account, error } = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("id,trade_account_no,auth_user_id,company_name,contact_email,contact_name,contact_phone,country,currency,status,last_login_at,login_count,total_session_seconds")
    .ilike("contact_email", email)
    .maybeSingle();

  if (error || !account || account.status !== "active") {
    return { ok: false, reason: "not_authorised" };
  }

  if (!account.auth_user_id) {
    await supabaseAdmin
      .from("hammerex_trade_accounts")
      .update({ auth_user_id: user.id })
      .eq("id", account.id);
  }

  await supabaseAdmin
    .from("hammerex_trade_accounts")
    .update({
      last_login_at: new Date().toISOString(),
      login_count: (account.login_count ?? 0) + 1
    })
    .eq("id", account.id);

  const ip = await getClientIp();
  const ua = await getUserAgent();
  const country = await getCountryInferred();
  const { data: eventRow, error: eventErr } = await supabaseAdmin
    .from("hammerex_trade_login_events")
    .insert({
      account_id: account.id,
      ip,
      user_agent: ua,
      country_inferred: country
    })
    .select("id")
    .single();

  if (eventErr || !eventRow?.id) {
    // Even if the event insert fails, the auth user is still valid and
    // linked. Surface auth but with no event id (sign-out will skip the
    // close step).
    return { ok: true, account: account as TradeAccount, loginEventId: "" };
  }
  return { ok: true, account: account as TradeAccount, loginEventId: eventRow.id };
}
