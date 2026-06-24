// POST /api/trade/dev-impersonate { email: string }
//
// DEV-ONLY shortcut to sign in as a trade-account email without going
// through Supabase's email delivery. Strategy:
//   1. supabaseAdmin.auth.admin.generateLink({ type: 'magiclink' })
//      returns an `email_otp` string (the one-time token that would have
//      been emailed to the user).
//   2. We call `supabase.auth.verifyOtp({ token: email_otp, type: 'email',
//      email })` from a server-side @supabase/ssr client. That call sets
//      the Supabase auth cookies on the response (sb-*-auth-token) just
//      like a real magic-link landing would.
//   3. We then run linkAuthUserToTradeAccount, which inserts a login
//      event and bumps login_count exactly like the real callback does.
//   4. We set the hx_trade_event cookie too.
//
// After this returns, the browser (or curl --cookie-jar) is fully signed
// in: hit GET /trade and the welcome surface renders.
//
// SECURITY: 404s when NODE_ENV === "production". REMOVE THIS FILE before
// the first production deploy.

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  TRADE_EVENT_COOKIE,
  tradeEventCookieAttrs,
  linkAuthUserToTradeAccount
} from "@/lib/trade-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Missing or malformed email" }, { status: 400 });
  }

  // Step 1: mint a magic-link via the admin API, capturing email_otp.
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${new URL(req.url).origin}/trade/auth/callback`
    }
  });
  if (linkErr || !linkData?.properties?.email_otp) {
    return NextResponse.json(
      { ok: false, error: linkErr?.message || "generateLink failed" },
      { status: 500 }
    );
  }
  const otp = linkData.properties.email_otp;

  // Step 2: verify the OTP server-side and have @supabase/ssr stamp the
  // auth cookies onto our response.
  const cookieStore = await cookies();
  const queuedCookies: { name: string; value: string; options?: CookieOptions }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet) {
          for (const c of toSet) {
            queuedCookies.push(c);
            try { cookieStore.set(c.name, c.value, c.options as CookieOptions); } catch {}
          }
        }
      }
    }
  );

  const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
    token: otp,
    type: "email",
    email
  });
  if (verifyErr || !verifyData?.session?.user) {
    return NextResponse.json(
      { ok: false, error: verifyErr?.message || "verifyOtp failed" },
      { status: 500 }
    );
  }

  // Step 3: link to trade account + bump login_count + insert event.
  const result = await linkAuthUserToTradeAccount(verifyData.session.user);
  if (!result.ok) {
    await supabase.auth.signOut();
    const r = NextResponse.json(
      { ok: false, error: `not_authorised: no active trade account for ${email}` },
      { status: 403 }
    );
    for (const c of queuedCookies) r.cookies.set(c.name, c.value, c.options as CookieOptions);
    return r;
  }

  // Step 4: assemble the response with auth cookies + event cookie.
  const res = NextResponse.json({
    ok: true,
    note: "DEV ONLY. Auth cookies have been set on this response — re-issue requests with the same cookie jar to act as the trade buyer.",
    trade_account_no: result.account.trade_account_no,
    company_name: result.account.company_name,
    login_event_id: result.loginEventId || null
  });
  for (const c of queuedCookies) res.cookies.set(c.name, c.value, c.options as CookieOptions);
  if (result.loginEventId) {
    const attrs = tradeEventCookieAttrs();
    res.cookies.set({
      name: attrs.name,
      value: result.loginEventId,
      httpOnly: attrs.httpOnly,
      sameSite: attrs.sameSite,
      secure: attrs.secure,
      path: attrs.path,
      maxAge: attrs.maxAge
    });
  }
  return res;
}
