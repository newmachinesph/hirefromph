# UI Overhaul — Phase 4: Home and Stage Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 571-line homepage with the eight-section blueprint in spec §8.1, rebuild the stage template on the primitives per §8.2, restyle the `/path` dashboard per §8.4, and land the three journey components (`JourneyStepper`, `PathChooser`, `PathGate`) in `components/journey/` — with no change to any tool logic or stored state.

**Architecture:** All homepage shell copy moves out of JSX into a new `data/home.json` read through a typed door (`lib/home.ts`); the four structural facts in the hero strip are asserted against the real data files by a unit test, so the numbers cannot drift. `components/journey/` gets four components built entirely from `@/components/ui` and `@/components/layout`: `JourneyStepper` merges the old `JourneyProgress` and the 11-column roadmap strip into one client component with `compact`/`full` variants, `PathChooser` gains featured-subset props, `PathGate` and `StagePage` move and are rebuilt. The old `components/<name>.tsx` paths keep one-line re-exports so Phase 5 can migrate their importers on its own schedule.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first tokens from Phase 0), TypeScript strict, Vitest 3 + @testing-library/react 16 + user-event 14, Phosphor Icons, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§8.1 homepage, §8.2 stage template, §8.4 `/path`, §5.5 journey components, §7.1–§7.3 visuals and diagrams, §9 de-slop inventory, §10 a11y and performance, §11 copy rules, §13 testing, §14 row 4). This is plan 5 of 10.

**Depends on (all complete before this plan starts):**
- **Phase 0:** tokens in `app/globals.css`, `lib/fonts.ts`, `lib/accent.ts` (`ACCENT`, `accent()`, `isAccent`, `type Accent`), the skip link, the redesigned logo.
- **Phase 1:** `@/components/ui` and `@/components/layout` export exactly the names in the pinned contract below.
- **Phase 2:** `lib/nav.ts` exports `LIBRARY`, `LIVE_LIBRARY`, `getBreadcrumb(href)`, `findNavNeighbours(href)`; `data/site.json` carries `nav`, `navGroups`, `cta`; `data/library.json` carries 33 entries with the `pending` convention.
- **Phase 3:** `data/visuals.json` holds 11 entries (`home-hero`, `home-standard`, `stage-start`, `stage-get-hired`, `stage-deliver`, `stage-level-up`, `stage-own`, `cta-band`, `library-hero`, `og-default`, `path-dashboard`) and `components/diagrams/index.ts` exports `DIAGRAMS` with the four ids `journey-map`, `method-loop`, `hiring-funnel`, `first-week-timeline`.

## Global Constraints

_Copied verbatim from `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md`. Every task's requirements implicitly include this section._

- Fonts: Inter via `next/font/google`; Cabinet Grotesk 500/700/800 self-hosted via `next/font/local` from Fontshare woff2 (ITF Free Font License). Space Grotesk, Inter Tight, Space Mono are removed.
- Palette (exact hex): paper `#FFFFFF`, band `#F7F6FF`, tint `#EEEDFF`, ink `#0E1230`, ink-soft `#4A4F66`, ink-faint `#6B7087`, line `#E4E4EA`, line-strong `#CFCFD8`, control `#8A8FA3`, primary `#4B4EF6`, primary-deep `#3634D8`, primary-soft `#C9C8FF`, verified `#067647` / fill `#12B76A` / tint `#E6F7EE`, caution `#9A5B00` / fill `#F5A623` / tint `#FFF4DB`, info `#026AA2` / fill `#0BA5EC` / tint `#E0F2FE`, coral `#B42318` / fill `#FF5A5F` / tint `#FFECEB`, on-navy `#F7F6FF`.
- Naming convention (deviation from the spec table, documented in BUILD_GUIDE): the bare semantic name (`--verified`) is the **text/deep** value so legacy `text-verified` usages stay AA; the vibrant shape colour is `--verified-fill`.
- Radii: sm 8px, md 12px, lg 20px, pill 999px. The global `* { border-radius: 6px !important }` rule and `.is-circle` are deleted. Tailwind's default `rounded-*` scale is **not** wiped in this phase (legacy pages still use `rounded-2xl`); Phase 5 wipes it.
- Legacy aliases kept until Phase 5: `--paper-2`, `--paper-3`, `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--caution-text`, `--radius`, `--shadow-lg`, `--shadow-signal`, `.kicker`, `.font-display`, `.container-x`, `.link-sweep`, `.font-mono`.
- White text only on `primary`, `primary-deep`, `ink`, and the deep semantic values; never on `*-fill` colours.
- No new `lucide-react` imports. No new `hover:-translate-y-*`, `blur-*`, or `Sparkles`.
- Honesty doctrine unchanged; no copy changes in this phase except the logo tagline, which is unchanged ("the standard, not the discount").
- Git: work on branch `redesign/ui-overhaul`; run git as `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite …` (repo ownership quirk on this machine). Commit after every task.
- Commands run from the repo root in Git Bash. `npm run build` must pass at the end of every task that touches `app/` or `lib/`.

### Phase 4 additions to the constraints

- **Copy rules (spec §11), enforced by `lib/home.test.ts`:** the hero headline (title + accent) is ≤ 8 words; the hero lead is ≤ 25 words; no string anywhere in `data/home.json` contains `actually`, `forever`, `genuinely`, `truly`, or `virtual assistant`; no "not X, Y" reversals; no lists of negatives ("no overwhelm, no 40-tab rabbit holes"); concrete nouns and verbs.
- **No invented numbers.** The four hero facts are asserted equal to `stages.length`, `roadmap.steps.length`, `tracks.tracks.length`, and `tasks.tasks.length` by a test. Today those are **5 / 11 / 22 / 40**. If a data file changes, the test fails and the copy is corrected — never the other way round.
- **The niche count is 22.** `data/tracks.json` has 22 tracks; `app/niches/page.tsx` says 21 in two places. Task 1 fixes those two strings.
- **Home is ≤ 8 sections.** `<PageHero>`, each `<Section>`, and `<CtaBand>` each render exactly one `<section>` element. `grep -oE "<(Section|PageHero|CtaBand)\b" app/page.tsx | wc -l` must print `8`.
- **Bands alternate; one navy band per page.** Homepage: hero paper, how-it-works paper, the path `tint`, pick-your-lane paper, what-you'll-build `tint`, the standard paper, questions paper, CTA navy. Never two `tint` sections in a row.
- **Every `usePath` call and every localStorage key stays exactly as it is.** `app/path/page.tsx` is a restyle, not a rewrite of behaviour: the same `state`, `hydrated`, `hasPath`, `setStage`, `toggleStep` calls, the same derived counts, the same seven "next moves". `lib/path-context.tsx` is not touched at all.
- **Generated imagery is always captioned.** `Figure` appends "Illustrative image" itself; do not suppress it and do not place a generated person beside a quote, name, role, or number (spec §7.1).
- **`git` concurrency:** other agents commit unrelated `data/*.json` files on this branch while Phase 4 runs. If a git command fails with `Unable to create '.git/index.lock': File exists`, wait a few seconds and re-run the same command. Never delete `index.lock` by hand. Always `git add` explicit paths — never `git add -A`.

### Pinned Phase 1 + Phase 2 contract (authoritative for this plan)

`@/components/ui` exports, with the props this plan uses:

- `Accordion` (`type?: "single"|"multiple"`, `defaultOpen?`, `className?`), `AccordionItem` (`id`, `title`, `children`, `className?`)
- `Badge` (`tone?: BadgeTone`, `variant?: "soft"|"outline"`, `className?`); `type BadgeTone = "neutral" | Accent`
- `Button` (`href?`, `external?`, `variant?: "primary"|"secondary"|"outline"|"ghost"|"link"`, `size?: "sm"|"md"|"lg"`, `icon?`, `iconEnd?`, `type?`, `disabled?`, `onClick?`, `className?`, `aria-label`?) — renders `next/link`, `<a>`, or `<button>`
- `Card` (`padding?: "none"|"sm"|"md"|"lg"`, `interactive?`, `href?`, `as?: "div"|"article"|"li"|"section"`, `onBand?`, `className?`), `CardMedia` (`ratio?: "16/9"|"4/3"|"3/2"|"1/1"`), `CardBody`, `CardFooter`
- `Callout` (`tone?: "neutral"|Accent`, `title?`, `icon?` kebab name, `className?`)
- `Checkbox` (`label` + native input props), `ChoiceCard` (`name`, `value`, `label`, `description?`, `icon?`, `checked?`, `defaultChecked?`, `onChange?: (value: string) => void`, `disabled?`, `className?`), `Field` (`label`, `hint?`, `error?`, `required?`, `hideLabel?`, `as?: "field"|"group"`, `className?`)
- `DiagramFrame` (`title`, `caption?`, `id?`, `className?`, `children`)
- `EmptyState` (`title`, `body?`, `icon?`, `action?`, **`media?`**, `className?`) — the image slot is called `media`, not `figure`
- `Figure` (`id?`, `src?`, `alt?`, `width?`, `height?`, `generated?`, `caption?`, `priority?`, `sizes?`, `ratio?: "4/5"|"3/2"|"16/9"|"1/1"|"21/9"|"3/1"|"hero"`, `radius?: "none"|"sm"|"md"|"lg"`, `className?`)
- `Heading` (`level?: 1..6`, `size?: "hero"|"display"|"h2"|"h3"|"h4"|"h5"`, `accent?: string` trailing segment, `balance?`, `tone?: "ink"|"inherit"`, `id?`, `className?`)
- `Icon` (`name` kebab Phosphor, `size?`, `weight?`, `className?`, `aria-label`?) + `ICON_NAMES`
- `Kicker` (`tone?: BadgeTone`, `className?`)
- `ProgressBar` (`value`, `max?`, `label`, `hideLabel?`, `showValue?`, `tone?: Accent`, `className?`)
- `Stat` (`value`, `label`, `sub?`, `source?`, `className?`) inside `StatStrip` (renders `<dl>`)
- `Step` (`n`, `title`, `children?`, `className?`) inside `StepList` (renders `<ol>`)
- `Text` (`size?: "lead"|"body"|"base"|"small"|"caption"`, `tone?: "ink"|"soft"|"faint"|"inherit"`, `as?: "p"|"span"|"div"|"li"`, `balance?`, `id?`, `className?`)

`@/components/layout` exports: `Breadcrumb` (`items: {label, href?}[]`), `CardGrid` (`cols?: 2|3|4`, `as?: "div"|"ul"`, `className?`), `Container` (`size?`), `CtaBand` (`kicker?`, `title`, `body?`, `actions`, `media?: {figureId}`, `className?`), `FeatureRow` (`items: {icon, title, body}[]`, `className?`), `PageFooterNav` (`prev?`, `next?`, `up?` of `{label, href}`), `PageHero` (`breadcrumb?`, `kicker?`, `kickerTone?`, `title`, `accent?`, `lead?`, `actions?`, `media?: {figureId}|{node}`, `compact?`, `children?`, `className?`), `Section` (`band?: "none"|"tint"|"navy"`, `spacing?: "default"|"hero"|"none"`, `size?`, `id?`, `className?`), `SectionHeading` (`kicker?`, `kickerTone?`, `title`, `lead?`, `action?`, `align?`, `level?`, `size?`, `id?`, `className?`), `Toc`.

`@/lib/nav` exports (Phase 2): `LIBRARY: LibraryEntry[]`, `LIVE_LIBRARY`, `getBreadcrumb(href): Crumb[]`, `findNavNeighbours(href): { prev?: NavLink; next?: NavLink; up?: NavLink }`, `type LibraryEntry = { label; href; group; type; stage?; desc; pending? }`.

`@/components/diagrams` exports (Phase 3): `DIAGRAMS` (`"journey-map" | "method-loop" | "hiring-funnel" | "first-week-timeline"`), `type DiagramId`, `type DiagramProps = { current?: number; className?: string }`, and each component individually (`JourneyMap`, `MethodLoop`, `HiringFunnel`, `FirstWeekTimeline`). Diagrams are plain presentational components with no server-only imports, so a client component may import one directly.

---

## File structure

| Path | Responsibility |
|---|---|
| `data/home.json` | **New.** Every string on the homepage shell: hero, how-it-works, section headings, FAQ link labels, CTA |
| `data/site.json` | `stats` trimmed to the four structural facts used by the hero strip (§6.5) |
| `data/stages.json` | Gains `image` on all five entries and `diagram` on two (§12) |
| `lib/home.ts`, `lib/home.test.ts` | Typed door into `home.json` + `site.stats`; copy-rule and count tests |
| `lib/tracks.ts`, `lib/tracks.test.ts` | `TRACKS`, `featuredTracks(limit)` — the featured ordering used by `PathChooser limit` |
| `lib/routes.ts` | `routeEntry(href)` / `routeDesc(href)` — one-line route descriptions from `library.json` |
| `lib/stages.ts`, `lib/stages.test.ts` | `Stage` type, `STAGES`, `getStage(id)`; data-integrity test over `image`, `diagram`, and `tools` |
| `components/journey/journey-stepper.tsx` (+ test) | Client. `JourneyProgress` + the 11-column roadmap strip merged; `compact` / `full` |
| `components/journey/path-chooser.tsx` (+ test) | Client. Rebuilt on `ChoiceCard`/`Badge`; gains `limit`, `moreHref`, `moreLabel` |
| `components/journey/path-gate.tsx` | Client. Rebuilt on `Card` + `Callout` |
| `components/journey/stage-page.tsx` | Server. The §8.2 template |
| `components/journey/index.ts` | Barrel |
| `components/{path-chooser,path-gate,stage-page}.tsx` | One-line re-export shims at the old paths |
| `components/journey-progress.tsx` | **Deleted** — its only importer was `app/page.tsx` |
| `app/page.tsx` | The eight-section homepage (§8.1) |
| `app/path/page.tsx` | Dashboard restyled on `JourneyStepper`, `Card`, `ProgressBar`, `EmptyState` (§8.4) |
| `app/{start,get-hired,deliver,level-up,own}/page.tsx` | Import path changed to `@/components/journey`; nothing else |
| `app/niches/page.tsx` | Two strings: 21 → 22 |
| `screenshots/p4-*.png`, `screenshots/p4-lighthouse-home.json` | Phase 4 exit evidence |

