"use client";

const KEY = "hammerex_recent_v1";
const MAX = 12;

export const recentlyViewed = {
  read(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
  },
  record(slug: string | null | undefined) {
    if (!slug || typeof window === "undefined") return;
    const list = this.read().filter((s) => s !== slug);
    list.unshift(slug);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  }
};
