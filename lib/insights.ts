/**
 * The Insights section's content loader.
 *
 * One folder per article: content/insights/<slug>/meta.json (everything a
 * database row would hold) + index.mdx (the body), with the article's assets
 * under public/insights/<slug>/. The folder name is the slug and the URL.
 *
 * SERVER ONLY — reads the filesystem. Import from server components, route
 * handlers, the sitemap and scripts; never from a "use client" component.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";

export const CONTENT_DIR = join(process.cwd(), "content", "insights");
export const ASSET_ROOT = join(process.cwd(), "public", "insights");
export const INSIGHTS_PATH = "/insights";

export type InsightSource = { n: number; publisher: string; title: string; date: string; url: string };
export type InsightLink = { label: string; href: string };

export type InsightMeta = {
  slug: string;
  title: string;
  description: string;
  kicker?: string;
  author: { name: string; role: string };
  published: string;
  updated?: string;
  figuresVerified: string;
  keywords: string[];
  tags: string[];
  hero: { src: string; alt: string; caption?: string; credit?: string };
  pullQuotes: string[];
  disclaimer?: string;
  sources: InsightSource[];
  related: InsightLink[];
  status: "draft" | "published";
};

export type Insight = InsightMeta & {
  body: string;
  words: number;
  minutes: number;
  toc: TocEntry[];
  href: string;
  assetBase: string;
};

export type TocEntry = { id: string; label: string; level: 2 | 3 };

const WORDS_PER_MINUTE = 220;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

function slugDirs(): string[] {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((name) => statSync(join(CONTENT_DIR, name)).isDirectory())
    .sort();
}

/** "22 August 2026" from an ISO date, for bylines and cards. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function assetUrl(slug: string, file: string): string {
  return `${INSIGHTS_PATH}/${slug}/${file}`;
}

/** Words in the prose, ignoring MDX tags, code fences and link targets. */
export function countWords(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[#*_>|`]/g, " ");
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function readingTime(body: string): number {
  return Math.max(1, Math.round(countWords(body) / WORDS_PER_MINUTE));
}

/** h2/h3 headings with the ids rehype-slug will give them. */
export function extractToc(body: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const out: TocEntry[] = [];
  let inFence = false;
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(##|###)\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const label = match[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
    out.push({ id: slugger.slug(label), label, level: match[1] === "##" ? 2 : 3 });
  }
  return out;
}

function readMeta(slug: string): InsightMeta {
  const file = join(CONTENT_DIR, slug, "meta.json");
  return JSON.parse(readFileSync(file, "utf8")) as InsightMeta;
}

function readBody(slug: string): string {
  return readFileSync(join(CONTENT_DIR, slug, "index.mdx"), "utf8");
}

function build(slug: string): Insight {
  const meta = readMeta(slug);
  const body = readBody(slug);
  return {
    ...meta,
    body,
    words: countWords(body),
    minutes: readingTime(body),
    toc: extractToc(body),
    href: `${INSIGHTS_PATH}/${slug}`,
    assetBase: `${INSIGHTS_PATH}/${slug}`,
  };
}

/** Every folder, drafts included (for validation and scripts). */
export function listAllInsights(): Insight[] {
  return slugDirs().map(build);
}

/** Published articles, newest first. */
export function listInsights(): Insight[] {
  return listAllInsights()
    .filter((insight) => insight.status === "published")
    .sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0));
}

export function getInsight(slug: string): Insight | undefined {
  if (!slugDirs().includes(slug)) return undefined;
  const insight = build(slug);
  return insight.status === "published" || process.env.NODE_ENV !== "production" ? insight : undefined;
}

/**
 * Everything an article must keep, as human-readable problems. Empty means
 * valid. Shared by lib/insights.test.ts and scripts/verify-insights.mjs so a
 * broken article can neither pass the suite nor build.
 */
export function validateInsight(insight: Insight, assetDir: string = join(ASSET_ROOT, insight.slug)): string[] {
  const problems: string[] = [];
  const at = (message: string) => problems.push(`${insight.slug}: ${message}`);

  if (!insight.slug) at("no slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(insight.slug)) at("slug must be kebab-case");
  if (!insight.title) at("no title");
  if (!insight.description) at("no description");
  else if (insight.description.length < 120 || insight.description.length > 165)
    at(`description is ${insight.description.length} chars (want 120–165 for search snippets)`);
  if (!insight.author?.name) at("no author name");
  if (!ISO_DATE.test(insight.published ?? "")) at("published is not YYYY-MM-DD");
  if (insight.updated && !ISO_DATE.test(insight.updated)) at("updated is not YYYY-MM-DD");
  if (!ISO_MONTH.test(insight.figuresVerified ?? "")) at("figuresVerified is not YYYY-MM");
  if (!Array.isArray(insight.keywords) || insight.keywords.length < 3) at("fewer than three keywords");
  if (!Array.isArray(insight.tags) || insight.tags.length === 0) at("no tags");
  if (!["draft", "published"].includes(insight.status)) at(`unknown status "${insight.status}"`);

  if (!insight.hero?.src) at("no hero image");
  else {
    if (!insight.hero.alt) at("hero image has no alt text");
    if (!existsSync(join(assetDir, insight.hero.src))) at(`hero asset ${insight.hero.src} is missing from public/insights/${insight.slug}/`);
  }

  const sources = insight.sources ?? [];
  if (sources.length === 0) at("no sources");
  const ns = new Set<number>();
  sources.forEach((source) => {
    if (ns.has(source.n)) at(`source ${source.n} is listed twice`);
    ns.add(source.n);
    if (!source.publisher || !source.title) at(`source ${source.n} needs a publisher and a title`);
    if (!/^https?:\/\//.test(source.url ?? "")) at(`source ${source.n} url is not a URL`);
  });

  // The honesty rule: a paragraph that states a number carries a citation.
  const paragraphs = insight.body
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  paragraphs.forEach((p) => {
    if (p.startsWith("#") || p.startsWith("<") || p.startsWith("|") || p.startsWith("import ")) return;
    if (!/\d/.test(p)) return;
    const cited = /\]\(https?:\/\/[^)]+\)/.test(p) || /<Cite\b/.test(p) || /\]\(#sources\)/.test(p);
    if (!cited) at(`paragraph states a number without a source link: "${p.slice(0, 80)}…"`);
  });

  // Every <Cite n> and <PullQuote n> and <Figure src> must resolve.
  for (const match of insight.body.matchAll(/<Cite\s+n=\{?(\d+)\}?/g)) {
    if (!ns.has(Number(match[1]))) at(`<Cite n=${match[1]}> has no matching source`);
  }
  for (const match of insight.body.matchAll(/<PullQuote\s+n=\{(\d+)\}/g)) {
    if (!insight.pullQuotes?.[Number(match[1])]) at(`<PullQuote n={${match[1]}}> has no matching pull quote`);
  }
  for (const match of insight.body.matchAll(/<Figure\s[^>]*src="([^"]+)"/g)) {
    if (!existsSync(join(assetDir, match[1]))) at(`Figure asset ${match[1]} is missing from public/insights/${insight.slug}/`);
  }

  return problems;
}
