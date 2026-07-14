import type { MetadataRoute } from "next";
import site from "@/data/site.json";

export const BASE_URL = "https://devup.ph";

/** Every route, derived from the nav so a new page can't be forgotten here. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...site.navGroups.flatMap((g) => g.links.map((l) => l.href)),
    "/path",
  ];

  return Array.from(new Set(routes)).map((href) => ({
    url: `${BASE_URL}${href === "/" ? "" : href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));
}
