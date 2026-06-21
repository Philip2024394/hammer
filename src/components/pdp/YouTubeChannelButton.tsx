// Small inline "Watch on YouTube" chip used on PDPs. Opens the brand
// channel in a new tab. Kept deliberately compact so it sits comfortably
// in the BuyColumn header area alongside the rating row.

const HAMMEREX_YOUTUBE = "https://www.youtube.com/@hammerexdirect";

export function YouTubeChannelButton() {
  return (
    <a
      href={HAMMEREX_YOUTUBE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch Hammerex Products on YouTube (opens in a new tab)"
      className="group inline-flex w-fit items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-text transition hover:border-red-500 hover:bg-red-500/10"
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-9 place-items-center rounded-md bg-[#FF0000] text-white shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition group-hover:scale-105"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span>Watch on YouTube</span>
    </a>
  );
}
