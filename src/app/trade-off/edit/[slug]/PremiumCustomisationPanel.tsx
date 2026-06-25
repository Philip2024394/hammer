"use client";

// Premium customisation panel — only meaningful for app_trial / app_paid
// listings. Submits to /api/trade-off/update with the same edit_token used
// by the main form. Server gates whether this renders at all; the panel
// itself just collects + posts.

import { useState } from "react";

type HoursSlot = { open: string; close: string } | null;
type HoursMap = Record<string, HoursSlot>;
type FaqItem = { q: string; a: string };
type PricedService = {
  name: string;
  image_url: string;
  price: number;
  unit: string;
};

type Patch = {
  theme_color: string;
  button_text_color: string;
  cta_button_effect: "none" | "pulse" | "glow" | "shake";
  hero_text_line1: string;
  hero_text_line2: string;
  hero_text_line2_color: string;
  hero_text_tagline: string;
  hero_text_effect: "none" | "shimmer" | "dance" | "underline";
  avatar_frame_style: "none" | "ring" | "pulse" | "dance";
  profile_placement: "center" | "top-left" | "bottom-left";
  running_marquee: string;
  promo_text: string;
  accepting_jobs: boolean;
  services_offered: string[];
  priced_services: PricedService[];
  faq_items: FaqItem[];
  operating_hours: HoursMap;
  contact_form_enabled: boolean;
  visit_us_enabled: boolean;
};

const DAY_ROW: { key: keyof HoursMap; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" }
];

