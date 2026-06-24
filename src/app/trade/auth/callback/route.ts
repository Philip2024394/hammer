// GET /trade/auth/callback?code=<otp>
//
// Supabase magic-link landing for the PKCE flow (the default the browser
// client uses when @supabase/ssr is in play). Steps:
//   1. Exchange the OTP `code` for a session (sets Supabase auth cookies).
//   2. Run linkAuthUserToTradeAccount() — confirms the user has an active
//      trade account row, links auth_user_id, bumps login_count, inserts
//      a login event.
//   3. If linked — stash login_event_id in hx_trade_event cookie, 302 to
//      /trade.
//   4. If not linked — sign the user back out and 302 to
//      /trade?error=not_authorised. (We still mail magic links for *any*
//      address so the form doesn't leak who is/isn't a trade buyer; the
//      whitelist is enforced here, on landing.)

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  TRADE_EVENT_COOKIE,
  tradeEventCookieAttrs,
  linkAuthUserToTradeAccount
} from "@/lib/trade-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/trade?error=missing_code`);
  }

  const cookieStore = await cookies();

  // Buffer Supabase's queued auth cookies so we can mirror them onto
  // whichever NextResponse we end up returning (success OR signOut).
  const queuedCookies: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          for (const c of toSet) {
            queuedCookies.push(c);
            try { cookieStore.set(c.name, c.value, c.options as CookieOptions); } catch {}
          }
        }
      }
    }
  );

  const { data: exchange, error: xchgErr } =
    await supabase.auth.exchangeCodeForSession(code);
  if (xchgErr || !exchange?.session) {
    const r = NextResponse.redirect(`${origin}/trade?error=exchange_failed`);
    return r;
  }

  const result = await linkAuthUserToTradeAccount(exchange.session.user);
  if (!result.ok) {
    // Sign the auth user out so they can't roam other (potentially
    // future) protected surfaces signed in.
    await supabase.auth.signOut();
    // After signOut, queuedCookies will contain cleared sb-* cookies.
    const r = NextResponse.redirect(`${origin}/trade?error=${result.reason}`);
    for (const c of queuedCookies) {
      r.cookies.set(c.name, c.value, c.options as CookieOptions);
    }
    r.cookies.delete(TRADE_EVENT_COOKIE);
    return r;
  }

  const r = NextResponse.redirect(`${origin}/trade`);
  for (const c of queuedCookies) {
    r.cookies.set(c.name, c.value, c.options as CookieOptions);
  }
  if (result.loginEventId) {
    const attrs = tradeEventCookieAttrs();
    r.cookies.set({
      name: attrs.name,
      value: result.loginEventId,
      httpOnly: attrs.httpOnly,
      sameSite: attrs.sameSite,
      secure: attrs.secure,
      path: attrs.path,
      maxAge: attrs.maxAge
    });
  }
  return r;
}
