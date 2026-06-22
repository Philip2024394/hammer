// POST /api/reviews
// Multipart form submission from the PDP "Write a review" form. Inserts
// the row as status='pending' so the admin queue at /admin/reviews can
// approve before it ever renders on the storefront. Uses the service
// role key (supabaseAdmin) so we don't need to open RLS for public
// writes — the public anon key still has zero insert/update rights on
// this table.
//
// Photos are uploaded to the public `product-images` bucket under
//   reviews/{product_id}/{uuid}.{ext}
// and the returned public URLs are stored in the `photos` jsonb column.

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB
const BUCKET = "product-images";

const PILLAR_KEYS = ["quality", "delivery", "service", "value"] as const;

function clampStar(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic") return "heic";
  if (mime === "image/heif") return "heif";
  return "bin";
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form body" }, { status: 400 });
  }

  const productId = String(form.get("product_id") ?? "").trim();
  const reviewerName = String(form.get("reviewer_name") ?? "").trim();
  const reviewerCountry = String(form.get("reviewer_country") ?? "").trim();
  const reviewerWhatsapp = String(form.get("reviewer_whatsapp") ?? "").trim();
  const rating = clampStar(form.get("rating"));
  const title = String(form.get("title") ?? "").trim() || null;
  const body = String(form.get("body") ?? "").trim() || null;

  if (!productId || !reviewerName || !reviewerCountry || !reviewerWhatsapp || rating < 1) {
    return NextResponse.json(
      { ok: false, error: "Name, country, phone and an overall rating are required." },
      { status: 400 }
    );
  }

  const productCheck = await supabaseAdmin
    .from("hammerex_products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (!productCheck.data) {
    return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 404 });
  }

  const pillars: Record<string, number> = {};
  for (const k of PILLAR_KEYS) {
    const n = clampStar(form.get(`pillar_${k}`));
    if (n > 0) pillars[k] = n;
  }

  const photoFiles = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  if (photoFiles.length > MAX_PHOTOS) {
    return NextResponse.json(
      { ok: false, error: `Maximum ${MAX_PHOTOS} photos per review.` },
      { status: 400 }
    );
  }

  const uploadedUrls: string[] = [];
  for (const file of photoFiles) {
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { ok: false, error: `Photo "${file.name}" exceeds 8 MB.` },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: `Photo "${file.name}" is not an image.` },
        { status: 400 }
      );
    }
    const ext = extFromMime(file.type);
    const path = `reviews/${productId}/${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (up.error) {
      return NextResponse.json(
        { ok: false, error: `Photo upload failed: ${up.error.message}` },
        { status: 500 }
      );
    }
    const pub = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    uploadedUrls.push(pub.data.publicUrl);
  }

  const insert = await supabaseAdmin
    .from("hammerex_reviews")
    .insert({
      product_id: productId,
      reviewer_name: reviewerName.slice(0, 120),
      reviewer_country: reviewerCountry.slice(0, 80),
      reviewer_whatsapp: reviewerWhatsapp.slice(0, 40),
      rating,
      pillars,
      title: title ? title.slice(0, 160) : null,
      body: body ? body.slice(0, 4000) : null,
      photos: uploadedUrls,
      status: "pending",
      verified_purchase: false,
      helpful_count: 0
    })
    .select("id")
    .single();

  if (insert.error) {
    return NextResponse.json(
      { ok: false, error: `Could not save review: ${insert.error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: insert.data.id });
}
