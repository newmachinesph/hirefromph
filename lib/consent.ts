/**
 * Google Analytics + consent, in one place.
 *
 * GA itself is loaded unconditionally by `<GoogleAnalytics gaId={GA_ID} />`
 * in `app/layout.tsx` (@next/third-parties). What the cookie notice controls
 * is Google Consent Mode: `analytics_storage` starts "granted" unless the
 * visitor has pressed Decline before, and the notice flips it either way.
 *
 * This file has no "use client", so the server layout can import the script.
 */

export const GA_ID = "G-41TT5P31BY";
export const CONSENT_COOKIE = "hfph.consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentState = "granted" | "denied";

/**
 * Inlined as the first child of `<body>`, before the gtag loader: Consent
 * Mode defaults must be pushed before `gtag("config")` runs. ES5, no
 * template literals, no `</script` substring, wrapped in try/catch.
 */
export const CONSENT_SCRIPT =
  "(function(){try{window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=window.gtag||gtag;" +
  'var declined=document.cookie.indexOf("' +
  CONSENT_COOKIE +
  '=false")>-1;' +
  'gtag("consent","default",{analytics_storage:declined?"denied":"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});' +
  "}catch(e){}})();";

/** Flip analytics consent at runtime (Accept / Decline on the notice). */
export function updateAnalyticsConsent(state: ConsentState): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: state });
}
