// GET /api/xrated-member/check?email=&whatsapp=
// Returns { is_annual_member, listing_id, display_name, slug } so the
// checkout page can surface the 5%-off banner the moment the buyer's
// email or WhatsApp matches an active Xrated annual member.
//
// Always 200 — caller treats { is_annual_member: false } as "no perk",
// not as an error.

import { NextResponse, type NextRequest } from "next/server";
import { lookupAnnualMember } from "@/lib/xratedMember";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const whatsapp = url.searchParams.get("whatsapp");
    const result = await lookupAnnualMember({ email, whatsapp });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      is_annual_member: false,
      listing_id: null,
      display_name: null,
      slug: null
    });
  }
}
