/* eslint-disable @next/next/no-img-element -- article covers are article-scoped static files with explicit dimensions */
import type { Metadata } from "next";
import Link from "next/link";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { Callout, Text } from "@/components/ui";
import { assetUrl, formatDate, listInsights, type Insight } from "@/lib/insights";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";

const INDEX_META = pageMeta({
  path: "/insights",
  title: "Insights",
  description:
    "Evidence-based essays on where Filipino online work is heading: the industry, the tools, the jobs, and what to do about it. Every figure links to its source.",
});

export const metadata: Metadata = {
  ...INDEX_META,
  alternates: { canonical: "/insights", types: { "application/rss+xml": "/insights/feed.xml" } },
};

function ArticleCard({ insight, featured }: { insight: Insight; featured?: boolean }) {
  return (
    <li className={featured ? "md:col-span-2" : undefined}>
      <Link
        href={insight.href}
        className="group grid h-full overflow-hidden rounded-lg border border-line bg-paper transition-colors duration-150 hover:border-ink md:grid-cols-[1.1fr_1fr]"
      >
        <img
          src={assetUrl(insight.slug, insight.hero.src)}
          alt=""
          width={1536}
          height={864}
          className="aspect-[16/9] w-full object-cover md:h-full"
          loading={featured ? "eager" : "lazy"}
        />
        <div className="flex flex-col gap-3 p-6 lg:p-8">
          <Text size="caption" tone="faint" className="uppercase tracking-wider">
            {insight.kicker ?? "Insights"} · {formatDate(insight.published)} · {insight.minutes} min read
          </Text>
          <h2 className={featured ? "font-display text-h2 font-bold text-balance" : "font-display text-h4 font-bold text-balance"}>
            {insight.title}
          </h2>
          <Text size={featured ? "body" : "small"}>{insight.description}</Text>
          <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Topics">
            {insight.tags.map((tag) => (
              <li key={tag} className="rounded-pill border border-line-strong px-3 py-1 text-caption text-ink-soft">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </li>
  );
}

export default function InsightsPage() {
  const insights = listInsights();
  const neighbours = findNavNeighbours("/insights");
  const [featured, ...rest] = insights;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb("/insights")}
        kicker="Insights"
        title="Where Filipino online work is heading."
        lead="Long reads on the industry, the tools and the jobs: what the data says, what it does not, and what to do about it. Every number links to its source, and where a claim is ours we say so."
      >
        <Callout tone="neutral" className="mt-8 max-w-3xl">
          These are arguments, not announcements. We separate verified data, official forecasts, third-party
          projections and our own interpretation in every piece, and we date the figures.
        </Callout>
      </PageHero>

      <Section>
        {insights.length === 0 ? (
          <Text>No articles yet.</Text>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {featured && <ArticleCard insight={featured} featured />}
            {rest.map((insight) => (
              <ArticleCard key={insight.slug} insight={insight} />
            ))}
          </ul>
        )}
        <Text size="caption" tone="faint" className="mt-8">
          Subscribe with any reader:{" "}
          <a href="/insights/feed.xml" className="text-primary underline underline-offset-4">
            RSS feed
          </a>
          .
        </Text>
      </Section>

      <Section spacing="none">
        <PageFooterNav prev={neighbours.prev} next={neighbours.next} up={neighbours.up} className="pb-20" />
      </Section>
    </>
  );
}
