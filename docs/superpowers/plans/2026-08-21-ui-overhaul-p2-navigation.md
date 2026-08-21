# UI Overhaul — Phase 2: Navigation and IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-link header + 31-link mega-menu with four dropdowns, a mobile drawer, a light footer, a `Dialog`-based search palette, and a filterable `/library` index, so every route on the site is at most two clicks from the homepage.

**Architecture:** The information architecture lives in data, not in components: `data/site.json` gains a `nav` tree (four top-level items, two-column groups, 6–10-word descriptions) and a regrouped `navGroups` (four buckets) that drives the footer, the search index, the sitemap, and the new `lib/nav.ts` wayfinding helpers. Every shell component moves into `components/site/` and is rebuilt on the Phase 1 primitives; the old `components/<name>.tsx` paths keep one-line re-exports so nothing outside the shell has to change. Routes that are authored in the IA but ship in a later phase carry `"pending": true`, which the link audit, the sitemap, and every renderer honour.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first), TypeScript strict, Vitest 3 + Testing Library, `node --test` (existing math tests), Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§6 navigation and IA, §5.4 site components, §8.3 archetypes, §10 a11y, §11 copy rules, §12 data changes). This is plan 3 of 10 (spec §14 row 2); Phases 0 and 1 have their own plan files and must be complete before this one starts.

**Depends on:**
- **Phase 0 (done):** tokens in `app/globals.css`, `lib/fonts.ts`, `lib/accent.ts`, the skip link in `app/layout.tsx`, and the redesigned `Logo`/`LogoMark` in `components/logo.tsx` (`LogoMark` props `{size, className, title, onDark, mono}`; `Logo` props `{className, markSize, wordmark, onDark, showTagline}`).
- **Phase 1:** `@/components/ui` and `@/components/layout` must exist and export the names in the contract below. If `components/ui.tsx` (the old flat file) is still present alongside `components/ui/`, Phase 1 is not finished — stop and finish it first, because `@/components/ui` would resolve to the wrong module.

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

### Phase 2 additions to the constraints

- **Copy rules for every nav label and description (spec §11):** each `desc` is 6–10 words; no "actually", "forever", "genuinely", "truly"; no "not X, Y" reversals; no triads for rhythm; no "virtual assistant"; concrete nouns and verbs. A unit test enforces the word count and the banned list.
- **The `pending` convention:** a link object in `data/site.json` or `data/library.json` with `"pending": true` is authored in the IA but its route ships in a later phase (`/practice` and `/glossary` in Phase 6, `/educators` in Phase 7). Nothing renders it, the sitemap omits it, and the link audit skips it. Deleting the `pending` key is the whole switch-on.
- **No `className` on Phase 1 primitives.** The pinned contract below does not promise a `className` prop on `Button`, `Heading`, `Text`, `Badge`, `Icon`, `Card`, or `EmptyState`. Wrap them in a `<div>`/`<span>` when layout classes are needed. This keeps Phase 2 compiling whatever Phase 1 shipped.
- **Header bundle budget (spec §5.4):** the header imports `data/track-names.json` (1 KB) and never `data/tracks.json` (70 KB). `lib/nav.ts` may import `site.json`, `library.json`, and `track-names.json` and nothing else from `data/`.

### Pinned Phase 1 contract (authoritative for this plan)

`@/components/ui` exports: `Accordion, AccordionItem` (`type: "single"|"multiple"`, `defaultOpen`; `AccordionItem` props `id, title`), `Badge` (`tone: "neutral"|Accent`, `variant: "soft"|"outline"`, `icon?`), `Button` (`href?, external?, variant: "primary"|"secondary"|"outline"|"ghost"|"link", size: "sm"|"md"|"lg", icon?, iconEnd?, type?, disabled?, onClick?` — renders Link/a/button), `Callout`, `Card, CardBody, CardFooter, CardMedia` (`padding`, `interactive`, `href`), `Checkbox, Radio, ChoiceCard, Range, Switch, Field, Input, Textarea, Select` (Field wires aria via `useFieldControl()`), `Dialog` (`open, onClose, title, hideTitle?, description?, size?, placement?, flush?, hideClose?` — portal, focus trap, Esc, return focus, scroll lock), `EmptyState`, `Figure`, `DiagramFrame`, `Heading` (`level, size: "hero"|"display"|"h2"|"h3"|"h4"|"h5", accent?, balance?, tone`), `Text` (`size: "lead"|"body"|"base"|"small"|"caption", tone: "ink"|"soft"|"faint"|"inherit"`), `Icon` (`name` kebab Phosphor, `weight`, `size`) + `ICON_NAMES`, `Kicker` (`tone`), `ProgressBar`, `Source, SourceList`, `Stat, StatStrip`, `Step, StepList`, `Tabs, TabList, Tab, TabPanel`.

`@/components/layout` exports: `Breadcrumb` (`items: {label, href?}[]`), `CardGrid` (`cols`), `Container` (`size: "default"|"narrow"|"wide"`), `CtaBand`, `FeatureRow`, `PageFooterNav` (`prev?, next?, up?` of `{label, href}`), `PageHero` (`breadcrumb?, kicker?, kickerTone?, title, accent?, lead?, actions?, media?: {figureId}|{node}, compact?, children?`), `Section` (`band: "none"|"tint"|"navy"`, `spacing`), `SectionHeading` (`kicker?, title, lead?, action?, align`), `Toc`.

Tailwind utilities from Phase 0: colours `paper band tint ink ink-soft ink-faint on-navy line line-strong control primary primary-deep primary-tint primary-soft verified(-fill/-tint) caution(-fill/-tint) info(-fill/-tint) coral(-fill/-tint)`; type `text-hero text-display text-h2 text-h3 text-h4 text-h5 text-lead text-body text-small text-caption text-kicker`; radii `rounded-sm|md|lg|pill`; `--shadow-sm` (dropdowns) / `--shadow-md` (dialog).

---

## File structure

| Path | Responsibility |
|---|---|
| `data/site.json` | `nav` tree (4 items, groups, descs), regrouped `navGroups` (4 buckets), `cta`; `primaryNav` deleted |
| `data/library.json` | 33 authored entries; `pending: true` added to the three later-phase routes |
| `lib/nav.ts` | The only typed door into the IA: `NAV`, `NAV_GROUPS`, `NAV_CTA`, `LIBRARY`, `LIVE_LIBRARY`, `SEARCH_INDEX`, `SECONDARY_LINKS`, `getBreadcrumb`, `findNavNeighbours` |
| `lib/nav.test.ts` | Neighbours, breadcrumb, nav↔navGroups sync, copy rules, index contents |
| `components/site/header.tsx` | Server shell: floating 72px pill bar |
| `components/site/nav-desktop.tsx` | Client: four items, `NavDropdown`, full keyboard model |
| `components/site/header-cta.tsx` | Client: "Find your path" or the chosen-track pill (`usePath()`) |
| `components/site/mobile-drawer.tsx` | Client: `Dialog placement="right" flush`, CTA on top, accordion groups |
| `components/site/search-palette.tsx` | Client: combobox over the search index, on `Dialog` |
| `components/site/footer.tsx` | Server: light `band` footer, four link columns |
| `components/site/library-browser.tsx` | Client: URL-synced chips + query over `library.json` |
| `components/site/{logo,back-to-top,sw-register,motion-provider,json-ld}.tsx` | Moved from `components/` |
| `components/site/index.ts` | Barrel for `app/` |
| `components/{logo,back-to-top,sw-register,motion-provider,json-ld}.tsx` | One-line re-export shims at the old paths |
| `app/library/page.tsx` | Server route: `pageMeta`, `PageHero`, `Suspense` + `LibraryBrowser` |
| `app/layout.tsx` | Imports from `@/components/site`; skip link and `<main id="main">` unchanged |
| `app/sitemap.ts` | Derives from `NAV_GROUPS`, skips `pending` and `/path` |
| `scripts/verify-links.mjs` | Static audit; learns the `pending` convention |
| `package.json` | `verify:links` joins `verify:all` |

**Deleted at the end of Task 8:** `components/site-header.tsx`, `components/site-footer.tsx`, `components/search-palette.tsx`.

---

### Task 1: The IA in data, and `lib/nav.ts`

**Parallel group:** A

**Files:**
- Modify: `data/site.json` (replace `navGroups`, delete `primaryNav`, add `nav` and `cta`)
- Modify: `data/library.json` (add `"pending": true` to three entries)
- Create: `lib/nav.ts`
- Test: `lib/nav.test.ts`

**Interfaces:**
- Consumes: nothing from earlier Phase 2 tasks.
- Produces, from `@/lib/nav`:
  - `type NavLink = { label: string; href: string; desc?: string; pending?: boolean }`
  - `type NavColumn = { title: string; links: NavLink[] }`
  - `type NavMenu = { label: string; groups: NavColumn[]; footerLinks?: NavLink[] }`
  - `type NavDirect = { label: string; href: string }`
  - `type NavItem = NavMenu | NavDirect`; `isMenu(item: NavItem): item is NavMenu`
  - `type NavGroup = { title: string; up: NavLink; links: NavLink[] }`
  - `type LibraryGroup = "path" | "learn" | "work" | "tools"`
  - `type LibraryType = "guide" | "workshop" | "tool" | "data"`
  - `type LibraryEntry = { label: string; href: string; group: LibraryGroup; type: LibraryType; stage?: number; desc: string; pending?: boolean }`
  - `type Crumb = { label: string; href?: string }`
  - `type NavNeighbours = { prev?: NavLink; next?: NavLink; up?: NavLink }`
  - `type SearchItem = { label: string; href: string; group: string; desc?: string }`
  - `NAV: NavItem[]`, `NAV_GROUPS: NavGroup[]`, `NAV_CTA: NavLink`, `LIBRARY: LibraryEntry[]`, `LIVE_LIBRARY: LibraryEntry[]`, `LIBRARY_GROUPS: LibraryGroup[]`, `LIBRARY_TYPES: LibraryType[]`, `GROUP_LABELS: Record<LibraryGroup, string>`, `TYPE_LABELS: Record<LibraryType, string>`, `SEARCH_INDEX: SearchItem[]`, `SECONDARY_LINKS: NavLink[]`
  - `isLive(link: { pending?: boolean }): boolean`
  - `getBreadcrumb(href: string): Crumb[]`
  - `findNavNeighbours(href: string): NavNeighbours`

- [ ] **Step 1: Write the failing test**

