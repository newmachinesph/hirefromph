"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";

export const CONSENT_COOKIE = "hfph.consent";
export const GA_ID = "G-41TT5P31BY";

/** Mirrors `Button` size="sm"; the library owns the element, so it takes a class string. */
const BUTTON =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-pill px-4 font-display text-small font-bold transition-colors duration-150 ease-out";

/**
 * The cookie notice, and the only place Google Analytics is loaded from.
 *
 * Analytics is the one thing on the site that sets a cookie, so consent and
 * the loader live together: GA mounts after "Accept" (or on a later visit
 * when the consent cookie already says yes) and never before. "Decline" is
 * remembered too, so the notice does not nag on every page.
 */
export function CookieNotice() {
  const [accepted, setAccepted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (getCookieConsentValue(CONSENT_COOKIE) === "true") setAccepted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <>
      <CookieConsent
        cookieName={CONSENT_COOKIE}
        expires={365}
        enableDeclineButton
        disableStyles
        buttonText="Accept"
        declineButtonText="Decline"
        ariaAcceptLabel="Accept analytics cookies"
        ariaDeclineLabel="Decline analytics cookies"
        onAccept={() => setAccepted(true)}
        customContainerAttributes={{ role: "region", "aria-label": "Cookie notice" }}
        containerClasses="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-between gap-4 border-t border-line bg-paper px-4 py-4 sm:px-6"
        contentClasses="max-w-2xl text-small leading-relaxed text-ink-soft"
        buttonWrapperClasses="flex shrink-0 gap-2"
        buttonClasses={`${BUTTON} bg-primary text-white hover:bg-primary-deep`}
        declineButtonClasses={`${BUTTON} border border-line-strong bg-paper text-ink hover:border-ink hover:bg-band`}
      >
        This site uses Google Analytics cookies to see which pages help. Nothing
        else is tracked, and nothing is sold.{" "}
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          Read the privacy page
        </Link>
        .
      </CookieConsent>
      {accepted && <GoogleAnalytics gaId={GA_ID} />}
    </>
  );
}
