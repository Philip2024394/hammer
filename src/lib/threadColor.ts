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

// Black is the "house" thread colour and incurs no extra charge.
export const DEFAULT_THREAD_COLOR: ThreadColor = "black";
export const FREE_THREAD_COLORS: ThreadColor[] = ["black"];

export function isFreeThreadColor(value: ThreadColor | null | undefined): boolean {
  if (!value) return true;
  return FREE_THREAD_COLORS.includes(value);
}

export function threadColorLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return THREAD_COLORS.find((c) => c.value === value)?.label ?? null;
}