Create `lib/nav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  LIVE_LIBRARY,
  NAV,
  NAV_CTA,
  NAV_GROUPS,
  SEARCH_INDEX,
  SECONDARY_LINKS,
  findNavNeighbours,
  getBreadcrumb,
  isMenu,
  type NavLink,
} from "@/lib/nav";

/** Every link a dropdown can show, flattened. */
function menuLinks(): NavLink[] {
  return NAV.flatMap((item) =>
    isMenu(item) ? [...item.groups.flatMap((g) => g.links), ...(item.footerLinks ?? [])] : [],
  );
}

describe("findNavNeighbours", () => {
  it("returns the previous and next stage for a stage page", () => {
    expect(findNavNeighbours("/deliver")).toEqual({
      prev: { label: "Get Hired", href: "/get-hired" },
      next: { label: "Level Up", href: "/level-up" },
      up: { label: "Your path", href: "/path" },
    });
  });

  it("returns the neighbours inside the Learn bucket for a learn page", () => {
    expect(findNavNeighbours("/learn")).toEqual({
      prev: { label: "AI-First", href: "/ai-first" },
      next: { label: "Micro-Tasks", href: "/tasks" },
      up: { label: "Browse the library", href: "/library?group=learn" },
    });
  });

  it("returns nothing for a route that is not in the nav", () => {
    expect(findNavNeighbours("/not-a-route")).toEqual({});
  });

  it("skips links whose route ships in a later phase", () => {
    // "For educators" is pending, so Privacy is the last live link in More.
    expect(findNavNeighbours("/privacy").next).toBeUndefined();
    expect(findNavNeighbours("/privacy").prev).toEqual({ label: "Library", href: "/library" });
  });
});

describe("getBreadcrumb", () => {
  it("builds Home > group > page for a stage page", () => {
    expect(getBreadcrumb("/deliver")).toEqual([
      { label: "Home", href: "/" },
      { label: "The path", href: "/library?group=path" },
      { label: "Deliver" },
    ]);
  });

  it("builds Home > group > page for a learn page", () => {
    expect(getBreadcrumb("/method")).toEqual([
      { label: "Home", href: "/" },
      { label: "Learn", href: "/library?group=learn" },
      { label: "The Method" },
    ]);
  });

  it("falls back to the nav bucket for routes outside the library", () => {
    expect(getBreadcrumb("/path")).toEqual([
      { label: "Home", href: "/" },
      { label: "The path" },
      { label: "Your dashboard" },
    ]);
  });

  it("returns a single unlinked crumb for the homepage", () => {
    expect(getBreadcrumb("/")).toEqual([{ label: "Home" }]);
  });
});

describe("nav data", () => {
  it("has four top-level items ending in a direct link to /reality", () => {
    expect(NAV.map((i) => i.label)).toEqual(["Path", "Learn", "Work", "Reality Check"]);
    expect(NAV.filter((i) => !isMenu(i))).toEqual([{ label: "Reality Check", href: "/reality" }]);
  });

  it("points the header CTA at /start", () => {
    expect(NAV_CTA).toEqual({ label: "Find your path", href: "/start" });
  });

  it("lists every dropdown link in navGroups too", () => {
    const grouped = new Set(NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href)));
    const missing = menuLinks()
      .map((l) => l.href)
      .filter((href) => !grouped.has(href));
    expect(missing).toEqual([]);
  });

  it("gives every dropdown link a 6-10 word description", () => {
    const bad = menuLinks().filter((l) => {
      const words = (l.desc ?? "").trim().split(/\s+/).filter(Boolean).length;
      return words < 6 || words > 10;
    });
    expect(bad.map((l) => l.href)).toEqual([]);
  });

  it("keeps the banned shell words out of nav descriptions", () => {
    const banned = /\b(actually|forever|genuinely|truly|virtual assistants?)\b/i;
    expect(menuLinks().filter((l) => banned.test(l.desc ?? "")).map((l) => l.href)).toEqual([]);
  });

  it("offers Library and Privacy as secondary links, without the pending ones", () => {
    expect(SECONDARY_LINKS.map((l) => l.href)).toEqual(["/library", "/privacy"]);
  });
});

describe("SEARCH_INDEX", () => {
  it("indexes the live library", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/method")).toBe(true);
    expect(LIVE_LIBRARY).toHaveLength(30);
  });

  it("indexes nav routes that the library does not list", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/privacy")).toBe(true);
    expect(SEARCH_INDEX.some((i) => i.href === "/library")).toBe(true);
  });

  it("indexes every niche by name so it is findable from the palette", () => {
    expect(SEARCH_INDEX.some((i) => i.label === "Bookkeeping & Accounting" && i.href === "/niches")).toBe(true);
  });

  it("never indexes a route that ships in a later phase", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/practice")).toBe(false);
    expect(SEARCH_INDEX.some((i) => i.href === "/glossary")).toBe(false);
    expect(SEARCH_INDEX.some((i) => i.href === "/educators")).toBe(false);
  });

  it("lists each href once", () => {
    const nonNiche = SEARCH_INDEX.filter((i) => i.href !== "/niches").map((i) => i.href);
    expect(new Set(nonNiche).size).toBe(nonNiche.length);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/nav.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/nav"`.

- [ ] **Step 3: Replace `navGroups` and `primaryNav` in `data/site.json`**

In `data/site.json`, delete the whole `"navGroups": [...]` array **and** the whole `"primaryNav": [...]` array, and put these three keys in their place (keep `brand`, `wordmarkAccent`, `meaning`, `tagline`, `mission`, `standard`, and `stats` exactly as they are — `stats` is trimmed in Phase 4, not here). `cta` and `nav` come first, `navGroups` last, so the file reads header → footer:

```json
  "cta": {
    "label": "Find your path",
    "href": "/start"
  },
  "nav": [
    {
      "label": "Path",
      "groups": [
        {
          "title": "The path",
          "links": [
            { "label": "Start here", "href": "/start", "desc": "Stage 1. Set up your desk, build first proof." },
            { "label": "Get Hired", "href": "/get-hired", "desc": "Stage 2. Source leads, apply, and close the offer." },
            { "label": "Deliver", "href": "/deliver", "desc": "Stage 3. Onboard, write SOPs, keep the client." },
            { "label": "Level Up", "href": "/level-up", "desc": "Stage 4. Specialise, automate, and raise your rate." },
            { "label": "Own", "href": "/own", "desc": "Stage 5. Go direct, register, and set your terms." },
            { "label": "Your dashboard", "href": "/path", "desc": "See your saved track and how far you are." },
            { "label": "Build a 30-day plan", "href": "/plan", "desc": "Answer five questions, get a day-by-day month." }
          ]
        }
      ]
    },
    {
      "label": "Learn",
      "groups": [
        {
          "title": "Build skills",
          "links": [
            { "label": "The Method", "href": "/method", "desc": "Six principles and seven methods for building anything." },
            { "label": "AI-First", "href": "/ai-first", "desc": "Coding agents, local models, and four working habits." },
            { "label": "How to Learn", "href": "/learn", "desc": "How memory works, and a study protocol you write." },
            { "label": "Micro-Tasks", "href": "/tasks", "desc": "Forty small jobs that each end as portfolio proof." },
            { "label": "Build Labs", "href": "/build", "desc": "Learn a resume's anatomy, then write your own." },
            { "label": "Learn Any Tool", "href": "/tools", "desc": "Pick up unfamiliar software in a single weekend." },
            { "label": "Portfolio Ladder", "href": "/portfolio", "desc": "Each niche's tool ladder, free to paid, rung by rung." },
            { "label": "AI Leverage", "href": "/prompts", "desc": "Prompt anatomy, so you can write your own." },
            { "label": "Equipment", "href": "/equipment", "desc": "Check what you own, budget pesos for the rest." }
          ]
        },
        {
          "title": "Work like a professional",
          "links": [
            { "label": "Become Indispensable", "href": "/indispensable", "desc": "The judgment that makes you hard to replace." },
            { "label": "English at Work", "href": "/english", "desc": "Cut hedges, and learn four structures for client messages." },
            { "label": "Conduct & Integrity", "href": "/conduct", "desc": "What gets people delisted, and an oath you write." },
            { "label": "Career Simulator", "href": "/simulator", "desc": "Model 36 months of two career paths side by side." },
            { "label": "Resource Shelf", "href": "/resources", "desc": "Verified free courses, and how to judge one first." }
          ]
        }
      ],
      "footerLinks": [
        { "label": "Practice", "href": "/practice", "desc": "Flashcards and quizzes on a spacing schedule.", "pending": true },
        { "label": "Glossary", "href": "/glossary", "desc": "Plain definitions for every term this site uses.", "pending": true }
      ]
    },
    {
      "label": "Work",
      "groups": [
        {
          "title": "Get hired",
          "links": [
            { "label": "Find Work", "href": "/apply", "desc": "Search operators, reverse-sourcing, and a red-flag scorer." },
            { "label": "Interview Prep", "href": "/interview", "desc": "STAR answers, a question bank, and scam warning signs." },
            { "label": "Application Tracker", "href": "/tracker", "desc": "Log every application and get nudged on follow-ups." },
            { "label": "Niches", "href": "/niches", "desc": "Twenty-two lanes with pay bands, demand, and AI risk." }
          ]
        },
        {
          "title": "Get paid and stay",
          "links": [
            { "label": "Salary Guide", "href": "/salary", "desc": "Cited pay ranges, and how to price your work." },
            { "label": "Client Markets", "href": "/markets", "desc": "Where clients are, what each market pays, overlap hours." },
            { "label": "Own Your Clients", "href": "/clients", "desc": "Move from platform gigs to direct clients and retainers." },
            { "label": "Get Legit", "href": "/legit", "desc": "BIR registration, the 8% option, SSS, and payment rails." },
            { "label": "Languages", "href": "/languages", "desc": "Japanese, Korean, or Mandarin thins the candidate pool." }
          ]
        }
      ]
    },
    {
      "label": "Reality Check",
      "href": "/reality"
    }
  ],
  "navGroups": [
    {
      "title": "The path",
      "up": { "label": "Your path", "href": "/path" },
      "links": [
        { "label": "Start here", "href": "/start" },
        { "label": "Get Hired", "href": "/get-hired" },
        { "label": "Deliver", "href": "/deliver" },
        { "label": "Level Up", "href": "/level-up" },
        { "label": "Own", "href": "/own" },
        { "label": "Your dashboard", "href": "/path" },
        { "label": "Build a 30-day plan", "href": "/plan" }
      ]
    },
    {
      "title": "Learn",
      "up": { "label": "Browse the library", "href": "/library?group=learn" },
      "links": [
        { "label": "The Method", "href": "/method" },
        { "label": "AI-First", "href": "/ai-first" },
        { "label": "How to Learn", "href": "/learn" },
        { "label": "Micro-Tasks", "href": "/tasks" },
        { "label": "Build Labs", "href": "/build" },
        { "label": "Learn Any Tool", "href": "/tools" },
        { "label": "Portfolio Ladder", "href": "/portfolio" },
        { "label": "AI Leverage", "href": "/prompts" },
        { "label": "Equipment", "href": "/equipment" },
        { "label": "Become Indispensable", "href": "/indispensable" },
        { "label": "English at Work", "href": "/english" },
        { "label": "Conduct & Integrity", "href": "/conduct" },
        { "label": "Career Simulator", "href": "/simulator" },
        { "label": "Resource Shelf", "href": "/resources" },
        { "label": "Practice", "href": "/practice", "pending": true },
        { "label": "Glossary", "href": "/glossary", "pending": true }
      ]
    },
    {
      "title": "Work",
      "up": { "label": "Browse the library", "href": "/library?group=work" },
      "links": [
        { "label": "Find Work", "href": "/apply" },
        { "label": "Interview Prep", "href": "/interview" },
        { "label": "Application Tracker", "href": "/tracker" },
        { "label": "Niches", "href": "/niches" },
        { "label": "Salary Guide", "href": "/salary" },
        { "label": "Client Markets", "href": "/markets" },
        { "label": "Own Your Clients", "href": "/clients" },
        { "label": "Get Legit", "href": "/legit" },
        { "label": "Languages", "href": "/languages" }
      ]
    },
    {
      "title": "More",
      "up": { "label": "Browse the library", "href": "/library" },
      "links": [
        { "label": "Reality Check", "href": "/reality" },
        { "label": "Library", "href": "/library" },
        { "label": "Privacy", "href": "/privacy" },
        { "label": "For educators", "href": "/educators", "pending": true }
      ]
    }
  ]
```

