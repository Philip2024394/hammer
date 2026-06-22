// GET /api/search/suggest?q=…
// Returns up to 4 closest-matching products for the header typeahead.
// Same token-AND logic as the full /search page so suggestions and the
// "see all results" page agree. Reads through the public anon client —
// hammerex_products is publicly readable.

import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const LIMIT = 4;

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[%,()]/g, " ")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const tokens = tokenize(q);
  if (tokens.length === 0) return NextResponse.json({ items: [] });

  let query = supabase
    .from("hammerex_products")
    .select("id, slug, name, sku, price_idr, image_url, subtitle")
    .eq("hide_from_upsell", false);
  for (const tok of tokens) {
    query = query.or(
      `name.ilike.%${tok}%,subtitle.ilike.%${tok}%,sku.ilike.%${tok}%,description.ilike.%${tok}%`
    );
  }
  const res = await query
    .order("is_featured", { ascending: false })
    .order("rating_count", { ascending: false, nullsFirst: false })
    .limit(LIMIT);

  return NextResponse.json({ items: res.data ?? [] });
}
