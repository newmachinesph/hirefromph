# UI Overhaul — Phase 7: Educator Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the educator kit — a typed loader over the already-authored `data/educators.json`, seven print-only routes under `app/educators/kit/*` that render paper-sized sheets from JSON, a Playwright build script that turns them into `public/kit/*.pdf` with a content-hash manifest, a `verify:kit` gate, and the `/educators` landing page that hands the whole thing out under CC BY 4.0.

**Architecture:** The kit is ordinary Next routes plus a print stylesheet, not a separate renderer. `lib/kit.mjs` is the single build contract (the seven files, the five JSON sources, the canonical hash) shared by the app and both scripts; `lib/educators.ts` is the typed door the pages read. Each kit route paints one `<KitPage>` element per printed sheet at exact paper dimensions with `@page { margin: 0 }`, so the sheet — not the browser's flow algorithm — decides where a page ends, and the build script fails when any sheet's content spills. The root layout always mounts the site header and footer and a nested layout cannot unmount them, so `app/educators/kit/layout.tsx` injects one `<style>` element that hides the shell for the documents it owns.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first tokens from Phase 0), TypeScript strict, Vitest 3 + @testing-library/react 16, Playwright 1.x (Chromium only, new devDependency), Node 24, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§7.5 educator kit, §12 `data/educators.json`, §14 row 7, §11 copy rules, §10 accessibility). This is plan 8 of 10.

**Depends on (all complete before this plan starts):**
- **Phase 0:** tokens in `app/globals.css`, `lib/fonts.ts` (Inter + Cabinet Grotesk via `next/font`), `lib/accent.ts`, the redesigned `LogoMark` with its `mono` prop.
- **Phase 1:** `@/components/ui` and `@/components/layout` export exactly the names in the pinned contract below.
- **Phase 2:** `lib/nav.ts` exports `getBreadcrumb`, `findNavNeighbours`, `isLive`; `data/site.json` carries `nav`/`navGroups`/`cta` with `"pending": true` on `/educators` in the **More** group; `data/library.json` carries the same flag on its `/educators` entry; `components/site/logo.tsx` exports `LogoMark`; `app/sitemap.ts` derives from `NAV_GROUPS` and skips pending links.
- **Phase 3:** `components/diagrams/index.ts` exports `JourneyMap` and `MethodLoop`.
- **Phase 6:** `/practice` and `/glossary` have had their `pending` flags removed. Phase 7 removes the last one.

**Already on disk, do not author:** `data/educators.json` (intro, 6 quick-start steps, 3 sessions, 16 slides, licence). This plan reads it and never edits it.

## Global Constraints

_Copied verbatim from `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md`. Every task's requirements implicitly include this section._

- Fonts: Inter via `next/font/google`; Cabinet Grotesk 500/700/800 self-hosted via `next/font/local` from Fontshare woff2 (ITF Free Font License). Space Grotesk, Inter Tight, Space Mono are removed.
- Palette (exact hex): paper `#FFFFFF`, band `#F7F6FF`, tint `#EEEDFF`, ink `#0E1230`, ink-soft `#4A4F66`, ink-faint `#6B7087`, line `#E4E4EA`, line-strong `#CFCFD8`, control `#858A9E`, primary `#4B4EF6`, primary-deep `#3634D8`, primary-soft `#C9C8FF`, verified `#067647` / fill `#12B76A` / tint `#E6F7EE`, caution `#9A5B00` / fill `#F5A623` / tint `#FFF4DB`, info `#026AA2` / fill `#0BA5EC` / tint `#E0F2FE`, coral `#B42318` / fill `#FF5A5F` / tint `#FFECEB`, on-navy `#F7F6FF`.
- Naming convention (deviation from the spec table, documented in BUILD_GUIDE): the bare semantic name (`--verified`) is the **text/deep** value so legacy `text-verified` usages stay AA; the vibrant shape colour is `--verified-fill`.
- Radii: sm 8px, md 12px, lg 20px, pill 999px. The global `* { border-radius: 6px !important }` rule and `.is-circle` are deleted. Tailwind's default `rounded-*` scale is **not** wiped in this phase (legacy pages still use `rounded-2xl`); Phase 5 wipes it.
- Legacy aliases kept until Phase 5: `--paper-2`, `--paper-3`, `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--caution-text`, `--radius`, `--shadow-lg`, `--shadow-signal`, `.kicker`, `.font-display`, `.container-x`, `.link-sweep`, `.font-mono`.
- White text only on `primary`, `primary-deep`, `ink`, and the deep semantic values; never on `*-fill` colours.
- No new `lucide-react` imports. No new `hover:-translate-y-*`, `blur-*`, or `Sparkles`.
- Honesty doctrine unchanged; no copy changes in this phase except the logo tagline, which is unchanged ("the standard, not the discount").
- Git: work on branch `redesign/ui-overhaul`; run git as `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite …` (repo ownership quirk on this machine). Commit after every task.
- Commands run from the repo root in Git Bash. `npm run build` must pass at the end of every task that touches `app/` or `lib/`.

### Phase 7 additions to the constraints