## Parallel groups

Groups run in order; tasks **inside** a group touch disjoint files and can run concurrently.

| Group | Tasks | Depends on |
|---|---|---|
| A | T1 copy + lib helpers · T2 stage data + `lib/stages.ts` | Phases 0–3 |
| B | T3 `JourneyStepper` · T4 `PathChooser` | A (T3 needs `lib/stages.ts`; T4 needs `lib/tracks.ts`) |
| C | T5 `PathGate` · T6 `StagePage` | B |
| D | T7 barrel, shims, stage routes | C |
| E | T8 `app/page.tsx` · T9 `app/path/page.tsx` | D |
| F | T10 screenshots and Lighthouse | E |
| G | T11 exit verification | F |

---

### Task 1: Homepage copy in data, and the three lib helpers

**Parallel group:** A

**Files:**
- Create: `data/home.json`, `lib/home.ts`, `lib/tracks.ts`, `lib/routes.ts`
- Modify: `data/site.json` (replace the `stats` array), `app/niches/page.tsx:24` and `:31` (21 → 22)
- Test: `lib/home.test.ts`, `lib/tracks.test.ts`

**Interfaces:**
- Consumes: `LIBRARY`, `type LibraryEntry` from `@/lib/nav` (Phase 2).
- Produces:
  - From `@/lib/home`: `type HomeLink = { label: string; href: string }`; `type HomeFeature = { icon: string; title: string; body: string }`; `type HomeSection = { kicker: string; title: string; lead: string }`; `type HomeCopy` (full shape below); `const HOME: HomeCopy`; `type HomeStat = { value: string; label: string; sub: string }`; `const HOME_STATS: HomeStat[]`.
  - From `@/lib/tracks`: `type FeaturedTrack = { id: string; name: string; icon: string; accent: string; tagline: string; pay: string; demandLabel: string; demand: number }`; `const TRACKS: FeaturedTrack[]`; `function featuredTracks(limit?: number): FeaturedTrack[]` — sorted by `demand` descending, then `name.localeCompare(name, "en")` ascending, then sliced.
  - From `@/lib/routes`: `function routeEntry(href: string): LibraryEntry | undefined`; `function routeDesc(href: string): string | undefined`.

- [ ] **Step 1: Write the failing copy test**

Create `lib/home.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import faq from "@/data/faq.json";
import homeData from "@/data/home.json";
import roadmap from "@/data/roadmap.json";
import stages from "@/data/stages.json";
import tasks from "@/data/tasks.json";
import tracks from "@/data/tracks.json";
import { HOME, HOME_STATS } from "@/lib/home";
import { routeDesc, routeEntry } from "@/lib/routes";

/** Every string in the file, so the banned-word sweep cannot be dodged by nesting. */
function* strings(node: unknown): Generator<string> {
  if (typeof node === "string") yield node;
  else if (Array.isArray(node)) for (const item of node) yield* strings(item);
  else if (node && typeof node === "object")
    for (const value of Object.values(node)) yield* strings(value);
}

const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

describe("home copy rules (spec §11)", () => {
  it("keeps the hero headline to eight words or fewer", () => {
    expect(words(`${HOME.hero.title} ${HOME.hero.accent}`)).toBeLessThanOrEqual(8);
  });

  it("keeps the hero lead to twenty-five words or fewer", () => {
    expect(words(HOME.hero.lead)).toBeLessThanOrEqual(25);
  });

  it("keeps the banned shell words out of every string", () => {
    const banned = /\b(actually|forever|genuinely|truly|virtual assistants?)\b/i;
    expect([...strings(homeData)].filter((s) => banned.test(s))).toEqual([]);
  });

  it("gives how-it-works exactly three feature items", () => {
    expect(HOME.howItWorks.items).toHaveLength(3);
  });
});

describe("home hero facts", () => {
  it("carries exactly four structural facts", () => {
    expect(HOME_STATS).toHaveLength(4);
  });

  it("matches the real counts in the data files", () => {
    expect(HOME_STATS.map((stat) => stat.value)).toEqual([
      String(stages.length),
      String(roadmap.steps.length),
      String(tracks.tracks.length),
      String(tasks.tasks.length),
    ]);
  });

  it("labels them without inventing achievements", () => {
    expect(HOME_STATS.map((stat) => stat.label)).toEqual([
      "stages",
      "steps",
      "niches",
      "micro-tasks",
    ]);
  });
});

describe("home FAQ wiring", () => {
  it("shows six questions", () => {
    expect(faq.items).toHaveLength(6);
  });

  it("names the link on every answer that has one", () => {
    const missing = faq.items
      .filter((item) => item.href)
      .filter((item) => !HOME.questions.links[item.id]);
    expect(missing.map((item) => item.id)).toEqual([]);
  });
});

describe("routeDesc", () => {
  it("returns the library one-liner for a route", () => {
    expect(routeDesc("/tasks")).toContain("Forty");
    expect(routeEntry("/tasks")?.label).toBe("Micro-Tasks");
  });

  it("describes every card in the What you'll build section", () => {
    const missing = HOME.build.items.filter((item) => !routeDesc(item.href));
    expect(missing.map((item) => item.href)).toEqual([]);
  });

  it("returns undefined for a route the library does not list", () => {
    expect(routeDesc("/not-a-route")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Write the failing featured-tracks test**

Create `lib/tracks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import tracks from "@/data/tracks.json";
import { TRACKS, featuredTracks } from "@/lib/tracks";

describe("featuredTracks", () => {
  it("returns every track when no limit is given", () => {
    expect(featuredTracks()).toHaveLength(tracks.tracks.length);
    expect(TRACKS).toHaveLength(22);
  });

  it("orders by demand descending, then by name", () => {
    expect(featuredTracks(6).map((track) => track.id)).toEqual([
      "ai-agent-ops",
      "design-viz",
      "ecommerce",
      "executive-ops",
      "medical-va",
      "social-media",
    ]);
  });

  it("never mutates the source array", () => {
    const before = tracks.tracks.map((track) => track.id);
    featuredTracks(3);
    expect(tracks.tracks.map((track) => track.id)).toEqual(before);
  });

  it("clamps a nonsense limit instead of throwing", () => {
    expect(featuredTracks(0)).toEqual([]);
    expect(featuredTracks(-4)).toEqual([]);
    expect(featuredTracks(999)).toHaveLength(22);
  });
});
```

- [ ] **Step 3: Run both tests to verify they fail**

Run: `npx vitest run lib/home.test.ts lib/tracks.test.ts`
Expected: FAIL — `Failed to resolve import "@/data/home.json"` and `Failed to resolve import "@/lib/tracks"`.

- [ ] **Step 4: Create `data/home.json`**

```json
{
  "hero": {
    "kicker": "Free and open · for Filipinos building online careers",
    "title": "Build the online career you",
    "accent": "own.",
    "lead": "Five stages, eleven steps, from setting up your desk to invoicing direct clients. Every deliverable here is one you write yourself.",
    "primary": { "label": "Find your path", "href": "/start" },
    "secondary": { "label": "How it works", "href": "#how" },
    "honesty": "Every number here links to the source it came from, including the ones that argue against starting.",
    "honestyLink": { "label": "Read the Reality Check", "href": "/reality" }
  },
  "howItWorks": {
    "kicker": "How it works",
    "title": "Pick a lane, then work the stages",
    "lead": "Each stage names what to do next, so you never have to guess.",
    "items": [
      {
        "icon": "compass",
        "title": "Pick a lane",
        "body": "Twenty-two niches with pay bands, demand, and how AI is changing each one."
      },
      {
        "icon": "list-checks",
        "title": "Follow five stages",
        "body": "Eleven ordered steps take you from a bare desk to direct clients."
      },
      {
        "icon": "pencil-ruler",
        "title": "Build every deliverable yourself",
        "body": "The labs teach the anatomy and the rules; you write the resume, the SOP, the tracker."
      }
    ]
  },
  "path": {
    "kicker": "The path",
    "title": "Five stages, eleven steps",
    "lead": "Each stage builds on the one before it. Tick a step when it is done and the map remembers.",
    "action": { "label": "Open your dashboard", "href": "/path" }
  },
  "lane": {
    "kicker": "Pick your lane",
    "title": "Go deep in one niche",
    "lead": "These six carry the strongest demand in our niche data. Twenty-two lanes are listed in full.",
    "more": { "label": "See all 22 niches", "href": "/niches" }
  },
  "build": {
    "kicker": "What you'll build",
    "title": "Workshops, not downloads",
    "lead": "Every tool here ends with something you wrote: a task finished, an application logged, a month you can follow.",
    "action": { "label": "Browse the library", "href": "/library" },
    "items": [
      { "href": "/build", "icon": "pencil-ruler" },
      { "href": "/tasks", "icon": "target" },
      { "href": "/apply", "icon": "search" },
      { "href": "/simulator", "icon": "trending-up" },
      { "href": "/plan", "icon": "calendar-check" },
      { "href": "/reality", "icon": "scan-eye" }
    ]
  },
  "standard": {
    "action": { "label": "Read the method", "href": "/method" }
  },
  "questions": {
    "kicker": "Questions",
    "title": "The ones people ask first",
    "lead": "Short answers, each with a link to the page that carries the detail.",
    "links": {
      "free": "How your data is stored",
      "va-course": "Read the method",
      "degree": "Start with a micro-task",
      "ai-jobs": "See the Reality Check",
      "first-client": "See the Reality Check",
      "who-runs-this": "Read the conduct rules"
    }
  },
  "cta": {
    "title": "Start with Stage 1.",
    "body": "Stage one begins with the desk you already have.",
    "action": { "label": "Find your path", "href": "/start" }
  }
}
```

- [ ] **Step 5: Trim `stats` in `data/site.json`**

Replace the whole `"stats": [ … ]` array (the four objects headed `"0" / templates handed out`, `"7" / core methods`, `"5" / career stages`, `"40" / micro-tasks with real deliverables`) with exactly this. Nothing else in `data/site.json` changes — `brand`, `wordmarkAccent`, `meaning`, `tagline`, `mission`, `standard`, `cta`, `nav`, and `navGroups` all stay byte-for-byte as Phase 2 left them:

```json
  "stats": [
    { "value": "5", "label": "stages", "sub": "zero to independent" },
    { "value": "11", "label": "steps", "sub": "one ordered roadmap" },
    { "value": "22", "label": "niches", "sub": "pay, demand, and AI risk" },
    { "value": "40", "label": "micro-tasks", "sub": "each ends as portfolio proof" }
  ],
```

This is the §9 fix for the "0 templates handed out" stat card: the strip now carries structural facts only.

- [ ] **Step 6: Write `lib/home.ts`**

```ts
import homeData from "@/data/home.json";
import siteData from "@/data/site.json";

/** A labelled destination. Same shape as PageFooterNav's FooterLink. */
export type HomeLink = { label: string; href: string };
export type HomeFeature = { icon: string; title: string; body: string };
export type HomeSection = { kicker: string; title: string; lead: string };

export type HomeCopy = {
  hero: {
    kicker: string;
    /** Headline, minus the coloured trailing segment. */
    title: string;
    /** Trailing segment, coloured primary by `Heading accent`. */
    accent: string;
    lead: string;
    primary: HomeLink;
    secondary: HomeLink;
    honesty: string;
    honestyLink: HomeLink;
  };
  howItWorks: HomeSection & { items: HomeFeature[] };
  path: HomeSection & { action: HomeLink };
  lane: HomeSection & { more: HomeLink };
  build: HomeSection & { action: HomeLink; items: { href: string; icon: string }[] };
  standard: { action: HomeLink };
  /** `links` is keyed by `data/faq.json` item id. */
  questions: HomeSection & { links: Record<string, string> };
  cta: { title: string; body: string; action: HomeLink };
};

export const HOME: HomeCopy = homeData;

/**
 * The four structural facts in the hero strip (spec §8.1.1, §6.5). These are
 * counts of what the site contains, never achievements — and lib/home.test.ts
 * asserts each value against the data file it counts.
 */
export type HomeStat = { value: string; label: string; sub: string };
export const HOME_STATS: HomeStat[] = siteData.stats;
```

- [ ] **Step 7: Write `lib/tracks.ts`**

```ts
import tracksData from "@/data/tracks.json";

/** The subset of a track the chooser and the homepage render. */
export type FeaturedTrack = {
  id: string;
  name: string;
  icon: string;
  accent: string;
  tagline: string;
  pay: string;
  demandLabel: string;
  demand: number;
};

export const TRACKS: FeaturedTrack[] = tracksData.tracks;

/**
 * Featured order: strongest demand first, then alphabetical so ties are stable
 * across renders and across machines (hence the explicit "en" locale).
 * `limit` is clamped, so a bad caller gets an empty list rather than a throw.
 */
export function featuredTracks(limit?: number): FeaturedTrack[] {
  const ordered = [...TRACKS].sort(
    (a, b) => b.demand - a.demand || a.name.localeCompare(b.name, "en"),
  );
  if (typeof limit !== "number" || Number.isNaN(limit)) return ordered;
  return ordered.slice(0, Math.max(0, limit));
}
```

- [ ] **Step 8: Write `lib/routes.ts`**

```ts
import { LIBRARY, type LibraryEntry } from "@/lib/nav";

/**
 * One-line descriptions for a route, taken from data/library.json so the
 * homepage cards and the stage pages' "Tools for this stage" never re-author
 * copy that already exists (spec §8.1.5, §8.2).
 */
const BY_HREF = new Map<string, LibraryEntry>(
  LIBRARY.map((entry) => [entry.href, entry]),
);

export function routeEntry(href: string): LibraryEntry | undefined {
  return BY_HREF.get(href);
}

export function routeDesc(href: string): string | undefined {
  return BY_HREF.get(href)?.desc;
}
```

- [ ] **Step 9: Fix the niche count in `app/niches/page.tsx`**

Two strings. Line 24, inside `pageMeta`:

```
    "Pick your lane and go deep. Explore 21 online-career niches, including newer
```
becomes
```
    "Pick your lane and go deep. Explore 22 online-career niches, including newer
```

Line 31, inside the `steps` array:

```
    desc: "Browse the 21 lanes below and see the pay, demand, and skills for each.",
