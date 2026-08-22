/* eslint-disable @next/next/no-img-element -- the hero is an article-scoped static file with explicit dimensions */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleComponents } from "@/components/insights/mdx";
import { ShareBar } from "@/components/insights/share-bar";
import { PageFooterNav, PageHero, Section, Toc } from "@/components/layout";
import { Button, Callout, Text } from "@/components/ui";
import { assetUrl, formatDate, getInsight, listInsights } from "@/lib/insights";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours } from "@/lib/nav";
import { BASE_URL } from "@/app/sitemap";

export const dynamicParams = false;

export function generateStaticParams() {
  return listInsights().map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return {};
  const base = pageMeta({ path: insight.href, title: insight.title, description: insight.description });
  const banner = { url: `${insight.href}/opengraph-image`, width: 1200, height: 630, alt: insight.title };
  return {
    ...base,
    keywords: insight.keywords,
    authors: [{ name: insight.author.name, url: BASE_URL }],
    category: insight.tags[0],
    alternates: {
      canonical: insight.href,
      types: { "application/rss+xml": "/insights/feed.xml" },
    },
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: insight.published,
      modifiedTime: insight.updated ?? insight.published,
      authors: [insight.author.name],
      section: insight.tags[0],
      tags: insight.tags,
      images: [banner],
    },
    twitter: {
      card: "summary_large_image",
      title: insight.title,
      description: insight.description,
      images: [banner.url],
    },
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function verifiedLabel(stamp: string): string {
  const [year, month] = stamp.split("-");
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const { default: Body } = await import(`@/content/insights/${slug}/index.mdx`);
  const neighbours = findNavNeighbours("/insights");
  const components = articleComponents(insight);

  const pageUrl = `${BASE_URL}${insight.href}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: insight.title,
      description: insight.description,
      datePublished: insight.published,
      dateModified: insight.updated ?? insight.published,
      author: { "@type": "Organization", name: insight.author.name, url: BASE_URL },
      publisher: {
        "@type": "Organization",
        name: "Hire From PH",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/icon.svg` },
      },
      image: [`${BASE_URL}${insight.href}/opengraph-image`, `${BASE_URL}${assetUrl(insight.slug, insight.hero.src)}`],
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      url: pageUrl,
      inLanguage: "en-PH",
      articleSection: insight.tags[0],
      keywords: insight.keywords.join(", "),
      wordCount: insight.words,
      timeRequired: `PT${insight.minutes}M`,
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Insights", item: `${BASE_URL}/insights` },
        { "@type": "ListItem", position: 3, name: insight.title, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Insights", href: "/insights" }, { label: insight.title }]}
        kicker={insight.kicker ?? "Insights"}
        title={insight.title}
        lead={insight.description}
      >
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Text size="small" as="span">
            <span className="font-semibold text-ink">{insight.author.name}</span>
            {insight.author.role && <span className="text-ink-faint"> · {insight.author.role}</span>}
          </Text>
          <Text size="small" tone="faint" as="span">
            {formatDate(insight.published)}
            {insight.updated && insight.updated !== insight.published && ` · updated ${formatDate(insight.updated)}`}
          </Text>
          <Text size="small" tone="faint" as="span">
            {insight.minutes} min read
          </Text>
          <Text size="caption" tone="faint" as="span" className="uppercase tracking-wider">
            Figures verified · {verifiedLabel(insight.figuresVerified)}
          </Text>
        </div>
        <ShareBar url={pageUrl} title={insight.title} description={insight.description} className="mt-6" />
        <Toc items={insight.toc} mobile className="mt-8" />
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0">
            <figure className="insight-figure mt-0">
              <img
                src={assetUrl(insight.slug, insight.hero.src)}
                alt={insight.hero.alt}
                width={1536}
                height={864}
                className="aspect-[16/9] w-full object-cover"
                fetchPriority="high"
              />
              {(insight.hero.caption || insight.hero.credit) && (
                <figcaption>
                  {insight.hero.caption}
                  {insight.hero.credit && <span className="insight-figure__credit"> {insight.hero.credit}</span>}
                </figcaption>
              )}
            </figure>

            <div className="prose-insight mt-10">
              <Body components={components} />
            </div>

            <ShareBar
              url={pageUrl}
              title={insight.title}
              description={insight.description}
              label="Found this useful? Pass it on."
              className="mt-12 border-t border-line pt-8"
            />

            {insight.disclaimer && (
              <Callout tone="neutral" title="A note on the term" className="mt-12">
                {insight.disclaimer}
              </Callout>
            )}

            <section aria-labelledby="sources" className="mt-14">
              <h2 id="sources" className="font-display text-h3 font-bold scroll-mt-28">
                Sources and further reading
              </h2>
              <ol className="insight-sources mt-6 list-decimal pl-6">
                {insight.sources.map((source) => (
                  <li key={source.n} id={`source-${source.n}`}>
                    <span className="font-semibold">{source.publisher}</span>, {source.title}, {source.date}.{" "}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary underline underline-offset-4"
                    >
                      {source.url.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Topics">
              {insight.tags.map((tag) => (
                <li key={tag} className="rounded-pill border border-line-strong px-3 py-1 text-caption text-ink-soft">
                  {tag}
                </li>
              ))}
            </ul>
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-28">
              <Toc items={insight.toc} />
            </div>
          </aside>
        </div>
      </Section>

      {insight.related.length > 0 && (
        <Section band="tint">
          <h2 className="font-display text-h3 font-bold">What this means for you</h2>
          <Text className="mt-3 max-w-2xl">The site&rsquo;s own tools for the questions this piece raises.</Text>
          <div className="mt-6 flex flex-wrap gap-3">
            {insight.related.map((link, index) => (
              <Button key={link.href} href={link.href} variant={index === 0 ? "primary" : "outline"}>
                {link.label}
              </Button>
            ))}
          </div>
        </Section>
      )}

      <Section spacing="none">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <Link href="/insights" className="text-primary underline underline-offset-4">
            ← All insights
          </Link>
          <a href="/insights/feed.xml" className="text-caption text-ink-faint underline underline-offset-4">
            RSS
          </a>
        </div>
        <PageFooterNav prev={neighbours.prev} next={neighbours.next} up={neighbours.up} className="pb-20" />
      </Section>
    </>
  );
}
