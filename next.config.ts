import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs/config";

const isDev = process.env.NODE_ENV !== "production";
const sentryOrigin = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "");
    return url.protocol === "https:" ? ` ${url.origin}` : "";
  } catch {
    return "";
  }
})();
const publicAssets = (() => {
  if (!process.env.R2_PUBLIC_URL) return undefined;
  const url = new URL(process.env.R2_PUBLIC_URL);
  if (url.protocol !== "https:" || url.search || url.hash) {
    throw new Error("R2_PUBLIC_URL must be an HTTPS brand asset base URL");
  }
  return url.toString().replace(/\/+$/, "");
})();

// Sent on every route. CSP keeps 'unsafe-inline' for scripts because Next injects
// inline hydration/bootstrap scripts and there is no per-request nonce middleware
// on this static site; the allowlist still blocks any off-origin script/frame.
//
// 'unsafe-eval' is added in development ONLY. React's dev build uses eval() to
// rebuild callstacks across environments and refuses to boot without it; the
// production build never calls eval, so shipping it would weaken the header for
// nothing. Do not hoist it out of the isDev guard.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com${sentryOrigin}`,
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // content/insights/<slug>/index.mdx is imported by app/insights/[slug]/page.tsx.
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
  async redirects() {
    return [
      ...(publicAssets
        ? [{ source: "/brand/:path*", destination: `${publicAssets}/brand/:path*`, permanent: false }]
        : []),
      { source: "/coming-soon/:path*", destination: "/", permanent: true },
    ];
  },
};

// Plugin names as strings: Turbopack cannot take plugin functions. remark-gfm for
// tables, rehype-slug for heading ids (the TOC and deep links depend on them).
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

const config = withMDX(nextConfig);
export default process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  ? withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
    })
  : config;