Why the two structures both exist: `nav` is the header's shape (columns, descriptions, footer links); `navGroups` is a flat, ordered spine used by the footer columns, the search index, `findNavNeighbours`, and the sitemap. The unit test in Step 1 fails the build if a `nav` href ever goes missing from `navGroups`. Labels are kept identical between the two so the header and footer read the same; `library.json` keeps its own shorter labels ("Tracker") for the card grid, and the sync test compares hrefs, not labels.

- [ ] **Step 4: Mark the three later-phase routes in `data/library.json`**

Add `"pending": true` to exactly three entries. Each edit inserts one line before the entry's `"desc"`:

```json
    {
      "label": "Practice",
      "href": "/practice",
      "group": "tools",
      "type": "tool",
      "pending": true,
      "desc": "Flashcards and quizzes on a spacing schedule, so what you read stays."
    },
    {
      "label": "Glossary",
      "href": "/glossary",
      "group": "tools",
      "type": "tool",
      "pending": true,
      "desc": "Plain definitions for every term this site uses, with Tagalog glosses."
    },
    {
      "label": "For Educators",
      "href": "/educators",
      "group": "tools",
      "type": "guide",
      "pending": true,
      "desc": "Run a session from this material: run-sheets, slides, and the licence."
    }
```

Nothing else in `data/library.json` changes; the other 30 entries stay byte-for-byte as authored.

- [ ] **Step 5: Write `lib/nav.ts`**

Create `lib/nav.ts`:

```ts
import libraryData from "@/data/library.json";
import siteData from "@/data/site.json";
// Slim id -> name map. The header imports this module, so it must never reach
// data/tracks.json (70 KB); track-names.json is 1 KB.
import trackNames from "@/data/track-names.json";

/* ---------------------------------------------------------------- */
/*  Types                                                            */
/* ---------------------------------------------------------------- */

/** A link marked `pending` is authored in the IA but its route ships in a
 *  later phase (/practice, /glossary in Phase 6; /educators in Phase 7).
 *  Nothing renders it, the sitemap omits it, and scripts/verify-links.mjs
 *  skips it. Switching it on is deleting the key. */
export type NavLink = { label: string; href: string; desc?: string; pending?: boolean };
export type NavColumn = { title: string; links: NavLink[] };
export type NavMenu = { label: string; groups: NavColumn[]; footerLinks?: NavLink[] };
export type NavDirect = { label: string; href: string };
export type NavItem = NavMenu | NavDirect;
export type NavGroup = { title: string; up: NavLink; links: NavLink[] };

export type LibraryGroup = "path" | "learn" | "work" | "tools";
export type LibraryType = "guide" | "workshop" | "tool" | "data";
export type LibraryEntry = {
  label: string;
  href: string;
  group: LibraryGroup;
  type: LibraryType;
  stage?: number;
  desc: string;
  pending?: boolean;
};

export type Crumb = { label: string; href?: string };
export type NavNeighbours = { prev?: NavLink; next?: NavLink; up?: NavLink };
export type SearchItem = { label: string; href: string; group: string; desc?: string };

/* ---------------------------------------------------------------- */
/*  Data                                                             */
/* ---------------------------------------------------------------- */

export const NAV = siteData.nav as NavItem[];
export const NAV_GROUPS = siteData.navGroups as NavGroup[];
export const NAV_CTA = siteData.cta as NavLink;
export const LIBRARY = libraryData.entries as LibraryEntry[];
export const LIBRARY_LAST_VERIFIED = libraryData.lastVerified;

export const LIBRARY_GROUPS: LibraryGroup[] = ["path", "learn", "work", "tools"];
export const LIBRARY_TYPES: LibraryType[] = ["guide", "workshop", "tool", "data"];

export const GROUP_LABELS: Record<LibraryGroup, string> = {
  path: "The path",
  learn: "Learn",
  work: "Work",
  tools: "Tools",
};

export const TYPE_LABELS: Record<LibraryType, string> = {
  guide: "Guide",
  workshop: "Workshop",
  tool: "Tool",
  data: "Data",
};

export function isMenu(item: NavItem): item is NavMenu {
  return "groups" in item;
}

export function isLive(link: { pending?: boolean }): boolean {
  return link.pending !== true;
}

export const LIVE_LIBRARY: LibraryEntry[] = LIBRARY.filter(isLive);

/** Links for the bottom of the mobile drawer: the "More" bucket, minus the
 *  routes that already have their own top-level nav item. */
export const SECONDARY_LINKS: NavLink[] = (() => {
  const topLevel = new Set(NAV.filter((item) => !isMenu(item)).map((item) => item.href));
  const more = NAV_GROUPS.find((group) => group.title === "More");
  return (more?.links ?? []).filter((link) => isLive(link) && !topLevel.has(link.href));
})();

/** One flat index for the search palette: every live library page, the nav
 *  routes the library does not list, then every niche by name. */
export const SEARCH_INDEX: SearchItem[] = (() => {
  const libraryHrefs = new Set(LIVE_LIBRARY.map((entry) => entry.href));

  const fromLibrary: SearchItem[] = LIVE_LIBRARY.map((entry) => ({
    label: entry.label,
    href: entry.href,
    group: GROUP_LABELS[entry.group],
    desc: entry.desc,
  }));

  const fromNav: SearchItem[] = NAV_GROUPS.flatMap((group) =>
    group.links
      .filter((link) => isLive(link) && !libraryHrefs.has(link.href))
      .map((link) => ({ label: link.label, href: link.href, group: group.title })),
  );

  const fromNiches: SearchItem[] = Object.values(trackNames).map((name) => ({
    label: name,
    href: "/niches",
    group: "Niches",
  }));

  return [...fromLibrary, ...fromNav, ...fromNiches];
})();

/* ---------------------------------------------------------------- */
/*  Wayfinding                                                       */
/* ---------------------------------------------------------------- */

/**
 * Home > group > page. The group crumb links to the matching /library filter
 * when the route is in the library; routes outside it (/path, /privacy,
 * /library) get an unlinked bucket crumb from navGroups.
 */
export function getBreadcrumb(href: string): Crumb[] {
  if (href === "/") return [{ label: "Home" }];

  const home: Crumb = { label: "Home", href: "/" };

  const entry = LIBRARY.find((candidate) => candidate.href === href);
  if (entry) {
    return [
      home,
      { label: GROUP_LABELS[entry.group], href: `/library?group=${entry.group}` },
      { label: entry.label },
    ];
  }

  for (const group of NAV_GROUPS) {
    const link = group.links.find((candidate) => candidate.href === href);
    if (link) return [home, { label: group.title }, { label: link.label }];
  }

  return [home];
}

/**
 * Previous / next within the route's navGroups bucket, plus the bucket's
 * "up" target. Pending links are skipped so the arrows never point at a
 * route that does not exist yet. Feeds `PageFooterNav` from Phase 4 onward.
 */
export function findNavNeighbours(href: string): NavNeighbours {
  for (const group of NAV_GROUPS) {
    const live = group.links.filter(isLive);
    const index = live.findIndex((link) => link.href === href);
    if (index === -1) continue;
    return {
      prev: index > 0 ? live[index - 1] : undefined,
      next: index < live.length - 1 ? live[index + 1] : undefined,
      up: group.up,
    };
  }
  return {};
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run lib/nav.test.ts`
Expected: PASS — 18 tests, 0 failed.

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. If TypeScript rejects `siteData.nav as NavItem[]`, the JSON and the type have drifted — fix the JSON so every item is either `{label, groups, footerLinks?}` or `{label, href}`; do not widen the cast.

Note: `app/sitemap.ts` and `components/site-header.tsx` still reference `site.navGroups`/`site.primaryNav` from the old shape. `sitemap.ts` reads `g.links.map(l => l.href)` which still type-checks against the new groups. `components/site-header.tsx` reads `site.primaryNav`, which no longer exists — this is expected and is fixed when Task 8 deletes that file. If `tsc` fails only on `components/site-header.tsx`, continue; if it fails anywhere else, fix it here.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/site.json data/library.json lib/nav.ts lib/nav.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(nav): author the four-bucket IA in site.json and add lib/nav helpers"
```

---

### Task 2: The link audit learns the `pending` convention

**Parallel group:** B

**Files:**
- Modify: `scripts/verify-links.mjs`
- Modify: `package.json` (the `verify:all` script)

**Interfaces:**
- Consumes: the `"pending": true` keys added to `data/site.json` and `data/library.json` in Task 1.
- Produces: `npm run verify:links` exits 0 with the whole IA authored, and is part of `npm run verify:all`.

`scripts/verify-links.mjs` is a **static** checker: it walks `app/` for `page.*` files to build the route set, walks `public/` for assets, then scans `app/`, `components/`, `data/`, and `lib/` for `href`/`url`/`tool`/`redirectTo` values and `router.push()` targets. It needs **no dev server**, so it belongs in `verify:all`. It already covers `data/library.json` and `data/site.json` (including the new `nav` tree and `cta`) because it walks every JSON file in `data/` and treats any `href` key as a reference.

- [ ] **Step 1: Run the audit to see it fail**

Run: `node scripts/verify-links.mjs`
Expected: FAIL with

```
Link audit failed with 5 problems:
- data/site.json:… /practice (no page or public asset for /practice; $.nav[1].footerLinks[0].href)
- data/site.json:… /glossary (…)
- data/library.json:… /practice (…)
- data/library.json:… /glossary (…)
- data/library.json:… /educators (…)
```

(The exact count depends on how many `pending` links exist; `/educators` in `site.json` resolves to the same string as the one in `library.json`, so the reported set may collapse. Any failure naming a pending route is the expected state.)

- [ ] **Step 2: Add the file header**

Insert this docblock as the first lines of `scripts/verify-links.mjs`, above `import fs from "node:fs";`:

```js
/**
 * Static internal-link audit. No dev server, no network: it derives the route
 * set from app/**\/page.* and the asset set from public/**, then checks every
 * internal href/url/redirectTo it can find in app/, components/, data/, lib/.
 *
 * Sources covered: data/site.json (nav, navGroups, cta), data/library.json,
 * every other data/*.json, JSX href/src attributes, object literals, and
 * router.push()/redirect() string arguments.
 *
 * A link object carrying `"pending": true` is authored in the information
 * architecture but its route ships in a later phase, so the whole object is
 * skipped and counted. See lib/nav.ts for the convention.
 *
 * Run: npm run verify:links (part of npm run verify:all)
 */
