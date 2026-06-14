"use client";

import { useEffect } from "react";
import { recentlyViewed } from "@/lib/recentlyViewed";

// Side-effect-only component: records the given slug to localStorage on mount.
export function RecordRecentView({ slug }: { slug: string | null }) {
  useEffect(() => { recentlyViewed.record(slug); }, [slug]);
  return null;
}
