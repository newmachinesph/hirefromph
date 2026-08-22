import { BASE_URL } from "@/app/sitemap";
import { assetUrl, listInsights } from "@/lib/insights";

export const dynamic = "force-static";

function escape(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c,
  );
}

/** RSS 2.0 for the Insights section. Published articles only, newest first. */
export function GET(): Response {
  const items = listInsights()
    .map(
      (insight) => `    <item>
      <title>${escape(insight.title)}</title>
      <link>${BASE_URL}${insight.href}</link>
      <guid isPermaLink="true">${BASE_URL}${insight.href}</guid>
      <pubDate>${new Date(`${insight.published}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(insight.description)}</description>
      <author>${escape(insight.author.name)}</author>
      <enclosure url="${BASE_URL}${assetUrl(insight.slug, insight.hero.src)}" type="image/jpeg" length="0" />
${insight.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hire From PH — Insights</title>
    <link>${BASE_URL}/insights</link>
    <atom:link href="${BASE_URL}/insights/feed.xml" rel="self" type="application/rss+xml" />
    <description>Evidence-based essays on where Filipino online work is heading.</description>
    <language>en-ph</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