```

- [ ] **Step 3: Add the counter**

Immediately after the `const PAGE_FILE = /^page\.(?:js|jsx|ts|tsx)$/;` line, add:

```js
/** Links skipped because their route ships in a later phase. */
let pendingLinks = 0;
```

- [ ] **Step 4: Skip pending objects in the JSON walker**

In `extractJsonReferences`, replace the object branch of `visit`:

```js
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, child]) =>
        visit(child, childKey, `${pointer}.${childKey}`),
      );
    }
```

with:

```js
    if (value && typeof value === "object") {
      // Authored in the IA, route ships in a later phase — skip the subtree.
      if (value.pending === true) {
        pendingLinks += 1;
        return;
      }

      Object.entries(value).forEach(([childKey, child]) =>
        visit(child, childKey, `${pointer}.${childKey}`),
      );
    }
```

- [ ] **Step 5: Report the count**

Replace the success `console.log` at the bottom of the file:

```js
  console.log(
    `Link audit passed: ${routes.size} routes, ${references.length} internal references, ` +
      `${publicAssets.size} public assets, ${intentionalPlaceholders} intentional placeholders, ` +
      `${pendingLinks} links pending a later phase.`,
  );
```

- [ ] **Step 6: Run the audit to verify it passes**

Run: `node scripts/verify-links.mjs`
Expected: PASS —

```
Link audit passed: 33 routes, … internal references, … public assets, … intentional placeholders, 5 links pending a later phase.
```

`/library` does not exist yet (Task 10 creates it), so the audit will still fail on `data/site.json`'s `/library` references. If it does, that failure is expected at this point in the plan — note it and proceed; Task 10 ends with a re-run that must be clean. To keep this task independently green, run instead:

Run: `node -e "const s=require('./data/site.json');console.log(JSON.stringify(s.nav).includes('pending'))"`
Expected: `true`

and confirm the audit's remaining failures name only `/library`:

Run: `node scripts/verify-links.mjs 2>&1 | grep -c "/practice\|/glossary\|/educators"`
Expected: `0`

- [ ] **Step 7: Put `verify:links` into `verify:all`**

In `package.json`, change:

```json
    "verify:all": "npm run verify:contrast && npm run verify:claims && npm run lint && npx tsc --noEmit"
```

to:

```json
    "verify:all": "npm run verify:contrast && npm run verify:links && npm run verify:claims && npm run lint && npx tsc --noEmit"
```

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/verify-links.mjs package.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(verify): teach the link audit about pending routes and add it to verify:all"
```

---

### Task 3: Move the leaf shell components into `components/site/`

**Parallel group:** B

**Files:**
- Move: `components/logo.tsx` → `components/site/logo.tsx`
- Move: `components/sw-register.tsx` → `components/site/sw-register.tsx`
- Move: `components/motion-provider.tsx` → `components/site/motion-provider.tsx`
- Move: `components/json-ld.tsx` → `components/site/json-ld.tsx`
- Move + rewrite: `components/back-to-top.tsx` → `components/site/back-to-top.tsx`
- Create: `components/logo.tsx`, `components/sw-register.tsx`, `components/motion-provider.tsx`, `components/json-ld.tsx`, `components/back-to-top.tsx` (one-line re-export shims)
- Modify: `components/ui/icon.tsx` (three new registry names)

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`.
- Produces: `@/components/site/logo` → `Logo`, `LogoMark`, `Bracket`; `@/components/site/back-to-top` → `BackToTop`; `@/components/site/sw-register` → `SWRegister`; `@/components/site/motion-provider` → `MotionProvider`; `@/components/site/json-ld` → `JsonLd`. The icon names `caret-down`, `list`, and `arrow-right` resolve.

`app/tasks/page.tsx` and `app/interview/page.tsx` import `@/components/json-ld` today, so the old paths must keep working. Use `git mv` for the four files whose contents do **not** change — Phase 0 rewrote `components/logo.tsx` and this plan must not overwrite whatever it shipped.

- [ ] **Step 1: Move the four unchanged files**

```bash
mkdir -p components/site
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/logo.tsx components/site/logo.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/sw-register.tsx components/site/sw-register.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/motion-provider.tsx components/site/motion-provider.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/json-ld.tsx components/site/json-ld.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/back-to-top.tsx components/site/back-to-top.tsx
```

- [ ] **Step 2: Write the five re-export shims**

`components/logo.tsx`:
```tsx
export { Logo, LogoMark, Bracket } from "@/components/site/logo";
```

`components/sw-register.tsx`:
```tsx
export { SWRegister } from "@/components/site/sw-register";
```

`components/motion-provider.tsx`:
```tsx
export { MotionProvider } from "@/components/site/motion-provider";
```

`components/json-ld.tsx`:
```tsx
export { JsonLd } from "@/components/site/json-ld";
```

`components/back-to-top.tsx`:
```tsx
export { BackToTop } from "@/components/site/back-to-top";
```

- [ ] **Step 3: Add the three nav icon names**

`components/site/*` needs `caret-down` (dropdown chevron), `list` (drawer trigger), and `arrow-right` (the library footer row). The Phase 1 registry does not have them. In `components/ui/icon.tsx`, add the three Phosphor components to the existing alphabetical import block:

```tsx
  ArrowRight,
  CaretDown,
  List,
```

and the three kebab names to the `REGISTRY` map, in alphabetical position:

```tsx
  "arrow-right": ArrowRight,
  "caret-down": CaretDown,
  list: List,
```

If Phase 1's `ICON_NAMES` is written by hand rather than derived with `Object.keys(REGISTRY)`, add the same three strings to it as well.

- [ ] **Step 4: Rewrite `components/site/back-to-top.tsx`**

It is the last file in the shell importing `lucide-react` and the last one using `hover:-translate-y-*`, both of which `verify:primitives` flags. Replace the whole file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Pixels scrolled before the button appears. */
const SHOW_AFTER = 600;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-pill",
        "border border-line bg-ink text-on-navy shadow-[var(--shadow-md)]",
        "transition-colors duration-150 hover:bg-primary",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon name="arrow-up" size={18} />
    </button>
  );
}
```

- [ ] **Step 5: Verify the old import paths still resolve**

Run: `npx tsc --noEmit 2>&1 | grep -v "components/site-header" | head -20`
Expected: no output beyond the known `components/site-header.tsx` errors from Task 1 (that file is deleted in Task 8).

Run: `npx eslint components/site components/logo.tsx components/json-ld.tsx components/back-to-top.tsx components/sw-register.tsx components/motion-provider.tsx`
Expected: exit 0, no warnings.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site components/logo.tsx components/json-ld.tsx components/back-to-top.tsx components/sw-register.tsx components/motion-provider.tsx components/ui/icon.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(site): move the leaf shell components to components/site with re-export shims"
```

---

### Task 4: `NavDesktop` — four items, two-column dropdowns, full keyboard model

**Parallel group:** C

**Files:**
- Create: `components/site/nav-desktop.tsx`
- Test: `components/site/nav-desktop.test.tsx`

**Interfaces:**
- Consumes: `NAV`, `isLive`, `isMenu`, `type NavMenu` from `@/lib/nav`; `Icon` from `@/components/ui`; `cn` from `@/lib/utils`.
- Produces: `export function NavDesktop()` — a client component rendering `<nav aria-label="Primary">`, hidden below `lg`.

Behaviour required by spec §6.1: click or Enter/Space or ArrowDown opens; ArrowUp/ArrowDown move between items; Esc closes and returns focus to the trigger; a click outside closes; a route change closes; only one panel open at a time; each item shows label + description; every panel ends with "Browse everything in the library →"; the active route is `text-primary` with a 2px underline, not a filled pill.

- [ ] **Step 1: Write the failing test**

Create `components/site/nav-desktop.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavDesktop } from "@/components/site/nav-desktop";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("NavDesktop", () => {
  it("renders the four top-level items", () => {
    render(<NavDesktop />);
    expect(screen.getByRole("button", { name: "Path" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reality Check" })).toBeInTheDocument();
  });

  it("opens the panel on click and toggles aria-expanded", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Learn" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /The Method/ })).toBeNull();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /The Method/ })).toBeInTheDocument();
    expect(screen.getByText("Work like a professional")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse everything in the library/ }),
    ).toHaveAttribute("href", "/library");
  });

  it("hides links whose route ships in a later phase", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    await user.click(screen.getByRole("button", { name: "Learn" }));
    expect(screen.queryByRole("link", { name: /Glossary/ })).toBeNull();
  });

  it("opens on ArrowDown from the trigger", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Path" });

    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Your dashboard/ })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Work" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("keeps only one panel open at a time", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const path = screen.getByRole("button", { name: "Path" });
    const work = screen.getByRole("button", { name: "Work" });

    await user.click(path);
    await user.click(work);

    expect(path).toHaveAttribute("aria-expanded", "false");
    expect(work).toHaveAttribute("aria-expanded", "true");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/site/nav-desktop.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/site/nav-desktop"`.

- [ ] **Step 3: Write the component**

