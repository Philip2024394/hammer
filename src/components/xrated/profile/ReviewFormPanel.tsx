"use client";

// Xrated Trades — leave-a-review form.
//
// Renders on /trade/<slug>/review under the standard PremiumHero strip.
// Submission posts to /api/trade-off/reviews and lands as `pending`
// (24h cool-down) so the customer can withdraw via the email link if
// they cool off. The tradesperson is auto-notified with a 48h response
// window so they can post a public reply before the review goes live.
//
// Photo uploads reuse the existing /api/trade-off/lead-photos endpoint.

import { useState } from "react";

const MAX_PHOTOS = 6;
const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/;

type ProjectType = "" | "new_build" | "renovation" | "repair";

type PricedService = {
  name: string;
  image_url: string | null;
  image_urls?: string[];
  price: number;
  unit: string;
  description?: string | null;
};

export function ReviewFormPanel({
  listingId,
  displayName,
  pricedServices
}: {
  listingId: string;
  displayName: string;
  pricedServices: PricedService[];
}) {
  const themeColor = "#FFB300";

  // "" = nothing picked yet, "__general__" = customer chose Other / General,
  // anything else is the priced_service.name the review is about.
  const [serviceName, setServiceName] = useState<string>("");
  const [overall, setOverall] = useState(0);
  const [workmanship, setWorkmanship] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [timeliness, setTimeliness] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("");
  const [projectFinish, setProjectFinish] = useState("");
  const [quotedDays, setQuotedDays] = useState("");
  const [actualDays, setActualDays] = useState("");
  const [attemptedResolution, setAttemptedResolution] = useState<"yes" | "no" | "">("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setErr(`You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    setErr(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const f of toUpload) {
        const fd = new FormData();
        fd.append("listing_id", listingId);
        fd.append("file", f);
        const res = await fetch("/api/trade-off/lead-photos", {
          method: "POST",
          body: fd
        });
        const json = await res.json().catch(() => ({ ok: false }));
        if (!json.ok || typeof json.url !== "string") {
          throw new Error(json.error || "Upload failed.");
        }
        newUrls.push(json.url);
      }
      setPhotos((curr) => [...curr, ...newUrls]);
    } catch (uploadErr) {
      setErr(uploadErr instanceof Error ? uploadErr.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function validate(): string | null {
    if (overall < 1) return "Please choose an overall star rating.";
    if (name.trim().length < 2) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (postcode.trim() && !UK_POSTCODE_RE.test(postcode.trim().toUpperCase())) {
      return "Please enter a valid UK postcode (or leave blank).";
    }
    if (body.trim().length < 100) return "Review must be at least 100 characters.";
    if (body.trim().length > 2000) return "Review must be 2000 characters or fewer.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/trade-off/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          service_name:
            serviceName && serviceName !== "__general__" ? serviceName : null,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_postcode: postcode.trim() || null,
          project_type: projectType || null,
          project_finish: projectFinish.trim() || null,
          timeframe_quoted_days: quotedDays ? Number(quotedDays) : null,
          timeframe_actual_days: actualDays ? Number(actualDays) : null,
          attempted_resolution:
            attemptedResolution === "" ? null : attemptedResolution === "yes",
          overall_rating: overall,
          workmanship_rating: workmanship || null,
          communication_rating: communication || null,
          value_rating: valueRating || null,
          timeliness_rating: timeliness || null,
          body: body.trim(),
          photo_urls: photos
        })
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!json.ok) {
        setErr(json.error || "Could not submit your review — please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="w-full px-4 pb-2 pt-8">
        <div
          className="rounded-2xl border p-5 text-center"
          style={{ borderColor: themeColor, background: `${themeColor}14` }}
        >
          <p className="text-[13px] font-bold" style={{ color: themeColor }}>
            Review submitted for {displayName}.
          </p>
          <p className="mt-1 text-[13px] text-brand-muted">
            Your review goes live in 24 hours — you can withdraw it in that
            window using the link we&apos;ve emailed. {displayName} has been
            notified and may post a public response before then.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="review-panel" className="w-full px-4 pb-2 pt-8">
      <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
        Leave a review for {displayName}
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        Honest, detailed feedback helps customers and protects good tradespeople.
        Reviews go live after a 24-hour cool-down — you can withdraw or edit
        within that window.
      </p>

      <form
        onSubmit={submit}
        className="mt-4 space-y-5 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-5"
      >
        {/* Service-picker step — at the top so the reviewer anchors
            their rating to a specific job before they pick stars. */}
        <ServicePicker
          services={pricedServices}
          value={serviceName}
          onChange={setServiceName}
        />

        {/* Overall rating — big and unmissable. */}
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-muted">
            Overall rating <span className="text-red-500">*</span>
          </span>
          <StarRow value={overall} onChange={setOverall} size="lg" />
        </div>

        {/* Category ratings */}
        <div className="grid gap-3 sm:grid-cols-2">
          <CategoryRating
            label="Workmanship"
            value={workmanship}
            onChange={setWorkmanship}
          />
          <CategoryRating
            label="Communication"
            value={communication}
            onChange={setCommunication}
          />
          <CategoryRating label="Value" value={valueRating} onChange={setValueRating} />
          <CategoryRating
            label="Timeliness"
            value={timeliness}
            onChange={setTimeliness}
          />
        </div>

        {/* Identity row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Your name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              minLength={2}
              maxLength={80}
              className={inputClass}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={120}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Job postcode (helps verify the project)">
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            placeholder="M1 1AE"
            maxLength={10}
            className={inputClass}
          />
        </Field>

        {/* Project context */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Project type">
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className={inputClass}
            >
              <option value="">Select project type…</option>
              <option value="new_build">New build</option>
              <option value="renovation">Renovation</option>
              <option value="repair">Repair</option>
            </select>
          </Field>
          <Field label="Project finish — how does it look now?">
            <input
              type="text"
              value={projectFinish}
              onChange={(e) => setProjectFinish(e.target.value)}
              placeholder="e.g. Mirror-smooth, ready to paint"
              maxLength={120}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Timeframe */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Quoted timeframe (days)">
            <input
              type="number"
              min={0}
              max={365}
              value={quotedDays}
              onChange={(e) => setQuotedDays(e.target.value)}
              placeholder="e.g. 5"
              className={inputClass}
            />
          </Field>
          <Field label="Actual timeframe (days)">
            <input
              type="number"
              min={0}
              max={365}
              value={actualDays}
              onChange={(e) => setActualDays(e.target.value)}
              placeholder="e.g. 6"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Resolution flag */}
        <Field label={`Did you raise any concerns with ${displayName.split(" ")[0]} before posting?`}>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {(["yes", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAttemptedResolution(opt)}
                className="inline-flex h-11 items-center justify-center rounded-md border text-xs font-bold transition"
                style={
                  attemptedResolution === opt
                    ? { background: themeColor, color: "#000", borderColor: themeColor }
                    : { background: "transparent", borderColor: "rgb(229 231 235)" }
                }
              >
                {opt === "yes" ? "Yes — we tried first" : "No — first time mentioning"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-brand-muted">
            Context only — does not gate publishing. Helps the tradesperson respond fairly.
          </p>
        </Field>

        {/* Review body */}
        <Field label={`Tell others about your experience ( ${body.trim().length} / 2000 )`} required>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What went well, what didn't, would you hire them again. 100 characters minimum so reviewers can read enough to decide."
            required
            minLength={100}
            maxLength={2000}
            rows={7}
            className="mt-1.5 w-full rounded-md border border-brand-line bg-brand-bg px-3 py-2 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
        </Field>

        {/* Photo picker */}
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-muted">
            Photos of the finished work (optional · up to {MAX_PHOTOS})
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((url) => (
              <div
                key={url}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-brand-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Attached" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((curr) => curr.filter((p) => p !== url))}
                  aria-label="Remove photo"
                  className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-brand-line bg-brand-bg text-brand-muted transition hover:border-brand-accent hover:text-brand-accent">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  className="sr-only"
                  onChange={onPickFiles}
                  disabled={uploading}
                />
                {uploading ? (
                  <span className="text-xs font-bold">Uploading…</span>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </label>
            )}
          </div>
        </div>

        {err && (
          <p className="text-[13px] font-semibold text-red-600" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || uploading}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-5 text-[13px] font-bold transition disabled:opacity-50"
          style={{ background: themeColor, color: "#000" }}
        >
          {busy ? "Submitting…" : "Submit review"}
        </button>

        <p className="text-[11px] leading-relaxed text-brand-muted">
          By submitting, you confirm this is your honest experience and that the work
          was completed by {displayName}. The tradesperson can post a public response
          and may dispute factual errors with evidence — see our review policy for
          details.
        </p>
      </form>
    </section>
  );
}

function StarRow({
  value,
  onChange,
  size = "md"
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? 36 : 24;
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} of 5`}
          className="transition active:scale-90"
        >
          <svg
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={i <= value ? "#FFB300" : "none"}
            stroke="#FFB300"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function CategoryRating({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-bg p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
        {label}
      </p>
      <StarRow value={value} onChange={onChange} />
    </div>
  );
}

// Service-picker grid: thumbnail tile per priced_service + a final
// "Other / general review" tile so customers writing a non-specific
// review never get gated. Selected service routes into the POST
// payload as `service_name`; "__general__" maps to null.
function ServicePicker({
  services,
  value,
  onChange
}: {
  services: PricedService[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-muted">
        Which service is this review about?
      </span>
      <p className="mt-1 text-[11px] text-brand-muted">
        Tap the service you had carried out — it gets attached to your
        review so future customers can see what you actually rated. Pick
        Other if it was general work.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {services.map((svc) => {
          const isPicked = value === svc.name;
          return (
            <li key={svc.name}>
              <button
                type="button"
                onClick={() => onChange(isPicked ? "" : svc.name)}
                aria-pressed={isPicked}
                className={`group relative block w-full overflow-hidden rounded-xl border-2 text-left transition active:scale-[0.98] ${
                  isPicked
                    ? "border-[#FFB300]"
                    : "border-transparent ring-1 ring-brand-line hover:ring-[#FFB300]"
                }`}
              >
                <span className="block aspect-video w-full overflow-hidden bg-neutral-100">
                  {svc.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={svc.image_url}
                      alt={svc.name}
                      className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </span>
                  )}
                </span>
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-xs font-extrabold text-brand-text">
                    {svc.name}
                  </span>
                  <span className="block text-[11px] text-brand-muted">
                    £{svc.price.toLocaleString("en-GB")} {svc.unit}
                  </span>
                </span>
                {isPicked && (
                  <span
                    aria-hidden="true"
                    className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: "#FFB300" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() =>
              onChange(value === "__general__" ? "" : "__general__")
            }
            aria-pressed={value === "__general__"}
            className={`flex h-full min-h-[7.5rem] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-4 text-center transition active:scale-[0.98] ${
              value === "__general__"
                ? "border-[#FFB300] bg-[#FFB300]/10"
                : "border-dashed border-brand-line bg-brand-bg hover:border-[#FFB300]"
            }`}
          >
            <span className="text-xl">💬</span>
            <span className="text-xs font-extrabold text-brand-text">
              Other / general review
            </span>
            <span className="text-[11px] text-brand-muted">
              Not tied to a listed service
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-[13px] text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none";

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-muted">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
