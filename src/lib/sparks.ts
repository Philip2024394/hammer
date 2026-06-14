"use client";

// Brand-yellow spark burst overlay. Call sparkBurst(buttonEl) to fling
// 10 short-lived sparks out from the centre of the element.
// Honours prefers-reduced-motion (early return).
export function sparkBurst(host: HTMLElement | null, count = 10) {
  if (!host || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Make sure the host can position absolute children.
  const computed = window.getComputedStyle(host);
  if (computed.position === "static") host.style.position = "relative";

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 60 + Math.random() * 40;
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance);
    const s = document.createElement("span");
    s.className = "hx-spark";
    s.style.setProperty("--hx-spark-end", `translate(${dx}px, ${dy}px)`);
    host.appendChild(s);
    window.setTimeout(() => s.remove(), 750);
  }
}
