"use client";

import { useRef, useState } from "react";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export function WriteReviewForm({
  productId,
  productName,
  onClose
}: {
  productId: string;
  productName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");

  const [overall, setOverall] = useState(0);
  const [quality, setQuality] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [service, setService] = useState(0);
  const [value, setValue] = useState(0);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid = name.trim() && whatsapp.trim() && country.trim() && overall > 0 && !submitting;

  function handlePhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...photos];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break;
      if (f.size > MAX_PHOTO_BYTES) {
        setErr(`"${f.name}" exceeds 8 MB.`);
        continue;
      }
      if (!f.type.startsWith("image/")) {
        setErr(`"${f.name}" is not an image.`);
        continue;
      }
      next.push(f);
    }
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((arr) => arr.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setErr(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("product_id", productId);
      fd.set("reviewer_name", name.trim());
      fd.set("reviewer_country", country.trim());
      fd.set("reviewer_whatsapp", whatsapp.trim());
      fd.set("rating", String(overall));
      if (quality > 0)  fd.set("pillar_quality",  String(quality));
      if (delivery > 0) fd.set("pillar_delivery", String(delivery));
      if (service > 0)  fd.set("pillar_service",  String(service));
      if (value > 0)    fd.set("pillar_value",    String(value));
      if (title.trim()) fd.set("title", title.trim());
      if (body.trim())  fd.set("body",  body.trim());
      for (const f of photos) fd.append("photos", f);

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErr(json.error || `Submission failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="overflow-hidden rounded-2xl border border-brand-accent bg-brand-bg">
        <div className="px-5 py-8 text-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent">
            Thanks — your review is in
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-brand-muted">
            Hammerex reviews are checked before publishing. We&rsquo;ll
            confirm yours shortly and post it on this product page.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 inline-grid h-11 min-w-[160px] place-items-center rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-2xl border border-brand-accent bg-brand-bg">
      <header className="flex items-start justify-between gap-3 border-b border-brand-line bg-brand-accent/10 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent">Write a review</h3>
          <p className="mt-1 truncate text-xs text-brand-muted">{productName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-muted hover:bg-black/40 hover:text-brand-accent"
        >×</button>
      </header>

      <div className="px-5 py-5">
        <Section title="Your details">
          <Field label="Name"     required value={name}     onChange={setName}     placeholder="Full name" />
          <Field label="Phone" required value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" />
          <Field label="Country"  required value={country}  onChange={setCountry}  placeholder="United Kingdom" />
        </Section>

        <Section title="Overall rating" required>
          <StarPicker value={overall} onChange={setOverall} />
        </Section>

        <Section title="Rate by area" subtitle="Optional — helps us improve where it matters">
          <PillarRow label="Quality"  value={quality}  onChange={setQuality} />
          <PillarRow label="Delivery" value={delivery} onChange={setDelivery} />
          <PillarRow label="Service"  value={service}  onChange={setService} />
          <PillarRow label="Value"    value={value}    onChange={setValue} />
        </Section>

        <Section title="Your review">
          <Field label="Title"  value={title} onChange={setTitle} placeholder="A short title (optional)" />
          <Field label="Review" value={body}  onChange={setBody}  placeholder="Tell other tradespeople about your experience" multiline />
        </Section>

        <Section title={`Photos (${photos.length}/${MAX_PHOTOS})`} subtitle="Up to 6 images, 8 MB each. Reviewed before going live.">
          <div className="flex flex-wrap items-start gap-2">
            {photos.map((file, i) => {
              const url = URL.createObjectURL(file);
              return (
                <div key={`${file.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-brand-line bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={file.name} className="h-full w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove ${file.name}`}
                    className="absolute right-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full bg-black/80 text-xs text-white hover:bg-red-500"
                  >×</button>
                </div>
              );
            })}
            {photos.length < MAX_PHOTOS && (
              <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border border-dashed border-brand-line bg-brand-surface text-xs font-semibold uppercase tracking-widest text-brand-muted transition hover:border-brand-accent hover:text-brand-accent">
                + Add
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotos(e.target.files)}
                />
              </label>
            )}
          </div>
        </Section>
      </div>

      <footer className="border-t border-brand-line bg-brand-accent/5 px-5 py-4">
        {err && (
          <p className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={!valid}
          className={`grid h-12 w-full place-items-center rounded-full text-xs font-bold uppercase tracking-widest ${
            valid ? "bg-brand-accent text-black hover:opacity-90" : "border border-brand-line bg-brand-surface text-brand-muted"
          }`}
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
        <p className="mt-2 text-center text-xs text-brand-muted">
          Hammerex publishes reviews after the team confirms the purchase.
        </p>
      </footer>
    </form>
  );
}

function Section({
  title, subtitle, required, children
}: {
  title: string;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          {title} {required && <span className="text-brand-accent">*</span>}
        </h4>
        {subtitle && <span className="text-xs text-brand-muted">{subtitle}</span>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, inputMode, required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email";
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label} {required && <span className="text-brand-accent">*</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="rounded-xl border border-brand-line bg-black px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-full border border-brand-line bg-black px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      )}
    </label>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          aria-pressed={value === n}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-accent/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-brand-accent"
            fill={n <= display ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-xs text-brand-muted">
        {display > 0 ? `${display} / 5` : "Tap a star to rate"}
      </span>
    </div>
  );
}

function PillarRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-brand-text">{label}</span>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(value === n ? 0 : n)}
            aria-label={`${label} ${n} star${n === 1 ? "" : "s"}`}
            className="grid h-7 w-7 place-items-center rounded-full hover:bg-brand-accent/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-brand-accent"
              fill={n <= display ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
