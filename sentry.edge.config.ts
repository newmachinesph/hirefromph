import * as Sentry from "@sentry/nextjs";

const sample = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0");
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number.isFinite(sample) && sample >= 0 && sample <= 1 ? sample : 0,
  });
}