- **The kit renders from JSON.** Doctrine, session, slide, stage, and roadmap copy on a kit sheet is read from `data/*.json`. The only hand-written strings anywhere in `components/kit/` or `app/educators/kit/` are page furniture — the words "Minutes", "Facilitator", "Participants", "Drill", "Continued", the seven contents-table labels in `lib/kit.mjs`, and the section titles on the landing page. Everything else is a lookup. This is the rule that goes into `BUILD_GUIDE.md` in Task 15.
- **The doctrine clarification (spec §7.5).** The no-downloads rule protects learners from dependence on finished *deliverables* (a resume to rename). Material that teaches *the method* (principles, run-sheets, the path map) is teaching material and may be distributed as PDF. The test stays the same: does this make the reader more capable or more dependent? A facilitation guide makes a facilitator more capable.
- **Every number carries its source.** The kit prefers principles to statistics for exactly this reason. Where a slide or sheet carries a `source`, `KitFootnote` prints the URL **in full** — a PDF has no hover, and a bare link label is an unsourced claim on paper.
- **One `<KitPage>` per printed sheet.** `@page` is a document-scoped at-rule: the paper size cannot be set per element. Each kit route's **first** `<KitPage>` injects the one `@page` rule for that document; later sheets inherit it. `@page` margin is `0`, and every `.kit-page` is a fixed-size box that draws its own 14mm padding, so page breaks are authored rather than discovered.
- **Nothing spills.** `.kit-page` is `overflow: hidden`, and `scripts/build-kit-pdf.mjs` fails with the sheet number when `scrollHeight > clientHeight`. A silently clipped run-sheet is worse than a failed build.
- **Print type is fixed, not fluid.** The site's type scale is `clamp(… vw …)`; a paper box has no viewport to be fluid against, so the `.kit` scope declares its own point sizes. Kit sheets therefore do **not** use `Heading`/`Text` — this is a deliberate, documented exception to the Phase 1 "pages never reach the type scale directly" rule, and it applies only under `.kit`.
- **Kit routes are noindex.** `app/educators/kit/layout.tsx` sets `robots: { index: false, follow: false }`, `app/robots.ts` disallows `/educators/kit/`, and the sitemap excludes them structurally (they are not in `navGroups`, the same mechanism that keeps `/dev/ui` out).
- **Copy rules (spec §11)** apply to every new UI string: no "actually", "forever", "genuinely", "truly", "virtual assistant"; no "not X, Y" reversals; no triads for rhythm; concrete nouns and verbs; hero lead ≤ 25 words (the landing page's lead comes from `intro.lead` and is exempt — it is authored content, not shell copy).
- **`git` concurrency:** other agents may commit unrelated `data/*.json` files on this branch. If a git command fails with `Unable to create '.git/index.lock': File exists`, wait a few seconds and re-run the same command. Never delete `index.lock` by hand. Always `git add` explicit paths — never `git add -A`.

### Pinned Phase 1 + Phase 2 contract (authoritative for this plan)

Import these names and no others from the shared libraries.

```ts
// @/components/ui
Badge      // { children, tone?: "neutral"|Accent, variant?: "soft"|"outline", className? }
Button     // { children, href?, external?, variant?: "primary"|"secondary"|"outline"|"ghost"|"link",
           //   size?: "sm"|"md"|"lg", icon?, iconEnd?, type?, disabled?, onClick?, className?, "aria-label"? }
Callout    // { children, tone?: "neutral"|Accent, title?, icon?: string, className? }
Card       // { children, padding?: "none"|"sm"|"md"|"lg", interactive?, href?, as?, onBand?, className? }
DiagramFrame // { title, caption?, id?, className?, children }
Heading    // { children, level?: 1..6, size?: "hero"|"display"|"h2"|"h3"|"h4"|"h5", accent?, balance?, tone?, id?, className? }
Kicker     // { children, tone?, className? }
Step       // { n: number, title: ReactNode, children?, className? }
StepList   // { children, className? }
Text       // { children, size?: "lead"|"body"|"base"|"small"|"caption", tone?: "ink"|"soft"|"faint"|"inherit", as?, balance?, id?, className? }

// @/components/layout
CardGrid       // { children, cols?: 2|3|4, as?: "div"|"ul", className? }
FeatureRow     // { items: Feature[], className? }   Feature = { icon: string; title: string; body: string }
PageFooterNav  // { prev?: FooterLink, next?: FooterLink, up?: FooterLink, className? }  FooterLink = { label, href }
PageHero       // { breadcrumb?: Crumb[], kicker?, kickerTone?, title, accent?, lead?, actions?,
               //   media?: { figureId: string } | { node: ReactNode }, compact?, className?, children? }
Section        // { children, band?: "none"|"tint"|"navy", spacing?: "default"|"hero"|"none", size?, id?, className? }
SectionHeading // { kicker?, kickerTone?, title, lead?, action?, align?, level?, className? }

// @/components/site/logo
LogoMark   // { size?: number, className?, title?: string, onDark?: boolean, mono?: boolean }

// @/components/diagrams
JourneyMap, MethodLoop   // ({ current?: number, className?: string })

// @/lib/nav
getBreadcrumb(href: string): Crumb[]
findNavNeighbours(href: string): { prev?: NavLink; next?: NavLink; up?: NavLink }

// @/lib/meta
pageMeta({ path, title, description }): Metadata
```

---

## File structure

| Path | Responsibility |
|---|---|
| `lib/kit.mjs`, `lib/kit.d.mts` | The build contract: `KIT_FILES` (seven PDFs), `KIT_SOURCES` (five JSON inputs), `canonicalJson`, `hashKitPayload`, `readKitPayload`. Server/script only. |
| `lib/educators.ts` | Typed door onto `data/educators.json` + `kitContentHash()`. |
| `lib/educators.test.ts` | Loader shape, hash stability, minute sums, 16 slides, every `tool` route exists. |
| `app/globals.css` | The `.kit` print scope (paper boxes, fixed type ramp, `@media print` rules). |
| `app/educators/kit/layout.tsx` | Hides the site shell for kit documents; sets `noindex`. |
| `components/kit/{kit-page,kit-header,kit-table,kit-footnote,kit-licence,slide}.tsx`, `index.ts` | The six shared print components. |
| `components/kit/kit-page.test.tsx` | Footer licence line, page number, single `@page` declaration. |
| `app/educators/kit/one-pager/page.tsx` | A4 portrait, 1 sheet — doctrine one-pager. |
| `app/educators/kit/path-map/page.tsx` | A4 landscape, 1 sheet — journey map + five stages + eleven steps. |
| `app/educators/kit/methods/page.tsx` | A4 portrait, 2 sheets — seven methods with drills. |
| `app/educators/kit/session/[id]/page.tsx` | A4 portrait, 4 sheets per session — run-sheet. |
| `app/educators/kit/slides/page.tsx` | 16:9 landscape, 16 sheets. |
| `scripts/build-kit-pdf.mjs` | `next start` on a free port → Playwright Chromium → `public/kit/*.pdf` + `manifest.json`. |
| `scripts/verify-kit.mjs` | Recompute the hash, compare with the manifest, check every PDF. |
| `scripts/verify-links.mjs` | Learns dynamic route segments so `/educators/kit/session/<id>` resolves. |
| `public/kit/*.pdf`, `public/kit/manifest.json` | The seven committed artifacts and their hash stamp. |
| `app/educators/page.tsx` | The landing page. |
| `data/site.json`, `data/library.json` | `"pending": true` deleted from the `/educators` entries. |
| `app/method/page.tsx` | One line under the GIVE drill pointing at `/educators`. |
| `app/robots.ts`, `app/sitemap.ts` | Disallow `/educators/kit/`; comment corrected. |
| `package.json` | `kit:build`, `verify:kit` (appended to `verify:all`), `playwright` devDependency. |
| `BUILD_GUIDE.md`, `README.md` | Doctrine clarification; kit build instructions. |

## Parallel groups

Groups run in order; tasks **inside** a group touch disjoint files and can run concurrently.

| Group | Tasks | Depends on |
|---|---|---|
| A | T1 `lib/kit.mjs` + `lib/educators.ts` | — |
| B | T2 print CSS + kit layout · T3 `components/kit` | A (T3 imports `KIT_LICENSE`) |
| C | T4 one-pager · T5 path-map · T6 methods · T7 session run-sheets · T8 slides | B |
| D | T9 `build-kit-pdf.mjs` · T10 `verify-kit.mjs` · T11 verify-links dynamic segments | A (T9, T10); none (T11) |
| E | T12 generate and commit the seven PDFs | C, D |
| F | T13 `/educators` landing → T14 switch-on → T15 docs → T16 exit verification (**ordered**, not concurrent: the link audit fails between T13 and T14) | E |

---

### Task 1: The build contract (`lib/kit.mjs`) and the typed loader (`lib/educators.ts`)

**Parallel group:** A

**Files:**
- Create: `lib/kit.mjs`, `lib/kit.d.mts`, `lib/educators.ts`, `lib/educators.test.ts`

**Interfaces:**
- Consumes: `data/educators.json`, `data/doctrine.json`, `data/stages.json`, `data/roadmap.json`, `data/site.json` (`standard` only).
- Produces:
  - `lib/kit.mjs` (plain ESM, **server/script only** — imports `node:crypto` and `node:fs`): `REPO_ROOT: string`, `KIT_SOURCES: KitSourceRef[]`, `KIT_FILES: KitFile[]`, `canonicalJson(value: unknown): string`, `hashKitPayload(payload: unknown): string`, `readKitPayload(root?: string): Record<string, unknown>`.
  - `type KitFile = { slug; route; landscape; pages; format; title: string | null; blurb; sessionId: string | null }`.
  - `lib/educators.ts`: types `KitSource`, `SessionStep`, `SessionMistake`, `Session`, `KitSlide`, `EducatorsIntro`, `QuickStartStep`, `KitLicense`; consts `EDUCATORS_LAST_VERIFIED`, `EDUCATORS_INTRO`, `QUICK_START`, `SESSIONS`, `SLIDES`, `KIT_LICENSE`; functions `getSession(id: string): Session | undefined`, `sessionMinutes(session: Session): number`, `kitContentHash(): string`, `getKitFile(slug: string): KitFile | undefined`; re-exports `KIT_FILES` and `type KitFile`.

Why two modules: the two `.mjs` scripts cannot import TypeScript, and a duplicated hash would let the app and the gate drift. `lib/kit.mjs` is the one implementation; `lib/kit.d.mts` types it for `tsc` (the repo already has `allowJs: true` and `**/*.mts` in `tsconfig.include`); `lib/educators.ts` supplies the app-side payload from the bundled JSON imports.

- [ ] **Step 1: Write the failing test**

Create `lib/educators.test.ts`:

```ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import educatorsData from "@/data/educators.json";
import {
  EDUCATORS_INTRO,
  EDUCATORS_LAST_VERIFIED,
  KIT_FILES,
  KIT_LICENSE,
  QUICK_START,
  SESSIONS,
  SLIDES,
  getKitFile,
  getSession,
  kitContentHash,
  sessionMinutes,
} from "@/lib/educators";
import { canonicalJson, hashKitPayload, readKitPayload } from "@/lib/kit.mjs";

/** Ground truth for "this route exists": the app directory itself. */
function appRoutes(dir = join(process.cwd(), "app"), prefix = ""): Set<string> {
  const routes = new Set<string>();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const segment =
        entry.name.startsWith("(") && entry.name.endsWith(")") ? "" : `/${entry.name}`;
      for (const route of appRoutes(join(dir, entry.name), prefix + segment)) routes.add(route);
    } else if (/^page\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      routes.add(prefix === "" ? "/" : prefix);
    }
  }
  return routes;
}

describe("educators loader", () => {
  it("exposes the authored intro, quick start, sessions, slides and licence", () => {
    expect(EDUCATORS_LAST_VERIFIED).toMatch(/^\d{4}-\d{2}$/);
    expect(EDUCATORS_INTRO.title).toBe(educatorsData.intro.title);
    expect(EDUCATORS_INTRO.whoFor).toHaveLength(4);
    expect(EDUCATORS_INTRO.honestyNote).toContain("no learner count");
    expect(QUICK_START).toHaveLength(6);
    expect(QUICK_START.map((step) => step.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(SESSIONS.map((session) => session.id)).toEqual([
      "deconstruct-resume",
      "vet-opportunity",
      "ask-well",
    ]);
    expect(KIT_LICENSE.name).toBe("CC BY 4.0");
    expect(KIT_LICENSE.url).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("ships exactly sixteen slides, each with a kicker, a title and a body", () => {
    expect(SLIDES).toHaveLength(16);
    for (const slide of SLIDES) {
      expect(slide.id, slide.id).toMatch(/\S/);
      expect(slide.kicker, slide.id).toMatch(/\S/);
      expect(slide.title, slide.id).toMatch(/\S/);
      expect(slide.body, slide.id).toMatch(/\S/);
    }
    expect(new Set(SLIDES.map((slide) => slide.id)).size).toBe(SLIDES.length);
  });

  it("prints a real URL for every slide that carries a source", () => {
    for (const slide of SLIDES.filter((s) => s.source)) {
      expect(slide.source?.url, slide.id).toMatch(/^https:\/\//);
      expect(slide.source?.label, slide.id).toMatch(/\S/);
    }
  });

  it("finds a session by id and nothing by a wrong one", () => {
    expect(getSession("ask-well")?.title).toBe("Ask a question that gets answered");
    expect(getSession("nope")).toBeUndefined();
  });

  it("keeps every session's timed steps summing to its advertised length", () => {
    for (const session of SESSIONS) {
      expect(sessionMinutes(session), session.id).toBe(session.minutes);
    }
  });

  it("only ever opens a route that exists", () => {
    const routes = appRoutes();
    for (const session of SESSIONS) {
      for (const step of session.steps) {
        if (!step.tool) continue;
        expect(routes.has(step.tool), `${session.id} → ${step.tool}`).toBe(true);
      }
    }
  });

  it("lists seven kit files, one run-sheet per session", () => {
    expect(KIT_FILES).toHaveLength(7);
    expect(new Set(KIT_FILES.map((file) => file.slug)).size).toBe(7);

    const sessionFiles = KIT_FILES.filter((file) => file.sessionId);
    expect(sessionFiles.map((file) => file.sessionId)).toEqual(SESSIONS.map((s) => s.id));
    for (const file of sessionFiles) {
      expect(file.slug).toBe(`hirefromph-session-${file.sessionId}`);
      expect(file.route).toBe(`/educators/kit/session/${file.sessionId}`);
    }

    expect(getKitFile("hirefromph-slides")?.pages).toBe(SLIDES.length);
    expect(getKitFile("nope")).toBeUndefined();
  });
});

describe("kit content hash", () => {
  it("agrees with the on-disk payload the build scripts hash", () => {
    expect(kitContentHash()).toBe(hashKitPayload(readKitPayload()));
  });

  it("is a stable sha256 hex digest", () => {
    expect(kitContentHash()).toMatch(/^[0-9a-f]{64}$/);
    expect(kitContentHash()).toBe(kitContentHash());
  });

  it("ignores key order and notices a changed value", () => {
    expect(canonicalJson({ b: 1, a: [2, 3] })).toBe(canonicalJson({ a: [2, 3], b: 1 }));
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));

    const payload = readKitPayload() as { educators: { lastVerified: string } };
    const changed = { ...payload, educators: { ...payload.educators, lastVerified: "1999-01" } };
    expect(hashKitPayload(changed)).not.toBe(kitContentHash());
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/educators.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/educators"`.

- [ ] **Step 3: Write `lib/kit.mjs`**

```js
/**
 * The educator kit's build contract — the one place that knows which PDFs
 * exist, which JSON they are rendered from, and how the content hash is
 * computed. Shared by the app (through lib/educators.ts) and by both kit
 * scripts, so the gate can never drift from the page.
 *
 * SERVER / SCRIPT ONLY: this module imports node:crypto and node:fs. Never
 * import it, or lib/educators.ts, from a "use client" component.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root, resolved from this file so a script can run from any cwd. */
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The JSON the kit renders. `pick` narrows a file to one key, so unrelated
 * edits (nav labels, stats) do not invalidate seven PDFs.
 * @type {{ key: string, file: string, pick?: string }[]}
 */
export const KIT_SOURCES = [
  { key: "doctrine", file: "data/doctrine.json" },
  { key: "educators", file: "data/educators.json" },
  { key: "roadmap", file: "data/roadmap.json" },
  { key: "stages", file: "data/stages.json" },
  { key: "standard", file: "data/site.json", pick: "standard" },
];

/**
 * The seven PDFs. `route` is what Playwright renders, `slug` is the file name
 * under public/kit/, `pages` is the sheet count the route must produce, and
 * `landscape` is the fallback page box for when preferCSSPageSize is ignored.
 *
 * `title` and `blurb` are page furniture for the /educators contents grid;
 * Phase 8 owns the final wording. The three run-sheets carry `title: null`
 * because their name comes from data/educators.json. Everything else printed
 * on a kit sheet is read from JSON — see BUILD_GUIDE.md.
 * @type {{ slug: string, route: string, landscape: boolean, pages: number,
 *          format: string, title: string | null, blurb: string,
 *          sessionId: string | null }[]}
 */
export const KIT_FILES = [
  {
    slug: "hirefromph-doctrine-one-pager",
    route: "/educators/kit/one-pager",
    landscape: false,
    pages: 1,
    format: "A4 portrait · 1 page",
    title: "The doctrine, one page",
    blurb: "The standard, the creed, and the six principles behind every page on this site.",
    sessionId: null,
  },
  {
    slug: "hirefromph-path-map",
    route: "/educators/kit/path-map",
    landscape: true,
    pages: 1,
    format: "A4 landscape · 1 page",
    title: "The path, mapped",
    blurb: "Five stages and eleven steps on one sheet, with what each stage asks of a learner.",
    sessionId: null,
  },
  {
    slug: "hirefromph-seven-methods",
    route: "/educators/kit/methods",
    landscape: false,
    pages: 2,
    format: "A4 portrait · 2 pages",
    title: "Seven methods",
    blurb: "FIND through GIVE, each with its steps and the drill a participant runs alone.",
    sessionId: null,
  },
  {
    slug: "hirefromph-session-deconstruct-resume",
    route: "/educators/kit/session/deconstruct-resume",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "deconstruct-resume",
  },
  {
    slug: "hirefromph-session-vet-opportunity",
    route: "/educators/kit/session/vet-opportunity",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "vet-opportunity",
  },
  {
    slug: "hirefromph-session-ask-well",
    route: "/educators/kit/session/ask-well",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "ask-well",
  },
  {
    slug: "hirefromph-slides",
    route: "/educators/kit/slides",
    landscape: true,
    pages: 16,
    format: "16:9 · 16 slides",
    title: "The slides",
    blurb: "Sixteen slides covering the doctrine, the path, the seven methods, and the licence.",
    sessionId: null,
  },
];

/**
 * Deterministic JSON: object keys sorted, array order kept, whitespace gone.
 * Sorting means a bundler that re-orders a JSON object's keys can never move
 * the hash, so the app side and the disk side always agree.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = /** @type {Record<string, unknown>} */ (value);
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

/**
 * sha256 (hex) of the canonical form of the kit's five sources.
 * @param {unknown} payload
 * @returns {string}
 */
export function hashKitPayload(payload) {
  return createHash("sha256").update(canonicalJson(payload), "utf8").digest("hex");
}

/**
 * Read the five sources straight off disk. Used by the two scripts and by the
 * unit test that pins the app-side hash to this one.
 * @param {string} [root]
 * @returns {Record<string, unknown>}
 */
export function readKitPayload(root = REPO_ROOT) {
  /** @type {Record<string, unknown>} */
  const payload = {};
  for (const source of KIT_SOURCES) {
    const parsed = JSON.parse(readFileSync(join(root, source.file), "utf8"));
    payload[source.key] = source.pick ? parsed[source.pick] : parsed;
  }
  return payload;
}
```

- [ ] **Step 4: Write `lib/kit.d.mts`**

TypeScript maps an import of `./kit.mjs` onto `./kit.d.mts`, and `tsconfig.include` already lists `**/*.mts`.

```ts
export type KitSourceRef = { key: string; file: string; pick?: string };

export type KitFile = {
  slug: string;
  route: string;
  landscape: boolean;
  pages: number;
  format: string;
  /** null on the three run-sheets, whose name comes from data/educators.json. */
  title: string | null;
  blurb: string;
  sessionId: string | null;
};

export declare const REPO_ROOT: string;
export declare const KIT_SOURCES: KitSourceRef[];
export declare const KIT_FILES: KitFile[];
export declare function canonicalJson(value: unknown): string;
export declare function hashKitPayload(payload: unknown): string;
export declare function readKitPayload(root?: string): Record<string, unknown>;
```

- [ ] **Step 5: Write `lib/educators.ts`**

```ts
/**
 * The typed door onto data/educators.json and the kit's content hash.
 *
 * SERVER ONLY (it reaches lib/kit.mjs, which imports node:crypto and node:fs).
 * Kit routes and /educators are server components; keep it that way.
 */
import doctrine from "@/data/doctrine.json";
import educators from "@/data/educators.json";
import roadmap from "@/data/roadmap.json";
import site from "@/data/site.json";
import stages from "@/data/stages.json";
import { KIT_FILES, hashKitPayload } from "./kit.mjs";

export { KIT_FILES };
export type { KitFile } from "./kit.mjs";

/** A citation on a kit sheet. PDFs have no hover, so the URL gets printed. */
export type KitSource = { label: string; url: string };

export type SessionStep = {
  minutes: number;
  title: string;
  facilitator: string;
  participants: string;
  /** A site route to open on the projector during this block. */
  tool?: string;
};

export type SessionMistake = { mistake: string; fix: string };

export type Session = {
  id: string;
  title: string;
  minutes: number;
  method: string;
  objectives: string[];
  setup: string[];
  steps: SessionStep[];
  prompts: string[];
  mistakes: SessionMistake[];
};

export type KitSlide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  source?: KitSource;
};

export type EducatorsIntro = {
  title: string;
  lead: string;
  whoFor: string[];
  honestyNote: string;
};

export type QuickStartStep = { n: number; title: string; desc: string };

export type KitLicense = {
  name: string;
  url: string;
  attribution: string;
  summary: string;
};

export const EDUCATORS_LAST_VERIFIED: string = educators.lastVerified;
export const EDUCATORS_INTRO = educators.intro as EducatorsIntro;
export const QUICK_START = educators.quickStart as QuickStartStep[];
export const SESSIONS = educators.sessions as Session[];
export const SLIDES = educators.slides as KitSlide[];
export const KIT_LICENSE = educators.license as KitLicense;

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((session) => session.id === id);
}

/** The timed blocks must add up to the length on the cover. A test asserts it. */
export function sessionMinutes(session: Session): number {
  return session.steps.reduce((total, step) => total + step.minutes, 0);
}

export function getKitFile(slug: string) {
  return KIT_FILES.find((file) => file.slug === slug);
}

/**
 * sha256 over the five JSON sources the kit renders. scripts/verify-kit.mjs
 * recomputes the same digest from disk and compares it with the stamp in
 * public/kit/manifest.json; a mismatch means the PDFs are stale.
 */
export function kitContentHash(): string {
  return hashKitPayload({
    doctrine,
    educators,
    roadmap,
    stages,
    standard: site.standard,
  });
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run lib/educators.test.ts`
Expected: PASS — 10 tests, 0 failed.

If `agrees with the on-disk payload…` fails, the two payload builders disagree on a key name. The five keys are exactly `doctrine`, `educators`, `roadmap`, `stages`, `standard` in both `KIT_SOURCES` and `kitContentHash()` — fix whichever drifted, never the test.

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint lib/educators.ts lib/educators.test.ts`
Expected: exit 0 from both, no output.

If `tsc` reports `Could not find a declaration file for module './kit.mjs'`, `lib/kit.d.mts` is missing or misnamed — it must sit beside `lib/kit.mjs` and end in `.d.mts`.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/kit.mjs lib/kit.d.mts lib/educators.ts lib/educators.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(educators): typed loader for the kit data and one shared content hash"
```

---

### Task 2: The `.kit` print scope and the kit shell layout

**Parallel group:** B

**Files:**
- Modify: `app/globals.css` (append a new block at the end of the file, after the `@media (prefers-reduced-motion: reduce)` block)
- Create: `app/educators/kit/layout.tsx`

**Interfaces:**
- Produces: the class contract every kit component and page below uses —
  `.kit` (document scope), `.kit-page` / `.kit-page--landscape` / `.kit-page--slide` / `.kit-page--navy` (one printed sheet), `.kit-body`, `.kit-foot`, `.kit-stack`, `.kit-head`, `.kit-h1` / `.kit-h2` / `.kit-h3`, `.kit-kicker`, `.kit-lead`, `.kit-small`, `.kit-note`, `.kit-num`, `.kit-url`, `.kit-card` / `.kit-card--tint`, `.kit-grid` / `--2` / `--3` / `--5`, `.kit-list`, `.kit-table`, `.kit-map`, `.kit-method`, `.kit-steps`, `.kit-drill`, `.kit-slide` / `--split`, `.kit-slide-title`, `.kit-slide-body`, `.kit-avoid`.
- Produces: `app/educators/kit/layout.tsx` → default export `KitLayout`, plus `export const metadata` with `robots: { index: false, follow: false }`.

**Two things worth reading before you start.**

1. **`@page` cannot be scoped to an element.** It is a document-level at-rule, so a landscape route and a portrait route cannot coexist in one stylesheet. That is why `app/globals.css` carries **no** `@page` rule at all, and why each kit route's first `<KitPage>` injects its own (Task 3).
2. **The root layout always mounts the shell.** `app/layout.tsx` renders `<a class="skip-link">`, `<SiteHeader>`, `<main>`, `<SiteFooter>` and `<BackToTop>` as direct children of `<body>`; a nested layout renders inside `<main>` and cannot unmount any of them. So the kit layout injects one `<style>` that hides the four shell elements with child combinators (`body > header`, never `body header`, so it can never reach a `<header>` inside a sheet). The kit components deliberately use `<div>`s rather than `<header>`/`<footer>` so this stays true even if someone edits them later.

- [ ] **Step 1: Append the print scope to `app/globals.css`**

Add this at the very end of the file:

```css
/* ------------------------------------------------------------------ */
/*  Educator kit — print sheets (spec §7.5)                            */
/*                                                                     */
/*  Every kit route paints one .kit-page element per printed sheet at   */
/*  exact paper dimensions, and `@page` carries margin 0 so the sheet   */
/*  itself owns the 14mm margin. Page breaks are authored, not          */
/*  discovered. There is no `@page` rule in this file on purpose: the   */
/*  at-rule is document-scoped, so each kit route declares its own      */
/*  paper size once (components/kit/kit-page.tsx).                     */
/*                                                                     */
/*  The site type scale is fluid (clamp + vw) and a paper box has no    */
/*  viewport to be fluid against, so the kit declares fixed point       */
/*  sizes. This is the one place in the codebase allowed to do that.    */
/* ------------------------------------------------------------------ */

.kit {
  --kit-pad: 14mm;
  --kit-rule: #d8d8e0;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 10.5pt;
  line-height: 1.45;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* One printed sheet. Heights sit a hair under the paper so Chromium's
   sub-pixel rounding never spills a blank page after every sheet.
   overflow:hidden makes a spill measurable (scrollHeight > clientHeight),
   which is what scripts/build-kit-pdf.mjs fails the build on. */
.kit-page {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 210mm;
  height: 296.5mm;
  padding: var(--kit-pad);
  margin: 0 auto;
  overflow: hidden;
  background: #ffffff;
}
.kit-page--landscape {
  width: 297mm;
  height: 209.5mm;
}
.kit-page--slide {
  width: 338.6mm;
  height: 190mm;
  padding: 18mm;
}
.kit-page--navy {
  background: var(--ink);
  color: var(--on-navy);
}

.kit-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* Children keep their natural height so an overflow is a real overflow
   rather than a silent flex squeeze. */
.kit-body > * {
  flex: 0 0 auto;
}
.kit-stack > * + * {
  margin-top: 5mm;
}

.kit-foot {
  margin-top: auto;
  padding-top: 4mm;
  border-top: 1px solid var(--kit-rule);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8mm;
  font-size: 7.5pt;
  color: var(--ink-faint);
}
.kit-page--navy .kit-foot {
  border-top-color: color-mix(in srgb, var(--on-navy) 25%, transparent);
  color: color-mix(in srgb, var(--on-navy) 75%, transparent);
}

/* Type ramp */
.kit-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 26pt;
  line-height: 1.08;
  letter-spacing: -0.01em;
}
.kit-h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15pt;
  line-height: 1.15;
}
.kit-h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11pt;
  line-height: 1.25;
}
.kit-kicker {
  font-size: 7.5pt;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}
.kit-page--navy .kit-kicker {
  color: var(--primary-soft);
}
.kit-lead {
  font-size: 11pt;
  line-height: 1.5;
  color: var(--ink-soft);
}
.kit-small {
  font-size: 9pt;
  line-height: 1.4;
  color: var(--ink-soft);
}
.kit-note {
  font-size: 8pt;
  line-height: 1.35;
  color: var(--ink-faint);
}
.kit-page--navy .kit-lead,
.kit-page--navy .kit-small,
.kit-page--navy .kit-note {
  color: color-mix(in srgb, var(--on-navy) 78%, transparent);
}
.kit-num {
  font-variant-numeric: tabular-nums;
}
/* A printed link is only as good as the URL beside it. */
.kit-url {
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  color: var(--primary);
}

/* Header block */
.kit-head {
  display: flex;
  align-items: flex-start;
  gap: 5mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid var(--kit-rule);
}
.kit-head__mark {
  flex: 0 0 auto;
  color: var(--ink);
}
.kit-page--navy .kit-head__mark {
  color: var(--on-navy);
}

/* Boxes and grids */
.kit-card {
  border: 1px solid var(--kit-rule);
  border-radius: 6px;
  padding: 4mm;
  background: #ffffff;
}
.kit-card--tint {
  background: var(--tint);
  border-color: color-mix(in srgb, var(--primary) 25%, #ffffff);
}
.kit-grid {
  display: grid;
  gap: 4mm;
}
.kit-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.kit-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.kit-grid--5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.kit-list {
  margin: 0;
  padding-left: 5mm;
  font-size: 9pt;
  line-height: 1.4;
  color: var(--ink-soft);
}
.kit-list > li + li {
  margin-top: 2mm;
}

/* Tables */
.kit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
}
.kit-table th {
  text-align: left;
  padding: 0 3mm 2mm 0;
  border-bottom: 1px solid var(--kit-rule);
  font-size: 7.5pt;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.kit-table td {
  vertical-align: top;
  padding: 3mm 3mm 3mm 0;
  border-bottom: 1px solid var(--line);
  line-height: 1.4;
}
.kit-table th:last-child,
.kit-table td:last-child {
  padding-right: 0;
}

/* Diagram box on the path map: 190mm keeps the journey map above its own
   560px minimum width while leaving room for the sheet below it. */
.kit-map {
  width: 190mm;
  margin: 0 auto;
}

/* Methods cheat-sheet */
.kit-method {
  display: grid;
  grid-template-columns: 56mm minmax(0, 1fr);
  gap: 6mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid var(--line);
}
.kit-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 8.5pt;
  line-height: 1.35;
  color: var(--ink-soft);
}
.kit-steps > li + li {
  margin-top: 1.5mm;
}
.kit-drill {
  margin-top: 2.5mm;
  padding-left: 3mm;
  border-left: 2px solid var(--primary);
  font-size: 8.5pt;
  line-height: 1.35;
}

/* Slides */
.kit-slide {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6mm;
}
.kit-slide--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
}
.kit-slide__media {
  border: 1px solid var(--kit-rule);
  border-radius: 6px;
  padding: 6mm;
  background: #ffffff;
}
.kit-slide-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 30pt;
  line-height: 1.06;
  letter-spacing: -0.015em;
}
.kit-slide-body {
  font-size: 14pt;
  line-height: 1.5;
  color: var(--ink-soft);
}
.kit-page--navy .kit-slide-body {
  color: color-mix(in srgb, var(--on-navy) 82%, transparent);
}

/* Screen: show the sheets on a soft desk so authoring matches the PDF. */
@media screen {
  .kit {
    padding: 24px 0;
    background: var(--band);
    overflow-x: auto;
  }
  .kit-page {
    border: 1px solid var(--line);
    box-shadow: var(--shadow-sm);
  }
  .kit-page + .kit-page {
    margin-top: 8mm;
  }
}

@media print {
  .kit {
    padding: 0;
    background: #ffffff;
  }
  .kit-page {
    margin: 0;
    border: 0;
    box-shadow: none;
    break-after: page;
  }
  .kit-page:last-child {
    break-after: auto;
  }
  .kit-avoid,
  .kit-card,
  .kit-method,
  .kit-table tr {
    break-inside: avoid;
  }
}
```

- [ ] **Step 2: Create `app/educators/kit/layout.tsx`**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The root layout always mounts the skip link, SiteHeader, SiteFooter and
 * BackToTop as direct children of <body>, and a nested layout renders inside
 * <main> — it cannot unmount any of them. So the kit shell hides them for the
 * documents it owns, with one <style> element that is only ever mounted on a
 * kit route.
 *
 * Child combinators (`body > header`) keep the rules from reaching anything
 * inside a sheet; kit components use <div>s rather than <header>/<footer> so
 * that stays true. BackToTop is the only <button> the shell puts on <body>.
 *
 * dangerouslySetInnerHTML, not a text child: React escapes text children, and
 * an escaped `>` would break the selectors.
 */
const HIDE_SITE_CHROME = `
body > header,
body > footer,
body > .skip-link,
body > button { display: none !important; }
`;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KitLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      <div data-kit className="kit">
        {children}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Check the CSS compiles and nothing else moved**

Run: `npx tsc --noEmit && npx eslint app/educators`
Expected: exit 0 from both, no output.

Run: `grep -c "@page" app/globals.css`
Expected: `0`. Any `@page` rule in the global stylesheet would fight the per-route declaration in Task 3.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/globals.css app/educators/kit/layout.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): print scope for paper sheets and a shell-free layout for kit routes"
```

---

### Task 3: The shared print components (`components/kit/`)

**Parallel group:** B

**Files:**
- Create: `components/kit/kit-page.tsx`, `components/kit/kit-header.tsx`, `components/kit/kit-table.tsx`, `components/kit/kit-footnote.tsx`, `components/kit/kit-licence.tsx`, `components/kit/slide.tsx`, `components/kit/index.ts`
- Test: `components/kit/kit-page.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `LogoMark` from `@/components/site/logo`; `KIT_LICENSE`, `type KitSource` from `@/lib/educators`.
- Produces (`components/kit/index.ts` is the barrel every kit route imports):
  - `export type KitPageSize = "a4" | "a4-landscape" | "slide"`
  - `export type KitPageProps = { size?: KitPageSize; n: number; of: number; navy?: boolean; className?: string; children: ReactNode }`; `export function KitPage(props: KitPageProps)`
  - `export type KitHeaderProps = { kicker: string; title: string; sub?: string; className?: string }`; `export function KitHeader(props: KitHeaderProps)`
  - `export type KitTableProps = { head: ReactNode[]; rows: ReactNode[][]; widths?: number[]; className?: string }`; `export function KitTable(props: KitTableProps)`
  - `export type KitFootnoteProps = { label: string; url: string; className?: string }`; `export function KitFootnote(props: KitFootnoteProps)`
  - `export type KitLicenceProps = { compact?: boolean; className?: string }`; `export function KitLicence(props: KitLicenceProps)`
  - `export type SlideProps = { kicker: string; title: string; body: string; source?: KitSource; media?: ReactNode; level?: 1 | 2; mark?: boolean }`; `export function Slide(props: SlideProps)`

