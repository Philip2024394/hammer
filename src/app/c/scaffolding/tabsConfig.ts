// Pure config shared by the server page and the client Tabs component.
// Lives in its own non-client file so the constant array isn't serialised
// across the server↔client boundary (Next 16 will hand you a reference
// object instead of an array when a server component imports a value out
// of a "use client" module).

export type ScaffoldingTabId = "belts" | "products" | "holders-tools" | "workwear";

export const SCAFFOLDING_TABS: { id: ScaffoldingTabId; label: string; hint: string }[] = [
  { id: "belts",         label: "Scaffolding Belts",      hint: "Belt bodies + complete belt sets" },
  { id: "products",      label: "Scaffolding Products",   hint: "Everything in the scaffolding category" },
  { id: "holders-tools", label: "Tool Holders & Tools",   hint: "Holders, hammers, tapes, drills, lanyards" },
  { id: "workwear",      label: "Work Wear",              hint: "Aprons, gloves, PPE" }
];

export function resolveScaffoldingTab(raw: string | undefined): ScaffoldingTabId {
  const id = (raw ?? "belts").toLowerCase();
  return (SCAFFOLDING_TABS.find((t) => t.id === id)?.id ?? "belts") as ScaffoldingTabId;
}
