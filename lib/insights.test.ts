import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  countWords,
  extractToc,
  listAllInsights,
  listInsights,
  readingTime,
  validateInsight,
  type Insight,
} from "@/lib/insights";

const assets = mkdtempSync(join(tmpdir(), "hfph-insight-"));
writeFileSync(join(assets, "hero.jpg"), "x");
writeFileSync(join(assets, "chart.svg"), "<svg/>");

const fixture: Insight = {
  slug: "a-test-article",
  title: "A test article",
  description:
    "A description long enough to read like a real search snippet for the test fixture, about one hundred and forty characters all told.",
  author: { name: "Test Author", role: "Editor" },
  published: "2026-08-22",
  figuresVerified: "2026-08",
  keywords: ["one", "two", "three"],
  tags: ["Industry"],
  hero: { src: "hero.jpg", alt: "A hero" },
  pullQuotes: ["Quote one"],
  sources: [{ n: 1, publisher: "IBPAP", title: "Annual results", date: "2026-03-01", url: "https://example.org/a" }],
  related: [],
  status: "published",
  body: '## First heading\n\nPlain prose with no digits.\n\nEmployment reached [1.8 million](https://example.org/a) in the year.\n\n<Figure src="chart.svg" alt="x" />\n\n<PullQuote n={0} />\n\n### Sub heading\n\nAnother number, 42, with a cite <Cite n={1} />.',
  words: 0,
  minutes: 1,
  toc: [],
  href: "/insights/a-test-article",
  assetBase: "/insights/a-test-article",
};

describe("helpers", () => {
  it("counts prose words, not markup or link targets", () => {
    expect(countWords('Hello [world](https://x.y/z) <Figure src="a" /> **bold**')).toBe(3);
    expect(readingTime("word ".repeat(660))).toBe(3);
  });

  it("extracts h2/h3 with rehype-slug-compatible ids", () => {
    expect(extractToc(fixture.body)).toEqual([
      { id: "first-heading", label: "First heading", level: 2 },
      { id: "sub-heading", label: "Sub heading", level: 3 },
    ]);
    expect(extractToc("## Say it twice\n\n## Say it twice")).toEqual([
      { id: "say-it-twice", label: "Say it twice", level: 2 },
      { id: "say-it-twice-1", label: "Say it twice", level: 2 },
    ]);
  });
});

describe("validateInsight", () => {
  it("accepts a well-formed article", () => {
    expect(validateInsight(fixture, assets)).toEqual([]);
  });

  it("enforces the honesty rule: a paragraph with a number needs a source link", () => {
    const bad = { ...fixture, body: `${fixture.body}\n\nThe sector employs 1.8 million people.` };
    expect(validateInsight(bad, assets)).toContainEqual(expect.stringContaining("states a number without a source link"));
  });

  it("catches missing assets, bad cites, bad dates and a short description", () => {
    const bad: Insight = {
      ...fixture,
      description: "Too short",
      published: "22/08/2026",
      figuresVerified: "August 2026",
      hero: { src: "missing.jpg", alt: "" },
      body: `${fixture.body}\n\n<Cite n={9} />\n\n<Figure src="nope.svg" alt="x" />\n\n<PullQuote n={4} />`,
    };
    const problems = validateInsight(bad, assets);
    expect(problems).toContainEqual(expect.stringContaining("description is 9 chars"));
    expect(problems).toContainEqual(expect.stringContaining("published is not YYYY-MM-DD"));
    expect(problems).toContainEqual(expect.stringContaining("figuresVerified is not YYYY-MM"));
    expect(problems).toContainEqual(expect.stringContaining("hero asset missing.jpg is missing"));
    expect(problems).toContainEqual(expect.stringContaining("hero image has no alt text"));
    expect(problems).toContainEqual(expect.stringContaining("<Cite n=9> has no matching source"));
    expect(problems).toContainEqual(expect.stringContaining("Figure asset nope.svg is missing"));
    expect(problems).toContainEqual(expect.stringContaining("<PullQuote n={4}> has no matching pull quote"));
  });
});

describe("the authored articles", () => {
  it("every folder validates against its own assets", () => {
    for (const insight of listAllInsights()) {
      expect(validateInsight(insight), insight.slug).toEqual([]);
    }
  });

  it("published articles are sorted newest first and carry a reading time", () => {
    const published = listInsights();
    for (let i = 1; i < published.length; i += 1) {
      expect(published[i - 1].published >= published[i].published).toBe(true);
    }
    for (const insight of published) expect(insight.minutes).toBeGreaterThan(0);
  });
});
