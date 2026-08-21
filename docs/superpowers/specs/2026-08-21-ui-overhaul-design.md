# UI/UX Overhaul: Hire From PH

**Date:** 2026-08-21
**Status:** Design, awaiting approval
**Scope:** Full visual and structural redesign of the site shell, design system, navigation, homepage, stage template, and every interior page. All learning content, routes (plus one new index route), data files, and interactive-tool behaviour are preserved. Copy changes are limited to the shell (see §11).

---

## 1. Why

The site has 32 routes of genuinely good content wrapped in a shell that works against it:

- **It reads as AI-generated.** Blurred colour blobs behind heroes, a "Sparkles" icon on eleven pages, every card lifting on hover (59 instances), a marquee with ✦ separators, a squiggle-underline SVG under the hero headline, kicker-dot mono labels everywhere, and a 70-word hero paragraph that repeats "forever" twice.
- **It is overwhelming.** The homepage stacks 22 niche cards, 5 stage cards, 7 method cards, and 22 toolkit cards before the closing CTA (~20 desktop screens). The header has 5 links plus an "Explore" menu exposing 31 links at once.
- **Styling is duplicated, not shared.** `components/ui.tsx` has 7 primitives; 14 files re-declare the same accent maps; 128 inline copies of the card pattern; 30 inputs styled ad hoc; 218 uses of `rounded-2xl` while a global `* { border-radius: 6px !important }` hack overrides all of them.
- **It is visual-poor.** The build guide forbids images; the one "hero visual" is an abstract SVG bar chart. The product is a learning platform and should teach with visuals, not only prose.

### Goals

