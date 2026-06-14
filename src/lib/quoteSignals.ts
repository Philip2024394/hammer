"use client";

import { supabase } from "./supabase";

// Honest WhatsApp-quote click logger and reader. Never fabricates counts.
// A row is only inserted if the user actually taps the quote button.

const LOCAL_LIMIT_KEY = "hammerex_quote_log_v1";
const PER_PRODUCT_THROTTLE_MS = 5 * 60 * 1000;  // 5 minutes

function throttle(productId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(LOCAL_LIMIT_KEY) ?? "{}";
    const map = JSON.parse(raw) as Record<string, number>;
    const last = map[productId];
    const now = Date.now();
    if (last && now - last < PER_PRODUCT_THROTTLE_MS) return false;
    map[productId] = now;
    localStorage.setItem(LOCAL_LIMIT_KEY, JSON.stringify(map));
    return true;
  } catch { return true; }
}

export async function logQuoteClick(productId: string, source: "pdp_fab" | "checkout_wa"): Promise<void> {
  if (!productId) return;
  if (!throttle(productId)) return;
  // Fire-and-forget — never block navigation or surface errors to the user.
  void supabase.from("hammerex_quote_clicks").insert({ product_id: productId, source });
}

// Returns the genuine 7-day click count for a product, or null if it's
// below the display threshold (we never show signals on cold inventory).
const DISPLAY_THRESHOLD = 3;

export async function fetchQuoteSignal(productId: string): Promise<number | null> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const res = await supabase
    .from("hammerex_quote_clicks")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .gte("created_at", since);
  if (res.error) return null;
  const n = res.count ?? 0;
  return n >= DISPLAY_THRESHOLD ? n : null;
}