Create `components/site/nav-desktop.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Icon } from "@/components/ui";
import { NAV, isLive, isMenu, type NavMenu } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Marks the focusable rows inside an open panel, in visual order. */
const ITEM_SELECTOR = "a[data-nav-item]";

export function NavDesktop() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  // A deliberate UI-reset-on-route-change: covers link clicks and browser
  // back/forward. Not derivable state, so the effect is the right tool.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {NAV.map((item) =>
        isMenu(item) ? (
          <NavDropdown
            key={item.label}
            item={item}
            pathname={pathname}
            open={openLabel === item.label}
            onOpenChange={(next) => setOpenLabel(next ? item.label : null)}
          />
        ) : (
          <Link
            key={item.label}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "relative rounded-pill px-3.5 py-2 text-base font-medium transition-colors duration-150",
              pathname === item.href ? "text-primary" : "text-ink-soft hover:text-ink",
            )}
          >
            {item.label}
            {pathname === item.href && <ActiveUnderline />}
          </Link>
        ),
      )}
    </nav>
  );
}

function ActiveUnderline() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-3.5 -bottom-0.5 block h-0.5 rounded-pill bg-primary"
    />
  );
}

function NavDropdown({
  item,
  pathname,
  open,
  onOpenChange,
}: {
  item: NavMenu;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const footerLinks = (item.footerLinks ?? []).filter(isLive);
  const active = [...item.groups.flatMap((group) => group.links), ...footerLinks].some(
    (link) => link.href === pathname,
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onOpenChange]);

  function close(returnFocus: boolean) {
    onOpenChange(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function rows(): HTMLAnchorElement[] {
    return Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>(ITEM_SELECTOR) ?? []);
  }

  function focusRow(index: number) {
    const list = rows();
    if (list.length === 0) return;
    list[((index % list.length) + list.length) % list.length]?.focus();
  }

  function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    onOpenChange(true);
    const first = event.key === "ArrowDown" ? 0 : -1;
    window.requestAnimationFrame(() => focusRow(first));
  }

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const list = rows();
    const current = list.indexOf(document.activeElement as HTMLAnchorElement);
    focusRow(current === -1 ? 0 : current + (event.key === "ArrowDown" ? 1 : -1));
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "relative flex items-center gap-1 rounded-pill px-3.5 py-2 text-base font-medium transition-colors duration-150",
          active || open ? "text-primary" : "text-ink-soft hover:text-ink",
        )}
      >
        {item.label}
        <span
          aria-hidden
          className={cn("inline-flex transition-transform duration-150", open && "rotate-180")}
        >
          <Icon name="caret-down" size={14} />
        </span>
        {active && <ActiveUnderline />}
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          onKeyDown={onPanelKeyDown}
          className={cn(
            "absolute left-0 top-[calc(100%+0.75rem)] z-50 max-w-[calc(100vw-3rem)]",
            "rounded-md border border-line bg-paper p-5 shadow-[var(--shadow-sm)]",
            item.groups.length > 1 ? "w-[36rem]" : "w-[22rem]",
          )}
        >
          <div
            className={cn("grid gap-x-8 gap-y-6", item.groups.length > 1 && "sm:grid-cols-2")}
          >
            {item.groups.map((group) => (
              <div key={group.title}>
                <p className="text-kicker uppercase text-ink-faint">{group.title}</p>
                <ul className="mt-3 flex flex-col gap-0.5">
                  {group.links.filter(isLive).map((link) => (
                    <li key={link.href}>
                      <Link
                        data-nav-item
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className="block rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-band"
                      >
                        <span
                          className={cn(
                            "block text-base font-medium",
                            pathname === link.href ? "text-primary" : "text-ink",
                          )}
                        >
                          {link.label}
                        </span>
                        <span className="mt-0.5 block text-caption text-ink-faint">
                          {link.desc}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {footerLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  data-nav-item
                  href={link.href}
                  className="rounded-pill border border-line px-3 py-1.5 text-small font-medium text-ink-soft transition-colors duration-150 hover:border-ink hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className={cn(footerLinks.length > 0 ? "mt-3" : "mt-4 border-t border-line pt-4")}>
            <Link
              data-nav-item
              href="/library"
              className="inline-flex items-center gap-1.5 rounded-sm text-small font-semibold text-primary transition-colors duration-150 hover:text-primary-deep"
            >
              Browse everything in the library
              <span aria-hidden className="inline-flex">
                <Icon name="arrow-right" size={15} />
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/site/nav-desktop.test.tsx`
Expected: PASS — 6 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site/nav-desktop.tsx components/site/nav-desktop.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(nav): desktop dropdowns with descriptions and a full keyboard model"
```

---

### Task 5: `MobileDrawer` — right-side `Dialog` with a CTA on top and accordion groups

**Parallel group:** C

**Files:**
- Create: `components/site/mobile-drawer.tsx`
- Test: `components/site/mobile-drawer.test.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionItem`, `Button`, `Dialog`, `Icon` from `@/components/ui`; `NAV`, `NAV_CTA`, `SECONDARY_LINKS`, `isLive`, `isMenu` from `@/lib/nav`.
- Produces: `export function MobileDrawer()` — renders its own 48px trigger (hidden at `lg`) plus the drawer.

Spec §6.2: full-height drawer, primary CTA on top, four accordion groups (Reality Check as a direct link), then Library and Privacy. One column, 48px rows. Closes on route change. `Dialog` already provides the portal, focus trap, Esc, return focus, and scroll lock, so this component adds none of them.

- [ ] **Step 1: Write the failing test**

Create `components/site/mobile-drawer.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileDrawer } from "@/components/site/mobile-drawer";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

async function openDrawer() {
  const user = userEvent.setup();
  render(<MobileDrawer />);
  await user.click(screen.getByRole("button", { name: /open menu/i }));
  return user;
}

describe("MobileDrawer", () => {
  it("renders nothing but the trigger until it is opened", () => {
    render(<MobileDrawer />);
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Find your path" })).toBeNull();
  });

  it("puts the CTA above the accordion groups", async () => {
    await openDrawer();
    const cta = screen.getByRole("link", { name: "Find your path" });
    const learn = screen.getByText("Learn");
    expect(cta.compareDocumentPosition(learn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders one accordion group per dropdown", async () => {
    await openDrawer();
    for (const label of ["Path", "Learn", "Work"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "The Method" })).toBeInTheDocument();
  });

  it("renders Reality Check as a direct link, not a group", async () => {
    await openDrawer();
    expect(screen.getByRole("link", { name: "Reality Check" })).toHaveAttribute("href", "/reality");
  });

  it("puts Library and Privacy at the bottom and hides pending routes", async () => {
    await openDrawer();
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByRole("link", { name: /For educators/i })).toBeNull();
    expect(screen.queryByRole("link", { name: "Glossary" })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/site/mobile-drawer.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/site/mobile-drawer"`.

- [ ] **Step 3: Write the component**

Create `components/site/mobile-drawer.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Accordion, AccordionItem, Button, Dialog, Icon } from "@/components/ui";
import { NAV, NAV_CTA, SECONDARY_LINKS, isLive, isMenu, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** 48px rows, one column (spec §6.2). */
const ROW = "flex min-h-12 items-center rounded-sm px-3 text-base transition-colors duration-150";

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function row(link: NavLink) {
    const active = pathname === link.href;
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(ROW, active ? "font-semibold text-primary" : "text-ink hover:bg-band")}
        >
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-pill border border-line text-ink transition-colors duration-150 hover:border-ink lg:hidden"
      >
        <Icon name="list" size={20} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Menu"
        hideTitle
        placement="right"
        flush
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="grid border-b border-line p-4">
            <Button href={NAV_CTA.href} variant="primary" size="lg">
              {NAV_CTA.label}
            </Button>
          </div>

          <nav aria-label="Mobile" className="flex-1 p-2">
            <Accordion type="single">
              {NAV.filter(isMenu).map((item) => (
                <AccordionItem
                  key={item.label}
                  id={`drawer-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  title={item.label}
                >
                  <ul className="flex flex-col">
                    {[
                      ...item.groups.flatMap((group) => group.links),
                      ...(item.footerLinks ?? []),
                    ]
                      .filter(isLive)
                      .map(row)}
                  </ul>
                </AccordionItem>
              ))}
            </Accordion>

            <ul className="mt-1 flex flex-col border-t border-line pt-1">
              {NAV.filter((item) => !isMenu(item)).map(row)}
            </ul>
          </nav>

          <ul className="flex flex-col border-t border-line p-2">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(ROW, "text-ink-soft hover:bg-band hover:text-ink")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
}
```

`NAV.filter((item) => !isMenu(item)).map(row)` type-checks because `NavDirect` is structurally a `NavLink`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/site/mobile-drawer.test.tsx`
Expected: PASS — 5 tests, 0 failed.

If `Dialog` does not accept `placement="right"`, widen its union in `components/ui/dialog.tsx` to `"center" | "top" | "right"` and give `"right"` the full-height right-edge panel styles; that is a Phase 1 gap, not a Phase 2 workaround.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site/mobile-drawer.tsx components/site/mobile-drawer.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(nav): mobile drawer on Dialog with CTA on top and accordion groups"
```

---

### Task 6: `SearchPalette` rebuilt on `Dialog`

**Parallel group:** C

**Files:**
- Create: `components/site/search-palette.tsx`
- Test: `components/site/search-palette.test.tsx`

**Interfaces:**
- Consumes: `Dialog`, `Icon` from `@/components/ui`; `SEARCH_INDEX`, `type SearchItem` from `@/lib/nav`; `track` from `@/lib/analytics`.
- Produces: `export function SearchPalette()` — renders its own 48px trigger plus the palette.

Keeps today's keyboard model exactly: Ctrl/Cmd+K opens from anywhere, ArrowUp/ArrowDown move the highlight, Enter navigates, Esc closes, `aria-activedescendant` points at the highlighted option. The focus trap, return-focus, and portal are now `Dialog`'s job. The GA event name `site_search_nav` is preserved for continuity; `site_search_open` is added so the open rate is measurable.

The raw `<input>` is deliberate: a combobox needs `role`, `aria-controls`, and `aria-activedescendant` pass-through. `verify:primitives` allows it because this file imports from `@/components/ui`.

- [ ] **Step 1: Write the failing test**

Create `components/site/search-palette.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPalette } from "@/components/site/search-palette";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

async function openPalette() {
  const user = userEvent.setup();
  render(<SearchPalette />);
  await user.click(screen.getByRole("button", { name: /search pages/i }));
  return { user, input: screen.getByRole("combobox", { name: /search pages/i }) };
}

describe("SearchPalette", () => {
  it("filters the options as you type", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "interview");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Interview Prep");
  });

  it("matches a niche by name", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "bookkeeping");

    expect(screen.getByRole("option", { name: /Bookkeeping & Accounting/ })).toBeInTheDocument();
  });

  it("navigates to the highlighted option on ArrowDown + Enter", async () => {
    push.mockClear();
    const { user, input } = await openPalette();
    // "stage" hits the five stage descriptions in library.json order:
    // Start here, Get Hired, Deliver, Level Up, Own.
    await user.type(input, "stage");
    expect(screen.getAllByRole("option")).toHaveLength(5);

    await user.keyboard("{ArrowDown}{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/get-hired");
  });

  it("marks the highlighted option with aria-activedescendant", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "stage");
    await user.keyboard("{ArrowDown}");

    const selected = screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true");
    expect(selected).toBeDefined();
    expect(input).toHaveAttribute("aria-activedescendant", selected?.id);
  });

  it("shows a no-results line when nothing matches", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "qqqqzzz");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/no pages match/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/site/search-palette.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/site/search-palette"`.

- [ ] **Step 3: Write the component**

Create `components/site/search-palette.tsx`:

```tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Icon } from "@/components/ui";
import { track } from "@/lib/analytics";
import { SEARCH_INDEX, type SearchItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function matches(item: SearchItem, term: string) {
  return (
    item.label.toLowerCase().includes(term) ||
    item.group.toLowerCase().includes(term) ||
    (item.desc ?? "").toLowerCase().includes(term)
  );
}

export function SearchPalette() {
  const router = useRouter();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setQuery("");
      setActive(0);
      setOpen(true);
      track("site_search_open", { source: "shortcut" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Dialog puts focus in the panel; the combobox is where typing should land.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SEARCH_INDEX;
    return SEARCH_INDEX.filter((item) => matches(item, term));
  }, [query]);

  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const activeOptionId = results[active] ? optionId(active) : undefined;

  function go(index: number) {
    const item = results[index];
    if (!item) return;
    track("site_search_nav", { href: item.href });
    setOpen(false);
    router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen(true);
          track("site_search_open", { source: "button" });
        }}
        aria-label="Search pages"
        title="Search (Ctrl K)"
        className="grid h-12 w-12 place-items-center rounded-pill border border-line text-ink-soft transition-colors duration-150 hover:border-ink hover:text-ink"
      >
        <Icon name="search" size={18} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Search pages"
        hideTitle
        placement="top"
        flush
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden className="inline-flex shrink-0 text-ink-faint">
            <Icon name="search" size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label="Search pages"
            placeholder="Search pages…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(index + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(index - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(active);
              }
            }}
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-caption text-ink-faint sm:block">
            Esc
          </kbd>
        </div>

        <ul id={listboxId} role="listbox" aria-label="Pages" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-small text-ink-faint">
              No pages match “{query}”.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={`${item.href}-${item.label}`} role="none">
                <button
                  id={optionId(index)}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => go(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-small transition-colors duration-150",
                    index === active ? "bg-tint text-primary-deep" : "text-ink hover:bg-band",
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={cn(
                      "shrink-0 text-caption",
                      index === active ? "text-primary-deep" : "text-ink-faint",
                    )}
                  >
                    {item.group}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/site/search-palette.test.tsx`
