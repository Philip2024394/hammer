"use client";

// Left-rail filter component. Stateless / controlled — all values + setters
// come from the parent so URL sync stays in one place.
//
// Visual: dark surface, brand-accent yellow when a value is selected. 13px
// floor on every readable string (matches the WCAG / 13px-floor mandate
// from the user memory for this codebase).

import type { Dispatch, SetStateAction } from "react";
import type { TradeCatalogueCategory, PriceBand, MoqBand, MarginBand } from "./CatalogueClient";

type RailProps = {
  trades: TradeCatalogueCategory[];
  tools: TradeCatalogueCategory[];
  selectedTrades: Set<string>;
  setSelectedTrades: Dispatch<SetStateAction<Set<string>>>;
  selectedTools: Set<string>;
  setSelectedTools: Dispatch<SetStateAction<Set<string>>>;
  priceBand: PriceBand | null;
  setPriceBand: Dispatch<SetStateAction<PriceBand | null>>;
  moqBand: MoqBand | null;
  setMoqBand: Dispatch<SetStateAction<MoqBand | null>>;
  marginBand: MarginBand | null;
  setMarginBand: Dispatch<SetStateAction<MarginBand | null>>;
  hasVariants: boolean;
  setHasVariants: Dispatch<SetStateAction<boolean>>;
  inStock: boolean;
  setInStock: Dispatch<SetStateAction<boolean>>;
  newArrivals: boolean;
  setNewArrivals: Dispatch<SetStateAction<boolean>>;
};

const PRICE_OPTIONS: Array<{ value: PriceBand; label: string }> = [
  { value: "u10", label: "Under £10" },
  { value: "10-50", label: "£10 – £50" },
  { value: "50-200", label: "£50 – £200" },
  { value: "200+", label: "£200+" }
];

const MOQ_OPTIONS: Array<{ value: MoqBand; label: string }> = [
  { value: "<=6", label: "MOQ ≤ 6" },
  { value: "<=12", label: "MOQ ≤ 12" },
  { value: "<=48", label: "MOQ ≤ 48" },
  { value: "50+", label: "MOQ 50+" }
];

const MARGIN_OPTIONS: Array<{ value: MarginBand; label: string }> = [
  { value: "30", label: "30%+ off RRP" },
  { value: "40", label: "40%+ off RRP" },
  { value: "50", label: "50%+ off RRP" }
];

export function FilterRail(props: RailProps) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Trade">
        <CheckboxList
          options={props.trades.map((t) => ({ value: t.slug, label: t.name }))}
          selected={props.selectedTrades}
          onToggle={(v) => props.setSelectedTrades((s) => toggle(s, v))}
        />
      </Section>

      <Section title="Category">
        <CheckboxList
          options={props.tools.map((t) => ({ value: t.slug, label: t.name }))}
          selected={props.selectedTools}
          onToggle={(v) => props.setSelectedTools((s) => toggle(s, v))}
        />
      </Section>

      <Section title="Price band">
        <RadioList
          options={PRICE_OPTIONS}
          value={props.priceBand}
          onChange={props.setPriceBand}
        />
      </Section>

      <Section title="MOQ band">
        <RadioList
          options={MOQ_OPTIONS}
          value={props.moqBand}
          onChange={props.setMoqBand}
        />
      </Section>

      <Section title="Margin off RRP">
        <RadioList
          options={MARGIN_OPTIONS}
          value={props.marginBand}
          onChange={props.setMarginBand}
        />
      </Section>

      <Section title="Quick toggles">
        <ToggleRow
          label="Has variants"
          checked={props.hasVariants}
          onChange={props.setHasVariants}
        />
        <ToggleRow
          label="In stock now"
          checked={props.inStock}
          onChange={props.setInStock}
        />
        <ToggleRow
          label="New arrivals (30 days)"
          checked={props.newArrivals}
          onChange={props.setNewArrivals}
        />
      </Section>
    </div>
  );
}

function toggle(s: Set<string>, v: string): Set<string> {
  const n = new Set(s);
  if (n.has(v)) n.delete(v);
  else n.add(v);
  return n;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
        {title}
      </legend>
      <div className="flex flex-col gap-1.5">{children}</div>
    </fieldset>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle
}: {
  options: Array<{ value: string; label: string }>;
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  if (options.length === 0) {
    return <p className="text-xs text-brand-muted">None yet.</p>;
  }
  return (
    <>
      {options.map((opt) => {
        const on = selected.has(opt.value);
        return (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(opt.value)}
              className="h-4 w-4 accent-[rgb(var(--brand-accent))]"
            />
            <span className={`text-xs ${on ? "text-brand-text" : "text-brand-muted"}`}>{opt.label}</span>
          </label>
        );
      })}
    </>
  );
}

function RadioList<T extends string>({
  options,
  value,
  onChange
}: {
  options: Array<{ value: T; label: string }>;
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(on ? null : opt.value)}
            className={`inline-flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition ${
              on
                ? "border-brand-accent bg-brand-accent/15 text-brand-text"
                : "border-brand-line bg-brand-bg text-brand-muted hover:border-brand-accent hover:text-brand-text"
            }`}
          >
            <span>{opt.label}</span>
            {on && <span aria-hidden="true" className="text-brand-accent">●</span>}
          </button>
        );
      })}
    </>
  );
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-brand-line bg-brand-bg px-2.5 py-1.5">
      <span className="text-xs text-brand-text">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--brand-accent))]"
      />
    </label>
  );
}
