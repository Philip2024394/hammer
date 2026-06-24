// POST /api/trade-off/update
// Magic-link edit endpoint. Body: { slug, edit_token, fields }.
// Verifies the edit_token via constant-time compare against the row's
// stored value, then updates the safe subset of fields. Re-computes
// status (draft <-> live) from completeness and re-runs the Hammerex
// Standard auto-match.
//
// Locked: id, slug, edit_token, created_at, joined_at, report_count,
// hammerex_standard_* (only the API touches Standard fields).

import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  TRADE_OFF_REQUIRED_FIELDS,
  TRADE_OFF_TRADES,
  isReservedSlug
} from "@/lib/tradeOff";
import { recomputeHammerexStandard } from "@/lib/tradeOffStandard";
import { geocodeListing } from "@/lib/tradeOffGeocode";

export const runtime = "nodejs";

function constantTimeEq(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function arrStr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).trim())
    .filter((x) => x.length > 0);
}

function intOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

const UPDATABLE_STRING_FIELDS = [
  "display_name",
  "trading_name",
  "primary_trade",
  "city",
  "country",
  "postcode_prefix",
  "whatsapp",
  "phone",
  "email",
  "website",
  "instagram",
  "bio",
  "avatar_url"
] as const;

const UPDATABLE_ARRAY_FIELDS = [
  "secondary_trades",
  "service_postcodes",
  "photos"
] as const;

const UPDATABLE_INT_FIELDS = ["years_in_trade", "start_year"] as const;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = s(body.slug);
  const token = s(body.edit_token);
  const fieldsIn = (body.fields && typeof body.fields === "object" ? body.fields : {}) as Record<string, unknown>;

  if (!slug || !token) {
    return NextResponse.json({ ok: false, error: "Missing slug or edit_token." }, { status: 400 });
  }

  const existing = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("id, slug, edit_token, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!existing.data) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }
  if (!constantTimeEq(existing.data.edit_token, token)) {
    return NextResponse.json({ ok: false, error: "Invalid edit token." }, { status: 403 });
  }

  const patch: Record<string, unknown> = {};

  for (const f of UPDATABLE_STRING_FIELDS) {
    if (f in fieldsIn) {
      const v = s(fieldsIn[f]);
      patch[f] = v.length === 0 ? null : v;
    }
  }
  for (const f of UPDATABLE_ARRAY_FIELDS) {
    if (f in fieldsIn) {
      const arr = arrStr(fieldsIn[f]);
      if (f === "secondary_trades") patch[f] = arr.slice(0, 3);
      else if (f === "photos") patch[f] = arr.slice(0, 6);
      else patch[f] = arr.slice(0, 40);
    }
  }
  for (const f of UPDATABLE_INT_FIELDS) {
    if (f in fieldsIn) patch[f] = intOrNull(fieldsIn[f]);
  }

  // Required-field NOT NULLs cannot be set to null — refuse instead.
  for (const reqField of ["display_name", "city", "whatsapp", "email"] as const) {
    if (reqField in patch && (patch[reqField] === null || patch[reqField] === "")) {
      return NextResponse.json(
        { ok: false, error: `${reqField} cannot be empty.` },
        { status: 400 }
      );
    }
  }

  if ("primary_trade" in patch && typeof patch.primary_trade === "string") {
    if (!TRADE_OFF_TRADES.some((t) => t.slug === patch.primary_trade)) {
      return NextResponse.json({ ok: false, error: "Unknown primary trade." }, { status: 400 });
    }
  }

  // Optional slug change. If the tradie picked a new vanity slug, validate
  // and apply it. v1 deliberately skips redirect rows — the edit form warns
  // the tradie that changing their URL breaks existing links.
  const requestedSlug = s(fieldsIn.slug).toLowerCase();
  let nextSlug: string | null = null;
  if (requestedSlug && requestedSlug !== existing.data.slug) {
    if (isReservedSlug(requestedSlug)) {
      return NextResponse.json(
        { ok: false, error: "That URL is reserved or invalid." },
        { status: 400 }
      );
    }
    const dupe = await supabaseAdmin
      .from("hammerex_trade_off_listings")
      .select("id")
      .eq("slug", requestedSlug)
      .maybeSingle();
    if (dupe.data && dupe.data.id !== existing.data.id) {
      return NextResponse.json(
        { ok: false, error: "That URL is already taken." },
        { status: 409 }
      );
    }
    patch.slug = requestedSlug;
    nextSlug = requestedSlug;
  }

  // Best-effort geocode whenever the location fields are touched (or are
  // already present but lat/lng are missing). Failure leaves coords as-is.
  if ("city" in patch || "postcode_prefix" in patch || "country" in patch) {
    try {
      const refRow = await supabaseAdmin
        .from("hammerex_trade_off_listings")
        .select("city, postcode_prefix, country")
        .eq("id", existing.data.id)
        .maybeSingle();
      const merged = {
        city:
          typeof patch.city === "string"
            ? patch.city
            : (refRow.data?.city ?? ""),
        postcode_prefix:
          "postcode_prefix" in patch
            ? (patch.postcode_prefix as string | null)
            : (refRow.data?.postcode_prefix ?? null),
        country:
          typeof patch.country === "string"
            ? patch.country
            : (refRow.data?.country ?? "United Kingdom")
      };
      const coords = await geocodeListing(merged);
      if (coords) {
        patch.lat = coords.lat;
        patch.lng = coords.lng;
      }
    } catch (err) {
      console.warn("[trade-off/update] geocoding failed:", err);
    }
  }

  // Apply patch
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, status: existing.data.status });
  }

  const upd = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .update(patch)
    .eq("id", existing.data.id)
    .select("*")
    .maybeSingle();
  if (upd.error || !upd.data) {
    console.error("[trade-off/update] update failed:", upd.error);
    return NextResponse.json(
      { ok: false, error: upd.error?.message ?? "Update failed" },
      { status: 500 }
    );
  }

  // Re-evaluate status from completeness (do not flip 'hidden' back to 'live'
  // — moderation hides are sticky).
  const row = upd.data as Record<string, unknown>;
  let nextStatus: string = existing.data.status;
  if (existing.data.status !== "hidden") {
    let complete = true;
    for (const field of TRADE_OFF_REQUIRED_FIELDS) {
      const v = row[field];
      if (typeof v !== "string" || v.trim().length === 0 || v === "(draft)") {
        complete = false;
        break;
      }
    }
    const photos = Array.isArray(row.photos) ? (row.photos as unknown[]) : [];
    if (photos.length < 1) complete = false;
    nextStatus = complete ? "live" : "draft";
    if (nextStatus !== existing.data.status) {
      await supabaseAdmin
        .from("hammerex_trade_off_listings")
        .update({ status: nextStatus })
        .eq("id", existing.data.id);
    }
  }

  try {
    await recomputeHammerexStandard(existing.data.id);
  } catch (err) {
    console.error("[trade-off/update] recomputeHammerexStandard failed:", err);
  }

  return NextResponse.json({
    ok: true,
    status: nextStatus,
    slug: nextSlug ?? existing.data.slug
  });
}
