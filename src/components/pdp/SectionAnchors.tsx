const anchors = [
  { id: "features", label: "Features" },
  { id: "in-the-box", label: "In the box" },
  { id: "bundle", label: "Bundle deal" },
  { id: "pairs-with", label: "Pairs with" },
  { id: "specs", label: "Specifications" },
  { id: "reviews", label: "Reviews" },
  { id: "qa", label: "Q&A" },
  { id: "delivery", label: "Delivery" },
  { id: "warranty", label: "Warranty" }
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
