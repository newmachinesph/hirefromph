import type { MetadataRoute } from "next";
import { NAV_GROUPS, isLive } from "@/lib/nav";
import { listInsights } from "@/lib/insights";

export const BASE_URL = "https://hirefrom.ph";

/**
 * Every content route, derived from `site.json.navGroups` so a new page can't
 * be forgotten.
 *
 * - Links marked `pending` are authored in the IA but their route ships in a
 *   later phase (/practice, /glossary, /educators), so they stay out until the
 *   flag is deleted.
 * - `/path` is excluded on purpose: it's a personalized, client-rendered hub
 *   that SSRs only an empty skeleton, so it's noindex (see path/layout.tsx).
 * - `/dev/ui` can never leak in, because the dev gallery is not in navGroups.
 */
const EXCLUDED = new Set(["/path"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...NAV_GROUPS.flatMap((group) => group.links.filter(isLive).map((link) => link.href)),
  ].filter((href) => !EXCLUDED.has(href));

  const pages = Array.from(new Set(routes)).map((href) => ({
    url: `${BASE_URL}${href === "/" ? "" : href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));

  // Published articles: content/insights/<slug>/meta.json is the source of truth.
  const articles = listInsights().map((insight) => ({
    url: `${BASE_URL}${insight.href}`,
    lastModified: new Date(`${insight.updated ?? insight.published}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
