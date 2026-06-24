// Reusable WhatsApp icon-link used by the Xrated admin pages. 44x44 tap
// target (WCAG), green #25D366 circle, white glyph. No pre-filled
// message — admin types their own once the WA window opens.

import { whatsappDigits } from "@/lib/tradeOff";

export function WhatsAppIconButton({
  whatsapp,
  name
}: {
  whatsapp: string;
  name: string;
}) {
  const digits = whatsappDigits(whatsapp);
  const disabled = digits.length === 0;
  const title = `Message ${name}`;
  const baseCls =
    "inline-flex h-11 w-11 items-center justify-center rounded-full transition";
  if (disabled) {
    return (
      <span
        title="No WhatsApp number on file"
        aria-label="No WhatsApp number on file"
        className={`${baseCls} cursor-not-allowed bg-brand-bg text-brand-muted opacity-50`}
      >
        <WhatsAppGlyph />
      </span>
    );
  }
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className={`${baseCls} bg-[#25D366] text-white hover:opacity-90`}
    >
      <WhatsAppGlyph />
    </a>
  );
}

function WhatsAppGlyph() {
  // Simplified WhatsApp speech-bubble + phone glyph, single-path SVG.
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.05 4.91A10 10 0 0 0 12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.13-1.35A9.96 9.96 0 0 0 12.04 22h.01c5.52 0 10-4.48 10-10a9.94 9.94 0 0 0-3-7.09Zm-7.01 15.4h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.81-2.97-.2-.31a8.3 8.3 0 1 1 6.98 3.82Zm4.56-6.22c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.02 2.57.13.17 1.74 2.66 4.21 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.65-1.16.2-.57.2-1.05.14-1.16-.06-.11-.23-.17-.48-.3Z" />
    </svg>
  );
}
