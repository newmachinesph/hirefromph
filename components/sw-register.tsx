"use client";

import { useEffect } from "react";

/** Registers the service worker once on mount. Rendered in the root layout so
 * every route is covered. No UI. */
export function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register after load so it never competes with first paint.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is a progressive enhancement — ignore failures */
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