1. A calm, vibrant, light education aesthetic: **Inter** (text) + **Cabinet Grotesk** (display), type scale adapted from [learnora.framer.website](https://learnora.framer.website/).
2. One shared component library that every page is built from, with a script that fails the build when pages bypass it.
3. Navigation a first-time visitor understands in five seconds: four top-level items, two clicks to any page.
4. A first-party visual layer: photoreal generated imagery (via the `gpt-image-bridge` → `codex` → gpt-image-2 pipeline) and branded diagrams (via the `diagram-design` plugin, installed 2026-08-21).
5. Remove the AI-slop tells in both visuals and shell copy.

### Success criteria

| Measure | Today | Target |
|---|---|---|
| Homepage length, 1280px | ~20 screens | ≤ 8 screens |
| Top-level nav items | 5 + 31-link menu | 4 + search + 1 CTA |
| Clicks from home to any route | up to 3 (menu → group → link) | ≤ 2 |
| Inline accent maps outside `lib/accent.ts` | 14 | 0 (enforced) |
| Raw card/border patterns in `app/` | 128 | 0 (enforced) |
| Icon libraries | 2 (lucide + Phosphor) | 1 (Phosphor) |
| First-party images / diagrams | 0 / 0 | ≥ 10 / ≥ 8 |
| WCAG AA contrast (`verify:contrast`) | pass | pass |
| Lighthouse a11y / perf (home, mobile) | unmeasured | ≥ 95 / ≥ 90 |

---

## 2. Decisions taken

The brief was given asynchronously, so these calls were made with stated defaults. Each is reversible at review; §16 lists the ones most worth a second look.

| Question | Decision |
|---|---|
| Fonts | Inter (body, UI) via `next/font/google`; Cabinet Grotesk 500/700/800 self-hosted via `next/font/local` (woff2 from Fontshare, ITF Free Font License). Space Grotesk, Inter Tight, Space Mono removed. |
| Primary hue | Blue-violet `#4B4EF6`: continuous with the current indigo brand and the reference, 5.65:1 on white. |
| Palette | White paper with lavender section bands; navy ink; four vibrant semantic accents (violet, amber, mint, sky) plus coral for red-flag content. Stage accent ids in JSON (`signal/caution/verified/info`) are **kept**; only the hex behind them changes. |
| Corner radius | Remove the global `!important` hack. Tokens: 8 / 12 / 20px and pill. |
| Reference site usage | Borrow Learnora's type scale, whitespace, band rhythm, pill buttons, kicker pills, FAQ and CTA patterns. Do **not** borrow its ratings badge, learner counts, testimonials, or pricing cards (honesty doctrine). |
| Navigation | Header: **Path · Learn · Work · Reality Check** + search + "Find your path" CTA. Dropdowns replace the 31-link mega-menu. New `/library` route is the single "everything" index with filters. |
| Homepage | Eight sections (§8.1). The 22-niche grid, 22-card toolkit, 7-method grid, stat row, marquee, and dark language panel leave the homepage. |
| Imagery | Photoreal, Filipino subjects in real Philippine home/café/co-working settings, generated with gpt-image-2, stored in `public/images/`, always captioned as illustrative. |
| Diagrams | `diagram-design` plugin with a saved `hirefromph` profile and a repo-root `.diagram-design` marker; diagrams ship as React SVG components that read the site's CSS tokens. |
| Icons | Phosphor only (the `Icon` component already maps JSON names to Phosphor). `lucide-react` removed. |
| Motion | None on scroll. `Reveal` (already a no-op) is deleted. `motion` stays for state changes inside interactive tools. |
| Tests | Add Vitest + Testing Library for interactive primitives (Tabs, Accordion, Dialog, Field, Button-as-link) and `lib/accent.ts`. Presentational work is verified by screenshots and the verify scripts. |
| Copy | Shell copy only: home, nav labels/descriptions, stage page chrome, CTAs, FAQ, empty states. The 30 content JSON files are out of scope except for a slop-pattern sweep (§11). |
| Logo | **Redesigned** (requested 2026-08-21). New mark + wordmark in Cabinet Grotesk, authored as SVG via the `logo-conceptualization` and `brand-identity` skills; concepts explored with gpt-image-2, final mark hand-drawn as vector. Must work at 16px favicon, in the header at 28–32px, on the navy CTA band, and in print (educator kit). No flag heraldry, no eight-ray sun (standing decision from the 2026-08-10 rebrand). Ships in Phase 0 so every later screenshot carries it. |
| Dark mode | Still light-only. |
| Practice layer (added 2026-08-21, approved) | Retrieval checks and flashcard decks, branching scenarios, annotated worked examples, export-your-own-work, weekly reflection and plan streaks, glossary and timezone/study utilities, reader accessibility toggles. Audio, video, and sandboxes are explicitly deferred (§7.4). |

### Explicit non-goals

- No new lessons, workshops, or data; no changes to tool logic (`lib/*-math.ts`, `path-context`, storage).
- No route removals. Additions: `/library`, `/practice`, `/glossary`, `/educators` (+ its print-only `kit/*` routes). A dev-only `/dev/ui` gallery, excluded from sitemap, robots, and production builds.
- No audio (read-aloud, speech drills), no video (Remotion/Manim explainers), no code/formula sandboxes or typing tests in this project. They are a documented second wave.
- No rewrite of content JSON voice (follow-up project).
- No backend, auth, or analytics changes.
- No employer-facing pages.

---

## 3. Approaches considered

**A. Restyle in place.** Swap fonts and tokens in `globals.css`, touch up `ui.tsx`, leave page structure alone. Fastest (days), but leaves the duplicated styling, the 31-link menu, the 20-screen homepage, and the slop patterns. Fails goals 2, 3, and 5.

**B. New design system, then page-by-page migration. (Recommended.)** Build tokens first so the whole site re-themes on day one, then build `components/ui` + layout + navigation, rebuild home and the stage template, then migrate the 26 interior pages and 17 interactive tools in batches against an enforcement script. The site is shippable after every phase; content never moves; each batch is a reviewable PR.

**C. Greenfield `app/` rewrite.** Cleanest end state but doubles the surface area during the rewrite, risks drift between 30 data files and 17 stateful components, and delays any visible improvement until the end. The content is the asset; rebuilding around it is safer than rebuilding it.

B is recommended: it front-loads the visible change (tokens), back-loads the risk (tool migration), and every intermediate state is deployable.

---

## 4. Design system

Tokens live in `app/globals.css` under `:root` and are exposed to Tailwind v4 through `@theme inline`, as today.

### 4.1 Typography

| Role | Family / weight | Size (fluid) | Line height | Tracking |
|---|---|---|---|---|
| `hero` | Cabinet Grotesk 800 | `clamp(2.75rem, 1.6rem + 4.2vw, 4.875rem)` (44→78px) | 1.1 | -0.01em |
| `display` | Cabinet Grotesk 800 | `clamp(2.25rem, 1.4rem + 3vw, 3.75rem)` (36→60px) | 1.1 | -0.01em |
| `h2` | Cabinet Grotesk 700 | `clamp(1.875rem, 1.3rem + 1.9vw, 2.5rem)` (30→40px) | 1.15 | -0.01em |
| `h3` | Cabinet Grotesk 700 | `clamp(1.5rem, 1.2rem + 1vw, 2rem)` (24→32px) | 1.2 | 0 |
| `h4` | Cabinet Grotesk 700 | 1.5rem (24px) | 1.3 | 0 |
| `h5` | Cabinet Grotesk 700 | 1.25rem (20px) | 1.4 | 0 |
| `lead` | Inter 400 | `clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)` (18→20px) | 1.6 | 0 |
| `body` (prose) | Inter 400 | 1.125rem (18px) | 1.6 | 0 |
| `base` (UI, cards) | Inter 400/500 | 1rem (16px) | 1.5 | 0 |
| `small` | Inter 400/500 | 0.9375rem (15px) | 1.5 | 0 |
| `caption` | Inter 400 | 0.8125rem (13px) | 1.4 | 0 |
| `kicker` | Inter 600 | 0.8125rem (13px) | 1 | +0.06em, uppercase |
| `button` | Cabinet Grotesk 700 | 1rem md / 1.125rem lg | 1 | 0 |
| `nav` | Inter 500 | 1rem | 1 | 0 |

Sizes are the measured Learnora desktop values (78/60/40/32/24/20/18/16/15) made fluid so mobile falls to Learnora's own small-screen ramp. Headline accent colouring (second line in primary) is allowed on `hero` and `display` only, via a `<Heading accent="…">` prop, never by ad-hoc spans.

Loading: Inter variable (one file) and Cabinet Grotesk 500/700/800 (three woff2) with `display: swap`, `preload` on the two display weights used above the fold. Fallback stacks carry `size-adjust` to keep CLS under 0.05.

### 4.2 Colour

All pairs below were checked against WCAG 2.x; ratios are listed.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `paper` | `#FFFFFF` | page background | — |
| `band` | `#F7F6FF` | alternating section background | — |
| `tint` | `#EEEDFF` | soft surfaces, primary tint | — |
| `ink` | `#0E1230` | headings, body, navy band background | 18.3:1 on paper |
| `ink-soft` | `#4A4F66` | secondary text | 8.1:1 |
| `ink-faint` | `#6B7087` | captions, metadata | 4.9:1 paper · 4.5:1 band |
| `line` | `#E4E4EA` | hairlines, card borders | decorative |
| `line-strong` | `#CFCFD8` | dividers on band | decorative |
| `control` | `#858A9E` | input/checkbox borders | 3.43:1 paper · 3.20:1 band (UI minimum) |
| `primary` | `#4B4EF6` | buttons, links, focus ring, focal accents | 5.65:1 on paper · white text 5.65:1 |
| `primary-deep` | `#3634D8` | hover, text on tint | 8.0:1 · 6.9:1 on tint |
| `primary-tint` | `#EEEDFF` | = `tint` | — |
| `verified` / `-text` / `-tint` | `#12B76A` / `#067647` / `#E6F7EE` | sourced, done, stage 3 | text-on-tint 5.1:1 |
| `caution` / `-text` / `-tint` | `#F5A623` / `#9A5B00` / `#FFF4DB` | warnings, stage 2 | text-on-tint 5.0:1 |
| `info` / `-text` / `-tint` | `#0BA5EC` / `#026AA2` / `#E0F2FE` | notes, stage 4 | text-on-tint 5.1:1 |
| `coral` / `-text` / `-tint` | `#FF5A5F` / `#B42318` / `#FFECEB` | red flags, scams, errors | text-on-tint 5.8:1 |
| `on-navy` | `#F7F6FF` | text on `ink` band | 16.9:1 |

**Shipped naming (Phase 0):** the bare semantic token (`--verified`, `--caution`, `--info`, `--coral`) carries the *text/deep* value listed in the `-text` column so legacy `text-verified` usages stay AA; the vibrant value is `--verified-fill` etc. `control` shipped as `#858A9E` to clear 3:1 on both paper and band.

Rules:
- **Fills carry ink text.** White text sits only on `primary`, `primary-deep`, and `ink`. Amber, mint, sky, and coral fills (3.0:1 or worse with white) take `ink` text or are used as icon chips only.
- **One primary per view.** Stage accents appear on stage chrome (number chip, stepper node, hero kicker), not on every card.
- Stage mapping: `signal→primary`, `caution→caution`, `verified→verified`, `info→info` in `lib/accent.ts`; stage JSON ids do not change.

### 4.3 Shape, surface, depth

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8px | images, inputs, chips |
| `radius-md` | 12px | cards, dropdowns |
| `radius-lg` | 20px | hero media, CTA band, large panels |
| `radius-pill` | 999px | buttons, kickers, badges, nav items |
| `shadow-sm` | `0 1px 2px rgb(14 18 48 / .06)` | dropdowns, dialog only |
| `shadow-md` | `0 8px 24px rgb(14 18 48 / .08)` | dialog only |

Cards are **bordered, not shadowed** (`1px line` on paper; `1px line-strong` on band). Interactive cards change border to `ink` and background to `band` on hover; no translate, no lift. The global `border-radius !important` rule and the `.is-circle` escape hatch are deleted.

### 4.4 Layout and rhythm

- Container: 1280px content max (`Container`), 1440px for full-bleed bands (`Container size="wide"`), 720px for prose (`Container size="narrow"`). Gutter `clamp(1.25rem, 4vw, 2.5rem)`.
- Section padding: 64px mobile → 96px desktop (`Section`), 128px for the homepage hero and CTA.
- Bands alternate `paper` / `band`; never two bands in a row; one `ink` band per page maximum (the CTA).
- Grids: 2 / 3 / 4 columns with 24px gap; cards have 24px padding (32px in `lg`).
- Hero media column: 4:5 on desktop, 3:2 stacked on mobile.

### 4.5 Motion

- No scroll-triggered reveals, marquees, or parallax.
- Hover and focus transitions: 150ms `ease-out` on colour/border only.
- State-change motion inside tools (wizard step change, tracker row save, accordion open) uses `motion` with `prefers-reduced-motion` respected via the existing `MotionProvider`.
- Diagrams are static by default (the plugin's own policy); a `reveal` sequence is permitted on at most one diagram per page and only when order is the point.

### 4.6 Iconography

Phosphor, `regular` weight at 20px for UI, `duotone` at 24–28px for feature rows, always in `ink` or the section's single accent. `Icon` moves to `components/ui/icon.tsx`; `lucide-react` is removed from `package.json`.

---

## 5. Component architecture

### 5.1 Directory layout

```
components/
  ui/            primitives, one per file, re-exported from index.ts
  layout/        page structure: Container, Section, SectionHeading, PageHero, …
  site/          header, footer, search, logo, back-to-top, sw-register, json-ld
  journey/       stepper, path-chooser, path-gate, stage-page
  diagrams/      one file per static diagram + chart primitives
  workshops/     the 17 interactive tools (moved, not rewritten)
lib/
  accent.ts      the single accent map
  visuals.ts     typed access to data/visuals.json
```

### 5.2 Primitives (`components/ui/`)

| Component | Props (essentials) | Notes |
|---|---|---|
| `Button` | `href?`, `variant: primary\|secondary\|outline\|ghost\|link`, `size: sm\|md\|lg`, `icon?`, `iconEnd?`, `external?` | Renders `<Link>`, `<a>`, or `<button>` from `href`/`external`. Pill shape. Replaces `ButtonLink` and 37 raw buttons. |
| `Card` | `padding`, `interactive?`, `as?`, `href?` | + `CardMedia`, `CardBody`, `CardFooter`. Replaces 128 inline patterns. |
| `Badge` | `tone`, `variant: soft\|outline` | Replaces `Pill`. |
| `Kicker` | `tone?` | Outlined pill, uppercase, Learnora style. No dot. |
| `Heading` / `Text` | `level`, `size`, `accent?` (second-line colour), `balance?` | Only way to reach the type scale from pages. |
| `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `ChoiceCard`, `Range`, `Switch` | label/hint/error wiring via `Field` | Used by all 17 workshops. |
| `Tabs` | roving tabindex, `aria-selected` | 3 existing ad-hoc tablists. |
| `Accordion` | `<details>`-based, single or multi | FAQ, long-page sections. |
| `Stat`, `StatStrip` | value, label, sub, `source?` | Quiet, inline; no cute labels. |
| `Callout` | `tone`, `title?`, `icon?` | Notes, cautions, honesty notes. |
| `Source`, `SourceList` | `label`, `url`, `date?`, `grade?: primary\|vendor` | The honesty component, promoted from page-local copies in `/reality` and `/conduct`. |
| `StepList` / `Step` | numbered | "Do these first", method steps. |
| `ProgressBar` | value, label | journey, plan, tracker. |
| `Figure` | `id` (from visuals manifest) or `src/alt/width/height`, `caption?`, `priority?`, `ratio?` | Wraps `next/image`; always renders the illustrative caption when the asset is generated. |
| `DiagramFrame` | `title`, `caption?`, `children` | Horizontal scroll on small screens, `role="img"` + `aria-describedby`. |
| `Dialog` | portal, focus trap, Esc, return focus | Extracted from `SearchPalette`. |
| `EmptyState` | icon, title, body, action | Tracker/plan/path empty states. |
| `Icon` | `name`, `weight`, `size` | Moved; Phosphor only. |

### 5.2b Practice components (`components/practice/`)

Compound components built from the primitives above; all client components; all persist through `lib/storage.ts` under a `practice.*` namespace.

| Component | Props (essentials) | Notes |
|---|---|---|
| `Quiz` | `id` (route key), questions from `data/practice.json` | 3 items per guide; multiple choice or reveal-answer; records attempts, last score, next-review date (Leitner). Rendered before `PageFooterNav`. |
| `Deck` | `deckId` | Flashcards with flip, "got it / not yet", five-box Leitner schedule; due count exposed through `usePracticeDue()`. |
| `Scenario` | `scenarioId` | Branching nodes; choice → consequence → next; ends with a debrief listing the path taken and the rule each choice tested. No score. |
| `Annotated` | `exampleId` | A realistic artifact (resume, SOP, status message, invoice) with numbered hotspots; click or focus reveals *why this exists* and *the rule it follows*. Keyboard: hotspots are buttons in reading order. |
| `BeforeAfter` | `pairId` | Two versions of a message with a draggable divider on desktop and stacked tabs on mobile; changed phrases highlighted. |
| `ExportButton` | `title`, `markdown` or `ics`, `filename` | Client-side Blob download. Only ever receives text the user wrote or settings they chose. |
| `Journal` | weekly prompt from `data/reflection.json` | One entry per ISO week in localStorage; shown on `/path`. |
| `Streak` | reads plan-day state | Consecutive plan days completed; shown on `/plan` and `/path`. No badges, no points. |
| `Term` | `id` | Inline glossary term: dotted underline, hover/focus card with definition and optional Taglish gloss, `aria-describedby`. |
| `TimezoneOverlap` | `regions` | Slider for the visitor's working window (UTC+8) against client regions; shows overlap hours; notes DST months. |
| `StudyTimer` | `blocks` from the study protocol | Focus/break timer with a visible plan; persists the running block. |
| `Tldr` | `route` | "TL;DR sa Tagalog" block from `data/tldr.json`, collapsed by default. |
| `ReaderControls` | — | Font size (S/M/L), comfortable-reading toggle (wider letter and word spacing, 1.8 leading, left-aligned), low-data mode (`Figure` renders its caption placeholder instead of the image). Persisted; applied as classes on `<html>` before paint to avoid flicker. |

### 5.3 Layout (`components/layout/`)

`Container`, `Section` (`band: none|tint|navy`, `spacing`), `SectionHeading` (kicker, title, lead, `action` slot for the Learnora heading-left/button-right pattern, `align`), `PageHero` (breadcrumb, kicker, title, lead, `actions`, `media: {figureId} | {diagram} | none`, `compact?`), `PageFooterNav` (prev/next/up), `CtaBand`, `FeatureRow` (icon + title + body, 3-up), `CardGrid` (`cols`), `Toc` (on-page nav for long guides, xl+ only), `Breadcrumb`.

### 5.4 Site (`components/site/`)

`SiteHeader` (+ `NavDropdown`, `MobileDrawer`), `SiteFooter`, `SearchPalette` (uses `Dialog`), `Logo`, `BackToTop`, `SWRegister`, `JsonLd`. The header keeps its slim `track-names.json` import so it never bundles `tracks.json`.

### 5.5 Journey (`components/journey/`)

`JourneyStepper` merges `JourneyProgress` and the 11-column roadmap strip from `StagePage` into one component with `variant: compact|full` and a `current` prop. `PathChooser` gains `limit` (featured count) and `moreHref`. `PathGate` and `StagePage` move and are rebuilt on the primitives.

### 5.6 Accent map (`lib/accent.ts`)

```ts
export type Accent = "signal" | "caution" | "verified" | "info" | "coral";
export const ACCENT: Record<Accent, { text: string; fill: string; tint: string; border: string; ring: string }>;
```

Every `accentText` / `accentBar` / `accentSoft` literal in the 14 files is replaced with `ACCENT[a].text` etc.

### 5.7 Enforcement: `scripts/verify-primitives.mjs`

Fails (exit 1, file:line) when it finds, outside `components/ui` and `components/layout`:

- `const accent(Text|Bar|Soft|Border)` literals
- `rounded-(xl|2xl|3xl)` and `blur-(2xl|3xl)` utilities
- the raw card pattern `border border-line bg-paper` in `app/`
- `from "lucide-react"`
- `hover:-translate-y`
- `<input|<select|<textarea` without a `components/ui` import in the same file

Wired into `npm run verify:all` alongside `verify:contrast`, `verify:links`, `verify:claims`.

### 5.8 Dev gallery

`app/(dev)/dev/ui/page.tsx` renders every primitive in every variant and tone on one page. Returns 404 unless `NODE_ENV !== "production"`; excluded from `sitemap.ts` and `robots.ts`. It is the screenshot target for visual review of the component library.

---

## 6. Navigation and information architecture

### 6.1 Header (desktop ≥ 1024px)

```
[PH] Hire From PH     Path ▾   Learn ▾   Work ▾   Reality Check        ⌕   [ Find your path → ]
```

- Floating white bar, `line` border, `radius-pill`, 72px tall, sticky; no transparency tricks.
- When the visitor has chosen a path, the CTA becomes a `verified`-tinted pill showing the track name (existing behaviour, restyled).
- Active route: `primary` text + 2px underline, not a filled pill.

| Dropdown | Contents | Count |
|---|---|---|
| **Path** | Stage 1–5 as a numbered list with one-line roles, then "Your dashboard" (`/path`) and "Build a 30-day plan" (`/plan`) | 7 |
| **Learn** | Two columns: *Build skills* (Method, AI-First, How to Learn, Micro-Tasks, Build Labs, Learn Any Tool, Portfolio Ladder, AI Leverage, Equipment) · *Work like a professional* (Become Indispensable, English at Work, Conduct & Integrity, Career Simulator, Resource Shelf) · footer links: Practice (`/practice`), Glossary (`/glossary`) | 14 + 2 |
| **Work** | Two columns: *Get hired* (Find Work, Interview Prep, Application Tracker, Niches) · *Get paid and stay* (Salary Guide, Client Markets, Own Your Clients, Get Legit, Languages) | 9 |

Every dropdown ends with a footer row: "Browse everything in the library →" (`/library`). Each item shows label + 6–10-word description (from `site.json`). Keyboard: arrows move, Esc closes, focus returns to the trigger.

### 6.2 Mobile (< 1024px)

Full-height drawer: primary CTA on top, then four accordion groups (Path, Learn, Work, Reality Check as a direct link), then Library and Privacy. One column; 48px rows.

### 6.3 `/library`

One page listing all routes as `Card`s: title, one-line description, type badge (Guide · Workshop · Tool · Data), stage badge where applicable. Filter chips by group and type; a search box reusing the palette's index. Data source: a new `data/library.json` (label, href, group, type, stage?, desc). This replaces the mega-menu's "surface everything" job without putting everything in the header.

### 6.4 Wayfinding on every page

- `Breadcrumb` in `PageHero`: Home › Group › Page (stage pages: Home › The Path › Stage 2).
- A "Part of Stage N" chip on tool/guide pages whose `stages.json` `doFirst` references them.
- `PageFooterNav` on every page: previous / next within its group, plus "Back to your path".
- Footer: four link columns driven by the same `site.json` groups, a short mission line, the honesty sentence, copyright. Footer is light (`band`), not navy; the navy CTA band sits above it.

### 6.5 `site.json` changes

`primaryNav` becomes `nav: [{label, href?, groups?: [{title, links:[{label, href, desc}]}]}]`. `navGroups` is kept for the footer and search index but regrouped to match. `stats` is trimmed to the four structural facts used in the hero strip.

---

## 7. Visual content layer

### 7.1 Photoreal imagery

**Pipeline.** `scripts/gen-images.mjs` reads `design/images/shotlist.json` (id, prompt, size, ratio) and calls `~/.claude/skills/gpt-image-bridge/bin/gpt-image-2` per entry, writing PNGs to `design/images/raw/`. Runs are 4–6 minutes each and consume ChatGPT quota, so the script is resumable (skips ids that already have output) and is run in the background during Phases 2–4. `scripts/optimize-images.mjs` (sharp) produces AVIF + WebP + JPEG at 1x/2x into `public/images/` and writes `data/visuals.json` (`id, src{avif,webp,jpg}, width, height, alt, caption, generated: true`). `Figure` reads the manifest. Raw PNGs are git-ignored; optimised outputs are committed.

**Art direction (one prompt preamble for all shots).** Photoreal editorial photography, 35mm or 50mm, natural window light, shallow but not creamy depth of field, honest skin and fabric texture, neutral-warm grade, no lens flare, no neon, no screen-glow faces, no stock-photo smiles at camera, no watermarks, no text on screens. Filipino subjects of varied ages and builds in real Philippine settings: apartment corner desks, provincial homes with capiz or jalousie windows, Cebu/Davao co-working spaces, a sari-sari-adjacent street at golden hour. Tidy but lived-in. Subjects are working, not posing.

**Shot list (first wave, 11).**

| id | Where | Frame | Subject |
|---|---|---|---|
| `home-hero` | `/` hero | 4:5 | Woman, late 20s, at a corner desk, reviewing a spreadsheet on a second monitor, headset resting on the desk |
| `home-standard` | `/` standard section | 3:2 | Hands annotating printed notes beside a laptop showing a source document |
| `stage-start` | `/start` | 3:2 | Man, early 20s, setting up a second-hand monitor and testing a headset in a small bedroom office |
| `stage-get-hired` | `/get-hired` | 3:2 | Person on a video interview, neutral wall, notebook open, calm posture |
| `stage-deliver` | `/deliver` | 3:2 | Person updating a tracker on a laptop, sticky notes on the wall, coffee |
| `stage-level-up` | `/level-up` | 3:2 | Person with Japanese flashcards and a laptop showing an automation canvas |
| `stage-own` | `/own` | 3:2 | Person in a co-working space reviewing an invoice on a tablet |
| `cta-band` | `/` CTA background | 21:9 | Provincial street at dusk, warm house lights, used under a navy overlay at 20% |
| `library-hero` | `/library` | 3:1 | Wide, overhead desk with notebook, laptop, phone, printed checklist |
| `og-default` | Open Graph | 1200×630 | Crop of `home-hero` with wordmark |
| `path-dashboard` | `/path` empty state | 3:2 | Blank notebook and pen beside a closed laptop, morning light |

**Honesty rules.** Every generated image carries a visible caption "Illustrative image" via `Figure`. No generated person is ever placed next to a quote, name, role, or number. No generated image of a document that could be mistaken for a real credential, payslip, or contract. `alt` text describes the scene, not a claim ("A woman reviews a spreadsheet at a home desk", never "A successful online professional").

**Build guide amendment.** "No external images" becomes "No hotlinked or third-party images. First-party assets in `public/images/` rendered through `Figure` are allowed; every generated asset is captioned as illustrative."

### 7.2 Diagrams (`diagram-design`)

**Setup.** Onboard the new tokens into the plugin with the folder method (reads `app/globals.css`), save as profile `hirefromph` in `~/.diagram-design/profiles/`, and commit a repo-root `.diagram-design` marker containing `profile: hirefromph`. Typography in the profile maps to Cabinet Grotesk (titles), Inter (labels), and Inter with tabular figures for numeric sublabels; no mono family is introduced.

**Authoring.** Each diagram is authored with the plugin as HTML (the plugin's source of truth, kept in `design/diagrams/`), exported to SVG, then hand-converted to a React component in `components/diagrams/` that replaces hard-coded colours with `var(--ink)`, `var(--primary)`, etc. Static diagrams are server components. Data-driven charts (simulator curves, reality bars, niche radar) are small React SVG components in `components/diagrams/charts/` that follow the plugin's style guide (hairline axes, no shadows, one accent, masked arrow labels) and take the data the pages already compute.

**Diagram rules.** Density 4/10; at most 9 nodes; one or two accent elements; radius ≤ 8px; no shadows; bordered not filled; every diagram wrapped in `DiagramFrame` with a title and a one-sentence caption that states what to look at. A diagram earns its place only when it beats a paragraph or a table; the plugin's own test applies.

**First wave (9).**

| Page | Type | What it shows |
|---|---|---|
| `/` and stage pages | Journey / process | Five stages, eleven steps, current position |
| `/method` | Process (7 nodes) | FIND → DECONSTRUCT → LEARN → VET → ASK → UNSTICK → GIVE, with the "stuck" loop back |
| `/get-hired` | Funnel (no invented numbers) | Applications → replies → interviews → offers, labelled with what each stage needs |
| `/deliver` | Timeline | First week: day 1 to day 5 checkpoints |
| `/apply` | Flowchart | Vetting an opportunity: the five red-flag gates |
| `/clients` | Swimlane | Agency vs direct: who holds the relationship at each step |
| `/learn` | Line | Forgetting curve with and without spaced retrieval (qualitative, cited) |
| `/reality` | Bar | Replace `ChangeBar` / `GrowthBar` with chart primitives; every bar keeps its `Source` |
| `/simulator` | Line (data-driven) | Generalist vs specialist curves, restyled |

Second wave candidates: `/plan` Gantt, `/niches` radar (interactive), `/salary` pricing-model comparison (only if it beats the table), `/legit` registration flow.

### 7.3 Manifest and components

`data/visuals.json` lists images; `components/diagrams/index.ts` lists diagrams by id. `PageHero media` accepts either. The `/library` cards and stage cards show the stage image as `CardMedia`.

### 7.4 Practice layer

The site teaches that retrieval beats re-reading, that judgment is learned by making decisions, and that you own what you build. The practice layer makes every guide *do* those three things. Everything is JSON-driven, frontend-only, and persisted in localStorage under `practice.*`.

**7.4.1 Retrieval practice.**
- `Quiz`: three questions at the end of each of the 13 guide pages and 5 stage pages (54 questions). Formats: multiple choice with a one-line explanation per option, or "think, then reveal". Results feed a Leitner schedule; `/practice` lists what is due.
- `Deck`: four decks in the first wave: *Interview questions* (from `interview.json`), *Red flags* (from `apply.json` / `findwork.json`), *Get Legit terms* (BIR, 8%, OR, 2307, PhilHealth…), *English habits* (from `english.json` banlist). ~80 cards total, each with a `source` where it states a fact.
- `/practice` page: due cards, decks, quiz history, streak; empty state explains the method and links `/learn`.

**7.4.2 Scenarios.** Four branching scenarios, each 8–14 nodes, authored in `data/scenarios.json`:
- *The 11 pm request* (`/conduct`): scope, boundaries, tone.
- *The interview that isn't* (`/apply`): spotting the five red flags as they appear.
- *First week* (`/deliver`): what to ask, what to log, when to escalate.
- *The scope creep* (`/clients`): retainer boundaries and the ASK method.
Each ends with a debrief: the path taken, the principle each fork tested, and a link to the rule in the guide. No right-answer score; some forks are trade-offs.

**7.4.3 Annotated worked examples.** Four artifacts in `data/annotated.json` with 6–10 hotspots each: a resume (Build Labs), an SOP (Build Labs), a status update message (English at Work), a supplier invoice (Get Legit). Each hotspot has `why` and `rule`. The doctrine note renders above every example: "Study it, extract the rules, then close it and write your own." Three `BeforeAfter` pairs for message rewrites, sourced from the existing English at Work material.

**7.4.4 Export your own work.** `ExportButton` on every lab output (resume draft, SOP, oath, first-week plan, rate worksheet), the 30-day plan (`.ics` with one all-day event per plan day and Markdown), and the tracker (CSV). A print stylesheet for guides. The build guide gains the rule: *export is for what the user wrote; never for anything we wrote.*

**7.4.5 Reflection and rhythm.** `Journal` on `/path` with one weekly prompt from `data/reflection.json` (12 prompts, rotating); `Streak` computed from plan-day completion dates; milestone markers on `JourneyStepper` when a stage's steps are all done. No badges, points, or leaderboards.

**7.4.6 Utilities.** `data/glossary.json` (~40 terms, each with definition, optional Taglish gloss, link to the guide that explains it) rendered inline via `Term` and on `/glossary` (A–Z, filter box). `TimezoneOverlap` on `/markets`. `StudyTimer` on `/learn`.

**7.4.7 Reader accessibility.** `ReaderControls` in the footer and the mobile drawer: font size, comfortable-reading toggle, low-data mode. `Tldr` ("TL;DR sa Tagalog", 60–90 words) on the 13 guides and 5 stages from `data/tldr.json`. Drafts are written in this project and **flagged for native-speaker review before publish**; the block carries a "draft translation" note until the flag is cleared.

**Deferred (documented second wave):** read-aloud and speech drills (Web Speech API), Remotion/Manim explainers from the diagram components, formula playground (HyperFormula), typing test, live comms linter.

### 7.5 Educator kit (`/educators`)

Teachers, trainers, community organisers, and senior professionals running workshops should be able to carry the doctrine into a room without us. The kit is the GIVE method applied to the platform itself.

**Doctrine clarification (added to `BUILD_GUIDE.md`).** The no-downloads rule protects learners from dependence on finished *deliverables* (a resume to rename). Material that teaches *the method* (principles, run-sheets, the path map) is teaching material and may be distributed as PDF. The test stays the same: does this make the reader more capable or more dependent? A facilitation guide makes a facilitator more capable.

**Contents (first release).**

| Piece | Format | Source of truth |
|---|---|---|
| *The Hire From PH doctrine*, one-pager | A4 portrait PDF | `doctrine.json`, `site.json.standard` |
| *The path*, map of five stages and eleven steps | A4 landscape PDF | `stages.json`, `roadmap.json`, the journey diagram |
| *Seven methods*, cheat-sheet with the drill for each | A4 portrait PDF, 2 pages | `doctrine.json.methods` |
| *Three workshop run-sheets*: DECONSTRUCT a resume (90 min) · VET an opportunity (60 min) · ASK well (45 min) | A4 portrait PDF, one per session | new `data/educators.json`: objectives, room setup, timed steps, discussion prompts, which site tools to open live, common facilitator mistakes |
| *Slides*: 16 slides covering doctrine, path, methods, honesty rule | 16:9 landscape PDF | same data; one slide per method/stage |
| *How to use and cite this* | included in every PDF's last page | `data/educators.json.license` |

All numbers in the kit carry their `Source`; the kit prefers principles to statistics for that reason.

**Build.** The kit pages are ordinary routes under `app/educators/kit/*` rendered from the same JSON as the site, with a print stylesheet (`@page` size and margins, no header/footer chrome, fonts embedded). `scripts/build-kit-pdf.mjs` starts the dev server, renders each kit route with Playwright's Chromium (`page.pdf`, `printBackground`), and writes `public/kit/*.pdf`. PDFs are regenerated and committed whenever the underlying JSON changes (a `verify:kit` check compares a content hash stored in the PDF metadata against the JSON). Visitors can also print any kit page themselves.

**Landing page `/educators`.** Who it is for, what each piece is (with thumbnails), download buttons, a "run a session" quick start, the licence, and the honesty note (no learner counts; we do not know how many rooms this reaches). Linked from the footer ("For educators"), `/library`, and the GIVE section of `/method`.

**Licence.** Default CC BY 4.0 so the material spreads with attribution; the site's own non-commercial stance is unaffected because the licence applies to the kit, not to the brand. See §16 Q11.

**Deferred:** editable PPTX/Google Slides export, translated editions, a facilitator feedback channel (needs a server).

---

## 8. Page blueprints

### 8.1 Homepage (8 sections)

1. **Hero.** Split layout: left kicker pill ("Free and open · for Filipinos building online careers"), `hero` headline ≤ 8 words with one accented line, lead ≤ 25 words, `Button primary` "Find your path" → `/start`, `Button outline` "How it works" → `#how`. Below: a one-line `StatStrip` (5 stages · 11 steps · 22 niches · 40 micro-tasks) and the honesty sentence as `caption` text with a link to `/reality`. Right: `Figure home-hero` at 4:5, `radius-lg`.
2. **How it works** (`#how`). `SectionHeading` + `FeatureRow` ×3: Pick a path · Follow five stages · Build every deliverable yourself. No cards; icon, title, one sentence each.
3. **The path.** Band. `SectionHeading` with action "Open your dashboard". `JourneyStepper variant="full"` (the journey diagram) and five compact stage `Card`s (number, title, role, one line, link). Progress appears when `hasPath`.
4. **Pick your lane.** `SectionHeading` + `PathChooser limit={6}` (by demand) + "See all 22 niches →" (`/niches`).
5. **What you'll build.** Band. Six `Card`s with `CardMedia` (stage images or duotone icons): Build Labs, Micro-Tasks, Find Work, Career Simulator, 30-Day Plan, Reality Check. Action: "Browse the library".
6. **The standard.** Two columns: `Figure home-standard` left; right: kicker, `h2`, three `Step`s (Method over material · You build it, you own it · Every number has a source), link to `/method`.
7. **Questions.** `SectionHeading` left, `Accordion` right with six items from new `data/faq.json`: Is it really free? · Is this a "VA course"? · Do I need a degree or experience? · Is AI taking these jobs? · How long until a first client? (honest: no credible data, link `/reality`) · Who runs this?
8. **CTA band.** Navy, `Figure cta-band` at 20% under it, `display` line "Start with Stage 1." and one button. Footer follows.

Removed from home: 22-niche grid, 22-card toolkit, 7-method grid, language panel, marquee, hero SVG chart, blur blobs, squiggle underline, stat-card row.

### 8.2 Stage page template (`StagePage`)

Hero (breadcrumb, kicker "Stage 2 of 5 · Steps 3–5", `display` title, lead, primary CTA to `doFirst[0]`, secondary "Next: …", `Figure stage-*`) → `JourneyStepper current={num}` → "Do these first" as `StepList` of `Card`s → stage diagram in `DiagramFrame` → "Tools for this stage" as 4 `Card`s with one-line descriptions (not chips) → closing quote in a `tint` panel → `PageFooterNav` prev/next + "Build a 30-day plan around this".

### 8.3 Interior archetypes

- **Guide** (method, learn, reality, conduct, english, indispensable, ai-first, legit, salary, markets, languages, resources, portfolio): `PageHero` (optionally with diagram), `Toc` at xl for pages over ~6 sections, prose in `Container narrow`, `Callout`s for honesty notes, `Source` under every figure, `PageFooterNav`.
- **Workshop / tool** (build, tasks, prompts, tools, apply, interview, tracker, plan, niches, equipment, simulator, path): compact `PageHero`, the tool inside a `Card padding="lg"` using `Field`/`Tabs`/`ChoiceCard`, `EmptyState` where applicable, `PageFooterNav`.
- **Data** (reality, salary, markets, simulator): guide archetype plus chart primitives; `Source` is mandatory and `verify:claims` continues to police it.

### 8.4 `/path` dashboard

Rebuilt on `JourneyStepper`, `Card`, `ProgressBar`, `EmptyState` (`Figure path-dashboard`). Logic untouched.

---

## 9. De-slop inventory

| Pattern | Count | Action |
|---|---|---|
| `blur-3xl` gradient blobs | 8 | Delete |
| `Sparkles` icon | 11 | Delete; no decorative icons on copy |
| `hover:-translate-y-*` lifts | 59 | Delete; border/background hover only |
| `rounded-2xl/3xl` + global radius hack | 221 + 1 | Tokens; hack deleted |
| Marquee with ✦ | 1 | Delete `Marquee` |
| Hero squiggle underline SVG | 1 | Delete; `Heading accent` instead |
| Abstract hero SVG chart | 1 | Replace with `Figure home-hero` |
| Kicker-with-dot mono labels | sitewide | `Kicker` pill, Inter |
| "0 templates handed out" stat cards | 1 | `StatStrip` with structural facts only |
| Emoji flags in language panel | 3 | Panel leaves home; on `/languages` use text labels |
| Two icon libraries | 2 | Phosphor only |
| Dot-grid backgrounds | 2 | Delete |
| Dark panels mid-page | 2 | One navy band per page (CTA) |
| `Reveal` wrapper | 200+ call sites | Delete component; unwrap during migration |

---

## 10. Accessibility and performance

- Skip link (missing today) as the first focusable element.
- Focus ring: 2px `primary`, 2px offset, on every interactive element; dropdown and drawer are keyboard-complete; `Accordion` uses native `<details>`.
- Touch targets ≥ 44px; header controls 48px.
- `verify:contrast` extended to the new tokens and to text-on-tint pairs.
- LCP target < 2.5s on mobile 4G: hero image `priority`, AVIF ≤ 120KB at 1x, fonts preloaded, header JS unchanged in size.
- CLS < 0.05: explicit image dimensions, `size-adjust` fallbacks.
- No `motion` import in any server page.

---

## 11. Copy pass (shell only)

Scope: `data/site.json` (hero, nav labels and descriptions, standard, mission, footer), `data/stages.json` chrome fields (`kicker`, `steps`, `closing` only; summaries and `doFirst` untouched), new `data/faq.json` and `data/library.json`, all CTAs and empty states, and the `metadata` descriptions of home and stage pages.

Rules (applied with the `anti-ai-slop-writing` skill and checked by `scripts/voice-audit.mjs`):
- Hero headline ≤ 8 words; lead ≤ 25 words; one idea per paragraph.
- No "actually", "forever", "genuinely", "truly"; no "not X, Y" reversals; no triads for rhythm; no "No overwhelm, no 40-tab rabbit holes"-style lists of negatives.
- Concrete nouns and verbs: "Write your own resume in the lab" beats "Build the assets that get replies."
- Taglish stays where it already is; nothing new is added for flavour.
- Honesty doctrine unchanged: no numbers without a `Source`.

The 30 content JSON files get a mechanical sweep only (the banned-word list above, em-dash chains, duplicated sentence openers), reviewed as a diff; rewrites are a separate project.

---

## 12. Data changes

| File | Change |
|---|---|
| `data/site.json` | `nav` structure (§6.5); `stats` trimmed; hero/standard/footer copy |
| `data/stages.json` | chrome copy only; add `image: "stage-start"` etc. |
| `data/faq.json` | new, 6 items |
| `data/library.json` | new, 32 entries |
| `data/visuals.json` | new, generated by the optimise script |
| `data/practice.json` | new: `{ [route]: { questions: [{ id, prompt, type: "choice"\|"reveal", options?: [{ text, correct, why }], answer?, source? }] } }` |
| `data/decks.json` | new: `[{ id, title, blurb, cards: [{ id, front, back, source? }] }]` |
| `data/scenarios.json` | new: `[{ id, title, route, start, nodes: { [id]: { text, choices?: [{ label, next, tests }], end?: true, debrief? } } }]` |
| `data/annotated.json` | new: `[{ id, kind, title, blocks: [{ id, text }], hotspots: [{ block, n, title, why, rule }] }]` + `pairs: [{ id, before, after, changes: [{ from, to, why }] }]` |
| `data/glossary.json` | new: `[{ id, term, definition, taglish?, href? }]` |
| `data/reflection.json` | new: `[{ week: 1–12, prompt }]` |
| `data/tldr.json` | new: `{ [route]: { tl: string, reviewed: boolean } }` |
| `data/educators.json` | new: `{ intro, sessions: [{ id, title, minutes, method, objectives[], setup[], steps: [{ minutes, title, facilitator, participants, tool? }], prompts[], mistakes[] }], slides: [{ id, kicker, title, body, source? }], license: { name, url, attribution } }` |
| `data/track-names.json` | unchanged |
| content JSONs | banned-word sweep only |

Dates are stored as ISO `YYYY-MM-DD` strings; schedules as `{ box: 1–5, due: "YYYY-MM-DD" }`.

---

## 13. Testing and verification

- **Unit (Vitest + Testing Library):** `Button` renders `Link`/`a`/`button` correctly; `Tabs` keyboard model; `Accordion` open/close and single-open mode; `Dialog` focus trap and Esc; `Field` wires `aria-describedby` for hint/error; `lib/accent.ts` has every accent × every key. Practice logic is pure and tested first: `lib/leitner.ts` (box promotion/demotion, due dates), `lib/streak.ts`, `lib/ics.ts` (valid VCALENDAR output), `lib/scenario.ts` (graph walk, unreachable-node and dead-end detection over `scenarios.json`), plus a data-integrity test that every `Quiz`/`Term`/`Tldr` route exists and every `Scenario` `next` resolves. Existing `node --test` math tests keep running.
- **Static:** `verify:primitives`, `verify:contrast`, `verify:links`, `verify:claims`, `tsc`, `eslint`, `voice-audit`.
- **Visual:** scripted screenshots (chrome-devtools or Playwright) at 375 / 768 / 1280 / 1536 for `/`, `/start`, `/method`, `/reality`, `/tracker`, `/library`, `/dev/ui`, plus header dropdown and mobile drawer open states; stored under `screenshots/` and referenced in a refreshed `DESIGN_REVIEW.md`.
- **Lighthouse:** mobile home and one stage page; a11y ≥ 95, perf ≥ 90.
- **Manual:** keyboard-only pass through header, drawer, search, one wizard, one accordion.

---

## 14. Phased roadmap

Each phase is its own implementation plan and PR. The site builds and deploys after every phase.

| # | Phase | Deliverables | Exit criteria |
|---|---|---|---|
| 0 | **Foundations** | Fonts (`next/font`), full token set, radius hack removed, skip link, `BUILD_GUIDE.md` v2, `lib/accent.ts` | Build green; `verify:contrast` passes; every page visibly re-themed even where structure is old |
| 1 | **Primitives and layout** | `components/ui`, `components/layout`, Vitest setup + tests, `verify:primitives` (warn-only until Phase 5), `/dev/ui` gallery | Gallery screenshot reviewed; tests pass |
| 2 | **Navigation and IA** | `site.json` nav, `SiteHeader` + dropdowns + drawer, `SiteFooter`, `SearchPalette` on `Dialog`, `Breadcrumb`, `PageFooterNav`, `/library` + `library.json` | Every route ≤ 2 clicks from home; `verify:links` passes; drawer and dropdown screenshots |
| 3 | **Visual content pipeline** (runs in background from Phase 1 onward) | Shot list, `gen-images.mjs`, `optimize-images.mjs`, `visuals.json`, `Figure`; `diagram-design` profile + marker, first 4 diagrams | 11 images optimised and committed; 4 diagrams rendered in `DiagramFrame` |
| 4 | **Home and stage template** | `app/page.tsx` rebuilt (§8.1), `faq.json`, `StagePage` rebuilt, `JourneyStepper`, `PathChooser limit` | Home ≤ 8 sections; 4-breakpoint screenshots; Lighthouse targets met |
| 5 | **Interior migration** | Batch A: 13 guide pages · Batch B: 4 data pages with chart primitives and remaining diagrams · Batch C: 17 workshops on form primitives · `Reveal` and `lucide-react` removed | `verify:primitives` switched to fail-on-violation and passing repo-wide |
| 6 | **Practice layer** | `lib/leitner|streak|ics|scenario` with tests · `components/practice/*` · `/practice`, `/glossary` · data files (54 questions, 4 decks, 4 scenarios, 4 annotated examples + 3 pairs, ~40 terms, 12 prompts, 18 TL;DRs) · `ExportButton` wired into labs, plan, tracker · `ReaderControls` | Data-integrity tests pass; every guide ends with a `Quiz`; `/practice` shows due items; exports open in Calendar/Markdown apps |
| 7 | **Educator kit** | `data/educators.json` · `app/educators` landing + `kit/*` print routes · print stylesheet · `scripts/build-kit-pdf.mjs` + `verify:kit` · `public/kit/*.pdf` (6 files) | PDFs open cleanly in Acrobat/Preview/Chrome; fonts embedded; every figure sourced; landing page linked from footer, library, and `/method` |
| 8 | **Copy pass** | Shell copy per §11, content-JSON sweep, TL;DR drafts flagged for review | `voice-audit` clean; hero ≤ 8 words |
| 9 | **Verification and docs** | Full check suite, screenshots, `DESIGN_REVIEW.md` v2, `README.md` routes/design sections, dead-file removal | All checks green; review doc published |

Rough effort: Phases 0–2 are mechanical and fast; Phase 5 Batch C and Phase 6's content authoring are the long tails; Phase 3's wall-clock is dominated by ~1 hour of background image generation.

---

## 15. Documentation to update

`BUILD_GUIDE.md` (tokens, primitives, images rule, diagrams rule, archetypes), `README.md` (routes incl. `/library`, design section), `DESIGN_REVIEW.md` (replaced by a v2 after Phase 7), `AGENTS.md` unchanged.

---

## 16. Open questions (defaults applied unless changed at review)

1. **Primary hue.** Default blue-violet `#4B4EF6`. Alternative if you want distance from the reference: a deep teal or a warm cobalt; either needs a re-run of the contrast table.
2. **`/library` route.** Default yes. Alternative: keep the mega-menu but cap it to 12 items.
3. **Vitest for interactive primitives.** Default yes (small: ~6 test files).
4. **Phosphor-only icons.** Default yes; lucide removed.
5. **Copy scope.** Default shell only. Say the word if you want the content JSONs rewritten in the same project; that roughly doubles the copy phase.
6. **Image subjects and captions.** Default Filipino subjects, real PH settings, "Illustrative image" caption on every generated asset. Confirm you are comfortable with generated people on the site at all; the fallback is object/desk/environment shots only.
7. **Cabinet Grotesk self-hosting** under the ITF Free Font License. Default self-host (`next/font/local`); alternative is the Fontshare CDN link, which adds a third-party request.
8. **Language-premium panel** leaves the homepage and lives on `/languages` and the Level Up stage. Default yes.
9. **Dev gallery** `/dev/ui` behind `NODE_ENV`. Default yes.
10. **Tagalog TL;DRs** ship marked "draft translation" until a native speaker clears them. Default yes; tell me if you'd rather hold them back entirely until reviewed.
11. **Educator kit licence.** CC BY 4.0 applied (spread with attribution). Alternatives if you change your mind later: CC BY-SA 4.0 or CC BY-NC-SA 4.0; swapping is a one-line change in `data/educators.json`.

**Approval:** full spec approved 2026-08-21 ("implement it… do everything, no need to ask"). Practice layer approved minus audio/video/sandboxes; educator kit and logo redesign added the same day. All defaults 1–11 applied.