Expected: PASS — 5 tests, 0 failed.

If `Dialog`'s `placement` union has no `"top"`, add it in `components/ui/dialog.tsx` (a top-anchored panel at `pt-[12vh]`); the palette needs to sit near the top of the viewport, not centred.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site/search-palette.tsx components/site/search-palette.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(nav): rebuild the search palette on Dialog over the shared IA index"
```

---

### Task 7: `SiteFooter` — light band, four columns

**Parallel group:** C

**Files:**
- Create: `components/site/footer.tsx`

**Interfaces:**
- Consumes: `Container` from `@/components/layout`; `Logo` from `./logo`; `NAV_GROUPS`, `isLive` from `@/lib/nav`; `site.brand`, `site.meaning` from `@/data/site.json`.
- Produces: `export function SiteFooter()` — a server component.

Spec §6.4: "Footer is light (`band`), not navy; the navy CTA band sits above it." Four link columns come from `navGroups`, which is exactly four buckets after Task 1. The honesty sentence is a local constant here because Phase 8 owns shell copy in `site.json`; keeping it in the component now avoids adding a `site.json` field Phase 8 would immediately move.

- [ ] **Step 1: Write the component**

Create `components/site/footer.tsx`:

```tsx
import Link from "next/link";
import { Container } from "@/components/layout";
import site from "@/data/site.json";
import { NAV_GROUPS, isLive } from "@/lib/nav";
import { Logo } from "./logo";

/** Shell copy. Phase 8 owns the final wording; the honesty rule does not move. */
const HONESTY =
  "Hire From PH is an independent, non-commercial project. Every page is free to read, and every figure carries its source.";

const COPYRIGHT =
  "Pay figures and market data are cited to their sources. They are estimates, not promises.";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-band">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex rounded-md" aria-label="Hire From PH — home">
              <Logo markSize={32} />
            </Link>
            <p className="mt-5 text-small leading-relaxed text-ink-soft">{site.meaning}</p>
            <p className="mt-4 text-caption leading-relaxed text-ink-faint">{HONESTY}</p>
          </div>

          <nav aria-label="Footer" className="contents">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-kicker uppercase text-ink-faint">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.filter(isLive).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-small text-ink-soft transition-colors duration-150 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-line py-8">
          <p className="text-caption text-ink-faint">
            © 2026 {site.brand}. {COPYRIGHT}
          </p>
        </div>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check and lint the file**

Run: `npx tsc --noEmit 2>&1 | grep "components/site/footer" ; npx eslint components/site/footer.tsx`
Expected: no output from either (exit 0 from eslint).

- [ ] **Step 3: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site/footer.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(site): light band footer with four columns from navGroups"
```

---

### Task 8: The header shell, the barrel, and `app/layout.tsx`

**Parallel group:** D

**Files:**
- Create: `components/site/header.tsx`, `components/site/header-cta.tsx`, `components/site/index.ts`
- Modify: `app/layout.tsx`
- Delete: `components/site-header.tsx`, `components/site-footer.tsx`, `components/search-palette.tsx`

**Interfaces:**
- Consumes: `NavDesktop` (Task 4), `MobileDrawer` (Task 5), `SearchPalette` (Task 6), `SiteFooter` (Task 7), `Logo` (Task 3), `Container` from `@/components/layout`, `Button`/`Icon` from `@/components/ui`, `usePath()` from `@/lib/path-context`, `NAV_CTA` from `@/lib/nav`.
- Produces: `@/components/site` exports `SiteHeader`, `SiteFooter`, `SearchPalette`, `NavDesktop`, `MobileDrawer`, `HeaderCta`, `LibraryBrowser`, `Logo`, `LogoMark`, `Bracket`, `BackToTop`, `SWRegister`, `MotionProvider`, `JsonLd`.

Spec §6.1: floating white bar, `line` border, `radius-pill`, 72px tall, sticky, no transparency tricks. The chosen-path CTA swap keeps today's behaviour (`usePath()` + `track-names.json`), restyled onto `verified` tokens.

- [ ] **Step 1: Write `components/site/header-cta.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import trackNames from "@/data/track-names.json";
import { NAV_CTA } from "@/lib/nav";
import { usePath } from "@/lib/path-context";

/**
 * "Find your path" until a track is chosen, then the track pill (spec §6.1).
 * Reads the slim track-names map so the always-loaded header never pulls in
 * data/tracks.json.
 */
