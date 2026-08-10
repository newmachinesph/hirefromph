import type { MetadataRoute } from "next";
import site from "@/data/site.json";

export const BASE_URL = "https://hirefrom.ph";

/**
 * Every content route, derived from the nav so a new page can't be forgotten.
 * `/path` is intentionally excluded — it's a personalized, client-rendered app
 * hub that SSRs only an empty skeleton, so it's noindex (see robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...site.navGroups.flatMap((g) => g.links.map((l) => l.href)),
  ];

  return Array.from(new Set(routes)).map((href) => ({
    url: `${BASE_URL}${href === "/" ? "" : href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));
}
