"use client";

import { useEffect } from "react";
import { getSessionId } from "@/lib/sessionId";
import type { PageEventType } from "@/lib/track";

// Drop one of these into any page to fire a single tracking beacon on
// mount. The /api/track endpoint derives country from the cookie/header,
// so we only have to pass kind, event_type, product_id (if PDP), path.
//
// Uses navigator.sendBeacon when available so the request survives even
// if the buyer is navigating away the moment the event fires.
export function TrackPageEvent({
  eventType,
  productId,
  path
}: {
  eventType: PageEventType;
  productId?: string | null;
  path?: string;
}) {
  useEffect(() => {
    const payload = JSON.stringify({
      kind: "page",
      event_type: eventType,
      product_id: productId ?? null,
      session_id: getSessionId(),
      path: path ?? (typeof location !== "undefined" ? location.pathname : null)
    });
    try {
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        });
      }
    } catch {
      // best-effort
    }
  }, [eventType, productId, path]);

  return null;
}