export function PremiumCustomisationPanel({
  slug,
  editToken,
  initial
}: {
  slug: string;
  editToken: string;
  initial: Patch;
}) {
  const [state, setState] = useState<Patch>(initial);
  // Services editor binds to a single comma-separated string for ergonomics.
  const [servicesText, setServicesText] = useState<string>(
    (initial.services_offered ?? []).join(", ")
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Patch>(key: K, value: Patch[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function setHoursSlot(day: string, slot: HoursSlot) {
    setState((s) => ({
      ...s,
      operating_hours: { ...s.operating_hours, [day]: slot }
    }));
  }

  function updateFaq(i: number, patch: Partial<FaqItem>) {
    setState((s) => {
      const next = [...s.faq_items];
      next[i] = { ...next[i], ...patch };
      return { ...s, faq_items: next };
    });
  }
  function addFaq() {
    setState((s) => ({ ...s, faq_items: [...s.faq_items, { q: "", a: "" }] }));
  }
  function removeFaq(i: number) {
    setState((s) => ({ ...s, faq_items: s.faq_items.filter((_, idx) => idx !== i) }));
  }

  function updatePriced(i: number, patch: Partial<PricedService>) {
    setState((s) => {
      const next = [...s.priced_services];
      next[i] = { ...next[i], ...patch };
      return { ...s, priced_services: next };
    });
  }
  function addPriced() {
    setState((s) => ({
      ...s,
      priced_services: [
        ...s.priced_services,
        { name: "", image_url: "", price: 0, unit: "per project" }
      ]
    }));
  }
  function removePriced(i: number) {
    setState((s) => ({
      ...s,
      priced_services: s.priced_services.filter((_, idx) => idx !== i)
    }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      // Translate the services free-text into a clean array on save.
      const services_offered = servicesText
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .slice(0, 30);
      // Drop empty FAQ rows.
      const faq_items = state.faq_items.filter(
        (f) => f.q.trim().length > 0 && f.a.trim().length > 0
      );
      // Drop empty priced-service rows (must have a name + a positive price).
      const priced_services = state.priced_services
        .map((p) => ({
          name: p.name.trim(),
          image_url: p.image_url.trim(),
          price: Number(p.price) || 0,
          unit: p.unit.trim() || "per project"
        }))
        .filter((p) => p.name.length > 0 && p.price > 0);
      const payload: Patch = { ...state, services_offered, faq_items, priced_services };

      const res = await fetch("/api/trade-off/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          edit_token: editToken,
          fields: payload
        })
      });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Save failed.");
      } else {
        setMsg("Saved.");
      }
    } catch {
      setErr("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-line bg-brand-surface p-5">
      <div>
        <h2 className="text-lg font-extrabold">Premium customisation</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Visual tweaks for your Xrated App profile. Saved changes go live on
          your public page immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Theme colour picker removed — all tradies are locked to the
            Xrated brand orange (#F97316). The DB column stays so existing
            data doesn't break, but the form no longer exposes it. */}
        <Field label="Button text colour">
          <input
            type="color"
            value={state.button_text_color || "#FFFFFF"}
            onChange={(e) => set("button_text_color", e.target.value)}
            className="h-11 w-full cursor-pointer rounded-md border border-brand-line bg-brand-bg p-1"
          />
        </Field>

        <Field label="CTA button effect">
          <Select
            value={state.cta_button_effect}
            onChange={(v) => set("cta_button_effect", v as Patch["cta_button_effect"])}
            options={["none", "pulse", "glow", "shake"]}
          />
        </Field>
        <Field label="Hero text effect">
          <Select
            value={state.hero_text_effect}
            onChange={(v) => set("hero_text_effect", v as Patch["hero_text_effect"])}
            options={["none", "shimmer", "dance", "underline"]}
          />
        </Field>

        <Field label="Hero line 1">
          <Text
            value={state.hero_text_line1}
            onChange={(v) => set("hero_text_line1", v)}
            placeholder="e.g. Drywall done right."
          />
        </Field>
        <Field label="Hero line 2">
          <Text
            value={state.hero_text_line2}
            onChange={(v) => set("hero_text_line2", v)}
            placeholder="e.g. Manchester · since 2014"
          />
        </Field>

        <Field label="Hero line 2 colour">
          <input
            type="color"
            value={state.hero_text_line2_color || "#F97316"}
            onChange={(e) => set("hero_text_line2_color", e.target.value)}
            className="h-11 w-full cursor-pointer rounded-md border border-brand-line bg-brand-bg p-1"
          />
        </Field>
        <Field label="Hero tagline">
          <Text
            value={state.hero_text_tagline}
            onChange={(v) => set("hero_text_tagline", v)}
            placeholder="One short pitch line"
          />
        </Field>

        <Field label="Avatar frame style">
          <Select
            value={state.avatar_frame_style}
            onChange={(v) => set("avatar_frame_style", v as Patch["avatar_frame_style"])}
            options={["none", "ring", "pulse", "dance"]}
          />
        </Field>
        <Field label="Profile placement">
          <Select
            value={state.profile_placement}
            onChange={(v) => set("profile_placement", v as Patch["profile_placement"])}
            options={["center", "top-left", "bottom-left"]}
          />
        </Field>

        <Field label="Running marquee text" full>
          <Text
            value={state.running_marquee}
            onChange={(v) => set("running_marquee", v)}
            placeholder="e.g. Booking July · Manchester · 07xxx xxx xxx"
          />
        </Field>

        <Field label="Promo text (footer scroll)" full>
          <Text
            value={state.promo_text}
            onChange={(v) => set("promo_text", v)}
            placeholder="e.g. Free same-week site visits across Greater Manchester"
          />
        </Field>

        <Field label="Accepting new jobs" full>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.accepting_jobs}
              onChange={(e) => set("accepting_jobs", e.target.checked)}
              className="h-4 w-4 accent-brand-accent"
            />
            <span>{state.accepting_jobs ? "Yes — show as accepting" : "No — show as paused"}</span>
          </label>
        </Field>
      </div>

      {/* ─── Services offered ─── */}
      <div className="space-y-2 rounded-lg border border-brand-line bg-brand-bg/40 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          Services offered
        </h3>
        <p className="text-[11px] text-brand-muted">
          Comma-separated. e.g. <em>Skim coat, Knife taping, Mud-pan finish</em>.
        </p>
        <textarea
          rows={2}
          value={servicesText}
          onChange={(e) => setServicesText(e.target.value)}
          placeholder="Service 1, Service 2, Service 3"
          className="w-full rounded-md border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* ─── Priced services (carousel) ─── */}
      <div className="space-y-2 rounded-lg border border-brand-line bg-brand-bg/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Priced services
          </h3>
          <button
            type="button"
            onClick={addPriced}
            className="inline-flex h-9 items-center rounded-md border border-brand-accent bg-brand-accent/10 px-3 text-[11px] font-bold text-brand-accent transition hover:bg-brand-accent hover:text-black"
          >
            + Add service
          </button>
        </div>
        <p className="text-[11px] text-brand-muted">
          Shown as a swipeable carousel on your profile. Unit is free-text — e.g.{" "}
          <em>per project</em>, <em>per m²</em>, <em>per hour</em>, <em>from</em>.
        </p>
        {state.priced_services.length === 0 ? (
          <p className="text-[11px] text-brand-muted">
            No priced services yet — add one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {state.priced_services.map((p, i) => (
              <li
                key={i}
                className="space-y-2 rounded-md border border-brand-line bg-brand-surface/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                    Service {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePriced(i)}
                    className="text-[11px] font-semibold text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Text
                    value={p.name}
                    onChange={(v) => updatePriced(i, { name: v })}
                    placeholder="Service name (e.g. Skim coat)"
                  />
                  <Text
                    value={p.image_url}
                    onChange={(v) => updatePriced(i, { image_url: v })}
                    placeholder="Image URL (https://…)"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={p.price || ""}
                    onChange={(e) =>
                      updatePriced(i, { price: Number(e.target.value) || 0 })
                    }
                    placeholder="Price (£)"
                    className="h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
                  />
                  <Text
                    value={p.unit}
                    onChange={(v) => updatePriced(i, { unit: v })}
                    placeholder="Unit (e.g. per m², per project, from)"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Operating hours ─── */}
      <div className="space-y-2 rounded-lg border border-brand-line bg-brand-bg/40 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          Operating hours
        </h3>
        <p className="text-[11px] text-brand-muted">
          Leave blank or tick "Closed" for days you're off.
        </p>
        <ul className="space-y-2">
          {DAY_ROW.map(({ key, label }) => {
            const slot = state.operating_hours?.[key] ?? null;
            const closed = !slot;
            return (
              <li key={key} className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-2 text-xs font-bold text-brand-text">{label}</span>
                <label className="col-span-2 inline-flex items-center gap-1.5 text-[11px] text-brand-muted">
                  <input
                    type="checkbox"
                    checked={closed}
                    onChange={(e) =>
                      setHoursSlot(key, e.target.checked ? null : { open: "09:00", close: "17:00" })
                    }
                    className="h-3.5 w-3.5 accent-brand-accent"
                  />
                  Closed
                </label>
                <input
                  type="time"
                  disabled={closed}
                  value={slot?.open ?? ""}
                  onChange={(e) =>
                    setHoursSlot(key, { open: e.target.value, close: slot?.close ?? "17:00" })
                  }
                  className="col-span-4 h-10 rounded-md border border-brand-line bg-brand-bg px-2 text-xs text-brand-text disabled:opacity-40 focus:border-brand-accent focus:outline-none"
                />
                <input
                  type="time"
                  disabled={closed}
                  value={slot?.close ?? ""}
                  onChange={(e) =>
                    setHoursSlot(key, { open: slot?.open ?? "09:00", close: e.target.value })
                  }
                  className="col-span-4 h-10 rounded-md border border-brand-line bg-brand-bg px-2 text-xs text-brand-text disabled:opacity-40 focus:border-brand-accent focus:outline-none"
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* ─── FAQ items ─── */}
      <div className="space-y-2 rounded-lg border border-brand-line bg-brand-bg/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            FAQ items
          </h3>
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex h-9 items-center rounded-md border border-brand-accent bg-brand-accent/10 px-3 text-[11px] font-bold text-brand-accent transition hover:bg-brand-accent hover:text-black"
          >
            + Add FAQ
          </button>
        </div>
        {state.faq_items.length === 0 ? (
          <p className="text-[11px] text-brand-muted">No FAQ items yet — add one above.</p>
        ) : (
          <ul className="space-y-3">
            {state.faq_items.map((f, i) => (
              <li key={i} className="space-y-1.5 rounded-md border border-brand-line bg-brand-surface/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                    Q{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="text-[11px] font-semibold text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                <Text
                  value={f.q}
                  onChange={(v) => updateFaq(i, { q: v })}
                  placeholder="Question — e.g. Do you offer free quotes?"
                />
                <textarea
                  rows={3}
                  value={f.a}
                  onChange={(e) => updateFaq(i, { a: e.target.value })}
                  placeholder="Answer"
                  className="w-full rounded-md border border-brand-line bg-brand-bg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Visibility toggles ─── */}
      <div className="grid gap-3 rounded-lg border border-brand-line bg-brand-bg/40 p-4 sm:grid-cols-2">
        <label className="inline-flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.contact_form_enabled}
            onChange={(e) => set("contact_form_enabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-accent"
          />
          <span>
            <span className="block font-semibold">Contact form</span>
            <span className="block text-[11px] text-brand-muted">
              Adds an email contact form to your profile.
            </span>
          </span>
        </label>
        <label className="inline-flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.visit_us_enabled}
            onChange={(e) => set("visit_us_enabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-accent"
          />
          <span>
            <span className="block font-semibold">Visit us</span>
            <span className="block text-[11px] text-brand-muted">
              Shows a "Get directions" button using your map pin.
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex h-11 items-center rounded-lg bg-brand-accent px-5 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save customisation"}
        </button>
        {msg && <span className="text-xs text-brand-success">{msg}</span>}
        {err && <span className="text-xs text-red-400">{err}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  full,
  children
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Text({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
    />
  );
}

function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-md border border-brand-line bg-brand-bg px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