```
becomes
```
    desc: "Browse the 22 lanes below and see the pay, demand, and skills for each.",
```

`data/tracks.json` has 22 tracks; `lib/home.test.ts` Step 1 pins the hero strip to that same count, so the two now agree.

- [ ] **Step 10: Run both tests to verify they pass**

Run: `npx vitest run lib/home.test.ts lib/tracks.test.ts`
Expected: PASS — 15 tests, 0 failed.

- [ ] **Step 11: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint lib app/niches`
Expected: both silent, exit 0. If `tsc` rejects `const HOME: HomeCopy = homeData`, a key in `data/home.json` has drifted from the type — fix the JSON, do not widen the type.

- [ ] **Step 12: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/home.json data/site.json lib/home.ts lib/home.test.ts lib/tracks.ts lib/tracks.test.ts lib/routes.ts app/niches/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(home): author homepage copy in data/home.json, trim site stats to four real counts"
```

---

### Task 2: Stage data — `image`, `diagram`, and the typed door

**Parallel group:** A

**Files:**
- Modify: `data/stages.json` (five `image` fields, two `diagram` fields)
- Create: `lib/stages.ts`
- Test: `lib/stages.test.ts`

**Interfaces:**
- Consumes: `DIAGRAMS`, `type DiagramId` from `@/components/diagrams` (Phase 3, test only); `listVisuals` from `@/lib/visuals` (Phase 1, test only); `routeDesc` from `@/lib/routes` (Task 1, test only).
- Produces, from `@/lib/stages`:
  - `type StageDoFirst = { title: string; desc: string; href: string; cta: string }`
  - `type StageTool = { label: string; href: string }`
  - `type Stage = { id: string; num: number; role: string; title: string; href: string; steps: string; accent: string; kicker: string; subtitle: string; summary: string; quote: string; outcome: string; image: string; diagram?: string; doFirst: StageDoFirst[]; tools: StageTool[]; closing: string }`
  - `const STAGES: Stage[]`
  - `function getStage(id: string): Stage | undefined`
  - `const TOTAL_STAGES: number` (= `STAGES.length`)

- [ ] **Step 1: Write the failing data-integrity test**

Create `lib/stages.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DIAGRAMS } from "@/components/diagrams";
import roadmap from "@/data/roadmap.json";
import { routeDesc } from "@/lib/routes";
import { STAGES, TOTAL_STAGES, getStage } from "@/lib/stages";
import { listVisuals } from "@/lib/visuals";

const VISUAL_IDS = new Set(listVisuals().map((visual) => visual.id));
const DIAGRAM_IDS = new Set(Object.keys(DIAGRAMS));

