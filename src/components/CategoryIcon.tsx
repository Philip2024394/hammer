const STROKE_W = 1.6;

function Trowel() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
      <path d="M16 18 L48 18 L40 46 L24 46 Z" />
      <path d="M32 18 L32 8" />
      <path d="M28 8 L36 8" />
    </svg>
  );
}
function Backpack() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
      <path d="M18 22 L18 56 L46 56 L46 22" />
      <path d="M18 22 a14 14 0 0 1 28 0" />
      <path d="M24 36 L40 36" />
      <path d="M24 42 L40 42" />
      <path d="M28 8 L36 8 L36 14 L28 14 Z" />
    </svg>
  );
}
function Hawk() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
      <path d="M10 20 L54 20 L46 30 L18 30 Z" />
      <path d="M32 30 L32 50" />
      <path d="M26 50 L38 50" />
    </svg>
  );
}
function ToolBox() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
      <rect x="10" y="22" width="44" height="30" rx="2" />
      <path d="M22 22 L22 14 a4 4 0 0 1 4-4 h12 a4 4 0 0 1 4 4 L42 22" />
      <path d="M10 34 L54 34" />
      <rect x="28" y="38" width="8" height="6" rx="1" />
    </svg>
  );
}
function Star() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
      <polygon points="32,8 40,26 60,26 44,38 50,58 32,46 14,58 20,38 4,26 24,26" />
    </svg>
  );
}

export function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case "trowel-holders":
    case "drywall-accessories":
      return <Trowel />;
    case "tool-bags-backpacks":
      return <Backpack />;
    case "hawk-holders":
      return <Hawk />;
    case "professional-tool-storage":
      return <ToolBox />;
    case "new-products":
      return <Star />;
    default:
      return <ToolBox />;
  }
}
