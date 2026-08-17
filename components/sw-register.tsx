"use client";

import { useEffect } from "react";

/** Registers the service worker once on mount. Rendered in the root layout so
 * every route is covered. No UI. */
export function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Next's development chunks are rebuilt at stable URLs, so a cache-first
    // service worker can serve stale client code against fresh server HTML and
    // cause hydration mismatches. Keep offline caching production-only and
    // clean up any worker/cache left by an earlier local session.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        );
      if ("caches" in window) {
        void caches
          .keys()
          .then((keys) =>
            Promise.all(keys.filter((key) => key.startsWith("hfph-")).map((key) => caches.delete(key))),
          );
      }
      return;
    }

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
