"use client";

import { useEffect, useState } from "react";

export function ShareButton({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = title ?? "Check this out on Hammerex";

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedBody = encodeURIComponent(`${shareTitle} — ${shareUrl}`);

  const links = {
    whatsapp: `https://wa.me/?text=${encodedBody}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=140586622674265&redirect_uri=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedBody}`
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
      document.body.removeChild(ta);
    }
  };

  const onOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Share this product"
        className="grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition hover:opacity-90 active:scale-95"
      >
        <ShareIcon />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share this product"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-brand-line bg-brand-bg p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-brand-text">Share this product</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center rounded-full border border-brand-line text-brand-muted hover:border-brand-accent hover:text-brand-text"
              >×</button>
            </div>

            <ul className="grid grid-cols-1 gap-2">
              <li>
                <a
                  href={links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-3 rounded-full border border-brand-line bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-whatsapp text-white"><WaIcon /></span>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-3 rounded-full border border-brand-line bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-facebook text-white"><FbIcon /></span>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={links.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-3 rounded-full border border-brand-line bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white border border-brand-line"><XIcon /></span>
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href={links.email}
                  className="flex h-11 items-center gap-3 rounded-full border border-brand-line bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-line text-brand-text"><MailIcon /></span>
                  Email
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onCopy}
                  className="flex h-11 w-full items-center gap-3 rounded-full border border-brand-line bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent text-black"><LinkIcon /></span>
                  {copied ? "Link copied" : "Copy link"}
                </button>
              </li>
            </ul>

            <p className="mt-4 truncate text-xs text-brand-muted" aria-label="Shareable URL">
              {shareUrl}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}
function WaIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.8-.4-1.6-1-2.2-1.7-.6-.7-.9-1.4-1-1.8-.1-.3 0-.5.1-.6l.4-.5.3-.4c.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2 3.1 4.9 4.3 1.4.6 2.1.6 2.8.5.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.1-.5-.3M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" /></svg>;
}
function FbIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7c0-1 .3-1.7 1.8-1.7h1.8V2.2c-.3 0-1.4-.2-2.7-.2-2.7 0-4.5 1.6-4.5 4.6v2.9H7v3.5h2.9V22h3.6z" /></svg>;
}
function XIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.503 11.24h-6.65l-5.214-6.815L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.817l4.713 6.231 5.46-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" /></svg>;
}
function MailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7 10-7" /></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>;
}
