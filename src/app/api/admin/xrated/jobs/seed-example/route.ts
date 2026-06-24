// POST /api/admin/xrated/jobs/seed-example
// Admin-only — seeds an example job into the public feed so the carousel
// has demo content before real customer density. Inserts with status='live'
// and is_example=true. Photos are accepted as a small array of pre-hosted
// URLs (Supabase Storage) — we don't run an upload step here.
//
// Body (JSON or form-encoded): {
//   trade_slug, city, postcode_prefix?, description, budget_hint?,
//   customer_name?, customer_whatsapp?, photos?: string[] | csv string
// }

import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  XRATED_JOBS_MIN_DESCRIPTION,
  XRATED_JOBS_MAX_DESCRIPTION,
  XRATED_JOBS_MAX_PHOTOS,
  buildJobSlug,
  isJobTradeKnown
} from "@/lib/xratedJobs";

export const runtime = "nodejs";

type ParsedBody = {
  trade_slug: string;
  city: string;
  postcode_prefix: string | null;
  description: string;
  budget_hint: string | null;
  customer_name: string;
  customer_whatsapp: string;
  photos: string[];
  isForm: boolean;
};

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

async function parseBody(req: NextRequest): Promise<ParsedBody | null> {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  let raw: Record<string, unknown> = {};
  let isForm = false;
  try {
    if (ct.includes("application/json")) {
      raw = (await req.json()) as Record<string, unknown>;
    } else {
      isForm = true;
      const fd = await req.formData();
      // formData().getAll() lets multiple `photos` entries through.
      const obj: Record<string, unknown> = {};
      for (const key of new Set(Array.from(fd.keys()))) {
        const all = fd.getAll(key);
        obj[key] = all.length > 1 ? all.map((x) => String(x)) : String(all[0]);
      }
      raw = obj;
    }
  } catch {
    return null;
  }

  const trade_slug =
    typeof raw.trade_slug === "string" ? raw.trade_slug.trim().toLowerCase() : "";
  const city = typeof raw.city === "string" ? raw.city.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";

  if (!trade_slug || !isJobTradeKnown(trade_slug)) return null;
  if (!city) return null;
  if (description.length < XRATED_JOBS_MIN_DESCRIPTION) return null;
  if (description.length > XRATED_JOBS_MAX_DESCRIPTION) return null;

  const postcode_prefix =
    typeof raw.postcode_prefix === "string" && raw.postcode_prefix.trim()
      ? raw.postcode_prefix.trim().toUpperCase().slice(0, 8)
      : null;
  const budget_hint =
    typeof raw.budget_hint === "string" && raw.budget_hint.trim()
      ? raw.budget_hint.trim().slice(0, 80)
      : null;
  const customer_name =
    typeof raw.customer_name === "string" && raw.customer_name.trim()
      ? raw.customer_name.trim().slice(0, 80)
      : "Example Customer";
  const customer_whatsapp =
    typeof raw.customer_whatsapp === "string" && raw.customer_whatsapp.trim()
      ? raw.customer_whatsapp.trim().slice(0, 32)
      : "+0000000000";

  const photos = toStringArray(raw.photos).slice(0, XRATED_JOBS_MAX_PHOTOS);

  return {
    trade_slug,
    city,
    postcode_prefix,
    description,
    budget_hint,
    customer_name,
    customer_whatsapp,
    photos,
    isForm
  };
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Bad request — check trade, city, and description length." },
      { status: 400 }
    );
  }

  // 90-day expiry — matches the typical lifecycle for a live job.
  const expires = new Date(Date.now() + 90 * 86400 * 1000).toISOString();

  // Stamp every example slug with a short suffix to avoid uniq collisions
  // when admin seeds multiple Manchester plumber examples back-to-back.
  const shortId = randomBytes(3).toString("hex");
  const slug = buildJobSlug(body.trade_slug, body.city, `example-${shortId}`);

  const insert = await supabaseAdmin
    .from("hammerex_xrated_jobs")
    .insert({
      slug,
      customer_name: body.customer_name,
      customer_whatsapp: body.customer_whatsapp,
      trade_slug: body.trade_slug,
      city: body.city,
      postcode_prefix: body.postcode_prefix,
      description: body.description,
      budget_hint: body.budget_hint,
      photos: body.photos,
      status: "live",
      is_example: true,
      expires_at: expires
    })
    .select("id, slug")
    .maybeSingle();

  if (insert.error) {
    return NextResponse.json(
      { ok: false, error: insert.error.message },
      { status: 500 }
    );
  }

  if (body.isForm) {
    const url = new URL("/admin/xrated/jobs", req.url);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json({
    ok: true,
    slug: insert.data?.slug ?? slug,
    id: insert.data?.id
  });
}