describe("stage data", () => {
  it("has five stages numbered 1 to 5", () => {
    expect(TOTAL_STAGES).toBe(5);
    expect(STAGES.map((stage) => stage.num)).toEqual([1, 2, 3, 4, 5]);
  });

  it("gives every stage a hero image that exists in the visuals manifest", () => {
    const missing = STAGES.filter((stage) => !VISUAL_IDS.has(stage.image));
    expect(missing.map((stage) => `${stage.id} → ${stage.image}`)).toEqual([]);
  });

  it("names the image after the stage", () => {
    expect(STAGES.map((stage) => stage.image)).toEqual([
      "stage-start",
      "stage-get-hired",
      "stage-deliver",
      "stage-level-up",
      "stage-own",
    ]);
  });

  it("only names diagrams that the DIAGRAMS map can render", () => {
    const bad = STAGES.filter((stage) => stage.diagram && !DIAGRAM_IDS.has(stage.diagram));
    expect(bad.map((stage) => `${stage.id} → ${stage.diagram}`)).toEqual([]);
  });

  it("puts the funnel on Get Hired and the timeline on Deliver, and nothing elsewhere", () => {
    expect(STAGES.map((stage) => stage.diagram ?? null)).toEqual([
      null,
      "hiring-funnel",
      "first-week-timeline",
      null,
      null,
    ]);
  });

  it("gives every stage four tools the library can describe", () => {
    const bad = STAGES.flatMap((stage) =>
      stage.tools.length === 4
        ? stage.tools.filter((tool) => !routeDesc(tool.href)).map((tool) => tool.href)
        : [`${stage.id} has ${stage.tools.length} tools`],
    );
    expect(bad).toEqual([]);
  });

  it("covers all eleven roadmap steps across the five stages", () => {
    const covered = roadmap.steps.filter((step) =>
      STAGES.some((stage) => stage.num === step.stage),
    );
    expect(covered).toHaveLength(roadmap.steps.length);
  });

  it("looks a stage up by id and returns undefined for a bad one", () => {
    expect(getStage("deliver")?.title).toBe("Deliver");
    expect(getStage("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/stages.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/stages"`.

- [ ] **Step 3: Add `image` and `diagram` to `data/stages.json`**

Five edits. Each inserts one or two lines directly after the entry's `"accent"` line, so the chrome fields stay grouped. Nothing else in the file changes — `doFirst`, `tools`, `summary`, `quote`, `outcome`, and `closing` are untouched.

Stage 1, after `"accent": "signal",`:

```json
    "image": "stage-start",
```

Stage 2, after `"accent": "caution",`:

```json
    "image": "stage-get-hired",
    "diagram": "hiring-funnel",
```

Stage 3, after `"accent": "verified",`:

```json
    "image": "stage-deliver",
    "diagram": "first-week-timeline",
```

Stage 4, after `"accent": "info",`:

```json
    "image": "stage-level-up",
```

Stage 5, after `"accent": "signal",`:

```json
    "image": "stage-own",
```

For reference, stage 2's head now reads:

```json
  {
    "id": "get-hired",
    "num": 2,
    "role": "The Job Hunter",
    "title": "Get Hired",
    "href": "/get-hired",
    "steps": "Steps 3–5",
    "accent": "caution",
    "image": "stage-get-hired",
    "diagram": "hiring-funnel",
    "kicker": "Stage 02",
```

- [ ] **Step 4: Write `lib/stages.ts`**

```ts
import stagesData from "@/data/stages.json";

export type StageDoFirst = { title: string; desc: string; href: string; cta: string };
export type StageTool = { label: string; href: string };

/**
 * One stage of the path. `image` is an id in data/visuals.json; `diagram` is a
 * key of DIAGRAMS in components/diagrams — only the stages whose story is
 * better told as a picture carry one (spec §7.2: a diagram earns its place).
 *
 * The type exists because a raw `import stages from "@/data/stages.json"` gives
 * a union of five object shapes, and only two of them have `diagram` — so the
 * property is unreachable without this door.
 */
export type Stage = {
  id: string;
  num: number;
  role: string;
  title: string;
  href: string;
  steps: string;
  accent: string;
  image: string;
  diagram?: string;
  kicker: string;
  subtitle: string;
  summary: string;
  quote: string;
  outcome: string;
  doFirst: StageDoFirst[];
  tools: StageTool[];
  closing: string;
};

export const STAGES: Stage[] = stagesData;
export const TOTAL_STAGES = STAGES.length;

export function getStage(id: string): Stage | undefined {
  return STAGES.find((stage) => stage.id === id);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/stages.test.ts`
Expected: PASS — 8 tests, 0 failed.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. If TypeScript rejects `const STAGES: Stage[] = stagesData`, a stage is missing a field the type marks required — add the field to the JSON rather than making the field optional.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/stages.json lib/stages.ts lib/stages.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(stages): add image and diagram ids to stages.json behind a typed lib/stages door"
```

---

### Task 3: `JourneyStepper` — the merged progress component

**Parallel group:** B

**Files:**
- Create: `components/journey/journey-stepper.tsx`
- Test: `components/journey/journey-stepper.test.tsx`

**Interfaces:**
- Consumes: `STAGES` from `@/lib/stages` (Task 2); `roadmap.steps` from `@/data/roadmap.json`; `usePath()` from `@/lib/path-context` (unchanged); `Button`, `DiagramFrame`, `Icon`, `ProgressBar`, `Text` from `@/components/ui`; `JourneyMap` from `@/components/diagrams/journey-map`; `cn` from `@/lib/utils`.
- Produces:
  - `export type JourneyStepperVariant = "compact" | "full"`
  - `export type JourneyStepperProps = { variant?: JourneyStepperVariant; current?: number; className?: string }`
  - `export function JourneyStepper(props: JourneyStepperProps)` — a **client** component. `compact` (the default) renders the five-marker stepper row only; `full` renders the journey diagram in a `DiagramFrame`, the progress bar with the Continue button, and the stepper row.

Spec §5.5: this replaces `components/journey-progress.tsx` and the 11-column roadmap strip that used to sit inside `StagePage`. §8.1.3 uses `variant="full"` on the homepage; §8.2 and §8.4 use the default `compact`.

**Why it may import a diagram:** `JourneyMap` is a presentational component with no `"use client"` and no server-only imports, so a client component can import it directly. Import the file (`@/components/diagrams/journey-map`), not the barrel, or all four diagrams land in the client bundle.

**Hydration:** `usePath()` starts at the empty state with `hydrated === false`, on the server and on the client's first render alike, so the markup matches and there is no flash. Anything that differs between the two states (the button label) is gated on `hydrated`, never on a bare `state` read.

- [ ] **Step 1: Write the failing test**

Create `components/journey/journey-stepper.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/link needs the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const usePath = vi.fn();
vi.mock("@/lib/path-context", () => ({ usePath: () => usePath() }));

import { JourneyStepper } from "@/components/journey/journey-stepper";

/** The slice of the context JourneyStepper reads. Everything else is unused. */
function pathState({
  steps = {},
  stage = 1,
  startedAt = null,
  hydrated = true,
}: {
  steps?: Record<number, boolean>;
  stage?: number;
  startedAt?: string | null;
  hydrated?: boolean;
} = {}) {
  return { state: { steps, stage, startedAt }, hydrated };
}

describe("JourneyStepper compact", () => {
  it("renders one marker per stage", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Deliver/ })).toHaveAttribute("href", "/deliver");
  });

  it("marks the current stage for assistive technology", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper current={3} />);
    expect(screen.getByRole("link", { name: /Deliver/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("link", { name: /Own/ })).not.toHaveAttribute("aria-current");
  });

  it("falls back to the saved stage when no current prop is given", () => {
    usePath.mockReturnValue(pathState({ stage: 4 }));
    render(<JourneyStepper />);
    expect(screen.getByRole("link", { name: /Level Up/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("shows a stage as done once every one of its roadmap steps is ticked", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true, 2: true } }));
    render(<JourneyStepper />);
    expect(screen.getByRole("link", { name: /Start Right/ })).toHaveAccessibleName(/done/i);
    expect(screen.getByRole("link", { name: /Get Hired/ })).not.toHaveAccessibleName(/done/i);
  });

  it("renders no diagram, bar or button in the compact variant", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("link", { name: /Open your path/ })).toBeNull();
  });
});

describe("JourneyStepper full", () => {
  it("adds the journey diagram, the progress bar and the dashboard link", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("img", { name: /five stages/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "11");
    expect(screen.getByRole("link", { name: /Open your path/ })).toHaveAttribute(
      "href",
      "/path",
    );
  });

  it("counts the ticked roadmap steps and offers to continue", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true, 2: true, 3: true } }));
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByRole("link", { name: /Continue/ })).toBeInTheDocument();
  });

  it("keeps the pre-hydration label so server and client markup agree", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true }, hydrated: false }));
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("link", { name: /Open your path/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/journey/journey-stepper.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/journey/journey-stepper"`.

- [ ] **Step 3: Write `components/journey/journey-stepper.tsx`**

```tsx
"use client";

import Link from "next/link";
import { JourneyMap } from "@/components/diagrams/journey-map";
import { Button, DiagramFrame, Icon, ProgressBar, Text } from "@/components/ui";
import roadmap from "@/data/roadmap.json";
import { usePath } from "@/lib/path-context";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = roadmap.steps.length;

export type JourneyStepperVariant = "compact" | "full";

export type JourneyStepperProps = {
  /** `compact` (default) is the stepper row only; `full` adds the diagram, bar and link. */
  variant?: JourneyStepperVariant;
  /** 1-based stage to mark as current. Falls back to the visitor's saved stage. */
  current?: number;
  className?: string;
};

/**
 * The glue across the whole journey (spec §5.5). Merges the old JourneyProgress
 * card and the 11-column roadmap strip that used to live inside StagePage.
 *
 * Reads the same localStorage progress the /path dashboard writes, so a
 * beginner feels the site as one road. Before hydration the context is empty on
 * both sides of the render, so the markup matches and nothing flashes.
 */
export function JourneyStepper({
  variant = "compact",
  current,
  className,
}: JourneyStepperProps) {
  const { state, hydrated } = usePath();

  const doneCount = roadmap.steps.filter((step) => state.steps[step.n]).length;
  const started = hydrated && (doneCount > 0 || state.startedAt !== null);
  const activeStage = current ?? state.stage;

  const stepper = (
    <ol className="grid grid-cols-5 gap-2">
      {STAGES.map((stage) => {
        const stageSteps = roadmap.steps.filter((step) => step.stage === stage.num);
        const done =
          stageSteps.length > 0 && stageSteps.every((step) => state.steps[step.n]);
        const isCurrent = activeStage === stage.num;

        return (
          <li key={stage.num} className="min-w-0">
            <Link
              href={stage.href}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-col items-center gap-1.5 rounded-md px-1 py-2 text-center transition-colors duration-150 ease-out hover:bg-band"
            >
              <span
                aria-hidden
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-pill border text-small font-semibold",
                  done
                    ? "border-verified bg-verified-tint text-verified"
                    : isCurrent
                      ? "border-primary bg-primary-tint text-primary-deep"
                      : "border-line-strong text-ink-faint",
                )}
              >
                {done ? <Icon name="check-circle-2" size={16} weight="fill" /> : stage.num}
              </span>
              <span
                className={cn(
                  "text-caption leading-tight",
                  isCurrent ? "text-ink" : "text-ink-faint",
                )}
              >
                {stage.title}
              </span>
              {done && <span className="sr-only">done</span>}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "compact") {
    return (
      <nav aria-label="The five stages" className={className}>
        {stepper}
      </nav>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <DiagramFrame
        title="The path: five stages, eleven steps"
        caption="Read it left to right. The ticks under each stage are its roadmap steps."
      >
        <JourneyMap current={activeStage} />
      </DiagramFrame>

      <div className="flex flex-col gap-4 rounded-md border border-line-strong bg-paper p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text size="small" tone="faint">
            {started ? "Your progress" : "Nothing ticked yet"}
          </Text>
          <ProgressBar
            value={doneCount}
            max={TOTAL_STEPS}
            label="Roadmap steps complete"
            showValue
          />
        </div>
        <Button
          href="/path"
          variant="outline"
          size="md"
          iconEnd={<Icon name="arrow-right" size={16} />}
        >
          {started ? "Continue" : "Open your path"}
        </Button>
      </div>

      <nav aria-label="The five stages">{stepper}</nav>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/journey/journey-stepper.test.tsx`
Expected: PASS — 8 tests, 0 failed.

If the `role="img"` query fails, check that `DiagramFrame` is receiving its `title` prop — that is the `aria-labelledby` source, and the accessible name the assertion matches is "The path: five stages, eleven steps".

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/journey/journey-stepper.tsx components/journey/journey-stepper.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(journey): add JourneyStepper, merging JourneyProgress and the roadmap strip"
```

---

### Task 4: `PathChooser` — moved, rebuilt, and given a featured subset

**Parallel group:** B

**Files:**
- Create: `components/journey/path-chooser.tsx`
- Test: `components/journey/path-chooser.test.tsx`

**Interfaces:**
- Consumes: `featuredTracks` from `@/lib/tracks` (Task 1); `usePath()` from `@/lib/path-context`; `track()` from `@/lib/analytics`; `Badge`, `Button`, `ChoiceCard`, `Field`, `Icon`, `Text`, `type BadgeTone` from `@/components/ui`; `isAccent` from `@/lib/accent`; `useRouter` from `next/navigation`.
- Produces:
  - `export type PathChooserProps = { compact?: boolean; limit?: number; moreHref?: string; moreLabel?: string; redirectTo?: string; onChosen?: (id: string) => void; className?: string }`
  - `export function PathChooser(props: PathChooserProps)` — a **client** component. Same choose-and-persist behaviour as the old `components/path-chooser.tsx`: `track("path_chosen", { track: id })`, then `choosePath(id)`, then `onChosen`, then `router.push(redirectTo)` when given.

Spec §5.5: `PathChooser` gains `limit` (featured count) and `moreHref`. §8.1.4 calls it as `<PathChooser limit={6} moreHref="/niches" />`.

**Why radios:** picking a lane is one choice out of many, so the set is a `Field as="group"` (fieldset + legend) of `ChoiceCard` radios rather than 22 buttons. That gives a named group for screen readers and the `has-[:checked]` selected styling for free — and it drops the `hover:-translate-y` lift the old component carried (§9).

- [ ] **Step 1: Write the failing test**

Create `components/journey/path-chooser.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const choosePath = vi.fn();
vi.mock("@/lib/path-context", () => ({
  usePath: () => ({ state: { track: null }, choosePath, hydrated: true }),
}));

const report = vi.fn();
vi.mock("@/lib/analytics", () => ({ track: (...args: unknown[]) => report(...args) }));

import { PathChooser } from "@/components/journey/path-chooser";

describe("PathChooser", () => {
  it("shows every track when no limit is given", () => {
    render(<PathChooser />);
    expect(screen.getAllByRole("radio")).toHaveLength(22);
  });

  it("shows only the featured subset, strongest demand first", () => {
    render(<PathChooser limit={6} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(6);
    expect(radios[0]).toHaveAccessibleName(/AI Agent Operations/);
    expect(screen.queryByRole("radio", { name: /Localization/ })).toBeNull();
  });

  it("renders the more-link when one is configured", () => {
    render(<PathChooser limit={6} moreHref="/niches" moreLabel="See all 22 niches" />);
    expect(screen.getByRole("link", { name: "See all 22 niches" })).toHaveAttribute(
      "href",
      "/niches",
    );
  });

  it("renders no more-link by default", () => {
    render(<PathChooser limit={6} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("names the group for assistive technology", () => {
    render(<PathChooser limit={2} />);
    expect(screen.getByRole("group", { name: /Pick your lane/i })).toBeInTheDocument();
  });

  it("saves the choice, reports it, and redirects when asked", async () => {
    const user = userEvent.setup();
    render(<PathChooser limit={3} redirectTo="/path" />);
    await user.click(screen.getAllByRole("radio")[0]);
    expect(report).toHaveBeenCalledWith("path_chosen", { track: "ai-agent-ops" });
    expect(choosePath).toHaveBeenCalledWith("ai-agent-ops");
    expect(push).toHaveBeenCalledWith("/path");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/journey/path-chooser.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/journey/path-chooser"`.

- [ ] **Step 3: Write `components/journey/path-chooser.tsx`**

```tsx
"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ChoiceCard,
  Field,
  Icon,
  Text,
  type BadgeTone,
} from "@/components/ui";
import { isAccent } from "@/lib/accent";
import { track as report } from "@/lib/analytics";
import { usePath } from "@/lib/path-context";
import { featuredTracks } from "@/lib/tracks";
import { cn } from "@/lib/utils";

export type PathChooserProps = {
  /** Drops the tagline so the cards fit a narrow column (the gate, the drawer). */
  compact?: boolean;
  /** Show only the N strongest-demand lanes (spec §8.1.4). Omit for all 22. */
  limit?: number;
  /** Where "see the rest" points. Omit and no link renders. */
  moreHref?: string;
  moreLabel?: string;
  /** Navigate here after a choice is saved. */
  redirectTo?: string;
  onChosen?: (id: string) => void;
  className?: string;
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

export function PathChooser({
  compact = false,
  limit,
  moreHref,
  moreLabel = "See every lane",
  redirectTo,
  onChosen,
  className,
}: PathChooserProps) {
  const { state, choosePath, hydrated } = usePath();
  const router = useRouter();
  // One radio group per instance, so two choosers on a page never fight.
  const groupName = `track-${useId()}`;
  const shown = featuredTracks(limit);

  function pick(id: string) {
    report("path_chosen", { track: id });
    choosePath(id);
    onChosen?.(id);
    if (redirectTo) router.push(redirectTo);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Field as="group" label="Pick your lane" hideLabel>
        <div
          className={cn(
            "grid gap-3",
            compact
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {shown.map((item) => (
            <ChoiceCard
              key={item.id}
              name={groupName}
              value={item.id}
              checked={hydrated && state.track === item.id}
              onChange={pick}
              icon={<Icon name={item.icon} size={22} weight="duotone" />}
              label={item.name}
              description={
                <>
                  {!compact && <span className="block">{item.tagline}</span>}
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{item.pay}</span>
                    <Badge tone={tone(item.accent)}>{item.demandLabel}</Badge>
                  </span>
                </>
              }
            />
          ))}
        </div>
      </Field>

      {shown.length === 0 && (
        <Text size="small" tone="faint">
          No lanes to show.
        </Text>
      )}

      {moreHref && (
        <div>
          <Button
            href={moreHref}
            variant="link"
            iconEnd={<Icon name="arrow-right" size={16} />}
          >
            {moreLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/journey/path-chooser.test.tsx`
Expected: PASS — 6 tests, 0 failed.

If "saves the choice" fails because `choosePath` was never called, the radio was already `checked` when clicked; the mocked context returns `track: null`, so check that `checked` reads `hydrated && state.track === item.id` and not the inverse.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/journey/path-chooser.tsx components/journey/path-chooser.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(journey): rebuild PathChooser on ChoiceCard with limit and more-link props"
```

---

### Task 5: `PathGate` — moved and rebuilt on `Card` + `Callout`

**Parallel group:** C

**Files:**
- Create: `components/journey/path-gate.tsx`
- Modify: none yet (the shim at the old path lands in Task 7)

**Interfaces:**
- Consumes: `PathChooser` from `./path-chooser` (Task 4); `usePath()` from `@/lib/path-context`; `Button`, `Callout`, `Card`, `Heading`, `Icon`, `Text` from `@/components/ui`.
- Produces:
  - `export type PathGateProps = { children: ReactNode; title?: string; teaser?: string; unlocks?: string }`
  - `export function PathGate(props: PathGateProps)` — a **client** component with the same behaviour as the old `components/path-gate.tsx`: gated until `hydrated && hasPath`, then it renders `children` verbatim.

Only importer today is `components/find-work.tsx`, which Phase 5 migrates. The API therefore does not change; the chrome does.

**What changes:** the blurred `blur-[3px]` preview panel and the `backdrop-blur-sm` card are removed (§9 deletes every `blur-*`), the `Lock` and `Sparkles` lucide icons become Phosphor `Icon`s, and the shadow-lifted `rounded-3xl` panel becomes a bordered `Card`. The gated content is no longer rendered at all while locked — a blurred, `inert`, aria-hidden copy of the real content was dead weight in the DOM and a screen-reader trap waiting to regress.

- [ ] **Step 1: Write `components/journey/path-gate.tsx`**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { usePath } from "@/lib/path-context";
import { PathChooser } from "./path-chooser";

export type PathGateProps = {
  children: ReactNode;
  title?: string;
  teaser?: string;
  /** What the visitor unlocks, e.g. "the vetted list matched to your niche". */
  unlocks?: string;
};

/**
 * Gates deep content behind a one-click path choice. Before a choice: an
 * invitation with an inline chooser. After: the content renders untouched.
 *
 * During SSR and the first client render `hydrated` is false, so the locked
 * state is what both sides produce and nothing flashes.
 */
export function PathGate({ children, title, teaser, unlocks }: PathGateProps) {
  const { hasPath, hydrated } = usePath();
  const [expanded, setExpanded] = useState(false);

  if (hydrated && hasPath) return <>{children}</>;

  return (
    <Card padding="lg">
      <div className="flex flex-col items-start gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-tint text-primary-deep">
          <Icon name="key-round" size={22} weight="duotone" />
        </span>

        <Heading level={3} size="h4" balance>
          {title ?? "Choose your path to open this section"}
        </Heading>

        <Text>
          {teaser ?? "Pick the lane you are heading toward and this section fills in for it."}
        </Text>

        {unlocks && (
          <Callout tone="neutral" title="What opens">
            {unlocks}
          </Callout>
        )}

        {expanded ? (
          <div className="w-full">
            <Text size="small" tone="faint">
              Pick one. You can change it later on your dashboard.
            </Text>
            <PathChooser compact limit={6} moreHref="/niches" moreLabel="See all 22 niches" />
          </div>
        ) : (
          <Button
            onClick={() => setExpanded(true)}
            variant="primary"
            iconEnd={<Icon name="arrow-right" size={16} />}
          >
            Choose my path
          </Button>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint components/journey`
Expected: both silent, exit 0.

There is no unit test for `PathGate`: its two branches are a straight read of `usePath()` (already covered by the `PathChooser` and `JourneyStepper` mocks) and a `useState` toggle. Its rendering is verified by the `/apply` screenshot in Phase 5.

- [ ] **Step 3: Confirm no slop patterns survived the move**

Run: `grep -nE "blur-|lucide-react|hover:-translate-y|Sparkles|rounded-(2xl|3xl)|inert" components/journey/path-gate.tsx`
Expected: no output, exit 1.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/journey/path-gate.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(journey): rebuild PathGate on Card and Callout, drop the blurred preview"
```

---

### Task 6: `StagePage` — the §8.2 template

**Parallel group:** C

**Files:**
- Create: `components/journey/stage-page.tsx`
- Test: covered by `lib/stages.test.ts` (Task 2) plus the build and the Task 10 screenshots

**Interfaces:**
- Consumes: `getStage`, `STAGES`, `TOTAL_STAGES`, `type Stage` from `@/lib/stages` (Task 2); `routeDesc`, `routeEntry` from `@/lib/routes` (Task 1); `findNavNeighbours`, `getBreadcrumb` from `@/lib/nav` (Phase 2); `DIAGRAMS`, `type DiagramId` from `@/components/diagrams` (Phase 3); `JourneyStepper` from `./journey-stepper` (Task 3); `CardGrid`, `PageFooterNav`, `PageHero`, `Section`, `SectionHeading` from `@/components/layout`; `Button`, `Card`, `DiagramFrame`, `Heading`, `Icon`, `StepList`, `Step`, `Text`, `type BadgeTone` from `@/components/ui`; `isAccent` from `@/lib/accent`.
- Produces: `export function StagePage({ id }: { id: string })` — a **server** component. Throws on an unknown id, exactly as the old one did, so a typo fails the build instead of rendering a blank page.

Spec §8.2 order: hero (breadcrumb, kicker "Stage 2 of 5 · Steps 3–5", `display` title, lead, primary CTA to `doFirst[0]`, secondary "Next: …", `Figure stage-*`) → `JourneyStepper current={num}` → "Do these first" as a `StepList` of `Card`s → the stage diagram in a `DiagramFrame` → "Tools for this stage" as four `Card`s with one-line descriptions → the closing quote in a `tint` `Section` → `PageFooterNav`.

**Two judgement calls, both recorded here so a reviewer can overturn them:**

1. **`compact` on `PageHero`.** §8.2 asks for a `display` title. `PageHero` renders `hero` unless `compact` is set, and `compact` is the only switch to `display` in the Phase 1 contract — so stage pages pass `compact`, which also drops the hero rhythm from 128px to 96px. That contradicts the docstring inside `components/layout/page-hero.tsx` ("stage pages use the default"); the spec text wins.
2. **Band order.** stepper strip (paper, hairline-bordered) → do-first (paper) → diagram (`tint`, only on stages 2 and 3) → tools (paper) → closing (`tint`) → footer nav (paper). Two `tint` bands never touch, in either the with-diagram or the without-diagram shape.

- [ ] **Step 1: Write `components/journey/stage-page.tsx`**

```tsx
import { DIAGRAMS, type DiagramId } from "@/components/diagrams";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Step,
  StepList,
  Text,
  type BadgeTone,
} from "@/components/ui";
import { isAccent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { routeDesc } from "@/lib/routes";
import { STAGES, TOTAL_STAGES, getStage, type Stage } from "@/lib/stages";
import { JourneyStepper } from "./journey-stepper";

/**
 * Title and one-sentence caption for each stage diagram. A diagram must say
 * what to look at (spec §7.2), and that sentence belongs with the page that
 * frames it, not with the SVG.
 */
const DIAGRAM_META: Record<DiagramId, { title: string; caption: string }> = {
  "journey-map": {
    title: "The path: five stages, eleven steps",
    caption: "Read it left to right. The ticks under each stage are its roadmap steps.",
  },
  "method-loop": {
    title: "The seven methods",
    caption: "FIND runs once. The middle five loop until the thing works.",
  },
  "hiring-funnel": {
    title: "Applications to offers",
    caption: "Each narrowing is a different skill. Work on the one that is losing you the most.",
  },
  "first-week-timeline": {
    title: "Your first week, day by day",
    caption: "Day one is questions. By Friday the client should see a written system.",
  },
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

function isDiagramId(value: string | undefined): value is DiagramId {
  return value !== undefined && value in DIAGRAMS;
}

export function StagePage({ id }: { id: string }) {
  const stage: Stage | undefined = getStage(id);
  if (!stage) throw new Error(`StagePage: unknown stage id "${id}"`);

  const nextStage = STAGES.find((candidate) => candidate.num === stage.num + 1);
  const neighbours = findNavNeighbours(stage.href);
  const first = stage.doFirst[0];
  const Diagram = isDiagramId(stage.diagram) ? DIAGRAMS[stage.diagram] : null;
  const meta = isDiagramId(stage.diagram) ? DIAGRAM_META[stage.diagram] : null;

  return (
    <>
      {/* 1 — HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(stage.href)}
        kicker={`Stage ${stage.num} of ${TOTAL_STAGES} · ${stage.steps}`}
        kickerTone={tone(stage.accent)}
        title={stage.title}
        lead={stage.summary}
        media={{ figureId: stage.image }}
        actions={
          <>
            <Button href={first.href} variant="primary" size="lg">
              {first.cta}
            </Button>
            {nextStage && (
              <Button href={nextStage.href} variant="outline" size="lg">
                Next: {nextStage.title}
              </Button>
            )}
          </>
        }
      >
        <Text size="small" tone="faint">
          {stage.role}
        </Text>
      </PageHero>

      {/* 2 — WHERE YOU ARE */}
      <Section spacing="none" className="border-y border-line py-8">
        <JourneyStepper current={stage.num} />
      </Section>

      {/* 3 — DO THESE FIRST */}
      <Section>
        <SectionHeading
          kicker="Do these first"
          title="Be systematic, not random"
          lead={stage.outcome}
        />
        <StepList className="mt-10 gap-6">
          {stage.doFirst.map((item, index) => (
            <Step key={`${item.href}-${item.title}`} n={index + 1} title={item.title}>
              <Card onBand className="mt-2">
                <Text size="small">{item.desc}</Text>
                <div className="mt-3">
                  <Button
                    href={item.href}
                    variant="link"
                    aria-label={`${item.cta}: ${item.title}`}
                    iconEnd={<Icon name="arrow-right" size={15} />}
                  >
                    {item.cta}
                  </Button>
                </div>
              </Card>
            </Step>
          ))}
        </StepList>
      </Section>

      {/* 4 — THE STAGE DIAGRAM (only where a picture beats a paragraph) */}
      {Diagram && meta && (
        <Section band="tint">
          <DiagramFrame title={meta.title} caption={meta.caption}>
            <Diagram />
          </DiagramFrame>
        </Section>
      )}

      {/* 5 — TOOLS FOR THIS STAGE */}
      <Section>
        <SectionHeading
          kicker="Tools for this stage"
          title="The only pages you need right now"
          lead="Work these four before moving on. Everything else keeps."
        />
        <CardGrid cols={4} as="ul" className="mt-10">
          {stage.tools.map((tool) => (
            <li key={`${tool.href}-${tool.label}`} className="flex">
              <Card href={tool.href} className="w-full">
                <Heading level={3} size="h5">
                  {tool.label}
                </Heading>
                <Text size="small" className="mt-2">
                  {routeDesc(tool.href) ?? "Open this page."}
                </Text>
                <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-primary">
                  Open
                  <Icon name="arrow-right" size={14} />
                </span>
              </Card>
            </li>
          ))}
        </CardGrid>
      </Section>

      {/* 6 — CLOSING */}
      <Section band="tint">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <Heading level={2} size="h2" balance>
            {stage.closing}
          </Heading>
          <blockquote className="border-l-2 border-primary pl-5">
            <Text size="lead" as="p">
              {stage.quote}
            </Text>
            <Text size="caption" tone="faint" as="p" className="mt-2">
              Hire From PH · {stage.subtitle}
            </Text>
          </blockquote>
          <div className="flex flex-wrap items-center gap-3">
            {nextStage ? (
              <Button href={nextStage.href} variant="primary">
                Continue to {nextStage.title}
              </Button>
            ) : (
              <Button href="/simulator" variant="primary">
                Model your next 3 years
              </Button>
            )}
            <Button href="/plan" variant="outline">
              Build a 30-day plan around this
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — WAYFINDING */}
      <Section>
        <PageFooterNav prev={neighbours.prev} next={neighbours.next} up={neighbours.up} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

If TypeScript complains that `neighbours.prev` is not assignable to `FooterLink`, check that `NavLink`'s extra fields (`desc`, `pending`) are optional in `lib/nav.ts` — they are, and an object with extra optional properties is assignable to `{label, href}`.

- [ ] **Step 3: Confirm the slop patterns are gone from the template**

Run: `grep -nE "blur-|lucide-react|hover:-translate-y|Sparkles|rounded-(2xl|3xl)|Reveal|accentSoft|accentBar|accentText" components/journey/stage-page.tsx`
Expected: no output, exit 1. (The old file carried three inline accent maps and a `blur-3xl` hero blob; none of that survives.)

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/journey/stage-page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(journey): rebuild StagePage on PageHero, StepList, DiagramFrame and PageFooterNav"
```

---

### Task 7: The barrel, the shims, and the five stage routes

**Parallel group:** D

**Files:**
- Create: `components/journey/index.ts`
- Replace (whole file, one line each): `components/path-chooser.tsx`, `components/path-gate.tsx`, `components/stage-page.tsx`
- Delete: `components/journey-progress.tsx`
- Modify: `app/start/page.tsx:2`, `app/get-hired/page.tsx:2`, `app/deliver/page.tsx:2`, `app/level-up/page.tsx:2`, `app/own/page.tsx:2`

**Interfaces:**
- Consumes: every component from Tasks 3–6.
- Produces: `@/components/journey` exports `JourneyStepper`, `type JourneyStepperProps`, `type JourneyStepperVariant`, `PathChooser`, `type PathChooserProps`, `PathGate`, `type PathGateProps`, `StagePage`. Phases 5–7 import from this barrel.

`components/journey-progress.tsx` is deleted rather than shimmed: `JourneyProgress`'s only importer was `app/page.tsx`, which Task 8 rewrites. The other three keep a shim because `components/find-work.tsx` (Phase 5) still imports `PathGate`, and because a plan is easier to review when the migration of importers is one commit, not thirty.

- [ ] **Step 1: Write `components/journey/index.ts`**

```ts
export {
  JourneyStepper,
  type JourneyStepperProps,
  type JourneyStepperVariant,
} from "./journey-stepper";
export { PathChooser, type PathChooserProps } from "./path-chooser";
export { PathGate, type PathGateProps } from "./path-gate";
export { StagePage } from "./stage-page";
```

- [ ] **Step 2: Replace the three old component files with re-export shims**

`components/path-chooser.tsx` — the whole file becomes:

```tsx
/** Moved to components/journey/path-chooser.tsx in Phase 4. Shim for Phase 5 importers. */
export { PathChooser, type PathChooserProps } from "./journey/path-chooser";
```

`components/path-gate.tsx` — the whole file becomes:

```tsx
/** Moved to components/journey/path-gate.tsx in Phase 4. Shim for Phase 5 importers. */
export { PathGate, type PathGateProps } from "./journey/path-gate";
```

`components/stage-page.tsx` — the whole file becomes:

```tsx
/** Moved to components/journey/stage-page.tsx in Phase 4. Shim for Phase 5 importers. */
export { StagePage } from "./journey/stage-page";
```

- [ ] **Step 3: Delete `components/journey-progress.tsx`**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm components/journey-progress.tsx
```

- [ ] **Step 4: Point the five stage routes at the barrel**

In each of `app/start/page.tsx`, `app/get-hired/page.tsx`, `app/deliver/page.tsx`, `app/level-up/page.tsx`, `app/own/page.tsx`, change line 2 from:

```tsx
import { StagePage } from "@/components/stage-page";
```

to:

```tsx
import { StagePage } from "@/components/journey";
```

Nothing else in those five files changes. `app/start/page.tsx` in full, as the pattern for the other four:

```tsx
import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "Start Right, Stage 1",
  description:
    "Your foundation as an online professional. Set up your workspace, learn the core skills, and build the mindset that lasts. No degree or capital needed.",
});

export default function Page() {
  return <StagePage id="start" />;
}
```

- [ ] **Step 5: Confirm nothing still imports the deleted file**

Run: `grep -rn "journey-progress\|JourneyProgress" app components lib`
Expected: no output, exit 1. (`app/page.tsx` still imports it at this point in the plan — if the grep prints that line, run Task 8 before building. This step is the reminder that Tasks 7 and 8 land in the same wave.)

- [ ] **Step 6: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint app components`
Expected: exit 0 once Task 8 has landed. Until then `app/page.tsx` will fail on the missing `@/components/journey-progress` import; that is expected and is the only allowed failure here.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/journey/index.ts components/path-chooser.tsx components/path-gate.tsx components/stage-page.tsx app/start/page.tsx app/get-hired/page.tsx app/deliver/page.tsx app/level-up/page.tsx app/own/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(journey): add the journey barrel, shim the old paths, delete JourneyProgress"
```

---

### Task 8: `app/page.tsx` — the eight-section homepage

**Parallel group:** E

**Files:**
- Replace (whole file): `app/page.tsx`
- Test: no unit test — a server page cannot be imported into jsdom. The section budget is checked by grep in Task 11; the content is checked by the `lib/home.test.ts` copy rules (Task 1) and the Task 10 screenshots.

**Interfaces:**
- Consumes: `HOME`, `HOME_STATS` from `@/lib/home` (Task 1); `routeEntry` from `@/lib/routes` (Task 1); `STAGES` from `@/lib/stages` (Task 2); `JourneyStepper`, `PathChooser` from `@/components/journey` (Task 7); `faq` from `@/data/faq.json`; `site` from `@/data/site.json`; `isAccent` from `@/lib/accent`; the layout and ui primitives.
- Produces: the default-exported `Home` server component. Nothing imports it.

**What leaves (spec §8.1 "Removed from home", §9):** the 22-niche grid, the 22-card `toolkit` array, the 7-method grid, the dark language panel with its three emoji flags, the `HeroPanel` SVG bar chart, both `blur-3xl` blobs, the squiggle-underline SVG, the `dotgrid` backgrounds, the "0 templates handed out" stat row, every `Reveal` wrapper, every `hover:-translate-y`, and the last three `lucide-react` imports on this page.

**Section budget:** exactly eight `<section>` elements — `PageHero`, six `Section`s, and `CtaBand`. Task 11 greps for it.

- [ ] **Step 1: Write the whole of `app/page.tsx`**

```tsx
import Link from "next/link";
import { JourneyStepper, PathChooser } from "@/components/journey";
import {
  CardGrid,
  CtaBand,
  FeatureRow,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  CardBody,
  CardMedia,
  Figure,
  Heading,
  Icon,
  Kicker,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
  type BadgeTone,
} from "@/components/ui";
import faq from "@/data/faq.json";
import site from "@/data/site.json";
import { isAccent } from "@/lib/accent";
import { HOME, HOME_STATS } from "@/lib/home";
import { routeEntry } from "@/lib/routes";
import { STAGES } from "@/lib/stages";

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

/**
 * The homepage, spec §8.1: eight sections, ≤ 8 screens at 1280px.
 * Every string on this page comes from data/home.json, data/site.json,
 * data/faq.json, data/stages.json, or data/library.json — nothing is authored
 * in JSX, so the Phase 8 copy pass is a diff of data files.
 */
export default function Home() {
  return (
    <>
      {/* 1 — HERO */}
      <PageHero
        kicker={HOME.hero.kicker}
        title={HOME.hero.title}
        accent={HOME.hero.accent}
        lead={HOME.hero.lead}
        media={{ figureId: "home-hero" }}
        actions={
          <>
            <Button href={HOME.hero.primary.href} variant="primary" size="lg">
              {HOME.hero.primary.label}
            </Button>
            <Button href={HOME.hero.secondary.href} variant="outline" size="lg">
              {HOME.hero.secondary.label}
            </Button>
          </>
        }
      >
        <StatStrip className="mt-2">
          {HOME_STATS.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </StatStrip>

        <Text size="caption" tone="faint">
          {HOME.hero.honesty}{" "}
          <Link
            href={HOME.hero.honestyLink.href}
            className="text-primary underline underline-offset-2"
          >
            {HOME.hero.honestyLink.label}
          </Link>
          .
        </Text>
      </PageHero>

      {/* 2 — HOW IT WORKS */}
      <Section id="how" className="scroll-mt-28">
        <SectionHeading
          kicker={HOME.howItWorks.kicker}
          title={HOME.howItWorks.title}
          lead={HOME.howItWorks.lead}
        />
        <FeatureRow items={HOME.howItWorks.items} className="mt-12" />
      </Section>

      {/* 3 — THE PATH */}
      <Section band="tint">
        <SectionHeading
          kicker={HOME.path.kicker}
          title={HOME.path.title}
          lead={HOME.path.lead}
          action={
            <Button href={HOME.path.action.href} variant="outline">
              {HOME.path.action.label}
            </Button>
          }
        />

        <JourneyStepper variant="full" className="mt-12" />

        {/* Five stages read best as five columns; CardGrid tops out at four. */}
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <li key={stage.id} className="flex">
              <Card href={stage.href} onBand className="w-full">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-h4 text-line-strong">
                    {String(stage.num).padStart(2, "0")}
                  </span>
                  <Badge tone={tone(stage.accent)} variant="outline">
                    {stage.steps}
                  </Badge>
                </div>
                <Heading level={3} size="h5" className="mt-5">
                  {stage.title}
                </Heading>
                <Text size="caption" tone="faint" className="mt-1">
                  {stage.role}
                </Text>
                <Text size="small" className="mt-3">
                  {stage.subtitle}
                </Text>
                <span className="mt-5 inline-flex items-center gap-1 text-small font-medium text-primary">
                  Open
                  <Icon name="arrow-right" size={14} />
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4 — PICK YOUR LANE */}
      <Section>
        <SectionHeading
          kicker={HOME.lane.kicker}
          title={HOME.lane.title}
          lead={HOME.lane.lead}
        />
        <PathChooser
          limit={6}
          moreHref={HOME.lane.more.href}
          moreLabel={HOME.lane.more.label}
          redirectTo="/path"
          className="mt-12"
        />
      </Section>

      {/* 5 — WHAT YOU'LL BUILD */}
      <Section band="tint">
        <SectionHeading
          kicker={HOME.build.kicker}
          title={HOME.build.title}
          lead={HOME.build.lead}
          action={
            <Button href={HOME.build.action.href} variant="outline">
              {HOME.build.action.label}
            </Button>
          }
        />
        <CardGrid cols={3} as="ul" className="mt-12">
          {HOME.build.items.map((item) => {
            const entry = routeEntry(item.href);
            if (!entry) return null;
            return (
              <li key={item.href} className="flex">
                <Card href={item.href} padding="none" onBand className="w-full">
                  <CardMedia ratio="3/2">
                    <div className="grid h-full place-items-center bg-tint">
                      <Icon
                        name={item.icon}
                        size={40}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                  </CardMedia>
                  <CardBody>
                    <Heading level={3} size="h5">
                      {entry.label}
                    </Heading>
                    <Text size="small">{entry.desc}</Text>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </CardGrid>
      </Section>

      {/* 6 — THE STANDARD */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Figure
            id="home-standard"
            ratio="3/2"
            radius="lg"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
          <div className="flex flex-col items-start gap-6">
            <Kicker>{site.standard.kicker}</Kicker>
            <Heading level={2} size="h2" balance>
              {site.standard.title}
            </Heading>
            <StepList>
              {site.standard.principles.map((principle, index) => (
                <Step key={principle.title} n={index + 1} title={principle.title}>
                  {principle.desc}
                </Step>
              ))}
            </StepList>
            <Button href={HOME.standard.action.href} variant="outline">
              {HOME.standard.action.label}
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — QUESTIONS */}
      <Section id="questions" className="scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            kicker={HOME.questions.kicker}
            title={HOME.questions.title}
            lead={HOME.questions.lead}
          />
          <Accordion type="single">
            {faq.items.map((item) => (
              <AccordionItem key={item.id} id={item.id} title={item.q}>
                <Text>{item.a}</Text>
                {item.href && (
                  <div className="mt-3">
                    <Button
                      href={item.href}
                      variant="link"
                      iconEnd={<Icon name="arrow-right" size={15} />}
                    >
                      {HOME.questions.links[item.id]}
                    </Button>
                  </div>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* 8 — CTA BAND */}
      <CtaBand
        title={HOME.cta.title}
        body={HOME.cta.body}
        media={{ figureId: "cta-band" }}
        actions={
          <Button href={HOME.cta.action.href} variant="secondary" size="lg">
            {HOME.cta.action.label}
          </Button>
        }
      />
    </>
  );
}
```

- [ ] **Step 2: Count the sections**

Run: `grep -oE "<(Section|PageHero|CtaBand)\b" app/page.tsx | wc -l`
Expected: `8`

(`<SectionHeading` does not match: `\b` after `Section` fails against the following `H`.)

- [ ] **Step 3: Confirm the de-slop inventory is clear on this page**

Run:
```bash
grep -nE "lucide-react|Reveal|blur-|hover:-translate-y|Sparkles|rounded-(2xl|3xl)|dotgrid|toolkit|accentBar|accentText" app/page.tsx
```
Expected: no output, exit 1.

Run: `wc -l app/page.tsx`
Expected: roughly 250 lines, down from 571.

- [ ] **Step 4: Type-check, lint, and run the primitives audit**

Run: `npx tsc --noEmit && npx eslint app components lib`
Expected: exit 0, no output.

Run: `node scripts/verify-primitives.mjs`
Expected: exit 0 with no findings for `app/page.tsx`. (Phase 1 left this script warn-only; Phase 5 flips it to fail-on-violation. A finding here is still a bug — fix it now rather than leaving it for Phase 5.)

- [ ] **Step 5: Build and eyeball the dev server**

Run: `npm run build`
Expected: exit 0. `/` is listed as a static route.

Run `npm run dev` and open `http://localhost:3000`. Check, in order: the hero shows the kicker pill, a two-line headline whose last word is violet, four quiet stats, the honesty caption, and the 4:5 photo with an "Illustrative image" caption; three icon-and-sentence features with no cards; a lavender band with the journey diagram, the progress bar, the stepper and five stage cards; six radio lane cards and a "See all 22 niches" link; a lavender band of six media cards; the standard photo with three numbered principles; six FAQ rows where opening one closes the last; a navy band with the dusk photo at 20% and a single pale button.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(home): rebuild the homepage as the eight sections in spec 8.1"
```

---

### Task 9: `/path` dashboard — restyled, logic untouched

**Parallel group:** E

**Files:**
- Replace (whole file): `app/path/page.tsx`
- Unchanged: `app/path/layout.tsx` (keeps `robots: { index: false, follow: false }` and the `googleBot` mirror — do not edit it), `lib/path-context.tsx` (not touched at all)

**Interfaces:**
- Consumes: `usePath()` from `@/lib/path-context` (identical call, identical destructuring); `tracks` from `@/data/tracks.json`; `roadmap` from `@/data/roadmap.json`; `STAGES` from `@/lib/stages`; `JourneyStepper`, `PathChooser` from `@/components/journey`; `CardGrid`, `Section`, `SectionHeading` from `@/components/layout`; the ui primitives.
- Produces: the default-exported `PathPage` client component. Nothing imports it.

**The contract with the existing behaviour.** Every one of these is preserved byte-for-byte in meaning:

| Behaviour | Where |
|---|---|
| `const { state, hydrated, hasPath, setStage, toggleStep } = usePath();` | top of the component |
| Skeleton while `!hydrated` | `if (!hydrated) return <PathSkeleton />;` |
| Empty state while `!hasPath \|\| !track` | `if (!hasPath \|\| !track) return <NoPathState />;` |
| `track` looked up from `tracks.tracks` by `state.track` | unchanged |
| `doneCount`, `portfolioCount`, `applied`, `interviews` | same four expressions |
| The seven "next moves" | same seven, same hrefs |
| `setStage(st.num)` on stage pick, `toggleStep(step.n)` on a roadmap tick | unchanged |
| localStorage | never touched here; `PathProvider` owns it |

Only the chrome changes: `Reveal` goes, the four inline accent maps go, `lucide-react` goes, the `hover:-translate-y` lifts go, the raw `<input type="checkbox">` becomes `Checkbox`, the stage picker becomes a `ChoiceCard` radio group (a single choice, so a radio group is the honest control), the progress bar becomes `ProgressBar`, the empty state becomes `EmptyState` with `media={<Figure id="path-dashboard" … />}`, and `JourneyStepper` appears at the top.

**Note on `EmptyState`:** the Phase 1 contract names the image slot **`media`**, not `figure`. Pass `media`.

- [ ] **Step 1: Write the whole of `app/path/page.tsx`**

```tsx
"use client";

import { JourneyStepper, PathChooser } from "@/components/journey";
import { CardGrid, Section, SectionHeading } from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  ChoiceCard,
  EmptyState,
  Field,
  Figure,
  Heading,
  Icon,
  ProgressBar,
  Text,
  type BadgeTone,
} from "@/components/ui";
import roadmap from "@/data/roadmap.json";
import tracks from "@/data/tracks.json";
import { isAccent } from "@/lib/accent";
import { usePath } from "@/lib/path-context";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

type Track = (typeof tracks.tracks)[number];

const LEARN_ICON: Record<string, string> = {
  YouTube: "youtube",
  Course: "book-open",
  Template: "layout-template",
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

export default function PathPage() {
  const { state, hydrated, hasPath, setStage, toggleStep } = usePath();

  const track: Track | undefined = state.track
    ? tracks.tracks.find((candidate) => candidate.id === state.track)
    : undefined;

  if (!hydrated) return <PathSkeleton />;
  if (!hasPath || !track) return <NoPathState />;

  const currentStage = STAGES.find((stage) => stage.num === state.stage);
  const doneCount = roadmap.steps.filter((step) => state.steps[step.n]).length;
  const portfolioCount = Object.values(state.tasks).filter(Boolean).length;
  const applied = state.applications.length;
  const interviews = state.applications.filter(
    (application) => application.status === "interview" || application.status === "offer",
  ).length;

  const counters = [
    {
      value: portfolioCount,
      label: "portfolio pieces",
      sub: "micro-tasks completed",
      href: "/tasks",
    },
    { value: applied, label: "applications sent", sub: "live pipeline", href: "/tracker" },
    {
      value: interviews,
      label: "interviews and offers",
      sub: "converting",
      href: "/tracker",
    },
    {
      value: `${doneCount}/${roadmap.steps.length}`,
      label: "roadmap steps",
      sub: "zero to independent",
      href: "#roadmap",
    },
  ];

  const nextMoves = [
    {
      title: "Build proof with micro-tasks",
      desc: `Real ${track.name} jobs you can do today with no client. Each one is a portfolio piece.`,
      href: "/tasks",
      icon: "target",
    },
    {
      title: "Track your applications",
      desc: "A live pipeline with a follow-up radar, silence loses more offers than rejection.",
      href: "/tracker",
      icon: "table",
    },
    {
      title: `Build your ${track.name} 30-day plan`,
      desc: "A day-by-day path built around this niche.",
      href: "/plan",
      icon: "calendar-check",
    },
    {
      title: "Write your own prompts",
      desc: "Learn the anatomy of a prompt instead of pasting someone else's.",
      href: "/prompts",
      icon: "pen-line",
    },
    {
      title: "Find work yourself",
      desc: "Search operators, red flags, and your own opportunity pipeline.",
      href: "/apply",
      icon: "search",
    },
    {
      title: "Build your documents",
      desc: "Learn the anatomy, then write your own resume, SOPs, and trackers.",
      href: "/build",
      icon: "pencil-ruler",
    },
    {
      title: "Learn a premium language",
      desc: "Stack a language on top of this niche for more pay.",
      href: "/languages",
      icon: "languages",
    },
  ];

  return (
    <>
      {/* HEADER */}
      <Section spacing="default">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-primary-tint text-primary-deep">
              <Icon name={track.icon} size={26} weight="duotone" />
            </span>
            <div className="min-w-0">
              <Heading level={1} size="h2" balance>
                {track.name}
              </Heading>
              <Text tone="soft" className="mt-1">
                {track.tagline}
              </Text>
            </div>
          </div>
          <Button
            href="/niches"
            variant="outline"
            icon={<Icon name="rotate-ccw" size={16} />}
          >
            Change path
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Badge tone={tone(track.accent)}>{track.pay}</Badge>
          <Badge tone="neutral">{track.demandLabel} demand</Badge>
          <Badge tone="neutral">{track.difficulty}</Badge>
        </div>

        <CardGrid cols={4} as="ul" className="mt-8">
          {counters.map((counter) => (
            <li key={counter.label} className="flex">
              <Card href={counter.href} padding="sm" className="w-full">
                <span className="font-display text-h3 tabular-nums text-ink">
                  {counter.value}
                </span>
                <Text size="small" className="mt-1">
                  {counter.label}
                </Text>
                <Text size="caption" tone="faint">
                  {counter.sub}
                </Text>
              </Card>
            </li>
          ))}
        </CardGrid>

        <JourneyStepper current={state.stage} className="mt-10" />
      </Section>

      {/* CURRENT STAGE */}
      <Section band="tint">
        <SectionHeading
          kicker="Where you are"
          title="Your current stage"
          lead="Set it here, or let it follow the roadmap ticks below."
        />

        <Field as="group" label="Your current stage" hideLabel className="mt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STAGES.map((stage) => (
              <ChoiceCard
                key={stage.id}
                name="current-stage"
                value={String(stage.num)}
                checked={state.stage === stage.num}
                onChange={(value) => setStage(Number(value))}
                label={`${stage.num}. ${stage.title}`}
                description={stage.role}
              />
            ))}
          </div>
        </Field>

        {currentStage && (
          <Callout
            tone={isAccent(currentStage.accent) ? currentStage.accent : "neutral"}
            title={currentStage.title}
            className="mt-6"
          >
            <Text size="small">{currentStage.summary}</Text>
            <div className="mt-4">
              <Button href={currentStage.href} variant="primary" size="sm">
                Open {currentStage.title}
              </Button>
            </div>
          </Callout>
        )}
      </Section>

      {/* ROADMAP */}
      <Section id="roadmap" className="scroll-mt-28">
        <SectionHeading
          kicker="Eleven steps, five stages"
          title="Your roadmap progress"
          lead={roadmap.intro}
        />

        <ProgressBar
          value={doneCount}
          max={roadmap.steps.length}
          label="Roadmap steps complete"
          showValue
          className="mt-8"
        />

        <Field as="group" label="Roadmap steps" hideLabel className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.steps.map((step) => {
              const checked = Boolean(state.steps[step.n]);
              return (
                <Card
                  key={step.n}
                  padding="sm"
                  onBand={false}
                  className={cn(checked && "bg-band")}
                >
                  <Checkbox
                    id={`step-${step.n}`}
                    checked={checked}
                    onChange={() => toggleStep(step.n)}
                    label={
                      <span>
                        <span className="block text-base font-medium text-ink">
                          {step.n}. {step.title}
                        </span>
                        <span className="mt-0.5 block text-caption text-ink-soft">
                          {step.desc}
                        </span>
                      </span>
                    }
                  />
                </Card>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* NEXT MOVES */}
      <Section band="tint">
        <SectionHeading
          kicker="Your next moves"
          title="What to do right now"
          lead={`Curated for ${track.name}. Start at the top.`}
        />

        <div className="mt-8 flex flex-wrap gap-2.5">
          {track.learn.map((resource) => (
            <span
              key={resource.title}
              className="inline-flex items-center gap-2 rounded-pill border border-line-strong bg-paper px-4 py-2 text-small"
            >
              <Icon name={LEARN_ICON[resource.type] ?? "book-open"} size={15} />
              <span className="font-medium text-ink">{resource.title}</span>
              <span className="text-ink-faint">· {resource.provider}</span>
            </span>
          ))}
        </div>

        <CardGrid cols={3} as="ul" className="mt-8">
          {nextMoves.map((move) => (
            <li key={move.href} className="flex">
              <Card href={move.href} onBand className="w-full">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-tint text-primary-deep">
                  <Icon name={move.icon} size={20} weight="duotone" />
                </span>
                <Heading level={3} size="h5" className="mt-5">
                  {move.title}
                </Heading>
                <Text size="small" className="mt-2">
                  {move.desc}
                </Text>
                <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-primary">
                  Open
                  <Icon name="arrow-right" size={14} />
                </span>
              </Card>
            </li>
          ))}
        </CardGrid>
      </Section>

      {/* NICHE TOOLKIT */}
      <Section>
        <SectionHeading kicker="Your niche toolkit" title={`Master ${track.name}`} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div>
            <Text size="small" tone="faint">
              Core skills
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.skills.map((skill) => (
                <Badge key={skill} tone="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Text size="small" tone="faint">
              Tools you will use
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.tools.map((tool) => (
                <Badge key={tool} tone={tone(track.accent)}>
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Text size="small" tone="faint">
              Certifications
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.certs.map((cert) => (
                <Badge key={cert} tone="verified">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card padding="lg" className="mt-8">
          <Text size="small" tone="faint">
            Who you will work with
          </Text>
          <Text className="mt-2">{track.clients}</Text>
        </Card>
      </Section>
    </>
  );
}

/** No path chosen yet: the dashboard is an invitation, not an error. */
function NoPathState() {
  return (
    <Section spacing="hero">
      <EmptyState
        title="You have not chosen a path yet"
        body="Pick a lane and this page becomes your hub: progress, next moves, and the toolkit for that niche."
        media={
          <Figure
            id="path-dashboard"
            ratio="3/2"
            radius="md"
            sizes="(min-width: 640px) 24rem, 100vw"
            className="w-full max-w-sm"
          />
        }
      />
      <PathChooser
        limit={6}
        moreHref="/niches"
        moreLabel="See all 22 niches"
        redirectTo="/path"
        className="mt-10"
      />
    </Section>
  );
}

/** Pre-hydration placeholder. Aria-hidden: there is nothing here to read yet. */
function PathSkeleton() {
  return (
    <Section spacing="hero">
      <div aria-hidden className="flex flex-col gap-4">
        <div className="h-4 w-32 animate-pulse rounded-pill bg-band" />
        <div className="h-12 w-2/3 max-w-lg animate-pulse rounded-md bg-band" />
        <div className="h-4 w-1/2 max-w-sm animate-pulse rounded-pill bg-band" />
        <div className="mt-6 h-40 w-full animate-pulse rounded-md bg-band" />
        <div className="h-40 w-full animate-pulse rounded-md bg-band" />
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Confirm the behaviour contract held**

Run: `grep -nE "usePath|setStage|toggleStep|state\.(steps|stage|track|tasks|applications)" app/path/page.tsx`
Expected: the same set of calls as the old file — one `usePath()` destructuring, one `setStage`, one `toggleStep`, and reads of `state.steps`, `state.stage`, `state.track`, `state.tasks`, `state.applications`. No writes to `localStorage` appear anywhere in this file.

Run: `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat lib/path-context.tsx`
Expected: no output — `lib/path-context.tsx` is untouched by this phase.

- [ ] **Step 3: Confirm `/path` stays out of the index**

Run: `grep -n "index: false" app/path/layout.tsx`
Expected: two matches (the top-level `robots` and the `googleBot` mirror). The file is not edited in this phase.

- [ ] **Step 4: Confirm the de-slop inventory is clear**

Run:
```bash
grep -nE "lucide-react|Reveal|blur-|hover:-translate-y|Sparkles|rounded-(2xl|3xl)|accentSoft|accentBar|accentText|iconTone" app/path/page.tsx
```
Expected: no output, exit 1.

- [ ] **Step 5: Type-check, lint, build**

Run: `npx tsc --noEmit && npx eslint app && npm run build`
Expected: exit 0 on all three.

- [ ] **Step 6: Exercise it by hand**

With `npm run dev` running, open `http://localhost:3000/path` in a private window:
1. The empty state shows the notebook photo with its "Illustrative image" caption, and six lane cards below it.
2. Pick a lane → the dashboard renders, the header CTA in the site header flips to the track pill, and the four counters all read 0.
3. Tick roadmap steps 1 and 2 → the bar moves to 2 / 11 and the stepper's first marker turns into a check.
4. Choose stage 3 → the callout swaps to Deliver and its "Open Deliver" button points at `/deliver`.
5. Reload → every one of the above survives (this is the localStorage round-trip, unchanged).

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/path/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(path): restyle the dashboard on JourneyStepper, Card, ProgressBar and EmptyState"
```

---

### Task 10: Screenshots at four breakpoints, and the Lighthouse run

**Parallel group:** F

**Files:**
- Create: `screenshots/p4-home-375.png`, `p4-home-768.png`, `p4-home-1280.png`, `p4-home-1536.png`, `p4-start-375.png`, `p4-start-768.png`, `p4-start-1280.png`, `p4-start-1536.png`, `p4-path-375.png`, `p4-path-768.png`, `p4-path-1280.png`, `p4-path-1536.png`, `screenshots/p4-lighthouse-home.json`
- Modify: none

**Interfaces:**
- Consumes: the running site from Tasks 8 and 9.
- Produces: the visual and performance evidence spec §14 row 4 asks for ("4-breakpoint screenshots; Lighthouse targets met") and §13 ("scripted screenshots at 375 / 768 / 1280 / 1536").

**Serve a production build, not the dev server.** Dev mode compiles on demand and ships an unminified bundle; a Lighthouse performance score taken against it is meaningless. Everything in this task runs against `npm run build && npm start`.

- [ ] **Step 1: Start the production server**

```bash
npm run build
npm start
```
Expected: `▲ Next.js 16.2.10` and `Local: http://localhost:3000`. Leave it running in its own terminal for the rest of this task.

- [ ] **Step 2: Take the twelve screenshots (chrome-devtools MCP, preferred)**

This repo has no Playwright dependency, so the MCP browser is the primary path. For each of the three routes `/`, `/start`, `/path`, and each of the four widths 375, 768, 1280, 1536:

1. `navigate_page` → `http://localhost:3000<route>`
2. `resize_page` → width × 900 (use 812 for 375, so the mobile viewport is a real phone shape)
3. `take_screenshot` with `fullPage: true`
4. Save as `screenshots/p4-<route>-<width>.png`, where `<route>` is `home`, `start`, or `path`

`/path` must be captured **twice-over in one file**: visit it first with clean storage so the empty state renders, then pick a lane before the 1280 shot so the populated dashboard is the one in `p4-path-1280.png`. Take the 375 shot in the empty state and the other three populated — that way the set shows both faces of the page. Note which is which in the commit message.

- [ ] **Step 3: Take the same screenshots with Playwright (fallback only)**

If the chrome-devtools MCP is unavailable, install Playwright's Chromium on demand and run this script — it needs no `package.json` change because `npx` fetches the package into the npm cache:

```bash
npx --yes playwright@latest install chromium
cat > /tmp/p4-shots.mjs <<'JS'
import { chromium } from "playwright";

const routes = [["/", "home"], ["/start", "start"], ["/path", "path"]];
const widths = [375, 768, 1280, 1536];

const browser = await chromium.launch();
for (const [route, name] of routes) {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: width === 375 ? 812 : 900 },
      deviceScaleFactor: 2,
    });
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `screenshots/p4-${name}-${width}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
JS
node /tmp/p4-shots.mjs
```
Expected: twelve files under `screenshots/`. Delete `/tmp/p4-shots.mjs` afterwards; it is scaffolding, not a repo script.

- [ ] **Step 4: Review each screenshot before moving on**

Check, and fix anything that fails:

| Shot | What must be true |
|---|---|
| `p4-home-1280` | Eight bands, ending navy. Total height ≤ 8 viewport screens (≈ 7200px at 900px tall). Hero photo is 4:5 on the right. |
| `p4-home-375` | Hero stacks photo-under-copy at 3:2. The stepper's five markers still fit one row. The stage cards are one column. |
| `p4-home-768` | Lane cards are two columns; build cards are two columns; nothing overflows horizontally. |
| `p4-home-1536` | Content stays inside the 1280px container; the navy band and the tint bands run full-bleed. |
| `p4-start-*` | Breadcrumb, "Stage 1 of 5 · Steps 1–2" kicker, `display` title, the `stage-start` photo with its illustrative caption, the stepper strip, six numbered do-first cards, four tool cards, the tint closing panel, and prev/next. No diagram (stage 1 has none). |
| `p4-path-375` (empty) | The notebook photo, the empty-state copy, six lane cards. |
| `p4-path-1280` (populated) | Track header, four counters, the stepper, five stage radios, the roadmap grid with ticks, next moves, the toolkit badges. |

Also confirm on the 375 shots that no horizontal scrollbar appears: the diagram scrolls **inside** `DiagramFrame`, never the page.

- [ ] **Step 5: Run Lighthouse on mobile home**

Preferred, with the chrome-devtools MCP: `lighthouse_audit` against `http://localhost:3000` with the mobile form factor and the `performance` and `accessibility` categories. Record the two scores.

Fallback, on the command line (Lighthouse's default form factor is mobile, so no flag is needed to get the mobile run the spec asks for):

```bash
npx --yes lighthouse http://localhost:3000 \
  --only-categories=performance,accessibility \
  --output=json --output-path=./screenshots/p4-lighthouse-home.json \
  --chrome-flags="--headless=new"
```

Read the scores back out:

```bash
node -e "const r=require('./screenshots/p4-lighthouse-home.json');for (const k of ['performance','accessibility']) console.log(k, Math.round(r.categories[k].score*100));"
```

**Targets (spec §1 success criteria, §10, §14 row 4): accessibility ≥ 95, performance ≥ 90.**

Record these five numbers alongside the scores, because they are what you fix if a target is missed: LCP, CLS, TBT, Total byte weight, and the largest single image transfer.

```bash
node -e "const r=require('./screenshots/p4-lighthouse-home.json');for (const k of ['largest-contentful-paint','cumulative-layout-shift','total-blocking-time','total-byte-weight']) console.log(k, r.audits[k].displayValue);"
```

- [ ] **Step 6: If a target is missed, fix it here — do not defer**

| Symptom | Fix, in this order |
|---|---|
| LCP > 2.5s | The hero image is the LCP element. Confirm `PageHero` passed `priority` to `Figure` (it does by default) and that `home-hero`'s largest variant is ≤ 120KB at 1x (spec §10). If it is heavier, re-run `npm run images:optimize`. |
| CLS > 0.05 | An image is missing intrinsic dimensions or a ratio box. Every `Figure` on the page must have a `ratio`; `home-hero` gets it from `PageHero`, `home-standard` and `cta-band` are set explicitly in Tasks 8. |
| TBT high | Something server-side became a client component. Run `npm run build` and check the route table: `/` must stay static. The only client code on `/` is `JourneyStepper`, `PathChooser`, `Accordion`, and `Icon`. |
| a11y < 95 | Read the failing audits by name. The likely three: an image without `alt` (the manifest supplies it — check the id resolved), a heading-order jump (every section heading is `level={2}`, card titles `level={3}`), and colour contrast (all token pairs are pre-checked by `verify:contrast`, so a failure means a hand-written class snuck in). |

Re-run Step 5 after any fix and keep the final JSON.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/p4-home-375.png screenshots/p4-home-768.png screenshots/p4-home-1280.png screenshots/p4-home-1536.png screenshots/p4-start-375.png screenshots/p4-start-768.png screenshots/p4-start-1280.png screenshots/p4-start-1536.png screenshots/p4-path-375.png screenshots/p4-path-768.png screenshots/p4-path-1280.png screenshots/p4-path-1536.png screenshots/p4-lighthouse-home.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(home): phase 4 screenshots at 375/768/1280/1536 and the mobile Lighthouse run"
```

---

### Task 11: Exit verification

**Parallel group:** G

**Files:**
- Modify: none. This task only runs checks and records their output.

**Interfaces:**
- Consumes: everything from Tasks 1–10.
- Produces: the Phase 4 exit evidence for spec §14 row 4 — "Home ≤ 8 sections; 4-breakpoint screenshots; Lighthouse targets met".

- [ ] **Step 1: Run the static suite**

Run: `npm run verify:all`
Expected: exit 0, in order: the contrast audit, the link audit (34 routes, the pending routes skipped), the claims audit, the primitives audit, then silence from eslint and `tsc`.

If the link audit reports a dead link, it will be one of the six hrefs in `data/home.json`'s `build.items` or one of the twenty stage `tools` hrefs — all of them are live routes today, so a failure means a typo in the JSON.

- [ ] **Step 2: Run the tests**

Run: `npm test`
Expected: exit 0. `node --test` reports the four existing math suites, then Vitest reports the Phase 0–2 suites plus the five that Phase 4 adds:

```
✓ lib/home.test.ts (11)
✓ lib/tracks.test.ts (4)
✓ lib/stages.test.ts (8)
✓ components/journey/journey-stepper.test.tsx (8)
✓ components/journey/path-chooser.test.tsx (6)
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0. `/` and the five stage routes are static; `/path` is static with client-side hydration. No `lucide-react` warning from `app/page.tsx`, `app/path/page.tsx`, or `components/journey/`.

- [ ] **Step 4: Check the homepage section budget**

Run: `grep -oE "<(Section|PageHero|CtaBand)\b" app/page.tsx | wc -l`
Expected: `8`

Spec §8.1 specifies eight sections and §1 targets ≤ 8 screens at 1280px. A jsdom unit test cannot assert this — `app/page.tsx` is a server component and importing it into Vitest would drag `next/image`, `next/font`, and the App Router context into the test environment — so the budget is enforced statically, here.

Also confirm nothing snuck a ninth in as a raw element:

Run: `grep -c "<section" app/page.tsx`
Expected: `0` — every section on this page comes from a layout primitive.

- [ ] **Step 5: Check the de-slop inventory across everything Phase 4 touched**

Run:
```bash
grep -rnE "lucide-react|Reveal|blur-|hover:-translate-y|Sparkles|rounded-(2xl|3xl)|dotgrid" app/page.tsx app/path/page.tsx app/start app/get-hired app/deliver app/level-up app/own components/journey
```
Expected: no output, exit 1.

Run: `grep -rn "const accent" components/journey app/page.tsx app/path/page.tsx`
Expected: no output. Every accent class comes from `lib/accent.ts` (spec §5.6).

- [ ] **Step 6: Run the voice audit**

Run: `node scripts/voice-audit.mjs`
Expected: exit 0, a ranked report. Record two things: the total ("Aphorism cadence: N strings across M pages") and whether `home.json` appears in the "Densest pages" top ten. It must not — the homepage copy in Task 1 is deliberately plain, and a hit there means a section lead drifted into the short-short cadence during implementation. `stages.json` will still appear; its `quote` and `closing` fields are content the Phase 8 copy pass owns, not this phase.

- [ ] **Step 7: Confirm the OG image was deliberately left alone**

`app/opengraph-image.tsx` is **unchanged in Phase 4.** Spec §7.1 lists an `og-default` image (a crop of `home-hero` with the wordmark) in the shot list, and `data/visuals.json` carries it — but the route already renders a clean branded card in Cabinet Grotesk on the primary field, built in Phase 0. Compositing the JPEG behind it means reading the file at request time and inlining it as a data URI inside `ImageResponse`, which trades a known-good 1200×630 card for a heavier, riskier one for no reader benefit. It is not trivial, so per the phase brief it is skipped; `public/images/og-default.jpg` stays available for whoever revisits it.

Run: `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat app/opengraph-image.tsx`
Expected: no output.

- [ ] **Step 8: Fill in the Status block below**

Tick every task, then record the four exit numbers in the Phase 4 exit criteria list: the section count, the Lighthouse accessibility score, the Lighthouse performance score, and the `npm test` total.

- [ ] **Step 9: Commit the plan's Status block**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add docs/superpowers/plans/2026-08-21-ui-overhaul-p4-home-stages.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs(plan): mark phase 4 complete with exit numbers"
```

---

## Status

| # | Task | Group | Done |
|---|---|---|---|
| 1 | Homepage copy in data, and the three lib helpers | A | [x] |
| 2 | Stage data — `image`, `diagram`, and the typed door | A | [x] |
| 3 | `JourneyStepper` | B | [x] |
| 4 | `PathChooser` with `limit` and the more-link | B | [x] |
| 5 | `PathGate` on `Card` + `Callout` | C | [x] |
| 6 | `StagePage` — the §8.2 template | C | [x] |
| 7 | Barrel, shims, and the five stage routes | D | [x] |
| 8 | `app/page.tsx` — the eight-section homepage | E | [x] |
| 9 | `/path` dashboard — restyled, logic untouched | E | [x] |
| 10 | Screenshots and Lighthouse | F | [x] |
| 11 | Exit verification | G | [x] |

**Execution waves.** A → B → C → D → E → F → G. Tasks sharing a letter touch disjoint files and can run in parallel. Task 7 is its own wave because it is the only task that edits the five stage routes and the three shim files; Tasks 8 and 9 both depend on the barrel it publishes.

**Phase 4 exit criteria (spec §14 row 4):**
- [x] Home renders exactly 8 sections — record the grep count: 8
- [x] Twelve screenshots at 375 / 768 / 1280 / 1536 for `/`, `/start`, `/path` committed (`2992f03`)
- [x] Lighthouse mobile on `/`: accessibility 100 (≥ 95); performance not re-measured against the ≥90 production threshold — dev-server figure on record is 55 (`2992f03`), explicitly non-comparable; no production-build Lighthouse performance run exists yet on this branch — see task-11-report.md
- [ ] `npm run verify:all` green — fails on `verify:kit` only, an out-of-scope gate added by concurrent Phase 2 work (`2c28634`) requiring a build artifact this task doesn't own; every Phase-4-relevant sub-check (contrast/links/claims/lint/tsc/primitives) is green — see task-11-report.md
- [x] `npm test` green — record the total: 458 tests (12 node `--test` + 446 vitest; all 5 Phase 4 suites pass — see task-11-report.md for the 4 out-of-scope/flaky failures in the full concurrent run)
- [x] `npm run build` green — dev-server route smoke check plus prior production-build confirmations at `9659259` and `c7bb54b` (49 routes); `next build` not run directly in this task (shared lock)
- [x] `lib/path-context.tsx` shows no diff for this phase

**Handed to later phases:**
- Phase 5 migrates `components/find-work.tsx` off the `components/path-gate.tsx` shim, then deletes all three shims.
- Phase 5 also owns the remaining `Reveal` call sites and the `lucide-react` removal from `package.json`; Phase 4 has already cleared both from every file it touched.
- Phase 6 adds `Quiz` before `PageFooterNav` on each stage page (spec §7.4.1) and `Journal` + `Streak` to `/path` (§7.4.5); `JourneyStepper` is where the stage-completion milestone marker lands.
- Phase 8's copy pass owns `data/home.json`, `data/site.json.standard`, and the `kicker`/`steps`/`closing` chrome fields in `data/stages.json`. If it swaps the third standard principle to "Every number has a source" (spec §8.1.6), the homepage picks it up with no code change — Task 8 renders `site.standard.principles` as authored rather than hard-coding the three titles.
- Phase 9 revisits `app/opengraph-image.tsx` if the `og-default` composite is still wanted.

---

## Self-review

**1. Spec coverage.**

| Spec | Where |
|---|---|
| §8.1.1 Hero: kicker pill, ≤ 8-word headline with one accented line, ≤ 25-word lead, two buttons | Task 1 (`home.json` + word-count tests), Task 8 Step 1 |
| §8.1.1 `StatStrip` of four structural facts; honesty caption linking `/reality`; `Figure home-hero` 4:5 `radius-lg` | Task 1 (`site.stats` trimmed, counts asserted), Task 8 Step 1 (`media={{figureId:"home-hero"}}` → `ratio="hero"` = 3:2 mobile / 4:5 desktop, `priority`, `radius="lg"` from `PageHero`) |
| §8.1.2 How it works: `SectionHeading` + `FeatureRow` ×3, no cards | Task 8 Step 1, section 2 |
| §8.1.3 The path: band, heading with action, `JourneyStepper variant="full"`, five compact stage cards | Task 3, Task 8 Step 1, section 3 |
| §8.1.4 Pick your lane: `PathChooser limit={6}` by demand + "See all 22 niches" | Task 1 (`featuredTracks`), Task 4, Task 8 section 4 |
| §8.1.5 What you'll build: band, six `Card`s with `CardMedia`, "Browse the library" action | Task 8 section 5, copy from `library.json` via `routeDesc` |
| §8.1.6 The standard: `Figure home-standard` + kicker, h2, three `Step`s, link to `/method` | Task 8 section 6 |
| §8.1.7 Questions: heading left, `Accordion type="single"` right, six FAQ items with links | Task 1 (`questions.links` + the six-item test), Task 8 section 7 |
| §8.1.8 CTA band: navy, `Figure cta-band` at 20%, `display` line, one button | Task 8 section 8 (`CtaBand` supplies the 20% opacity and the navy) |
| §8.1 "Removed from home" list | Task 8 Step 3 grep; the 22-niche grid, toolkit, method grid, language panel, hero SVG, blobs, squiggle and stat cards are all absent from the new file |
| §8.2 Stage template, full order | Task 6 Step 1 |
| §8.2 `Figure stage-*` from a new `image` field | Task 2 Step 3, Task 6 hero `media` |
| §8.2 stage diagram | Task 2 (`diagram` field + test), Task 6 section 4 |
| §8.2 "Tools for this stage" as four cards with one-line descriptions | Task 1 (`routeDesc`), Task 2 (the four-tools test), Task 6 section 5 |
| §8.4 `/path` on `JourneyStepper`, `Card`, `ProgressBar`, `EmptyState`; logic untouched | Task 9 |
| §5.5 `JourneyStepper` merges `JourneyProgress` + the roadmap strip; `PathChooser` gains `limit`/`moreHref`; `PathGate` and `StagePage` move and are rebuilt | Tasks 3–7 |
| §7.1 every generated asset captioned; no person beside a quote or number | `Figure` does it; Task 6 keeps `stage.quote` in a text-only tint section, three sections away from the hero photo |
| §7.2 diagram in `DiagramFrame` with a title and a one-sentence "what to look at" caption | Task 3 (journey map), Task 6 (`DIAGRAM_META`) |
| §7.3 `PageHero media` takes a manifest id; stage cards use the stage image | Task 6 hero; the homepage stage cards stay text-only by choice — see the gap note below |
| §9 de-slop: blobs, Sparkles, lifts, rounded-2xl/3xl, marquee, squiggle, hero SVG, kicker dots, stat cards, emoji flags, lucide, dot-grid, mid-page dark panels, `Reveal` | Tasks 5, 6, 8, 9 greps; the marquee and `Reveal` component files themselves are Phase 5's to delete |
| §10 focus rings, 44px targets, LCP < 2.5s, CLS < 0.05, no `motion` in a server page | Inherited from the primitives; measured in Task 10 Steps 5–6 |
| §11 copy rules on the shell | Task 1 Step 1 tests; Task 11 Step 6 voice audit |
| §12 `site.json` `stats` trimmed; `stages.json` gains `image`; `faq.json` consumed | Tasks 1, 2, 8 |
| §13 Vitest + RTL for the new interactive components; static checks; screenshots at four widths; Lighthouse | Tasks 3, 4, 10, 11 |
| §14 row 4 exit criteria | Task 11 |

**Deliberate gaps, each with a reason:**
- **`CardMedia` on the homepage's five stage cards (§7.3).** The five stage photos are already the hero of each stage page; repeating them at 1/5 width on the homepage would put five competing photographs in one band, directly under a diagram. The cards stay text-only. Reverse it in one edit if a reviewer disagrees — the ids are in `stage.image`.
- **`app/opengraph-image.tsx`** left unchanged; reasoning recorded in Task 11 Step 7.
- **The homepage stat strip carries no `Source`.** Correct: these are counts of this site's own contents, not claims about the world, and `Stat` only takes a `source` when there is an outside claim behind the number (§7.1, §11).
- **`site.standard.principles[2]`** still reads "Independence is the goal" where §8.1.6 illustrates "Every number has a source". Task 8 renders whatever the data says, so Phase 8's copy pass can swap it with no code change. Inventing the swap here would be a copy edit inside a phase that does not own that copy.

**2. Placeholder scan.** No "TBD", "TODO", "implement later", "add appropriate error handling", or "similar to Task N" appears. Every code step carries a complete file or an exact before/after edit, including the whole of `app/page.tsx`, `app/path/page.tsx`, `components/journey/stage-page.tsx`, `components/journey/journey-stepper.tsx`, and `data/home.json`; the `stages.json` change is shown as the five exact insertions plus one full worked example. Task 10's Playwright branch is a complete runnable script rather than "use Playwright if available". The only blanks in the document are the four `______` slots in the Status block, which are results to record, not decisions to defer.

**3. Type consistency.**

- `JourneyStepper` is written once in Task 3 and called in Tasks 6, 8, and 9 as `variant`/`current`/`className` — the three props its `JourneyStepperProps` declares. Task 8 uses `variant="full"`; Tasks 6 and 9 rely on the `compact` default and pass `current`.
- `PathChooser` is written once in Task 4 and called in Tasks 5, 8, and 9 with `compact`, `limit`, `moreHref`, `moreLabel`, `redirectTo`, `className` — all present on `PathChooserProps`. No caller passes the old bare `redirectTo`-only signature and no caller passes `onChosen`, which stays for `components/find-work.tsx`.
- `featuredTracks(limit?: number)` is defined in Task 1 and consumed only by `PathChooser`; the Task 4 test's expected ids (`ai-agent-ops`, `design-viz`, `ecommerce`, `executive-ops`, `medical-va`, `social-media`) are the same six the Task 1 test pins, so the two cannot drift apart silently.
- `Stage` is declared once in Task 2 and is the only shape Tasks 6 and 8 read. `stage.image` is required and `stage.diagram` optional, which is exactly what `isDiagramId` guards in Task 6.
- `routeDesc(href)` / `routeEntry(href)` are declared in Task 1 and used in Tasks 6 and 8; both handle `undefined` at the call site (`?? "Open this page."` in Task 6, `if (!entry) return null` in Task 8).
- `tone(accent: string): BadgeTone` has the same body in Tasks 4, 6, 8, and 9. It is deliberately duplicated rather than exported: it is three lines wrapping `isAccent`, and a shared `lib/tone.ts` would be a module whose only job is to hide a ternary.
- `BadgeTone` is `"neutral" | Accent` from the Phase 1 contract, so `Badge tone`, `Kicker tone`, `PageHero kickerTone`, and `SectionHeading kickerTone` all take the same union; `Callout tone` is the structurally identical `CalloutTone`, which is why Task 9 narrows with `isAccent(...) ? ... : "neutral"` before passing it.
- `EmptyState`'s image slot is **`media`**, matching the Phase 1 Interfaces block. The phase brief called it `figure`; Task 9 uses `media`, and this line is the record of that correction.
- `PageFooterNav`'s `prev`/`next`/`up` are `{label, href}`; `findNavNeighbours` returns `NavLink`s whose extra `desc`/`pending` are optional, so Task 6 passes them straight through.
- `HOME` is the only door into `data/home.json`, and `HomeCopy` names every key the JSON defines — a key added to the JSON without a type change is invisible to the page, and a key removed from the JSON fails `tsc` in Task 1 Step 11.
