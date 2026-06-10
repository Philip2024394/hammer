"use client";

import { useMemo, useState } from "react";
import type { HammerexReview } from "@/lib/supabase";

type Filter = "all" | "pro" | "hobbyist" | "first-timer" | "photo";

const PILLARS_DEFAULT = ["Power", "Build", "Battery", "Value"];

function avg(reviews: HammerexReview[], key?: string) {
  if (!reviews.length) return 0;
  const vals = key
    ? reviews.map((r) => Number(r.pillars?.[key] ?? 0)).filter((n) => n > 0)
    : reviews.map((r) => r.rating);
  if (!vals.length) return 0;
  return vals.reduce((s, n) => s + n, 0) / vals.length;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(value) ? "#FFB300" : "none"} stroke="#FFB300" strokeWidth="2" aria-hidden="true">
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewsBlock({ productId, reviews }: { productId: string; reviews: HammerexReview[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    if (filter === "photo") return reviews.filter((r) => (r.photos ?? []).length > 0);
    return reviews.filter((r) => r.reviewer_type === filter);
  }, [filter, reviews]);

  const overall = avg(reviews);
  const pillars = PILLARS_DEFAULT.map((p) => ({ label: p, value: avg(reviews, p.toLowerCase()) }));

  return (
    <section id="reviews" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-text">Reviews</h2>
          <button
            type="button"
            className="h-10 rounded-full bg-brand-accent px-4 text-xs font-semibold text-black hover:opacity-90"
          >
            Write a review
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <div className="text-3xl font-bold text-brand-text">{overall ? overall.toFixed(1) : "—"}</div>
            <Stars value={overall} />
            <div className="text-xs text-brand-muted">{reviews.length} review{reviews.length === 1 ? "" : "s"}</div>

            <ul className="mt-4 space-y-2">
              {pillars.map((p) => (
                <li key={p.label}>
                  <div className="mb-1 flex justify-between text-xs text-brand-muted">
                    <span>{p.label}</span>
                    <span className="text-brand-text">{p.value ? p.value.toFixed(1) : "—"}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black">
                    <div
                      className="h-full bg-brand-accent"
                      style={{ width: `${Math.min(100, (p.value / 5) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <nav className="scrollbar-none mb-4 flex gap-2 overflow-x-auto" aria-label="Filter reviews">
              {[
                { v: "all", l: "All" },
                { v: "pro", l: "Pro" },
                { v: "hobbyist", l: "Hobbyist" },
                { v: "first-timer", l: "First-timer" },
                { v: "photo", l: "With photos" }
              ].map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFilter(f.v as Filter)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${
                    filter === f.v
                      ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                      : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
                  }`}
                >{f.l}</button>
              ))}
            </nav>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
                <p className="text-sm text-brand-text">No reviews yet — be the first.</p>
                <p className="mt-1 text-xs text-brand-muted">Pillar ratings show as soon as the first verified buyer reviews.</p>
              </div>
            ) : (
              <ol className="space-y-4">
                {filtered.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} />
                          {r.verified_purchase && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Verified</span>
                          )}
                          {r.reviewer_type && (
                            <span className="rounded-full border border-brand-line bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">{r.reviewer_type}</span>
                          )}
                        </div>
                        {r.title && <h3 className="mt-2 text-sm font-semibold text-brand-text">{r.title}</h3>}
                      </div>
                      <span className="text-xs text-brand-muted">{r.reviewer_name}</span>
                    </div>
                    {r.body && <p className="mt-2 text-xs leading-relaxed text-brand-muted">{r.body}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