export function HeaderCta() {
  const { hasPath, hydrated, state } = usePath();
  const trackName = state.track ? (trackNames as Record<string, string>)[state.track] : undefined;

  if (hydrated && hasPath && trackName) {
    return (
      <Link
        href="/path"
        className="hidden min-h-12 items-center gap-2 rounded-pill border border-verified-fill/40 bg-verified-tint px-4 text-small font-semibold text-verified transition-colors duration-150 hover:border-verified sm:inline-flex"
      >
        <span aria-hidden className="inline-flex">
          <Icon name="check-circle-2" size={16} weight="fill" />
        </span>
        <span className="max-w-[10rem] truncate">{trackName}</span>
      </Link>
    );
  }

  return (
    <div className="hidden sm:block">
      <Button href={NAV_CTA.href} variant="primary" size="md">
        {NAV_CTA.label}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/site/header.tsx`**

```tsx
import Link from "next/link";
import { Container } from "@/components/layout";
import { HeaderCta } from "./header-cta";
import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";
import { NavDesktop } from "./nav-desktop";
import { SearchPalette } from "./search-palette";

/**
 * Floating white bar: opaque paper band, bordered pill, 72px, sticky.
 * No backdrop blur and no transparency (spec §6.1) — the border does the work.
 * Server component: only the three interactive children are client code.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper py-3">
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-4 rounded-pill border border-line bg-paper px-4 shadow-[var(--shadow-sm)] sm:px-6">
          <Link href="/" className="shrink-0 rounded-md" aria-label="Hire From PH — home">
            <Logo markSize={30} showTagline />
          </Link>

          <NavDesktop />

          <div className="flex shrink-0 items-center gap-2">
            <SearchPalette />
            <HeaderCta />
            <MobileDrawer />
          </div>
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 3: Write `components/site/index.ts`**

```ts
export { SiteHeader } from "./header";
export { SiteFooter } from "./footer";
export { HeaderCta } from "./header-cta";
export { NavDesktop } from "./nav-desktop";
export { MobileDrawer } from "./mobile-drawer";
export { SearchPalette } from "./search-palette";
export { LibraryBrowser } from "./library-browser";
export { Logo, LogoMark, Bracket } from "./logo";
export { BackToTop } from "./back-to-top";
export { SWRegister } from "./sw-register";
export { MotionProvider } from "./motion-provider";
export { JsonLd } from "./json-ld";
```

`./library-browser` does not exist until Task 9. If Task 9 has not run yet, add that line at the end of Task 9 instead and leave it out here — everything else in the barrel is already on disk.

- [ ] **Step 4: Point `app/layout.tsx` at the barrel**

Replace these five import lines in `app/layout.tsx`:

```tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion-provider";
import { SWRegister } from "@/components/sw-register";
import { BackToTop } from "@/components/back-to-top";
```

with one:

```tsx
import {
  BackToTop,
  MotionProvider,
  SiteFooter,
  SiteHeader,
  SWRegister,
} from "@/components/site";
```

Nothing else in `app/layout.tsx` changes. The skip link and `<main id="main" tabIndex={-1}>` stay exactly as they are:

```tsx
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PathProvider>
          <MotionProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="relative z-[2] flex-1 outline-none">{children}</main>
            <SiteFooter />
            <BackToTop />
          </MotionProvider>
        </PathProvider>
        <SWRegister />
```

- [ ] **Step 5: Delete the three replaced files**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm components/site-header.tsx components/site-footer.tsx components/search-palette.tsx
```

- [ ] **Step 6: Confirm nothing still imports them**

Run: `npx tsc --noEmit`
Expected: exit 0, no output. (`app/library/page.tsx` does not exist yet, so the `LibraryBrowser` export in the barrel is the only thing that can fail here — see Step 3.)

Run: `npx eslint app components/site`
Expected: exit 0.

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: exit 0. The route table lists 33 routes (no `/library` yet).

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site app/layout.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(site): floating header shell, site barrel, layout wired to components/site"
```

---

### Task 9: `LibraryBrowser` — URL-synced chips and query

**Parallel group:** C

**Files:**
- Create: `components/site/library-browser.tsx`
- Test: `components/site/library-browser.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Card`, `CardBody`, `EmptyState`, `Heading`, `Text` from `@/components/ui`; `CardGrid` from `@/components/layout`; `LIVE_LIBRARY`, `LIBRARY_GROUPS`, `LIBRARY_TYPES`, `GROUP_LABELS`, `TYPE_LABELS`, `type LibraryGroup`, `type LibraryType` from `@/lib/nav`.
- Produces: `export function LibraryBrowser()` — a client component. It calls `useSearchParams()`, so its parent must wrap it in `<Suspense>`.

Spec §6.3: cards with title, one-line description, type badge, stage badge where applicable; filter chips by group and type; a search box reusing the palette's data. Filters are mirrored into `?group=&type=&q=` so a filtered view is shareable, while the component keeps its own state so it stays snappy and testable.

- [ ] **Step 1: Write the failing test**

Create `components/site/library-browser.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryBrowser } from "@/components/site/library-browser";
import { LIVE_LIBRARY } from "@/lib/nav";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/library",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("LibraryBrowser", () => {
  it("shows every live library entry by default", () => {
    render(<LibraryBrowser />);
    expect(screen.getAllByRole("link")).toHaveLength(LIVE_LIBRARY.length);
    expect(screen.getByText(`${LIVE_LIBRARY.length} of ${LIVE_LIBRARY.length} pages`)).toBeInTheDocument();
  });

  it("never lists a page whose route ships in a later phase", () => {
    render(<LibraryBrowser />);
    expect(screen.queryByRole("link", { name: /Flashcards and quizzes/ })).toBeNull();
  });

  it("narrows the grid when a group chip is pressed, and mirrors it to the URL", async () => {
    replace.mockClear();
    const user = userEvent.setup();
    render(<LibraryBrowser />);
    const before = screen.getAllByRole("link").length;

    await user.click(screen.getByRole("button", { name: "The path" }));

    const after = screen.getAllByRole("link").length;
    expect(after).toBe(5);
    expect(after).toBeLessThan(before);
    expect(replace).toHaveBeenCalledWith("/library?group=path", { scroll: false });
  });

  it("marks the pressed chip", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);
    const chip = screen.getByRole("button", { name: "Workshop" });

    expect(chip).toHaveAttribute("aria-pressed", "false");
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("filters by the search query over label and description", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);

    await user.type(screen.getByRole("searchbox", { name: /search the library/i }), "japanese");

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Languages/ })).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);

    await user.type(screen.getByRole("searchbox", { name: /search the library/i }), "qqqqzzz");

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/no pages match/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/site/library-browser.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/site/library-browser"`.

- [ ] **Step 3: Write the component**

Create `components/site/library-browser.tsx`:

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CardGrid } from "@/components/layout";
import { Badge, Card, CardBody, EmptyState, Heading, Text } from "@/components/ui";
import {
  GROUP_LABELS,
  LIBRARY_GROUPS,
  LIBRARY_TYPES,
  LIVE_LIBRARY,
  TYPE_LABELS,
  type LibraryGroup,
  type LibraryType,
} from "@/lib/nav";
import { cn } from "@/lib/utils";

type GroupFilter = LibraryGroup | "all";
type TypeFilter = LibraryType | "all";

/** One accent per type so the badge row reads at a glance (spec §4.2). */
const TYPE_TONE: Record<LibraryType, "info" | "signal" | "verified" | "caution"> = {
  guide: "info",
  workshop: "signal",
  tool: "verified",
  data: "caution",
};

function asGroup(value: string | null): GroupFilter {
  return LIBRARY_GROUPS.includes(value as LibraryGroup) ? (value as LibraryGroup) : "all";
}

function asType(value: string | null): TypeFilter {
  return LIBRARY_TYPES.includes(value as LibraryType) ? (value as LibraryType) : "all";
}

const CHIP =
  "rounded-pill border px-3.5 py-2 text-small font-medium transition-colors duration-150";
const CHIP_ON = "border-primary bg-tint text-primary-deep";
const CHIP_OFF = "border-line text-ink-soft hover:border-ink hover:text-ink";

export function LibraryBrowser() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Local state keeps typing and chip clicks instant; the URL is a mirror so a
  // filtered view can be shared or bookmarked.
  const [group, setGroup] = useState<GroupFilter>(() => asGroup(params.get("group")));
  const [type, setType] = useState<TypeFilter>(() => asType(params.get("type")));
  const [query, setQuery] = useState(() => params.get("q") ?? "");

  function syncUrl(next: { group: GroupFilter; type: TypeFilter; query: string }) {
    const search = new URLSearchParams();
    if (next.group !== "all") search.set("group", next.group);
    if (next.type !== "all") search.set("type", next.type);
    if (next.query.trim()) search.set("q", next.query.trim());
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function pickGroup(next: GroupFilter) {
    setGroup(next);
    syncUrl({ group: next, type, query });
  }

  function pickType(next: TypeFilter) {
    setType(next);
    syncUrl({ group, type: next, query });
  }

  function setSearch(next: string) {
    setQuery(next);
    syncUrl({ group, type, query: next });
  }

  function clear() {
    setGroup("all");
    setType("all");
    setQuery("");
    syncUrl({ group: "all", type: "all", query: "" });
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return LIVE_LIBRARY.filter(
      (entry) =>
        (group === "all" || entry.group === group) &&
        (type === "all" || entry.type === type) &&
        (term === "" ||
          entry.label.toLowerCase().includes(term) ||
          entry.desc.toLowerCase().includes(term)),
    );
  }, [group, type, query]);

  const filtered = group !== "all" || type !== "all" || query.trim() !== "";

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-kicker uppercase text-ink-faint">Group</span>
          <button
            type="button"
            aria-pressed={group === "all"}
            onClick={() => pickGroup("all")}
            className={cn(CHIP, group === "all" ? CHIP_ON : CHIP_OFF)}
          >
            All groups
          </button>
          {LIBRARY_GROUPS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={group === id}
              onClick={() => pickGroup(id)}
              className={cn(CHIP, group === id ? CHIP_ON : CHIP_OFF)}
            >
              {GROUP_LABELS[id]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-kicker uppercase text-ink-faint">Type</span>
          <button
            type="button"
            aria-pressed={type === "all"}
            onClick={() => pickType("all")}
            className={cn(CHIP, type === "all" ? CHIP_ON : CHIP_OFF)}
          >
            All types
          </button>
          {LIBRARY_TYPES.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={type === id}
              onClick={() => pickType(id)}
              className={cn(CHIP, type === id ? CHIP_ON : CHIP_OFF)}
            >
              {TYPE_LABELS[id]}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search the library"
          placeholder="Search by name or description…"
          className="h-12 w-full max-w-md rounded-sm border border-control bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-faint focus-visible:border-primary"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <Text size="small" tone="soft">
          {results.length} of {LIVE_LIBRARY.length} pages
        </Text>
        {filtered && (
          <button
            type="button"
            onClick={clear}
            className="rounded-sm text-small font-semibold text-primary transition-colors duration-150 hover:text-primary-deep"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title="No pages match those filters."
            body="Clear a filter or try a shorter search term."
          />
        ) : (
          <CardGrid cols={3}>
            {results.map((entry) => (
              <Card key={entry.href} href={entry.href} interactive>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TYPE_TONE[entry.type]} variant="soft">
                      {TYPE_LABELS[entry.type]}
                    </Badge>
                    {entry.stage !== undefined && (
                      <Badge tone="neutral" variant="outline">
                        Stage {entry.stage}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <Heading level={2} size="h5">
                      {entry.label}
                    </Heading>
                  </div>
                  <div className="mt-2">
                    <Text size="small" tone="soft">
                      {entry.desc}
                    </Text>
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/site/library-browser.test.tsx`
Expected: PASS — 7 tests, 0 failed.

- [ ] **Step 5: Add the barrel export**

If Task 8 has already run and `components/site/index.ts` does not yet contain it, add:

```ts
export { LibraryBrowser } from "./library-browser";
```

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/site/library-browser.tsx components/site/library-browser.test.tsx components/site/index.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(library): URL-synced filter chips and search over library.json"
```

---

### Task 10: The `/library` route

**Parallel group:** D

**Files:**
- Create: `app/library/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Section`, `Container` from `@/components/layout`; `LibraryBrowser` from `@/components/site`; `pageMeta` from `@/lib/meta`.
- Produces: the `/library` route, which every dropdown's footer row, the mobile drawer, the footer's More column, and `getBreadcrumb`'s group crumbs point at.

- [ ] **Step 1: Write the route**

Create `app/library/page.tsx`:

```tsx
import { Suspense } from "react";
import { Container, PageHero, Section } from "@/components/layout";
import { LibraryBrowser } from "@/components/site";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/library",
  title: "Library",
  description:
    "Every guide, workshop, tool, and data page on Hire From PH, filtered by group, type, or stage.",
});

export default function LibraryPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Library" }]}
        kicker="Everything in one place"
        title="The library"
        lead="Every page on the site, with what it is and where it fits. Filter by group or type, or search by name."
        media={{ figureId: "library-hero" }}
        compact
      />
      <Section band="none">
        <Container>
          <Suspense fallback={null}>
            <LibraryBrowser />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
```

The `<Suspense>` boundary is not optional: `LibraryBrowser` calls `useSearchParams()`, and Next's static export of `/library` fails without it.

- [ ] **Step 2: Check the hero image dependency**

`library-hero` is generated in Phase 3. Check the manifest:

Run: `node -e "try{console.log(Object.keys(require('./data/visuals.json')).length?require('./data/visuals.json'):'')}catch(e){console.log('no visuals.json yet')}" | grep -c library-hero`
Expected: `1` if Phase 3 has landed.

If it prints `0` or `no visuals.json yet`, Phase 3 has not produced the asset. Drop the media prop for now — delete this one line from `app/library/page.tsx`:

```tsx
        media={{ figureId: "library-hero" }}
```

and add this comment in its place so Phase 3 restores it:

```tsx
        {/* media={{ figureId: "library-hero" }} — restore when Phase 3 ships the asset */}
```

- [ ] **Step 3: Run the link audit**

Run: `npm run verify:links`
Expected: PASS — `Link audit passed: 34 routes, … 5 links pending a later phase.`

- [ ] **Step 4: Build and eyeball the route**

Run: `npm run build`
Expected: exit 0; the route table now lists 34 routes including `/library`.

Run: `npm run dev` in a second terminal, then open `http://localhost:3000/library?group=work&type=data`
Expected: the Work and Data chips are pressed on load, the count line reads `4 of 30 pages`, and the four cards are Reality Check, Career Simulator, Salary Guide, Client Markets.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/library
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(library): add the /library index route"
```

---

### Task 11: Sitemap derives from the nav, minus pending routes

**Parallel group:** D

**Files:**
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `NAV_GROUPS`, `isLive` from `@/lib/nav`.
- Produces: `BASE_URL` (unchanged export, imported by `app/layout.tsx` and `app/robots.ts`) and the sitemap.

`app/robots.ts` needs no change: it allows everything and points at `/sitemap.xml`, and `/dev/ui` is excluded structurally because it is not in `navGroups`.

- [ ] **Step 1: Rewrite the file**

Replace the whole of `app/sitemap.ts` with:

```ts
import type { MetadataRoute } from "next";
import { NAV_GROUPS, isLive } from "@/lib/nav";

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

  return Array.from(new Set(routes)).map((href) => ({
    url: `${BASE_URL}${href === "/" ? "" : href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));
}
```

- [ ] **Step 2: Verify the entries**

Run:
```bash
npm run build && node -e "
const fs=require('node:fs');
const xml=fs.readFileSync('.next/server/app/sitemap.xml.body','utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('count', urls.length);
for (const bad of ['/path','/practice','/glossary','/educators','/dev/ui']) {
  console.log(bad, urls.some(u=>u.endsWith(bad)));
}
console.log('library', urls.some(u=>u.endsWith('/library')));
"
```
Expected:
```
count 33
/path false
/practice false
/glossary false
/educators false
/dev/ui false
library true
```

If the built sitemap body is at a different path in this Next version, read it from the running dev server instead: `curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"` → `33`.

- [ ] **Step 3: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/sitemap.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(seo): derive the sitemap from navGroups and skip pending routes"
```

---

### Task 12: Exit verification

**Parallel group:** E

**Files:**
- Create: `screenshots/nav-desktop-dropdown-1280.png`, `screenshots/nav-mobile-drawer-375.png`, `screenshots/library-1280.png`
- Modify: none

**Interfaces:**
- Consumes: everything from Tasks 1–11.
- Produces: the Phase 2 exit evidence required by spec §14 row 2 — "Every route ≤ 2 clicks from home; `verify:links` passes; drawer and dropdown screenshots".

- [ ] **Step 1: Run the static suite**

Run: `npm run verify:all`
Expected: exit 0, in order:
```
Contrast audit passed: …
Link audit passed: 34 routes, … public assets, … intentional placeholders, 5 links pending a later phase.
Claims audit passed: …
(eslint: no output)
(tsc: no output)
```

- [ ] **Step 2: Run the tests**

Run: `npm test`
Expected: exit 0. `node --test` reports the four existing math suites passing, then Vitest reports the Phase 0/1 suites plus the five new ones:
```
✓ lib/nav.test.ts (18)
✓ components/site/nav-desktop.test.tsx (6)
✓ components/site/mobile-drawer.test.tsx (5)
✓ components/site/search-palette.test.tsx (5)
✓ components/site/library-browser.test.tsx (7)
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0, 34 routes, no `useSearchParams`/Suspense warning, no `lucide-react` warning from `components/site/*`.

- [ ] **Step 4: Confirm the header never pulls in `tracks.json`**

Run: `grep -rn "tracks.json" components/site/`
Expected: no output. `track-names.json` is the only tracks import in the shell:

Run: `grep -rln "track-names.json" components/site/ lib/nav.ts`
Expected: `components/site/header-cta.tsx` and `lib/nav.ts`.

- [ ] **Step 5: Prove every route is ≤ 2 clicks from home (manual)**

Start `npm run dev` and, from `http://localhost:3000`, walk this table. Every row must complete in at most two clicks.

| Destination | Clicks | Route |
|---|---|---|
| Any of the 5 stage pages, `/path`, `/plan` | 2 | Path ▾ → item |
| Any of the 14 Learn pages | 2 | Learn ▾ → item |
| Any of the 9 Work pages | 2 | Work ▾ → item |
| `/reality` | 1 | Reality Check (direct link) |
| `/library` | 2 | any dropdown → "Browse everything in the library" |
| `/library` | 1 | footer → More → Library |
| `/privacy` | 1 | footer → More → Privacy |
| `/start` | 1 | header CTA "Find your path" |
| Any route by name | 2 | search button → type → Enter |

Record any row that needs three clicks; there should be none.

- [ ] **Step 6: Keyboard-only pass (manual, spec §10 and §13)**

With the mouse untouched, from `/`:
1. `Tab` → the skip link appears first; `Enter` moves focus into `<main>`.
2. `Tab` back to the header; `Tab` to "Learn"; `Enter` opens the panel; `ArrowDown` walks the rows; `ArrowUp` walks back; `Esc` closes and focus lands back on "Learn".
3. `Tab` to the search button; `Enter` opens the palette; type `salary`; `ArrowDown`, `Enter` navigates; focus returns to the trigger after the dialog closes.
4. `Ctrl+K` from anywhere opens the palette; `Esc` closes it.
5. At 375px, `Tab` to the menu button; `Enter` opens the drawer; `Tab` reaches the CTA first, then each accordion header; `Esc` closes and focus returns to the menu button.

Every focused element must show the 2px `primary` focus ring at 2px offset.

- [ ] **Step 7: Take the three screenshots**

With the dev server running, use the chrome-devtools tools:

1. `navigate_page` → `http://localhost:3000`; `resize_page` → 1280×900; `click` the "Learn" trigger; `take_screenshot` → save as `screenshots/nav-desktop-dropdown-1280.png`.
2. `resize_page` → 375×812; `click` the menu button; `take_screenshot` → save as `screenshots/nav-mobile-drawer-375.png`.
3. `resize_page` → 1280×900; `navigate_page` → `http://localhost:3000/library`; `take_screenshot` (full page) → save as `screenshots/library-1280.png`.

Check each one before moving on: the header pill is opaque white with a hairline border and no blur; the open dropdown shows two columns of label + description plus the library row; the drawer shows the CTA above the accordions with Library and Privacy at the bottom; `/library` shows both chip rows, the count line, and a three-column card grid.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/nav-desktop-dropdown-1280.png screenshots/nav-mobile-drawer-375.png screenshots/library-1280.png
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(nav): phase 2 exit screenshots"
```

---

## Status

| # | Task | Group | Done |
|---|---|---|---|
| 1 | The IA in data, and `lib/nav.ts` | A | [ ] |
| 2 | The link audit learns the `pending` convention | B | [ ] |
| 3 | Move the leaf shell components into `components/site/` | B | [ ] |
| 4 | `NavDesktop` | C | [ ] |
| 5 | `MobileDrawer` | C | [ ] |
| 6 | `SearchPalette` on `Dialog` | C | [ ] |
| 7 | `SiteFooter` | C | [ ] |
| 8 | Header shell, barrel, `app/layout.tsx` | D | [ ] |
| 9 | `LibraryBrowser` | C | [ ] |
| 10 | The `/library` route | D | [ ] |
| 11 | Sitemap from the nav | D | [ ] |
| 12 | Exit verification | E | [ ] |

**Execution waves.** A → B → C → D → E. Tasks sharing a letter touch disjoint files and can run in parallel. Task 9 sits in group C because it touches only `components/site/library-browser*`; Task 10 consumes it and therefore waits for group D.

**Phase 2 exit criteria (spec §14 row 2):**
- [ ] Every route is ≤ 2 clicks from home (Task 12 Step 5 table, no three-click rows)
- [ ] `npm run verify:all` green, with `verify:links` inside it
- [ ] `npm test` green, including the five new suites
- [ ] `npm run build` green at 34 routes
- [ ] Dropdown, drawer, and library screenshots committed

**Handed to later phases:**
- Phase 4 uses `getBreadcrumb()` and `findNavNeighbours()` to fill `PageHero breadcrumb` and `PageFooterNav` on the homepage and the stage template (spec §8.2, §8.3).
- Phase 5 uses them on the 13 guides, 4 data pages, and 17 workshops.
- Phase 6 ships `/practice` and `/glossary`, then deletes their `"pending": true` keys in `data/site.json` and `data/library.json` — no code change; the nav, drawer, footer, search index, and sitemap pick them up automatically.
- Phase 7 does the same for `/educators`.
- Phase 8 moves the footer's `HONESTY` and `COPYRIGHT` constants into `data/site.json` if the copy pass changes them.

---

## Self-review

**1. Spec coverage.**

| Spec | Where |
|---|---|
| §6.1 header: Path · Learn · Work · Reality Check + search + CTA | Task 1 (`nav`), Task 4, Task 8 |
| §6.1 floating white bar, `line` border, `radius-pill`, 72px, sticky, no transparency | Task 8 Step 2 |
| §6.1 chosen-path CTA becomes the `verified`-tinted track pill | Task 8 Step 1 (`HeaderCta`) |
| §6.1 active route = `primary` text + 2px underline | Task 4 (`ActiveUnderline`) |
| §6.1 Path dropdown = 5 stages + `/path` + `/plan` (7) | Task 1 `nav[0]` |
| §6.1 Learn dropdown = two columns (9 + 5) + Practice/Glossary footer links (14 + 2) | Task 1 `nav[1]` |
| §6.1 Work dropdown = two columns (4 + 5) | Task 1 `nav[2]` |
| §6.1 every dropdown ends with "Browse everything in the library →" | Task 4 Step 3 |
| §6.1 label + 6–10-word description from `site.json` | Task 1 Steps 1 and 3 (test enforces) |
| §6.1 keyboard: arrows move, Esc closes, focus returns to the trigger | Task 4 (`onTriggerKeyDown`, `onPanelKeyDown`, tests) |
| §6.2 drawer: CTA on top, four accordion groups, Reality Check direct, Library and Privacy at the bottom, one column, 48px rows | Task 5 |
| §6.3 `/library` cards with title, description, type badge, stage badge; group and type chips; a search box on the same index | Tasks 9 and 10 |
| §6.4 `Breadcrumb` Home › Group › Page | Task 1 `getBreadcrumb`, used by Task 10 and Phases 4–5 |
| §6.4 `PageFooterNav` prev/next within group + back to your path | Task 1 `findNavNeighbours` (`up` per bucket) |
| §6.4 light `band` footer, four columns, mission line, honesty sentence, copyright | Task 7 |
| §6.5 `primaryNav` → `nav`; `navGroups` kept and regrouped | Task 1 Step 3 |
| §5.4 `components/site/` holds header, footer, search, logo, back-to-top, sw-register, json-ld; header keeps the slim `track-names.json` import | Tasks 3, 8; Task 12 Step 4 verifies |
| §8.3 `PageFooterNav` available to the archetypes | Task 1 (helper); consumed in Phases 4–5 |
| §10 skip link first, focus ring, keyboard-complete dropdown and drawer, 48px header controls | Task 8 Step 4 (skip link untouched), Task 12 Step 6; 48px on search button, drawer trigger, and CTA pill |
| §11 nav copy rules | Task 1 Step 1 (word-count and banned-word tests) |
| §12 `data/site.json` nav structure; `data/library.json` 33 entries | Task 1 |
| §13 Vitest + RTL for the nav surfaces; static checks | Tasks 4, 5, 6, 9; Tasks 2 and 12 |
| §14 row 2 exit criteria | Task 12 |

Gaps, deliberately deferred: `stats` trimming (§12) belongs to Phase 4's homepage work, not here; `ReaderControls` in the drawer (§7.4.7) is Phase 6; the `/library` `CardMedia` stage images (§7.3) wait on Phase 3's `visuals.json`, which Task 10 Step 2 handles explicitly.

**2. Placeholder scan.** No "TBD", "TODO", "implement later", "add appropriate error handling", or "similar to Task N" appears. Every code step carries the full file or an exact before/after edit. The three conditional steps — Task 8 Step 3 (barrel line ordering), Task 10 Step 2 (`library-hero` availability), Task 5/6's `Dialog` `placement` note — each show both concrete outcomes rather than deferring a decision. Task 3 uses `git mv` instead of pasting file bodies because Phase 0 rewrote `components/logo.tsx` and this plan must not clobber it; that is a move instruction, not a placeholder.

**3. Type consistency.** `lib/nav.ts` is the only module that reads `data/site.json`'s nav or `data/library.json`, and every consumer imports from it:
- `isLive` is used identically in Tasks 4, 5, 7, 9, and 11; `isMenu` in Tasks 4 and 5.
- `NAV_CTA` is `NavLink` and is read as `{label, href}` in `HeaderCta` (Task 8) and `MobileDrawer` (Task 5).
- `NavNeighbours.prev|next|up` are `NavLink`, which is structurally assignable to `PageFooterNav`'s `{label, href}` because `desc` and `pending` are optional.
- `Crumb` is `{label, href?}`, exactly `Breadcrumb`'s `items` element type; `app/library/page.tsx` passes that literal shape.
- `LibraryGroup` and `LibraryType` are the same unions behind `GROUP_LABELS`, `TYPE_LABELS`, `TYPE_TONE`, `LIBRARY_GROUPS`, `LIBRARY_TYPES`, and the `asGroup`/`asType` guards.
- `SearchItem.group` is a display string in both branches of `SEARCH_INDEX` (`GROUP_LABELS[...]` for library rows, `group.title` for nav rows), so the palette's group column never renders a raw slug.
- No Phase 1 primitive is passed a `className`; layout classes always sit on a wrapping `div`/`span`. The only props used on Phase 1 components are the ones named in the pinned contract, except `Dialog`'s `placement` values `"right"` and `"top"`, which Tasks 5 and 6 call out.
