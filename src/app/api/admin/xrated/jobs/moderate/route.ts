// POST /api/admin/xrated/jobs/moderate
// Body (JSON or form-encoded): {
//   job_id: uuid,
//   status: 'pending' | 'live' | 'completed' | 'rejected' | 'expired',
//   mark_as_example?: boolean
// }
//
// Auth mirrors flip-paid: ADMIN_COOKIE + verifyAdminCookie. Accepts both
// JSON (fetch) and form-encoded bodies. Form submits 303-redirect back to
// the moderation queue so the page re-renders with the new state; JSON
// submits return { ok }.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { HammerexXratedJob } from "@/lib/supabase";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<HammerexXratedJob["status"]>([
  "pending",
  "live",
  "completed",
  "rejected",
  "expired"
]);

type ParsedBody = {
  jobId: string;
  status: HammerexXratedJob["status"];
  markAsExample: boolean;
  isForm: boolean;
  redirectTo: string | null;
};

function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "on" || v === "1" || v === "yes";
  }
  return false;
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
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return null;
  }
  const jobId = typeof raw.job_id === "string" ? raw.job_id.trim() : "";
  const statusRaw = typeof raw.status === "string" ? raw.status.trim() : "";
  if (!jobId || !VALID_STATUSES.has(statusRaw as HammerexXratedJob["status"])) {
    return null;
  }
  const redirectTo =
    typeof raw.redirect_to === "string" && raw.redirect_to.startsWith("/")
      ? raw.redirect_to
      : null;
  return {
    jobId,
    status: statusRaw as HammerexXratedJob["status"],
    markAsExample: parseBool(raw.mark_as_example),
    isForm,
    redirectTo
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
      { ok: false, error: "Bad request — needs job_id + status" },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = { status: body.status };
  if (body.markAsExample) patch.is_example = true;

  const upd = await supabaseAdmin
    .from("hammerex_xrated_jobs")
    .update(patch)
    .eq("id", body.jobId)
    .select("id")
    .maybeSingle();

  if (upd.error) {
    return NextResponse.json(
      { ok: false, error: upd.error.message },
      { status: 500 }
    );
  }
  if (!upd.data) {
    return NextResponse.json(
      { ok: false, error: "Job not found" },
      { status: 404 }
    );
  }

  if (body.isForm) {
    const url = new URL(
      body.redirectTo ?? "/admin/xrated/jobs",
      req.url
    );
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json({ ok: true });
}
