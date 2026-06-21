// Server-side tracking helpers. Each writes a row to the matching
// hammerex_* table. Failures are swallowed (best-effort logging — we
// never want a tracking miss to bubble up as a 500 to the buyer).

import { supabase } from "./supabase";

export type PageEventType =
  | "pdp_view"
  | "cart_view"
  | "checkout_view"
  | "checkout_started"
  | "checkout_success";

export async function logPageEvent(input: {
  event_type: PageEventType;
  product_id?: string | null;
  country?: string | null;
  session_id?: string | null;
  path?: string | null;
}): Promise<void> {
  try {
    await supabase.from("hammerex_page_events").insert({
      event_type: input.event_type,
      product_id: input.product_id ?? null,
      country: input.country ?? null,
      session_id: input.session_id ?? null,
      path: input.path ?? null
    });
  } catch {
    // best-effort
  }
}

export async function logSearchQuery(input: {
  q: string;
  results_count: number;
  country?: string | null;
  session_id?: string | null;
}): Promise<void> {
  const q = input.q.trim();
  if (!q) return;
  try {
    await supabase.from("hammerex_search_queries").insert({
      q,
      results_count: input.results_count,
      country: input.country ?? null,
      session_id: input.session_id ?? null
    });
  } catch {
    // best-effort
  }
}