All six are **server components**. None of them imports `Icon` (which is `"use client"`) — a print sheet should carry no JavaScript at all, so the only glyph on it is `LogoMark`, a plain server-rendered SVG.

**Why `KitPage` takes `n` and `of` instead of using CSS counters.** A `@page` margin box (`@bottom-center { content: counter(page) }`) is where page numbers belong, and Chromium's support for margin boxes has been inconsistent; a bare `counter(page)` outside one resolves to `0`. The route already knows both numbers, so it passes them, and the render test asserts the printed string.

- [ ] **Step 1: Write the failing test**

Create `components/kit/kit-page.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KitPage } from "@/components/kit/kit-page";
import { KIT_LICENSE } from "@/lib/educators";

describe("KitPage", () => {
  it("prints the licence attribution and the page number on every sheet", () => {
    render(
      <KitPage n={2} of={4}>
        <p>Run-sheet body</p>
      </KitPage>,
    );
    expect(screen.getByText(KIT_LICENSE.attribution)).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("declares the paper size once, on the first sheet only", () => {
    const { container: first } = render(
      <KitPage size="a4-landscape" n={1} of={2}>
        <p>one</p>
      </KitPage>,
    );
    const style = first.querySelector("style");
    expect(style?.innerHTML).toContain("@page");
    expect(style?.innerHTML).toContain("A4 landscape");
    expect(style?.innerHTML).toContain("margin: 0");

    const { container: second } = render(
      <KitPage size="a4-landscape" n={2} of={2}>
        <p>two</p>
      </KitPage>,
    );
    expect(second.querySelector("style")).toBeNull();
  });

  it("carries the size and navy modifiers on the sheet element", () => {
    const { container } = render(
      <KitPage size="slide" n={1} of={16} navy>
        <p>title slide</p>
      </KitPage>,
    );
    const sheet = container.querySelector(".kit-page");
    expect(sheet?.className).toContain("kit-page--slide");
    expect(sheet?.className).toContain("kit-page--navy");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/kit/kit-page.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/kit/kit-page"`.

- [ ] **Step 3: Write `components/kit/kit-page.tsx`**

