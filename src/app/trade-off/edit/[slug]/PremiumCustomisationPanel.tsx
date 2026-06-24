"use client";

// Premium customisation panel — only meaningful for app_trial / app_paid
// listings. Submits to /api/trade-off/update with the same edit_token used
// by the main form. Server gates whether this renders at all; the panel
// itself just collects + posts.

import { useState } from "react";

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
  accepting_jobs: boolean;
};

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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Patch>(key: K, value: Patch[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/trade-off/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          edit_token: editToken,
          fields: state
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
        <Field label="Theme colour">
          <input
            type="color"
            value={state.theme_color || "#F97316"}
            onChange={(e) => set("theme_color", e.target.value)}
            className="h-11 w-full cursor-pointer rounded-md border border-brand-line bg-brand-bg p-1"
          />
        </Field>
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
