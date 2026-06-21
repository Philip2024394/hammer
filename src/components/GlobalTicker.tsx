// Per-product running ticker. Renders a slim marquee directly under the
// hero gallery on the PDP. Each product can carry its own message via the
// `running_notice` column on hammerex_products. When that column is null,
// we fall back to the brand-wide rotating set so the strip is never empty.
//
// Edit `DEFAULT_MESSAGES` below to change the fallback rotation, and edit
// `hammerex_products.running_notice` per product for per-product overrides.

const DEFAULT_MESSAGES: { icon: string; text: string }[] = [
  { icon: "🚚", text: "FREE UK delivery via EMS on every order — typical 5–6 day transit." },
  { icon: "🌍", text: "Shipping worldwide — quote confirmed on WhatsApp after checkout." },
  { icon: "⚠",  text: "Higher order volume this week — admin will confirm exact dispatch times on WhatsApp." },
  { icon: "🏭", text: "6 years of UK trade · now direct from the Yogyakarta factory — no middleman markup." },
  { icon: "📦", text: "Buy 2 save 10% · Buy 3 save 15% — applied automatically at the quantity step." },
  { icon: "✍",  text: "Custom company branding on belt holders — artwork support included." },
  { icon: "🛠", text: "Hammerex Pro Trade Cover — 3 years of repair service by the makers." },
  { icon: "🇬🇧", text: "Trade & bulk pricing — message us via the Partners page for territory-protected wholesale." },
  { icon: "⚡", text: "Dispatched within 48 hours to the postal service · EMS air freight." },
  { icon: "🔧", text: "Designed in-house · stitched in-house · CCTV-recorded QC on every unit." }
];

function buildTickerString(productNotice: string | null | undefined): string {
  const SEP = "  •  ";
  // Single per-product notice → repeat it so the loop is meaningful.
  if (productNotice && productNotice.trim()) {
    const line = `📣  ${productNotice.trim()}`;
    return `${line}${SEP}${line}${SEP}`;
  }
  // Otherwise, scroll the full brand-wide rotation twice end-to-end so the
  // tail meets the head visually without a visible gap as it loops.
  const line = DEFAULT_MESSAGES.map((m) => `${m.icon}  ${m.text}`).join(SEP);
  return `${line}${SEP}${line}${SEP}`;
}

export function ProductTicker({ productNotice }: { productNotice?: string | null }) {
  // ~50% slower than the previous pass — the ticker should feel deliberate
  // enough to actually read mid-scroll. The `-gap` keyframe holds at
  // off-screen-left for the last ~4% of each cycle so there's a visible
  // pause before the next loop starts, instead of an instant snap-back.
  //
  //   per-product   : 85 s total → ~3.4 s gap, ~81.6 s scroll
  //   brand rotation: 200 s total → ~8 s gap (longer payload, longer gap)
  const animationDuration = productNotice && productNotice.trim() ? "85s" : "200s";
  // Negative delay = animation starts mid-scroll so text is already on
  // screen during the first paint, not waiting off-screen to the right.
  const animationDelay = productNotice && productNotice.trim() ? "-25s" : "-60s";
  return (
    <div
      // Thin horizontal gray rules above + below frame the strip without
      // the heavy pill shape. Padding gives the scrolling text room to
      // breathe from the left and right edges of the container.
      className="hammerex-marquee-mask overflow-hidden border-y border-brand-line bg-brand-accent/10 px-6 py-2 sm:px-10"
      aria-label={productNotice ? "Product update" : "Hammerex live updates"}
    >
      <div
        className="hammerex-marquee-track text-xs font-bold uppercase tracking-widest text-brand-accent sm:text-sm"
        style={{
          animationDuration,
          animationDelay,
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          // Use the `-gap` variant so the cycle holds off-screen-left for a
          // beat before restarting, giving the buyer a clear "message just
          // ended" cue instead of an instant reset.
          animationName: "hammerex-marquee-gap"
        }}
      >
        {buildTickerString(productNotice)}
      </div>
    </div>
  );
}

// Backwards-compatible alias in case anything else imports the old name.
export const GlobalTicker = ProductTicker;