```tsx
import type { ReactNode } from "react";
import { KIT_LICENSE } from "@/lib/educators";
import { cn } from "@/lib/utils";

export type KitPageSize = "a4" | "a4-landscape" | "slide";

/**
 * `@page` is document-scoped — the paper size cannot be set per element — so
 * sheet 1 declares it for the whole route and later sheets inherit it.
 * Margin is 0 because .kit-page draws its own 14mm padding, which is what lets
 * the route decide where each page ends.
 */
const PAGE_RULE: Record<KitPageSize, string> = {
  a4: "@page { size: A4 portrait; margin: 0; }",
  "a4-landscape": "@page { size: A4 landscape; margin: 0; }",
  // 13.333in × 7.5in, the standard 16:9 slide.
  slide: "@page { size: 338.6mm 190.5mm; margin: 0; }",
};

const SIZE_CLASS: Record<KitPageSize, string> = {
  a4: "",
  "a4-landscape": "kit-page--landscape",
  slide: "kit-page--slide",
};

export type KitPageProps = {
  size?: KitPageSize;
  /** 1-based sheet number within this document. */
  n: number;
  /** Total sheets in this document. */
  of: number;
  /** Navy ground, for the title slide. */
  navy?: boolean;
  className?: string;
  children: ReactNode;
};

export function KitPage({
  size = "a4",
  n,
  of,
  navy = false,
  className,
  children,
}: KitPageProps) {
  return (
    <>
      {n === 1 && <style dangerouslySetInnerHTML={{ __html: PAGE_RULE[size] }} />}
      <section
        className={cn("kit-page", SIZE_CLASS[size], navy && "kit-page--navy", className)}
      >
        <div className="kit-body kit-stack">{children}</div>
        <div className="kit-foot">
          <span>{KIT_LICENSE.attribution}</span>
          <span className="kit-num">
            {n} / {of}
          </span>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Write `components/kit/kit-header.tsx`**

```tsx
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export type KitHeaderProps = {
  kicker: string;
  title: string;
  /** One line under the title: the session's length and method, or a creed. */
  sub?: string;
  className?: string;
};

/**
 * The masthead on every printed sheet. `mono` draws the ladder mark in
 * currentColor, so it survives one-colour printing and the navy slide alike.
 * A <div>, not a <header>: the kit layout hides `body > header`.
 */
export function KitHeader({ kicker, title, sub, className }: KitHeaderProps) {
  return (
    <div className={cn("kit-head kit-avoid", className)}>
      <span className="kit-head__mark">
        <LogoMark size={26} mono />
      </span>
      <div>
        <p className="kit-kicker">{kicker}</p>
        <h1 className="kit-h1">{title}</h1>
        {sub && <p className="kit-small">{sub}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write `components/kit/kit-table.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KitTableProps = {
  head: ReactNode[];
  rows: ReactNode[][];
  /** Column widths in percent, one per column. */
  widths?: number[];
  className?: string;
};

/** Timed run-sheet steps and mistake/fix pairs. Rows never break across pages. */
export function KitTable({ head, rows, widths, className }: KitTableProps) {
  return (
    <table className={cn("kit-table", className)}>
      {widths && (
        <colgroup>
          {widths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}%` }} />
          ))}
        </colgroup>
      )}
      <thead>
        <tr>
          {head.map((cell, index) => (
            <th key={`th-${index}`} scope="col">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`tr-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <td key={`td-${rowIndex}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 6: Write `components/kit/kit-footnote.tsx`**

```tsx
import { cn } from "@/lib/utils";

export type KitFootnoteProps = {
  label: string;
  url: string;
  className?: string;
};

/**
 * A citation on paper. The URL is printed in full as well as linked, because a
 * PDF has no hover and a bare link label is an unsourced claim once it prints.
 */
export function KitFootnote({ label, url, className }: KitFootnoteProps) {
  return (
    <p className={cn("kit-note kit-avoid", className)}>
      Source: {label} —{" "}
      <a href={url} className="kit-url">
        {url}
      </a>
    </p>
  );
}
```

- [ ] **Step 7: Write `components/kit/kit-licence.tsx`**

```tsx
import { KIT_LICENSE } from "@/lib/educators";
import { cn } from "@/lib/utils";

export type KitLicenceProps = {
  /** One line, for sheets with no room for the block. */
  compact?: boolean;
  className?: string;
};

/**
 * "How to use and cite this" — spec §7.5 puts it on the last page of every
 * PDF. Copy comes from data/educators.json.license; the URL prints in full.
 */
export function KitLicence({ compact = false, className }: KitLicenceProps) {
  if (compact) {
    return (
      <p className={cn("kit-note kit-avoid", className)}>
        {KIT_LICENSE.attribution}. Share and adapt with credit —{" "}
        <a href={KIT_LICENSE.url} className="kit-url">
          {KIT_LICENSE.url}
        </a>
      </p>
    );
  }

  return (
    <div className={cn("kit-card kit-card--tint kit-avoid", className)}>
      <p className="kit-kicker">How to use and cite this</p>
      <p className="kit-small">{KIT_LICENSE.summary}</p>
      <p className="kit-note">
        Credit: {KIT_LICENSE.attribution}. Licence {KIT_LICENSE.name} —{" "}
        <a href={KIT_LICENSE.url} className="kit-url">
          {KIT_LICENSE.url}
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Write `components/kit/slide.tsx`**

```tsx
import type { ReactNode } from "react";
import { LogoMark } from "@/components/site/logo";
import type { KitSource } from "@/lib/educators";
import { cn } from "@/lib/utils";
import { KitFootnote } from "./kit-footnote";

export type SlideProps = {
  kicker: string;
  title: string;
  body: string;
  source?: KitSource;
  /** A diagram column. Splits the slide in two when present. */
  media?: ReactNode;
  /** The deck's first slide carries the document's only h1. */
  level?: 1 | 2;
  /** Ladder mark above the kicker — the title slide only. */
  mark?: boolean;
};

export function Slide({
  kicker,
  title,
  body,
  source,
  media,
  level = 2,
  mark = false,
}: SlideProps) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("kit-slide", media && "kit-slide--split")}>
      <div>
        {mark && (
          <p className="kit-head__mark">
            <LogoMark size={40} mono />
          </p>
        )}
        <p className="kit-kicker">{kicker}</p>
        <Tag className="kit-slide-title">{title}</Tag>
        <p className="kit-slide-body">{body}</p>
        {source && <KitFootnote label={source.label} url={source.url} />}
      </div>
      {media && <div className="kit-slide__media">{media}</div>}
    </div>
  );
}
```

- [ ] **Step 9: Write the barrel `components/kit/index.ts`**

```ts
export { KitFootnote, type KitFootnoteProps } from "./kit-footnote";
export { KitHeader, type KitHeaderProps } from "./kit-header";
export { KitLicence, type KitLicenceProps } from "./kit-licence";
export { KitPage, type KitPageProps, type KitPageSize } from "./kit-page";
export { KitTable, type KitTableProps } from "./kit-table";
export { Slide, type SlideProps } from "./slide";
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `npx vitest run components/kit/kit-page.test.tsx`
Expected: PASS — 3 tests, 0 failed.

- [ ] **Step 11: Type-check, lint, and confirm no client code reached the kit**

Run: `npx tsc --noEmit && npx eslint components/kit`
Expected: exit 0 from both, no output.

Run: `grep -rn "use client\|@/components/ui\b" components/kit`
Expected: no output. A print sheet ships no JavaScript, and the `.kit` scope — not the primitives — owns its type.

- [ ] **Step 12: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/kit
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): six shared print components for the educator sheets"
```

---

### Task 4: `one-pager` — the doctrine on one A4 portrait sheet

**Parallel group:** C

**Files:**
- Create: `app/educators/kit/one-pager/page.tsx`

**Interfaces:**
- Consumes: `KitFootnote`, `KitHeader`, `KitLicence`, `KitPage` from `@/components/kit`; `doctrine` from `@/data/doctrine.json`; `site.standard` from `@/data/site.json`.
- Produces: route `/educators/kit/one-pager`, exactly **1** `.kit-page` element (`KIT_FILES` records `pages: 1`).

Source of truth: `doctrine.json` (`creed`, `principles`, `whyItMatters`) and `site.json.standard` (`kicker`, `title`, `body`, `principles`). Not one sentence on this sheet is written here.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import doctrine from "@/data/doctrine.json";
import site from "@/data/site.json";

export const metadata: Metadata = { title: "Kit · The doctrine, one page" };

export default function DoctrineOnePagerSheet() {
  const standard = site.standard;

  return (
    <KitPage size="a4" n={1} of={1}>
      <KitHeader kicker="Educator kit · One-pager" title={standard.title} sub={standard.kicker} />

      <p className="kit-lead">{standard.body}</p>

      <div className="kit-grid kit-grid--3">
        {standard.principles.map((principle) => (
          <div key={principle.title} className="kit-card">
            <h2 className="kit-h3">{principle.title}</h2>
            <p className="kit-small">{principle.desc}</p>
          </div>
        ))}
      </div>

      <div className="kit-card kit-card--tint">
        <p className="kit-kicker">The creed</p>
        <p className="kit-h2">{doctrine.creed}</p>
      </div>

      <div className="kit-grid kit-grid--2">
        {doctrine.principles.map((principle) => (
          <div key={principle.n} className="kit-card">
            <p className="kit-kicker kit-num">{String(principle.n).padStart(2, "0")}</p>
            <h3 className="kit-h3">{principle.title}</h3>
            <p className="kit-small">{principle.desc}</p>
          </div>
        ))}
      </div>

      <div className="kit-card">
        <p className="kit-kicker">Why it matters</p>
        <p className="kit-small">{doctrine.whyItMatters}</p>
      </div>

      <KitLicence compact />
    </KitPage>
  );
}
```

- [ ] **Step 2: Build and look at it**

Run: `npm run build`
Expected: exit 0, and `/educators/kit/one-pager` in the route table as a static route.

Run: `npm run dev` then open `http://localhost:3000/educators/kit/one-pager`.
Expected: one white A4 sheet centred on a lavender desk, no site header, no footer, no back-to-top button. Everything sits inside the sheet with a visible gap above the licence line — if any text is cut off at the bottom edge, the sheet is over-full and Task 12 will fail the build; shorten nothing, instead move "Why it matters" into the same card as the creed.

- [ ] **Step 3: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/educators/kit/one-pager/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): doctrine one-pager sheet"
```

---

### Task 5: `path-map` — five stages and eleven steps on one A4 landscape sheet

**Parallel group:** C

**Files:**
- Create: `app/educators/kit/path-map/page.tsx`

**Interfaces:**
- Consumes: `KitHeader`, `KitLicence`, `KitPage` from `@/components/kit`; `JourneyMap` from `@/components/diagrams`; `stages` from `@/data/stages.json`; `roadmap` from `@/data/roadmap.json`.
- Produces: route `/educators/kit/path-map`, exactly **1** `.kit-page` element with `size="a4-landscape"`.

`JourneyMap` is a server component that reads `var(--ink)`, `var(--primary)` and friends, so it prints in the kit's colours with `printBackground: true` and no extra work. Its own `minWidth` is 560px (≈148mm); the `.kit-map` box is 190mm, so it renders at full width and about 59mm tall.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import { JourneyMap } from "@/components/diagrams";
import roadmap from "@/data/roadmap.json";
import stages from "@/data/stages.json";

export const metadata: Metadata = { title: "Kit · The path, mapped" };

export default function PathMapSheet() {
  return (
    <KitPage size="a4-landscape" n={1} of={1}>
      <KitHeader
        kicker="Educator kit · The path"
        title="Five stages, eleven steps"
        sub={roadmap.intro}
      />

      <div className="kit-map">
        <JourneyMap />
      </div>

      <div className="kit-grid kit-grid--5">
        {stages.map((stage) => (
          <div key={stage.id} className="kit-card">
            <p className="kit-kicker kit-num">{stage.kicker}</p>
            <h2 className="kit-h3">{stage.title}</h2>
            <p className="kit-note">
              {stage.role} · {stage.steps}
            </p>
            <p className="kit-small">{stage.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="kit-grid kit-grid--3">
        {roadmap.steps.map((step) => (
          <p key={step.n} className="kit-small">
            <span className="kit-num kit-kicker">{String(step.n).padStart(2, "0")}</span>{" "}
            <strong>{step.title}</strong> — {step.desc}
          </p>
        ))}
      </div>

      <KitLicence compact />
    </KitPage>
  );
}
```

- [ ] **Step 2: Build and look at it**

Run: `npm run build`
Expected: exit 0, `/educators/kit/path-map` listed as static.

Open `http://localhost:3000/educators/kit/path-map`.
Expected: one landscape sheet: masthead, the journey map, a five-column stage row, then eleven numbered steps in three columns, then the one-line licence. The sheet scrolls sideways on a narrow window (`.kit { overflow-x: auto }`) — that is screen-only and does not affect the PDF.

- [ ] **Step 3: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/educators/kit/path-map/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): landscape path map sheet"
```

---

### Task 6: `methods` — the seven-method cheat-sheet, two A4 portrait sheets

**Parallel group:** C

**Files:**
- Create: `app/educators/kit/methods/page.tsx`

**Interfaces:**
- Consumes: `KitHeader`, `KitLicence`, `KitPage` from `@/components/kit`; `doctrine` from `@/data/doctrine.json`.
- Produces: route `/educators/kit/methods`, exactly **2** `.kit-page` elements (`KIT_FILES` records `pages: 2`).

Four methods on sheet 1, three plus the licence block on sheet 2. `METHODS_PER_SHEET` is the only knob: if the overflow guard in Task 12 fires on this route, lower it to 3 and set `KIT_FILES` `pages: 3`.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import doctrine from "@/data/doctrine.json";

export const metadata: Metadata = { title: "Kit · Seven methods" };

/** Lower this if a sheet overflows; keep KIT_FILES `pages` in step. */
const METHODS_PER_SHEET = 4;

export default function MethodsSheet() {
  const sheets: (typeof doctrine.methods)[] = [];
  for (let i = 0; i < doctrine.methods.length; i += METHODS_PER_SHEET) {
    sheets.push(doctrine.methods.slice(i, i + METHODS_PER_SHEET));
  }

  return (
    <>
      {sheets.map((methods, sheetIndex) => (
        <KitPage key={`sheet-${sheetIndex}`} size="a4" n={sheetIndex + 1} of={sheets.length}>
          <KitHeader
            kicker="Educator kit · Cheat-sheet"
            title="Seven methods"
            sub={sheetIndex === 0 ? doctrine.title : "Continued"}
          />

          {methods.map((method, index) => (
            <div key={method.id} className="kit-method">
              <div>
                <p className="kit-kicker kit-num">
                  Method {String(sheetIndex * METHODS_PER_SHEET + index + 1).padStart(2, "0")}
                </p>
                <h2 className="kit-h2">{method.name}</h2>
                <p className="kit-note">{method.tagline}</p>
                <p className="kit-small">{method.summary}</p>
              </div>
              <div>
                <ol className="kit-steps">
                  {method.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}.</strong> {step.desc}
                    </li>
                  ))}
                </ol>
                <p className="kit-drill">
                  <span className="kit-kicker">Drill</span> {method.drill}
                </p>
              </div>
            </div>
          ))}

          {sheetIndex === sheets.length - 1 && <KitLicence />}
        </KitPage>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Build and count the sheets**

Run: `npm run build`
Expected: exit 0.

Open `http://localhost:3000/educators/kit/methods` and run this in the browser console:
```js
document.querySelectorAll(".kit-page").length
```
Expected: `2`. It must equal the `pages` value for `hirefromph-seven-methods` in `lib/kit.mjs`.

