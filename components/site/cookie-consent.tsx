"use client";

import Link from "next/link";
import CookieConsent from "react-cookie-consent";
import { CONSENT_COOKIE, updateAnalyticsConsent } from "@/lib/consent";

/** Mirrors `Button` size="sm"; the library owns the element, so it takes a class string. */
const BUTTON =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-pill px-4 font-display text-small font-bold transition-colors duration-150 ease-out";

/**
 * The cookie notice. Google Analytics is loaded by the root layout regardless;
 * this only sets Google Consent Mode — Accept grants `analytics_storage`,
 * Decline denies it — and remembers the answer for a year (cookie
 * `hfph.consent`), so the notice does not nag on every page. `lib/consent.ts`
 * replays a remembered Decline before gtag runs on later visits.
 */
export function CookieNotice() {
  return (
    <CookieConsent
      cookieName={CONSENT_COOKIE}
      expires={365}
      enableDeclineButton
      disableStyles
      buttonText="Accept"
      declineButtonText="Decline"
      ariaAcceptLabel="Accept analytics cookies"
      ariaDeclineLabel="Decline analytics cookies"
      onAccept={() => updateAnalyticsConsent("granted")}
      onDecline={() => updateAnalyticsConsent("denied")}
      customContainerAttributes={{ role: "region", "aria-label": "Cookie notice" }}
      containerClasses="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-between gap-4 border-t border-line bg-paper px-4 py-4 sm:px-6"
      contentClasses="max-w-2xl text-small leading-relaxed text-ink-soft"
      buttonWrapperClasses="flex shrink-0 gap-2"
      buttonClasses={`${BUTTON} bg-primary text-white hover:bg-primary-deep`}
      declineButtonClasses={`${BUTTON} border border-line-strong bg-paper text-ink hover:border-ink hover:bg-band`}
    >
      Google Analytics cookies only, to see which pages help. Nothing else is
      tracked or sold.{" "}
      <Link href="/privacy" className="text-primary underline underline-offset-4">
        Privacy page
      </Link>
      .
    </CookieConsent>
  );
}
