"use client";

import { useEffect, useMemo, useState } from "react";
import type { HammerexReview } from "@/lib/supabase";
import { WriteReviewForm } from "./WriteReviewForm";

const PILLARS_DEFAULT = ["Quality", "Delivery", "Service", "Value"];
const PILLAR_KEYS = PILLARS_DEFAULT.map((p) => p.toLowerCase());
const PAGE_SIZE = 10;

type SortMode = "newest" | "highest" | "lowest";
type FilterMode = "all" | "verified" | "photos" | "5" | "4" | "3" | "2" | "1";

function hasPhotos(r: HammerexReview): boolean {
  return Array.isArray(r.photos) && r.photos.length > 0;
}

function avg(reviews: HammerexReview[], key?: string): number {
  if (!reviews.length) return 0;
  const vals = key
    ? reviews.map((r) => Number(r.pillars?.[key] ?? 0)).filter((n) => n > 0)
    : reviews.map((r) => r.rating);
  if (!vals.length) return 0;
  return vals.reduce((s, n) => s + n, 0) / vals.length;
}

// Percentage rating: the average star value across every dimension a reviewer
// gave a score on (overall + any pillar scores), normalised to 0–100.
// More dimensions tend to lift the score because reviewers rarely score every
// dimension equally low.
function calculateOverallPercent(reviews: HammerexReview[]): number {
  let total = 0;
  let count = 0;
  for (const r of reviews) {
    if (r.rating > 0) {
      total += r.rating;
      count += 1;
    }
    if (r.pillars) {
      for (const k of PILLAR_KEYS) {
        const v = Number(r.pillars[k] ?? 0);
        if (v > 0) {
          total += v;
          count += 1;
        }
      }
    }
  }
  if (!count) return 0;
  return Math.round((total / count / 5) * 100);
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="text-brand-accent" fill={i < Math.round(value) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewsBlock({
  productId,
  productName,
  reviews
}: {
  productId: string;
  productName: string;
  reviews: HammerexReview[];
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortMode>("newest");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  // Esc-to-close + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  const filtered = useMemo(() => {
    let out = [...reviews];
    if (filter === "verified") out = out.filter((r) => r.verified_purchase);
    else if (filter === "photos") out = out.filter(hasPhotos);
    else if (filter !== "all") {
      const n = Number(filter);
      out = out.filter((r) => r.rating === n);
    }
    if (sort === "newest") out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "highest") out.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") out.sort((a, b) => a.rating - b.rating);
    return out;
  }, [reviews, sort, filter]);

  // Aggregate every photo across every review, newest first. Capped at 12
  // for the strip — the dedicated "Photos" filter shows the rest.
  const allPhotos = useMemo(() => {
    const out: { src: string; reviewer: string }[] = [];
    const sorted = [...reviews].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    for (const r of sorted) {
      if (!hasPhotos(r)) continue;
      for (const src of r.photos as string[]) {
        out.push({ src, reviewer: r.reviewer_name });
        if (out.length >= 12) return out;
      }
    }
    return out;
  }, [reviews]);

  const photosTotal = reviews.reduce(
    (n, r) => n + (Array.isArray(r.photos) ? r.photos.length : 0),
    0
  );

  const displayed = filtered.slice(0, shown);
  const remaining = Math.max(0, filtered.length - displayed.length);

  const overall = avg(reviews);
  const percent = calculateOverallPercent(reviews);
  const pillars = PILLARS_DEFAULT.map((p) => ({ label: p, value: avg(reviews, p.toLowerCase()) }));

  return (
    <section id="reviews" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-text">Reviews</h2>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="write-review-form"
            className="h-11 rounded-full bg-brand-accent px-4 text-xs font-bold uppercase tracking-widest text-black transition active:scale-[0.97] hover:opacity-90"
          >
            {open ? "Close form" : "Write a review"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-brand-line bg-brand-surface p-5">
            <div className="text-3xl font-bold text-brand-text">{percent > 0 ? `${percent}%` : "—"}</div>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={overall} />
              <span className="text-xs text-brand-muted">{overall > 0 ? overall.toFixed(1) : "—"} avg</span>
            </div>
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

            <p className="mt-4 text-xs leading-relaxed text-brand-muted">
              Rating is calculated as the percentage average across every star
              reviewers left — Overall plus the Quality, Delivery, Service and
              Value dimensions of every review. Reviewers rarely score every
              dimension at 1 star, so the percentage reflects the genuine
              spread of feedback across the product experience.
            </p>
          </aside>

          <div>
            {open && (
              <div id="write-review-form" className="mb-6">
                <WriteReviewForm
                  productId={productId}
                  productName={productName}
                  onClose={() => setOpen(false)}
                />
              </div>
            )}

            {allPhotos.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-end justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                    Photos from buyers · {photosTotal}
                  </h3>
                  {photosTotal > allPhotos.length && (
                    <button
                      type="button"
                      onClick={() => { setFilter("photos"); setShown(PAGE_SIZE); }}
                      className="text-xs font-semibold text-brand-text hover:text-brand-accent"
                    >See all photo reviews →</button>
                  )}
                </div>
                <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((p, i) => (
                    <li key={`${p.src}-${i}`} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setZoom({ src: p.src, alt: `Buyer photo by ${p.reviewer}` })}
                        aria-label={`Enlarge buyer photo by ${p.reviewer}`}
                        className="block h-24 w-24 overflow-hidden rounded-xl border border-brand-line bg-black transition hover:border-brand-accent"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt={`Buyer photo by ${p.reviewer}`} loading="lazy" className="h-full w-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {([
                  { v: "all", label: "All" },
                  { v: "verified", label: "Verified" },
                  ...(photosTotal > 0 ? [{ v: "photos" as const, label: `With photos (${photosTotal})` }] : []),
                  { v: "5", label: "5★" },
                  { v: "4", label: "4★" },
                  { v: "3", label: "3★" },
                  { v: "2", label: "2★" },
                  { v: "1", label: "1★" }
                ] as { v: FilterMode; label: string }[]).map((f) => {
                  const active = filter === f.v;
                  return (
                    <button
                      key={f.v}
                      type="button"
                      onClick={() => { setFilter(f.v); setShown(PAGE_SIZE); }}
                      aria-pressed={active}
                      className={`min-h-11 rounded-full border px-3 text-xs font-semibold transition active:scale-[0.97] ${
                        active
                          ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                          : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent hover:text-brand-text"
                      }`}
                    >{f.label}</button>
                  );
                })}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as SortMode); setShown(PAGE_SIZE); }}
                  aria-label="Sort reviews"
                  className="ml-auto h-11 rounded-full border border-brand-line bg-brand-surface px-3 text-xs font-semibold text-brand-text focus:border-brand-accent focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>
            )}

            {displayed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
                <p className="text-sm text-brand-text">No reviews yet — be the first.</p>
                <p className="mt-1 text-xs text-brand-muted">Pillar ratings show as soon as the first verified buyer reviews.</p>
              </div>
            ) : (
              <>
                <ol className="space-y-4">
                  {displayed.map((r) => (
                    <li key={r.id} className="hx-fade-in-up rounded-2xl border border-brand-line bg-brand-surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Stars value={r.rating} />
                            {r.verified_purchase && (
                              <span className="rounded-full bg-brand-success/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-success">Verified</span>
                            )}
                            {r.reviewer_type && (
                              <span className="rounded-full border border-brand-line bg-black px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">{r.reviewer_type}</span>
                            )}
                          </div>
                          {r.title && <h3 className="mt-2 text-sm font-semibold text-brand-text">{r.title}</h3>}
                        </div>
                        <span className="text-xs text-brand-muted">{r.reviewer_name}</span>
                      </div>
                      {r.body && <p className="mt-2 text-xs leading-relaxed text-brand-muted">{r.body}</p>}
                      {hasPhotos(r) && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {(r.photos as string[]).map((src, i) => (
                            <li key={`${r.id}-photo-${i}`}>
                              <button
                                type="button"
                                onClick={() => setZoom({ src, alt: `Photo from ${r.reviewer_name}'s review` })}
                                aria-label={`Enlarge photo from ${r.reviewer_name}'s review`}
                                className="block h-20 w-20 overflow-hidden rounded-lg border border-brand-line bg-black transition hover:border-brand-accent"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Customer review photo by ${r.reviewer_name}`} loading="lazy" className="h-full w-full object-cover" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {typeof r.helpful_count === "number" && r.helpful_count > 0 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-muted">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 10v11" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.97 2.34l-1.32 7A2 2 0 0 1 18.5 21H7v-9.5l4.5-7.5a2 2 0 0 1 3.5 1.88Z" />
                          </svg>
                          {r.helpful_count} found this helpful
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                {remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                    className="mt-6 grid h-12 w-full place-items-center rounded-full border border-brand-line bg-brand-surface text-xs font-bold uppercase tracking-widest text-brand-text transition active:scale-[0.98] hover:border-brand-accent hover:text-brand-accent"
                  >
                    Show {Math.min(PAGE_SIZE, remaining)} more
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.src}
            alt={zoom.alt}
            onClick={(e) => e.stopPropagation()}
            className="block max-h-[88vh] max-w-full rounded-xl object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Close"
            className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >×</button>
        </div>
      )}
    </section>
  );
}