- [ ] **Step 3: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/educators/kit/methods/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): seven-method cheat-sheet with the drill for each"
```

---

### Task 7: `session/[id]` — the three workshop run-sheets, four A4 portrait sheets each

**Parallel group:** C

**Files:**
- Create: `app/educators/kit/session/[id]/page.tsx`

**Interfaces:**
- Consumes: `KitHeader`, `KitLicence`, `KitPage`, `KitTable` from `@/components/kit`; `SESSIONS`, `getSession`, `type SessionStep` from `@/lib/educators`; `notFound` from `next/navigation`.
- Produces: routes `/educators/kit/session/deconstruct-resume`, `…/vet-opportunity`, `…/ask-well`, each with exactly **4** `.kit-page` elements. `export const dynamicParams = false` and `generateStaticParams()` from `SESSIONS` mean nothing else is reachable.

Pagination is deterministic, not discovered: sheet 1 is the cover (objectives + room setup), sheets 2..n carry `STEPS_PER_SHEET` timed blocks each, and the last sheet carries the discussion prompts, the common mistakes and the licence. All three sessions have seven steps, so `2 + ceil(7 / 4) = 4` sheets.

Next 16 passes `params` as a Promise; both the page and `generateMetadata` await it.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitHeader, KitLicence, KitPage, KitTable } from "@/components/kit";
import { SESSIONS, getSession, type SessionStep } from "@/lib/educators";

/** Only the three authored sessions exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SESSIONS.map((session) => ({ id: session.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = getSession(id);
  return { title: session ? `Kit · ${session.title}` : "Kit · Run-sheet" };
}

/** Lower this if a steps sheet overflows; keep KIT_FILES `pages` in step. */
const STEPS_PER_SHEET = 4;

function chunk(steps: SessionStep[], size: number): SessionStep[][] {
  const out: SessionStep[][] = [];
  for (let i = 0; i < steps.length; i += size) out.push(steps.slice(i, i + size));
  return out;
}

export default async function SessionRunSheet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const stepSheets = chunk(session.steps, STEPS_PER_SHEET);
  const total = 2 + stepSheets.length;
  const sub = `${session.method} · ${session.minutes} minutes · ${session.steps.length} timed blocks`;

  return (
    <>
      <KitPage size="a4" n={1} of={total}>
        <KitHeader kicker="Educator kit · Run-sheet" title={session.title} sub={sub} />

        <div className="kit-card kit-card--tint">
          <p className="kit-kicker">What participants leave with</p>
          <ol className="kit-list">
            {session.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </div>

        <div className="kit-card">
          <p className="kit-kicker">Room, materials, and what to open</p>
          <ul className="kit-list">
            {session.setup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </KitPage>

      {stepSheets.map((steps, sheetIndex) => {
        const offset = sheetIndex * STEPS_PER_SHEET;
        return (
          <KitPage key={`steps-${sheetIndex}`} size="a4" n={sheetIndex + 2} of={total}>
            <KitHeader
              kicker={`Educator kit · Timed steps ${sheetIndex + 1} of ${stepSheets.length}`}
              title={session.title}
              sub={sub}
            />
            <KitTable
              widths={[8, 22, 38, 32]}
              head={["Minutes", "Step", "Facilitator", "Participants"]}
              rows={steps.map((step, index) => [
                <span key="m" className="kit-num">
                  {step.minutes}
                </span>,
                <span key="t">
                  <strong>
                    {offset + index + 1}. {step.title}
                  </strong>
                  {step.tool && (
                    <>
                      <br />
                      <a href={step.tool} className="kit-url">
                        hirefrom.ph{step.tool}
                      </a>
                    </>
                  )}
                </span>,
                step.facilitator,
                step.participants,
              ])}
            />
          </KitPage>
        );
      })}

      <KitPage size="a4" n={total} of={total}>
        <KitHeader
          kicker="Educator kit · Prompts and pitfalls"
          title={session.title}
          sub={sub}
        />

        <div className="kit-card">
          <p className="kit-kicker">Discussion prompts</p>
          <ul className="kit-list">
            {session.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="kit-kicker">Common facilitator mistakes</p>
          <KitTable
            widths={[40, 60]}
            head={["Mistake", "Fix"]}
            rows={session.mistakes.map((mistake) => [mistake.mistake, mistake.fix])}
          />
        </div>

        <KitLicence />
      </KitPage>
    </>
  );
}
```

- [ ] **Step 2: Build and check all three params prerendered**

Run: `npm run build`
Expected: exit 0, and the route table shows `/educators/kit/session/[id]` with its three generated paths (`deconstruct-resume`, `vet-opportunity`, `ask-well`) as static.

- [ ] **Step 3: Count the sheets on each session**

Open each of the three URLs and run in the console:
```js
document.querySelectorAll(".kit-page").length
```
Expected: `4` on all three. Each must equal the `pages` value for its `hirefromph-session-*` entry in `lib/kit.mjs`.

- [ ] **Step 4: Check a bad id 404s**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/educators/kit/session/nope`
Expected: `404`.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add "app/educators/kit/session/[id]/page.tsx"
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): workshop run-sheets with timed steps, prompts and mistakes"
```

---

### Task 8: `slides` — sixteen 16:9 sheets

**Parallel group:** C

**Files:**
- Create: `app/educators/kit/slides/page.tsx`

**Interfaces:**
- Consumes: `KitPage`, `Slide` from `@/components/kit`; `JourneyMap`, `MethodLoop` from `@/components/diagrams`; `SLIDES` from `@/lib/educators`.
- Produces: route `/educators/kit/slides`, exactly **16** `.kit-page` elements at `size="slide"`.

One `KitPage` per entry in `data/educators.json.slides`, in authored order. The title slide is navy and carries the mark and the deck's only `h1`. Two slides earn a diagram: `stages` gets `JourneyMap` (the same five-stage line the path map prints) and `method-give` gets `MethodLoop`, because the seventh method is the point at which the whole loop is finally on the table. Both fit: the split layout gives each column about 150mm, and the two diagrams render at roughly 47mm and 53mm tall.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KitPage, Slide } from "@/components/kit";
import { JourneyMap, MethodLoop } from "@/components/diagrams";
import { SLIDES } from "@/lib/educators";

export const metadata: Metadata = { title: "Kit · The slides" };

/**
 * Two slides carry a diagram. Keyed by slide id so re-ordering the deck in
 * data/educators.json moves the diagram with its slide.
 */
const SLIDE_MEDIA: Record<string, ReactNode> = {
  stages: <JourneyMap />,
  "method-give": <MethodLoop />,
};

