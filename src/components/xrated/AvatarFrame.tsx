// Xrated Trades — circular avatar with optional animated frame variant.
// Mirrors the cityapp beautician avatar pattern: the frame is the only
// visible "theme" the punter notices, so it has to feel premium without
// being noisy. CSS-only animations — no client state needed.

import { inkForTheme, type AvatarFrameStyle } from "@/lib/xratedTrades";

export function AvatarFrame({
  src,
  name,
  size = 88,
  style,
  themeColor
}: {
  src: string | null;
  name: string;
  size?: number;
  style: AvatarFrameStyle;
  themeColor: string;
}) {
  const ink = inkForTheme(themeColor);
  // Stable animation name per instance so multiple avatars on a page don't
  // collide on keyframe identifiers.
  const animId = `xaf-${style}`;

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size
  };

  const ringStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "9999px"
  };

  // Decorative ring layer behind the image.
  let frameLayer: React.ReactNode = null;
  if (style === "ring") {
    frameLayer = (
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ ...ringStyle, boxShadow: `0 0 0 4px ${themeColor}` }}
      />
    );
  } else if (style === "pulse") {
    frameLayer = (
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          ...ringStyle,
          boxShadow: `0 0 0 4px ${themeColor}`,
          animation: `${animId} 2s ease-in-out infinite`,
          transformOrigin: "center"
        }}
      />
    );
  }

  const imgWrapperClass = "relative overflow-hidden rounded-full shadow-lg";

  const imgWrapperStyle: React.CSSProperties = {
    ...wrapperStyle,
    ...(style === "dance"
      ? { animation: `${animId} 3s ease-in-out infinite`, transformOrigin: "center" }
      : {})
  };

  return (
    <span
      className="relative inline-block"
      style={wrapperStyle}
    >
      {frameLayer}
      <span className={imgWrapperClass} style={imgWrapperStyle}>
        {src ? (
          <img
            src={src}
            alt={`${name} profile photo`}
            className="block h-full w-full object-cover"
            width={size}
            height={size}
          />
        ) : (
          // Soft neutral placeholder when no avatar uploaded — a generic
          // person silhouette on a muted grey rather than a coloured initial.
          <span
            className="flex h-full w-full items-center justify-center bg-brand-bg"
            aria-hidden="true"
          >
            <svg
              width={Math.round(size * 0.55)}
              height={Math.round(size * 0.55)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-muted"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        )}
      </span>
      <style>{`
        @keyframes xaf-pulse {
          0%   { transform: scale(1);    opacity: 1; }
          50%  { transform: scale(1.06); opacity: 0.65; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes xaf-dance {
          0%   { transform: rotate(-2deg); }
          50%  { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
      `}</style>
    </span>
  );
}

export default AvatarFrame;
