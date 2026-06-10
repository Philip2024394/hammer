const anchors = [
  { id: "features", label: "Features" },
  { id: "in-the-box", label: "In the box" },
  { id: "specs", label: "Specifications" },
  { id: "shipping", label: "Shipping & returns" }
];

export function SectionAnchors() {
  return (
    <nav className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto border-y border-brand-line bg-brand-bg px-4 py-3" aria-label="Jump to section">
      {anchors.map((a) => (
        <a
          key={a.id}
          href={`#${a.id}`}
          className="shrink-0 rounded-full border border-brand-line bg-brand-surface px-4 py-2 text-xs font-medium text-brand-text hover:border-brand-accent"
        >
          {a.label}
        </a>
      ))}
    </nav>
  );
}