export default function SlidesDeck() {
  return (
    <>
      {SLIDES.map((slide, index) => (
        <KitPage
          key={slide.id}
          size="slide"
          n={index + 1}
          of={SLIDES.length}
          navy={slide.id === "title"}
        >
          <Slide
            kicker={slide.kicker}
            title={slide.title}
            body={slide.body}
            source={slide.source}
            media={SLIDE_MEDIA[slide.id]}
            level={index === 0 ? 1 : 2}
            mark={index === 0}
          />
        </KitPage>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Build and count the slides**

Run: `npm run build`
Expected: exit 0, `/educators/kit/slides` static.

Open `http://localhost:3000/educators/kit/slides` and run in the console:
```js
document.querySelectorAll(".kit-page").length
```
Expected: `16`.

- [ ] **Step 3: Check the navy title slide and the two diagrams**

Expected on screen: slide 1 is navy with the ladder mark, a violet kicker, and legible on-navy body text; slide 5 (`Five stages, one line`) shows the journey map beside its text; slide 13 (`GIVE`) shows the method loop; slide 16 (`CC BY 4.0, with attribution`) prints the Creative Commons URL in full under the body.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/educators/kit/slides/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): sixteen-slide deck at 16:9"
```

---

### Task 9: `scripts/build-kit-pdf.mjs` — render the seven routes to `public/kit/*.pdf`

**Parallel group:** D

**Files:**
- Create: `scripts/build-kit-pdf.mjs`
- Modify: `package.json` (`kit:build` script, `playwright` devDependency)

**Interfaces:**
- Consumes: `KIT_FILES`, `REPO_ROOT`, `hashKitPayload`, `readKitPayload` from `../lib/kit.mjs`; `chromium` from `playwright`.
- Produces: `public/kit/<slug>.pdf` × 7 and `public/kit/manifest.json` shaped `{ hash: string, builtAt: "YYYY-MM-DD", files: [{ slug, file, route, pages, bytes }] }`. Exit code 0 on success, 1 on any failure.

**Two limitations, stated up front.**

1. **Playwright cannot write PDF metadata.** `page.pdf()` exposes no hook for the Info dictionary or an XMP packet, so the content hash cannot live inside the file the way spec §7.5 imagined. It is stamped into `public/kit/manifest.json` beside the PDFs instead, and `verify:kit` reads it from there. The manifest is committed with the PDFs, so the pair travels together.
2. **`next start` needs a build.** The script renders the production server, not `next dev`, so a stale or missing `.next` gives silently stale PDFs. It refuses to run without `.next/BUILD_ID` and tells you to run `npm run build`.

- [ ] **Step 1: Install Playwright and its Chromium**

Run:
```bash
npm i -D playwright
npx playwright install chromium
```
Expected: `playwright` lands in `devDependencies`; the second command downloads Chromium (or prints that it is already present, if the npm install already fetched it — it is a no-op either way). This browser download is a **one-time manual step per machine**; it is documented in `README.md` in Task 15 and the script fails with that exact instruction when the browser is missing.

- [ ] **Step 2: Add the `kit:build` script**

In `package.json`, add one line to `scripts`, after `"images:optimize"`:

```json
    "kit:build": "node scripts/build-kit-pdf.mjs"
```

- [ ] **Step 3: Write `scripts/build-kit-pdf.mjs`**

```js
#!/usr/bin/env node
/**
 * kit:build — render every /educators/kit/* route to a PDF in public/kit/.
 *
 *   npm run build && npm run kit:build
 *
 * Why a production server and not `next dev`: dev renders through a different
 * pipeline (no font optimisation, no static generation) and the PDFs would not
 * match what visitors print. The script refuses to run without a build.
 *
 * Why the manifest: page.pdf() gives no hook for the PDF Info dictionary or an
 * XMP packet, so Playwright cannot stamp the content hash inside the file. It
 * is written to public/kit/manifest.json beside the PDFs, and scripts/
 * verify-kit.mjs compares it against a freshly computed hash.
 *
 * Exits 1 on: no build, a server that will not answer, a missing Chromium, a
 * sheet whose content overflows its paper box, a sheet count that disagrees
 * with lib/kit.mjs, or any write error.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { chromium } from "playwright";
import { KIT_FILES, REPO_ROOT, hashKitPayload, readKitPayload } from "../lib/kit.mjs";

const OUT_DIR = join(REPO_ROOT, "public", "kit");
const NEXT_BIN = join(REPO_ROOT, "node_modules", "next", "dist", "bin", "next");

function fail(message) {
  console.error(`kit:build failed — ${message}`);
  process.exit(1);
}

/** Ask the OS for a port nobody is using, then hand it straight to Next. */
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(base, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(2_000) });
      if (response.status < 500) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`next start did not answer on ${base} within ${timeoutMs}ms`);
}

/** child.kill() does not reap the tree on Windows; taskkill does. */
function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

async function main() {
  if (!existsSync(join(REPO_ROOT, ".next", "BUILD_ID"))) {
    fail("no production build found. Run `npm run build` first.");
  }

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [NEXT_BIN, "start", "--port", String(port)], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  server.stdout.on("data", (chunk) => {
    serverLog += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverLog += chunk;
  });

  let browser;
  const problems = [];
  const files = [];

  try {
    await waitForServer(base);

    try {
      browser = await chromium.launch();
    } catch (error) {
      throw new Error(
        `could not launch Chromium (${error.message}). Run \`npx playwright install chromium\` once per machine.`,
      );
    }

    mkdirSync(OUT_DIR, { recursive: true });
    const page = await browser.newPage();

    for (const file of KIT_FILES) {
      const url = `${base}${file.route}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) {
        problems.push(`${file.route} returned ${response ? response.status() : "no response"}`);
        continue;
      }

      // Measure the sheets the way they will print, not the way they look.
      await page.emulateMedia({ media: "print" });

      const sheets = await page.$$eval(".kit-page", (nodes) =>
        nodes.map((node, index) => ({
          n: index + 1,
          overflow: node.scrollHeight - node.clientHeight,
        })),
      );

      if (sheets.length !== file.pages) {
        problems.push(
          `${file.route} rendered ${sheets.length} sheet(s); lib/kit.mjs expects ${file.pages}`,
        );
      }

      // .kit-page is overflow:hidden, so a spill would print as a silent crop.
      for (const sheet of sheets.filter((s) => s.overflow > 2)) {
        problems.push(
          `${file.route} sheet ${sheet.n} overflows its paper box by ${sheet.overflow}px — shorten the sheet or raise its page count`,
        );
      }

      const buffer = await page.pdf({
        // preferCSSPageSize wins; format/landscape are the fallback box.
        format: "A4",
        landscape: file.landscape,
        printBackground: true,
        preferCSSPageSize: true,
      });

      const target = join(OUT_DIR, `${file.slug}.pdf`);
      writeFileSync(target, buffer);
      files.push({
        slug: file.slug,
        file: `kit/${file.slug}.pdf`,
        route: file.route,
        pages: file.pages,
        bytes: buffer.byteLength,
      });
      console.log(`  ${file.slug}.pdf — ${sheets.length} sheet(s), ${buffer.byteLength} bytes`);

      await page.emulateMedia({ media: null });
    }
  } catch (error) {
    stopServer(server);
    if (browser) await browser.close();
    console.error(serverLog.trim().slice(-2000));
    fail(error.message);
  }

  if (browser) await browser.close();
  stopServer(server);

  if (problems.length) {
    for (const problem of problems) console.error(`- ${problem}`);
    fail(`${problems.length} sheet problem(s).`);
  }

  const manifest = {
    hash: hashKitPayload(readKitPayload(REPO_ROOT)),
    builtAt: new Date().toISOString().slice(0, 10),
    files,
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `kit:build wrote ${files.length} PDF(s) to public/kit/ at hash ${manifest.hash.slice(0, 12)}…`,
  );
}

main().catch((error) => fail(error.message));
```

- [ ] **Step 4: Sanity-check the script's guards without a build**

Run:
```bash
mv .next .next-hold && node scripts/build-kit-pdf.mjs; mv .next-hold .next
```
Expected: `kit:build failed — no production build found. Run \`npm run build\` first.` and exit 1. (If `.next` does not exist yet, the first `mv` errors harmlessly and the guard still fires.)

- [ ] **Step 5: Lint**

Run: `npx eslint scripts/build-kit-pdf.mjs`
Expected: exit 0, no output.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/build-kit-pdf.mjs package.json package-lock.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): render the kit routes to PDF with Playwright Chromium"
```

---

### Task 10: `scripts/verify-kit.mjs` — the staleness gate

**Parallel group:** D

**Files:**
- Create: `scripts/verify-kit.mjs`
- Modify: `package.json` (`verify:kit` script, appended to `verify:all`)

**Interfaces:**
- Consumes: `KIT_FILES`, `REPO_ROOT`, `hashKitPayload`, `readKitPayload` from `../lib/kit.mjs`.
- Produces: exit 0 when every PDF is present and the manifest hash matches the JSON on disk; exit 1 with `Run \`npm run kit:build\`.` otherwise.

The byte-level checks are best-effort by design: Chromium may pack page and font dictionaries into compressed object streams, in which case the plain-text scan finds nothing. A scan that finds nothing prints a note; a scan that finds a *wrong* count fails. `pdfinfo` / `pdffonts` remain the ground truth and are used in Task 16.

- [ ] **Step 1: Write `scripts/verify-kit.mjs`**

```js
#!/usr/bin/env node
/**
 * verify:kit — are the committed PDFs still the ones this JSON produces?
 *
 * Recomputes the content hash from data/{educators,doctrine,stages,roadmap}.json
 * and data/site.json#standard, compares it with the stamp in
 * public/kit/manifest.json, and checks every file listed in lib/kit.mjs.
 *
 * Playwright cannot write PDF metadata, so the hash lives in the manifest
 * beside the files rather than inside them. Commit the two together.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { KIT_FILES, REPO_ROOT, hashKitPayload, readKitPayload } from "../lib/kit.mjs";

const OUT_DIR = join(REPO_ROOT, "public", "kit");
const MANIFEST = join(OUT_DIR, "manifest.json");
const REBUILD = "Run `npm run build && npm run kit:build`, then commit public/kit/.";

const problems = [];
const notes = [];

function pdfPageCount(buffer) {
  // Uncompressed page dictionaries only; /Pages must not match.
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  return matches ? matches.length : 0;
}

function pdfBaseFonts(buffer) {
  const matches = buffer.toString("latin1").matchAll(/\/BaseFont\s*\/([#\w+.-]+)/g);
  return [...new Set([...matches].map((match) => match[1]))];
}

if (!existsSync(MANIFEST)) {
  console.error(`verify:kit failed — public/kit/manifest.json is missing. ${REBUILD}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const expected = hashKitPayload(readKitPayload(REPO_ROOT));

if (manifest.hash !== expected) {
  problems.push(
    `content hash mismatch: manifest has ${String(manifest.hash).slice(0, 12)}…, the JSON now hashes to ${expected.slice(0, 12)}…`,
  );
}

for (const file of KIT_FILES) {
  const path = join(OUT_DIR, `${file.slug}.pdf`);

  if (!existsSync(path)) {
    problems.push(`public/kit/${file.slug}.pdf is missing`);
    continue;
  }
  if (statSync(path).size === 0) {
    problems.push(`public/kit/${file.slug}.pdf is empty`);
    continue;
  }

  const buffer = readFileSync(path);
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    problems.push(`public/kit/${file.slug}.pdf has no %PDF- header`);
    continue;
  }

  const entry = (manifest.files ?? []).find((candidate) => candidate.slug === file.slug);
  if (!entry) {
    problems.push(`${file.slug} is not listed in the manifest`);
  } else if (entry.pages !== file.pages) {
    problems.push(
      `${file.slug}: manifest says ${entry.pages} page(s), lib/kit.mjs says ${file.pages}`,
    );
  }

  const pages = pdfPageCount(buffer);
  if (pages === 0) {
    notes.push(`${file.slug}: page objects are compressed; use pdfinfo to confirm ${file.pages}`);
  } else if (pages !== file.pages) {
    problems.push(`${file.slug}: PDF holds ${pages} page(s), expected ${file.pages}`);
  }

  const fonts = pdfBaseFonts(buffer);
  const subsets = fonts.filter((name) => /^[A-Z]{6}\+/.test(name));
  if (fonts.length === 0) {
    notes.push(`${file.slug}: font dictionaries are compressed; use pdffonts to confirm embedding`);
  } else if (subsets.length < 2) {
    problems.push(
      `${file.slug}: expected at least two embedded subset fonts, found ${fonts.join(", ") || "none"}`,
    );
  } else if (!subsets.some((name) => /cabinet/i.test(name)) || !subsets.some((name) => /inter/i.test(name))) {
    notes.push(`${file.slug}: embedded fonts are ${subsets.join(", ")} — record the real PostScript names if these are the display and text faces`);
  }
}

for (const note of notes) console.log(`  note: ${note}`);

if (problems.length) {
  console.error(`verify:kit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  console.error(REBUILD);
  process.exit(1);
}

console.log(
  `verify:kit passed: ${KIT_FILES.length} PDFs at hash ${expected.slice(0, 12)}… built ${manifest.builtAt}.`,
);
```

- [ ] **Step 2: Add the scripts to `package.json`**

Add one line to `scripts` after `"verify:primitives"`:

```json
    "verify:kit": "node scripts/verify-kit.mjs",
```

and append `verify:kit` to `verify:all`, so the whole line becomes:

```json
    "verify:all": "npm run verify:contrast && npm run verify:claims && npm run lint && npx tsc --noEmit && npm run verify:primitives && npm run verify:kit"
```

- [ ] **Step 3: Watch it fail before the PDFs exist**

Run: `npm run verify:kit`
Expected: exit 1 — `verify:kit failed — public/kit/manifest.json is missing. Run \`npm run build && npm run kit:build\`, then commit public/kit/.`

This is the correct state until Task 12 runs. `verify:all` is red between here and there; that is expected and Task 12 clears it.

- [ ] **Step 4: Lint and commit**

Run: `npx eslint scripts/verify-kit.mjs`
Expected: exit 0.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/verify-kit.mjs package.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(verify): kit staleness gate comparing the manifest hash with the JSON"
```

---

### Task 11: The link audit learns dynamic route segments

**Parallel group:** D

**Files:**
- Modify: `scripts/verify-links.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: `/educators/kit/session/deconstruct-resume` and its two siblings resolve against the `app/educators/kit/session/[id]/page.tsx` route.

`scripts/verify-links.mjs` builds its route set from `app/**/page.tsx` directory names, so `[id]` lands in the set literally as `/educators/kit/session/[id]`. Task 13 links to the three concrete session URLs, which would fail the audit. Teach the audit the convention once, here, rather than special-casing the kit.

- [ ] **Step 1: Add a dynamic-route matcher**

In `scripts/verify-links.mjs`, immediately after this line:

```js
const routes = new Set(pageFiles.map(routeForPage));
```

add:

```js
/**
 * A route with a [param] segment matches any single path segment there, and a
 * [...param] segment matches the rest of the path. Without this, a link to a
 * concrete dynamic URL (/educators/kit/session/ask-well) would be reported as
 * missing because the route set only holds the literal `[id]` form.
 */
const dynamicRoutes = [...routes]
  .filter((route) => route.includes("["))
  .map((route) =>
    new RegExp(
      `^${route
        .split("/")
        .map((segment) =>
          /^\[\.\.\..+\]$/.test(segment)
            ? ".+"
            : /^\[.+\]$/.test(segment)
              ? "[^/]+"
              : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("/")}$`,
    ),
  );

function routeExists(pathname) {
  return routes.has(pathname) || dynamicRoutes.some((pattern) => pattern.test(pathname));
}
```

- [ ] **Step 2: Use it in the reference loop**

Replace this line:

```js
  if (!routes.has(pathname) && !publicAssets.has(pathname)) {
```

with:

```js
  if (!routeExists(pathname) && !publicAssets.has(pathname)) {
```

- [ ] **Step 3: Prove the matcher works and nothing regressed**

Run: `node scripts/verify-links.mjs`
Expected: `Link audit passed: … routes, … internal references, … public assets, …`. The route count rises by the five new kit routes plus `/educators` once Task 13 lands; right now it rises by five.

Run:
```bash
node -e "
const p = /^\/educators\/kit\/session\/[^/]+$/;
console.log(p.test('/educators/kit/session/ask-well'), p.test('/educators/kit/session/a/b'));
"
```
Expected: `true false`.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/verify-links.mjs
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(verify): resolve links against dynamic route segments"
```

---

### Task 12: Generate and commit the seven PDFs

**Parallel group:** E

**Files:**
- Create: `public/kit/hirefromph-doctrine-one-pager.pdf`, `public/kit/hirefromph-path-map.pdf`, `public/kit/hirefromph-seven-methods.pdf`, `public/kit/hirefromph-session-deconstruct-resume.pdf`, `public/kit/hirefromph-session-vet-opportunity.pdf`, `public/kit/hirefromph-session-ask-well.pdf`, `public/kit/hirefromph-slides.pdf`, `public/kit/manifest.json`

**Interfaces:**
- Consumes: the five kit routes (Tasks 4–8) and the build script (Task 9).
- Produces: the seven public assets `app/educators/page.tsx` links to in Task 13 — `scripts/verify-links.mjs` resolves `/kit/*.pdf` against `public/`, so the landing page cannot pass the audit until these exist.

- [ ] **Step 1: Build, then render**

Run:
```bash
npm run build && npm run kit:build
```
Expected:
```
  hirefromph-doctrine-one-pager.pdf — 1 sheet(s), … bytes
  hirefromph-path-map.pdf — 1 sheet(s), … bytes
  hirefromph-seven-methods.pdf — 2 sheet(s), … bytes
  hirefromph-session-deconstruct-resume.pdf — 4 sheet(s), … bytes
  hirefromph-session-vet-opportunity.pdf — 4 sheet(s), … bytes
  hirefromph-session-ask-well.pdf — 4 sheet(s), … bytes
  hirefromph-slides.pdf — 16 sheet(s), … bytes
kit:build wrote 7 PDF(s) to public/kit/ at hash ………………
```

**If it fails with `sheet N overflows its paper box by Npx`:** the sheet is over-full. Fix it by moving content, never by shrinking the type — the `.kit` ramp is calibrated for print legibility. The one-pager merges "Why it matters" into the creed card; the methods sheet lowers `METHODS_PER_SHEET` to 3 and `KIT_FILES` `pages` to 3; a run-sheet lowers `STEPS_PER_SHEET` to 3 and raises `KIT_FILES` `pages` to 5.

**If it fails with `rendered N sheet(s); lib/kit.mjs expects M`:** the route and the contract disagree. The route is the truth for the count; update `pages` in `lib/kit.mjs`, then re-run `npx vitest run lib/educators.test.ts`.

**If it fails with `could not launch Chromium`:** run `npx playwright install chromium` once and retry.

- [ ] **Step 2: Verify**

Run: `npm run verify:kit`
Expected: `verify:kit passed: 7 PDFs at hash ………………  built YYYY-MM-DD.` Any `note:` lines about compressed dictionaries are fine.

- [ ] **Step 3: Open two of them by hand**

Open `public/kit/hirefromph-slides.pdf` and `public/kit/hirefromph-session-ask-well.pdf` in a PDF viewer.
Expected: 16 landscape slides with a navy first page; 4 portrait pages whose footer reads `Hire From PH (hirefrom.ph), licensed CC BY 4.0` and `n / 4`. No page is blank, no text is clipped at a page edge, no site header or footer appears anywhere.

- [ ] **Step 4: Confirm the JSON→PDF link actually bites**

Run:
```bash
node -e "
const fs=require('node:fs');
const p='data/educators.json';
const before=fs.readFileSync(p,'utf8');
fs.writeFileSync(p, before.replace('\"lastVerified\": \"2026-08\"','\"lastVerified\": \"2026-09\"'));
" && npm run verify:kit; node -e "
const fs=require('node:fs');
const p='data/educators.json';
fs.writeFileSync(p, fs.readFileSync(p,'utf8').replace('\"lastVerified\": \"2026-09\"','\"lastVerified\": \"2026-08\"'));
"
```
Expected: the middle command exits 1 with `content hash mismatch: …`, and the third restores the file. Confirm with `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat data/educators.json` → no output.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add public/kit
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(kit): first release of the seven PDFs and their content-hash manifest"
```

---

### Task 13: `/educators` — the landing page

**Parallel group:** F (first of four ordered tasks)

**Files:**
- Create: `app/educators/page.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `DiagramFrame`, `Heading`, `Step`, `StepList`, `Text` from `@/components/ui`; `CardGrid`, `FeatureRow`, `PageFooterNav`, `PageHero`, `Section`, `SectionHeading`, `type Feature` from `@/components/layout`; `JourneyMap` from `@/components/diagrams`; `EDUCATORS_INTRO`, `KIT_FILES`, `KIT_LICENSE`, `QUICK_START`, `SESSIONS`, `getSession` from `@/lib/educators`; `findNavNeighbours`, `getBreadcrumb` from `@/lib/nav`; `pageMeta` from `@/lib/meta`.
- Produces: route `/educators`, a server component.

Notes on the choices this page makes:

- **The hero media is a diagram, not a photo.** `Figure id="library-hero"` is already spoken for by `/library`, and the kit's subject is the path, so the hero renders `JourneyMap` inside a `DiagramFrame`. No new image is generated for this phase.
- **`FeatureRow` needs a title and a sentence; `intro.whoFor` is four sentences.** `WHO_FOR` supplies four short audience labels and four icon names — page furniture in the same category as the footer's honesty line, which Phase 2 also kept as a local constant for Phase 8 to move. A test in Task 16 is not needed; the array length is asserted inline by the `.map` over `whoFor`.
- **Download buttons are `Button external`, not `<a download>`.** `ButtonProps` is a Phase 1 contract and carries no `download` attribute; adding one would break "do not rename, do not add, do not drop". `external` renders `target="_blank" rel="noopener noreferrer"`, which is the right behaviour for a PDF anyway — the viewer opens, and the reader saves if they want to.
- **`intro.honestyNote` is rendered verbatim.** No trimming, no paraphrase.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { JourneyMap } from "@/components/diagrams";
import {
  CardGrid,
  FeatureRow,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  type Feature,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import {
  EDUCATORS_INTRO,
  KIT_FILES,
  KIT_LICENSE,
  QUICK_START,
  SESSIONS,
  getSession,
} from "@/lib/educators";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";

export const metadata: Metadata = pageMeta({
  path: "/educators",
  title: "For educators, run a session from this material",
  description:
    "Three workshop run-sheets, sixteen slides, a printable path map and the doctrine on one page. Free, CC BY 4.0, no sign-in.",
});

/**
 * Short audience labels for the four sentences in intro.whoFor, plus an icon
 * each. Page furniture; Phase 8 owns the final wording. The sentences
 * themselves come from data/educators.json.
 */
const WHO_FOR: { label: string; icon: string }[] = [
  { label: "Teachers", icon: "graduation-cap" },
  { label: "Trainers", icon: "users" },
  { label: "Organisers", icon: "heart-handshake" },
  { label: "Mentors", icon: "briefcase" },
];

export default function EducatorsPage() {
  const neighbours = findNavNeighbours("/educators");
  const whoFor: Feature[] = EDUCATORS_INTRO.whoFor.map((body, index) => ({
    icon: WHO_FOR[index].icon,
    title: WHO_FOR[index].label,
    body,
  }));

  return (
    <>
      <PageHero
        breadcrumb={getBreadcrumb("/educators")}
        kicker="For educators"
        title={EDUCATORS_INTRO.title}
        lead={EDUCATORS_INTRO.lead}
        compact
        actions={
          <>
            <Button href="#whats-inside" variant="primary" size="lg">
              See what is inside
            </Button>
            <Button href="/method" variant="outline" size="lg">
              Read the method
            </Button>
          </>
        }
        media={{
          node: (
            <DiagramFrame
              title="The path a participant is on"
              caption="Five stages and eleven steps. Every session in the kit sits somewhere on this line."
            >
              <JourneyMap />
            </DiagramFrame>
          ),
        }}
      />

      <Section band="tint">
        <SectionHeading
          kicker="Who it is for"
          title="A room, a projector, and ninety minutes"
          lead="You do not need us present, and you do not need our permission."
        />
        <FeatureRow className="mt-12" items={whoFor} />
      </Section>

      <Section id="whats-inside">
        <SectionHeading
          kicker="What is inside"
          title="Seven files, all free to print"
          lead="Each one renders from the same JSON the site reads, so a page and its handout never disagree."
        />

        <Callout
          className="mt-8"
          tone="neutral"
          title="Why the kit has downloads when the site has none"
        >
          The no-file rule keeps a learner from depending on a finished deliverable to rename. A
          run-sheet makes a facilitator more capable, so it ships as a PDF.
        </Callout>

        <CardGrid className="mt-10" cols={3}>
          {KIT_FILES.map((file) => {
            const session = file.sessionId ? getSession(file.sessionId) : undefined;
            const title = file.title ?? session?.title ?? file.slug;
            return (
              <Card key={file.slug} as="article" padding="lg">
                <Badge tone="neutral" variant="outline">
                  {file.format}
                </Badge>
                <Heading className="mt-4" level={3} size="h5">
                  {title}
                </Heading>
                <Text className="mt-2" size="small" tone="soft">
                  {file.blurb}
                </Text>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                  <Button href={`/kit/${file.slug}.pdf`} external variant="secondary" size="sm">
                    Download PDF
                  </Button>
                  <Button href={file.route} variant="link" size="sm">
                    Open the print page
                  </Button>
                </div>
              </Card>
            );
          })}
        </CardGrid>
      </Section>

      <Section band="tint">
        <SectionHeading
          kicker="Run a session"
          title="Six things to do before the room fills"
          lead="Run one as written first. Adapt after that, not before."
        />
        <StepList className="mt-12">
          {QUICK_START.map((step) => (
            <Step key={step.n} n={step.n} title={step.title}>
              {step.desc}
            </Step>
          ))}
        </StepList>
      </Section>

      <Section>
        <SectionHeading
          kicker="The three sessions"
          title="Pick the one your group can carry today"
          lead="Each asks something different of a room: argument, honesty, or quiet."
        />
        <CardGrid className="mt-10" cols={3}>
          {SESSIONS.map((session) => (
            <Card key={session.id} as="article" padding="lg">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="signal">{session.method}</Badge>
                <Badge tone="neutral">{session.minutes} minutes</Badge>
              </div>
              <Heading className="mt-4" level={3} size="h5">
                {session.title}
              </Heading>
              <Text className="mt-2" size="small" tone="soft">
                {session.objectives[0]}
              </Text>
              <div className="mt-auto pt-6">
                <Button href={`/educators/kit/session/${session.id}`} variant="secondary" size="sm">
                  Read the run-sheet
                </Button>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section band="tint">
        <div className="grid gap-6 lg:grid-cols-2">
          <Callout tone="verified" title={`Licence: ${KIT_LICENSE.name}`}>
            <p>{KIT_LICENSE.summary}</p>
            <p className="mt-3">
              Credit it as {KIT_LICENSE.attribution}.{" "}
              <a
                href={KIT_LICENSE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Read the licence
              </a>
              .
            </p>
          </Callout>

          <Callout tone="info" title="What we do not know">
            {EDUCATORS_INTRO.honestyNote}
          </Callout>
        </div>

        <PageFooterNav className="mt-16" prev={neighbours.prev} next={neighbours.next} up={neighbours.up} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Build and check the route**

Run: `npm run build`
Expected: exit 0, `/educators` in the route table as static.

- [ ] **Step 3: Check the audits pass with the PDFs in place**

Run: `node scripts/verify-links.mjs`
Expected: `Link audit passed: …`. Every `/kit/*.pdf` resolves against `public/kit/`, and the three session links resolve through the dynamic matcher from Task 11. A failure naming a `.pdf` means Task 12 has not run.

Run: `npm run verify:primitives`
Expected: `verify:primitives: clean.` (or the warn-only summary with no new entries under `app/educators`).

- [ ] **Step 4: Look at the page**

Open `http://localhost:3000/educators`.
Expected: the site header and footer are back (only `kit/*` hides them); a compact hero with the journey map beside it; four audience columns; seven download cards; six numbered quick-start steps; three session cards; the licence and the honesty note side by side; prev/up footer navigation.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/educators/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(educators): landing page for the kit, its licence and its honesty note"
```

---

### Task 14: Switch the route on — data, nav, sitemap, robots, and the GIVE link

**Parallel group:** F (second of four ordered tasks — the link audit is red between Task 13 and this one only if you reordered them; run this immediately after Task 13)

**Files:**
- Modify: `data/site.json` (one key deleted), `data/library.json` (one key deleted), `app/method/page.tsx`, `app/sitemap.ts` (comment only), `app/robots.ts`

**Interfaces:**
- Consumes: the `pending` convention from Phase 2 — `isLive(link)` is `link.pending !== true`, and the footer, the mobile drawer, the search index, the library grid and the sitemap all honour it.
- Produces: `/educators` appears in the footer's **More** column, in `/library`, in the search palette, and in `sitemap.xml`. Deleting the key is the whole switch.

- [ ] **Step 1: Un-pend `/educators` in `data/site.json`**

In the `navGroups` array, in the group titled **More**, this entry:

```json
        { "label": "For educators", "href": "/educators", "pending": true }
```

becomes:

```json
        { "label": "For educators", "href": "/educators" }
```

Nothing else in `data/site.json` changes. `/practice` and `/glossary` lost their flags in Phase 6; after this edit `grep -c pending data/site.json` prints `0`.

- [ ] **Step 2: Un-pend `/educators` in `data/library.json`**

Delete the single `"pending": true,` line from the `/educators` entry, so it reads:

```json
    {
      "label": "For Educators",
      "href": "/educators",
      "group": "tools",
      "type": "guide",
      "desc": "Run a session from this material: run-sheets, slides, and the licence."
    }
```

- [ ] **Step 3: Add the one-line pointer to the GIVE method**

`/method` renders each method through `MethodBlock`. Add a line under the GIVE drill.

First add the import at the top of `app/method/page.tsx`, after `import type { ReactNode } from "react";`:

```tsx
import Link from "next/link";
```

Then, inside `MethodBlock`, find the drill panel — it ends with these three lines:

```tsx
            <p className="mt-2 font-display text-lg leading-snug text-balance">
              {method.drill}
            </p>
          </div>
```

and insert directly after that closing `</div>`:

```tsx
          {method.id === "give" && (
            <p className="mt-4 text-sm text-ink-soft">
              Running a room?{" "}
              <Link
                href="/educators"
                className="font-medium text-primary underline underline-offset-4"
              >
                The educator kit
              </Link>{" "}
              carries three workshop run-sheets, a slide deck, and a printable path map, CC BY 4.0.
            </p>
          )}
```

If Phase 5 has restructured this file, the anchor is unchanged in substance: find where `method.drill` is rendered and put the paragraph immediately after the drill panel, still guarded by `method.id === "give"`.

- [ ] **Step 4: Correct the sitemap comment**

`app/sitemap.ts` needs no logic change — `/educators` now flows in from `navGroups`, and the five `kit/*` routes are excluded structurally because they are not in `navGroups`, the same mechanism that keeps `/dev/ui` out. Update the stale comment so it stops naming a route that is now live. Replace:

```ts
 * - Links marked `pending` are authored in the IA but their route ships in a
 *   later phase (/practice, /glossary, /educators), so they stay out until the
 *   flag is deleted.
```

with:

```ts
 * - Links marked `pending` are authored in the IA but their route ships in a
 *   later phase, so they stay out until the flag is deleted. As of Phase 7
 *   there are none left.
 * - The kit's print routes (/educators/kit/*) can never leak in, because they
 *   are not in navGroups — the same structural exclusion as /dev/ui.
```

- [ ] **Step 5: Disallow the print routes in `app/robots.ts`**

Replace the `rules` line so the file reads:

```ts
import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    // `/path` is crawlable so bots can see its page-level `noindex` metadata.
    // Blocking it here can leave the personalized dashboard indexed without a
    // useful snippet because crawlers never get to read that directive.
    //
    // `/educators/kit/` is different: those routes are print sheets of content
    // that already lives on the site, so there is nothing to index and every
    // reason to keep duplicates out. They also carry `noindex` in their layout.
    rules: { userAgent: "*", allow: "/", disallow: ["/educators/kit/"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 6: Verify the switch**

Run:
```bash
npm run build && node -e "
const fs=require('node:fs');
const xml=fs.readFileSync('.next/server/app/sitemap.xml.body','utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('count', urls.length);
console.log('/educators', urls.some(u=>u.endsWith('/educators')));
for (const bad of ['/educators/kit/one-pager','/educators/kit/slides','/dev/ui','/path']) {
  console.log(bad, urls.some(u=>u.endsWith(bad)));
}
"
```
Expected:
```
count 36
/educators true
/educators/kit/one-pager false
/educators/kit/slides false
/dev/ui false
/path false
```
(The count is 33 routes from Phase 2 plus `/practice`, `/glossary` and `/educators`. If the built sitemap body sits elsewhere in this Next version, read it from the running server instead: `curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"`.)

Run: `curl -s http://localhost:3000/robots.txt`
Expected: a `Disallow: /educators/kit/` line under `User-Agent: *`.

Run: `grep -rn "pending" data/site.json data/library.json`
Expected: no output.

Run: `npx vitest run lib/nav.test.ts`
Expected: PASS. Phase 2's test asserted that `SEARCH_INDEX` excludes `/educators`; that assertion is now wrong. Change it to `expect(SEARCH_INDEX.some((i) => i.href === "/educators")).toBe(true)` and the "For educators is pending, so Privacy is the last live link in More" comment and assertion in the drawer test to expect the link to be present. Do the same in `components/site/mobile-drawer.test.tsx` if it asserts absence. This is the switch-on doing exactly what it should.

- [ ] **Step 7: Full audit**

Run: `npm run verify:all && node scripts/verify-links.mjs`
Expected: every step green, ending with `verify:kit passed: 7 PDFs …` and `Link audit passed: N routes, …` with no problems listed (N is the Phase 6 count plus six: `/educators` and the five kit routes).

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/site.json data/library.json app/method/page.tsx app/sitemap.ts app/robots.ts lib/nav.test.ts components/site
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(nav): switch /educators on across the footer, library, search and sitemap"
```

---

### Task 15: Documentation — the doctrine clarification and the build steps

**Parallel group:** F (third of four ordered tasks)

**Files:**
- Modify: `BUILD_GUIDE.md`, `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the rule every later phase and every future page author reads before touching the kit.

- [ ] **Step 1: Add the clarification to `BUILD_GUIDE.md`**

Insert this block immediately after the "Test for any section you write…" line that closes **THE CORE DOCTRINE**, and before the `## THE HONESTY DOCTRINE` heading:

```markdown
### Teaching material may be distributed (the educator kit)

The no-downloads rule protects learners from dependence on finished *deliverables* (a resume to rename). Material that teaches *the method* (principles, run-sheets, the path map) is teaching material and may be distributed as PDF. The test stays the same: does this make the reader more capable or more dependent? A facilitation guide makes a facilitator more capable.

This applies to `/educators` and `app/educators/kit/*` and nowhere else. Two rules govern that code:

- **Kit pages render from JSON only; never hand-write kit copy in TSX.** Doctrine, session, slide, stage and roadmap text on a kit sheet is read from `data/*.json`. The only hand-written strings are page furniture ("Minutes", "Facilitator", "Participants", "Drill", "Continued") and the seven contents-table labels in `lib/kit.mjs`, which Phase 8 owns.
- **Every source prints its URL in full.** A PDF has no hover, so `KitFootnote` writes the address out. A link label with no address beside it is an unsourced claim once it leaves the screen.

The PDFs are generated, not hand-made: `npm run build && npm run kit:build`, then commit `public/kit/`. `npm run verify:kit` (wired into `verify:all`) fails when the JSON has moved since the PDFs were rendered.
```

- [ ] **Step 2: Note the kit in the design-tokens section of `BUILD_GUIDE.md`**

Add one bullet to the end of the **Design tokens** section:

```markdown
- **Print (`.kit` scope only).** Kit sheets do not use `Heading`/`Text`: the site type scale is fluid (`clamp` + `vw`) and a paper box has no viewport to be fluid against. `app/globals.css` declares a fixed point ramp under `.kit` (`.kit-h1`, `.kit-h2`, `.kit-h3`, `.kit-lead`, `.kit-small`, `.kit-note`). This is the only exception to "pages never reach the type scale directly", and it applies nowhere outside `components/kit/` and `app/educators/kit/`.
```

- [ ] **Step 3: Add `/educators` to the README routes table**

In `README.md`, add a row to the routes table (keep it in the same order the table already uses, next to the other tools):

```markdown
| `/educators` | Facilitation kit: three workshop run-sheets, slides, path map, doctrine one-pager. CC BY 4.0. |
```

- [ ] **Step 4: Document the kit build in `README.md`**

Add this section immediately after `## Run`:

````markdown
## Educator kit

The seven PDFs under `public/kit/` are rendered from the routes in
`app/educators/kit/`, so a handout and the page it came from can never disagree.

```bash
npx playwright install chromium   # one-time, per machine
npm run build                     # kit:build renders the production server
npm run kit:build                 # writes public/kit/*.pdf + manifest.json
npm run verify:kit                # fails if the JSON moved since the last build
```

`verify:kit` runs as part of `npm run verify:all`. It compares a sha256 of
`data/educators.json`, `data/doctrine.json`, `data/stages.json`,
`data/roadmap.json` and `data/site.json#standard` against the stamp in
`public/kit/manifest.json`. Playwright cannot write PDF metadata, which is why
the hash lives in the manifest beside the files — commit the two together.

Change any of that JSON and the gate goes red until you re-run `kit:build`.
````

- [ ] **Step 5: Check the docs are honest**

Run: `grep -n "kit:build\|verify:kit" README.md BUILD_GUIDE.md package.json`
Expected: the script names appear in all three, spelled identically.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add BUILD_GUIDE.md README.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs: educator-kit doctrine clarification and the PDF build steps"
```

---

### Task 16: Phase exit verification

**Parallel group:** F (last)

**Files:**
- Create: `screenshots/educators-1280.png`, `screenshots/educators-375.png`
- Modify: none

**Interfaces:**
- Consumes: everything above.
- Produces: the evidence the phase is done, and the Status block below filled in.

- [ ] **Step 1: Run the whole suite**

Run:
```bash
npm run build && npm run kit:build && npm run verify:kit && npm run verify:all && npm test
```
Expected, in order: a green build listing `/educators`, `/educators/kit/one-pager`, `/educators/kit/path-map`, `/educators/kit/methods`, `/educators/kit/session/[id]` (3 params) and `/educators/kit/slides`; seven PDF lines from `kit:build`; `verify:kit passed: 7 PDFs …`; every `verify:*` green; then `node --test` and `vitest run` with 0 failures.

- [ ] **Step 2: Run the link audit**

Run: `node scripts/verify-links.mjs`
Expected: `Link audit passed: N routes, …` with no problems listed. `N` is the Phase 6 route count plus six (`/educators` and the five kit routes) — record the number in the Status block rather than assuming it.

- [ ] **Step 3: Inspect every PDF**

If Poppler is on the machine:
```bash
for f in public/kit/*.pdf; do echo "== $f"; pdfinfo "$f" | grep -E "^(Pages|Page size|Producer)"; done
for f in public/kit/*.pdf; do echo "== $f"; pdffonts "$f" | tail -n +3; done
```
Expected page counts: `1, 1, 2, 4, 4, 4, 16` (alphabetical by file name: one-pager 1, path-map 1, session-ask-well 4, session-deconstruct-resume 4, session-vet-opportunity 4, seven-methods 2, slides 16). Expected page sizes: 595×842pt for the portrait sheets, 842×595pt for the path map, roughly 960×540pt for the slides. Expected fonts: at least one Cabinet Grotesk face and one Inter face per file, each marked `emb: yes` and `sub: yes`.

If Poppler is not installed, use Node:
```bash
node -e "
const fs=require('node:fs');
for (const f of fs.readdirSync('public/kit').filter(n=>n.endsWith('.pdf'))) {
  const b=fs.readFileSync('public/kit/'+f);
  const t=b.toString('latin1');
  const pages=(t.match(/\/Type\s*\/Page(?![sA-Za-z])/g)||[]).length;
  const fonts=[...new Set([...t.matchAll(/\/BaseFont\s*\/([#\w+.-]+)/g)].map(m=>m[1]))];
  console.log(f, b.subarray(0,5).toString('latin1'), 'pages:'+(pages||'compressed'), fonts.join(' ')||'compressed');
}
"
```
Expected: every line starts `%PDF-`; page counts match the list above; the font column names a Cabinet Grotesk subset and an Inter subset. If either column prints `compressed`, the dictionaries are inside object streams — say so in the Status block and confirm by opening one file in a viewer's document-properties/fonts panel instead. **Record the exact PostScript font names you see**; if they differ from `CabinetGrotesk*` / `Inter*`, update the `notes` regex in `scripts/verify-kit.mjs` to match them.

- [ ] **Step 4: Open the PDFs in three readers**

Open `public/kit/hirefromph-slides.pdf` and one run-sheet in Chrome's built-in viewer and in Acrobat or Preview.
Expected in all of them: no blank pages, no clipped lines, the licence line and `n / N` on every page, the navy title slide printing its background (that is `printBackground: true` plus `print-color-adjust: exact` doing their job), and the Creative Commons URL selectable as text on the last slide.

- [ ] **Step 5: Screenshot `/educators`**

Run:
```bash
npm run build && npx next start --port 3210 &
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [w, h, name] of [[1280, 900, 'educators-1280'], [375, 812, 'educators-375']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:3210/educators', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/' + name + '.png', fullPage: true });
    await page.close();
  }
  await browser.close();
})();
"
```
Expected: two files under `screenshots/`. At 1280 the hero is two columns with the journey map on the right and the contents grid is three across; at 375 everything is one column, the diagram frame scrolls sideways inside its own box, and the page body does not scroll sideways.

Stop the server afterwards (`taskkill //F //IM node.exe` is too blunt — find the `next start` process and kill that one, or run the command in a terminal you can close).

- [ ] **Step 6: Keyboard pass**

Tab through `/educators` from the skip link.
Expected: skip link first, then header, then breadcrumb links, the two hero buttons, every download button and print-page link in reading order, every session button, the licence link, and the footer nav. Focus is visible on all of them (2px primary ring, 2px offset). No focus lands inside the diagram except the `DiagramFrame` scroll container, which is `tabIndex={0}` by design.

- [ ] **Step 7: Commit the screenshots**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/educators-1280.png screenshots/educators-375.png
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(screens): /educators at 1280 and 375"
```

- [ ] **Step 8: Fill in the Status block**

Fill the table below in this file, commit it, and report:

- the seven PDFs with their page counts and byte sizes,
- the content hash from `public/kit/manifest.json`,
- the exact embedded font names (or that the dictionaries are compressed),
- the link-audit route count and the sitemap URL count,
- anything that had to move to make a sheet fit (`METHODS_PER_SHEET`, `STEPS_PER_SHEET`, or a `pages` value in `lib/kit.mjs`),
- any Phase 2 or Phase 6 test whose assertion had to flip because `/educators` went live.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add docs/superpowers/plans/2026-08-21-ui-overhaul-p7-educators.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs(plan): phase 7 status"
```

---

## Status

| # | Task | Group | Done |
|---|---|---|---|
| 1 | `lib/kit.mjs` + `lib/educators.ts` + tests | A | [ ] |
| 2 | `.kit` print scope + kit shell layout | B | [ ] |
| 3 | `components/kit/` (six components + test) | B | [ ] |
| 4 | `one-pager` sheet | C | [ ] |
| 5 | `path-map` sheet | C | [ ] |
| 6 | `methods` cheat-sheet | C | [ ] |
| 7 | `session/[id]` run-sheets | C | [ ] |
| 8 | `slides` deck | C | [ ] |
| 9 | `scripts/build-kit-pdf.mjs` + Playwright | D | [ ] |
| 10 | `scripts/verify-kit.mjs` + `verify:all` | D | [ ] |
| 11 | Link audit learns dynamic segments | D | [ ] |
| 12 | Generate and commit the seven PDFs | E | [ ] |
| 13 | `/educators` landing page | F | [ ] |
| 14 | Switch-on: data, nav, sitemap, robots, GIVE link | F | [ ] |
| 15 | `BUILD_GUIDE.md` + `README.md` | F | [ ] |
| 16 | Exit verification | F | [ ] |

**Exit criteria (spec §14 row 7):** PDFs open cleanly in Acrobat, Preview and Chrome; fonts embedded; every figure sourced; the landing page linked from the footer, `/library` and `/method`.

| Evidence | Value |
|---|---|
| Kit content hash | |
| PDF page counts | |
| Embedded fonts | |
| Link-audit routes | |
| Sitemap URLs | |
| Sheet-fit adjustments | |
| Tests flipped by the switch-on | |

---

## Self-review (writing-plans)

**1. Spec coverage — §7.5, §12, §14 row 7, §11, §10.**

| Spec requirement | Task |
|---|---|
| Doctrine clarification added to `BUILD_GUIDE.md` | T15 Step 1 (quoted verbatim) |
| *The doctrine*, one-pager, A4 portrait, from `doctrine.json` + `site.json.standard` | T4 |
| *The path*, A4 landscape, from `stages.json` + `roadmap.json` + the journey diagram | T5 |
| *Seven methods*, A4 portrait, 2 pages, from `doctrine.json.methods`, drill each | T6 |
| Three run-sheets from `data/educators.json`: objectives, room setup, timed steps, prompts, which tools to open live, facilitator mistakes | T7 (all six rendered; `tool` prints the route as a full address) |
| *Slides*: 16, 16:9 landscape, doctrine / path / methods / honesty rule | T8 |
| *How to use and cite this* on every PDF's last page, from `educators.json.license` | T3 `KitLicence` + T4–T8 (compact on the two one-sheet documents, full block on the last sheet of the multi-sheet ones) |
| All numbers carry their `Source`; URL printed in full | T3 `KitFootnote`, constraint in the Phase 7 additions, asserted by `lib/educators.test.ts` |
| Kit pages are ordinary routes under `app/educators/kit/*` with a print stylesheet: `@page` size and margins, no header/footer chrome, fonts embedded | T2 (`.kit` scope, shell-hiding layout), T3 (`@page` per route), T16 Step 3 (font check) |
| `scripts/build-kit-pdf.mjs` starts a server, renders with Playwright Chromium, `printBackground` | T9 |
| `verify:kit` compares a content hash against the JSON | T10, wired into `verify:all` |
| `public/kit/*.pdf` regenerated and committed when the JSON changes | T12, and the gate that enforces it in T10 |
| Visitors can print any kit page themselves | T2 (screen view is the same sheet), T13 ("Open the print page" on every card) |
| Landing page: who it is for, what each piece is, download buttons, "run a session" quick start, licence, honesty note | T13 |
| Linked from the footer, `/library`, and the GIVE section of `/method` | T14 (footer and library come free from deleting `pending`; `/method` is an explicit edit) |
| Licence CC BY 4.0, swappable in one line of `data/educators.json` | T3 `KitLicence` and T13 read `KIT_LICENSE`; nothing hard-codes the licence name |
| §12 `data/educators.json` shape | T1 types match the authored file, including `quickStart` and `license.summary`, which §12's summary line omits |
| §14 exit: PDFs open cleanly, fonts embedded, every figure sourced, landing page linked from three places | T16 Steps 3–4, T14 |
| §11 copy rules for new shell copy | Phase 7 constraint; the only new strings are section headings, four audience labels, seven contents labels and one `/method` line |
| §10 accessibility | T16 Step 6 keyboard pass; kit routes keep one `h1` per document (`KitHeader` on sheets, `Slide level={1}` on slide 1) |

**Deviations, each stated where it happens:**

- The hash is stamped in `public/kit/manifest.json`, not in PDF metadata — Playwright exposes no hook for the Info dictionary or XMP (T9 preamble, T10 preamble, README in T15).
- `KitPage` takes `n`/`of` rather than CSS `counter(page)`, because Chromium's `@page` margin-box support is unreliable and a counter outside one resolves to `0` (T3 preamble).
- Kit sheets use a fixed point ramp instead of `Heading`/`Text`, because the site scale is viewport-fluid and paper has no viewport (Phase 7 constraints, BUILD_GUIDE bullet in T15 Step 2).
- The path map is authored to one landscape sheet using `stage.subtitle` rather than `stage.summary`; the overflow guard in T12 is what makes that safe rather than hopeful.
- `FeatureRow` on `/educators` needs a title per item and `intro.whoFor` has none, so four short audience labels live in the page as furniture — the same treatment Phase 2 gave the footer's honesty line (T13 preamble).

**2. Placeholder scan.** No "TBD", "implement later", "add error handling", "similar to Task N", or "write tests for the above". Every code step carries the file's full contents or an exact anchor-and-insert. The three tuning knobs (`METHODS_PER_SHEET`, `STEPS_PER_SHEET`, `KIT_FILES[].pages`) ship with concrete defaults and a named failure message that says which one to move. The two `page.pdf` fallbacks (`format` / `landscape`) are real values, not placeholders.

**3. Type consistency.**

- `KitFile` is declared once in `lib/kit.d.mts` and re-exported by `lib/educators.ts`; `slug`, `route`, `landscape`, `pages`, `format`, `title`, `blurb`, `sessionId` are spelled the same in T1, T9, T10, T12 and T13.
- The five hash keys are `doctrine`, `educators`, `roadmap`, `stages`, `standard` in both `KIT_SOURCES` (disk side) and `kitContentHash()` (app side); `lib/educators.test.ts` fails if they drift.
- `KitPageSize` is `"a4" | "a4-landscape" | "slide"` in T3 and is the only value passed in T4–T8.
- `Session`, `SessionStep`, `KitSlide`, `KitSource` in T1 match the fields read in T7, T8 and T13 (`minutes`, `method`, `objectives`, `setup`, `steps[].{minutes,title,facilitator,participants,tool}`, `prompts`, `mistakes[].{mistake,fix}`, `slides[].{id,kicker,title,body,source}`).
- The class contract in T2 is the exact set used by T3–T8; no component reaches for a class T2 does not define.
- `KIT_LICENSE` is read by `KitPage` (footer), `KitLicence` and the landing page; nothing else names the licence.
- `getSession` is the only lookup by session id, used in T7 and T13.
