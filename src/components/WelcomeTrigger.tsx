"use client";

import { useEffect } from "react";
import { WELCOME_EVENT } from "./WelcomePopup";

// Fires the welcome popup ~3.5s after this component mounts. Used on
// category pages and PDPs so the popup only appears once the visitor has
// shown some intent (clicked into a category or opened a product). The
// popup itself gates on localStorage so it only ever fires once per browser.
export function WelcomeTrigger() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.dispatchEvent(new Event(WELCOME_EVENT));
    }, 3500);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
