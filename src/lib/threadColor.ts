export type ThreadColor = "black" | "yellow" | "red" | "brown" | "orange" | "white" | "green";

export const THREAD_COLORS: { value: ThreadColor; label: string; hex: string }[] = [
  { value: "black",  label: "Black",  hex: "#111111" },
  { value: "yellow", label: "Yellow", hex: "#F2C811" },
  { value: "red",    label: "Red",    hex: "#D33A2C" },
  { value: "brown",  label: "Brown",  hex: "#7A4E2A" },
  { value: "orange", label: "Orange", hex: "#F08A1E" },
  { value: "green",  label: "Green",  hex: "#2E8B57" },
  { value: "white",  label: "White",  hex: "#F4F4F4" }
];

// Close-up reference photos shown as circular profile thumbnails in the
// thread-colour picker. Any colour without an image falls back to the
// solid hex swatch so the picker keeps working for products that don't
// have bespoke shots yet.
export const THREAD_COLOR_IMAGES: Partial<Record<ThreadColor, string>> = {
  black:  "https://ik.imagekit.io/9mrgsv2rp/nv.png",
  yellow: "https://ik.imagekit.io/9mrgsv2rp/Untitledasdasdasdsasdsdsddfsdfdfsd.png",
  brown:  "https://ik.imagekit.io/9mrgsv2rp/Untitledasdasdasdsasdsdsddfsdfdfsdsdfsdf.png",
  red:    "https://ik.imagekit.io/9mrgsv2rp/Untitledasdasdasdsasdsdsddfsdf.png",
  white:  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2008_48_47%20AM.png"
};

// Black is the "house" thread colour and incurs no extra charge.
export const DEFAULT_THREAD_COLOR: ThreadColor = "black";
export const FREE_THREAD_COLORS: ThreadColor[] = ["black"];

// Optional per-product allowlist. If a slug appears here, the thread-colour
// selector renders only those colours. Otherwise the full THREAD_COLORS list
// is shown. Slug-keyed for the same reasons as beltSizes — promote to a
// schema column when 2-3 more products need bespoke palettes.
export const THREAD_COLORS_BY_SLUG: Record<string, ThreadColor[]> = {
  "scaffolders-setup-kit": ["black", "yellow", "brown", "red", "white"],
  "forgex-7-station-scaffolders-belt": ["black", "yellow", "brown", "red", "white"]
};

export function threadColorsFor(slug: string | null | undefined): typeof THREAD_COLORS {
  if (slug && THREAD_COLORS_BY_SLUG[slug]) {
    const allowed = new Set(THREAD_COLORS_BY_SLUG[slug]);
    return THREAD_COLORS.filter((c) => allowed.has(c.value));
  }
  return THREAD_COLORS;
}

export function isFreeThreadColor(value: ThreadColor | null | undefined): boolean {
  if (!value) return true;
  return FREE_THREAD_COLORS.includes(value);
}

export function threadColorLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return THREAD_COLORS.find((c) => c.value === value)?.label ?? null;
}
