// GET /api/admin/presence
// Powers the live-presence map at /admin/world. Returns:
//   online_now: one row per session_id active in the last 5 minutes,
//               with lat/lon (or country centroid fallback), city, country.
//   last_24h_by_country: { country, sessions } sorted desc.
//
// Admin-cookie gated. The endpoint reads through the service-role
// client because hammerex_page_events is locked down by RLS.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { centroidFor } from "@/lib/countryCentroids";

export const runtime = "nodejs";

const ONLINE_WINDOW_MIN = 5;

type EventRow = {
  session_id: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const res = await supabaseAdmin
    .from("hammerex_page_events")
    .select("session_id, country, city, region, latitude, longitude, created_at")
    .gte("created_at", since24h)
    .order("created_at", { ascending: false })
    .limit(10000);

  const events = (res.data ?? []) as EventRow[];

  // Online now: keep the most recent event per session_id and filter by
  // the 5-minute window. Each row contributes the freshest lat/lon/city
  // it has (so a session that jumped pages mid-call still uses the
  // latest known position).
  const latestBySession = new Map<string, EventRow>();
  for (const e of events) {
    if (!e.session_id) continue;
    if (!latestBySession.has(e.session_id)) latestBySession.set(e.session_id, e);
  }

  const onlineCutoff = now - ONLINE_WINDOW_MIN * 60 * 1000;
  const onlineNow: {
    sessionId: string;
    latitude: number;
    longitude: number;
    city: string | null;
    region: string | null;
    country: string | null;
    fallback: boolean;
    lastSeenAt: string;
  }[] = [];
  for (const e of latestBySession.values()) {
    if (new Date(e.created_at).getTime() < onlineCutoff) continue;
    let lat = e.latitude;
    let lon = e.longitude;
    let fallback = false;
    if (lat === null || lon === null) {
      const c = centroidFor(e.country);
      if (!c) continue;
      [lat, lon] = c;
      fallback = true;
    }
    onlineNow.push({
      sessionId: e.session_id!,
      latitude: lat,
      longitude: lon,
      city: e.city,
      region: e.region,
      country: (e.country ?? "").toUpperCase() || null,
      fallback,
      lastSeenAt: e.created_at
    });
  }

  // 24h sessions per country.
  const sessionsByCountry: Record<string, Set<string>> = {};
  for (const e of events) {
    const c = (e.country || "??").toUpperCase();
    if (!sessionsByCountry[c]) sessionsByCountry[c] = new Set();
    if (e.session_id) sessionsByCountry[c].add(e.session_id);
  }
  const last24hByCountry = Object.entries(sessionsByCountry)
    .map(([country, s]) => ({ country, sessions: s.size }))
    .sort((a, b) => b.sessions - a.sessions);

  const totalSessions24h = Object.values(sessionsByCountry).reduce((s, set) => s + set.size, 0);

  return NextResponse.json({
    ok: true,
    online_now: onlineNow,
    last_24h_by_country: last24hByCountry,
    total_sessions_24h: totalSessions24h,
    online_count: onlineNow.length,
    window_minutes: ONLINE_WINDOW_MIN,
    server_time: new Date().toISOString()
  });
}
