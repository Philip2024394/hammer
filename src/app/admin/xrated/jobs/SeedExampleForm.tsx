"use client";

// Inline form for admin to seed an example job into the public jobs feed.
// Posts to /api/admin/xrated/jobs/seed-example as form-encoded so the
// route can 303-redirect us back to the moderation queue. Photos are
// pasted as URLs (one per line) — admin grabs them from another upload
// flow and pastes here, no inline uploader.

import { useState } from "react";
import { TRADE_OFF_TRADES } from "@/lib/tradeOff";
import {
  XRATED_JOBS_MIN_DESCRIPTION,
  XRATED_JOBS_MAX_DESCRIPTION,
  XRATED_JOBS_MAX_PHOTOS,
  XRATED_JOB_BUDGET_PRESETS
} from "@/lib/xratedJobs";

export function SeedExampleForm() {
  const [open, setOpen] = useState(false);
  const [tradeSlug, setTradeSlug] = useState(TRADE_OFF_TRADES[0]?.slug ?? "");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [description, setDescription] = useState("");
  const [budgetHint, setBudgetHint] = useState("");
  const [customerName, setCustomerName] = useState("Example Customer");
  const [customerWa, setCustomerWa] = useState("+0000000000");
  const [photos, setPhotos] = useState("");
  const [error, setError] = useState<string | null>(null);

  const descLen = description.trim().length;
  const descOk =
    descLen >= XRATED_JOBS_MIN_DESCRIPTION &&
    descLen <= XRATED_JOBS_MAX_DESCRIPTION;
  const photoLines = photos
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const photosOk = photoLines.length <= XRATED_JOBS_MAX_PHOTOS;
  const ready = tradeSlug && city.trim() && descOk && photosOk;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!ready) {
      e.preventDefault();
      if (!descOk) {
        setError(
          `Description must be ${XRATED_JOBS_MIN_DESCRIPTION}-${XRATED_JOBS_MAX_DESCRIPTION} characters.`
        );
        return;
      }
      if (!photosOk) {
        setError(`Max ${XRATED_JOBS_MAX_PHOTOS} photo URLs.`);
        return;
      }
      setError("Trade and city are required.");
      return;
    }
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-bg hover:opacity-90"
      >
        Seed new example
      </button>
    );
  }

  return (
    <form
      action="/api/admin/xrated/jobs/seed-example"
      method="post"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent">
          Seed example job
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-brand-muted hover:text-brand-accent"
        >
          Cancel
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Trade">
          <select
            name="trade_slug"
            value={tradeSlug}
            onChange={(e) => setTradeSlug(e.target.value)}
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          >
            {TRADE_OFF_TRADES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input
            type="text"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Manchester"
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          />
        </Field>
        <Field label="Postcode prefix (optional)">
          <input
            type="text"
            name="postcode_prefix"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            placeholder="M14"
            maxLength={8}
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          />
        </Field>
        <Field label="Budget hint">
          <input
            type="text"
            name="budget_hint"
            value={budgetHint}
            onChange={(e) => setBudgetHint(e.target.value)}
            placeholder="e.g. £300 – £600"
            list="budget-presets"
            maxLength={80}
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          />
          <datalist id="budget-presets">
            {XRATED_JOB_BUDGET_PRESETS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Customer name">
          <input
            type="text"
            name="customer_name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={80}
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          />
        </Field>
        <Field label="Customer WhatsApp (examples never link out)">
          <input
            type="text"
            name="customer_whatsapp"
            value={customerWa}
            onChange={(e) => setCustomerWa(e.target.value)}
            maxLength={32}
            className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
          />
        </Field>
      </div>

      <Field
        label={`Description (${descLen}/${XRATED_JOBS_MAX_DESCRIPTION}, min ${XRATED_JOBS_MIN_DESCRIPTION})`}
      >
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          minLength={XRATED_JOBS_MIN_DESCRIPTION}
          maxLength={XRATED_JOBS_MAX_DESCRIPTION}
          className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
        />
      </Field>

      <Field
        label={`Photo URLs (one per line, max ${XRATED_JOBS_MAX_PHOTOS}) — ${photoLines.length}/${XRATED_JOBS_MAX_PHOTOS}`}
      >
        <textarea
          name="photos"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          rows={3}
          placeholder="https://...supabase.co/.../1.jpg"
          className="rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text"
        />
      </Field>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!ready}
          className="rounded-full bg-brand-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Seed example
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-brand-muted">
      <span className="uppercase tracking-widest">{label}</span>
      {children}
    </label>
  );
}
