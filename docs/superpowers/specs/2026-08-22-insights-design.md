# Insights (articles) — design

Date: 2026-08-22 · Owner ask: an article/insights section on MDX, assets separated under `public/`, **one folder per article** so the content can be lifted into a database later; first article: *Beyond the Call Center: How Human Intelligence Outsourcing Could Power the Philippines' Next BPO Boom*; use the diagram and imagery skills; go beyond the brief where it earns it.

## 1. One folder per article, two halves

```
content/insights/<slug>/
  meta.json      ← everything a database row would hold (see §2)
  index.mdx      ← the body only (no frontmatter); may use the components in §4
public/insights/<slug>/
  hero.jpg, hero.webp          ← generated/optimised photos
  <diagram>.svg                ← diagrams, static SVG in the site's visual language
  (any other asset the body references, by bare file name)
```

The folder name **is** the slug and the URL: `/insights/<slug>`. Migration to a database later = one row per `meta.json` + the MDX body as a text column + the asset folder moved to object storage with the same relative names. Nothing in the body references paths outside its own asset folder.

## 2. `meta.json` (the future row)

```ts
type InsightMeta = {
  slug: string;                // must equal the folder name
  title: string;
  description: string;         // the SEO meta description, 150–160 chars
  kicker?: string;             // small label, e.g. "Insights · Industry"
  author: { name: string; role: string };
  published: "YYYY-MM-DD";
  updated?: "YYYY-MM-DD";
  figuresVerified: "YYYY-MM";  // the honesty stamp, rendered like FreshnessNote
  keywords: string[];          // SEO, 5 for the first article
  tags: string[];              // site taxonomy, shown as chips
  hero: { src: "hero.jpg"; alt: string; caption?: string; credit?: string };
  pullQuotes: string[];        // 3 for the first article, rendered by <PullQuote n={…}/> in the body
  disclaimer?: string;
  sources: { n: number; publisher: string; title: string; date: string; url: string }[];
  related: { label: string; href: string }[];   // site pages to continue to
  status: "draft" | "published";
};
```

`lib/insights.ts` (server-only): `listInsights()` (published only, newest first), `getInsight(slug)`, `readingTime(body)`, `extractToc(body)` (h2/h3 via `github-slugger`, the same algorithm as `rehype-slug`), `validateInsight(meta, body, assetDir)` returning problems. Tests in `lib/insights.test.ts`.

## 3. Rendering

- `@next/mdx` (Turbopack plugin names as strings): `remark-gfm` (tables), `rehype-slug` (heading ids). `mdx-components.tsx` at the repo root maps markdown elements to the site's typography and exposes the article components.
- `app/insights/page.tsx`: index — hero with the section's honesty note, article cards (hero image, tags, reading time, date), newest first.
- `app/insights/[slug]/page.tsx`: `generateStaticParams` from the folders, `dynamicParams = false`, dynamic `import(\`@/content/insights/${slug}/index.mdx\`)`. Layout: hero (kicker, title, description, author · date · reading time · "Figures verified Mon YYYY"), hero figure, `Toc` (mobile disclosure + xl sidebar), body in `.prose-insight`, disclaimer callout, **Sources and further reading** (numbered from `meta.sources`), related links, `PageFooterNav`.
- `app/insights/[slug]/opengraph-image.tsx`: typographic OG card (title, kicker, site mark) so every article shares well.
- `app/insights/feed.xml/route.ts`: RSS 2.0 of published articles.
- JSON-LD `Article` on each article page; `sitemap.ts` adds every published article; nav "More" gets "Insights"; `library.json` gets an `/insights` entry.

## 4. Components available inside MDX

`PullQuote` (from `meta.pullQuotes[n]`), `Figure` (article-scoped: `src="diagram.svg"` resolves to `/insights/<slug>/diagram.svg`; caption + alt required), `Callout`, `DataTable` (wraps a markdown table in an overflow container with an optional caption), `Cite` (inline `[n]` link to the sources list), `Aside`. Plain markdown links remain the primary inline-citation form: every sentence that states a number carries a descriptive hyperlink to its source.

## 5. Honesty rule, enforced

`scripts/verify-insights.mjs` (also run by `lib/insights.test.ts`): for every published article, (a) `meta.json` validates, (b) every paragraph containing a digit also contains a markdown link or a `<Cite` — the "no number without its source" rule, (c) every `Figure`/`hero` asset exists in the folder, (d) every `Cite n` exists in `sources`, (e) word count within the brief's range for the first article, (f) the disclaimer is present when the article introduces a proposed term.

## 6. First article

- Folder `beyond-the-call-center-human-intelligence-outsourcing`.
- Research first (web, primary sources), written to a fact sheet; the article is written from the fact sheet only; each fact carries its classification (verified data / official forecast / third-party projection / opinion / the author's interpretation).
- Required elements from the brief: 1,800–2,500 words, the BPO-vs-HIO comparison table, the HIO service-category table, a workforce-transition framework, ≥ 8 authoritative sources, inline citations, sources section, meta description, slug, 5 keywords, 3 pull quotes, the IBPAP disclaimer.
- Beyond the brief: the "call center → intelligence center" motif; an **intelligence-center org chart** of new roles (Human-in-the-Loop Team Lead, RLHF Operations Specialist, Model Evaluation Analyst, AI Safety Red Teamer, Expert Data Curator, Calibration Lead, Escalation & Edge-Case Reviewer, Contributor Marketplace Operator, Applied AI Operations Manager, AI Training Curriculum Designer) each mapped to the BPO role it grows from; three diagrams (BPO → HIO transition, the nine-step HIO delivery loop, the career-pathway map); two documentary photographs; a "what this means for you" box linking to the site's own tools (/niches, /ai-first, /practice).

## 7. Out of scope

Comments, authors directory, search over articles, newsletter, CMS UI. The folder structure is the CMS for now.
