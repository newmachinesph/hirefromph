import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/path" },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
