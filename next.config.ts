import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const isDev = process.env.NODE_ENV !== "production";

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
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
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
      { source: "/coming-soon/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "www\\.hirefrom\\.ph" }],
        destination: "https://hirefrom.ph/",
        permanent: true,
      },
      {
        // The public file is also a local preview; production has one canonical URL.
        source: "/coming-soon/index.html",
        has: [{ type: "host", value: "(?:www\\.|learn\\.)?hirefrom\\.ph" }],
        destination: "https://hirefrom.ph/",
        permanent: true,
      },
      {
        // Keep the apex homepage, crawler files, assets and worker local. Everything
        // else moves to the same path on Learn, including downloads and deep links.
        // `.+` deliberately excludes `/`. Next preserves the query string.
        source: "/:path((?!_next(?:/|$)|coming-soon(?:/|$)|robots\\.txt$|sitemap\\.xml$|sw\\.js$|icon\\.svg$|favicon\\.ico$).+)",
        has: [{ type: "host", value: "(?:www\\.)?hirefrom\\.ph" }],
        destination: "https://learn.hirefrom.ph/:path",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles overrides the existing static learning homepage only on the
      // main domain. Learn, localhost and Vercel previews retain the learning app.
      beforeFiles: [
        ["/", "/coming-soon/index.html"],
        ["/robots.txt", "/coming-soon/robots.txt"],
        ["/sitemap.xml", "/coming-soon/sitemap.xml"],
        ["/sw.js", "/coming-soon/retire-sw.js"],
      ].map(([source, destination]) => ({
        source,
        destination,
        has: [{ type: "host" as const, value: "(?:www\\.)?hirefrom\\.ph" }],
      })),
      afterFiles: [],
      fallback: [],
    };
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

export default withMDX(nextConfig);
