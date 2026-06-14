"use client";

import { useEffect } from "react";
import { WELCOME_EVENT } from "./WelcomePopup";

// Desktop-only exit-intent fallback: if the cursor races above the viewport
// (toward the browser tab strip), fire the welcome popup before they leave.
// Mobile devices don't have this signal — they get the WelcomeTrigger path.
// Honours a 1.2s grace period after mount so quick mouse moves at page load
// don't trigger.
export function WelcomeExitIntent() {
  useEffect(() => {
    const ready = { current: false };
    const grace = window.setTimeout(() => { ready.current = true; }, 1200);

    const onMouseOut = (e: MouseEvent) => {
      if (!ready.current) return;
      // Only fire when the cursor exits at the top edge.
      if (e.clientY <= 0 && !e.relatedTarget) {
        window.dispatchEvent(new Event(WELCOME_EVENT));
      }
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.clearTimeout(grace);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);
  return null;
}
