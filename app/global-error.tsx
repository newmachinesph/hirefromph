"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "3rem", color: "#161A24" }}>
        <h1>Something went wrong.</h1>
        <p>Please try again.</p>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
