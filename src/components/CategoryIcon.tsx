import type { ReactNode } from "react";

const W = 1.6;
const ICON_CLS = "h-12 w-12";

const props = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: W,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: ICON_CLS,
  "aria-hidden": true
};

function Trowel() {
  return (
    <svg {...props}><path d="M16 18 L48 18 L40 46 L24 46 Z" /><path d="M32 18 L32 8" /><path d="M28 8 L36 8" /></svg>
  );
}
function Backpack() {
  return (
    <svg {...props}><path d="M18 22 L18 56 L46 56 L46 22" /><path d="M18 22 a14 14 0 0 1 28 0" /><path d="M24 36 L40 36" /><path d="M24 42 L40 42" /><path d="M28 8 L36 8 L36 14 L28 14 Z" /></svg>
  );
}
function Hawk() {
  return (
    <svg {...props}><path d="M10 20 L54 20 L46 30 L18 30 Z" /><path d="M32 30 L32 50" /><path d="M26 50 L38 50" /></svg>
  );
}
function ToolBox() {
  return (
    <svg {...props}><rect x="10" y="22" width="44" height="30" rx="2" /><path d="M22 22 L22 14 a4 4 0 0 1 4-4 h12 a4 4 0 0 1 4 4 L42 22" /><path d="M10 34 L54 34" /><rect x="28" y="38" width="8" height="6" rx="1" /></svg>
  );
}
function Star() {
  return (
    <svg {...props}><polygon points="32,8 40,26 60,26 44,38 50,58 32,46 14,58 20,38 4,26 24,26" /></svg>
  );
}
function Cube() {
  return (
    <svg {...props}><polygon points="32,10 54,22 54,46 32,58 10,46 10,22" /><path d="M32 10 L32 34" /><path d="M10 22 L32 34 L54 22" /></svg>
  );
}
function Hammer() {
  return (
    <svg {...props}><path d="M14 32 L26 20 L42 36 L30 48 Z" /><path d="M40 18 L52 6" /><path d="M36 14 L46 24" /></svg>
  );
}
function BrickWall() {
  return (
    <svg {...props}><rect x="8" y="14" width="48" height="36" /><path d="M8 26 L56 26" /><path d="M8 38 L56 38" /><path d="M22 14 L22 26" /><path d="M42 14 L42 26" /><path d="M14 26 L14 38" /><path d="M32 26 L32 38" /><path d="M50 26 L50 38" /><path d="M22 38 L22 50" /><path d="M42 38 L42 50" /></svg>
  );
}
function Roller() {
  return (
    <svg {...props}><rect x="8" y="14" width="44" height="14" rx="2" /><path d="M30 28 L30 36" /><rect x="26" y="36" width="8" height="6" rx="1" /><path d="M30 42 L30 58" /></svg>
  );
}
function Wrench() {
  return (
    <svg {...props}><path d="M44 12 a10 10 0 1 0 8 8 L36 36 L26 26 Z" /><path d="M26 26 L10 42 L16 48 Z" /></svg>
  );
}
function Lightning() {
  return (
    <svg {...props}><polygon points="36,6 16,36 30,36 26,58 48,28 34,28" /></svg>
  );
}
function Roof() {
  return (
    <svg {...props}><polygon points="6,40 32,12 58,40" /><path d="M12 40 L12 56 L52 56 L52 40" /><path d="M28 56 L28 44 L36 44 L36 56" /></svg>
  );
}
function Planks() {
  return (
    <svg {...props}><rect x="6" y="16" width="52" height="8" /><rect x="6" y="28" width="52" height="8" /><rect x="6" y="40" width="52" height="8" /></svg>
  );
}
function Pane() {
  return (
    <svg {...props}><rect x="10" y="10" width="44" height="44" /><path d="M32 10 L32 54" /><path d="M10 32 L54 32" /></svg>
  );
}
function Leaf() {
  return (
    <svg {...props}><path d="M14 50 C 14 22, 32 10, 54 12 C 54 38, 38 54, 14 50 Z" /><path d="M14 50 L40 24" /></svg>
  );
}
function Frame() {
  return (
    <svg {...props}><rect x="6" y="8" width="52" height="48" /><path d="M6 24 L58 24" /><path d="M6 40 L58 40" /><path d="M22 8 L22 56" /><path d="M42 8 L42 56" /></svg>
  );
}
function Fan() {
  return (
    <svg {...props}><circle cx="32" cy="32" r="4" /><path d="M32 28 C 22 14, 8 14, 8 22 C 8 30, 22 32, 32 32" /><path d="M32 32 C 22 32, 8 34, 8 42 C 8 50, 22 50, 32 36" /><path d="M32 32 C 44 32, 56 24, 50 16 C 44 8, 36 18, 32 32" /></svg>
  );
}
function Grid() {
  return (
    <svg {...props}><rect x="8" y="8" width="20" height="20" /><rect x="36" y="8" width="20" height="20" /><rect x="8" y="36" width="20" height="20" /><rect x="36" y="36" width="20" height="20" /></svg>
  );
}
function Rebar() {
  return (
    <svg {...props}><path d="M12 8 L12 56" /><path d="M28 8 L28 56" /><path d="M44 8 L44 56" /><path d="M8 18 L48 22" /><path d="M8 38 L48 42" /></svg>
  );
}

const MAP: Record<string, () => ReactNode> = {
  "trowel-holders": Trowel,
  "drywall-accessories": Trowel,
  "tool-bags-backpacks": Backpack,
  "hawk-holders": Hawk,
  "professional-tool-storage": ToolBox,
  "new-products": Star,
  "plastering": Trowel,
  "drywall": Trowel,
  "tiling": Grid,
  "concrete": Cube,
  "rendering": Trowel,
  "carpentry": Hammer,
  "bricklaying": BrickWall,
  "painting-decorating": Roller,
  "plumbing": Wrench,
  "electrical": Lightning,
  "roofing": Roof,
  "flooring": Planks,
  "glazing": Pane,
  "landscaping": Leaf,
  "scaffolding": Frame,
  "steel-fixing": Rebar,
  "demolition": Hammer,
  "hvac": Fan
};

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = MAP[slug] ?? ToolBox;
  return <Icon />;
}
