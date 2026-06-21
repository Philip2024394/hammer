"use client";

// Persistent session id used to stitch funnel events together. Stored in
// localStorage; one id per browser/profile. The admin's funnel rollups
// dedupe by this id so refreshing the same page doesn't inflate the
// PDP → cart → checkout drop-off numbers.

const KEY = "hammerex_sid";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh =
      (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return "";
  }
}
