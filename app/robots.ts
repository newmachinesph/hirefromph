import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    // `/path` is crawlable so bots can see its page-level `noindex` metadata.
    // Blocking it here can leave the personalized dashboard indexed without a
    // useful snippet because crawlers never get to read that directive.
    // `/dev/` is the component gallery: it 404s in production and is never
    // linked, but the disallow makes the intent explicit.
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
