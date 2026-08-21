# UI Overhaul — Phase 5: Interior Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every interior page and every interactive tool on `components/ui` + `components/layout`, land the five remaining first-wave diagrams and the chart primitives behind them, delete `Reveal`, the `components/ui.tsx` shim, `lucide-react`, the legacy CSS block and Tailwind's default radius scale — and flip `verify:primitives` to fail-on-violation with the repo clean.

**Architecture:** Three archetypes from spec §8.3 and nothing else. **Guide** = `PageHero` (breadcrumb from `getBreadcrumb`, kicker, title, lead, optional diagram) → prose in `Container size="narrow"` or a `Toc` rail for long pages → `Callout` for honesty notes → `Source`/`SourceList` under every figure → `PageFooterNav` from `findNavNeighbours`. **Workshop** = compact `PageHero` → the tool inside `Card padding="lg"` → `PageFooterNav`. **Data** = Guide plus `components/diagrams/charts` primitives, with `Source` mandatory on every series. Tool logic, state shapes, localStorage keys, analytics calls and `lib/*-math.ts` usage are **byte-identical** across the migration; only chrome changes.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first tokens from Phase 0), TypeScript strict, Vitest 3 + @testing-library/react 16 + user-event 14, `node --test` (existing `lib/*.test.mjs` math suites), Phosphor Icons, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§4.3 shape, §5.7 enforcement, §7.2 diagrams, §8.3 archetypes, §9 de-slop inventory, §10 a11y, §11 copy, §13 testing, §14 row 5). This is plan 6 of 10.

**Depends on (all complete before this plan starts):**
- **Phase 0:** tokens in `app/globals.css`, `lib/fonts.ts`, `lib/accent.ts` (`ACCENT`, `accent()`, `isAccent`, `ACCENTS`, `type Accent`), the skip link, the redesigned logo.
- **Phase 1:** `@/components/ui` and `@/components/layout` export exactly the names in the pinned contract below; `scripts/verify-primitives.mjs` exists and is wired into `verify:all` warn-only; `components/ui.tsx` is the compatibility shim.
- **Phase 2:** `lib/nav.ts` exports `getBreadcrumb(href)`, `findNavNeighbours(href)`, `LIBRARY`, `LIVE_LIBRARY`; `components/site/*` owns the shell.
- **Phase 3:** `data/visuals.json` holds the 11 image entries; `components/diagrams/index.ts` exports `DIAGRAMS` with `journey-map`, `method-loop`, `hiring-funnel`, `first-week-timeline`.
- **Phase 4:** `components/journey/*` (`JourneyStepper`, `PathChooser`, `PathGate`, `StagePage`), `lib/routes.ts` (`routeDesc`, `routeEntry`), `lib/stages.ts`, the rebuilt homepage and `/path`.

### The Phase 6 hand-off

`docs/superpowers/plans/2026-08-21-ui-overhaul-p6-practice.md` exists and pins the contract. Its Task 17 Step 6 says Phase 6 does **not** edit the eighteen guide and stage pages; instead Phase 5 leaves the landing spots and Phase 6 writes exactly two lines into each:

```tsx
import { PracticeFooter, Tldr } from "@/components/practice";
```

Line 1, directly **after** the page's `<PageHero …/>`:

```tsx
      <Section spacing="none"><Tldr route="/english" /></Section>
```

Line 2, directly **before** the page's `<PageFooterNav …/>`:

```tsx
      <PracticeFooter route="/english" />
```

**Phase 5 writes the comment, not the component.** Phase 5 runs first, so `@/components/practice` does not exist yet and importing it would break the build. Every page this plan migrates therefore carries a comment holding the exact line Phase 6 will replace it with:

```tsx
{/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/method" /></Section> */}
{/* practice: Phase 6 replaces this line with <PracticeFooter route="/method" /> */}
```

Phase 6's insertion is then a mechanical find-and-replace with nothing to decide.

**Which routes get the markers.** Phase 6's list is thirteen guides plus five stage pages:

- **Thirteen guides, migrated here:** `/method`, `/learn`, `/reality`, `/conduct`, `/english`, `/indispensable`, `/ai-first`, `/legit`, `/salary`, `/markets`, `/languages`, `/resources`, `/portfolio` — Tasks 3–9.
- **Five stage routes**, which Phase 4 built as thin `<StagePage id="…" />` wrappers: Task 20 Step 6 adds the same two comments to `app/{start,get-hired,deliver,level-up,own}/page.tsx`.

`/clients`, `/simulator` and every workshop host page get **no** practice markers — they are not on Phase 6's list, and adding a marker Phase 6 will never fill is a promise the plan cannot keep.

`/markets` carries a third marker: `{/* practice: TimezoneOverlap — Phase 6 mounts <TimezoneOverlap regions={regions.items} /> here */}`. Phase 6's Task 17 edits `/markets` and `/learn` directly for the utility components, so those two files are touched twice across the two phases — expected, and the marker tells the Phase 6 implementer where.

---

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

> **Phase 5 note on the radius line above:** this is the phase that wipes Tailwind's default `rounded-*` scale. It happens in Task 21 (cleanup), *after* every batch has removed its own `rounded-xl|2xl|3xl` usages — never before. Wiping first would silently drop the corner radius off every page that has not been migrated yet.

### Phase 5 additions to the constraints

- **Behaviour is frozen.** Every `useState` shape, every `useEffect`, every `localStorage` key (`hfph.labs.v1`, `hfph.worksheet.v1`, everything reached through `lib/path-context.tsx`), every `migrateKey(...)` call, every `track(...)` call and every import from `lib/rate-math.ts` / `lib/simulator-math.ts` / `lib/worksheet-math.ts` stays exactly as it is. If a diff touches one of those lines, the diff is wrong. `lib/path-context.tsx` is not opened at all in this phase.
- **Every `source` object survives.** Pages carry `{label, url}` objects out of `data/*.json`. Each one becomes a `<Source>` (or an entry in a `<SourceList>`). Deleting a source to tidy a layout is a doctrine violation, not a design decision. `npm run verify:claims` and the counts in Task 22 police this.
- **No accent literals.** `ACCENT[a]` / `accent(id)` from `@/lib/accent` only. Every page-local `const accentText|accentBar|accentSoft|accentBorder` map is deleted.
- **No page-local `Source` / `ChangeBar` / `GrowthBar` / `Field` / `FilterChip` helper components.** Each is replaced by the shared primitive that does its job. Grep for `function Source(` after Batch B: the count must be zero outside `components/ui/source.tsx`.
- **Content is preserved verbatim.** Every string, every list item, every `href`, every external link keeps its text and its target. This phase changes containers, not copy. `voice-audit` runs at the end to confirm nothing drifted.
- **Diagrams get a title and a one-sentence caption.** Every diagram and every chart renders inside `<DiagramFrame title=… caption=…>`. The caption says what to look at, in one sentence.
- **`git` concurrency:** other agents commit on this branch while Phase 5 runs. If a git command fails with `Unable to create '.git/index.lock': File exists`, wait a few seconds and re-run the same command. Never delete `index.lock` by hand. Always `git add` explicit paths — never `git add -A`.

### Reproduction convention (why some tasks print whole files and some print edit scripts)

| Situation | What the task gives you |
|---|---|
| A page whose shape changes completely (all Batch A guides, all Batch B data pages, small workshop hosts) | The **complete new file**, verbatim. Overwrite it. |
| Any file over 600 lines | An **ordered edit script**: `old → new` replacements with enough surrounding context to be unambiguous, plus the complete new import block. |
| Any Batch C workshop component or host page over 200 lines | An **ordered edit script**, for the same reason the 600-line rule exists, only stronger: these files hold the state machines the "behaviour is frozen" constraint protects. Retyping 400 lines of untouched reducer logic out of a plan is exactly how a `localStorage` key quietly changes. Files at or under 200 lines (`rate-calculator` 133, `prompt-workshop` 141, `self-audit` 173, `app/build` 43, `app/plan` 103, `app/tasks` 128, `app/tracker` 197) are printed in full. |

Edit scripts are applied top to bottom. Every `old` block is unique in its file as printed; if a replacement reports two matches, an earlier edit was skipped.

---

## Pinned Phase 0–4 contract (authoritative for this plan)

`@/components/ui` exports, with the props this plan uses:

- `Accordion` (`type?: "single"|"multiple"`, `defaultOpen?`, `className?`), `AccordionItem` (`id`, `title`, `children`, `className?`)
- `Badge` (`tone?: BadgeTone`, `variant?: "soft"|"outline"`, `className?`); `type BadgeTone = "neutral" | Accent`
- `Button` (`href?`, `external?`, `variant?: "primary"|"secondary"|"outline"|"ghost"|"link"`, `size?: "sm"|"md"|"lg"`, `icon?`, `iconEnd?`, `type?`, `disabled?`, `onClick?`, `className?`, `aria-label`?) — renders `next/link`, `<a>`, or `<button>`
- `Callout` (`tone?: "neutral"|Accent`, `title?`, `icon?` kebab name, `className?`)
- `Card` (`padding?: "none"|"sm"|"md"|"lg"`, `interactive?`, `href?`, `as?: "div"|"article"|"li"|"section"`, `onBand?`, `className?`), `CardMedia` (`ratio?`), `CardBody`, `CardFooter`
- `Checkbox` (`label` + native input props), `Radio` (`label` + native input props), `ChoiceCard` (`name`, `value`, `label`, `description?`, `icon?`, `checked?`, `defaultChecked?`, `onChange?: (value: string) => void`, `disabled?`, `className?`), `Range` (`valueLabel?` + native input props), `Switch` (`checked`, `onChange`, `label`, `hideLabel?`, `disabled?`, `id?`)
- `Field` (`label`, `hint?`, `error?`, `required?`, `hideLabel?`, `as?: "field"|"group"`, `className?`), `Input`, `Textarea`, `Select` (native props; wiring via `useFieldControl()`), `controlClass`
- `DiagramFrame` (`title`, `caption?`, `id?`, `className?`, `children`)
- `Dialog` (`open`, `onClose`, `title`, `hideTitle?`, `description?`, `size?`, `placement?`, `flush?`, `hideClose?`)
- `EmptyState` (`title`, `body?`, `icon?`, `action?`, `media?`, `className?`)
- `Figure` (`id?`, `src?`, `alt?`, `width?`, `height?`, `generated?`, `caption?`, `priority?`, `sizes?`, `ratio?`, `radius?`, `className?`)
- `Heading` (`level?: 1..6`, `size?: "hero"|"display"|"h2"|"h3"|"h4"|"h5"`, `accent?: string`, `balance?`, `tone?: "ink"|"inherit"`, `id?`, `className?`)
- `Icon` (`name` kebab Phosphor, `size?`, `weight?`, `className?`, `aria-label`?) + `ICON_NAMES`
- `Kicker` (`tone?: BadgeTone`, `className?`)
- `ProgressBar` (`value`, `max?`, `label`, `hideLabel?`, `showValue?`, `tone?: Accent`, `className?`)
- `Source` (`label`, `url`, `date?`, `grade?: "primary"|"vendor"`, `className?`), `SourceList` (`sources: SourceProps[]`, `className?`)
- `Stat` (`value`, `label`, `sub?`, `source?`, `className?`) inside `StatStrip` (renders `<dl>`)
- `Step` (`n`, `title`, `children?`, `className?`) inside `StepList` (renders `<ol>`)
- `Tabs` (`value?`, `defaultValue?`, `onValueChange?`), `TabList` (`label`), `Tab` (`value`, `icon?`, `disabled?`), `TabPanel` (`value`)
- `Text` (`size?: "lead"|"body"|"base"|"small"|"caption"`, `tone?: "ink"|"soft"|"faint"|"inherit"`, `as?: "p"|"span"|"div"|"li"`, `balance?`, `id?`, `className?`)

`@/components/layout` exports: `Breadcrumb` (`items`), `CardGrid` (`cols?: 2|3|4`, `as?: "div"|"ul"`), `Container` (`size?: "default"|"narrow"|"wide"`, `as?`), `CtaBand` (`kicker?`, `title`, `body?`, `actions`, `media?`), `FeatureRow` (`items`), `PageFooterNav` (`prev?`, `next?`, `up?`), `PageHero` (`breadcrumb?`, `kicker?`, `kickerTone?`, `title`, `accent?`, `lead?`, `actions?`, `media?: {figureId}|{node}`, `compact?`, `children?`, `className?`), `Section` (`band?: "none"|"tint"|"navy"`, `spacing?: "default"|"hero"|"none"`, `size?`, `id?`, `className?`), `SectionHeading` (`kicker?`, `kickerTone?`, `title`, `lead?`, `action?`, `align?`, `level?`, `size?`, `id?`), `Toc` (`items: {id,label}[]`, `title?`).

`@/lib/accent`: `ACCENTS`, `type Accent = "neutral"|"signal"|"caution"|"verified"|"info"|"coral"`, `ACCENT`, `accent(id)`, `isAccent(x)`. Keys per accent: `text`, `fill`, `tint`, `border`, `ring`, `soft`.

`@/lib/nav`: `getBreadcrumb(href): {label, href?}[]`, `findNavNeighbours(href): {prev?, next?, up?}`, `LIBRARY`, `LIVE_LIBRARY`, `type LibraryEntry`.

`@/components/journey`: `JourneyStepper`, `PathChooser`, `PathGate`, `StagePage`.

`@/components/diagrams`: `DIAGRAMS`, `type DiagramId`, `type DiagramProps = { current?: number; className?: string }`, `JourneyMap`, `MethodLoop`, `HiringFunnel`, `FirstWeekTimeline`; `@/components/diagrams/types` exports `DIAGRAM_MIN_WIDTH`, `INTER`, `CABINET`.

---

## Scope reconciliation: the "13 guides + 4 data pages" overlap

Spec §14 row 5 reads *"Batch A: 13 guide pages · Batch B: 4 data pages with chart primitives and remaining diagrams · Batch C: 17 workshops"*. Those counts overlap and under-count, and a plan that copied them literally would hand two tasks the same file:

- §8.3's Guide list is `method, learn, reality, conduct, english, indispensable, ai-first, legit, salary, markets, languages, resources, portfolio` (13). Its Data list is `reality, salary, markets, simulator` (4). **`/reality`, `/salary` and `/markets` are on both lists.**
- §8.3's Guide list omits `/clients`, which is a prose guide in fact and is the host of the Phase 5 `agency-vs-direct` swimlane (§7.2).
- The "17 workshops" count includes `search-palette`, which **Phase 2 already rebuilt** on `Dialog`.

This plan splits by file, so every file is migrated exactly once:

| Batch | Files | Where |
|---|---|---|
| **A — guides (11 pages)** | `method`, `learn`, `conduct`, `english`, `ai-first`, `indispensable`, `legit`, `languages`, `resources`, `portfolio`, `clients` | Tasks 3–6 |
| **B — data (4 pages) + 3 new diagrams** | `reality`, `salary`, `markets`, `simulator` (+ `components/career-simulator.tsx`); `vetting-flow`, `agency-vs-direct`, `forgetting-curve` | Tasks 2, 7–10 |
| **C — workshops (16 components + 10 hosts + 6 leaves)** | the 16 tool components, their host pages, `copy-button`, `download-button`, `freshness-note`, `back-to-top`, plus `not-found` and `privacy` | Tasks 11–20 |

11 + 4 = 15 page files. Both spec lists are fully covered; nothing is migrated twice.

Two further scope calls, recorded here so a reviewer can overturn them:

1. **`/salary` and `/markets` ship no chart.** Neither page holds a numeric series: `/salary` is pay *ranges as strings* plus prose, `/markets` is a region comparison table. §7.2 lists a salary pricing-model chart as a **second-wave** candidate, "only if it beats the table" — it does not. Both pages get the Data archetype's source discipline (`Source` under every claim, `Stat`/`StatStrip` for the standalone numbers) and no invented chart. The chart primitives land where the numbers actually are: `/reality` (bars), `/simulator` (line), `/english` (baseline bars) and `/indispensable` (comparison bars).
2. **`/markets` reserves `TimezoneOverlap`.** It is a Phase 6 practice component (§5.2b). The overlap section gets `{/* practice: TimezoneOverlap — Phase 6 mounts <TimezoneOverlap regions={…} /> here */}` and keeps its prose in the meantime.

---

## File structure

| Path | Responsibility |
|---|---|
| `lib/chart-scale.ts`, `lib/chart-scale.test.ts` | **New.** `linearScale`, `niceTicks` — the only maths in the chart layer, tested first |
| `components/diagrams/charts/chart-primitives.tsx` | **New.** `Axis`, `Bars`, `Line`, `Legend`, `ValueLabel` — token-driven SVG, hairline axes, one accent, no shadows |
| `components/diagrams/charts/chart-primitives.test.tsx`, `components/diagrams/charts/index.ts` | **New.** Render tests + barrel |
| `components/diagrams/{vetting-flow,agency-vs-direct,forgetting-curve}.tsx` | **New.** The three remaining first-wave static diagrams |
| `design/diagrams/{vetting-flow,agency-vs-direct,forgetting-curve}.html` | **New.** Plugin HTML source of truth for each |
| `design/diagrams/build-preview.mjs`, `design/diagrams/preview.html`, `design/diagrams/README.md` | Extended from four diagrams to seven |
| `components/diagrams/index.ts` | Registers the three new ids |
| `components/ui/icon.tsx` | Registry gains the 18 kebab names the lucide removal needs |
| `data/learning.json` | Gains one `forgettingCurve` block (title, caption, axis labels, `source`) |
| `app/{method,learn,conduct,english,ai-first,indispensable,legit,languages,resources,portfolio,clients}/page.tsx` | Batch A — Guide archetype |
| `app/{reality,salary,markets,simulator}/page.tsx` | Batch B — Data archetype |
| 16 workshop components in `components/` | Batch C — form primitives, logic frozen |
| 16 new `components/*.test.tsx` | RTL smoke test per workshop |
| `app/{build,plan,tasks,tracker,apply,prompts,tools,interview,niches,equipment}/page.tsx` | Batch C — Workshop archetype |
| `components/{copy-button,download-button,freshness-note}.tsx`, `components/site/back-to-top.tsx` | Leaf components off lucide and off `.kicker` |
| `app/not-found.tsx`, `app/privacy/page.tsx` | The last two `app/` files carrying violations |
| `components/reveal.tsx`, `components/ui.tsx`, `components/icon.tsx` | **Deleted** in Task 21 |
| `app/globals.css` | Legacy block deleted, radius scale wiped |
| `scripts/verify-contrast.mjs`, `package.json` | Legacy pairs dropped; `verify:primitives` flips to `--strict`; `lucide-react` uninstalled |

## Parallel groups

Groups run in order. Tasks **inside** a group touch disjoint files and can run concurrently.

| Group | Tasks | Depends on | Notes |
|---|---|---|---|
| A | T1 chart primitives + icon registry · T2 the three static diagrams | — | Both are pure additions. Everything downstream imports them. |
| B | T3 · T4 · T5 · T6 (Batch A, 11 guides) | A | File-disjoint by page. |
| C | T7 `/reality` · T8 `/salary` · T9 `/markets` · T10 `/simulator` + `career-simulator` | A | May run concurrently with D and E. |
| D | T11 `build-labs` · T12 `micro-tasks` · T13 `application-tracker` · T14 · T15 · T16 · T17 (Batch C components) | A | One task per big workshop; small ones grouped 3–4. Cap concurrency at 8. |
| E | T18 · T19 (workshop host pages) · T20 (leaf components, 404, privacy) | A | Host pages import tool components whose exported API does not change, so E may run alongside C and D. |
| F | T21 cleanup | A–E all landed | Deletes `Reveal`, the shim, `lucide-react`, the legacy CSS, the radius scale. |
| G | T22 exit verification | F | Runs last, alone. |
---

### Task 1: Baseline, the icon registry, `lib/chart-scale.ts` and the chart primitives

**Parallel group:** A

**Files:**
- Create: `lib/chart-scale.ts`, `lib/chart-scale.test.ts`, `components/diagrams/charts/chart-primitives.tsx`, `components/diagrams/charts/chart-primitives.test.tsx`, `components/diagrams/charts/index.ts`
- Modify: `components/ui/icon.tsx` (the `REGISTRY` map and its import list only — the export list is unchanged)

**Interfaces:**
- Consumes: `INTER` from `@/components/diagrams/types`; `cn` from `@/lib/utils`.
- Produces, from `@/lib/chart-scale`:
  - `export type Scale = (value: number) => number`
  - `export function linearScale(domain: readonly [number, number], range: readonly [number, number]): Scale`
  - `export function niceTicks(min: number, max: number, count?: number): number[]`
- Produces, from `@/components/diagrams/charts`:
  - `export type BarDatum = { id: string; label: string; value: number; note?: string; focal?: boolean; compare?: number }`
  - `export type BarsProps`, `export function Bars(props: BarsProps)`
  - `export type LineSeries = { id: string; label: string; points: readonly { x: number; y: number }[]; focal?: boolean; dashed?: boolean }`
  - `export type LineProps`, `export function Line(props: LineProps)`
  - `export type AxisProps`, `export function Axis(props: AxisProps)`
  - `export type LegendItem = { id: string; label: string; kind: "line" | "dashed" | "swatch" | "band"; focal?: boolean }`, `export function Legend({ items, className })`
  - `export type ValueLabelProps`, `export function ValueLabel(props: ValueLabelProps)`
- `components/ui/icon.tsx` gains 18 kebab names in `REGISTRY`. `ICON_NAMES` is `Object.keys(REGISTRY).sort()` and picks them up on its own, so no export changes.

**Why the icon registry moves first:** every lucide import removed in Batches A–C needs a Phosphor name to land on, and most of the names in use today (`Check`, `X`, `Plus`, `Trash2`, `ArrowLeft`, `Info`, `Ban`, `ChevronLeft`, `OctagonAlert`, `ShieldOff`, `TrendingDown`, `Copy`, `Download`, `AlertTriangle`) have no entry. `app/learn/page.tsx` already renders `<Icon name="alert-triangle">`, which silently falls back to `Sparkle`; this task fixes that latent bug as a side effect.

- [ ] **Step 1: Record the baseline**

Run:
```bash
node scripts/verify-primitives.mjs; echo "exit=$?"
```
Expected: a long `app/**` and `components/**` list, then a summary line and `exit=0`. Measured on this branch before Phase 5 begins:

```
verify:primitives (warn-only): 620 violation(s) — lucide 47, accent-map 40, raw-card 138, radius 315, lift 59, blur 9, raw-control 12
```

Copy the number you actually see into the Status block at the bottom of this plan as `before`. If it differs from 620, Phases 2 and 4 have changed the surface since this plan was written — that is fine, record what you measure.

- [ ] **Step 2: Write the failing scale test**

Create `lib/chart-scale.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { linearScale, niceTicks } from "@/lib/chart-scale";

describe("linearScale", () => {
  it("maps the domain ends onto the range ends", () => {
    const x = linearScale([0, 100], [0, 500]);
    expect(x(0)).toBe(0);
    expect(x(100)).toBe(500);
    expect(x(50)).toBe(250);
  });

  it("handles an inverted range, which is how every y axis is drawn", () => {
    const y = linearScale([0, 10], [400, 40]);
    expect(y(0)).toBe(400);
    expect(y(10)).toBe(40);
    expect(y(5)).toBe(220);
  });

  it("handles a negative domain without clamping", () => {
    const x = linearScale([-40, 40], [0, 800]);
    expect(x(-40)).toBe(0);
    expect(x(0)).toBe(400);
    expect(x(80)).toBe(1200);
  });

  it("collapses a zero-width domain onto the range start instead of dividing by zero", () => {
    const x = linearScale([7, 7], [10, 90]);
    expect(x(7)).toBe(10);
    expect(Number.isFinite(x(9))).toBe(true);
  });
});

describe("niceTicks", () => {
  it("produces round steps that cover the data", () => {
    expect(niceTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("extends outward across zero for diverging data", () => {
    expect(niceTicks(-30, 12, 5)).toEqual([-30, -20, -10, 0, 10, 20]);
  });

  it("returns evenly spaced ticks whose ends bracket the input", () => {
    const ticks = niceTicks(3, 187, 5);
    expect(ticks.length).toBeGreaterThan(2);
    expect(ticks[0]).toBeLessThanOrEqual(3);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(187);
    const steps = ticks.slice(1).map((t, i) => Number((t - ticks[i]).toFixed(10)));
    expect(new Set(steps).size).toBe(1);
  });

  it("degenerates safely", () => {
    expect(niceTicks(5, 5)).toEqual([5]);
    expect(niceTicks(Number.NaN, 10)).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npx vitest run lib/chart-scale.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/chart-scale"`.

- [ ] **Step 4: Write `lib/chart-scale.ts`**

```ts
/**
 * The only maths in the chart layer. Pure, dependency-free, unit-tested —
 * every SVG primitive in components/diagrams/charts/ takes its geometry from
 * these two functions, so a chart can never invent its own scale.
 */

export type Scale = (value: number) => number;

/**
 * A linear map from a data domain onto a pixel range. Deliberately does not
 * clamp: a point outside the domain draws outside the plot area, which is
 * visible and therefore fixable, where a silent clamp is a lie about the data.
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  const factor = (r1 - r0) / span;
  return (value: number) => r0 + (value - d0) * factor;
}

const STEPS = [1, 2, 2.5, 5, 10] as const;

/**
 * Round axis ticks that bracket [min, max]. `count` is a target, not a
 * guarantee: the step is snapped to 1 / 2 / 2.5 / 5 / 10 times a power of ten,
 * so every label reads as a number a person would say out loud.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const rough = (hi - lo) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step = (STEPS.find((s) => normalised <= s) ?? 10) * magnitude;

  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;

  const ticks: number[] = [];
  // Accumulate from `start` by index rather than by repeated addition:
  // floating-point drift over twenty steps prints "0.30000000000000004".
  for (let i = 0; i <= 1000; i += 1) {
    const value = Number((start + i * step).toPrecision(12));
    ticks.push(value);
    if (value >= end - step / 1e6) break;
  }
  return ticks;
}
```

- [ ] **Step 5: Run the scale test and watch it pass**

Run: `npx vitest run lib/chart-scale.test.ts`
Expected: PASS — 8 tests.

- [ ] **Step 6: Write `components/diagrams/charts/chart-primitives.tsx`**

```tsx
/**
 * Chart primitives — spec §7.2.
 *
 * Small React SVG components that take the data a page already computed and
 * draw it in the `hirefromph` diagram-design style: hairline axes, no shadows,
 * bordered not filled, at most one accent, radius <= 8px, tabular figures on
 * every number. Geometry comes from lib/chart-scale.ts; nothing here does its
 * own arithmetic on the domain.
 *
 * These are server components. They draw no accessible name of their own —
 * wrap them in <DiagramFrame>, which supplies the title, the caption and the
 * horizontal scroll container.
 */
import { linearScale, niceTicks, type Scale } from "@/lib/chart-scale";
import { cn } from "@/lib/utils";
import { INTER } from "../types";

const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

const TONE_FILL = {
  ink: "var(--ink)",
  muted: "var(--ink-soft)",
  faint: "var(--ink-faint)",
  accent: "var(--primary)",
} as const;

/* ------------------------------------------------------------------ */
/*  ValueLabel                                                         */
/* ------------------------------------------------------------------ */

export type ValueLabelProps = {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: keyof typeof TONE_FILL;
  size?: number;
  weight?: number;
  /** Paint an opaque paper rect behind the text (the plugin's masked-label rule). */
  maskWidth?: number;
};

export function ValueLabel({
  x,
  y,
  children,
  anchor = "start",
  tone = "muted",
  size = 11,
  weight = 600,
  maskWidth,
}: ValueLabelProps) {
  const maskX =
    anchor === "end"
      ? x - (maskWidth ?? 0)
      : anchor === "middle"
        ? x - (maskWidth ?? 0) / 2
        : x;
  return (
    <>
      {maskWidth ? (
        <rect
          x={maskX - 4}
          y={y - size}
          width={maskWidth + 8}
          height={size + 6}
          fill="var(--paper)"
        />
      ) : null}
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fill={TONE_FILL[tone]}
        fontFamily={INTER}
        fontSize={size}
        fontWeight={weight}
        style={TABULAR}
      >
        {children}
      </text>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Axis                                                               */
/* ------------------------------------------------------------------ */

export type AxisProps = {
  orientation: "x" | "y";
  ticks: readonly number[];
  scale: Scale;
  /** Cross-axis extent of the gridlines, in px. */
  from: number;
  to: number;
  /** Where the tick labels sit, in px on the cross axis. */
  labelAt: number;
  format?: (value: number) => string;
  /** This tick draws the solid axis line instead of a faint gridline. */
  baselineAt?: number;
  hideLabels?: boolean;
};

export function Axis({
  orientation,
  ticks,
  scale,
  from,
  to,
  labelAt,
  format = (v) => String(v),
  baselineAt,
  hideLabels = false,
}: AxisProps) {
  return (
    <g>
      {ticks.map((tick) => {
        const p = scale(tick);
        const isBaseline = baselineAt !== undefined && tick === baselineAt;
        return (
          <g key={`tick-${tick}`}>
            <g
              stroke={isBaseline ? "var(--line-strong)" : "var(--line)"}
              strokeWidth={isBaseline ? 1 : 0.8}
            >
              {orientation === "x" ? (
                <line x1={p} x2={p} y1={from} y2={to} />
              ) : (
                <line x1={from} x2={to} y1={p} y2={p} />
              )}
            </g>
            {!hideLabels && (
              <ValueLabel
                x={orientation === "x" ? p : labelAt}
                y={orientation === "x" ? labelAt : p + 4}
                anchor={orientation === "x" ? "middle" : "end"}
                tone="faint"
                size={10}
                weight={500}
              >
                {format(tick)}
              </ValueLabel>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Bars — horizontal, optional diverging, optional second series      */
/* ------------------------------------------------------------------ */

export type BarDatum = {
  id: string;
  label: string;
  value: number;
  /** A short qualifier under the row label. */
  note?: string;
  /** The one accented row. At most one datum in a chart should set this. */
  focal?: boolean;
  /** A second, muted bar on the same row (two-state comparison). */
  compare?: number;
};

export type BarsProps = {
  data: readonly BarDatum[];
  /** Value-axis ceiling. Defaults to the largest magnitude in the data. */
  max?: number;
  /** Zero sits in the middle; negatives run left. */
  diverging?: boolean;
  format?: (value: number) => string;
  /** A dashed reference line, e.g. a global average. */
  reference?: { value: number; label: string };
  seriesLabel?: string;
  compareLabel?: string;
  labelWidth?: number;
  width?: number;
  rowHeight?: number;
  className?: string;
};

export function Bars({
  data,
  max,
  diverging = false,
  format = (v) => String(v),
  reference,
  seriesLabel,
  compareLabel,
  labelWidth = 232,
  width = 720,
  rowHeight = 40,
  className,
}: BarsProps) {
  const valueColumn = 64;
  const plotLeft = labelWidth;
  const plotRight = width - valueColumn;
  const top = 28;
  const axisBottom = top + data.length * rowHeight + 8;
  const height = axisBottom + 44;

  const magnitudes = data.flatMap((d) =>
    d.compare === undefined
      ? [Math.abs(d.value)]
      : [Math.abs(d.value), Math.abs(d.compare)],
  );
  const ceiling = max ?? Math.max(1, ...magnitudes);
  const domain: [number, number] = diverging ? [-ceiling, ceiling] : [0, ceiling];
  const x = linearScale(domain, [plotLeft, plotRight]);
  const zero = x(diverging ? 0 : domain[0]);
  const ticks = niceTicks(domain[0], domain[1], 4);
  const barHeight = Math.min(14, rowHeight / 2 - 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: 560, height: "auto", display: "block" }}
    >
      <Axis
        orientation="x"
        ticks={ticks}
        scale={x}
        from={top - 8}
        to={axisBottom}
        labelAt={axisBottom + 18}
        format={format}
        baselineAt={diverging ? 0 : domain[0]}
      />

      {reference && (
        <g>
          <line
            x1={x(reference.value)}
            x2={x(reference.value)}
            y1={top - 8}
            y2={axisBottom}
            stroke="var(--ink-faint)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <ValueLabel
            x={x(reference.value)}
            y={top - 12}
            anchor="middle"
            tone="faint"
            size={10}
            weight={500}
            maskWidth={reference.label.length * 5.4}
          >
            {reference.label}
          </ValueLabel>
        </g>
      )}

      {data.map((d, index) => {
        const rowTop = top + index * rowHeight;
        const centre = rowTop + rowHeight / 2;
        const hasCompare = d.compare !== undefined;
        const primaryY = hasCompare ? centre - barHeight - 2 : centre - barHeight / 2;
        const start = Math.min(zero, x(d.value));
        const barWidth = Math.max(Math.abs(x(d.value) - zero), 1);
        const accented = d.focal === true;

        return (
          <g key={d.id}>
            <text
              x={labelWidth - 16}
              y={hasCompare ? centre - 2 : centre + 4}
              textAnchor="end"
              fill="var(--ink)"
              fontFamily={INTER}
              fontSize={12}
              fontWeight={600}
            >
              {d.label}
            </text>
            {d.note && (
              <text
                x={labelWidth - 16}
                y={hasCompare ? centre + 12 : centre + 18}
                textAnchor="end"
                fill="var(--ink-faint)"
                fontFamily={INTER}
                fontSize={10}
                fontWeight={500}
              >
                {d.note}
              </text>
            )}

            <rect
              x={start}
              y={primaryY}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={accented ? "var(--primary-tint)" : "var(--paper)"}
              stroke={accented ? "var(--primary)" : "var(--line-strong)"}
              strokeWidth={accented ? 1.2 : 1}
            />

            {hasCompare && (
              <rect
                x={Math.min(zero, x(d.compare as number))}
                y={centre + 2}
                width={Math.max(Math.abs(x(d.compare as number) - zero), 1)}
                height={barHeight}
                rx={4}
                fill="var(--band)"
                stroke="var(--line-strong)"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
            )}

            <ValueLabel
              x={width - 12}
              y={hasCompare ? centre - 2 : centre + 4}
              anchor="end"
              tone={accented ? "accent" : "ink"}
              size={11}
            >
              {format(d.value)}
            </ValueLabel>
            {hasCompare && (
              <ValueLabel x={width - 12} y={centre + 16} anchor="end" tone="faint" size={10}>
                {format(d.compare as number)}
              </ValueLabel>
            )}
          </g>
        );
      })}

      {(seriesLabel || compareLabel) && (
        <text
          x={plotLeft}
          y={height - 6}
          fill="var(--ink-faint)"
          fontFamily={INTER}
          fontSize={10}
          fontWeight={500}
        >
          {[seriesLabel, compareLabel].filter(Boolean).join("  ·  ")}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Line — multi-series                                                */
/* ------------------------------------------------------------------ */

export type LineSeries = {
  id: string;
  label: string;
  points: readonly { x: number; y: number }[];
  /** The one accented series. */
  focal?: boolean;
  dashed?: boolean;
};

export type LineProps = {
  series: readonly LineSeries[];
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTickCount?: number;
  yTickCount?: number;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  xTitle?: string;
  /**
   * A shaded region under one series, expressed as a fraction of its y values
   * (0.31 -> "down to 31% below this line"). Used for the simulator's
   * non-payment risk band, which is a warning, not a projection.
   */
  band?: { seriesId: string; drop: number };
  width?: number;
  height?: number;
  className?: string;
};

export function Line({
  series,
  xDomain,
  yDomain,
  xTickCount = 6,
  yTickCount = 4,
  formatX = (v) => String(v),
  formatY = (v) => String(v),
  xTitle,
  band,
  width = 780,
  height = 320,
  className,
}: LineProps) {
  const pad = { left: 64, right: 20, top: 20, bottom: 44 };
  const x = linearScale(xDomain, [pad.left, width - pad.right]);
  const y = linearScale(yDomain, [height - pad.bottom, pad.top]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], xTickCount);
  const yTicks = niceTicks(yDomain[0], yDomain[1], yTickCount);

  const path = (points: readonly { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x)},${y(p.y)}`).join(" ");

  const banded = band ? series.find((s) => s.id === band.seriesId) : undefined;
  const drop = band?.drop ?? 0;
  const bandPath =
    banded && banded.points.length > 0
      ? [
          ...banded.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x)},${y(p.y)}`),
          ...[...banded.points].reverse().map((p) => `L${x(p.x)},${y(p.y * (1 - drop))}`),
          "Z",
        ].join(" ")
      : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: 560, height: "auto", display: "block" }}
    >
      <Axis
        orientation="y"
        ticks={yTicks}
        scale={y}
        from={pad.left}
        to={width - pad.right}
        labelAt={pad.left - 10}
        format={formatY}
        baselineAt={yDomain[0]}
      />
      <Axis
        orientation="x"
        ticks={xTicks}
        scale={x}
        from={pad.top}
        to={height - pad.bottom}
        labelAt={height - pad.bottom + 20}
        format={formatX}
      />

      {bandPath && <path d={bandPath} fill="var(--primary)" opacity={0.1} />}

      {series.map((s) => (
        <path
          key={s.id}
          d={path(s.points)}
          fill="none"
          stroke={s.focal ? "var(--primary)" : "var(--ink-faint)"}
          strokeWidth={s.focal ? 2 : 1.2}
          strokeDasharray={s.dashed ? "7 4" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {series
        .filter((s) => s.focal && s.points.length > 0)
        .map((s) => {
          const last = s.points[s.points.length - 1];
          return (
            <circle key={`${s.id}-end`} cx={x(last.x)} cy={y(last.y)} r={4} fill="var(--primary)" />
          );
        })}

      {xTitle && (
        <text
          x={(pad.left + width - pad.right) / 2}
          y={height - 6}
          textAnchor="middle"
          fill="var(--ink-faint)"
          fontFamily={INTER}
          fontSize={10}
          fontWeight={600}
          letterSpacing="0.12em"
        >
          {xTitle.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Legend — HTML, so the labels stay selectable text                  */
/* ------------------------------------------------------------------ */

export type LegendItem = {
  id: string;
  label: string;
  kind: "line" | "dashed" | "swatch" | "band";
  focal?: boolean;
};

export function Legend({
  items,
  className,
}: {
  items: readonly LegendItem[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2 text-caption text-ink-soft", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span aria-hidden className="inline-flex h-3 w-6 shrink-0 items-center">
            {item.kind === "swatch" || item.kind === "band" ? (
              <span
                className={cn(
                  "block h-3 w-6 rounded-sm border",
                  item.kind === "band"
                    ? "border-primary/30 bg-primary/10"
                    : item.focal
                      ? "border-primary bg-primary-tint"
                      : "border-line-strong bg-paper",
                )}
              />
            ) : (
              <svg width="24" height="8" aria-hidden>
                <line
                  x1="0"
                  y1="4"
                  x2="24"
                  y2="4"
                  stroke={item.focal ? "var(--primary)" : "var(--ink-faint)"}
                  strokeWidth={item.focal ? 2 : 1.2}
                  strokeDasharray={item.kind === "dashed" ? "7 4" : undefined}
                />
              </svg>
            )}
          </span>
          <span className={item.focal ? "font-medium text-ink" : undefined}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 7: Write the barrel**

`components/diagrams/charts/index.ts`:

```ts
export {
  Axis,
  Bars,
  Legend,
  Line,
  ValueLabel,
  type AxisProps,
  type BarDatum,
  type BarsProps,
  type LegendItem,
  type LineProps,
  type LineSeries,
  type ValueLabelProps,
} from "./chart-primitives";
```

- [ ] **Step 8: Write the render test**

Create `components/diagrams/charts/chart-primitives.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Bars, Legend, Line } from "@/components/diagrams/charts";

describe("Bars", () => {
  it("draws one primary bar per datum and prints every value", () => {
    const { container, getByText } = render(
      <Bars
        data={[
          { id: "a", label: "Writing", value: 21 },
          { id: "b", label: "Coding", value: -12, focal: true },
        ]}
        diverging
        format={(v) => `${v > 0 ? "+" : "\u2212"}${Math.abs(v)}%`}
      />,
    );
    expect(container.querySelectorAll("rect[rx='4']")).toHaveLength(2);
    expect(getByText("Writing")).toBeInTheDocument();
    expect(getByText("+21%")).toBeInTheDocument();
  });

  it("adds a second dashed bar when a datum carries `compare`", () => {
    const { container } = render(
      <Bars data={[{ id: "a", label: "Autonomy", value: 84, compare: 45 }]} />,
    );
    expect(container.querySelectorAll("rect[stroke-dasharray]")).toHaveLength(1);
  });

  it("draws the reference line when one is given", () => {
    const { container, getByText } = render(
      <Bars
        data={[{ id: "a", label: "Reading", value: 560 }]}
        max={800}
        reference={{ value: 488, label: "global average" }}
      />,
    );
    expect(getByText("global average")).toBeInTheDocument();
    expect(container.querySelectorAll("line[stroke-dasharray='4 3']")).toHaveLength(1);
  });
});

describe("Line", () => {
  it("draws one path per series and a dot only on the focal one", () => {
    const { container } = render(
      <Line
        series={[
          {
            id: "base",
            label: "Baseline",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 12 },
            ],
            dashed: true,
          },
          {
            id: "path",
            label: "Your path",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 30 },
            ],
            focal: true,
          },
        ]}
        xDomain={[0, 1]}
        yDomain={[0, 40]}
      />,
    );
    expect(container.querySelectorAll("path[fill='none']")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });

  it("draws the risk band as a filled polygon when asked", () => {
    const { container } = render(
      <Line
        series={[
          {
            id: "path",
            label: "Your path",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 30 },
            ],
            focal: true,
          },
        ]}
        xDomain={[0, 1]}
        yDomain={[0, 40]}
        band={{ seriesId: "path", drop: 0.31 }}
      />,
    );
    expect(container.querySelectorAll("path[fill='var(--primary)']")).toHaveLength(1);
  });
});

describe("Legend", () => {
  it("renders one list item per key with its label as real text", () => {
    const { getAllByRole, getByText } = render(
      <Legend
        items={[
          { id: "base", label: "If you stay generic", kind: "dashed" },
          { id: "path", label: "Your path", kind: "line", focal: true },
        ]}
      />,
    );
    expect(getAllByRole("listitem")).toHaveLength(2);
    expect(getByText("Your path")).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Run the chart tests**

Run: `npx vitest run components/diagrams/charts`
Expected: PASS — 6 tests.

- [ ] **Step 10: Extend the icon registry**

In `components/ui/icon.tsx`, add these names to the `@phosphor-icons/react` import list, keeping the list alphabetical:

```
  ArrowDown,
  ArrowLeft,
  CaretLeft,
  Check,
  Copy,
  DownloadSimple,
  Info,
  Minus,
  Plus,
  Prohibit,
  ShieldSlash,
  Trash,
  TrendDown,
  Warning,
  WarningOctagon,
  X,
  XCircle,
```

Then add these entries to `REGISTRY`, keeping it alphabetical by key:

```ts
  "alert-triangle": Warning,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  ban: Prohibit,
  check: Check,
  "chevron-left": CaretLeft,
  copy: Copy,
  download: DownloadSimple,
  info: Info,
  minus: Minus,
  "octagon-alert": WarningOctagon,
  plus: Plus,
  "shield-off": ShieldSlash,
  trash: Trash,
  "trending-down": TrendDown,
  warning: Warning,
  x: X,
  "x-circle": XCircle,
```

Do not touch `ICON_NAMES`, `IconProps`, or the `Icon` function.

- [ ] **Step 11: Confirm every new name resolves**

Run:
```bash
node -e "for (const n of ['ArrowDown','ArrowLeft','CaretLeft','Check','Copy','DownloadSimple','Info','Minus','Plus','Prohibit','ShieldSlash','Trash','TrendDown','Warning','WarningOctagon','X','XCircle']) { console.log(n, require('node:fs').existsSync('node_modules/@phosphor-icons/react/dist/csr/'+n+'.es.js') ? 'OK' : 'MISSING'); }"
```
Expected: 17 lines, all `OK`.

Run: `npx vitest run components/ui/icon.test.tsx`
Expected: PASS — the existing icon test asserts shape, not registry length.

- [ ] **Step 12: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: `tsc` silent; `✓ Compiled successfully`.

- [ ] **Step 13: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/chart-scale.ts lib/chart-scale.test.ts components/diagrams/charts components/ui/icon.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(charts): add chart-scale helpers, token-driven chart primitives and the icons the lucide removal needs"
```
---

### Task 2: The three remaining first-wave diagrams

**Parallel group:** A

**Files:**
- Create: `design/diagrams/vetting-flow.html`, `design/diagrams/agency-vs-direct.html`, `design/diagrams/forgetting-curve.html`
- Create: `components/diagrams/vetting-flow.tsx`, `components/diagrams/agency-vs-direct.tsx`, `components/diagrams/forgetting-curve.tsx`
- Modify: `components/diagrams/index.ts`, `design/diagrams/build-preview.mjs`, `design/diagrams/README.md`, `data/learning.json`

**Interfaces:**
- Consumes: `DIAGRAM_MIN_WIDTH`, `INTER`, `type DiagramProps` from `@/components/diagrams/types`.
- Produces: `VettingFlow`, `AgencyVsDirect`, `ForgettingCurve` — server components with the shared `DiagramProps` shape; `DIAGRAMS` grows from four ids to seven (`"vetting-flow" | "agency-vs-direct" | "forgetting-curve"` added), so `DiagramId` widens.
- Produces, in `data/learning.json`: a top-level `forgettingCurve` object — `{ title, caption, axis: { top, bottom, x }, footnote, sources: [{ label, url }] }`.

**Diagram rules being applied (spec §7.2 + `design/diagrams/README.md`):** density 4/10; at most 9 nodes; one or two accent elements and the accent is `--primary` and only `--primary`; radius ≤ 8px; no shadows; bordered not filled; coordinates divisible by 4; arrows before nodes; every arrow label on an opaque paper mask; no invented numbers, and where a shape implies a quantity it does not have, the diagram says so in its own footnote.

**One documented deviation:** `vetting-flow` labels each "yes" branch (five short masked labels) but labels the "no" spine once, at the first gap, with a footnote reading *"Every downward arrow is a no."* Labelling all ten edges at 10px inside a 640-wide frame crosses the density budget; the footnote carries the same information at a fraction of the ink.

- [ ] **Step 1: Add the forgetting-curve copy and its sources to `data/learning.json`**

`data/learning.json` currently has no `source` objects anywhere, and the honesty doctrine forbids shipping a figure without one. Insert this block immediately after the `"creed"` key, before `"myth"`, keeping the file's two-space indentation:

```json
  "forgettingCurve": {
    "title": "What review does to what you remember",
    "caption": "Both lines start with everything. Only the reviewed one is still near the top a month later.",
    "axis": {
      "top": "All of it",
      "bottom": "Most of it gone",
      "x": "Review points"
    },
    "footnote": "Shape only, no numbers. The marks are the review points, not a time scale.",
    "sources": [
      {
        "label": "Murre & Dros, Replication and Analysis of Ebbinghaus' Forgetting Curve, PLoS ONE 2015",
        "url": "https://doi.org/10.1371/journal.pone.0120644"
      },
      {
        "label": "Roediger & Karpicke, Test-Enhanced Learning, Psychological Science 2006",
        "url": "https://doi.org/10.1111/j.1467-9280.2006.01693.x"
      }
    ]
  },
```

Run: `node -e "console.log(Object.keys(require('./data/learning.json')))"`
Expected: `[ 'kicker', 'headline', 'intro', 'creed', 'forgettingCurve', 'myth', 'works', 'feelsGood', 'focus', 'protocol', 'protocolRules' ]`

- [ ] **Step 2: Write `design/diagrams/vetting-flow.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vetting an opportunity, gate by gate</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --paper: #FFFFFF;
      --band: #F7F6FF;
      --ink: #0E1230;
      --ink-soft: #4A4F66;
      --ink-faint: #6B7087;
      --line: #E4E4EA;
      --line-strong: #CFCFD8;
      --primary: #4B4EF6;
      --primary-tint: #EEEDFF;
      --info: #026AA2;
      --font-display: 'Cabinet Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif;
      --font-text: 'Inter', ui-sans-serif, system-ui, sans-serif;
    }
    body {
      font-family: var(--font-text);
      background: var(--paper);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }
    .frame { max-width: 720px; width: 100%; }
    .eyebrow {
      font-family: var(--font-text);
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-faint);
      margin-bottom: 0.5rem;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.15;
      color: var(--ink);
      margin-bottom: 1.5rem;
    }
    svg { width: 100%; min-width: 560px; display: block; }
  </style>
</head>
<body>
  <div class="frame">
    <p class="eyebrow">Flowchart · Hire From PH</p>
    <h1>Vetting an opportunity, gate by gate</h1>

    <svg viewBox="0 0 640 616" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="vetting-flow-title vetting-flow-desc">
      <title id="vetting-flow-title">Vetting an opportunity, gate by gate</title>
      <desc id="vetting-flow-desc">A top-down flowchart. An opportunity enters at the top and passes five decision gates in order: does it ask for an upfront fee, does it promise guaranteed income, is it vague about the day-to-day work, does it pressure you to decide now, and does it have no verifiable company footprint. A yes at any gate exits right to a single stop. Only an opportunity that answers no to all five reaches the bottom, where the next step is to research it and then apply.</desc>

      <rect width="100%" height="100%" fill="#FFFFFF"/>

      <!-- Arrows first, so the nodes cap them. -->
      <defs>
        <marker id="vf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="#CFCFD8"/>
        </marker>
        <marker id="vf-arrow-accent" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="#4B4EF6"/>
        </marker>
      </defs>

      <g stroke="#CFCFD8" stroke-width="1" fill="none" marker-end="url(#vf-arrow)">
        <path d="M220,56 L220,84"/>
        <path d="M220,148 L220,172"/>
        <path d="M220,236 L220,260"/>
        <path d="M220,324 L220,348"/>
        <path d="M220,412 L220,436"/>
        <path d="M220,500 L220,528"/>
      </g>

      <!-- The "yes" rail: five horizontals feeding one vertical into the stop. -->
      <g stroke="#4B4EF6" stroke-width="1" fill="none">
        <path d="M328,116 L468,116"/>
        <path d="M328,204 L468,204"/>
        <path d="M328,292 L468,292"/>
        <path d="M328,380 L468,380"/>
        <path d="M328,468 L468,468"/>
        <path d="M468,116 L468,524" marker-end="url(#vf-arrow-accent)"/>
      </g>

      <!-- Start -->
      <rect x="120" y="16" width="200" height="40" rx="20" fill="#FFFFFF" stroke="#CFCFD8" stroke-width="1"/>
      <text x="220" y="41" text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#0E1230">An opportunity lands</text>

      <!-- Five gates -->
      <g fill="#FFFFFF" stroke="#CFCFD8" stroke-width="1">
        <polygon points="112,116 220,84 328,116 220,148"/>
        <polygon points="112,204 220,172 328,204 220,236"/>
        <polygon points="112,292 220,260 328,292 220,324"/>
        <polygon points="112,380 220,348 328,380 220,412"/>
        <polygon points="112,468 220,436 328,468 220,500"/>
      </g>
      <g text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="600" fill="#0E1230">
        <text x="220" y="113">Any upfront fee,</text>
        <text x="220" y="127">"training", "starter kit"?</text>
        <text x="220" y="201">Guaranteed income</text>
        <text x="220" y="215">or guaranteed hiring?</text>
        <text x="220" y="289">Vague or evasive about</text>
        <text x="220" y="303">the day-to-day work?</text>
        <text x="220" y="377">Pressure to decide,</text>
        <text x="220" y="391">pay, or sign right now?</text>
        <text x="220" y="465">No verifiable footprint,</text>
        <text x="220" y="479">no site, no reviews?</text>
      </g>

      <!-- Branch labels, each on an opaque mask -->
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500">
        <g fill="#FFFFFF">
          <rect x="340" y="104" width="26" height="16"/>
          <rect x="340" y="192" width="26" height="16"/>
          <rect x="340" y="280" width="26" height="16"/>
          <rect x="340" y="368" width="26" height="16"/>
          <rect x="340" y="456" width="26" height="16"/>
          <rect x="228" y="60" width="24" height="16"/>
        </g>
        <g fill="#4B4EF6">
          <text x="344" y="116">yes</text>
          <text x="344" y="204">yes</text>
          <text x="344" y="292">yes</text>
          <text x="344" y="380">yes</text>
          <text x="344" y="468">yes</text>
        </g>
        <text x="232" y="72" fill="#6B7087">no</text>
      </g>

      <!-- Stop, the one focal element -->
      <rect x="396" y="524" width="144" height="56" rx="8" fill="#EEEDFF" stroke="#4B4EF6" stroke-width="1.2"/>
      <text x="468" y="548" text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#0E1230">Stop. Walk away.</text>
      <text x="468" y="564" text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#4A4F66">No rate is worth it.</text>

      <!-- End -->
      <rect x="104" y="528" width="232" height="48" rx="20" fill="#FFFFFF" stroke="#CFCFD8" stroke-width="1"/>
      <text x="220" y="548" text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#0E1230">Research it, then apply</text>
      <text x="220" y="564" text-anchor="middle" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#4A4F66">A clean checklist is not proof.</text>

      <text x="16" y="606" fill="#6B7087" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" font-style="italic">Every downward arrow is a no. Gate order follows the weights in data/findwork.json.</text>
    </svg>
  </div>
</body>
</html>
```

- [ ] **Step 3: Write `components/diagrams/vetting-flow.tsx`**

```tsx
import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * Vetting an opportunity, gate by gate.
 *
 * Source of truth: design/diagrams/vetting-flow.html (diagram-design plugin,
 * profile `hirefromph`). Content from data/findwork.json (`vetting.redFlags`,
 * ordered by weight) and data/findwork.json (`research`).
 *
 * Accent budget: one element — the Stop terminal and the rail that feeds it
 * count as one focal group. Every other node is white with a hairline.
 *
 * No numbers anywhere: the gates are the five heaviest red flags, not a score.
 */

type Gate = { id: string; y: number; line1: string; line2: string };

const GATES: Gate[] = [
  { id: "upfront-fees", y: 116, line1: "Any upfront fee,", line2: '"training", "starter kit"?' },
  { id: "guaranteed-income", y: 204, line1: "Guaranteed income", line2: "or guaranteed hiring?" },
  { id: "vague-work", y: 292, line1: "Vague or evasive about", line2: "the day-to-day work?" },
  { id: "urgency", y: 380, line1: "Pressure to decide,", line2: "pay, or sign right now?" },
  { id: "no-footprint", y: 468, line1: "No verifiable footprint,", line2: "no site, no reviews?" },
];

export function VettingFlow({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 640 616"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id="vf-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--line-strong)" />
        </marker>
        <marker
          id="vf-arrow-accent"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)" />
        </marker>
      </defs>

      <g stroke="var(--line-strong)" strokeWidth="1" fill="none" markerEnd="url(#vf-arrow)">
        <path d="M220,56 L220,84" />
        <path d="M220,148 L220,172" />
        <path d="M220,236 L220,260" />
        <path d="M220,324 L220,348" />
        <path d="M220,412 L220,436" />
        <path d="M220,500 L220,528" />
      </g>

      <g stroke="var(--primary)" strokeWidth="1" fill="none">
        {GATES.map((gate) => (
          <path key={`yes-${gate.id}`} d={`M328,${gate.y} L468,${gate.y}`} />
        ))}
        <path d="M468,116 L468,524" markerEnd="url(#vf-arrow-accent)" />
      </g>

      <rect x="120" y="16" width="200" height="40" rx="20" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
      <text x="220" y="41" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="600" fill="var(--ink)">
        An opportunity lands
      </text>

      <g fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1">
        {GATES.map((gate) => (
          <polygon
            key={`gate-${gate.id}`}
            points={`112,${gate.y} 220,${gate.y - 32} 328,${gate.y} 220,${gate.y + 32}`}
          />
        ))}
      </g>
      <g textAnchor="middle" fontFamily={INTER} fontSize="11" fontWeight="600" fill="var(--ink)">
        {GATES.map((gate) => (
          <g key={`label-${gate.id}`}>
            <text x="220" y={gate.y - 3}>{gate.line1}</text>
            <text x="220" y={gate.y + 11}>{gate.line2}</text>
          </g>
        ))}
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="500">
        <g fill="var(--paper)">
          {GATES.map((gate) => (
            <rect key={`mask-${gate.id}`} x="340" y={gate.y - 12} width="26" height="16" />
          ))}
          <rect x="228" y="60" width="24" height="16" />
        </g>
        <g fill="var(--primary)">
          {GATES.map((gate) => (
            <text key={`yes-label-${gate.id}`} x="344" y={gate.y}>
              yes
            </text>
          ))}
        </g>
        <text x="232" y="72" fill="var(--ink-faint)">
          no
        </text>
      </g>

      <rect x="396" y="524" width="144" height="56" rx="8" fill="var(--primary-tint)" stroke="var(--primary)" strokeWidth="1.2" />
      <text x="468" y="548" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="700" fill="var(--ink)">
        Stop. Walk away.
      </text>
      <text x="468" y="564" textAnchor="middle" fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-soft)">
        No rate is worth it.
      </text>

      <rect x="104" y="528" width="232" height="48" rx="20" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
      <text x="220" y="548" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="600" fill="var(--ink)">
        Research it, then apply
      </text>
      <text x="220" y="564" textAnchor="middle" fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-soft)">
        A clean checklist is not proof.
      </text>

      <text
        x="16"
        y="606"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        Every downward arrow is a no.
      </text>
    </svg>
  );
}
```

- [ ] **Step 4: Write `design/diagrams/agency-vs-direct.html`**

Same `<head>` and `.frame` shell as Step 2 (copy it verbatim, change only the `<title>` and the `<h1>`), with this body:

```html
  <div class="frame">
    <p class="eyebrow">Swimlane · Hire From PH</p>
    <h1>Agency or direct: who holds the relationship</h1>

    <svg viewBox="0 0 720 288" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="avd-title avd-desc">
      <title id="avd-title">Agency or direct: who holds the relationship</title>
      <desc id="avd-desc">Two lanes across four steps — find the client, set the rate, do the work, keep the client. In the agency lane the agency finds the client, sets the rate and keeps the client, and you only do the work. In the direct lane you do all four, and keeping the client is the highlighted end of that lane.</desc>

      <rect width="100%" height="100%" fill="#FFFFFF"/>

      <!-- Column eyebrows -->
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="0.14em" fill="#6B7087">
        <text x="160" y="28">FIND</text>
        <text x="300" y="28">SET THE RATE</text>
        <text x="440" y="28">DO THE WORK</text>
        <text x="580" y="28">KEEP THE CLIENT</text>
      </g>

      <!-- Lane dividers -->
      <g stroke="#E4E4EA" stroke-width="1">
        <line x1="16" y1="56" x2="704" y2="56"/>
        <line x1="16" y1="172" x2="704" y2="172"/>
        <line x1="16" y1="272" x2="704" y2="272"/>
      </g>

      <!-- Lane labels -->
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="0.14em" fill="#4A4F66">
        <text x="16" y="120">AGENCY</text>
        <text x="16" y="232">DIRECT</text>
      </g>

      <!-- Arrows within each lane -->
      <defs>
        <marker id="avd-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="#CFCFD8"/>
        </marker>
      </defs>
      <g stroke="#CFCFD8" stroke-width="1" fill="none" marker-end="url(#avd-arrow)">
        <path d="M276,116 L300,116"/>
        <path d="M416,116 L440,116"/>
        <path d="M556,116 L580,116"/>
        <path d="M276,228 L300,228"/>
        <path d="M416,228 L440,228"/>
        <path d="M556,228 L580,228"/>
      </g>

      <!-- Agency lane -->
      <g fill="#FFFFFF" stroke="#CFCFD8" stroke-width="1">
        <rect x="160" y="88" width="116" height="56" rx="8"/>
        <rect x="300" y="88" width="116" height="56" rx="8"/>
        <rect x="440" y="88" width="116" height="56" rx="8"/>
        <rect x="580" y="88" width="116" height="56" rx="8"/>
      </g>
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#0E1230" text-anchor="middle">
        <text x="218" y="112">Agency finds</text>
        <text x="358" y="112">Agency sets</text>
        <text x="498" y="112">You do it</text>
        <text x="638" y="112">Agency keeps</text>
      </g>
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#4A4F66" text-anchor="middle">
        <text x="218" y="128">no selling for you</text>
        <text x="358" y="128">their rate card</text>
        <text x="498" y="128">under their name</text>
        <text x="638" y="128">you cannot take them</text>
      </g>

      <!-- Direct lane -->
      <g fill="#FFFFFF" stroke="#CFCFD8" stroke-width="1">
        <rect x="160" y="200" width="116" height="56" rx="8"/>
        <rect x="300" y="200" width="116" height="56" rx="8"/>
        <rect x="440" y="200" width="116" height="56" rx="8"/>
      </g>
      <!-- The one focal node -->
      <rect x="580" y="200" width="116" height="56" rx="8" fill="#EEEDFF" stroke="#4B4EF6" stroke-width="1.2"/>
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#0E1230" text-anchor="middle">
        <text x="218" y="224">You find</text>
        <text x="358" y="224">You set</text>
        <text x="498" y="224">You do it</text>
        <text x="638" y="224">You keep</text>
      </g>
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#4A4F66" text-anchor="middle">
        <text x="218" y="240">selling is your job</text>
        <text x="358" y="240">your price</text>
        <text x="498" y="240">under your name</text>
        <text x="638" y="240">referrals are yours</text>
      </g>

      <text x="16" y="284" fill="#6B7087" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" font-style="italic">Same four steps. The difference is who owns the last one.</text>
    </svg>
  </div>
```

- [ ] **Step 5: Write `components/diagrams/agency-vs-direct.tsx`**

```tsx
import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * Agency or direct: who holds the relationship.
 *
 * Source of truth: design/diagrams/agency-vs-direct.html (diagram-design
 * plugin, profile `hirefromph`). Content from data/clients.json (`roads.agency`
 * pros/cons and `roads.direct` pros/cons).
 *
 * Accent budget: one element — the Direct lane's "You keep" node, which is the
 * whole argument of the page.
 *
 * No numbers: the diagram states who owns each step, which is a structural
 * fact out of the page's own prose, never a rate or a margin.
 */

type Step = { id: string; x: number; agency: [string, string]; direct: [string, string]; column: string };

const STEPS: Step[] = [
  { id: "find", x: 160, column: "FIND", agency: ["Agency finds", "no selling for you"], direct: ["You find", "selling is your job"] },
  { id: "rate", x: 300, column: "SET THE RATE", agency: ["Agency sets", "their rate card"], direct: ["You set", "your price"] },
  { id: "work", x: 440, column: "DO THE WORK", agency: ["You do it", "under their name"], direct: ["You do it", "under your name"] },
  { id: "keep", x: 580, column: "KEEP THE CLIENT", agency: ["Agency keeps", "you cannot take them"], direct: ["You keep", "referrals are yours"] },
];

const FOCAL = "keep";

export function AgencyVsDirect({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 720 288"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id="avd-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--line-strong)" />
        </marker>
      </defs>

      <g fontFamily={INTER} fontSize="10" fontWeight="600" letterSpacing="0.14em" fill="var(--ink-faint)">
        {STEPS.map((step) => (
          <text key={`col-${step.id}`} x={step.x} y="28">
            {step.column}
          </text>
        ))}
      </g>

      <g stroke="var(--line)" strokeWidth="1">
        <line x1="16" y1="56" x2="704" y2="56" />
        <line x1="16" y1="172" x2="704" y2="172" />
        <line x1="16" y1="272" x2="704" y2="272" />
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="600" letterSpacing="0.14em" fill="var(--ink-soft)">
        <text x="16" y="120">AGENCY</text>
        <text x="16" y="232">DIRECT</text>
      </g>

      <g stroke="var(--line-strong)" strokeWidth="1" fill="none" markerEnd="url(#avd-arrow)">
        {STEPS.slice(1).map((step) => (
          <g key={`arrows-${step.id}`}>
            <path d={`M${step.x - 24},116 L${step.x},116`} />
            <path d={`M${step.x - 24},228 L${step.x},228`} />
          </g>
        ))}
      </g>

      {STEPS.map((step) => {
        const focal = step.id === FOCAL;
        return (
          <g key={`node-${step.id}`}>
            <rect x={step.x} y="88" width="116" height="56" rx="8" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
            <rect
              x={step.x}
              y="200"
              width="116"
              height="56"
              rx="8"
              fill={focal ? "var(--primary-tint)" : "var(--paper)"}
              stroke={focal ? "var(--primary)" : "var(--line-strong)"}
              strokeWidth={focal ? "1.2" : "1"}
            />
            <g textAnchor="middle" fontFamily={INTER}>
              <text x={step.x + 58} y="112" fontSize="12" fontWeight="600" fill="var(--ink)">
                {step.agency[0]}
              </text>
              <text x={step.x + 58} y="128" fontSize="10" fontWeight="500" fill="var(--ink-soft)">
                {step.agency[1]}
              </text>
              <text x={step.x + 58} y="224" fontSize="12" fontWeight="600" fill="var(--ink)">
                {step.direct[0]}
              </text>
              <text x={step.x + 58} y="240" fontSize="10" fontWeight="500" fill="var(--ink-soft)">
                {step.direct[1]}
              </text>
            </g>
          </g>
        );
      })}

      <text
        x="16"
        y="284"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        Same four steps. The difference is who owns the last one.
      </text>
    </svg>
  );
}
```

- [ ] **Step 6: Write `design/diagrams/forgetting-curve.html`**

Same `<head>` and `.frame` shell as Step 2, with this body:

```html
  <div class="frame">
    <p class="eyebrow">Line · Hire From PH</p>
    <h1>What review does to what you remember</h1>

    <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="fc-title fc-desc">
      <title id="fc-title">What review does to what you remember</title>
      <desc id="fc-desc">Two qualitative curves with no numbers. Both start with everything remembered. Without review the line falls steeply and keeps falling. With spaced retrieval the line falls, is pulled back up at each review point, and each fall is shallower than the last, so a month later it is still near the top.</desc>

      <rect width="100%" height="100%" fill="#FFFFFF"/>

      <!-- Axis frame: two hairlines only -->
      <g stroke="#CFCFD8" stroke-width="1">
        <line x1="132" y1="40" x2="132" y2="248"/>
        <line x1="132" y1="248" x2="688" y2="248"/>
      </g>

      <!-- Review markers -->
      <g stroke="#E4E4EA" stroke-width="0.8" stroke-dasharray="4 3">
        <line x1="271" y1="40" x2="271" y2="248"/>
        <line x1="410" y1="40" x2="410" y2="248"/>
        <line x1="549" y1="40" x2="549" y2="248"/>
      </g>

      <!-- Without review -->
      <polyline points="132,40 271,140 410,196 549,224 688,240" fill="none" stroke="#6B7087" stroke-width="1.2" stroke-dasharray="7 4" stroke-linejoin="round"/>

      <!-- With spaced retrieval: each vertical is a review pulling it back up -->
      <polyline points="132,40 271,140 271,56 410,120 410,60 549,104 549,56 688,88" fill="none" stroke="#4B4EF6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <g fill="#4B4EF6">
        <circle cx="271" cy="56" r="4"/>
        <circle cx="410" cy="60" r="4"/>
        <circle cx="549" cy="56" r="4"/>
        <circle cx="688" cy="88" r="4"/>
      </g>

      <!-- Axis words, not numbers -->
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#6B7087" text-anchor="end">
        <text x="124" y="44">All of it</text>
        <text x="124" y="252">Most of it gone</text>
      </g>
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="500" fill="#6B7087" text-anchor="middle">
        <text x="132" y="268">learned it</text>
        <text x="271" y="268">review 1</text>
        <text x="410" y="268">review 2</text>
        <text x="549" y="268">review 3</text>
        <text x="688" y="268">review 4</text>
      </g>

      <!-- Series labels on opaque masks -->
      <g font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="600">
        <rect x="440" y="70" width="152" height="16" fill="#FFFFFF"/>
        <text x="444" y="82" fill="#4B4EF6">with spaced retrieval</text>
        <rect x="472" y="212" width="120" height="16" fill="#FFFFFF"/>
        <text x="476" y="224" fill="#6B7087">without review</text>
      </g>

      <text x="16" y="310" fill="#6B7087" font-family="'Inter', ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" font-style="italic">Shape only, no numbers. The marks are the review points, not a time scale.</text>
    </svg>
  </div>
```

- [ ] **Step 7: Write `components/diagrams/forgetting-curve.tsx`**

```tsx
import learning from "@/data/learning.json";
import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * What review does to what you remember.
 *
 * Source of truth: design/diagrams/forgetting-curve.html (diagram-design
 * plugin, profile `hirefromph`). Copy and citations from
 * data/learning.json -> forgettingCurve; the page renders those sources with
 * <SourceList> directly under the DiagramFrame.
 *
 * Qualitative on purpose. There is no y scale and no elapsed time on the x
 * axis: the shape of the decay and the effect of a review are the claim, and
 * putting invented percentages on a curve would be exactly the kind of number
 * this site refuses to print. The footnote says so inside the figure.
 *
 * Accent budget: one series — the retrieval line and its review dots.
 */

const { axis, footnote } = learning.forgettingCurve;

const REVIEWS = [271, 410, 549] as const;

export function ForgettingCurve({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 720 320"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <g stroke="var(--line-strong)" strokeWidth="1">
        <line x1="132" y1="40" x2="132" y2="248" />
        <line x1="132" y1="248" x2="688" y2="248" />
      </g>

      <g stroke="var(--line)" strokeWidth="0.8" strokeDasharray="4 3">
        {REVIEWS.map((x) => (
          <line key={`review-${x}`} x1={x} y1="40" x2={x} y2="248" />
        ))}
      </g>

      <polyline
        points="132,40 271,140 410,196 549,224 688,240"
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth="1.2"
        strokeDasharray="7 4"
        strokeLinejoin="round"
      />

      <polyline
        points="132,40 271,140 271,56 410,120 410,60 549,104 549,56 688,88"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g fill="var(--primary)">
        <circle cx="271" cy="56" r="4" />
        <circle cx="410" cy="60" r="4" />
        <circle cx="549" cy="56" r="4" />
        <circle cx="688" cy="88" r="4" />
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-faint)" textAnchor="end">
        <text x="124" y="44">{axis.top}</text>
        <text x="124" y="252">{axis.bottom}</text>
      </g>
      <g fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-faint)" textAnchor="middle">
        <text x="132" y="268">learned it</text>
        <text x="271" y="268">review 1</text>
        <text x="410" y="268">review 2</text>
        <text x="549" y="268">review 3</text>
        <text x="688" y="268">review 4</text>
      </g>

      <g fontFamily={INTER} fontSize="11" fontWeight="600">
        <rect x="440" y="70" width="152" height="16" fill="var(--paper)" />
        <text x="444" y="82" fill="var(--primary)">
          with spaced retrieval
        </text>
        <rect x="472" y="212" width="120" height="16" fill="var(--paper)" />
        <text x="476" y="224" fill="var(--ink-faint)">
          without review
        </text>
      </g>

      <text
        x="16"
        y="310"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        {footnote}
      </text>
    </svg>
  );
}
```

- [ ] **Step 8: Register the three ids**

Replace `components/diagrams/index.ts` in full:

```ts
/**
 * Static diagrams, authored with the `diagram-design` plugin under the
 * `hirefromph` profile. The HTML source of truth for each lives in
 * design/diagrams/<id>.html; see design/diagrams/README.md.
 *
 * Every component is a server component and draws no accessible name of its
 * own — wrap it in `DiagramFrame`, which supplies the title, the caption, and
 * the horizontal scroll container.
 *
 * Data-driven charts live one level down, in components/diagrams/charts/.
 */
import type { ComponentType } from "react";

import { AgencyVsDirect } from "./agency-vs-direct";
import { FirstWeekTimeline } from "./first-week-timeline";
import { ForgettingCurve } from "./forgetting-curve";
import { HiringFunnel } from "./hiring-funnel";
import { JourneyMap } from "./journey-map";
import { MethodLoop } from "./method-loop";
import { VettingFlow } from "./vetting-flow";
import type { DiagramProps } from "./types";

export {
  AgencyVsDirect,
  FirstWeekTimeline,
  ForgettingCurve,
  HiringFunnel,
  JourneyMap,
  MethodLoop,
  VettingFlow,
};
export type { DiagramProps };

export const DIAGRAMS = {
  "journey-map": JourneyMap,
  "method-loop": MethodLoop,
  "hiring-funnel": HiringFunnel,
  "first-week-timeline": FirstWeekTimeline,
  "vetting-flow": VettingFlow,
  "agency-vs-direct": AgencyVsDirect,
  "forgetting-curve": ForgettingCurve,
} satisfies Record<string, ComponentType<DiagramProps>>;

export type DiagramId = keyof typeof DIAGRAMS;
```

- [ ] **Step 9: Teach the preview builder about the three new sources**

In `design/diagrams/build-preview.mjs`, append three entries to the `DIAGRAMS` array, after `first-week-timeline`:

```js
  {
    id: "vetting-flow",
    type: "Flowchart",
    title: "Vetting an opportunity, gate by gate",
    caption:
      "Read top to bottom. Every downward arrow is a no; a single yes exits right and ends the conversation. Only a clean run reaches the bottom, and even then the next step is research, not applying.",
    component: "VettingFlow",
  },
  {
    id: "agency-vs-direct",
    type: "Swimlane",
    title: "Agency or direct: who holds the relationship",
    caption:
      "Both lanes do the same four steps. Follow the last column: in the agency lane the client stays with the agency, in the direct lane the client is yours.",
    component: "AgencyVsDirect",
  },
  {
    id: "forgetting-curve",
    type: "Line",
    title: "What review does to what you remember",
    caption:
      "Both lines start with everything. The dashed one keeps falling; the solid one is pulled back up at each review, and each fall after that is shallower.",
    component: "ForgettingCurve",
  },
```

Run: `node design/diagrams/build-preview.mjs`
Expected: no output, and `design/diagrams/preview.html` now inlines seven SVGs.

- [ ] **Step 10: Run the plugin's own self-check on the three new sources**

Run:
```bash
python3 ~/.claude/plugins/cache/diagram-design/diagram-design/2.6.1/skills/diagram-design/scripts/self_check.py design/diagrams/vetting-flow.html design/diagrams/agency-vs-direct.html design/diagrams/forgetting-curve.html
```
Expected: PASS for all three. If `python3` is unavailable on this machine, record that in the Status block and rely on Step 11 instead — do not skip Step 11.

- [ ] **Step 11: Eyeball the preview**

Open `design/diagrams/preview.html` in a browser. Check, for each new diagram: exactly one accent element; no shadow; no node crowded against another; every arrow label sits on white; nothing renders below 10px at 1×.

- [ ] **Step 12: Extend the README**

In `design/diagrams/README.md`, change the heading `## The four diagrams` to `## The seven diagrams` and append three sections in the existing style:

```markdown
### `vetting-flow` — *Vetting an opportunity, gate by gate*

Flowchart, top-down. **8 nodes**: one start oval, five decision diamonds, one stop, one end. `viewBox 0 0 640 616`.

- **Accent (1):** the Stop terminal together with the rail that feeds it — one focal group.
- **Content:** `data/findwork.json` → `vetting.redFlags`, taken in weight order (the two weight-3 flags first), and `vetting.research` for the end node.
- **Documented deviation:** each "yes" branch is labelled; the "no" spine is labelled once at the first gap, with the footnote *"Every downward arrow is a no."* Ten labels at 10px inside a 640-wide frame breaks the density budget.

### `agency-vs-direct` — *Agency or direct: who holds the relationship*

Swimlane, two horizontal lanes across four columns. **8 nodes**. `viewBox 0 0 720 288`.

- **Accent (1):** the Direct lane's "You keep" node.
- **Content:** `data/clients.json` → `roads.agency.cons` ("You rarely own the relationship…") and `roads.direct.pros` ("You own the relationship and the portfolio").
- **No numbers.** The diagram states who owns each step. Margins and rates are on the page, with their sources; they never enter the figure.

### `forgetting-curve` — *What review does to what you remember*

Line, two qualitative series. `viewBox 0 0 720 320`.

- **Accent (1):** the spaced-retrieval line and its four review dots.
- **Qualitative on purpose:** no y scale, no elapsed time. The x marks are the review points, and the in-figure footnote says so. `/learn` renders the two citations beneath the frame with `<SourceList>`.
- **Content:** `data/learning.json` → `forgettingCurve` (copy, axis words, footnote, sources) and `works[spaced-repetition].how` (the 1 / 3 / 7 / 30 review rhythm the four marks stand for).
```

- [ ] **Step 13: Type-check, test, build**

Run: `npx tsc --noEmit && npm run test:unit && npm run build`
Expected: `tsc` silent; vitest PASS; `✓ Compiled successfully`.

- [ ] **Step 14: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/diagrams design/diagrams data/learning.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(diagrams): add the vetting flowchart, the agency-vs-direct swimlane and the cited forgetting curve"
```
---

## Batch A — the Guide archetype (Tasks 3–6)

Every Batch A task follows the same recipe, so it is stated once here and referenced by each task rather than repeated four times.

**The two Guide layouts.** A guide with **six or more body sections** gets the `Toc` rail:

```tsx
<Section>
  <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
    <Toc items={TOC} />
    <div className="flex min-w-0 flex-col gap-20">
      <section id="…"> … </section>
      …
    </div>
  </div>
</Section>
```

`Toc` is `hidden xl:block`, so below `xl` the grid collapses to a single column and the rail costs nothing. A guide with **five or fewer** body sections skips the rail and alternates `<Section>` / `<Section band="tint">` instead, never two tinted bands in a row.

**What every migrated guide does, without exception:**

| Old | New |
|---|---|
| `<PageHero kicker title titleWidth backdrop>` from `@/components/ui` | `<PageHero compact breadcrumb={getBreadcrumb(HREF)} kicker title accent lead>` from `@/components/layout` |
| `backdrop={<div className="… blur-3xl" />}` | deleted (§9) |
| `<Reveal>` / `<Reveal i={n}>` wrappers | unwrapped; the child is the element |
| `const accentText|accentBar|accentSoft|accentBorder` | `accent(id)` / `ACCENT[id]` from `@/lib/accent` |
| page-local `function Source({label,url})` | `<Source label url />` from `@/components/ui` |
| `<article className="… rounded-2xl border border-line bg-paper-2 … hover:-translate-y-1 hover:shadow-…">` | `<Card as="article" interactive?>` |
| `<Pill tone>` | `<Badge tone>` |
| `<Kicker>` from `@/components/ui` (still exported) | unchanged — it is a primitive now |
| `<ButtonLink href variant>` | `<Button href variant>` |
| `<ArrowLink href>` | `<Button href variant="link" iconEnd={<Icon name="arrow-up-right" size={16} />}>` |
| `className="kicker"` on a raw `<p>` | `<Kicker>` or `<Text size="caption" tone="faint">` |
| `font-display text-[length:var(--text-h2)]` on a raw `<h2>` | `<Heading level={2} size="h2">` |
| `text-sm leading-relaxed text-ink-soft` on a raw `<p>` | `<Text size="small">` |
| `bg-paper-3/60` / `bg-paper-2` section wrappers | `<Section band="tint">` / `<Section>` |
| a mid-page `bg-ink` panel | `<Section band="tint">` (§9: one navy band per page, and it is the CTA) |
| `import { … } from "lucide-react"` | `<Icon name="…" />`, per the mapping printed in the task |
| `dotgrid` overlays | deleted (§9) |
| `<Sparkles size={13} />` inside a pill | deleted (§9) |
| emoji flags | text labels (§9) |
| closing `<section>` with a bordered panel | `<Section band="tint">` + `<SectionHeading>` + `<CardGrid>` + `<Button>` |

**Every guide ends with:**

```tsx
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="…" /> */}

      <Section spacing="default">
        <PageFooterNav {...findNavNeighbours("…")} />
      </Section>
```

and carries the matching `Tldr` marker as the last child of `<PageHero>`. Both markers appear on all four Batch A tasks' pages **except `/clients`**, which is not on Phase 6's list — see the Phase 6 hand-off section above.

**Per-task verification (identical in all four):**

```bash
npx tsc --noEmit
npm run lint
npm run build
node scripts/verify-primitives.mjs | grep -E "^app.(method|learn|conduct)" || echo "clean"
```
Expected: `tsc` silent, lint clean, build green, and `clean` from the grep (substitute the task's own page names).

Plus the source-count guard, run once per page:

```bash
node -e "const s=require('fs').readFileSync('app/method/page.tsx','utf8'); console.log('Source tags:', (s.match(/<Source\b/g)||[]).length, '| SourceList tags:', (s.match(/<SourceList\b/g)||[]).length);"
```
Compare against the number of `source` objects the page's JSON actually carries. The task lists the expected count.

---

### Task 3: Batch A/1 — `/method`, `/learn`, `/conduct`

**Parallel group:** B

**Files:**
- Replace (whole file): `app/method/page.tsx`, `app/learn/page.tsx`, `app/conduct/page.tsx`

**Interfaces:**
- Consumes: `@/components/layout` (`CardGrid`, `PageFooterNav`, `PageHero`, `Section`, `SectionHeading`, `Toc`), `@/components/ui` (`Badge`, `Button`, `Callout`, `Card`, `DiagramFrame`, `Heading`, `Icon`, `Kicker`, `Source`, `SourceList`, `Step`, `StepList`, `Text`), `accent` from `@/lib/accent`, `findNavNeighbours`/`getBreadcrumb` from `@/lib/nav`, `MethodLoop` and `ForgettingCurve` from `@/components/diagrams/*`, `SelfAudit` / `StudyProtocol` / `IntegrityOath` (migrated separately in Batch C — their exported APIs do not change), `pageMeta`.
- Produces: nothing importable. Three page modules.

**Icon mapping for this task:**

| File | lucide | `<Icon name>` |
|---|---|---|
| `app/method/page.tsx` | `Check` | `check` |
| | `X` | `x` |
| | `Sparkles` | deleted (§9) |
| `app/learn/page.tsx` | `ArrowRight` | `arrow-right` |
| | `Check` | `check` |
| | `X` | `x` |
| | `Sparkles` | deleted (§9) |
| | `<Icon name="alert-triangle">` (already an `Icon`, previously falling back to `Sparkle`) | now resolves, thanks to Task 1 |
| `app/conduct/page.tsx` | `Check` | `check` |
| | `X` | `x` |
| | `ExternalLink` | absorbed by `<Source>` |

**Source counts to hold:** `/method` 0 · `/learn` 2 (both from the new `forgettingCurve` block, rendered by one `<SourceList>`) · `/conduct` 9 (6 principles + `philippineAnchor` + 4 cases… count them from the JSON in Step 7 and assert).

- [ ] **Step 1: Write `app/method/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import doctrine from "@/data/doctrine.json";
import { MethodLoop } from "@/components/diagrams/method-loop";
import { SelfAudit } from "@/components/self-audit";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/method";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "The Method, we teach you to build it",
  description:
    "We don't give you the file. We teach you to build it. Six principles, seven methods, and a self-audit, the resourcefulness curriculum behind everything on this platform.",
});

const TOC = [
  { id: "promise", label: "The promise" },
  { id: "loop", label: "The loop" },
  { id: "laws", label: "Six laws" },
  { id: "methods", label: "Seven methods" },
  { id: "unlearn", label: "Unlearn these" },
  { id: "audit", label: "Self-audit" },
];

/** Turn *word* markers in the JSON copy into an emphasised inline span. */
function withEmphasis(text: string): ReactNode[] {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-semibold not-italic text-ink">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

const PRINCIPLE_ACCENTS = ["signal", "info", "verified", "caution", "info", "signal"];

const [titleLead, titleMain] = doctrine.title.split(". ");

export default function MethodPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={doctrine.kicker}
        title={`${titleLead}.`}
        accent={titleMain}
        lead={doctrine.creed}
      >
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/method" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------ THE PROMISE */}
            <section id="promise" className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <Kicker>The promise</Kicker>
                <Text size="lead" tone="ink" className="mt-4 font-display" balance>
                  {doctrine.promise}
                </Text>
              </Card>
              <Callout tone="signal" title="Why it matters">
                {withEmphasis(doctrine.whyItMatters)}
              </Callout>
            </section>

            {/* --------------------------------------------------- THE LOOP */}
            <section id="loop">
              <DiagramFrame
                title="The method — seven ways to get unstuck"
                caption="Read left to right, then the second row right to left. The dashed arrow is the only one that goes backwards: when UNSTICK runs out of road, you time-box and return to ASK."
              >
                <MethodLoop />
              </DiagramFrame>
            </section>

            {/* ------------------------------------------------------- LAWS */}
            <section id="laws">
              <SectionHeading
                kicker="Six laws"
                title="The rules that make everything else make sense"
                lead="Not tips. Not suggestions. Every page on this platform obeys these six."
              />
              <CardGrid cols={3} className="mt-12">
                {doctrine.principles.map((p, idx) => {
                  const a = accent(PRINCIPLE_ACCENTS[idx]);
                  return (
                    <Card key={p.n} as="article" padding="lg">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-h2 text-line-strong">0{p.n}</span>
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={p.icon} size={20} />
                        </span>
                      </div>
                      <Heading level={3} size="h5" className="mt-5">
                        {p.title}
                      </Heading>
                      <Text size="small" className="mt-3 flex-1">
                        {p.desc}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ---------------------------------------------------- METHODS */}
            <section id="methods">
              <SectionHeading
                kicker="The curriculum"
                title="Seven methods. Master these and you're never stuck."
                lead="This is the actual skill this platform teaches, not a niche, not a tool, but how to figure anything out. Read each one, then run the drill."
              />

              <div className="mt-12 flex flex-col">
                {doctrine.methods.map((m, index) => {
                  const a = accent(m.accent);
                  return (
                    <article
                      key={m.id}
                      className={cn(
                        "grid gap-8 py-14 lg:grid-cols-[280px_1fr] lg:gap-14",
                        index > 0 && "border-t border-line",
                      )}
                    >
                      <div>
                        <span className={cn("text-kicker uppercase", a.text)}>
                          Method 0{index + 1}
                        </span>
                        <Heading level={3} size="h3" className="mt-3" balance>
                          {m.name}
                        </Heading>
                        <Text size="small" tone="soft" className="mt-3 font-medium">
                          {m.tagline}
                        </Text>
                        <span
                          className={cn(
                            "mt-6 inline-grid h-12 w-12 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={m.icon} size={22} />
                        </span>
                      </div>

                      <div>
                        <Text size="lead" tone="ink" className="font-display" balance>
                          {m.summary}
                        </Text>

                        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                          {m.steps.map((step, i) => (
                            <li key={step.title}>
                              <Card padding="sm" className="h-full">
                                <span className="font-display text-h4 text-line-strong">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <Text size="base" tone="ink" as="span" className="mt-2 font-semibold">
                                  {step.title}
                                </Text>
                                <Text size="small" className="mt-1.5">
                                  {step.desc}
                                </Text>
                              </Card>
                            </li>
                          ))}
                        </ol>

                        <Callout tone={m.accent} title="Do this now" className="mt-6">
                          {m.drill}
                        </Callout>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------- ANTI-PATTERNS */}
            <section id="unlearn">
              <SectionHeading
                kicker="Unlearn these"
                title={doctrine.antiPatterns.title}
                lead={doctrine.antiPatterns.intro}
              />
              <Card padding="none" className="mt-12">
                <div className="grid grid-cols-1 gap-x-8 border-b border-line px-6 py-4 text-kicker uppercase text-ink-faint sm:grid-cols-2 lg:px-8">
                  <span>Spoon-fed habit</span>
                  <span className="hidden sm:block">Resourceful move</span>
                </div>
                <div className="divide-y divide-line">
                  {doctrine.antiPatterns.items.map((item) => (
                    <div
                      key={item.bad}
                      className="grid gap-3 p-6 sm:grid-cols-2 sm:gap-6 lg:p-8"
                    >
                      <div className="flex items-start gap-3">
                        <Icon name="x" size={16} className="mt-1 shrink-0 text-coral" />
                        <Text size="base" className="line-through decoration-coral/50 decoration-2">
                          {item.bad}
                        </Text>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="check" size={16} className="mt-1 shrink-0 text-verified" />
                        <Text size="base" tone="ink" className="font-medium">
                          {item.good}
                        </Text>
                      </div>
                      <Text size="small" tone="faint" className="italic sm:col-span-2">
                        {item.why}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* ------------------------------------------------- SELF-AUDIT */}
            <section id="audit">
              <SectionHeading
                kicker="Check yourself"
                title={doctrine.selfAudit.title}
                lead={doctrine.selfAudit.intro}
              />
              <Card padding="lg" className="mt-12">
                <SelfAudit
                  statements={doctrine.selfAudit.statements}
                  levels={doctrine.selfAudit.levels}
                />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------------- CTA */}
      <Section band="tint">
        <SectionHeading
          align="center"
          kicker="The method, applied"
          title="Now build something from a blank page."
          lead="Reading the method changes nothing by itself. The labs are where you actually use it."
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/build">Open the build labs</Button>
          <Button href="/start" variant="outline">
            Start your path
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/method" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/learn/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import learning from "@/data/learning.json";
import { ForgettingCurve } from "@/components/diagrams/forgetting-curve";
import { StudyProtocol } from "@/components/study-protocol";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  SourceList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/learn";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "How to Learn",
  description: learning.intro,
});

type Work = {
  id: string;
  name: string;
  what: string;
  why: string;
  how: string;
  effort: string;
  payoff: string;
  icon: string;
  accent: string;
};
type FeelsGoodItem = {
  id: string;
  habit: string;
  whyItFeelsGood: string;
  whyItFails: string;
  doInstead: string;
};
type FocusItem = {
  name: string;
  what: string;
  howTo: string;
  bestFor: string;
  watchOut: string;
};

const TOC = [
  { id: "myth", label: "The myth" },
  { id: "curve", label: "The curve" },
  { id: "works", label: "What works" },
  { id: "feels-good", label: "Feels productive" },
  { id: "focus", label: "Focus systems" },
  { id: "protocol", label: "Your protocol" },
];

const FEATURED_IDS = ["retrieval-practice", "spaced-repetition"];
const works = learning.works as Work[];
const featuredWorks = works.filter((w) => FEATURED_IDS.includes(w.id));
const restWorks = works.filter((w) => !FEATURED_IDS.includes(w.id));

export default function LearnPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={learning.kicker}
        title={learning.headline}
        lead={learning.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {learning.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/learn" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* -------------------------------------------- MYTH, KILLED FIRST */}
            <section id="myth">
              <SectionHeading
                kicker="Killed first, on purpose"
                title="The myth we're not going to let slide"
                lead="This is the clearest worked example of the VET method on the whole platform: a belief that's popular, intuitive, and wrong. Debunking it up front is what earns the rest of this page its credibility."
              />

              <Card padding="lg" className="mt-10">
                <Badge tone="coral" variant="outline">
                  <Icon name="x" size={13} /> Myth
                </Badge>
                <Heading
                  level={3}
                  size="h3"
                  className="mt-6 max-w-3xl text-ink-faint line-through decoration-coral decoration-2"
                  balance
                >
                  {learning.myth.claim}
                </Heading>

                <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-3">
                  <div>
                    <Kicker>Why people believe it</Kicker>
                    <Text size="small" className="mt-3">
                      {learning.myth.whyPeopleBelieveIt}
                    </Text>
                  </div>
                  <div>
                    <Kicker tone="verified">What the evidence says</Kicker>
                    <Text size="small" tone="ink" className="mt-3">
                      {learning.myth.whatTheEvidenceSays}
                    </Text>
                  </div>
                  <div>
                    <Kicker>Do this instead</Kicker>
                    <Text size="small" className="mt-3">
                      {learning.myth.whatToDoInstead}
                    </Text>
                  </div>
                </div>

                <Callout
                  tone="signal"
                  icon="shield-check"
                  title="VET lesson, who profits?"
                  className="mt-10"
                >
                  {learning.myth.vetLesson}
                </Callout>
              </Card>
            </section>

            {/* ------------------------------------------------------- CURVE */}
            <section id="curve">
              <DiagramFrame
                title={learning.forgettingCurve.title}
                caption={learning.forgettingCurve.caption}
              >
                <ForgettingCurve />
              </DiagramFrame>
              <SourceList sources={learning.forgettingCurve.sources} className="mt-4" />
            </section>

            {/* ---------------------------------------- WHAT ACTUALLY WORKS */}
            <section id="works">
              <SectionHeading
                kicker="The curriculum"
                title="What actually works"
                lead="Eight techniques with real evidence behind them, not tips, findings. The first two carry the most weight in the research, so lean on them the hardest."
              />

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {featuredWorks.map((w) => {
                  const a = accent(w.accent);
                  return (
                    <Card key={w.id} as="article" padding="lg">
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "grid h-14 w-14 shrink-0 place-items-center rounded-md",
                            a.tint,
                            a.text,
                          )}
                        >
                          <Icon name={w.icon} size={24} />
                        </span>
                        <div>
                          <span className={cn("text-kicker uppercase", a.text)}>
                            Strongest evidence
                          </span>
                          <Heading level={3} size="h4" className="mt-1">
                            {w.name}
                          </Heading>
                        </div>
                      </div>
                      <Text size="small" tone="ink" className="mt-5">
                        {w.what}
                      </Text>
                      <Text size="small" className="mt-3">
                        {w.why}
                      </Text>
                      <Callout tone={w.accent} className="mt-5">
                        <span className="font-semibold">How: </span>
                        {w.how}
                      </Callout>
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                        <Badge>Effort: {w.effort}</Badge>
                        <Badge tone={w.accent as "signal"}>Payoff: {w.payoff}</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <CardGrid cols={3} className="mt-6">
                {restWorks.map((w) => {
                  const a = accent(w.accent);
                  return (
                    <Card key={w.id} as="article">
                      <span
                        className={cn(
                          "grid h-11 w-11 place-items-center rounded-sm",
                          a.tint,
                          a.text,
                        )}
                      >
                        <Icon name={w.icon} size={19} />
                      </span>
                      <Heading level={3} size="h5" className="mt-4">
                        {w.name}
                      </Heading>
                      <Text size="small" className="mt-2">
                        {w.what}
                      </Text>
                      <Text size="caption" tone="faint" className="mt-3 flex-1">
                        {w.how}
                      </Text>
                      <Text size="caption" tone="faint" className="mt-4 border-t border-line pt-4">
                        Effort: {w.effort} · Payoff: {w.payoff}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ----------------------------------- FEELS PRODUCTIVE, ISN'T */}
            <section id="feels-good">
              <SectionHeading
                kicker="The self-deception is the point"
                title="What feels productive but isn't"
                lead="Every habit below feels like studying while you're doing it. That feeling is exactly why it survives, it's comfortable, and comfort is not evidence."
              />
              <div className="mt-10 flex flex-col gap-4">
                {(learning.feelsGood as FeelsGoodItem[]).map((item) => (
                  <Card key={item.id} padding="none">
                    <div className="grid lg:grid-cols-2">
                      <div className="bg-coral-tint p-6">
                        <div className="flex items-center gap-2">
                          <Icon name="x" size={16} className="shrink-0 text-coral" />
                          <Heading level={3} size="h5" className="text-coral" balance>
                            {item.habit}
                          </Heading>
                        </div>
                        <Text size="small" tone="ink" className="mt-3">
                          <span className="font-semibold">Feels like progress: </span>
                          {item.whyItFeelsGood}
                        </Text>
                        <Text size="small" className="mt-2">
                          <span className="font-semibold">Why it fails: </span>
                          {item.whyItFails}
                        </Text>
                      </div>
                      <div className="bg-verified-tint p-6">
                        <div className="flex items-center gap-2">
                          <Icon name="check" size={16} className="shrink-0 text-verified" />
                          <Heading level={3} size="h5" className="text-verified">
                            Do this instead
                          </Heading>
                        </div>
                        <Text size="small" tone="ink" className="mt-3">
                          {item.doInstead}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* ----------------------------------------------- FOCUS SYSTEMS */}
            <section id="focus">
              <SectionHeading
                kicker="A different job entirely"
                title="Focus systems, not learning methods"
                lead="Everything above builds knowledge. Everything below manages your attention and your clock. Confusing the two is the most common mistake on this page's topic, pair one system from here with a few techniques from above, and you have a real session."
              />
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {(learning.focus as FocusItem[]).map((f) => (
                  <Card key={f.name} as="article">
                    <Heading level={3} size="h4">
                      {f.name}
                    </Heading>
                    <Text size="small" className="mt-2">
                      {f.what}
                    </Text>
                    <Callout tone="info" className="mt-4">
                      <span className="font-semibold">How: </span>
                      {f.howTo}
                    </Callout>
                    <Text size="caption" tone="faint" className="mt-3">
                      <span className="font-medium text-ink">Best for: </span>
                      {f.bestFor}
                    </Text>
                    <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
                      <Icon
                        name="alert-triangle"
                        size={14}
                        className="mt-0.5 shrink-0 text-caution"
                      />
                      <Text size="caption">{f.watchOut}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* -------------------------------------------- PROTOCOL BUILDER */}
            <section id="protocol">
              <SectionHeading
                align="center"
                kicker="Build it yourself, from your own constraints"
                title="Your study protocol"
                lead={learning.protocol.intro}
              />
              <Card padding="lg" className="mt-12">
                <StudyProtocol />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- CLOSE */}
      <Section band="tint">
        <SectionHeading
          align="center"
          kicker="Evidence, not vibes"
          title="Now go apply it to real work."
          lead="A technique changes nothing until you run it on something real. The method page covers how to teach yourself any skill, the task board is where you put retrieval, spacing, and feedback to work today."
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/method">See the full method</Button>
          <Button href="/tasks" variant="outline">
            Try the task board
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/learn" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Write `app/conduct/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import conduct from "@/data/conduct.json";
import { IntegrityOath } from "@/components/integrity-oath";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/conduct";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Conduct & Integrity",
  description:
    "The documented behaviour that gets remote professionals fired, sued, and delisted, and the oath that keeps you out of it. Do's, don'ts, real cases, and an oath you write yourself.",
});

export default function ConductPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Conduct · Integrity · The oath"
        title="Nobody is watching you work."
        accent="That is the entire test."
        lead={conduct.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {conduct.creed}
        </Callout>
        <Text size="small" className="max-w-2xl">
          {conduct.whyItMatters}
        </Text>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/conduct" /></Section> */}
      </PageHero>

      {/* --------------------------------------------------------- PRINCIPLES */}
      <Section band="tint">
        <SectionHeading
          kicker="Six principles · borrowed from the codes that govern real professions"
          title="These rules are older than remote work"
          lead="None of this was invented for freelancers. Engineers, doctors, and accountants have been bound by these exact clauses for decades, we've simply translated them into the situations you'll actually meet."
        />
        <CardGrid cols={3} className="mt-12">
          {conduct.principles.map((p) => (
            <Card key={p.id} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={p.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-5">
                {p.name}
              </Heading>
              <Text size="small" tone="ink" className="mt-2 font-medium">
                {p.tagline}
              </Text>
              <Text size="small" className="mt-3 flex-1">
                {p.body}
              </Text>
              <div className="mt-5 border-t border-line pt-4">
                <Source label={p.source.label} url={p.source.url} />
              </div>
            </Card>
          ))}
        </CardGrid>

        <Callout tone="verified" title={conduct.philippineAnchor.title} className="mt-8">
          <Text size="small" className="max-w-3xl">
            {conduct.philippineAnchor.body}
          </Text>
          <Source
            label={conduct.philippineAnchor.source.label}
            url={conduct.philippineAnchor.source.url}
            className="mt-5"
          />
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- CASES */}
      <Section>
        <SectionHeading
          kicker="The price list"
          title="What it actually costs when this goes wrong"
          lead={conduct.casesIntro}
        />

        <div className="mt-12 flex flex-col gap-5">
          {conduct.cases.map((c) => {
            const a = accent(c.accent);
            return (
              <Card key={c.id} as="article" padding="lg">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <Badge tone={c.accent as "signal"} variant="outline">
                      {c.tag}
                    </Badge>
                    <Heading level={3} size="h3" className="mt-4" balance>
                      {c.title}
                    </Heading>
                    <Text size="caption" tone="faint" className="mt-3 tabular-nums">
                      {c.when}
                    </Text>
                    <Source label={c.source.label} url={c.source.url} className="mt-5" />
                  </div>

                  <div className="flex flex-col gap-4">
                    <Text size="small">{c.what}</Text>
                    <Card padding="sm">
                      <Text size="small" tone="ink">
                        <span className="font-semibold">The sting:</span> {c.sting}
                      </Text>
                    </Card>
                    <Text
                      size="small"
                      tone="ink"
                      className={cn("border-l-2 pl-4 font-medium", a.border)}
                    >
                      {c.lesson}
                    </Text>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------- DOS/DONTS */}
      <Section band="tint">
        <SectionHeading
          kicker="Do's and don'ts"
          title="The line is never blurry in the moment. It gets blurry in the retelling."
          lead={conduct.dosDontsIntro}
        />

        <div className="mt-14 flex flex-col gap-5">
          {conduct.dosDonts.map((area) => {
            const a = accent(area.accent);
            return (
              <Card key={area.id} as="article" padding="lg" onBand>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                      a.fill,
                    )}
                  >
                    <Icon name={area.icon} size={20} />
                  </span>
                  <Heading level={3} size="h4">
                    {area.area}
                  </Heading>
                </div>

                <div className="mt-7 grid gap-8 md:grid-cols-2">
                  <div>
                    <Kicker tone="verified">Do</Kicker>
                    <ul className="mt-4 flex flex-col gap-3">
                      {area.dos.map((d) => (
                        <li key={d} className="flex gap-3">
                          <Icon
                            name="check"
                            size={15}
                            className="mt-0.5 shrink-0 text-verified"
                          />
                          <Text size="small" as="span">
                            {d}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Kicker tone="coral">Never</Kicker>
                    <ul className="mt-4 flex flex-col gap-3">
                      {area.donts.map((d) => (
                        <li key={d} className="flex gap-3">
                          <Icon name="x" size={15} className="mt-0.5 shrink-0 text-coral" />
                          <Text size="small" as="span">
                            {d}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------------- OATH */}
      <Section>
        <SectionHeading
          align="center"
          title={conduct.oath.title}
          lead={conduct.oath.lead}
          size="display"
        />
        <div className="mt-6 flex justify-center">
          <Badge tone="verified">Nothing to download. Nothing uploaded.</Badge>
        </div>
        <Card padding="lg" className="mx-auto mt-12 max-w-3xl">
          <IntegrityOath />
        </Card>
      </Section>

      {/* ------------------------------------------------------------ HONESTY */}
      <Section band="tint" size="narrow">
        <Callout title={conduct.honesty.title}>
          <Text size="small">{conduct.honesty.body}</Text>
          <Source
            label={conduct.honesty.source.label}
            url={conduct.honesty.source.url}
            className="mt-5"
          />
        </Callout>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/conduct" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 4: Confirm no `Reveal`, no lucide, no accent map survives in the three files**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Soft|Border)|function Source\(|container-x|kicker\"|paper-2|paper-3|bg-signal|text-signal|rounded-2xl|blur-|hover:-translate" app/method/page.tsx app/learn/page.tsx app/conduct/page.tsx || echo "clean"
```
Expected: `clean`.

- [ ] **Step 5: Confirm the practice insertion points are present, twice per page**

Run:
```bash
grep -c "practice:" app/method/page.tsx app/learn/page.tsx app/conduct/page.tsx
```
Expected: `2` for each file.

- [ ] **Step 6: Confirm the diagram frames carry a caption**

Run:
```bash
grep -n "DiagramFrame" app/method/page.tsx app/learn/page.tsx
```
Expected: two `<DiagramFrame` opens (method-loop, forgetting-curve), each followed by `title=` and `caption=` on the next lines.

- [ ] **Step 7: Confirm every source survived**

Run:
```bash
node -e "
const fs=require('fs');
const count=(o)=>JSON.stringify(o).match(/\"source(2)?\":\{/g)?.length ?? 0;
console.log('conduct.json sources:', count(require('./data/conduct.json')));
console.log('page <Source> tags:', (fs.readFileSync('app/conduct/page.tsx','utf8').match(/<Source\b/g)||[]).length);
console.log('learning.json forgettingCurve sources:', require('./data/learning.json').forgettingCurve.sources.length);
"
```
Expected: the `<Source>` count in `app/conduct/page.tsx` equals the `conduct.json` source count (principles + `philippineAnchor` + cases + `honesty`). `/learn` renders its two via one `<SourceList>`.

- [ ] **Step 8: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: silent, clean, `✓ Compiled successfully`.

- [ ] **Step 9: Verify the three pages are primitive-clean**

Run: `node scripts/verify-primitives.mjs | grep -E "app.(method|learn|conduct)" || echo "clean"`
Expected: `clean`.

- [ ] **Step 10: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/method/page.tsx app/learn/page.tsx app/conduct/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(guides): migrate /method, /learn and /conduct to the Guide archetype"
```
---

### Task 4: Batch A/2 — `/english`, `/ai-first`

**Parallel group:** B

**Files:**
- Replace (whole file): `app/english/page.tsx`, `app/ai-first/page.tsx`

**Interfaces:**
- Consumes: the same layout/ui set as Task 3, plus `Bars` from `@/components/diagrams/charts` (English's EF EPI baseline is the one numeric series on either page) and `Stat`/`StatStrip` for the AI-First shift figures. `CommsLab` is migrated in Batch C; its export signature does not change.
- Produces: nothing importable. Two page modules.

**Icon mapping for this task:**

| File | lucide | `<Icon name>` |
|---|---|---|
| `app/english/page.tsx` | `ArrowRight` | `arrow-right` |
| | `ExternalLink` | absorbed by `<Source>` |
| | `ShieldOff` | `shield-off` |
| `app/ai-first/page.tsx` | `ExternalLink` | absorbed by `<Source>` / `<Button variant="link" external>` |

**Chart note (`/english`):** the four EF EPI skill scores were hand-drawn `<div>` bars with an absolutely-positioned average marker. They become one `<Bars>` with `max={800}`, `reference={{ value: 488, label: "global average" }}` and `focal` on the weakest skill, inside a `<DiagramFrame>` with the existing `english.baseline.source` rendered underneath. The two constants `MAX_SCORE` and `GLOBAL_AVG` stay in the page — they are the chart's domain, not styling.

**Source counts to hold:** `/english` — one per `threeCauses.causes[]` (3), one for `baseline`, one per `frameworks.items[].source` where present, one for `speaking`. `/ai-first` — one per `shift.stats[]` (3), one for `fluency`, one for `agentic`.

- [ ] **Step 1: Write `app/english/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import english from "@/data/english.json";
import { Bars } from "@/components/diagrams/charts";
import { CommsLab } from "@/components/comms-lab";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/english";

/** The chart's domain, not styling: EF EPI is scored out of 800 with a published global mean. */
const MAX_SCORE = 800;
const GLOBAL_AVG = 488;

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "English at Work",
  description:
    "Filipinos already write English better than most of the world. What costs you money is smaller: hedges, reflex apologies, and deference markers. Audit a real client message, learn four structures, and hear the honest priority order for speaking.",
});

const TOC = [
  { id: "baseline", label: "The baseline" },
  { id: "causes", label: "Three causes" },
  { id: "honesty", label: "No spin" },
  { id: "banlist", label: "The banlist" },
  { id: "lab", label: "The lab" },
  { id: "frameworks", label: "Four structures" },
  { id: "speaking", label: "Speaking" },
  { id: "resources", label: "Resources" },
];

export default function EnglishPage() {
  const weakest = Math.min(...english.baseline.scores.map((s) => s.value));

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="English · Pragmatics · Speaking"
        title="Your English is not the problem."
        accent="The habits around it are."
        lead={english.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {english.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/english" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ---------------------------------------------------- BASELINE */}
            <section id="baseline">
              <SectionHeading
                kicker={english.baseline.kicker}
                title={english.baseline.title}
                lead={english.baseline.body}
              />

              <DiagramFrame
                title={`EF EPI 2025 · Philippines, out of ${MAX_SCORE}`}
                caption={`The dashed line is the global average, ${GLOBAL_AVG}. Every one of the four scores clears it; the highlighted bar is only the weakest of four strong results.`}
                className="mt-10"
              >
                <Bars
                  data={english.baseline.scores.map((s) => ({
                    id: s.skill,
                    label: s.skill,
                    value: s.value,
                    note: s.value === weakest ? "weakest of the four" : undefined,
                    focal: s.value === weakest,
                  }))}
                  max={MAX_SCORE}
                  reference={{ value: GLOBAL_AVG, label: "global average" }}
                  format={(v) => String(v)}
                />
              </DiagramFrame>

              <Source
                label={english.baseline.source.label}
                url={english.baseline.source.url}
                className="mt-4"
              />

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {english.baseline.scores.map((s) => (
                  <li key={s.skill}>
                    <Card padding="sm" className="h-full">
                      <div className="flex items-baseline justify-between gap-3">
                        <Text size="small" tone="ink" as="span" className="font-semibold">
                          {s.skill}
                        </Text>
                        <span className="font-display text-h5 tabular-nums text-ink">
                          {s.value}
                        </span>
                      </div>
                      <Text size="caption" className="mt-2">
                        {s.note}
                      </Text>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            {/* ------------------------------------------------ THREE CAUSES */}
            <section id="causes">
              <SectionHeading
                kicker={english.threeCauses.kicker}
                title={english.threeCauses.title}
                lead={english.threeCauses.lead}
              />

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {english.threeCauses.causes.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article" padding="lg">
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("text-caption font-semibold tabular-nums", a.text)}>
                          {c.n}
                        </span>
                        {c.yours ? (
                          <Badge tone={c.accent as "signal"}>Yours to fix</Badge>
                        ) : (
                          <Badge tone="info">
                            <Icon name="shield-off" size={12} />
                            Not yours to fix
                          </Badge>
                        )}
                      </div>

                      <Heading level={3} size="h4" className="mt-5" balance>
                        {c.title}
                      </Heading>
                      <Text size="small" className="mt-4 flex-1">
                        {c.what}
                      </Text>
                      <Text
                        size="small"
                        tone="ink"
                        className={cn("mt-5 border-l-2 pl-4 font-medium", a.border)}
                      >
                        {c.fix}
                      </Text>
                      <div className="mt-5 border-t border-line pt-4">
                        <Source label={c.source.label} url={c.source.url} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* ----------------------------------------------------- HONESTY */}
            <section id="honesty">
              <SectionHeading kicker="No spin" title={english.honesty.title} />
              <StepList className="mt-12">
                {english.honesty.points.map((p, idx) => (
                  <Step key={p} n={idx + 1} title={p} />
                ))}
              </StepList>
            </section>

            {/* ----------------------------------------------------- BANLIST */}
            <section id="banlist">
              <SectionHeading
                kicker={english.banlist.kicker}
                title={english.banlist.title}
                lead={english.banlist.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {english.banlist.categories.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article">
                      <span aria-hidden className={cn("h-1 w-10 rounded-pill", a.fill)} />
                      <Heading level={3} size="h4" className="mt-5">
                        {c.label}
                      </Heading>
                      <Text size="small" className="mt-3">
                        {c.why}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* --------------------------------------------------------- LAB */}
            <section id="lab">
              <SectionHeading
                kicker={english.lab.kicker}
                title={english.lab.title}
                lead={english.lab.lead}
              />
              <Card padding="lg" className="mt-12">
                <CommsLab />
              </Card>
            </section>

            {/* -------------------------------------------------- FRAMEWORKS */}
            <section id="frameworks">
              <SectionHeading
                kicker={english.frameworks.kicker}
                title={english.frameworks.title}
                lead={english.frameworks.lead}
              />

              <div className="mt-12 flex flex-col gap-5">
                {english.frameworks.items.map((f) => {
                  const a = accent(f.accent);
                  return (
                    <Card key={f.id} as="article" padding="lg">
                      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                        <div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                                a.fill,
                              )}
                            >
                              <Icon name={f.icon} size={20} />
                            </span>
                            <div>
                              <Heading level={3} size="h4">
                                {f.name}
                              </Heading>
                              <Text size="caption" tone="faint">
                                {f.expand}
                              </Text>
                            </div>
                          </div>

                          <Kicker className="mt-6">Use it for</Kicker>
                          <Text size="small" className="mt-1.5">
                            {f.use}
                          </Text>

                          <Text
                            size="small"
                            tone="ink"
                            className={cn("mt-5 border-l-2 pl-4", a.border)}
                          >
                            {f.rule}
                          </Text>

                          <ol className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
                            {f.anatomy.map((line, i) => (
                              <li key={line} className="flex gap-3">
                                <span
                                  aria-hidden
                                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-band text-caption font-semibold tabular-nums text-ink"
                                >
                                  {i + 1}
                                </span>
                                <Text size="small" as="span">
                                  {line}
                                </Text>
                              </li>
                            ))}
                          </ol>

                          {f.source && (
                            <Source label={f.source.label} url={f.source.url} className="mt-6" />
                          )}
                        </div>

                        <div className="flex flex-col gap-4">
                          <Callout tone="coral" title="Before, weak">
                            <span className="whitespace-pre-line italic">{f.before}</span>
                          </Callout>

                          <div className="flex items-center gap-2 pl-1">
                            <Icon name="arrow-right" size={14} className="text-ink-faint" />
                            <Text size="caption" tone="faint">
                              Same facts. Same person. Different shape.
                            </Text>
                          </div>

                          <Callout tone="verified" title="After, strong" className="flex-1">
                            <span className="whitespace-pre-line font-medium text-ink">
                              {f.after}
                            </span>
                          </Callout>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* -------------------------------------------------- ESTIMATING */}
            <section id="estimating">
              <Card padding="lg">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <Kicker>{english.estimating.kicker}</Kicker>
                    <Heading level={2} size="h3" className="mt-5" balance>
                      {english.estimating.title}
                    </Heading>
                    <Text size="small" className="mt-4 max-w-md">
                      {english.estimating.body}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Callout tone="coral" title="Never">
                      {english.estimating.bad}
                    </Callout>
                    <Callout tone="verified" title="Always">
                      {english.estimating.good}
                    </Callout>
                  </div>
                </div>
              </Card>
            </section>

            {/* ---------------------------------------------------- SPEAKING */}
            <section id="speaking">
              <SectionHeading
                kicker={english.speaking.kicker}
                title={english.speaking.title}
                lead={english.speaking.lead}
              />

              <ol className="mt-12 flex flex-col gap-5">
                {english.speaking.priorities.map((p) => {
                  const a = accent(p.accent);
                  return (
                    <li key={p.n}>
                      <Card as="article" padding="lg">
                        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-caption font-semibold tabular-nums text-ink-faint">
                                {p.n}
                              </span>
                              <span className={cn("text-caption font-semibold", a.text)}>
                                Impact: {p.impact}
                              </span>
                            </div>
                            <Heading level={3} size="h3" className="mt-4" balance>
                              {p.title}
                            </Heading>
                          </div>

                          <div className="flex flex-col gap-4">
                            <Text size="small">{p.what}</Text>
                            <Card padding="sm">
                              <Text size="small" tone="ink">
                                <span className="font-semibold">The drill:</span> {p.drill}
                              </Text>
                            </Card>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ol>

              <Source
                label={english.speaking.source.label}
                url={english.speaking.source.url}
                className="mt-8"
              />
            </section>

            {/* --------------------------------------------------- RESOURCES */}
            <section id="resources">
              <SectionHeading
                kicker={english.resources.kicker}
                title={english.resources.title}
                lead={english.resources.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {english.resources.items.map((r) => {
                  const a = accent(r.tone);
                  return (
                    <Card key={r.name} as="article">
                      <div className="flex items-start justify-between gap-3">
                        <Heading level={3} size="h4">
                          {r.name}
                        </Heading>
                        <Badge tone={r.tone as "signal"}>
                          {r.tone === "verified" ? "Open" : r.tone === "caution" ? "Caveat" : "Paid"}
                        </Badge>
                      </div>

                      <Text size="small" as="p" className={cn("mt-4 font-semibold", a.text)}>
                        {r.cost}
                      </Text>
                      <Text size="small" className="mt-4 flex-1">
                        {r.what}
                      </Text>
                      <Text size="small" tone="ink" className="mt-4 border-l-2 border-line-strong pl-4">
                        {r.use}
                      </Text>

                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-1.5 border-t border-line pt-4 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary"
                      >
                        Open {r.name}
                        <Icon name="arrow-up-right" size={14} />
                      </a>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>
          </div>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/english" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/ai-first/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import aifirst from "@/data/aifirst.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/ai-first";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "AI-First",
  description:
    "Every role runs on AI now. Coding agents, open-source and local models, AI image, AI video, and automation, taught as how to fold AI into your craft, with the four habits that turn it into leverage instead of slop. Every claim sourced.",
});

const TOC = [
  { id: "shift", label: "The shift" },
  { id: "fluency", label: "Fluency" },
  { id: "landscape", label: "The landscape" },
  { id: "craft", label: "In your craft" },
  { id: "adopt", label: "How to adopt" },
  { id: "guardrails", label: "Guardrails" },
  { id: "agentic", label: "Agentic terms" },
];

const COST_TONE: Record<string, "verified" | "info" | "caution" | "neutral"> = {
  free: "verified",
  "open-source": "verified",
  freemium: "info",
  "free-trial": "caution",
  paid: "neutral",
};
const COST_LABEL: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

type Tool = {
  name: string;
  url: string;
  cost: string;
  oneLiner: string;
  useInWork: string;
};

export default function AiFirstPage() {
  const { hero, shift, fluency, landscape, craft, adopt, guardrails, agentic, closing } = aifirst;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        <FreshnessNote date={aifirst.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/ai-first" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------------- SHIFT */}
            <section id="shift">
              <SectionHeading kicker={shift.kicker} title={shift.title} lead={shift.lead} />

              <StatStrip className="mt-12 grid gap-6 md:grid-cols-3">
                {shift.stats.map((s) => (
                  <Card key={s.label} padding="lg">
                    <Stat
                      value={s.value}
                      label={s.label}
                      sub={s.body}
                      source={{ label: s.source.label, url: s.source.url }}
                    />
                  </Card>
                ))}
              </StatStrip>

              <Callout tone="verified" className="mt-8">
                {shift.note}
              </Callout>
              <div className="mt-5">
                <Button
                  href={shift.crossref.href}
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={16} />}
                >
                  {shift.crossref.label}
                </Button>
              </div>
            </section>

            {/* ----------------------------------------------------- FLUENCY */}
            <section id="fluency">
              <SectionHeading kicker={fluency.kicker} title={fluency.title} lead={fluency.lead} />

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {fluency.skills.map((sk) => {
                  const a = accent(sk.accent);
                  return (
                    <Card key={sk.name} as="article" padding="lg">
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                            a.fill,
                          )}
                        >
                          <Icon name={sk.icon} size={20} />
                        </span>
                        <div>
                          <span className={cn("text-kicker uppercase", a.text)}>
                            Skill {sk.letter}
                          </span>
                          <Heading level={3} size="h4">
                            {sk.name}
                          </Heading>
                        </div>
                      </div>
                      <Text size="small" className="mt-5">
                        {sk.purpose}
                      </Text>
                      <Text
                        size="small"
                        tone="ink"
                        className={cn("mt-4 border-l-2 pl-4 font-medium", a.border)}
                      >
                        {sk.doThis}
                      </Text>
                    </Card>
                  );
                })}
              </div>

              <Callout className="mt-8">
                <Text size="small">{fluency.note}</Text>
                <Source label={fluency.source.label} url={fluency.source.url} className="mt-3" />
              </Callout>
            </section>

            {/* --------------------------------------------------- LANDSCAPE */}
            <section id="landscape">
              <SectionHeading
                kicker={landscape.kicker}
                title={landscape.title}
                lead={landscape.lead}
              />
              <Callout tone="info" className="mt-6">
                {landscape.note}
              </Callout>

              <div className="mt-12 flex flex-col gap-5">
                {landscape.categories.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article" padding="lg">
                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "grid h-12 w-12 shrink-0 place-items-center rounded-sm",
                                a.fill,
                              )}
                            >
                              <Icon name={c.icon} size={22} />
                            </span>
                            <Heading level={3} size="h3">
                              {c.name}
                            </Heading>
                          </div>
                          <Text size="small" className="mt-5">
                            {c.what}
                          </Text>
                          <div className={cn("mt-4 border-l-2 pl-4", a.border)}>
                            <Kicker>What it unlocks</Kicker>
                            <Text size="small" tone="ink" className="mt-1 font-medium">
                              {c.unlocks}
                            </Text>
                          </div>
                        </div>

                        <div>
                          <Kicker>A few real ones to try</Kicker>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {(c.tools as Tool[]).map((t) => (
                              <Card key={t.name} padding="sm" className="h-full">
                                <div className="flex items-center justify-between gap-2">
                                  <Text size="base" tone="ink" as="span" className="font-display">
                                    {t.name}
                                  </Text>
                                  <Badge tone={COST_TONE[t.cost] ?? "neutral"}>
                                    {COST_LABEL[t.cost] ?? t.cost}
                                  </Badge>
                                </div>
                                <Text size="caption" className="mt-2">
                                  {t.oneLiner}
                                </Text>
                                <Text size="caption" tone="faint" className="mt-2 flex-1">
                                  {t.useInWork}
                                </Text>
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary"
                                >
                                  Open
                                  <Icon name="arrow-up-right" size={11} />
                                </a>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------------------------------- CRAFT */}
            <section id="craft">
              <SectionHeading kicker={craft.kicker} title={craft.title} lead={craft.lead} />
              <div className="mt-12 flex flex-col gap-3">
                {craft.rows.map((r) => (
                  <Card key={r.niche} as="article">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center sm:gap-8">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                          <Icon name={r.icon} size={18} />
                        </span>
                        <Heading level={3} size="h5">
                          {r.niche}
                        </Heading>
                      </div>
                      <Text size="small">{r.workflow}</Text>
                    </div>
                  </Card>
                ))}
              </div>
              <Callout tone="signal" className="mt-8">
                {craft.note}
              </Callout>
            </section>

            {/* ------------------------------------------------------- ADOPT */}
            <section id="adopt">
              <SectionHeading kicker={adopt.kicker} title={adopt.title} lead={adopt.lead} />
              <StepList className="mt-12">
                {adopt.steps.map((s) => (
                  <Step key={s.n} n={s.n} title={s.title}>
                    {s.desc}
                  </Step>
                ))}
              </StepList>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {adopt.crossrefs.map((c) => (
                  <Button
                    key={c.href}
                    href={c.href}
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </section>

            {/* -------------------------------------------------- GUARDRAILS */}
            <section id="guardrails">
              <SectionHeading
                kicker={guardrails.kicker}
                title={guardrails.title}
                lead={guardrails.lead}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {guardrails.items.map((it) => (
                  <Card key={it.title} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary-tint text-primary-deep">
                        <Icon name={it.icon} size={20} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {it.title}
                        </Heading>
                        <Text size="small" className="mt-2">
                          {it.desc}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  href={guardrails.crossref.href}
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={16} />}
                >
                  {guardrails.crossref.label}
                </Button>
              </div>
            </section>

            {/* ----------------------------------------------------- AGENTIC */}
            <section id="agentic">
              <SectionHeading kicker={agentic.kicker} title={agentic.title} lead={agentic.lead} />
              <CardGrid cols={3} className="mt-12">
                {agentic.items.map((it) => (
                  <Card key={it.term} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={it.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5">
                      {it.term}
                    </Heading>
                    <Text size="small" className="mt-3 flex-1">
                      {it.desc}
                    </Text>
                  </Card>
                ))}
              </CardGrid>

              <Card padding="lg" className="mt-10">
                <Heading level={3} size="h3">
                  {agentic.why.title}
                </Heading>
                <Text size="body" className="mt-4 max-w-3xl">
                  {agentic.why.body}
                </Text>
                <Callout tone="signal" className="mt-5">
                  {agentic.note}
                </Callout>
                <Source
                  label={agentic.source.label}
                  url={agentic.source.url}
                  className="mt-5"
                />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={2} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/prompts">Learn to direct AI</Button>
          <Button href="/resources" variant="outline">
            Get the free courses
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/ai-first" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Confirm the de-slop sweep**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Soft|Border)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|signal-tint|caution-text|rounded-2xl|blur-|hover:-translate|font-mono" app/english/page.tsx app/ai-first/page.tsx || echo "clean"
```
Expected: `clean`.

- [ ] **Step 4: Confirm the English chart replaced the hand-rolled bars**

Run:
```bash
grep -n "Bars\|DiagramFrame\|MAX_SCORE\|GLOBAL_AVG" app/english/page.tsx
grep -c "style={{ width" app/english/page.tsx || echo "0 inline widths"
```
Expected: `Bars` imported and used once inside one `DiagramFrame`; `MAX_SCORE`/`GLOBAL_AVG` still declared; zero inline `style={{ width` bars.

- [ ] **Step 5: Confirm every source survived**

Run:
```bash
node -e "
const fs=require('fs');
for (const [json,page] of [['english','app/english/page.tsx'],['aifirst','app/ai-first/page.tsx']]) {
  const n=(JSON.stringify(require('./data/'+json+'.json')).match(/\"source\":\{/g)||[]).length;
  const m=(fs.readFileSync(page,'utf8').match(/<Source\b|source=\{\{/g)||[]).length;
  console.log(json, 'json sources:', n, '| page source renders:', m);
}"
```
Expected: the page render count is greater than or equal to the JSON count for both files (AI-First renders three of its sources through `Stat source={{…}}`, which the regex counts as `source={{`).

- [ ] **Step 6: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: silent, clean, `✓ Compiled successfully`.

- [ ] **Step 7: Verify both pages are primitive-clean**

Run: `node scripts/verify-primitives.mjs | grep -E "app.(english|ai-first)" || echo "clean"`
Expected: `clean`.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/english/page.tsx app/ai-first/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(guides): migrate /english (EF EPI bars on the chart primitives) and /ai-first"
```
---

### Task 5: Batch A/3 — `/indispensable`, `/legit`, `/languages`

**Parallel group:** B

**Files:**
- Replace (whole file): `app/indispensable/page.tsx`, `app/legit/page.tsx`, `app/languages/page.tsx`

**Interfaces:**
- Consumes: the standard layout/ui set, plus `Bars` from `@/components/diagrams/charts` for the freelancer-vs-employee comparison on `/indispensable`, and `ProgressBar` for the language premium meter.
- Produces: nothing importable. Three page modules.

**Icon mapping for this task:**

| File | lucide | `<Icon name>` |
|---|---|---|
| `app/indispensable/page.tsx` | `ExternalLink` | absorbed by `<Source>` |
| `app/legit/page.tsx` | — (no lucide today) | — |
| `app/languages/page.tsx` | `Clock` | `clock` |
| | `ExternalLink` | `arrow-up-right` |

**Two content decisions on `/languages`, both from §9:**

1. **Emoji flags go.** `data/languages.json` keeps its `flag` field (this phase does not edit content JSON), but the page stops rendering it. The card leads with the language name at `h3`; the premium tier is a `Badge`. Same for `/markets` in Task 9.
2. **The five-segment `PremiumMeter` becomes `<ProgressBar value={premiumScore} max={5} label={…} tone={…} />`.** It was already `role="img"` with a value label; `ProgressBar` gives it a real `role="progressbar"` with `aria-valuenow`.

**`/indispensable` chart:** `proof.rows` (freelancer % vs employee %) were two stacked `<span>` bars per row inside a navy panel. They become one `<Bars>` with `compare`, on paper, inside a `<DiagramFrame>`, with `proof.legend.freelancer` / `proof.legend.employee` as `seriesLabel` / `compareLabel` and `proof.source` rendered underneath. The navy panel goes (§9: one navy band per page and it is the CTA).

**Source counts to hold:** `/indispensable` 2 (`why.source`, `proof.source`) · `/legit` — `bir.sources[]` (a `SourceList`), one per `benefits.items[].source`, one per `gettingPaid.rails[].url` rendered as an `external` link · `/languages` 0 (its `learn[].url` entries are destination links, not citations).

- [ ] **Step 1: Write `app/indispensable/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import indispensable from "@/data/indispensable.json";
import { Bars } from "@/components/diagrams/charts";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/indispensable";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Become Indispensable",
  description:
    "How to become layoff-proof and the professional clients fight to keep. The many kinds of intelligence school never measured (creative, emotional, judgment, taste, adaptability) and the habits that make you impossible to replace in an AI world. Sourced.",
});

export default function IndispensablePage() {
  const { hero, why, intelligences, soughtAfter, proof, closing } = indispensable;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/indispensable" /></Section> */}
      </PageHero>

      {/* ---------------------------------------------------------------- WHY */}
      <Section band="tint">
        <SectionHeading kicker={why.kicker} title={why.title} lead={why.lead} />
        <Card padding="lg" className="mt-10" onBand>
          <Text size="small" tone="ink" className="max-w-3xl border-l-2 border-verified pl-5 font-medium">
            {why.callout}
          </Text>
          <Source label={why.source.label} url={why.source.url} className="mt-4" />
        </Card>
      </Section>

      {/* ------------------------------------------------------ INTELLIGENCES */}
      <Section>
        <SectionHeading
          kicker={intelligences.kicker}
          title={intelligences.title}
          lead={intelligences.lead}
        />

        <CardGrid cols={3} className="mt-12">
          {intelligences.items.map((it) => {
            const a = accent(it.accent);
            return (
              <Card key={it.name} as="article">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                      a.fill,
                    )}
                  >
                    <Icon name={it.icon} size={20} />
                  </span>
                  <Heading level={3} size="h5">
                    {it.name}
                  </Heading>
                </div>
                <Text size="small" className="mt-4 flex-1">
                  {it.what}
                </Text>
                <div className={cn("mt-4 border-l-2 pl-4", a.border)}>
                  <Kicker>Build it</Kicker>
                  <Text size="small" tone="ink" className="mt-1 font-medium">
                    {it.build}
                  </Text>
                </div>
              </Card>
            );
          })}
        </CardGrid>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {intelligences.note}
        </Callout>
      </Section>

      {/* ------------------------------------------------------ SOUGHT AFTER */}
      <Section band="tint">
        <SectionHeading
          kicker={soughtAfter.kicker}
          title={soughtAfter.title}
          lead={soughtAfter.lead}
        />
        <CardGrid cols={3} className="mt-12">
          {soughtAfter.traits.map((t) => (
            <Card key={t.title} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={t.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {t.title}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {t.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* -------------------------------------------------------------- PROOF */}
      <Section>
        <SectionHeading kicker={proof.kicker} title={proof.title} lead={proof.body} />

        <DiagramFrame
          title="Freelancers and employees, side by side"
          caption="Read one row at a time: the solid bar is the freelancer share, the dashed bar the employee share. The gap, not the height, is the finding."
          className="mt-12"
        >
          <Bars
            data={proof.rows.map((r) => ({
              id: r.label,
              label: r.label,
              value: r.freelancer,
              compare: r.employee,
            }))}
            max={100}
            format={(v) => `${v}%`}
            seriesLabel={proof.legend.freelancer}
            compareLabel={proof.legend.employee}
            labelWidth={260}
          />
        </DiagramFrame>

        <Source label={proof.source.label} url={proof.source.url} className="mt-4" />
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={4} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/ai-first">Multiply with AI</Button>
          <Button href="/tasks" variant="outline">
            Build your proof
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/indispensable" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/legit/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import legit from "@/data/legit.json";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Source,
  SourceList,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/legit";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Get Legit",
  description:
    "BIR registration, the 8% option, SSS/PhilHealth/Pag-IBIG as a self-employed professional, and the payment rails that protect your rate: every step linked to the official page.",
});

export default function LegitPage() {
  const { hero, why, bir, benefits, gettingPaid, closing } = legit;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/legit" /></Section> */}
      </PageHero>

      {/* ---------------------------------------------------------------- WHY */}
      <Section band="tint">
        <SectionHeading kicker={why.kicker} title={why.title} />
        <CardGrid cols={3} className="mt-12">
          {why.items.map((it) => (
            <Card key={it.title} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={it.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {it.title}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {it.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ---------------------------------------------------------------- BIR */}
      <Section>
        <SectionHeading kicker={bir.kicker} title={bir.title} lead={bir.lead} />

        <StepList className="mt-12">
          {bir.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>

        <SourceList sources={bir.sources} className="mt-8" />
        <Text size="small" className="mt-5 max-w-3xl">
          {bir.note}
        </Text>
      </Section>

      {/* ----------------------------------------------------------- BENEFITS */}
      <Section band="tint">
        <SectionHeading kicker={benefits.kicker} title={benefits.title} lead={benefits.lead} />
        <CardGrid cols={3} className="mt-12">
          {benefits.items.map((b) => (
            <Card key={b.name} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-verified-fill text-ink">
                <Icon name={b.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {b.name}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {b.what}
              </Text>
              <Source label={b.source.label} url={b.source.url} className="mt-4" />
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* -------------------------------------------------------- GETTING PAID */}
      <Section>
        <SectionHeading
          kicker={gettingPaid.kicker}
          title={gettingPaid.title}
          lead={gettingPaid.lead}
        />
        <CardGrid cols={4} className="mt-12">
          {gettingPaid.rails.map((r) => (
            <Card key={r.name} as="article">
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={r.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {r.name}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {r.shape}
              </Text>
              <div className="mt-4">
                <Button
                  href={r.url}
                  external
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={14} />}
                >
                  Official site
                </Button>
              </div>
            </Card>
          ))}
        </CardGrid>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {gettingPaid.note}
        </Callout>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={3} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10">
          <Button href="/plan">Fold it into your 30-day plan</Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/legit" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Write `app/languages/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import languagesData from "@/data/languages.json";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  Heading,
  Icon,
  Kicker,
  ProgressBar,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/languages";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Language Premium, A Second Language Can Double Your Pay",
  description: languagesData.intro,
});

type Language = (typeof languagesData.languages)[number];
type Tone = "signal" | "caution" | "info";

/**
 * Premium tier -> accent. The emoji flags in the JSON are deliberately not
 * rendered (spec §9): a flag is decoration, and three of them read as an
 * unlabelled colour code to anyone using a screen reader.
 */
const PREMIUM_TONE: Record<string, Tone> = {
  Highest: "signal",
  High: "caution",
  Moderate: "info",
};

function learnTone(type: string): "verified" | "neutral" {
  return type.trim().toLowerCase().startsWith("free") ? "verified" : "neutral";
}

export default function LanguagesPage() {
  const [hero, ...rest] = languagesData.languages;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="The rate multiplier"
        title="A second language can"
        accent="double your pay."
        lead={languagesData.intro}
      >
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/languages" /></Section> */}
      </PageHero>

      {/* ---------------------------------------------------------- LANGUAGES */}
      <Section>
        <SectionHeading
          kicker="Highest paying first"
          title="Which language pays the most"
          lead={languagesData.premiumNote}
        />

        <div className="mt-10">
          <LanguageCard language={hero} featured />
        </div>

        <CardGrid cols={3} className="mt-6">
          {rest.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------- HOW TO START */}
      <Section band="tint">
        <SectionHeading align="center" kicker="Four steps" title="How to start, this week" />
        <StepList className="mt-12">
          {languagesData.howto.map((h, idx) => (
            <Step key={h.step} n={idx + 1} title={h.step}>
              {h.desc}
            </Step>
          ))}
        </StepList>
      </Section>

      {/* ------------------------------------------------------------ CALLOUT */}
      <Section>
        <Card padding="lg">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Kicker>The compounding move</Kicker>
              <Heading level={2} size="h3" className="mt-4 max-w-xl" balance>
                Stack a language on your niche for the biggest jump.
              </Heading>
              <Text className="mt-3 max-w-lg">
                A premium language plus a specialized niche is where Filipino online
                professionals see the largest rate increases, not either alone.
              </Text>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/level-up">See Level Up</Button>
              <Button href="/niches" variant="outline">
                Explore niches
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/languages" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}

function LanguageCard({
  language,
  featured = false,
}: {
  language: Language;
  featured?: boolean;
}) {
  const tone = PREMIUM_TONE[language.premium] ?? "info";
  return (
    <Card as="article" padding={featured ? "lg" : "md"}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Heading level={3} size={featured ? "h3" : "h4"}>
            {language.name}
          </Heading>
          <div className={cn("mt-3", featured ? "max-w-xs" : "max-w-[12rem]")}>
            <ProgressBar
              value={language.premiumScore}
              max={5}
              label={`Premium score for ${language.name}`}
              hideLabel
              tone={tone}
            />
          </div>
        </div>
        <Badge tone={tone}>{language.premium}</Badge>
      </div>

      <Text size={featured ? "lead" : "base"} tone="ink" className="mt-5 font-semibold">
        {language.payNote}
      </Text>
      <Text size="small" className="mt-3">
        {language.why}
      </Text>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {language.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>

      <Text size="caption" tone="faint" className="mt-4 flex items-center gap-1.5">
        <Icon name="clock" size={13} /> {language.effort}
      </Text>

      <div className="mt-6 border-t border-line pt-5">
        <Kicker>Where to learn, free &amp; paid</Kicker>
        <ul className="mt-3">
          {language.learn.map((school) => (
            <li
              key={school.name}
              className="flex flex-col gap-1.5 border-t border-line py-4 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text size="base" tone="ink" as="span" className="font-semibold">
                  {school.name}
                </Text>
                <Badge tone={learnTone(school.type)}>{school.type}</Badge>
              </div>
              <Text size="small">{school.detail}</Text>
              {school.url !== "#" && (
                <Button
                  href={school.url}
                  external
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={13} />}
                >
                  Visit site
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Confirm the flags are gone and nothing else went with them**

Run:
```bash
grep -n "language.flag\|\.flag" app/languages/page.tsx || echo "no flag rendered"
node -e "const d=require('./data/languages.json'); console.log('languages in JSON:', d.languages.length); console.log('flags still in data (untouched):', d.languages.filter(l=>l.flag).length);"
grep -c "LanguageCard" app/languages/page.tsx
```
Expected: `no flag rendered`; 4 languages in JSON with 4 flags still present in the data (this phase does not edit content JSON); `LanguageCard` appears 4 times (definition + hero use + map use + type annotation is fine, the point is the component still renders every language).

- [ ] **Step 5: Confirm the de-slop sweep**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Soft|Border)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|caution-text|rounded-2xl|blur-|hover:-translate|dotgrid" app/indispensable/page.tsx app/legit/page.tsx app/languages/page.tsx || echo "clean"
```
Expected: `clean`.

- [ ] **Step 6: Confirm every source survived**

Run:
```bash
node -e "
const fs=require('fs');
const legit=require('./data/legit.json');
console.log('legit bir.sources:', legit.bir.sources.length, '| benefits sources:', legit.benefits.items.filter(b=>b.source).length);
console.log('legit page Source/SourceList tags:', (fs.readFileSync('app/legit/page.tsx','utf8').match(/<Source(List)?\b/g)||[]).length);
console.log('indispensable page Source tags:', (fs.readFileSync('app/indispensable/page.tsx','utf8').match(/<Source\b/g)||[]).length);
"
```
Expected: `/legit` renders one `<SourceList>` for `bir.sources` plus one `<Source>` per benefit; `/indispensable` renders 2.

- [ ] **Step 7: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: silent, clean, `✓ Compiled successfully`.

- [ ] **Step 8: Verify the three pages are primitive-clean**

Run: `node scripts/verify-primitives.mjs | grep -E "app.(indispensable|legit|languages)" || echo "clean"`
Expected: `clean`.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/indispensable/page.tsx app/legit/page.tsx app/languages/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(guides): migrate /indispensable, /legit and /languages; drop the emoji flags"
```

---

### Task 6: Batch A/4 — `/resources`, `/portfolio`, `/clients`

**Parallel group:** B

**Files:**
- Replace (whole file): `app/resources/page.tsx`, `app/portfolio/page.tsx`, `app/clients/page.tsx`

**Interfaces:**
- Consumes: the standard layout/ui set, plus `AgencyVsDirect` from `@/components/diagrams/agency-vs-direct` (Task 2) on `/clients`, and `tracks.json` on `/portfolio`.
- Produces: nothing importable. Three page modules.

**Icon mapping for this task:**

| File | lucide | `<Icon name>` |
|---|---|---|
| `app/resources/page.tsx` | `ExternalLink` | `arrow-up-right` (and `<Source>` where it was a citation) |
| `app/portfolio/page.tsx` | `ArrowUpRight` | `arrow-up-right` |
| | `Target` | `target` |
| | `Sparkles` | deleted (§9) |
| `app/clients/page.tsx` | `Check` | `check` |
| | `X` | `x` |
| | `ExternalLink` | absorbed by `<Source>` / `arrow-up-right` |

**Two notes:**

- `/resources` has a page-local `SavingsCallout` that derives a monthly total from `savings.basis[]`. That arithmetic is content logic, not styling — it stays, moved onto `Callout` + `Stat`, and `savings.asOf` keeps its place as the date stamp.
- `/clients` gains the swimlane. It sits in the `roads` section, directly under the pros/cons pair, because the diagram is the answer the two lists argue toward.

- [ ] **Step 1: Write `app/resources/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import resources from "@/data/resources.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Stat,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/resources";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Free Resources",
  description:
    "The free shelf for Filipino online professionals: verified free courses, government programs, docs, and YouTube channels that actually get you hired, plus how to judge any free course before it takes your week, and how to turn study into proof.",
});

const COST_TONE: Record<string, "verified" | "info" | "caution" | "neutral"> = {
  free: "verified",
  "open-source": "verified",
  freemium: "info",
  "free-trial": "caution",
  paid: "neutral",
};
const COST_LABEL: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

type ShelfItem = { org: string; title: string; url: string; why: string; cost: string };
type Savings = { note: string; asOf: string; basis: { tool: string; monthly: number }[] };
type ShelfGroup = {
  id: string;
  title: string;
  note: string;
  items: ShelfItem[];
  savings?: Savings;
};

function SavingsCallout({ savings }: { savings: Savings }) {
  const monthly = savings.basis.reduce((sum, b) => sum + b.monthly, 0);
  return (
    <Callout tone="verified" className="mt-5">
      <Stat
        value={`$${monthly}/mo`}
        label={`about $${monthly * 12} a year, saved on tools alone`}
        sub={savings.note}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {savings.basis.map((b) => (
          <Text key={b.tool} size="caption" tone="faint" as="span">
            {b.tool} <span className="tabular-nums text-ink-soft">${b.monthly}</span>
          </Text>
        ))}
      </div>
      <Text size="caption" tone="faint" className="mt-2">
        {savings.asOf}
      </Text>
    </Callout>
  );
}

export default function ResourcesPage() {
  const { hero, judge, shelf, protocol, closing } = resources;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        <FreshnessNote date={resources.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/resources" /></Section> */}
      </PageHero>

      {/* -------------------------------------------------------------- JUDGE */}
      <Section band="tint">
        <SectionHeading kicker={judge.kicker} title={judge.title} lead={judge.lead} />
        <CardGrid cols={3} className="mt-12">
          {judge.tests.map((t) => (
            <Card key={t.q} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={t.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-5" balance>
                {t.q}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {t.why}
              </Text>
            </Card>
          ))}
        </CardGrid>
        <Callout tone="signal" className="mt-8 max-w-2xl">
          {judge.note}
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- SHELF */}
      <Section>
        <SectionHeading kicker={shelf.kicker} title={shelf.title} lead={shelf.lead} />

        <div className="mt-12 flex flex-col gap-14">
          {(shelf.groups as ShelfGroup[]).map((g) => (
            <div key={g.id}>
              <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                <Heading level={3} size="h3">
                  {g.title}
                </Heading>
                <Text size="small" className="max-w-2xl">
                  {g.note}
                </Text>
              </div>

              {g.savings && <SavingsCallout savings={g.savings} />}

              <CardGrid cols={3} className="mt-7">
                {g.items.map((item) => (
                  <Card key={item.url} href={item.url} as="article">
                    <div className="flex items-center justify-between gap-2">
                      <Kicker>{item.org}</Kicker>
                      <Badge tone={COST_TONE[item.cost] ?? "verified"}>
                        {COST_LABEL[item.cost] ?? "Open"}
                      </Badge>
                    </div>
                    <Heading level={4} size="h5" className="mt-3" balance>
                      {item.title}
                    </Heading>
                    <Text size="small" className="mt-3 flex-1">
                      {item.why}
                    </Text>
                    <Text size="caption" tone="faint" className="mt-5 inline-flex items-center gap-1.5">
                      Open the resource
                      <Icon name="arrow-up-right" size={12} />
                    </Text>
                  </Card>
                ))}
              </CardGrid>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- PROTOCOL */}
      <Section band="tint">
        <SectionHeading kicker={protocol.kicker} title={protocol.title} lead={protocol.lead} />
        <StepList className="mt-14">
          {protocol.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {protocol.crossrefs.map((c) => (
            <Button
              key={c.href}
              href={c.href}
              variant="link"
              iconEnd={<Icon name="arrow-up-right" size={16} />}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section>
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={3} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href}>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/ai-first">Start with the AI layer</Button>
          <Button href="/tasks" variant="outline">
            Turn it into proof
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/resources" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/portfolio/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import tracks from "@/data/tracks.json";
import portfolio from "@/data/portfolio.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/portfolio";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Portfolio Ladder",
  description: portfolio.intro,
});

/** Tier -> badge tone. One rung per column: Start (get in), Level up, Pro (differentiate). */
const TIER_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Start: "verified",
  "Level up": "caution",
  Pro: "signal",
};

/** Join by id so track name/icon/accent stay single-sourced in tracks.json. */
const trackById = Object.fromEntries(tracks.tracks.map((t) => [t.id, t]));

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={portfolio.kicker}
        title={portfolio.headline}
        lead={portfolio.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {portfolio.creed}
        </Callout>
        <FreshnessNote date={portfolio.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/portfolio" /></Section> */}
      </PageHero>

      {/* -------------------------------------------------------- HOW IT WORKS */}
      <Section>
        <SectionHeading
          kicker="Three rungs, same craft"
          title="How the ladder works"
          lead={portfolio.tiersNote}
        />
        <CardGrid cols={3} className="mt-10">
          {portfolio.howItWorks.map((step) => (
            <Card key={step.tier}>
              <Badge tone={TIER_TONE[step.tier] ?? "neutral"}>{step.tier}</Badge>
              <Text size="small" className="mt-4 flex-1">
                {step.meaning}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------- TRACK LADDERS */}
      <Section band="tint">
        <SectionHeading
          kicker="Pick your lane, climb the rungs"
          title="The tool ladder for every niche"
          lead="Each niche has its own climb, from the free tool you start on today to the paid one that sets your rate apart. Every rung leaves you a portfolio piece."
        />

        <div className="mt-12 flex flex-col gap-16">
          {portfolio.tracks.map((entry) => {
            const meta = trackById[entry.id];
            if (!meta) return null;
            const a = accent(meta.accent);
            return (
              <div key={entry.id}>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-md border",
                      a.soft,
                    )}
                  >
                    <Icon name={meta.icon} size={22} />
                  </span>
                  <div>
                    <Heading level={3} size="h4">
                      {meta.name}
                    </Heading>
                    <Text size="small">{meta.tagline}</Text>
                  </div>
                </div>

                <CardGrid cols={3} className="mt-6">
                  {entry.ladder.map((rung) => (
                    <Card key={rung.tier} onBand>
                      <Badge tone={TIER_TONE[rung.tier] ?? "neutral"}>{rung.tier}</Badge>
                      <Text size="small" className="mt-3">
                        {rung.goal}
                      </Text>

                      <ul className="mt-5 flex flex-1 flex-col gap-3 border-t border-line pt-4">
                        {rung.tools.map((tool) => (
                          <li key={tool.name}>
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "inline-flex items-center gap-1 text-small font-semibold text-ink transition-colors duration-150 ease-out",
                                  "hover:text-primary",
                                )}
                              >
                                {tool.name}
                                <Icon name="arrow-up-right" size={13} className="text-ink-faint" />
                              </a>
                              <Badge>{tool.free}</Badge>
                            </div>
                            <Text size="caption" tone="faint" className="mt-0.5">
                              {tool.what}
                            </Text>
                          </li>
                        ))}
                      </ul>

                      <div className={cn("mt-5 flex items-start gap-2 rounded-sm border p-3", a.soft)}>
                        <Icon name="target" size={14} className="mt-0.5 shrink-0" />
                        <Text size="caption" tone="inherit" as="span">
                          <span className="font-semibold">Portfolio piece: </span>
                          {rung.piece}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </CardGrid>
              </div>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------------- CLOSE */}
      <Section>
        <SectionHeading
          align="center"
          kicker="Proof, not promises"
          title="A tool is only proof once you've built something with it."
          lead="The ladder tells you what to learn next. The micro-tasks turn each rung into a real deliverable you can show. Pick a lane, then go build the first piece."
          size="display"
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/tasks">Build a portfolio piece</Button>
          <Button href="/niches" variant="outline">
            Pick your niche
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/portfolio" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Write `app/clients/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import clients from "@/data/clients.json";
import { AgencyVsDirect } from "@/components/diagrams/agency-vs-direct";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/clients";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Own Your Clients",
  description:
    "Build a business of one. The independent-contractor mindset vs the employee mindset, a fair look at agency vs direct clients, the step-by-step way to land direct clients, and how to protect yourself like a real business.",
});

type DirectStep = {
  title: string;
  how: string;
  crossref?: { href: string; label: string } | null;
};

export default function ClientsPage() {
  const { hero, mindset, roads, getDirect, protect, closing } = clients;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
      </PageHero>

      {/* ------------------------------------------------------------ MINDSET */}
      <Section band="tint">
        <SectionHeading kicker={mindset.kicker} title={mindset.title} lead={mindset.lead} />

        <Card padding="none" className="mt-12" onBand>
          <div className="hidden grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-band sm:grid">
            <span className="p-4 text-kicker uppercase text-ink-faint">Dimension</span>
            <span className="p-4 text-kicker uppercase text-ink-faint">Employee</span>
            <span className="p-4 text-kicker uppercase text-verified">Independent contractor</span>
          </div>
          <ul className="divide-y divide-line">
            {mindset.rows.map((r) => (
              <li
                key={r.dimension}
                className="grid gap-2 p-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-0 sm:p-0"
              >
                <span className="font-display text-base leading-snug text-ink sm:p-4">
                  {r.dimension}
                </span>
                <span className="text-small leading-relaxed text-ink-faint sm:p-4">
                  <span className="mr-2 text-kicker uppercase text-ink-faint sm:hidden">
                    Employee ·
                  </span>
                  {r.employee}
                </span>
                <span className="text-small font-medium leading-relaxed text-ink sm:bg-verified-tint sm:p-4">
                  <span className="mr-2 text-kicker uppercase text-verified sm:hidden">
                    Contractor ·
                  </span>
                  {r.contractor}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Callout tone="verified" className="mt-8">
          <Text size="small" tone="ink" className="max-w-3xl font-medium">
            {mindset.note}
          </Text>
          <Source label={mindset.source.label} url={mindset.source.url} className="mt-3" />
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- ROADS */}
      <Section>
        <SectionHeading kicker={roads.kicker} title={roads.title} lead={roads.lead} />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {[roads.agency, roads.direct].map((road) => (
            <Card key={road.title} as="article" padding="lg">
              <Heading level={3} size="h3">
                {road.title}
              </Heading>
              <Text size="small" className="mt-3">
                {road.blurb}
              </Text>

              <div className="mt-6 flex flex-col gap-3">
                <Kicker tone="verified">Pros</Kicker>
                <ul className="flex flex-col gap-2.5">
                  {road.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-verified" />
                      <Text size="small" tone="ink" as="span">
                        {p}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Kicker tone="coral">Cons</Kicker>
                <ul className="flex flex-col gap-2.5">
                  {road.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2.5">
                      <Icon name="x" size={16} className="mt-0.5 shrink-0 text-coral" />
                      <Text size="small" as="span">
                        {c}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <DiagramFrame
          title="Agency or direct: who holds the relationship"
          caption="Both lanes do the same four steps. Follow the last column: in the agency lane the client stays with the agency, in the direct lane the client is yours."
          className="mt-10"
        >
          <AgencyVsDirect />
        </DiagramFrame>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {roads.verdict}
        </Callout>
      </Section>

      {/* --------------------------------------------------------- GET DIRECT */}
      <Section band="tint">
        <SectionHeading kicker={getDirect.kicker} title={getDirect.title} lead={getDirect.lead} />

        <StepList className="mt-14">
          {(getDirect.steps as DirectStep[]).map((s, idx) => (
            <Step key={s.title} n={idx + 1} title={s.title}>
              <Text size="small">{s.how}</Text>
              {s.crossref && (
                <div className="mt-3">
                  <Button
                    href={s.crossref.href}
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={14} />}
                  >
                    {s.crossref.label}
                  </Button>
                </div>
              )}
            </Step>
          ))}
        </StepList>

        <Callout tone="verified" className="mt-10 max-w-3xl">
          {getDirect.note}
        </Callout>
      </Section>

      {/* ------------------------------------------------------------ PROTECT */}
      <Section>
        <SectionHeading kicker={protect.kicker} title={protect.title} lead={protect.lead} />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {protect.items.map((it) => (
            <Card key={it.title} as="article">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                  <Icon name={it.icon} size={20} />
                </span>
                <Heading level={3} size="h5">
                  {it.title}
                </Heading>
              </div>
              <Text size="small" className="mt-4 flex-1">
                {it.desc}
              </Text>
              {it.source && (
                <div className="mt-5 border-t border-line pt-4">
                  <Source label={it.source.label} url={it.source.url} />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button
            href={protect.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {protect.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={2} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/apply">Find clients yourself</Button>
          <Button href="/tracker" variant="outline">
            Build your pipeline
          </Button>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 4: Confirm the de-slop sweep**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Soft|Border)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|signal-deep|caution-text|rounded-2xl|blur-|hover:-translate|Sparkles" app/resources/page.tsx app/portfolio/page.tsx app/clients/page.tsx || echo "clean"
```
Expected: `clean`.

- [ ] **Step 5: Confirm the swimlane landed with a caption**

Run: `grep -n -A3 "DiagramFrame" app/clients/page.tsx`
Expected: one `<DiagramFrame` with both `title=` and `caption=`, wrapping `<AgencyVsDirect />`.

- [ ] **Step 6: Confirm every external link survived**

Run:
```bash
node -e "
const fs=require('fs');
const p=require('./data/portfolio.json');
const tools=p.tracks.flatMap(t=>t.ladder.flatMap(r=>r.tools)).length;
console.log('portfolio tool links in JSON:', tools);
const r=require('./data/resources.json');
console.log('resources shelf items in JSON:', r.shelf.groups.reduce((n,g)=>n+g.items.length,0));
console.log('resources page Card href map present:', /href=\{item.url\}/.test(fs.readFileSync('app/resources/page.tsx','utf8')));
"
```
Expected: both counts printed and `true` — the shelf still renders one linked `Card` per item, and the portfolio ladder still renders one anchor per tool.

- [ ] **Step 7: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: silent, clean, `✓ Compiled successfully`.

- [ ] **Step 8: Verify the three pages are primitive-clean**

Run: `node scripts/verify-primitives.mjs | grep -E "app.(resources|portfolio|clients)" || echo "clean"`
Expected: `clean`.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/resources/page.tsx app/portfolio/page.tsx app/clients/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(guides): migrate /resources, /portfolio and /clients; land the agency-vs-direct swimlane"
```
---

## Batch B — the Data archetype (Tasks 7–10)

Everything in the Batch A recipe applies, plus three rules that only Data pages carry:

1. **Every chart lives in a `DiagramFrame`** with a title and a one-sentence caption, and **its `Source` sits immediately underneath the frame**, never inside it.
2. **Bar geometry comes from `Bars`, never from inline widths.** After Task 7 there must be zero `style={{ width:` in `app/reality/page.tsx`.
3. **Nothing gains a number it did not have.** `Bars` renders exactly the values already in `data/*.json`; no totals, no averages, no derived percentages are introduced.

---

### Task 7: `/reality` — the bars move onto the chart primitives

**Parallel group:** C

**Files:**
- Replace (whole file): `app/reality/page.tsx`

**Interfaces:**
- Consumes: `Bars` from `@/components/diagrams/charts`; the standard layout/ui set; `FreshnessNote`.
- Produces: nothing importable.

**What the page-local helpers become:**

| Deleted | Replacement |
|---|---|
| `function fmt(value)` | kept — it is the chart's number formatter, passed to `Bars` as `format` |
| `function ChangeBar({label,value,max,note})` | `<Bars diverging data={…} format={fmt} />` |
| `function GrowthBar({label,value,max,accent})` | `<Bars data={…} format={(v) => "+" + v + "%"} />` |
| `function Source({label,url})` | `<Source>` from `@/components/ui` |
| `accentText` / `accentBar` / `accentBorder` | `accent(id)` |

**Icon mapping:** `ExternalLink` → absorbed by `<Source>` and by `arrow-up-right` on the reading-list cards.

**Source count to hold:** run the guard in Step 3 — every `source`, `source2`, and `sourceNote` in `data/reality.json` must still render.

- [ ] **Step 1: Write `app/reality/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import reality from "@/data/reality.json";
import { Bars } from "@/components/diagrams/charts";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Stat,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/reality";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Reality Check",
  description:
    "What the evidence actually says about remote and online work for Filipinos right now. The unpaid third of your hours, the non-payment rate, what AI really cut, where demand is genuinely growing, every number with its source, and an honest list of what nobody knows.",
});

const TOC = [
  { id: "read-a-number", label: "Read a number" },
  { id: "myths", label: "Seven myths" },
  { id: "ai", label: "What AI cut" },
  { id: "growth", label: "Where it grows" },
  { id: "thesis", label: "The thesis" },
  { id: "pay", label: "Pay" },
  { id: "unknown", label: "What nobody knows" },
  { id: "reading", label: "Read it yourself" },
];

/** The chart's number format: signed percent, minus sign not hyphen. */
function fmt(value: number): string {
  const sign = value > 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(value)}%`;
}

export default function RealityPage() {
  const { ai, growth, thesis, pay, unknown, reading, closing } = reality;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Reality check · every number sourced"
        title={reality.heroTitle.line1}
        accent={reality.heroTitle.line2}
        lead={reality.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {reality.creed}
        </Callout>
        <Text size="small" className="max-w-2xl">
          {reality.whyItMatters}
        </Text>
        <FreshnessNote date={reality.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/reality" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ----------------------------------------------- READ A NUMBER */}
            <section id="read-a-number">
              <SectionHeading
                kicker={reality.readANumber.kicker}
                title={reality.readANumber.title}
                lead={reality.readANumber.lead}
              />
              <CardGrid cols={2} className="mt-12">
                {reality.readANumber.tests.map((t) => (
                  <Card key={t.id} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={t.icon} size={20} />
                    </span>
                    <Heading level={3} size="h4" className="mt-5" balance>
                      {t.q}
                    </Heading>
                    <Text size="small" className="mt-3 flex-1">
                      {t.why}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
              <Callout tone="signal" className="mt-8 max-w-2xl">
                {reality.readANumber.note}
              </Callout>
            </section>

            {/* ------------------------------------------------------- MYTHS */}
            <section id="myths">
              <SectionHeading
                kicker="Expectation vs reality"
                title="Seven things you were told. Seven things the data says."
                lead={reality.mythsIntro}
              />

              <div className="mt-12 flex flex-col gap-5">
                {reality.myths.map((m) => {
                  const a = accent(m.accent);
                  return (
                    <Card key={m.id} as="article" padding="lg">
                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                          <Badge tone={m.accent as "signal"} variant="outline">
                            {m.tag}
                          </Badge>
                          <Text
                            size="lead"
                            tone="faint"
                            className="mt-4 font-display line-through decoration-coral/50 decoration-2"
                          >
                            {m.myth}
                          </Text>
                          <Heading level={3} size="h3" className="mt-4" balance>
                            {m.headline}
                          </Heading>
                          <div className="mt-5 flex flex-col gap-2">
                            <Source label={m.source.label} url={m.source.url} />
                            {m.source2 && <Source label={m.source2.label} url={m.source2.url} />}
                            {m.sourceNote && (
                              <Text size="caption" tone="faint" className="max-w-sm">
                                {m.sourceNote}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <Text size="small">{m.body}</Text>
                          <Card padding="sm">
                            <Text size="small" tone="ink">
                              <span className="font-semibold">The sting:</span> {m.sting}
                            </Text>
                          </Card>
                          <Text
                            size="small"
                            tone="ink"
                            className={cn("border-l-2 pl-4 font-medium", a.border)}
                          >
                            {m.lesson}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------------------- AI */}
            <section id="ai">
              <SectionHeading kicker={ai.kicker} title={ai.title} lead={ai.lead} />
              <Callout tone="info" className="mt-6 max-w-2xl">
                {ai.framing}
              </Callout>

              <div className="mt-12 flex flex-col gap-10">
                {ai.charts.map((chart) => {
                  const max = Math.max(
                    ...chart.items.map((it) => Math.abs(it.value)),
                    chart.baseline ? Math.abs(chart.baseline.value) : 0,
                  );
                  return (
                    <div key={chart.id}>
                      <DiagramFrame title={chart.title} caption={chart.note}>
                        <Bars
                          diverging
                          max={max}
                          format={fmt}
                          labelWidth={260}
                          data={chart.items.map((it) => ({
                            id: it.label,
                            label: it.label,
                            value: it.value,
                            note: it.note || undefined,
                          }))}
                          reference={
                            chart.baseline
                              ? { value: chart.baseline.value, label: chart.baseline.label }
                              : undefined
                          }
                        />
                      </DiagramFrame>
                      <Source label={chart.source.label} url={chart.source.url} className="mt-4" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {ai.peerReviewed.title}
                  </Heading>
                  <Text size="small" className="mt-4 flex-1">
                    {ai.peerReviewed.body}
                  </Text>
                  <Source
                    label={ai.peerReviewed.source.label}
                    url={ai.peerReviewed.source.url}
                    className="mt-6"
                  />
                </Card>
                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {ai.wef.title}
                  </Heading>
                  <Text size="small" className="mt-4 flex-1">
                    {ai.wef.body}
                  </Text>
                  <Source label={ai.wef.source.label} url={ai.wef.source.url} className="mt-6" />
                </Card>
              </div>

              <Callout tone="verified" title={ai.counter.title} className="mt-6">
                <Kicker tone="verified">{ai.counter.kicker}</Kicker>
                <Text size="small" className="mt-4 max-w-3xl">
                  {ai.counter.body}
                </Text>
                <Text size="small" tone="ink" className="mt-5 max-w-3xl font-medium">
                  {ai.counter.conclusion}
                </Text>
                <Source
                  label={ai.counter.source.label}
                  url={ai.counter.source.url}
                  className="mt-5"
                />
              </Callout>
            </section>

            {/* ------------------------------------------------------ GROWTH */}
            <section id="growth">
              <SectionHeading kicker={growth.kicker} title={growth.title} lead={growth.lead} />

              <div className="mt-12 flex flex-col gap-10">
                {growth.groups.map((g) => {
                  const a = accent(g.accent);
                  const max = Math.max(...g.items.map((it) => it.value));
                  return (
                    <div key={g.id}>
                      <DiagramFrame title={g.title} caption={g.note}>
                        <Bars
                          max={max}
                          format={(v) => `+${v}%`}
                          labelWidth={280}
                          data={g.items.map((it, idx) => ({
                            id: it.label,
                            label: it.label,
                            value: it.value,
                            focal: idx === 0,
                          }))}
                        />
                      </DiagramFrame>
                      {g.extra && (
                        <Text
                          size="small"
                          tone="ink"
                          className={cn("mt-6 border-l-2 pl-4 font-medium", a.border)}
                        >
                          {g.extra}
                        </Text>
                      )}
                      <Source label={g.source.label} url={g.source.url} className="mt-4" />
                    </div>
                  );
                })}

                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {growth.linkedin.title}
                  </Heading>
                  <Text size="small" className="mt-4 max-w-3xl">
                    {growth.linkedin.body}
                  </Text>
                  <Source
                    label={growth.linkedin.source.label}
                    url={growth.linkedin.source.url}
                    className="mt-6"
                  />
                </Card>
              </div>
            </section>

            {/* ------------------------------------------------------ THESIS */}
            <section id="thesis">
              <SectionHeading kicker={thesis.kicker} title={thesis.title} lead={thesis.lead} />

              <div className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <Card padding="lg">
                  <Stat
                    value={thesis.premium.stat}
                    label={thesis.premium.label}
                    sub={thesis.premium.body}
                    source={{
                      label: thesis.premium.source.label,
                      url: thesis.premium.source.url,
                    }}
                  />
                </Card>

                <Card padding="lg">
                  <Heading level={3} size="h4" balance>
                    {thesis.nuance.title}
                  </Heading>
                  <Text size="small" className="mt-4">
                    {thesis.nuance.body}
                  </Text>
                  <blockquote className="mt-6 border-l-2 border-primary pl-5">
                    <Text size="lead" tone="ink" className="font-display">
                      &ldquo;{thesis.nuance.quote}&rdquo;
                    </Text>
                    <footer className="mt-3">
                      <Kicker>{thesis.nuance.attribution}</Kicker>
                    </footer>
                  </blockquote>
                  <Source
                    label={thesis.nuance.source.label}
                    url={thesis.nuance.source.url}
                    className="mt-6"
                  />
                </Card>
              </div>

              <Callout tone="verified" className="mt-10 max-w-4xl">
                {thesis.conclusion}
              </Callout>

              <Card padding="lg" className="mt-12">
                <Heading level={3} size="h4" balance>
                  {thesis.proof.title}
                </Heading>
                <Text size="small" className="mt-4 max-w-3xl">
                  {thesis.proof.body}
                </Text>
                <div className="mt-6">
                  <Button
                    href="/indispensable"
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    See the full freelancer vs employee breakdown on Become Indispensable
                  </Button>
                </div>
              </Card>
            </section>

            {/* --------------------------------------------------------- PAY */}
            <section id="pay">
              <SectionHeading kicker={pay.kicker} title={pay.title} />

              <Callout tone="caution" title={pay.warning.title} className="mt-10">
                <Badge tone="caution">Warning label</Badge>
                <Text size="small" className="mt-4 max-w-3xl">
                  {pay.warning.body}
                </Text>
              </Callout>

              <Card padding="lg" className="mt-10">
                <Text size="small" tone="ink" className="max-w-2xl font-medium">
                  {pay.tiersNote}
                </Text>
                <Text size="small" className="mt-4 max-w-2xl">
                  We moved the full picture to its own page so it can breathe: the tier ranges,
                  the roles clients are hiring for now, full-time vs hourly vs retainer, and how
                  to price yourself. Same warning label, all the way down.
                </Text>
                <div className="mt-6">
                  <Button href="/salary">Open the Salary Guide</Button>
                </div>
              </Card>
            </section>

            {/* ----------------------------------------------------- UNKNOWN */}
            <section id="unknown">
              <SectionHeading kicker={unknown.kicker} title={unknown.title} lead={unknown.lead} />

              <div className="mt-12 flex flex-col gap-4">
                {unknown.items.map((u) => (
                  <Card key={u.id} as="article">
                    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-8">
                      <div>
                        <Text
                          size="lead"
                          tone="faint"
                          className="font-display line-through decoration-coral/50 decoration-2"
                        >
                          {u.claim}
                        </Text>
                        <div className="mt-3">
                          <Badge tone="coral">{u.verdict}</Badge>
                        </div>
                      </div>
                      <Text size="small">{u.why}</Text>
                    </div>
                  </Card>
                ))}
              </div>

              <Callout tone="signal" className="mt-8 max-w-2xl">
                {unknown.close}
              </Callout>
            </section>

            {/* ----------------------------------------------------- READING */}
            <section id="reading">
              <SectionHeading kicker={reading.kicker} title={reading.title} lead={reading.lead} />

              <div className="mt-12 flex flex-col gap-14">
                {reading.groups.map((g) => (
                  <div key={g.id}>
                    <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                      <Heading level={3} size="h3">
                        {g.title}
                      </Heading>
                      <Text size="small" className="max-w-2xl">
                        {g.note}
                      </Text>
                    </div>

                    <CardGrid cols={3} className="mt-7">
                      {g.items.map((item) => (
                        <Card key={item.url} href={item.url} as="article">
                          <Kicker>{item.org}</Kicker>
                          <Heading level={4} size="h5" className="mt-3" balance>
                            {item.title}
                          </Heading>
                          <Text size="small" className="mt-3 flex-1">
                            {item.why}
                          </Text>
                          <Text
                            size="caption"
                            tone="faint"
                            className="mt-5 inline-flex items-center gap-1.5"
                          >
                            Open the source
                            <Icon name="arrow-up-right" size={12} />
                          </Text>
                        </Card>
                      ))}
                    </CardGrid>
                  </div>
                ))}
              </div>

              <Card className="mt-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Text size="small" className="max-w-xl">
                    Looking for open courses, government programs, and YouTube channels to
                    actually build the skills? We keep the whole shelf, and how to judge any
                    course, on one page.
                  </Text>
                  <Button
                    href="/resources"
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    Open the Resources shelf
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={3} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/tasks">Start building proof</Button>
          <Button href="/niches" variant="outline">
            Pick your lane
          </Button>
        </div>

        <Text size="small" className="mt-10 max-w-2xl border-t border-line-strong pt-6">
          {closing.last}
        </Text>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/reality" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Confirm the hand-rolled bars are gone**

Run:
```bash
grep -nE "ChangeBar|GrowthBar|style=\{\{ *width|absolute inset-y|conic-gradient" app/reality/page.tsx || echo "no hand-rolled bars"
grep -c "<Bars" app/reality/page.tsx
grep -c "<DiagramFrame" app/reality/page.tsx
```
Expected: `no hand-rolled bars`; the `<Bars` count equals `ai.charts.length + growth.groups.length`; the `<DiagramFrame` count equals the same number.

- [ ] **Step 3: Confirm every source survived**

Run:
```bash
node -e "
const fs=require('fs');
const raw=JSON.stringify(require('./data/reality.json'));
const inJson=(raw.match(/\"source2?\":\{/g)||[]).length;
const src=fs.readFileSync('app/reality/page.tsx','utf8');
const rendered=(src.match(/<Source\b/g)||[]).length + (src.match(/source=\{\{/g)||[]).length;
console.log('reality.json source objects:', inJson, '| page renders:', rendered);
console.log('sourceNote fields:', (raw.match(/\"sourceNote\":/g)||[]).length, '| page sourceNote renders:', (src.match(/sourceNote/g)||[]).length);
if (rendered < inJson) { console.error('FAIL: a source was dropped'); process.exit(1); }
"
```
Expected: `page renders` ≥ `source objects`, and the guard does not exit 1.

- [ ] **Step 4: Confirm the de-slop sweep**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Soft|Border)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|caution-text|rounded-2xl|blur-|hover:-translate|font-mono|bg-ink" app/reality/page.tsx || echo "clean"
```
Expected: `clean` — note this asserts the mid-page navy `thesis` band is gone (§9).

- [ ] **Step 5: Type-check, lint, build, verify**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep "app.reality" || echo "clean"
npm run verify:claims
```
Expected: silent, clean, build green, `clean`, and `verify:claims` reporting `reality.json` still within its review window.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/reality/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(reality): rebuild on the Data archetype; ChangeBar and GrowthBar become chart primitives"
```

---

### Task 8: `/salary` — Data archetype, no invented chart

**Parallel group:** C

**Files:**
- Replace (whole file): `app/salary/page.tsx`

**Interfaces:**
- Consumes: the standard layout/ui set; `RateCalculator` and `RateWorksheet` (migrated in Batch C — their APIs do not change).
- Produces: nothing importable.

**Why no chart here** — see the scope note at the top of this plan. `salary.rates.tiers[].monthly` and `.hourly` are strings ("₱35,000–60,000/mo"), and `rates.contradiction.a/.b` are two labelled strings. Drawing bars would require parsing ranges into midpoints, which invents a number the source never published. The tiers become `Stat`s inside `Card`s; the contradiction becomes two `Stat`s either side of the word "vs".

**Icon mapping:** `ExternalLink` → absorbed by `<Source>`; `Check` → `check`; `X` → `x`.

- [ ] **Step 1: Write `app/salary/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import salary from "@/data/salary.json";
import { RateCalculator } from "@/components/rate-calculator";
import { RateWorksheet } from "@/components/rate-worksheet";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  SourceList,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/salary";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Salary Guide",
  description:
    "What online work really pays for Filipino professionals right now. In-demand roles from live OnlineJobs.ph listings, honest vendor-grade pay ranges, full-time vs part-time vs hourly vs project vs retainer, and how to price yourself. Every number labeled for what it is.",
});

const TOC = [
  { id: "warning", label: "Warning label" },
  { id: "in-demand", label: "In demand" },
  { id: "emerging", label: "Emerging" },
  { id: "rates", label: "The ranges" },
  { id: "worksheet", label: "Price it yourself" },
  { id: "engagement", label: "Engagement types" },
  { id: "price", label: "How to price" },
  { id: "calculator", label: "Real rate" },
];

export default function SalaryPage() {
  const { hero, warning, inDemand, emerging, rates, engagement, price, closing } = salary;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        <FreshnessNote date={salary.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/salary" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ----------------------------------------------------- WARNING */}
            <section id="warning">
              <Callout tone="caution" title={warning.title}>
                <Badge tone="caution">Warning label</Badge>
                <Text size="small" className="mt-4 max-w-3xl">
                  {warning.body}
                </Text>
              </Callout>
            </section>

            {/* --------------------------------------------------- IN DEMAND */}
            <section id="in-demand">
              <SectionHeading
                kicker={inDemand.kicker}
                title={inDemand.title}
                lead={inDemand.lead}
              />
              <CardGrid cols={4} className="mt-12">
                {inDemand.roles.map((r) => (
                  <Card key={r.role} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={r.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5" balance>
                      {r.role}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {r.blurb}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
              <Callout tone="verified" className="mt-8">
                <Text size="lead" tone="ink" className="font-display">
                  {inDemand.note}
                </Text>
                <Source
                  label={inDemand.source.label}
                  url={inDemand.source.url}
                  className="mt-3"
                />
              </Callout>
            </section>

            {/* ---------------------------------------------------- EMERGING */}
            <section id="emerging">
              <SectionHeading
                kicker={emerging.kicker}
                title={emerging.title}
                lead={emerging.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {emerging.roles.map((r) => (
                  <Card key={r.role} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary text-white">
                      <Icon name={r.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5" balance>
                      {r.role}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {r.blurb}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
              <Callout tone="signal" className="mt-8 max-w-3xl">
                {emerging.note}
              </Callout>
              <Text size="small" tone="ink" className="mt-5 max-w-3xl font-medium">
                {emerging.note2}
              </Text>
              <Source
                label={emerging.source.label}
                url={emerging.source.url}
                className="mt-3"
              />
            </section>

            {/* ------------------------------------------------------- RATES */}
            <section id="rates">
              <SectionHeading kicker={rates.kicker} title={rates.title} />
              <Text size="small" tone="ink" className="mt-6 max-w-2xl font-medium">
                {rates.monthlyNote}
              </Text>

              <CardGrid cols={3} className="mt-10">
                {rates.tiers.map((t) => {
                  const a = accent(t.accent);
                  return (
                    <Card key={t.level} as="article">
                      <span aria-hidden className={cn("h-1 w-10 rounded-pill", a.fill)} />
                      <div className="mt-5">
                        <Kicker tone={t.accent as "signal"}>{t.level}</Kicker>
                      </div>
                      <StatStrip className="mt-3">
                        <Stat value={t.monthly} label={t.hourly} />
                      </StatStrip>
                      <Text size="small" className="mt-5 flex-1">
                        {t.what}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>

              <Card padding="lg" className="mt-6">
                <Heading level={3} size="h3" balance>
                  {rates.contradiction.title}
                </Heading>
                <Text size="small" className="mt-4 max-w-3xl">
                  {rates.contradiction.body}
                </Text>

                <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <Card padding="sm" className="text-center">
                    <StatStrip className="justify-center">
                      <Stat
                        value={rates.contradiction.a.value}
                        label={rates.contradiction.a.label}
                      />
                    </StatStrip>
                  </Card>
                  <Text size="lead" tone="inherit" className="text-center font-display text-primary">
                    vs
                  </Text>
                  <Card padding="sm" className="text-center">
                    <StatStrip className="justify-center">
                      <Stat
                        value={rates.contradiction.b.value}
                        label={rates.contradiction.b.label}
                      />
                    </StatStrip>
                  </Card>
                </div>

                <Callout tone="signal" className="mt-7 max-w-3xl">
                  {rates.contradiction.lesson}
                </Callout>

                <SourceList sources={rates.sources} className="mt-7 border-t border-line pt-5" />
              </Card>
            </section>

            {/* --------------------------------------------------- WORKSHEET */}
            <section id="worksheet">
              <Card padding="lg">
                <RateWorksheet />
              </Card>
            </section>

            {/* -------------------------------------------------- ENGAGEMENT */}
            <section id="engagement">
              <SectionHeading
                kicker={engagement.kicker}
                title={engagement.title}
                lead={engagement.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {engagement.types.map((t) => (
                  <Card key={t.name} as="article">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={t.icon} size={18} />
                      </span>
                      <Heading level={3} size="h5">
                        {t.name}
                      </Heading>
                    </div>
                    <Text size="caption" className="mt-3 font-medium text-verified">
                      {t.best}
                    </Text>

                    <ul className="mt-4 flex flex-col gap-2">
                      {t.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2">
                          <Icon name="check" size={15} className="mt-0.5 shrink-0 text-verified" />
                          <Text size="small" tone="ink" as="span">
                            {p}
                          </Text>
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-3 flex flex-col gap-2">
                      {t.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <Icon name="x" size={15} className="mt-0.5 shrink-0 text-coral" />
                          <Text size="small" as="span">
                            {c}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ------------------------------------------------------- PRICE */}
            <section id="price">
              <SectionHeading kicker={price.kicker} title={price.title} lead={price.lead} />
              <StepList className="mt-14">
                {price.steps.map((s) => (
                  <Step key={s.n} n={s.n} title={s.title}>
                    {s.desc}
                  </Step>
                ))}
              </StepList>
            </section>

            {/* -------------------------------------------------- CALCULATOR */}
            <section id="calculator">
              <SectionHeading
                kicker="Do the math yourself"
                title="Your real rate calculator."
                lead="Drag the sliders with your own numbers. Watch your headline rate shrink into what you actually take home, once the fees, the costs, the tax, and the unpaid time are counted. This is the honest number to plan your life around."
              />
              <Card padding="lg" className="mt-12">
                <RateCalculator />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={4} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/niches">Pick your lane</Button>
          <Button href="/reality" variant="outline">
            See the full market data
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/salary" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Confirm every source and every tier survived**

Run:
```bash
node -e "
const fs=require('fs'); const s=require('./data/salary.json');
const src=fs.readFileSync('app/salary/page.tsx','utf8');
console.log('tiers in JSON:', s.rates.tiers.length, '| rates.sources:', s.rates.sources.length);
console.log('page <Source>:', (src.match(/<Source\b/g)||[]).length, '| <SourceList>:', (src.match(/<SourceList\b/g)||[]).length);
console.log('engagement types:', s.engagement.types.length, '| price steps:', s.price.steps.length);
"
```
Expected: three standalone `<Source>` (inDemand, emerging, and none missing) plus one `<SourceList>` for `rates.sources`.

- [ ] **Step 3: Confirm the de-slop sweep**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|caution-text|rounded-2xl|blur-|hover:-translate|font-mono|bg-ink py" app/salary/page.tsx || echo "clean"
```
Expected: `clean`.

- [ ] **Step 4: Type-check, lint, build, verify**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep "app.salary" || echo "clean"
```
Expected: silent, clean, build green, `clean`.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/salary/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(salary): rebuild on the Data archetype; ranges stay strings, no chart is invented"
```
---

### Task 9: `/markets` — Data archetype, and the `TimezoneOverlap` insertion point

**Parallel group:** C

**Files:**
- Replace (whole file): `app/markets/page.tsx`

**Interfaces:**
- Consumes: the standard layout/ui set. No chart (see the scope note); no new imports beyond the primitives.
- Produces: nothing importable.

**Two content decisions:**

1. **Emoji flags go** (§9), on both `regions.items[].flag` and `abroad.items[].flag`. The data keeps the field; the page stops rendering it. Each region card leads with its name and carries its accent as a hairline rule, exactly as `/languages` does.
2. **`TimezoneOverlap` is reserved, not built.** It is a Phase 6 practice component (§5.2b). The `overlap` section keeps its prose and gains the insertion comment.

**Body sections in the rail:** five (overlap, regions, strategies, find-industry, abroad), which is under the six-section threshold — so `/markets` uses the alternating-band layout, not the `Toc` rail.

**Icon mapping:** `ExternalLink` → absorbed by `<Source>` and by `arrow-up-right` on crossrefs.

- [ ] **Step 1: Write `app/markets/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import markets from "@/data/markets.json";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/markets";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Client Markets & Time Zones",
  description:
    "Where your online clients are (US, UK & EU, Australia, Middle East, Canada, regional Asia), how each market differs in pay, culture, and industries, and the timezone and overlap-hours math for a Filipino professional on UTC+8.",
});

/** One labelled row of a region card. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-2">
      <Kicker className="border-0 px-0 py-0">{label}</Kicker>
      <Text size="small" as="span">
        {children}
      </Text>
    </div>
  );
}

export default function MarketsPage() {
  const { hero, overlap, regions, strategies, findIndustry, abroad, closing } = markets;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/markets" /></Section> */}
      </PageHero>

      {/* ------------------------------------------------------------ OVERLAP */}
      <Section band="tint" id="overlap">
        <SectionHeading kicker={overlap.kicker} title={overlap.title} lead={overlap.lead} />
        <Callout tone="verified" className="mt-8 max-w-3xl">
          {overlap.note}
        </Callout>
        {/* practice: TimezoneOverlap — Phase 6 mounts <TimezoneOverlap regions={regions.items} /> here */}
      </Section>

      {/* ------------------------------------------------------------ REGIONS */}
      <Section id="regions">
        <SectionHeading kicker={regions.kicker} title={regions.title} lead={regions.lead} />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {regions.items.map((r) => {
            const a = accent(r.accent);
            return (
              <Card key={r.name} as="article" padding="lg">
                <Heading level={3} size="h3">
                  {r.name}
                </Heading>
                <span aria-hidden className={cn("mt-4 h-1 w-12 rounded-pill", a.fill)} />

                <div className="mt-4 divide-y divide-line">
                  <Row label="Time zone">{r.tz}</Row>
                  <Row label="Vs PH">{r.offset}</Row>
                  <Row label="Overlap">{r.overlap}</Row>
                  <Row label="Pay">{r.pay}</Row>
                  <Row label="Style">{r.style}</Row>
                  <Row label="Industries">{r.industries}</Row>
                </div>

                <Text
                  size="small"
                  tone="ink"
                  className={cn("mt-5 border-l-2 pl-4 font-medium", a.border)}
                >
                  {r.verdict}
                </Text>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------- STRATEGIES */}
      <Section band="tint" id="strategies">
        <SectionHeading kicker={strategies.kicker} title={strategies.title} lead={strategies.lead} />

        <CardGrid cols={3} className="mt-14">
          {strategies.items.map((s) => (
            <Card key={s.name} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary text-white">
                <Icon name={s.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {s.name}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {s.desc}
              </Text>
              <div className="mt-4 border-l-2 border-primary pl-4">
                <Kicker>The trade-off</Kicker>
                <Text size="small" tone="ink" className="mt-1">
                  {s.tradeoff}
                </Text>
              </div>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10">
          <Button
            href={strategies.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {strategies.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------ FIND INDUSTRY */}
      <Section id="find-industry">
        <SectionHeading
          kicker={findIndustry.kicker}
          title={findIndustry.title}
          lead={findIndustry.lead}
        />
        <StepList className="mt-12">
          {findIndustry.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>
        <div className="mt-6">
          <Button
            href={findIndustry.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {findIndustry.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------------- ABROAD */}
      <Section band="tint" id="abroad">
        <SectionHeading kicker={abroad.kicker} title={abroad.title} lead={abroad.lead} />

        <CardGrid cols={3} className="mt-12">
          {abroad.items.map((v) => (
            <Card key={v.country} as="article" onBand>
              <Heading level={3} size="h5">
                {v.country}
              </Heading>
              <div className="mt-2">
                <Kicker tone="signal">{v.visa}</Kicker>
              </div>
              <Text size="small" className="mt-3 flex-1">
                {v.detail}
              </Text>
              <Source label={v.source.label} url={v.source.url} className="mt-4" />
            </Card>
          ))}
        </CardGrid>

        <Text size="small" className="mt-8 max-w-3xl">
          {abroad.note}
        </Text>
        <Callout tone="signal" className="mt-5 max-w-2xl">
          {abroad.point}
        </Callout>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section>
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={4} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href}>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/salary">See what each market pays</Button>
          <Button href="/apply" variant="outline">
            Find clients yourself
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/markets" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Confirm the flags are gone and the insertion point is present**

Run:
```bash
grep -n "\.flag" app/markets/page.tsx || echo "no flag rendered"
grep -c "practice:" app/markets/page.tsx
node -e "const m=require('./data/markets.json'); console.log('regions:', m.regions.items.length, '| abroad:', m.abroad.items.length, '| flags still in data:', m.regions.items.filter(r=>r.flag).length + m.abroad.items.filter(r=>r.flag).length);"
```
Expected: `no flag rendered`; `3` practice comments (Tldr, TimezoneOverlap, Quiz); the data untouched.

- [ ] **Step 3: Confirm the de-slop sweep and every source**

Run:
```bash
grep -nE "Reveal|lucide-react|const accent(Text|Bar|Border)|function Source\(|container-x|paper-2|paper-3|bg-signal|text-signal|rounded-2xl|blur-|hover:-translate|link-sweep|bg-ink py" app/markets/page.tsx || echo "clean"
node -e "
const fs=require('fs');
console.log('abroad sources in JSON:', require('./data/markets.json').abroad.items.filter(i=>i.source).length);
console.log('page <Source> tags:', (fs.readFileSync('app/markets/page.tsx','utf8').match(/<Source\b/g)||[]).length);
"
```
Expected: `clean`, and the two counts equal.

- [ ] **Step 4: Type-check, lint, build, verify**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep "app.markets" || echo "clean"
```
Expected: silent, clean, build green, `clean`.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/markets/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(markets): Data archetype, emoji flags removed, TimezoneOverlap insertion point reserved"
```

---

### Task 10: `/simulator` and `career-simulator.tsx` — the curve moves onto `Line`

**Parallel group:** C

**Files:**
- Replace (whole file): `app/simulator/page.tsx`
- Edit script (793 lines, over the 600-line threshold): `components/career-simulator.tsx`
- Create: `components/career-simulator.test.tsx`

**Interfaces:**
- Consumes: `Line`, `Legend` from `@/components/diagrams/charts`; `Field`, `ChoiceCard`, `Input`, `Badge`, `Button`, `Callout`, `Card`, `DiagramFrame`, `Heading`, `Icon`, `Source`, `Stat`, `StatStrip`, `Text` from `@/components/ui`; `Card`/`Section` etc. from `@/components/layout` on the page.
- Produces: `CareerSimulator` — unchanged export name and unchanged (empty) props.

**Frozen, byte for byte:** the whole `@/lib/simulator-math` import list, `useState`/`useMemo` shapes, `fxText`/`fxNum`/`fx` handling, `model`, `gapNote`, `tableRows`, `MILESTONES`, `ITEMS`, `SOURCES`, `usd`, `peso`, and the `ariaLabel` sentence the model builds. The edit script never touches those lines.

**Accessibility note:** `TrajectoryChart` currently carries `role="img" aria-label={ariaLabel}` with a generated sentence naming the month-6 and month-36 values on both lines. `DiagramFrame` supplies the accessible name from its title and caption, so the generated sentence would be lost. It is kept as a visually hidden paragraph immediately before the frame — the sentence is more useful than the frame's title, and the data table below stays the full non-visual fallback.

- [ ] **Step 1: Write `app/simulator/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import sim from "@/data/simulator.json";
import { CareerSimulator } from "@/components/career-simulator";
import {
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  SourceList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/simulator";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Career Simulator",
  description:
    "Time does not raise your rate. Set your craft, your AI, and what you sell, then watch 36 months of a generic task-taker and 36 months of a specialist diverge. A model, not a prediction, with every assumption tagged.",
});

export default function SimulatorPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={sim.hero.kicker}
        title={sim.hero.titleLine1}
        accent={sim.hero.titleLine2}
        lead={sim.hero.lead}
      >
        <Text size="small" className="max-w-2xl">
          {sim.intro}
        </Text>
      </PageHero>

      {/* ------------------------------------------------------- MODEL BANNER */}
      <Section spacing="none" className="pb-10">
        <Callout tone="caution" icon="alert-triangle" title={sim.banner.title}>
          <Text size="small" className="max-w-3xl">
            {sim.banner.body}
          </Text>
        </Callout>
      </Section>

      {/* -------------------------------------------------------- DATA HONESTY */}
      <Section spacing="none" className="pb-14">
        <Card padding="lg">
          <Badge>Vendor-grade, not survey-grade</Badge>
          <Heading level={2} size="h3" className="mt-5 max-w-3xl" balance>
            {sim.dataHonesty.title}
          </Heading>
          <Text size="small" className="mt-4 max-w-3xl">
            {sim.dataHonesty.body}
          </Text>
          <Callout tone="signal" className="mt-4 max-w-3xl">
            {sim.dataHonesty.disagreement}
          </Callout>
          <SourceList sources={sim.dataHonesty.sources} className="mt-5" />
        </Card>
      </Section>

      {/* ----------------------------------------------------------- SIMULATOR */}
      <Section spacing="none" className="pb-20 lg:pb-24">
        <Card padding="lg">
          <CareerSimulator />
        </Card>
      </Section>

      {/* --------------------------------------------------------------- OUTRO */}
      <Section band="tint">
        <SectionHeading kicker="Where this goes next" title={sim.outro.title} lead={sim.outro.body} />
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Button href="/reality" variant="outline">
            {sim.outro.realityLabel}
          </Button>
          <Button
            href="/niches"
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {sim.outro.nichesLabel}
          </Button>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Apply the `components/career-simulator.tsx` edit script**

**Edit 1 — the import block.** Replace lines 1–30 (from `"use client";` through the closing `} from "@/lib/simulator-math";`) with exactly this. The `@/lib/simulator-math` import list is reproduced unchanged; do not reorder it.

```tsx
"use client";

import { useId, useMemo, useState } from "react";
import sim from "@/data/simulator.json";
import { Legend, Line } from "@/components/diagrams/charts";
import {
  Badge,
  Button,
  Callout,
  Card,
  ChoiceCard,
  DiagramFrame,
  Field,
  Heading,
  Icon,
  Input,
  Source,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  BASE,
  BASE_RANGE,
  DEFAULT_FX,
  MONTHS,
  NON_PAYMENT_RISK,
  aiMultiplier,
  baselineOf,
  clientsMultiplier,
  hourlyAt,
  languageMultiplier,
  monthlyBilled,
  monthlyEffective,
  ownershipMultiplier,
  type Ai,
  type Clients,
  type Config,
  type Craft,
  type Hours,
  type Language,
  type Ownership,
} from "@/lib/simulator-math";
```

`next/link` is dropped: its only use was the hand-styled CTA in the AI callout, which becomes `<Button href>` in Edit 6.

**Edit 2 — delete the page-local `Source`.** Remove this whole block:

```tsx
function Source({ label, url }: SourceRef) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-signal"
    >
      Source: {label}
      <ExternalLink size={11} aria-hidden className="opacity-60" />
    </a>
  );
}
```

Keep the `type SourceRef`, `ITEMS`, `SOURCES` and `MILESTONES` declarations directly above it exactly as they are — `SourceRef` still types the `SOURCES` map, and `<Source {...SOURCES["upwork-skills"]} />` spreads onto the shared primitive with the same `{label, url}` shape.

**Edit 3 — `ChoiceGroup` onto `Field` + `ChoiceCard`.** Replace the whole `function ChoiceGroup({ … }) { … }` body (from `  return (\n    <fieldset className="rounded-2xl border border-line bg-paper p-5">` through the matching `  );\n}`) with:

```tsx
  return (
    <Card padding="sm">
      <Field as="group" label={legend} hint={help}>
        <div className={cn("mt-2 grid gap-2", compact && "grid-cols-1 sm:grid-cols-3")}>
          {options.map((o) => (
            <ChoiceCard
              key={o.id}
              name={name}
              value={o.id}
              label={o.label}
              description={o.desc}
              checked={value === o.id}
              onChange={onChange}
            />
          ))}
        </div>
      </Field>
    </Card>
  );
```

The props object, the `Option` type and the `name`/`value`/`onChange` contract are untouched, so all six call sites keep working with no change. `ChoiceCard` calls `onChange(event.target.value)`, which is the same `(id: string) => void` the old `onChange={() => onChange(o.id)}` produced.

**Edit 4 — `TrajectoryChart` onto `Line`.** Replace everything from

```tsx
const W = 780;
const H = 320;
const PAD = { l: 56, r: 18, t: 18, b: 34 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;
```

through the closing `}` of `function TrajectoryChart(...)` with:

```tsx
function TrajectoryChart({
  rows,
  yMax,
}: {
  rows: { m: number; base: number; path: number }[];
  yMax: number;
}) {
  return (
    <Line
      xDomain={[0, MONTHS]}
      yDomain={[0, yMax]}
      xTickCount={6}
      yTickCount={4}
      formatX={(m) => String(m)}
      formatY={(v) => usd(v)}
      xTitle="Months from today"
      band={{ seriesId: "path", drop: NON_PAYMENT_RISK }}
      series={[
        {
          id: "base",
          label: sim.chart.baselineLabel,
          dashed: true,
          points: rows.map((r) => ({ x: r.m, y: r.base })),
        },
        {
          id: "path",
          label: sim.chart.pathLabel,
          focal: true,
          points: rows.map((r) => ({ x: r.m, y: r.path })),
        },
      ]}
    />
  );
}
```

The `ariaLabel` prop is dropped from the component (Edit 6 renders the sentence as an sr-only paragraph instead); `model.ariaLabel` itself is **not** removed from the `useMemo`.

**Edit 5 — the FX field.** Replace:

```tsx
        <div className="rounded-2xl border border-line bg-paper p-5">
          <label htmlFor={`${uid}-fx`} className="kicker">
            {sim.fx.label}
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              id={`${uid}-fx`}
              type="number"
              min={30}
              max={120}
              step={0.5}
              value={fxText}
              onChange={(e) => setFxText(e.target.value)}
              onBlur={() => {
                if (!(Number.isFinite(fxNum) && fxNum > 0))
                  setFxText(String(DEFAULT_FX));
              }}
              className="w-28 rounded-xl border border-line-strong bg-paper-2 px-4 py-2.5 text-sm font-semibold text-ink outline-none focus-visible:border-ink"
            />
            <span className="text-sm text-ink-soft">{sim.fx.suffix}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            {sim.fx.note}
          </p>
        </div>
```

with:

```tsx
        <Card padding="sm">
          <Field label={sim.fx.label} hint={sim.fx.note}>
            <div className="flex items-center gap-3">
              <Input
                id={`${uid}-fx`}
                type="number"
                min={30}
                max={120}
                step={0.5}
                value={fxText}
                onChange={(e) => setFxText(e.target.value)}
                onBlur={() => {
                  if (!(Number.isFinite(fxNum) && fxNum > 0)) setFxText(String(DEFAULT_FX));
                }}
                className="w-28"
              />
              <Text size="small" as="span">
                {sim.fx.suffix}
              </Text>
            </div>
          </Field>
        </Card>
```

The `fxText` / `fxNum` / `DEFAULT_FX` logic is character-for-character the same.

**Edit 6 — the results column.** Apply these six replacements in order.

1. Summary card shell. Replace

```tsx
        <div
          className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:p-8"
        >
```
with
```tsx
        <Card padding="lg">
```
and its matching closing `</div>` (the one directly before `{/* AI-with-no-craft callout, the heart of the model */}`) with `</Card>`.

2. Inside it, replace

```tsx
            <h2 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
              {sim.results.title}
            </h2>
            <Pill tone="caution">
              <TriangleAlert size={12} aria-hidden />
              {sim.results.modelPill}
            </Pill>
```
with
```tsx
            <Heading level={2} size="h3">
              {sim.results.title}
            </Heading>
            <Badge tone="caution">
              <Icon name="alert-triangle" size={12} />
              {sim.results.modelPill}
            </Badge>
```

3. Replace the milestone grid's four `<div className="rounded-2xl border border-line bg-paper p-4">` blocks — that is, the whole body of the `MILESTONES.map((m) => ( … ))` — with:

```tsx
              <Card key={m} padding="sm">
                <Text size="caption" tone="faint" className="tabular-nums uppercase tracking-wider">
                  Month {m}
                </Text>
                <StatStrip className="mt-2">
                  <Stat
                    value={usd(monthlyEffective(config, m))}
                    label={peso(monthlyEffective(config, m), fx)}
                    sub={`${usd(monthlyBilled(config, m))} ${sim.results.billedNote}`}
                  />
                </StatStrip>
              </Card>
```

4. Replace the AI callout's outer shell

```tsx
          <div className="rounded-[var(--radius-lg)] border-2 border-signal bg-signal-tint p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                aria-hidden
                className="mt-1 shrink-0 text-signal-deep"
              />
              <div className="min-w-0">
                <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
                  {sim.aiCallout.title}
                </h3>
```
with
```tsx
          <Callout tone="signal" icon="alert-triangle" title={sim.aiCallout.title}>
            <div className="min-w-0">
```
and close the block with `</div>\n          </Callout>` in place of the two `</div>`s plus the outer `</div>`.

5. Inside that callout, replace the hand-styled CTA

```tsx
                <Link
                  href="/niches"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper-2 transition-colors hover:bg-signal-deep"
                >
                  {sim.aiCallout.cta}
                </Link>
```
with
```tsx
                <div className="mt-5">
                  <Button href="/niches">{sim.aiCallout.cta}</Button>
                </div>
```

6. Replace the chart `<figure>` shell. From

```tsx
        <figure className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
          <figcaption>
            <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
              {sim.chart.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {sim.chart.lead}
            </p>
          </figcaption>
```
through the end of the legend `</ul>` and the chart wrapper

```tsx
          <div className="mt-4">
            <TrajectoryChart
              rows={model.rows}
              yMax={model.yMax}
              ariaLabel={model.ariaLabel}
            />
          </div>
          <p className="mt-1 text-center font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            Months from today
          </p>
```

with:

```tsx
        <Card padding="lg" as="section">
          <Legend
            className="mb-5"
            items={[
              { id: "base", label: sim.chart.baselineLabel, kind: "dashed" },
              { id: "path", label: sim.chart.pathLabel, kind: "line", focal: true },
              { id: "risk", label: sim.chart.riskBandLabel, kind: "band" },
            ]}
          />

          {/* The generated sentence is richer than the frame's title, so it is kept
              for screen readers; the data table below is the full fallback. */}
          <p className="sr-only">{model.ariaLabel}</p>

          <DiagramFrame title={sim.chart.title} caption={sim.chart.lead}>
            <TrajectoryChart rows={model.rows} yMax={model.yMax} />
          </DiagramFrame>
```

and replace the figure's closing `</figure>` (the one after the data table's `</div>`) with `</Card>`.

7. Replace the risk-band note

```tsx
          <p className="mt-5 rounded-2xl border border-signal/25 bg-signal-tint p-4 text-xs leading-relaxed text-ink-soft">
            {sim.chart.riskBandNote}
          </p>
```
with
```tsx
          <Callout tone="signal" className="mt-5">
            <Text size="caption">{sim.chart.riskBandNote}</Text>
          </Callout>
```

8. In the data table, replace every `font-mono text-[11px] uppercase tracking-wider text-ink-faint` with `text-caption uppercase tracking-wider text-ink-faint tabular-nums`, and every `font-mono text-xs font-normal text-ink-faint` with `text-caption tabular-nums text-ink-faint`. Leave `<table>`, `<caption>`, `<thead>`, `<tbody>` and the `tableRows` map alone.

**Edit 7 — the multiplier list.** Replace the three remaining `<li className="rounded-2xl border …">` shells with `<Card as="li" padding="sm">`, replace `<Pill tone=…>` with `<Badge tone=…>`, replace `font-display text-lg` value spans with `<Text size="lead" tone="ink" as="span" className="font-display">`, and replace `font-mono text-[11px] uppercase tracking-wider text-ink-faint` with `text-caption uppercase tracking-wider text-ink-faint tabular-nums`. The `model.multipliers` array, the `neutral` test and the `row.sourced` badge logic are untouched.

**Edit 8 — the reality-tax pair.** Replace

```tsx
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-6">
```
with `<Card padding="md">` (and its `</div>` with `</Card>`), and

```tsx
          <div className="rounded-[var(--radius-lg)] border border-signal/30 bg-signal-tint p-6">
```
with `<Callout tone="signal" title={sim.realityTax.nonPayment.title}>` — moving the `<h3>` into the `title` prop and closing with `</Callout>`.

**Edit 9 — the remaining `is-circle` escape hatches.** `grep -n "is-circle" components/career-simulator.tsx`; every hit was inside the old `ChoiceGroup` radio and is removed by Edit 3. If any survive, delete the class — Phase 0 already deleted the rule it referenced.

- [ ] **Step 3: Write the RTL smoke test**

Create `components/career-simulator.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { CareerSimulator } from "@/components/career-simulator";

describe("CareerSimulator", () => {
  it("renders the controls, the chart and the data table", () => {
    render(<CareerSimulator />);
    expect(screen.getByRole("group", { name: /craft/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /trajector|month|dollar/i })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("changing a choice changes the projection", async () => {
    const user = userEvent.setup();
    render(<CareerSimulator />);
    const before = screen.getByRole("table").textContent;
    const radios = screen.getAllByRole("radio");
    // Pick a radio that is not already selected.
    const target = radios.find((r) => !(r as HTMLInputElement).checked);
    expect(target).toBeDefined();
    await user.click(target as HTMLElement);
    expect(screen.getByRole("table").textContent).not.toBe(before);
  });

  it("keeps the FX field usable and falls back to the default on a bad value", async () => {
    const user = userEvent.setup();
    render(<CareerSimulator />);
    const fx = screen.getByRole("spinbutton");
    await user.clear(fx);
    await user.tab();
    expect((fx as HTMLInputElement).value).not.toBe("");
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run components/career-simulator.test.tsx`
Expected: PASS — 3 tests. If the `role="img"` query fails, `DiagramFrame` is not wrapping the chart — fix the component, not the test.

- [ ] **Step 5: Prove the maths and the state did not move**

Run:
```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff -- components/career-simulator.tsx | grep -E "^[-+].*(useState|useMemo|localStorage|simulator-math|monthlyEffective|monthlyBilled|hourlyAt|baselineOf|NON_PAYMENT_RISK|DEFAULT_FX|MILESTONES|verdicts)" | grep -v "^[-+].*import" || echo "no logic lines touched"
```
Expected: `no logic lines touched` — the only permitted hits are the `import` lines the grep already excludes and the `NON_PAYMENT_RISK` reference that moved into the `band` prop; if that one line shows, confirm by eye that its value is unchanged.

Run: `node --test lib/simulator-math.test.mjs`
Expected: PASS — the math suite is untouched and must stay green.

- [ ] **Step 6: Type-check, lint, build, verify**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep -E "app.simulator|career-simulator" || echo "clean"
```
Expected: silent, clean, build green, `clean`.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/simulator/page.tsx components/career-simulator.tsx components/career-simulator.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(simulator): trajectory chart onto the Line primitive, controls onto ChoiceCard; model untouched"
```
---

## Batch C — the 16 workshops (Tasks 11–17)

`search-palette` is the 17th tool in the spec's count and Phase 2 already rebuilt it on `Dialog`, so Batch C migrates the remaining 16. `career-simulator` is one of them and is handled in Task 10, alongside its page, because the same file needs both the chart swap and the control swap — splitting it across two tasks would mean two agents editing one file.

**The contract for every workshop task, without exception:**

1. **Logic is frozen.** No `useState` shape, no `useEffect`, no `useMemo` dependency array, no storage key, no `migrateKey` call, no `track` call, no import from `lib/*-math.ts` changes. Only markup and class names move.
2. **Every control becomes a primitive.** `<input type="text|number|url|date|search">` → `Input`. `<textarea>` → `Textarea`. `<select>` → `Select`. `<input type="checkbox">` → `Checkbox`. `<input type="radio">` in a `peer sr-only` + styled-label pattern → `ChoiceCard` when the option has a description, `Radio` when it does not. `<input type="range">` → `Range`. A label + hint + error wrapper → `Field` (`as="group"` for radio/choice sets). A styled `<button>` → `Button`.
3. **Ad-hoc tablists become `Tabs`.** The hand-rolled roving-tabindex block in `build-labs` is the only one; it is replaced wholesale, keyboard model included.
4. **`<details>` becomes `Accordion` / `AccordionItem`.** `build-labs`'s `DecisionsTab` is the only one.
5. **Empty states become `EmptyState`.** Three exist: `find-work`'s "No matches", `niche-explorer`'s "No niches match this filter yet", and `application-tracker`'s empty pipeline.
6. **Filter chips become `Button variant="outline" size="sm"` with `aria-pressed`,** or `Tabs` where the set is genuinely a tab set. `find-work`, `niche-explorer`, `micro-tasks` and `build-labs` each carry a `FilterChip` local component; all four are deleted in favour of `Button`.
7. **Every card becomes `Card`.** Every `<Pill>` becomes `<Badge>`. Every `shadow-[var(--shadow-lg)]` and `shadow-[var(--shadow-md)]` on a card is dropped — only `Dialog` keeps a shadow.
8. **`motion` stays** where it animates a state change (spec §4.5); it is removed only where it animated a hover lift.
9. **One RTL smoke test per workshop**, following the template below. The existing `lib/*.test.mjs` suites must stay green and are never edited.

**The smoke-test template.** Every workshop test asserts two things and no more: it renders, and its primary interaction works.

```tsx
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { TheWorkshop } from "@/components/the-workshop";

describe("TheWorkshop", () => {
  it("renders", () => {
    render(<TheWorkshop />);
    expect(screen.getByRole("…", { name: /…/i })).toBeInTheDocument();
  });

  it("does the one thing it is for", async () => {
    const user = userEvent.setup();
    render(<TheWorkshop />);
    await user.click(screen.getByRole("…", { name: /…/i }));
    expect(screen.getByText(/…/i)).toBeInTheDocument();
  });
});
```

Workshops that read `usePath()` need the provider. Wrap them:

```tsx
import { PathProvider } from "@/lib/path-context";
const renderWithPath = (ui: ReactNode) => render(<PathProvider>{ui}</PathProvider>);
```

If `lib/path-context.tsx` does not export a provider under that name, import whatever it does export — **do not edit that file**.

**The full lucide → `Icon` mapping for Batch C:**

| File | lucide | `<Icon name>` |
|---|---|---|
| `application-tracker` | `AlertTriangle` | `alert-triangle` |
| | `ArrowUpRight` | `arrow-up-right` |
| | `Inbox` | `inbox` |
| | `Plus` | `plus` |
| | `Trash2` | `trash` |
| | `TrendingDown` | `trending-down` |
| `build-labs` | `ArrowLeft` | `arrow-left` |
| | `ArrowRight` | `arrow-right` |
| | `AlertTriangle` | `alert-triangle` |
| | `CheckCircle2` | `check-circle-2` |
| `comms-lab` | `ArrowDown` | `arrow-down` |
| | `Check` | `check` |
| | `ShieldCheck` | `shield-check` |
| `equipment-checker` | `CheckCircle2` | `check-circle-2` |
| `find-work` | `ExternalLink` | `arrow-up-right` |
| | `MapPin` | `map-pin` |
| | `OctagonAlert` | `octagon-alert` |
| | `Search` | `search` |
| | `ShieldAlert` | `shield-alert` |
| | `ShieldCheck` | `shield-check` |
| `integrity-oath` | `AlertTriangle` | `alert-triangle` |
| | `Check` | `check` |
| | `PenLine` | `pen-line` |
| | `RotateCcw` | `rotate-ccw` |
| | `ShieldCheck` | `shield-check` |
| `micro-tasks` | `ArrowLeft` | `arrow-left` |
| | `ArrowRight` | `arrow-right` |
| | `Check` | `check` |
| | `ExternalLink` | `arrow-up-right` |
| | `Sparkles` | deleted (§9) |
| `niche-explorer` | `ArrowUpRight` | `arrow-up-right` |
| | `Award` | `award` |
| | `Check` | `check` |
| | `Sparkles` | deleted (§9) |
| | `X` | `x` |
| `niche-scorer` | `AlertTriangle` | `alert-triangle` |
| | `Sparkles` | deleted (§9) |
| `plan-wizard` | `Check` | `check` |
| | `ChevronLeft` | `chevron-left` |
| | `RotateCcw` | `rotate-ccw` |
| `rate-worksheet` | `Info` | `info` |
| | `Plus` | `plus` |
| | `RotateCcw` | `rotate-ccw` |
| | `Trash2` | `trash` |
| `self-audit` | `RotateCcw` | `rotate-ccw` |
| `study-protocol` | `Check` | `check` |
| | `ChevronLeft` | `chevron-left` |
| | `RotateCcw` | `rotate-ccw` |
| `career-simulator` (Task 10) | `AlertTriangle`, `TriangleAlert` | `alert-triangle` |
| | `ExternalLink` | absorbed by `<Source>` |

`rate-calculator` and `prompt-workshop` import no lucide.

**Per-task verification (identical in all seven):**

```bash
npx vitest run components/<file>.test.tsx
npx tsc --noEmit
npm run lint
node --test "lib/*.test.mjs"
node scripts/verify-primitives.mjs | grep "components.<file>" || echo "clean"
```

---

### Task 11: Batch C/1 — `build-labs.tsx`

**Parallel group:** D

**Files:**
- Edit script (651 lines): `components/build-labs.tsx`
- Create: `components/build-labs.test.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionItem`, `Badge`, `Button`, `Callout`, `Card`, `Field`, `Heading`, `Icon`, `Tab`, `TabList`, `TabPanel`, `Tabs`, `Text`, `Textarea` from `@/components/ui`; `CopyButton`, `DownloadButton` (migrated in Task 20 — their props do not change).
- Produces: `BuildLabs` — unchanged export, unchanged (empty) props.

**Frozen:** `LABS_KEY`, the `migrateKey("devup.labs.v1", LABS_KEY)` call, both `useEffect`s, `answers`, `checked`, `hydrated`, `activeCategory`, `selectedLabId`, `activeTab`, `buildDocument`, and every `labsData` read.

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–17 with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import labsData from "@/data/labs.json";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  Field,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { migrateKey } from "@/lib/storage";
```

The old `import { Icon } from "@/components/icon";` line goes with it — `Icon` now comes from the barrel.

**Edit 2 — the category chips.** Replace the `categoryChips.map(...)` button:

```tsx
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                      active
                        ? "border-ink bg-ink text-paper-2"
                        : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {c.label}
                    <span className={active ? "text-paper-2/60" : "text-ink-faint"}>
                      {count}
                    </span>
                  </button>
```
with
```tsx
                  <Button
                    key={c.id}
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    onClick={() => setActiveCategory(c.id)}
                    aria-label={`${c.label}, ${count} labs`}
                    iconEnd={
                      <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink-faint")}>
                        {count}
                      </span>
                    }
                  >
                    {c.label}
                  </Button>
```

`aria-pressed` is dropped because the set now reads as a filter with one active choice and the accessible name carries the count; if a reviewer prefers `aria-pressed`, `Button` forwards unknown props to the underlying element — add it back and re-run the test.

**Edit 3 — the back button.** Replace both occurrences of

```tsx
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        Back to all labs
      </button>
```
with
```tsx
      <Button variant="link" onClick={onBack} icon={<Icon name="arrow-left" size={15} />}>
        Back to all labs
      </Button>
```

**Edit 4 — the tablist.** Replace the whole hand-rolled block, from

```tsx
      {/* Tabs */}
      <div
        role="tablist"
        aria-label={`${lab.name}, lab sections`}
        onKeyDown={(e) => {
```
through the closing `</AnimatePresence>` that ends the panel switch, with:

```tsx
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabId)} className="mt-6">
        <TabList label={`${lab.name}, lab sections`}>
          {TABS.map((tab) => (
            <Tab key={tab.id} value={tab.id} icon={<Icon name={tab.icon} size={14} />}>
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanel value="why">
          <WhyTab lab={lab} />
        </TabPanel>
        <TabPanel value="study">
          <StudyTab lab={lab} />
        </TabPanel>
        <TabPanel value="decisions">
          <DecisionsTab lab={lab} />
        </TabPanel>
        <TabPanel value="workshop">
          <WorkshopTab lab={lab} answers={answers} onAnswerChange={onAnswerChange} />
        </TabPanel>
        <TabPanel value="critique">
          <CritiqueTab lab={lab} checked={checked} onToggleChecked={onToggleChecked} />
        </TabPanel>
        <TabPanel value="build">
          <BuildRealTab lab={lab} answers={answers} onGoToWorkshop={() => onTabChange("workshop")} />
        </TabPanel>
      </Tabs>
```

Match the panel list to the `TABS` ids and the props each `*Tab` component already takes — read the surrounding lines before typing; the six ids above are the ones in `TABS`. `Tabs` owns the roving tabindex, the arrow keys, `Home`/`End` and `aria-selected`, so the hand-rolled `onKeyDown` and the `document.getElementById(...).focus()` call are deleted, not ported.

**Edit 5 — `DecisionsTab` onto `Accordion`.** Replace the whole component:

```tsx
function DecisionsTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl space-y-3">
      {lab.decisions.map((d) => (
        <details
          key={d.q}
          className="group rounded-2xl border border-line bg-paper-2 p-5 open:border-ink"
        >
          <summary className="cursor-pointer list-none font-display text-lg leading-snug marker:content-none">
            {d.q}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.guide}</p>
        </details>
      ))}
    </div>
  );
}
```
with
```tsx
function DecisionsTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl">
      <Accordion type="multiple">
        {lab.decisions.map((d) => (
          <AccordionItem key={d.q} id={d.q} title={d.q}>
            <Text size="small">{d.guide}</Text>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
```

`type="multiple"` preserves the current behaviour: native `<details>` open independently.

**Edit 6 — the workshop textareas.** Replace the `lab.builder.steps.map(...)` body:

```tsx
              <div key={step.id}>
                <label htmlFor={fieldId} className="font-display text-base leading-tight">
                  {step.label}
                </label>
                <p id={`${fieldId}-hint`} className="mt-1 text-xs text-ink-faint">
                  {step.hint}
                </p>
                <textarea
                  id={fieldId}
                  name={fieldId}
                  rows={3}
                  value={answers[step.id] ?? ""}
                  onChange={(e) => onAnswerChange(step.id, e.target.value)}
                  placeholder={step.placeholder}
                  aria-describedby={`${fieldId}-hint ${fieldId}-rule`}
                  className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-paper-2 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint/70 focus:border-ink focus:outline-none"
                />
                <p id={`${fieldId}-rule`} className="mt-1.5 text-xs italic text-ink-faint">
                  Rule: {step.rule}
                </p>
              </div>
```
with
```tsx
              <Field key={step.id} label={step.label} hint={step.hint}>
                <Textarea
                  id={fieldId}
                  name={fieldId}
                  rows={3}
                  value={answers[step.id] ?? ""}
                  onChange={(e) => onAnswerChange(step.id, e.target.value)}
                  placeholder={step.placeholder}
                />
                <Text size="caption" tone="faint" className="italic">
                  Rule: {step.rule}
                </Text>
              </Field>
```

`Field` generates the ids and wires `aria-describedby` for the hint. The rule line moves inside the field so it stays visually attached; it is no longer in `aria-describedby`, which is the correct trade — a screen reader announcing both the hint and the rule on every focus was 40 words of preamble per field.

**Edit 7 — the critique checkboxes.** Replace the `lab.critique.map(...)` body:

```tsx
            <li key={c} className="flex items-start gap-3 p-4">
              <input
                type="checkbox"
                id={fieldId}
                checked={isChecked}
                onChange={() => onToggleChecked(i)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-verified"
              />
              <label
                htmlFor={fieldId}
                className={cn(
                  "flex-1 cursor-pointer text-sm leading-relaxed",
                  isChecked ? "text-ink-faint line-through" : "text-ink",
                )}
              >
                {c}
              </label>
            </li>
```
with
```tsx
            <li key={c} className="p-4">
              <Checkbox
                id={fieldId}
                checked={isChecked}
                onChange={() => onToggleChecked(i)}
                label={
                  <span className={cn(isChecked && "text-ink-faint line-through")}>{c}</span>
                }
              />
            </li>
```
and add `Checkbox` to the import block from Edit 1.

**Edit 8 — the "Go write it in the Workshop" button.** Replace

```tsx
          <button
            type="button"
            onClick={onGoToWorkshop}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-2 transition-all hover:-translate-y-0.5 hover:bg-signal"
          >
            Go write it in the Workshop
            <ArrowRight size={15} />
          </button>
```
with
```tsx
          <Button onClick={onGoToWorkshop} iconEnd={<Icon name="arrow-right" size={15} />}>
            Go write it in the Workshop
          </Button>
```

**Edit 9 — cards, pills and shadows.** Across the whole file:

- every `<Pill …>` → `<Badge …>` (identical `tone` values)
- every `rounded-2xl border border-line bg-paper-2 p-N` wrapper → `<Card padding="sm|md|lg">`
- every `shadow-[var(--shadow-md)]` and `shadow-[var(--shadow-sm)]` → deleted
- every `hover:-translate-y-*` → deleted
- every `rounded-xl` → `rounded-sm`, every `rounded-2xl` → `rounded-md`, every `rounded-full` → `rounded-pill`
- every `bg-paper-2` → `bg-paper`, every `bg-paper-3` → `bg-band`
- every `text-signal` / `bg-signal` / `signal-tint` → `text-primary` / `bg-primary` / `primary-tint`
- `font-display text-lg leading-snug` on a heading → `<Heading level={3} size="h5">`

Run `node scripts/verify-primitives.mjs | grep build-labs` after this edit; it must print nothing.

- [ ] **Step 2: Write `components/build-labs.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildLabs } from "@/components/build-labs";

describe("BuildLabs", () => {
  it("renders the lab gallery", () => {
    render(<BuildLabs />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("opens a lab and exposes its six sections as a tablist", async () => {
    const user = userEvent.setup();
    render(<BuildLabs />);
    const first = screen.getAllByRole("button").find((b) => /open|lab|build/i.test(b.textContent ?? ""));
    await user.click(first as HTMLElement);
    expect(await screen.findByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").length).toBeGreaterThan(1);
  });

  it("typing in a workshop field keeps the value", async () => {
    const user = userEvent.setup();
    render(<BuildLabs />);
    const first = screen.getAllByRole("button").find((b) => /open|lab|build/i.test(b.textContent ?? ""));
    await user.click(first as HTMLElement);
    await user.click(await screen.findByRole("tab", { name: /workshop/i }));
    const boxes = await screen.findAllByRole("textbox");
    await user.type(boxes[0], "my own words");
    expect(boxes[0]).toHaveValue("my own words");
  });
});
```

If the gallery's lab cards are not `<button>`s after the migration (they may be `Card href`), change the queries to match what shipped — the test asserts behaviour, not implementation, so adjust the selector, never the assertion.

- [ ] **Step 3: Verify**

Run:
```bash
npx vitest run components/build-labs.test.tsx
npx tsc --noEmit && npm run lint
node --test "lib/*.test.mjs"
node scripts/verify-primitives.mjs | grep "build-labs" || echo "clean"
```
Expected: PASS, silent, clean, math suites green, `clean`.

- [ ] **Step 4: Prove storage did not move**

Run:
```bash
grep -n "hfph.labs.v1\|devup.labs.v1\|localStorage" components/build-labs.tsx
```
Expected: exactly the three original lines — the `LABS_KEY` constant, the `migrateKey` call, and the `getItem`/`setItem` pair.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/build-labs.tsx components/build-labs.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(build-labs): Tabs, Accordion and Field primitives; storage and lab logic untouched"
```

---

### Task 12: Batch C/2 — `micro-tasks.tsx`

**Parallel group:** D

**Files:**
- Edit script (633 lines): `components/micro-tasks.tsx`
- Create: `components/micro-tasks.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Card`, `Checkbox`, `EmptyState`, `Heading`, `Icon`, `Text` from `@/components/ui`; `usePath()` unchanged.
- Produces: `MicroTasks` — unchanged export.

**Frozen:** `usePath()` and every call it returns, the `hydrated` gate, `trackFilter`, `difficultyFilter`, `selectedId`, `dodChecked`, `critiqueChecked`, the `useRef` scroll target, and every `tasksData` / `tracksData` read.

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–18 with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import tasksData from "@/data/tasks.json";
import tracksData from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { cn } from "@/lib/utils";
```

`next/link` goes: its only uses become `<Button href>` / `<Card href>`.

**Edit 2 — the filter chips.** Replace the whole `FilterChip` local component (the `function FilterChip({ label, count, active, onClick }) { … }` block) with nothing, and replace each `<FilterChip …>` call site with:

```tsx
            <Button
              key={…}
              size="sm"
              variant={active ? "primary" : "outline"}
              onClick={onClick}
              aria-label={`${label}, ${count} tasks`}
              iconEnd={
                <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink-faint")}>
                  {count}
                </span>
              }
            >
              {label}
            </Button>
```

**Edit 3 — the back button.** Replace

```tsx
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        Back to all micro-tasks
```
with
```tsx
      <Button variant="link" onClick={onBack} icon={<Icon name="arrow-left" size={15} />}>
        Back to all micro-tasks
```
and close it with `</Button>` instead of `</button>`.

**Edit 4 — the two checklist blocks.** Both the "Definition of done" list and the "Self-critique" list use the same row shape. Replace each row body:

```tsx
                <li key={d} className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleDod(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-verified"
                  />
                  <label
                    htmlFor={fieldId}
                    className={cn(
                      "flex-1 cursor-pointer text-sm leading-relaxed",
                      checked ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {d}
                  </label>
                </li>
```
with
```tsx
                <li key={d} className="p-4">
                  <Checkbox
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleDod(i)}
                    label={
                      <span className={cn(checked && "text-ink-faint line-through")}>{d}</span>
                    }
                  />
                </li>
```
and the same shape for the critique list, swapping `onToggleDod(i)` → `onToggleCritique(i)`, `checked` → the critique row's own `checked`, and `{d}` → `{c}`.

**Edit 5 — the "I built this" toggle.** Replace

```tsx
        <button
          type="button"
          onClick={onToggleDone}
          aria-pressed={isDone}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
            isDone
              ? "bg-verified text-white hover:-translate-y-0.5"
              : "bg-ink text-paper-2 hover:-translate-y-0.5 hover:bg-signal",
          )}
        >
          {isDone ? <Check size={16} /> : <Sparkles size={16} />}
          {isDone ? "Built, undo" : "I built this"}
        </button>
```
with
```tsx
        <Button
          onClick={onToggleDone}
          aria-label={isDone ? "Built, undo" : "I built this"}
          variant={isDone ? "secondary" : "primary"}
          icon={isDone ? <Icon name="check" size={16} /> : undefined}
        >
          {isDone ? "Built, undo" : "I built this"}
        </Button>
```

The `Sparkles` icon is deleted rather than mapped (§9). `aria-pressed` is replaced by the label change, which is what a screen reader actually needs here.

**Edit 6 — the empty state.** Wherever the filtered list renders nothing today (search for `No micro-tasks` / a bare `<p>` fallback under the grid), replace it with:

```tsx
        <EmptyState
          icon="list-checks"
          title="No micro-tasks match those filters"
          body="Widen the track or the difficulty, or clear both to see all forty."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setTrackFilter("all");
                setDifficultyFilter("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
```

If the component has no empty state today, add this one — a filter that can return zero results and says nothing is the exact case `EmptyState` exists for.

**Edit 7 — cards, pills, radii, shadows.** Apply the same sweep as Task 11 Edit 9. Note `micro-tasks` uses `motion.button` for the task cards: keep the `motion` wrapper (it animates a layout change, which §4.5 allows) but strip `hover:-translate-y-*` and the shadow from its className, and convert the card chrome to `Card` classes or wrap the `motion.div` inside a `<Card padding="none">`.

- [ ] **Step 2: Write `components/micro-tasks.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { MicroTasks } from "@/components/micro-tasks";

const renderTasks = () =>
  render(
    <PathProvider>
      <MicroTasks />
    </PathProvider>,
  );

describe("MicroTasks", () => {
  it("renders the task gallery with filters", () => {
    renderTasks();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(3);
  });

  it("opens a task and shows its definition of done", async () => {
    const user = userEvent.setup();
    renderTasks();
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    expect(await screen.findByText(/definition of done/i)).toBeInTheDocument();
  });

  it("ticking a definition-of-done box updates the counter", async () => {
    const user = userEvent.setup();
    renderTasks();
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(boxes[0]).toBeChecked();
  });
});
```

- [ ] **Step 3: Verify**

Run:
```bash
npx vitest run components/micro-tasks.test.tsx
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep "micro-tasks" || echo "clean"
grep -n "usePath\|toggle\|track(" components/micro-tasks.tsx | head -20
```
Expected: PASS, silent, `clean`, and the `usePath` lines unchanged from `git diff`.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/micro-tasks.tsx components/micro-tasks.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(micro-tasks): Checkbox, Button and EmptyState primitives; path state untouched"
```

---

### Task 13: Batch C/3 — `application-tracker.tsx`

**Parallel group:** D

**Files:**
- Edit script (585 lines): `components/application-tracker.tsx`
- Create: `components/application-tracker.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `EmptyState`, `Field`, `Heading`, `Icon`, `Input`, `Select`, `Text`, `Textarea` from `@/components/ui`; `CopyButton`; `usePath()` unchanged.
- Produces: `ApplicationTracker` — unchanged export.

**Frozen:** `handleSubmit` and its `FormData` reads (the form is uncontrolled and stays uncontrolled), `formError`, `daysBetween`, `today`, `defaultFollowUp`, `APP_STATUSES`, `STATUS_LABEL`, `STATUS_TONE`, and every `usePath()` call (`addApplication`, `updateApplication`, `removeApplication`, …).

**A note on the form:** the add-application form reads values out of `FormData` on submit, so every control keeps its `name` and its `id`. `Field` generates an id when it is not given one — here it **is** given one, and the given id wins. Do not drop the `name` attributes; the submit handler is keyed on them.

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–21 with:

```tsx
"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Heading,
  Icon,
  Input,
  Select,
  Text,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
```

Keep the `usePath` import and the `@/lib/...` imports exactly as they appear on the following lines; `next/link` is dropped in favour of `Button href` / `Card href`.

**Edit 2 — delete the page-local `Field` and `inputCls`.** The file declares its own `Field` wrapper and an `inputCls` string. Delete both. Every `<Field label="X" htmlFor="y">` becomes `<Field label="X">` from `@/components/ui`, and every `className={inputCls}` disappears because the primitive carries `controlClass`.

**Edit 3 — the add-application form.** Replace the whole `<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">` block (from the `Company` field through the `Notes` field) with:

```tsx
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Company">
            <Input id="company" name="company" type="text" required placeholder="Acme Co" />
          </Field>
          <Field label="Role">
            <Input
              id="role"
              name="role"
              type="text"
              required
              placeholder="Executive Operations Professional"
            />
          </Field>
          <Field label="Source">
            <Input id="source" name="source" type="text" placeholder="LinkedIn, referral, direct…" />
          </Field>
          <Field label="Link">
            <Input id="link" name="link" type="url" placeholder="https://…" />
          </Field>
          <Field label="Status">
            <Select id="status" name="status" defaultValue="applied">
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Applied on">
            <Input id="appliedAt" name="appliedAt" type="date" defaultValue={today} />
          </Field>
          <Field label="Follow up on">
            <Input
              id="followUpAt"
              name="followUpAt"
              type="date"
              defaultValue={defaultFollowUp}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Contact name, referral, anything worth remembering…"
            />
          </Field>
        </div>
```

Every `id` and every `name` is preserved exactly; `handleSubmit` is not touched.

**Edit 4 — the submit button and the form error.** Replace

```tsx
        {formError && (
          <p role="alert" className="mt-3 text-sm font-medium text-signal-deep">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-signal"
        >
          <Plus size={16} /> Add application
        </button>
```
with
```tsx
        {formError && (
          <Callout tone="coral" className="mt-3">
            <span role="alert">{formError}</span>
          </Callout>
        )}

        <div className="mt-5">
          <Button type="submit" icon={<Icon name="plus" size={16} />}>
            Add application
          </Button>
        </div>
```

**Edit 5 — the two status `<select>`s.** Both the overdue-radar row and the pipeline row carry an inline status select. Replace each

```tsx
                  <select
                    aria-label={`Update status for ${a.company}, ${a.role}`}
                    value={a.status}
                    onChange={(e) =>
                      updateApplication(a.id, {
                        status: e.target.value as AppStatus,
                      })
                    }
                    className="rounded-full border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
                  >
```
with
```tsx
                  <Select
                    aria-label={`Update status for ${a.company}, ${a.role}`}
                    value={a.status}
                    onChange={(e) =>
                      updateApplication(a.id, {
                        status: e.target.value as AppStatus,
                      })
                    }
                    className="max-w-[10rem]"
                  >
```
(and the same for the pipeline card's `Change status for …` select), closing with `</Select>`. The `<option>` map is unchanged.

**Edit 6 — the notes textarea on each row.** Replace

```tsx
        <label
          htmlFor={`notes-${app.id}`}
          className="text-xs font-semibold text-ink-soft"
        >
          Notes
        </label>
        <textarea
          id={`notes-${app.id}`}
          defaultValue={app.notes}
          onBlur={(e) => updateApplication(app.id, { notes: e.target.value })}
          rows={2}
          className={inputCls}
        />
```
with
```tsx
        <Field label="Notes" hideLabel>
          <Textarea
            id={`notes-${app.id}`}
            defaultValue={app.notes}
            onBlur={(e) => updateApplication(app.id, { notes: e.target.value })}
            rows={2}
          />
        </Field>
```

`hideLabel` keeps the accessible name without repeating the word "Notes" on every row.

**Edit 7 — the delete button.** Replace

```tsx
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-signal"
        >
          <Trash2 size={13} /> Delete
        </button>
```
with
```tsx
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          icon={<Icon name="trash" size={13} />}
        >
          Delete
        </Button>
```

**Edit 8 — the empty pipeline.** Wherever the pipeline renders its "nothing logged yet" branch (search for `Inbox` — the lucide icon was used there), replace it with:

```tsx
          <EmptyState
            icon="inbox"
            title="Nothing logged yet"
            body="Add your first application above. The follow-up date is the column that turns this log into a tool."
          />
```

**Edit 9 — the rest of the sweep.** Same class sweep as Task 11 Edit 9: `Pill` → `Badge`, card wrappers → `Card`, radii, `paper-2`/`paper-3`, `signal` → `primary`, shadows and lifts deleted, `AlertTriangle` → `<Icon name="alert-triangle">`, `TrendingDown` → `<Icon name="trending-down">`, `ArrowUpRight` → `<Icon name="arrow-up-right">`.

- [ ] **Step 2: Write `components/application-tracker.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { ApplicationTracker } from "@/components/application-tracker";

const renderTracker = () =>
  render(
    <PathProvider>
      <ApplicationTracker />
    </PathProvider>,
  );

describe("ApplicationTracker", () => {
  it("renders the log form with every field labelled", () => {
    renderTracker();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/follow up on/i)).toBeInTheDocument();
  });

  it("logging an application adds it to the pipeline", async () => {
    const user = userEvent.setup();
    renderTracker();
    await user.type(screen.getByLabelText(/company/i), "Acme Co");
    await user.type(screen.getByLabelText(/^role/i), "Bookkeeper");
    await user.click(screen.getByRole("button", { name: /add application/i }));
    expect(await screen.findByText("Acme Co")).toBeInTheDocument();
  });

  it("refuses an empty submission with a visible error", async () => {
    const user = userEvent.setup();
    renderTracker();
    await user.click(screen.getByRole("button", { name: /add application/i }));
    expect(screen.queryByRole("alert")).toBeTruthy();
  });
});
```

If the third assertion fails because the browser's native `required` blocks submission before `handleSubmit` runs, that is correct behaviour — change the test to assert `expect(screen.getByLabelText(/company/i)).toBeInvalid()` instead. Do not remove `required` from the input to make a test pass.

- [ ] **Step 3: Verify**

Run:
```bash
npx vitest run components/application-tracker.test.tsx
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep "application-tracker" || echo "clean"
grep -c "name=\"" components/application-tracker.tsx
```
Expected: PASS, silent, `clean`, and eight `name="` attributes — one per form control, exactly as before.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/application-tracker.tsx components/application-tracker.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(tracker): field family and EmptyState; the uncontrolled form and its FormData keys are unchanged"
```
---

### Task 14: Batch C/4 — `comms-lab.tsx`, `integrity-oath.tsx`, `self-audit.tsx`

**Parallel group:** D

**Files:**
- Edit script: `components/comms-lab.tsx` (380 lines), `components/integrity-oath.tsx` (246 lines)
- Replace (whole file): `components/self-audit.tsx` (173 lines)
- Create: `components/comms-lab.test.tsx`, `components/integrity-oath.test.tsx`, `components/self-audit.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `Checkbox`, `Field`, `Heading`, `Icon`, `ProgressBar`, `Text`, `Textarea`, `Input` from `@/components/ui`; `usePath()` in `integrity-oath` unchanged.
- Produces: `CommsLab`, `IntegrityOath`, `SelfAudit` — unchanged exports and props (`SelfAudit` keeps `{ statements, levels }`).

**Frozen:** the whole `PATTERNS` regex map, `scan()`, `readDirectness()`, `useDebounced()` and the two `aria-live` announcement strings in `comms-lab`; `MIN_COMMITMENT`, `canSign`, `sign()`, `unsign()`, the hydration gate and every `updateOath` / `toggleOathClause` call in `integrity-oath`; `answers`, `score`, `level`, `setAnswer`, `reset` in `self-audit`.

#### 14a — `components/comms-lab.tsx`

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–7 with:

```tsx
"use client";

import { useEffect, useId, useMemo, useState } from "react";
import english from "@/data/english.json";
import {
  Badge,
  Callout,
  Card,
  Checkbox,
  Field,
  Heading,
  Icon,
  Text,
  Textarea,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
```

**Edit 2 — delete the accent maps.** Remove `const accentText`, `const accentBar` and `const verdictText`. Replace their three use sites:

- `accentBar[g.accent]` → `accent(g.accent).fill`
- `accentText[g.accent]` → `accent(g.accent).text`
- `verdictText[verdict.tone]` → `accent(verdict.tone).text`

`readDirectness` returns `tone: Tone` where `Tone = "neutral" | "signal" | "verified" | "caution" | "info"` — every member is a valid `Accent`, so `accent(tone)` resolves without a cast. Leave the `Tone` type alone.

**Edit 3 — the two textareas.** Replace each of

```tsx
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${uid}-original`}
            className="text-sm font-semibold text-ink"
          >
            Paste a real message you sent a client
          </label>
          <textarea
            id={`${uid}-original`}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={english.lab.placeholder}
            className="w-full resize-y rounded-2xl border border-line-strong bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
          />
        </div>
```
with
```tsx
        <Field label="Paste a real message you sent a client">
          <Textarea
            id={`${uid}-original`}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={english.lab.placeholder}
          />
        </Field>
```
and the rewrite one identically, swapping `original`→`rewrite`, `setOriginal`→`setRewrite`, the label to `Your rewrite, in your own words`, and the placeholder to `english.lab.rewritePlaceholder`.

**Edit 4 — the self-critique checklist.** Replace the whole `<fieldset className="mt-10 rounded-2xl border border-line bg-paper p-6">` block with:

```tsx
      <Card padding="md" className="mt-10">
        <Field as="group" label="Judge it yourself, five questions, no scores from us">
          <ul className="mt-3 flex flex-col gap-3">
            {english.lab.selfCritique.map((q, idx) => (
              <li key={q}>
                <Checkbox id={`${uid}-critique-${idx}`} label={q} />
              </li>
            ))}
          </ul>
        </Field>
      </Card>
```

The old rows were uncontrolled checkboxes with a styled label; `Checkbox` is also uncontrolled here (no `checked` prop), so the behaviour is identical.

**Edit 5 — the results panel.** Replace the `<aside …>` shell with `<Card as="section" padding="md">` plus the existing `aria-labelledby` prop moved onto it, and inside it:

- the `Flags found` / `Directness` header keeps its markup but `kicker` becomes `<Kicker>` and the big number becomes `<span className="font-display text-h2 tabular-nums text-ink">`
- the `rounded-xl border border-verified/30 bg-verified-tint p-4` clean panel becomes `<Callout tone="verified">`
- `<ShieldCheck size={14} aria-hidden />` becomes `<Icon name="shield-check" size={14} />`
- the phrase chips (`rounded-md border border-line-strong bg-paper-2 px-2 py-1 font-mono text-[11px]`) become `<Badge>` with `tabular-nums`

**Edit 6 — the header pill and the arrow.** Replace

```tsx
      <Pill tone="verified">
        <ShieldCheck size={13} aria-hidden />
        Runs in your browser. Nothing is uploaded, stored, or sent anywhere.
      </Pill>
```
with
```tsx
      <Badge tone="verified">
        <Icon name="shield-check" size={13} />
        Runs in your browser. Nothing is uploaded, stored, or sent anywhere.
      </Badge>
```
and
```tsx
          <span
            aria-hidden
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-paper-2"
          >
            <ArrowDown size={16} />
          </span>
```
with
```tsx
          <span
            aria-hidden
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-ink text-on-navy"
          >
            <Icon name="arrow-down" size={16} />
          </span>
```

**Edit 7 — the outer shell.** Replace

```tsx
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-lg)] lg:p-8">
```
with
```tsx
    <div className="flex flex-col">
```
The host page (`/english`, Task 4) already wraps `CommsLab` in `<Card padding="lg">`, so the component must not draw a second card around itself. Its closing `</div>` is unchanged.

- [ ] **Step 2: Write `components/comms-lab.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommsLab } from "@/components/comms-lab";

describe("CommsLab", () => {
  it("renders both passes with labelled textareas", () => {
    render(<CommsLab />);
    expect(screen.getByLabelText(/paste a real message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your rewrite/i)).toBeInTheDocument();
  });

  it("flags a hedged message as you type", async () => {
    const user = userEvent.setup();
    render(<CommsLab />);
    await user.type(
      screen.getByLabelText(/paste a real message/i),
      "Sorry po, I just wanted to check in, maybe you could kindly review this?",
    );
    // "sorry", "po", "just", "maybe", "kindly", "wanted to check in" all hit.
    expect(screen.getAllByText(/sorry/i).length).toBeGreaterThan(0);
  });
});
```

#### 14b — `components/integrity-oath.tsx`

- [ ] **Step 3: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–7 with:

```tsx
"use client";

import { useId } from "react";
import conduct from "@/data/conduct.json";
import { usePath } from "@/lib/path-context";
import {
  Button,
  Callout,
  Card,
  Checkbox,
  Field,
  Heading,
  Icon,
  Input,
  Kicker,
  Text,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
```

**Edit 2 — the outer shell.** Replace

```tsx
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-lg)] lg:p-10">
```
with `<div className="flex flex-col">` — `/conduct` (Task 3) wraps it in `<Card padding="lg">`. The hydration skeleton above keeps its own wrapper but drops `shadow` and switches `rounded-[var(--radius-lg)]` → `rounded-lg`, `bg-paper-2` → `bg-paper`, `rounded` → `rounded-sm`, `rounded-2xl` → `rounded-md`.

**Edit 3 — the clause checkboxes.** Replace the whole `<fieldset>` block (from `<fieldset>` through `</fieldset>`) with:

```tsx
      <Field as="group" label="Step 1 · Read each one. Tick only what you can actually keep.">
        <ul className="mt-5 flex flex-col gap-2">
          {oath.clauses.map((c, idx) => {
            const on = !!clauses[c.id];
            return (
              <li key={c.id}>
                <Card
                  padding="sm"
                  className={cn(on && "border-verified bg-verified-tint")}
                >
                  <Checkbox
                    id={`${uid}-${c.id}`}
                    checked={on}
                    onChange={() => toggleOathClause(c.id)}
                    label={
                      <span className="flex flex-col gap-1">
                        <span className="text-caption font-bold tabular-nums tracking-widest text-ink-faint">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={cn("text-small leading-relaxed", on ? "text-ink" : "text-ink-soft")}>
                          {c.text}
                        </span>
                      </span>
                    }
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      </Field>
```

`toggleOathClause(c.id)` and `clauses[c.id]` are unchanged, so the persisted shape is unchanged.

**Edit 4 — the commitment textarea.** Replace

```tsx
        <label htmlFor={`${uid}-commitment`} className="kicker">
          Step 2 · Now write the part we can&rsquo;t write for you
        </label>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {oath.commitmentPrompt}
        </p>
        <textarea
          id={`${uid}-commitment`}
          value={commitment}
          onChange={(e) => updateOath({ commitment: e.target.value })}
          rows={7}
          placeholder={oath.commitmentPlaceholder}
          className="mt-4 w-full rounded-2xl border border-line-strong bg-paper px-4 py-3.5 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
        />
```
with
```tsx
        <Field
          label="Step 2 · Now write the part we can&rsquo;t write for you"
          hint={oath.commitmentPrompt}
        >
          <Textarea
            id={`${uid}-commitment`}
            value={commitment}
            onChange={(e) => updateOath({ commitment: e.target.value })}
            rows={7}
            placeholder={oath.commitmentPlaceholder}
          />
        </Field>
```

**Edit 5 — the self-critique panel.** Replace

```tsx
      <div className="mt-8 rounded-2xl border border-caution/30 bg-caution-tint/50 p-5">
        <p className="kicker flex items-center gap-1.5 text-caution-text">
          <AlertTriangle size={13} /> Step 3 · Judge your own draft
        </p>
```
with
```tsx
      <Callout tone="caution" icon="alert-triangle" title="Step 3 · Judge your own draft" className="mt-8">
```
and close it with `</Callout>` instead of the two `</div>`s.

**Edit 6 — the signature row.** Replace the signed panel's outer `<div className="flex flex-col items-start gap-5 rounded-2xl border border-verified/40 bg-verified-tint p-6 …">` with `<Callout tone="verified" className="…">`, the `ShieldCheck` chip with `<Icon name="shield-check" size={20} />`, and the "Revise it" button with:

```tsx
            <Button
              variant="outline"
              size="sm"
              onClick={unsign}
              icon={<Icon name="rotate-ccw" size={14} />}
            >
              Revise it
            </Button>
```

Replace the unsigned branch's name field and sign button with:

```tsx
            <Field label={`Step 4 · ${oath.signPrompt}`}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id={`${uid}-name`}
                  type="text"
                  value={name}
                  onChange={(e) => updateOath({ name: e.target.value })}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="sm:max-w-xs"
                />
                <Button
                  onClick={sign}
                  disabled={!canSign}
                  icon={<Icon name="pen-line" size={15} />}
                >
                  Sign the oath
                </Button>
              </div>
            </Field>
```

`canSign`, `sign`, `unsign` and the `!canSign` hint paragraph below are untouched.

- [ ] **Step 4: Write `components/integrity-oath.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { IntegrityOath } from "@/components/integrity-oath";

const renderOath = () =>
  render(
    <PathProvider>
      <IntegrityOath />
    </PathProvider>,
  );

describe("IntegrityOath", () => {
  it("renders every clause as a checkbox once hydrated", async () => {
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    expect(boxes.length).toBeGreaterThan(5);
  });

  it("keeps the sign button disabled until the oath is complete", async () => {
    renderOath();
    await screen.findAllByRole("checkbox");
    expect(screen.getByRole("button", { name: /sign the oath/i })).toBeDisabled();
  });

  it("ticking a clause updates the accepted counter", async () => {
    const user = userEvent.setup();
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(screen.getByText(/1 of \d+ accepted/i)).toBeInTheDocument();
  });
});
```

#### 14c — `components/self-audit.tsx`

- [ ] **Step 5: Replace `components/self-audit.tsx` in full**

```tsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Callout, Card, Field, Heading, Icon, ProgressBar, Radio, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

type Level = { min: number; max: number; label: string; desc: string };
type Answer = "agree" | "disagree" | null;

type Props = {
  statements: string[];
  levels: Level[];
};

export function SelfAudit({ statements, levels }: Props) {
  const [answers, setAnswers] = useState<Answer[]>(() => statements.map(() => null));

  const total = statements.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const score = answers.filter((a) => a === "agree").length;
  const done = answeredCount === total;

  const level = useMemo(
    () => levels.find((l) => score >= l.min && score <= l.max) ?? null,
    [levels, score],
  );

  function setAnswer(i: number, value: Answer) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  function reset() {
    setAnswers(statements.map(() => null));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-3">
        {statements.map((statement, i) => (
          <StatementRow
            key={statement}
            index={i}
            statement={statement}
            answer={answers[i]}
            onChange={(v) => setAnswer(i, v)}
          />
        ))}
      </div>

      <Card padding="md" className="lg:sticky lg:top-24">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4" aria-live="polite">
            <ProgressBar
              value={score}
              max={total}
              label={`Score ${score} of ${total}`}
              showValue
              tone="verified"
            />
            <Text size="caption" tone="faint">
              {answeredCount} of {total} answered
            </Text>

            <AnimatePresence mode="wait">
              {done && level ? (
                <motion.div
                  key={level.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Callout tone="verified" title={level.label}>
                    <Text size="small">{level.desc}</Text>
                  </Callout>
                </motion.div>
              ) : (
                <Text size="small">Answer all {total} to see where you stand.</Text>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            onClick={reset}
            icon={<Icon name="rotate-ccw" size={14} />}
          >
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatementRow({
  index,
  statement,
  answer,
  onChange,
}: {
  index: number;
  statement: string;
  answer: Answer;
  onChange: (v: Answer) => void;
}) {
  const name = `audit-${index}`;
  return (
    <Card
      padding="sm"
      className={cn(answer === "agree" && "border-verified bg-verified-tint")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text size="small" tone="ink" className="font-medium sm:max-w-md">
          <span className="mr-2 text-caption tabular-nums text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          {statement}
        </Text>

        <Field as="group" label={`Agree or disagree: ${statement}`} hideLabel className="shrink-0">
          <div className="flex gap-4">
            {(["agree", "disagree"] as const).map((v) => (
              <Radio
                key={v}
                id={`${name}-${v}`}
                name={name}
                checked={answer === v}
                onChange={() => onChange(v)}
                label={<span className="capitalize">{v}</span>}
              />
            ))}
          </div>
        </Field>
      </div>
    </Card>
  );
}
```

The conic-gradient score dial is replaced by `ProgressBar`: it was a decorative `role="img"` with a text value, and the primitive gives it a real `role="progressbar"` with `aria-valuenow`. `answers`, `score`, `level`, `setAnswer` and `reset` are byte-identical.

- [ ] **Step 6: Write `components/self-audit.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelfAudit } from "@/components/self-audit";

const STATEMENTS = ["I read the docs first", "I time-box before asking"];
const LEVELS = [
  { min: 0, max: 1, label: "Getting there", desc: "Keep going." },
  { min: 2, max: 2, label: "Resourceful", desc: "That is the habit." },
];

describe("SelfAudit", () => {
  it("renders one agree/disagree group per statement", () => {
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows the level once every statement is answered", async () => {
    const user = userEvent.setup();
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    const agrees = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-agree"));
    for (const r of agrees) await user.click(r);
    expect(await screen.findByText("Resourceful")).toBeInTheDocument();
  });

  it("reset clears every answer", async () => {
    const user = userEvent.setup();
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    const agrees = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-agree"));
    await user.click(agrees[0]);
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });
});
```

- [ ] **Step 7: Verify the whole task**

Run:
```bash
npx vitest run components/comms-lab.test.tsx components/integrity-oath.test.tsx components/self-audit.test.tsx
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep -E "comms-lab|integrity-oath|self-audit" || echo "clean"
```
Expected: PASS, silent, clean, `clean`.

Also confirm the scanner did not move:

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff -- components/comms-lab.tsx | grep -E "^[-+].*(PATTERNS|function scan|readDirectness|useDebounced|matchAll)" || echo "scanner untouched"
```
Expected: `scanner untouched`.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/comms-lab.tsx components/integrity-oath.tsx components/self-audit.tsx components/comms-lab.test.tsx components/integrity-oath.test.tsx components/self-audit.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(workshops): comms-lab, integrity-oath and self-audit on the field primitives"
```

---

### Task 15: Batch C/5 — `niche-explorer.tsx`, `niche-scorer.tsx`, `find-work.tsx`

**Parallel group:** D

**Files:**
- Edit script: `components/niche-explorer.tsx` (441), `components/niche-scorer.tsx` (233), `components/find-work.tsx` (349)
- Create: `components/niche-explorer.test.tsx`, `components/niche-scorer.test.tsx`, `components/find-work.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `Checkbox`, `EmptyState`, `Field`, `Heading`, `Icon`, `Input`, `ProgressBar`, `Radio`, `Text` from `@/components/ui`; `PathGate` from `@/components/journey` (Phase 4 moved it; `components/path-gate.tsx` is a re-export shim, so `find-work`'s import keeps working — point it at the new path anyway).
- Produces: `NicheExplorer`, `NicheScorer`, `VettingTool`, `FindWorkDirectory` — unchanged exports.

**Frozen:** the vetting weights (`STOP_SCORE_THRESHOLD`, `INSTANT_STOP_WEIGHT`, `verdictCopy` keys), `TASTE_COUNT`, the `useMemo` filter in `FindWorkDirectory`, `initScores`, `VERDICT_TIERS`, the weighted-average maths in `niche-scorer`, `usePath()` and `choosePath` in `niche-explorer`.

#### 15a — `niche-explorer.tsx`

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–10 with:

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import tracksData from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
```

**Edit 2 — the accent maps.** Delete `accentRing`, `iconTone`, `accentText`, `accentBar` and replace their uses with `accent(t.accent).ring`, `accent(t.accent).soft`, `accent(track.accent).text`, `accent(x).fill`.

**Edit 3 — the empty state.** Replace

```tsx
      {tracks.length === 0 && (
        <p className="mt-6 rounded-2xl border border-line bg-paper-2 p-6 text-sm text-ink-soft">
          No niches match this filter yet.
        </p>
      )}
```
with
```tsx
      {tracks.length === 0 && (
        <EmptyState
          className="mt-6"
          icon="binoculars"
          title="No niches match this filter yet"
          body="Clear the filter to see all twenty-two lanes."
          action={
            <Button variant="outline" onClick={() => setFilter(null)}>
              Clear filter
            </Button>
          }
        />
      )}
```

**Edit 4 — `FilterChip`.** Delete the local component and replace each call site with `<Button size="sm" variant={active ? "primary" : "outline"} onClick={onClick} aria-pressed={active}>{label}</Button>`.

**Edit 5 — the track cards.** Keep the `<button>` (the card *is* the control that opens the detail panel) but strip its chrome onto `Card`:

```tsx
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              aria-pressed={active}
              aria-expanded={active}
              aria-controls={panelId}
              data-active={active}
              className={cn(
                "group relative flex h-full flex-col gap-3 rounded-md border border-line bg-paper p-6 text-left transition-colors duration-150 ease-out",
                "hover:border-ink hover:bg-band",
                active && "border-ink bg-band",
              )}
            >
```

The `hover:-translate-y-1` and the shadow are gone; the accent ring is replaced by the `active` border. `handleSelect`, the aria wiring and `panelId` are unchanged.

**Edit 6 — the detail panel.** Replace the `<div className="relative rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 shadow-[var(--shadow-lg)] lg:p-10">` shell with `<Card padding="lg" className="relative">`, the close `<button>` with

```tsx
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Close niche details"
        className="absolute right-6 top-6"
        icon={<Icon name="x" size={16} />}
      >
        <span className="sr-only">Close</span>
      </Button>
```

and the "Choose this as my path" button with

```tsx
          <Button onClick={onChoose}>Choose this as my path</Button>
```

(the `Sparkles` icon is deleted, §9). The `isChosen` branch keeps its text and becomes `<Badge tone="verified"><Icon name="check" size={16} /> This is your path</Badge>`.

**Edit 7 — the sweep.** `Pill` → `Badge`; `rounded-2xl` → `rounded-md`; `rounded-xl` → `rounded-sm`; `rounded-full` → `rounded-pill`; `bg-paper-2` → `bg-paper`; `bg-paper-3` → `bg-band`; `text-signal`/`bg-signal` → `text-primary`/`bg-primary`; every `shadow-[…]` and `hover:-translate-y-*` deleted; `<X size=…>` → `<Icon name="x" …>`; `<Check size=…>` → `<Icon name="check" …>`; `<Award size=…>` → `<Icon name="award" …>`; `<ArrowUpRight size=…>` → `<Icon name="arrow-up-right" …>`.

#### 15b — `niche-scorer.tsx`

- [ ] **Step 2: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–7 with:

```tsx
"use client";

import { useId, useMemo, useState } from "react";
import frameworks from "@/data/frameworks.json";
import {
  Badge,
  Callout,
  Card,
  Field,
  Heading,
  Icon,
  Input,
  ProgressBar,
  Radio,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
```

**Edit 2 — `ICON_TONE`.** Delete the map and replace `ICON_TONE[idx % 4]` with

```tsx
accent(["signal", "verified", "caution", "info"][idx % 4]).soft
```

**Edit 3 — the outer shell and the niche name field.** Replace

```tsx
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-lg)] lg:p-8">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-niche`} className="kicker">
          What niche are you evaluating?
        </label>
        <input
          id={`${uid}-niche`}
          type="text"
          value={nicheName}
          onChange={(e) => setNicheName(e.target.value)}
          placeholder="e.g. AI prompt QA, pet content editing, whatever you're actually considering"
          className="mt-2 w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
        />
      </div>
```
with
```tsx
    <div className="flex flex-col">
      <Field label="What niche are you evaluating?">
        <Input
          id={`${uid}-niche`}
          type="text"
          value={nicheName}
          onChange={(e) => setNicheName(e.target.value)}
          placeholder="e.g. AI prompt QA, pet content editing, whatever you're actually considering"
        />
      </Field>
```
(`/niches` wraps the scorer in `<Card padding="lg">` in Task 19).

**Edit 4 — the 1–5 score radios.** Replace the whole `SCORE_VALUES.map(...)` block with:

```tsx
                  {SCORE_VALUES.map((n) => (
                    <Radio
                      key={n}
                      id={`${groupId}-${n}`}
                      name={groupId}
                      checked={value === n}
                      onChange={() => setScore(c.id, n)}
                      label={String(n)}
                    />
                  ))}
```
and wrap the row in `<Field as="group" label={`${c.name}: ${c.question}`} hideLabel>` so the set has a legend. `setScore(c.id, n)` is unchanged.

**Edit 5 — the score dial.** Replace the conic-gradient block with

```tsx
            <ProgressBar
              value={pct}
              max={100}
              label={`${nicheName.trim() || "This niche"} scores ${pct} percent`}
              showValue
              tone={tier.tone}
            />
```
and delete `tierRing`. `pct` and `tier` are unchanged. `tier.tone` is `"verified" | "caution" | "signal"`, all valid `Accent` values.

**Edit 6 — the weak-spot panel.** Replace `<AlertTriangle size={13} />` with `<Icon name="alert-triangle" size={13} />`, delete the `Sparkles` line entirely and replace the "no weak spots" branch with:

```tsx
              <Callout tone="verified">
                <Text size="caption">
                  No weak spots scored below a 3, nothing glaring to flag.
                </Text>
              </Callout>
```

#### 15c — `find-work.tsx`

- [ ] **Step 3: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–17 with:

```tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import apply from "@/data/apply.json";
import findwork from "@/data/findwork.json";
import { PathGate } from "@/components/journey";
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Heading,
  Icon,
  Input,
  Text,
} from "@/components/ui";
import { Container } from "@/components/layout";
import { cn } from "@/lib/utils";
```

**Edit 2 — `verdictCopy`'s `icon` field.** It currently holds lucide components. Change the type and the three values to kebab names:

```tsx
const verdictCopy: Record<
  Verdict,
  {
    title: string;
    body: string;
    tone: "verified" | "caution" | "signal";
    icon: string;
  }
> = {
  clear: { …, tone: "verified", icon: "shield-check" },
  caution: { …, tone: "caution", icon: "shield-alert" },
  stop: { …, tone: "signal", icon: "octagon-alert" },
};
```

Leave `title`, `body` and `tone` exactly as they are. At the render site, `const { title, body, tone, icon: verdictIcon } = verdictCopy[verdict];` and `<Icon name={verdictIcon} size={26} />` replace `<VerdictIcon size={26} aria-hidden />`.

**Edit 3 — delete `toneClasses`.** Replace `toneClasses[tone]` with `accent(tone).soft` and add `import { accent } from "@/lib/accent";`.

**Edit 4 — the red-flag checkboxes.** Replace each `<label …><input type="checkbox" …/>…</label>` row with:

```tsx
            <Card
              key={flag.id}
              padding="sm"
              className={cn(isChecked && "border-coral bg-coral-tint")}
            >
              <Checkbox
                id={`flag-${flag.id}`}
                checked={isChecked}
                onChange={() => toggle(flag.id)}
                aria-describedby={whyId}
                label={
                  <span className="flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2 text-small font-semibold text-ink">
                      {flag.flag}
                      {flag.weight >= INSTANT_STOP_WEIGHT && (
                        <Badge tone="coral">Instant stop</Badge>
                      )}
                    </span>
                    <span id={whyId} className="text-caption leading-relaxed text-ink-soft">
                      {flag.why}
                    </span>
                  </span>
                }
              />
            </Card>
```
and wrap the whole set in `<Field as="group" label="Check every box that describes this opportunity" hideLabel>` in place of the current `<fieldset>` + `<legend className="sr-only">`.

**Edit 5 — the directory search.** Replace

```tsx
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search the directory</span>
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag, niche…"
            className="w-full rounded-full border border-line-strong bg-paper-2 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-ink"
          />
        </label>
```
with
```tsx
        <Field label="Search the directory" hideLabel className="w-full sm:w-72">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag, niche…"
          />
        </Field>
```

The magnifier decoration goes: an `Input` with a placeholder and a real label does the same job without an absolutely positioned icon to keep aligned.

**Edit 6 — `FilterChip`.** Delete the local component; each call site becomes
`<Button size="sm" variant={active ? "primary" : "outline"} onClick={onClick} aria-pressed={active}>{children}</Button>`.

**Edit 7 — the empty result.** Replace

```tsx
      {filtered.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line-strong bg-paper-2 p-8 text-center text-sm text-ink-soft">
          No matches. Try a different category or search term.
        </p>
      )}
```
with
```tsx
      {filtered.length === 0 && (
        <EmptyState
          className="mt-10"
          icon="search"
          title="No matches"
          body="Try a different category or search term."
        />
      )}
```

**Edit 8 — `EntryCard` and the section shell.** Keep the `motion.div` (it animates the layout change) but replace its className with the `Card` chrome and drop the lift and shadow; `<Pill>` → `<Badge>`; `<MapPin size={12} …>` → `<Icon name="map-pin" size={12} />`; `<ExternalLink size={14} …>` → `<Icon name="arrow-up-right" size={14} />`. Replace `<section className="container-x pb-20 lg:pb-28">` with `<Container><div className="pb-20 lg:pb-28">` … `</div></Container>` so the component stops depending on the legacy `.container-x` class.

- [ ] **Step 4: Write the three test files**

`components/niche-scorer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NicheScorer } from "@/components/niche-scorer";

describe("NicheScorer", () => {
  it("renders the name field and a 1-5 scale per criterion", () => {
    render(<NicheScorer />);
    expect(screen.getByLabelText(/what niche are you evaluating/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio").length % 5).toBe(0);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("scoring everything at 5 moves the verdict to the top tier", async () => {
    const user = userEvent.setup();
    render(<NicheScorer />);
    const fives = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-5"));
    for (const r of fives) await user.click(r);
    expect(await screen.findByText(/strong niche/i)).toBeInTheDocument();
  });
});
```

`components/find-work.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { FindWorkDirectory, VettingTool } from "@/components/find-work";

describe("VettingTool", () => {
  it("starts clear and turns to a hard stop on an instant-stop flag", async () => {
    const user = userEvent.setup();
    render(<VettingTool />);
    expect(screen.getByText(/no red flags checked/i)).toBeInTheDocument();
    const instantStop = screen.getAllByRole("checkbox")[0];
    await user.click(instantStop);
    expect(await screen.findByText(/stop\. walk away\./i)).toBeInTheDocument();
  });
});

describe("FindWorkDirectory", () => {
  it("filters the directory by query", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <FindWorkDirectory />
      </PathProvider>,
    );
    await user.type(screen.getByLabelText(/search the directory/i), "zzzznotathing");
    expect(await screen.findByText(/no matches/i)).toBeInTheDocument();
  });
});
```

`components/niche-explorer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { NicheExplorer } from "@/components/niche-explorer";

describe("NicheExplorer", () => {
  it("renders the niche grid", () => {
    render(
      <PathProvider>
        <NicheExplorer />
      </PathProvider>,
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(10);
  });

  it("opening a niche reveals its detail panel", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <NicheExplorer />
      </PathProvider>,
    );
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    expect(await screen.findByRole("button", { name: /close niche details/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Verify**

Run:
```bash
npx vitest run components/niche-explorer.test.tsx components/niche-scorer.test.tsx components/find-work.test.tsx
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep -E "niche-explorer|niche-scorer|find-work" || echo "clean"
grep -n "STOP_SCORE_THRESHOLD\|INSTANT_STOP_WEIGHT\|TASTE_COUNT\|VERDICT_TIERS" components/find-work.tsx components/niche-scorer.tsx
```
Expected: PASS, silent, `clean`, and the four constants present with their original values.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/niche-explorer.tsx components/niche-scorer.tsx components/find-work.tsx components/niche-explorer.test.tsx components/niche-scorer.test.tsx components/find-work.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(workshops): niche explorer, niche scorer and find-work on the primitives"
```
---

### Task 16: Batch C/6 — `plan-wizard.tsx`, `study-protocol.tsx`, `prompt-workshop.tsx`

**Parallel group:** D

**Files:**
- Edit script: `components/plan-wizard.tsx` (433), `components/study-protocol.tsx` (366)
- Replace (whole file): `components/prompt-workshop.tsx` (141)
- Create: `components/plan-wizard.test.tsx`, `components/study-protocol.test.tsx`, `components/prompt-workshop.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `Checkbox`, `ChoiceCard`, `Field`, `Heading`, `Icon`, `ProgressBar`, `Text`, `Textarea` from `@/components/ui`; `CopyButton`; `usePath()` unchanged in `plan-wizard`.
- Produces: `PlanWizard`, `StudyProtocol`, `PromptWorkshop` — unchanged exports. `PromptWorkshop` keeps its `{ intro, fields, qualityLevels }` props.

**Frozen:** `plan-wizard`'s `step` / `direction` / `answers` / `resumed` state, the two `useEffect`s, `selectOption`, `goBack`, `startOver`, `changePath`, `togglePlanDay`, `NAV_LABEL`, and every `usePath()` call; `study-protocol`'s `QUESTIONS`, `buildProtocol`, the `timeoutRef` auto-advance and its cleanup; `prompt-workshop`'s `buildPrompt`, `values`, `filledCount`, `missingLabels`, `level`.

#### 16a — `plan-wizard.tsx`

- [ ] **Step 1: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–13 with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import plan from "@/data/plan.json";
import tracksData from "@/data/tracks.json";
import site from "@/data/site.json";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceCard,
  Field,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
```

`next/link` is dropped: the per-day tool link becomes `<Button href size="sm" variant="outline">`.

**Edit 2 — the question options.** Replace the whole `question.options.map((opt) => { … })` block with:

```tsx
                {question.options.map((opt) => (
                  <ChoiceCard
                    key={opt.value}
                    name={question.id}
                    value={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    icon={opt.icon ? <Icon name={opt.icon} size={18} /> : undefined}
                    checked={answers[question.id] === opt.value}
                    onChange={(value) => selectOption(question.id, value)}
                  />
                ))}
```
and wrap the grid in `<Field as="group" label={question.q} hideLabel>` so the set carries a legend while the visible `<h3>` stays where it is. `selectOption(question.id, value)` takes the same two arguments it took before, and `accentSelected` / `iconTone` are deleted along with the hand-styled button.

**Edit 3 — the day checkboxes.** Replace each row's `<input type="checkbox">` + `<label>` pair with:

```tsx
                            <li key={day.day} className="flex items-start gap-3 py-3">
                              <Checkbox
                                id={`plan-day-${day.day}`}
                                checked={checked}
                                onChange={() => togglePlanDay(day.day)}
                                aria-label={`Mark day ${day.day} complete: ${day.task}`}
                                className="flex-1"
                                label={
                                  <span
                                    className={cn(
                                      "text-small leading-relaxed",
                                      checked ? "text-ink-faint line-through" : "text-ink",
                                    )}
                                  >
                                    <span className="font-semibold">Day {day.day}.</span> {day.task}
                                  </span>
                                }
                              />
                              <Button
                                href={day.tool}
                                size="sm"
                                variant="outline"
                                icon={<Icon name="arrow-up-right" size={12} />}
                              >
                                {NAV_LABEL[day.tool] ?? day.tool}
                              </Button>
                            </li>
```

`togglePlanDay(day.day)` and `state.planDays[day.day]` are unchanged.

**Edit 4 — the three navigation buttons.** Replace

```tsx
                <button
                  type="button"
                  onClick={changePath}
                  className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-2 px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
                >
                  Change my path
                </button>
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-signal"
                >
                  <RotateCcw size={14} />
                  Start over
                </button>
```
with
```tsx
                <Button variant="outline" onClick={changePath}>
                  Change my path
                </Button>
                <Button
                  variant="ghost"
                  onClick={startOver}
                  icon={<Icon name="rotate-ccw" size={14} />}
                >
                  Start over
                </Button>
```
and the back button

```tsx
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
```
with
```tsx
                <div className="mt-8">
                  <Button
                    variant="link"
                    onClick={goBack}
                    icon={<Icon name="chevron-left" size={14} />}
                  >
                    Back
                  </Button>
                </div>
```

**Edit 5 — the week cards and the sweep.** `<div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">` → `<Card padding="md">`; `<Pill …>` → `<Badge …>`; `className="kicker"` → `<Kicker>` (add it to the import); every `rounded-2xl` → `rounded-md`, `rounded-xl` → `rounded-sm`, `rounded-full` → `rounded-pill`; `bg-paper-2`/`bg-paper-3` → `bg-paper`/`bg-band`; `text-signal` → `text-primary`; every `hover:-translate-y-*` and `shadow-[…]` deleted; `<Check size={14} />` → `<Icon name="check" size={14} />`.

#### 16b — `study-protocol.tsx`

- [ ] **Step 2: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–9 with:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import learning from "@/data/learning.json";
import { CopyButton } from "@/components/copy-button";
import {
  Badge,
  Button,
  Callout,
  Card,
  ChoiceCard,
  Field,
  Heading,
  Icon,
  ProgressBar,
  Text,
} from "@/components/ui";
import { cn } from "@/lib/utils";
```

**Edit 2 — the question options.** Replace the whole `question.options.map((opt) => { … })` block (the one with `peer sr-only` radios) with:

```tsx
                {question.options.map((opt) => (
                  <ChoiceCard
                    key={opt.value}
                    name={question.id}
                    value={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    checked={answers[question.id] === opt.value}
                    onChange={(value) => selectOption(question.id, value)}
                  />
                ))}
```
and replace the surrounding `<fieldset>` / `<legend>` with:

```tsx
            <Field as="group" label={question.q} hint={question.help}>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                …the map above…
              </div>
            </Field>
```

The visible `<legend className="font-display text-2xl …">` becomes the `Field` legend; add `className="[&>legend]:font-display [&>legend]:text-h3"` to the `Field` if the smaller default legend loses the page's rhythm — that is a one-line style call, not a structural change.

**Edit 3 — the progress bar.** The wizard renders a `progressPct` bar by hand. Replace it with:

```tsx
        <ProgressBar
          value={Math.min(step, QUESTIONS.length)}
          max={QUESTIONS.length}
          label="Protocol progress"
          showValue
        />
```
and delete `progressPct` **only if** nothing else reads it; if it is also used in an `aria-` attribute or a label string, keep the constant and pass the counts to `ProgressBar` as above.

**Edit 4 — the back and restart buttons.** Same replacements as `plan-wizard` Edit 4 (`chevron-left` back, `rotate-ccw` start over).

**Edit 5 — `ProtocolResult`.** Replace each `rounded-2xl border … bg-…` panel with `Card` or `Callout` (`border-verified/25 bg-verified-tint` → `<Callout tone="verified">`), `className="kicker"` → `<Kicker>`, and keep `<CopyButton value={summary.text} label="Copy my protocol" />` exactly as it is — `summary.text` is the user's own output and the whole point of the tool.

#### 16c — `prompt-workshop.tsx`

- [ ] **Step 3: Replace `components/prompt-workshop.tsx` in full**

```tsx
"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Badge, Card, Field, Kicker, ProgressBar, Text, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

export type BuilderField = {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
};

export type QualityLevel = {
  count: number;
  label: string;
  tone: string;
  note: string;
};

type Props = {
  intro: string;
  fields: BuilderField[];
  qualityLevels: QualityLevel[];
};

/**
 * Map the free-text `tone` string from data/prompting.json onto the shared
 * Badge/accent union so the component reuses the primitives without a cast.
 */
const TONE: Record<string, "neutral" | "signal" | "verified" | "caution"> = {
  neutral: "neutral",
  signal: "signal",
  caution: "caution",
  verified: "verified",
};

function buildPrompt(fields: BuilderField[], values: Record<string, string>): string {
  return fields
    .filter((f) => values[f.id]?.trim())
    .map((f) => `${f.label}: ${values[f.id].trim()}`)
    .join("\n\n");
}

export function PromptWorkshop({ intro, fields, qualityLevels }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const filledCount = fields.filter((f) => values[f.id]?.trim()).length;
  const missingLabels = fields.filter((f) => !values[f.id]?.trim()).map((f) => f.label);
  const level = qualityLevels.find((l) => l.count === filledCount) ?? qualityLevels[0];
  const assembled = buildPrompt(fields, values);

  function update(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div>
      <Text size="small" className="max-w-2xl">
        {intro}
      </Text>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <Field
              key={f.id}
              label={f.label}
              hint={f.hint}
              className={cn(f.id === "context" && "sm:col-span-2")}
            >
              <Textarea
                id={`workshop-${f.id}`}
                value={values[f.id] ?? ""}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={f.id === "context" ? 4 : 3}
              />
            </Field>
          ))}
        </div>

        <Card as="section" padding="md" className="lg:sticky lg:top-24">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <Kicker>Quality meter</Kicker>
                <Badge tone={TONE[level.tone] ?? "neutral"}>{level.label}</Badge>
              </div>
              <ProgressBar
                className="mt-3"
                value={filledCount}
                max={fields.length}
                label={`${filledCount} of ${fields.length} prompt parts filled`}
                hideLabel
                tone={TONE[level.tone] ?? "neutral"}
              />
              <Text size="caption" tone="faint" className="mt-2 font-medium tabular-nums">
                {filledCount}/{fields.length} parts
              </Text>
              <Text size="caption" className="mt-2">
                {level.note}
              </Text>
              {missingLabels.length > 0 && (
                <Text size="caption" tone="faint" className="mt-2">
                  Still missing:{" "}
                  <span className="font-semibold text-ink">{missingLabels.join(", ")}</span>
                </Text>
              )}
            </div>

            <pre className="min-h-[200px] overflow-auto whitespace-pre-wrap rounded-sm border border-line-strong bg-band p-4 text-caption leading-relaxed text-ink">
              {assembled || "Your prompt builds here as you fill in the fields on the left."}
            </pre>

            {assembled ? (
              <CopyButton value={assembled} label="Copy my prompt" className="w-full justify-center" />
            ) : (
              <Text size="caption" tone="faint" className="text-center">
                Fill in at least one field to copy your prompt.
              </Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

`buildPrompt`, `values`, `filledCount`, `missingLabels`, `level` and `update` are byte-identical. The hand-rolled `role="progressbar"` div and the `BAR_TONE` map are gone; `ProgressBar` supplies both.

- [ ] **Step 4: Write the three test files**

`components/prompt-workshop.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptWorkshop } from "@/components/prompt-workshop";

const FIELDS = [
  { id: "role", label: "Role", hint: "Who is it?", placeholder: "a bookkeeper" },
  { id: "context", label: "Context", hint: "What is going on?", placeholder: "a messy ledger" },
];
const LEVELS = [
  { count: 0, label: "Empty", tone: "neutral", note: "Start with the role." },
  { count: 1, label: "Thin", tone: "caution", note: "Add the context." },
  { count: 2, label: "Solid", tone: "verified", note: "Now run it." },
];

describe("PromptWorkshop", () => {
  it("renders a labelled textarea per field and a quality meter", () => {
    render(<PromptWorkshop intro="Build one." fields={FIELDS} qualityLevels={LEVELS} />);
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/context/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("assembles the prompt from what the user typed", async () => {
    const user = userEvent.setup();
    render(<PromptWorkshop intro="Build one." fields={FIELDS} qualityLevels={LEVELS} />);
    await user.type(screen.getByLabelText(/role/i), "a bookkeeper");
    expect(screen.getByText(/Role: a bookkeeper/)).toBeInTheDocument();
    expect(screen.getByText("Thin")).toBeInTheDocument();
  });
});
```

`components/study-protocol.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyProtocol } from "@/components/study-protocol";

describe("StudyProtocol", () => {
  it("renders the first question as a radio group", () => {
    render(<StudyProtocol />);
    expect(screen.getAllByRole("radio").length).toBeGreaterThan(1);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("choosing an option advances the wizard", async () => {
    const user = userEvent.setup();
    render(<StudyProtocol />);
    const first = screen.getAllByRole("radio")[0];
    const before = screen.getByRole("progressbar").getAttribute("aria-valuenow");
    await user.click(first);
    await new Promise((r) => setTimeout(r, 500));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).not.toBe(before);
  });
});
```

The 500 ms wait matches the component's existing auto-advance timeout. If that timeout changes, the test is wrong — but the timeout must not change, so it will not.

`components/plan-wizard.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { PlanWizard } from "@/components/plan-wizard";

describe("PlanWizard", () => {
  it("renders the first question as a choice set", async () => {
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    expect((await screen.findAllByRole("radio")).length).toBeGreaterThan(1);
  });

  it("answering the first question moves to the next", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    const first = (await screen.findAllByRole("radio"))[0];
    const heading = screen.getAllByRole("heading")[0].textContent;
    await user.click(first);
    expect(screen.getAllByRole("heading")[0].textContent).not.toBe(heading);
  });
});
```

- [ ] **Step 5: Verify**

Run:
```bash
npx vitest run components/plan-wizard.test.tsx components/study-protocol.test.tsx components/prompt-workshop.test.tsx
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep -E "plan-wizard|study-protocol|prompt-workshop" || echo "clean"
```
Expected: PASS, silent, `clean`.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/plan-wizard.tsx components/study-protocol.tsx components/prompt-workshop.tsx components/plan-wizard.test.tsx components/study-protocol.test.tsx components/prompt-workshop.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(workshops): plan wizard, study protocol and prompt workshop on ChoiceCard, Field and ProgressBar"
```

---

### Task 17: Batch C/7 — `rate-calculator.tsx`, `rate-worksheet.tsx`, `equipment-checker.tsx`

**Parallel group:** D

**Files:**
- Replace (whole file): `components/rate-calculator.tsx` (133)
- Edit script: `components/rate-worksheet.tsx` (249), `components/equipment-checker.tsx` (255)
- Create: `components/rate-calculator.test.tsx`, `components/rate-worksheet.test.tsx`, `components/equipment-checker.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Card`, `Checkbox`, `Field`, `Heading`, `Icon`, `Input`, `Kicker`, `ProgressBar`, `Radio`, `Range`, `Select`, `Stat`, `StatStrip`, `Text` from `@/components/ui`; `computeRate` from `@/lib/rate-math`; `toMonthlyPhp` / `spreadFromPosts` / `type Post` / `type RateUnit` from `@/lib/worksheet-math`; `migrateKey`; `usePath()`.
- Produces: `RateCalculator`, `RateWorksheet`, `EquipmentChecker` — unchanged exports. `EquipmentChecker` keeps its `{ categories }` prop.

**Frozen:** every argument to `computeRate`, the seven slider `useState`s and their initial values; `KEY = "hfph.worksheet.v1"`, `migrateKey("devup.worksheet.v1", KEY)`, both `useEffect`s, `SEED`, `UNITS`, `update`/`remove`/`add`; `equipment-checker`'s `usePath()` gate, `parseLowPrice`, `isMonthly`, `estimateTotal`, `toggleEquipment`.

#### 17a — `components/rate-calculator.tsx`

- [ ] **Step 1: Replace the file in full**

```tsx
"use client";

import { useState } from "react";
import { Callout, Card, Field, Icon, Kicker, Range, Stat, StatStrip, Text } from "@/components/ui";
import { computeRate } from "@/lib/rate-math";

/** A labelled slider. The value read-out is part of the label, per Field's contract. */
function SliderField({
  label,
  value,
  setValue,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={label}
        valueLabel={
          <span className="font-semibold text-primary">
            {prefix}
            {value.toLocaleString()}
            {suffix}
          </span>
        }
      />
    </Field>
  );
}

const peso = (n: number) => "₱" + Math.round(n).toLocaleString("en-PH");

export function RateCalculator() {
  const [rate, setRate] = useState(8); // $/hr billed
  const [hours, setHours] = useState(40); // billable hours/week
  const [fee, setFee] = useState(10); // platform fee %
  const [unpaid, setUnpaid] = useState(30); // unpaid time %
  const [costs, setCosts] = useState(4000); // ₱/mo internet, power, tools
  const [tax, setTax] = useState(8); // %
  const [fx, setFx] = useState(60); // ₱ per $1

  const {
    afterFeeUsd,
    grossPhp,
    netPhp,
    totalHoursMonthly,
    effHourlyPhp,
    effHourlyUsd,
    shrink,
  } = computeRate({ rate, hours, fee, unpaid, costs, tax, fx });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <SliderField label="Your billed rate" value={rate} setValue={setRate} min={2} max={60} prefix="$" suffix="/hr" />
        <SliderField label="Billable hours per week" value={hours} setValue={setHours} min={5} max={60} suffix=" hrs" />
        <SliderField
          label="Platform fee"
          value={fee}
          setValue={setFee}
          min={0}
          max={20}
          suffix="%"
          hint="Upwork and similar take a cut. 0 if the client is fully direct."
        />
        <SliderField
          label="Unpaid time"
          value={unpaid}
          setValue={setUnpaid}
          min={0}
          max={60}
          suffix="%"
          hint="Hunting for work, unpaid tests, proposals nobody answers. Research puts this near a third."
        />
        <SliderField
          label="Monthly costs"
          value={costs}
          setValue={setCosts}
          min={0}
          max={20000}
          step={500}
          prefix="₱"
          hint="Internet, electricity, and the tools you pay for."
        />
        <SliderField
          label="Tax set-aside"
          value={tax}
          setValue={setTax}
          min={0}
          max={25}
          suffix="%"
          hint="The BIR 8% flat option is a common starting point."
        />
        <SliderField label="Exchange rate" value={fx} setValue={setFx} min={45} max={70} prefix="₱" suffix=" / $1" />
      </div>

      {/* outputs */}
      <div className="flex flex-col gap-4">
        <Callout tone="signal">
          <Kicker tone="signal">Your real hourly rate</Kicker>
          <StatStrip className="mt-2">
            <Stat
              value={`$${effHourlyUsd.toFixed(2)} / hr`}
              label={`About ${peso(effHourlyPhp)} an hour, take-home, across every hour you actually work.`}
            />
          </StatStrip>
          {shrink > 0 && (
            <Text size="small" tone="ink" className="mt-3 border-l-2 border-primary pl-3 font-medium">
              That is {shrink}% below your ${rate}/hr headline rate. That gap is the fees, the
              costs, the tax, and the unpaid time nobody bills for.
            </Text>
          )}
        </Callout>

        <StatStrip className="grid grid-cols-2 gap-4">
          {[
            { k: "Gross (after fee)", v: "$" + Math.round(afterFeeUsd).toLocaleString() + " / mo" },
            { k: "In pesos", v: peso(grossPhp) + " / mo" },
            { k: "After costs & tax", v: peso(netPhp) + " / mo" },
            { k: "Hours you really work", v: Math.round(totalHoursMonthly) + " / mo" },
          ].map((r) => (
            <Card key={r.k} padding="sm">
              <Stat value={r.v} label={r.k} />
            </Card>
          ))}
        </StatStrip>

        <Card padding="sm">
          <div className="flex items-start gap-2">
            <Icon name="scan-eye" size={16} weight="bold" className="mt-0.5 shrink-0 text-verified" />
            <Text size="caption">
              An estimate, not a promise. The point is the shape: never compare a headline rate
              to a local salary before you subtract everything above.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

The seven `useState` initial values and the single `computeRate({ … })` call are byte-identical, and the page (`/salary`, Task 8) supplies the surrounding `Card padding="lg"` the old outer div used to draw.

#### 17b — `components/rate-worksheet.tsx`

- [ ] **Step 2: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–12 with:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Card,
  Field,
  Heading,
  Icon,
  Input,
  Kicker,
  Select,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import {
  type Post,
  type RateUnit,
  toMonthlyPhp,
  spreadFromPosts,
} from "@/lib/worksheet-math";
import { cn } from "@/lib/utils";
import { migrateKey } from "@/lib/storage";
```

**Edit 2 — the outer shell.** `<div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 lg:p-8">` → `<div className="flex flex-col">`; `/salary` wraps it.

**Edit 3 — the FX field.** Replace

```tsx
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Assumed FX
          <span className="text-ink-faint">₱</span>
          <input
            type="number"
            min={1}
            value={fx}
            onChange={(e) => setFx(Number(e.target.value) || DEFAULT_FX)}
            aria-label="Assumed pesos per US dollar"
            className="w-16 rounded-lg border border-line-strong bg-paper px-2 py-1 text-right font-mono text-sm"
          />
          <span className="text-ink-faint">/ $1</span>
        </label>
```
with
```tsx
        <Field label="Assumed pesos per US dollar" hideLabel className="w-auto">
          <div className="flex items-center gap-2">
            <Text size="small" as="span">
              Assumed FX ₱
            </Text>
            <Input
              type="number"
              min={1}
              value={fx}
              onChange={(e) => setFx(Number(e.target.value) || DEFAULT_FX)}
              aria-label="Assumed pesos per US dollar"
              className="w-20 text-right tabular-nums"
            />
            <Text size="small" as="span">
              / $1
            </Text>
          </div>
        </Field>
```

`setFx(Number(e.target.value) || DEFAULT_FX)` is unchanged.

**Edit 4 — the post rows.** Replace the three controls and the delete button inside `posts.map((p) => { … })`:

```tsx
              <Input
                value={p.role}
                onChange={(e) => update(p.id, { role: e.target.value })}
                placeholder="e.g. Bookkeeper"
                aria-label="Role"
                className="col-span-2 sm:col-span-1"
              />
              <Input
                type="number"
                min={0}
                value={p.amount || ""}
                onChange={(e) => update(p.id, { amount: Number(e.target.value) || 0 })}
                placeholder="0"
                aria-label="Rate amount"
                className="text-right tabular-nums"
              />
              <Select
                value={p.unit}
                onChange={(e) => update(p.id, { unit: e.target.value as RateUnit })}
                aria-label="Rate unit"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
              <span
                className={cn(
                  "text-right text-small tabular-nums",
                  monthly === null ? "text-ink-faint" : "text-ink",
                )}
              >
                {monthly === null ? "—" : php(monthly)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(p.id)}
                aria-label="Remove post"
                className="justify-self-end"
                icon={<Icon name="trash" size={15} />}
              >
                <span className="sr-only">Remove</span>
              </Button>
```

and change the row wrapper's `rounded-xl border border-line bg-paper p-2` to `rounded-sm border border-line bg-paper p-2`.

**Edit 5 — add / reset.** Replace the two chrome buttons with:

```tsx
        <Button variant="outline" size="sm" onClick={add} icon={<Icon name="plus" size={15} />}>
          Add a post you found
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPosts(SEED)}
          icon={<Icon name="rotate-ccw" size={15} />}
        >
          Reset to examples
        </Button>
```

**Edit 6 — the result block.** Replace the `<div className="mt-7 rounded-2xl border border-line bg-paper-3/60 p-6">` with `<Card padding="md" className="mt-7">`, each of the three `rounded-xl border p-4` cells with `<Card padding="sm">` (the `hero` one adding `className="border-primary bg-primary-tint"`), each value paragraph with a `<Stat value={php(c.value)} label={c.label} sub="/month" />` inside a `<StatStrip>`, and the closing advice paragraph with `<Callout tone="signal">`.

**Edit 7 — the empty and hidden notes.** Replace the "Add at least one post…" paragraph with `<Text size="small" tone="faint" className="mt-7">…</Text>`, and the `hidden > 0` note's `<Info size={14} …>` with `<Icon name="info" size={14} />`.

#### 17c — `components/equipment-checker.tsx`

- [ ] **Step 3: Apply the edit script**

**Edit 1 — imports.** Replace lines 1–9 with:

```tsx
"use client";

import { useState } from "react";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Card,
  Checkbox,
  Field,
  Heading,
  Icon,
  Kicker,
  ProgressBar,
  Radio,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import { cn } from "@/lib/utils";
```

`Reveal` and `CheckCircle2` both go.

**Edit 2 — unwrap `Reveal`.** In `CategoryCard`, replace

```tsx
    <Reveal i={index % 4}>
      <div
        className={cn(
          "flex h-full flex-col rounded-2xl border p-6 transition-all duration-300",
          owned
            ? "border-verified/40 bg-verified-tint"
            : "border-line bg-paper-2 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        )}
      >
```
with
```tsx
      <Card
        padding="md"
        className={cn("h-full", owned && "border-verified bg-verified-tint")}
      >
```
and its two closing tags (`</div>` + `</Reveal>`) with a single `</Card>`. The now-unused `index` prop stays in the signature only if something else reads it; if not, delete `index` from both the props type and the call site — that is a pure dead-parameter removal, not a behaviour change.

**Edit 3 — the tier radios.** Replace the whole `<fieldset className="mt-5">` block with:

```tsx
        <Field as="group" label="Pick a tier" className="mt-5">
          <div className="grid grid-cols-3 gap-2">
            {category.tiers.map((t, i) => (
              <Radio
                key={t.tier}
                id={`${category.id}-tier-${i}`}
                name={`tier-${category.id}`}
                checked={i === tierIndex}
                onChange={() => onTierChange(i)}
                label={t.tier}
              />
            ))}
          </div>
        </Field>
```

`onTierChange(i)` and the `tierIndex` state are unchanged.

**Edit 4 — the ownership checkbox.** Replace

```tsx
        <label className="mt-5 flex cursor-pointer items-center gap-2.5 border-t border-line pt-4 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={owned}
            onChange={() => toggleEquipment(category.id)}
            className="h-4 w-4 accent-verified"
          />
          I already have this
        </label>
```
with
```tsx
        <div className="mt-5 border-t border-line pt-4">
          <Checkbox
            checked={owned}
            onChange={() => toggleEquipment(category.id)}
            label="I already have this"
          />
        </div>
```

**Edit 5 — the score dial.** Replace the conic-gradient block in the aside with:

```tsx
          <ProgressBar
            value={readyCount}
            max={totalEssentials}
            label={`${readyCount} of ${totalEssentials} essentials ready`}
            showValue
            tone="verified"
          />
```

`readyCount`, `totalEssentials`, `pct`, `allReady` and `message` are unchanged; `pct` is now only used by the message logic — if nothing reads it after the edit, delete the constant.

**Edit 6 — the aside and the estimate.** `<aside className="… rounded-2xl border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:sticky lg:top-24">` → `<Card as="section" padding="md" className="lg:sticky lg:top-24">`. Wrap the ₱ total in `<StatStrip><Stat value={…} label="Low-end planning total" sub={…} /></StatStrip>` so the number carries its caveat as the `sub`, and delete the `CheckCircle2` badge (the `owned` state is already carried by the checkbox and the card border).

**Edit 7 — the hydration skeleton.** Replace `rounded-2xl` with `rounded-md`, `bg-paper-2` with `bg-paper`, and leave `animate-pulse` and the `!hydrated` early return exactly as they are.

- [ ] **Step 4: Write the three test files**

`components/rate-calculator.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateCalculator } from "@/components/rate-calculator";

describe("RateCalculator", () => {
  it("renders one labelled slider per input", () => {
    render(<RateCalculator />);
    expect(screen.getAllByRole("slider")).toHaveLength(7);
    expect(screen.getByLabelText(/your billed rate/i)).toBeInTheDocument();
  });

  it("raising the billed rate raises the real hourly rate", async () => {
    render(<RateCalculator />);
    const slider = screen.getByLabelText(/your billed rate/i) as HTMLInputElement;
    const before = screen.getByText(/\/ hr$/).textContent;
    await userEvent.setup().type(slider, "{arrowright}{arrowright}{arrowright}");
    expect(screen.getByText(/\/ hr$/).textContent).not.toBe(before);
  });
});
```

`components/rate-worksheet.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateWorksheet } from "@/components/rate-worksheet";

describe("RateWorksheet", () => {
  it("seeds six example posts and shows an evidence range", () => {
    render(<RateWorksheet />);
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(6);
    expect(screen.getByText(/your evidence range/i)).toBeInTheDocument();
  });

  it("adding a post gives it an empty role field", async () => {
    const user = userEvent.setup();
    render(<RateWorksheet />);
    await user.click(screen.getByRole("button", { name: /add a post you found/i }));
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(7);
  });

  it("removing a post drops the row", async () => {
    const user = userEvent.setup();
    render(<RateWorksheet />);
    await user.click(screen.getAllByRole("button", { name: /remove post/i })[0]);
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(5);
  });
});
```

`components/equipment-checker.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import equipment from "@/data/equipment.json";
import { PathProvider } from "@/lib/path-context";
import { EquipmentChecker } from "@/components/equipment-checker";

const renderChecker = () =>
  render(
    <PathProvider>
      <EquipmentChecker categories={equipment.categories} />
    </PathProvider>,
  );

describe("EquipmentChecker", () => {
  it("renders one card per category with a tier group", async () => {
    renderChecker();
    expect((await screen.findAllByRole("group")).length).toBe(equipment.categories.length);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("ticking 'I already have this' moves the readiness bar", async () => {
    const user = userEvent.setup();
    renderChecker();
    const boxes = await screen.findAllByRole("checkbox", { name: /i already have this/i });
    const before = screen.getByRole("progressbar").getAttribute("aria-valuenow");
    await user.click(boxes[0]);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).not.toBe(before);
  });
});
```

- [ ] **Step 5: Verify**

Run:
```bash
npx vitest run components/rate-calculator.test.tsx components/rate-worksheet.test.tsx components/equipment-checker.test.tsx
node --test lib/rate-math.test.mjs lib/worksheet-math.test.mjs lib/calculators.test.mjs lib/storage.test.mjs
npx tsc --noEmit && npm run lint
node scripts/verify-primitives.mjs | grep -E "rate-calculator|rate-worksheet|equipment-checker" || echo "clean"
grep -n "hfph.worksheet.v1\|devup.worksheet.v1" components/rate-worksheet.tsx
```
Expected: PASS, math suites green, silent, `clean`, and the two storage keys present and unchanged.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/rate-calculator.tsx components/rate-worksheet.tsx components/equipment-checker.tsx components/rate-calculator.test.tsx components/rate-worksheet.test.tsx components/equipment-checker.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(workshops): rate calculator, rate worksheet and equipment checker on Range, Field and ProgressBar"
```
---

## Batch C, part two — the workshop host pages (Tasks 18–20)

**The Workshop archetype (spec §8.3):**

```tsx
<PageHero compact breadcrumb={getBreadcrumb(HREF)} kicker title accent? lead>
  …hero extras…
</PageHero>

<Section>
  …teaching sections, alternating bands…
</Section>

<Section spacing="none" className="pb-20 lg:pb-28">
  <Card padding="lg">
    <TheTool />
  </Card>
</Section>

<Section>
  <PageFooterNav {...findNavNeighbours(HREF)} />
</Section>
```

The tool always sits inside one `Card padding="lg"` — which is why every Batch C component in Tasks 10–17 drops its own outer card. A tool drawing its own border inside the host's card is the one regression to watch for; the check is in each task.

---

### Task 18: Host pages 1 — `/build`, `/plan`, `/tasks`, `/tracker`, `/apply`

**Parallel group:** E

**Files:**
- Replace (whole file): `app/build/page.tsx`, `app/plan/page.tsx`, `app/tasks/page.tsx`, `app/tracker/page.tsx`
- Edit script (231 lines): `app/apply/page.tsx`

**Icon mapping:** `Ban` → `ban` (`/build`); `ArrowRight` → `arrow-right` (`/tasks`); `KeyRound` → `key-round` (`/tracker`); `AlertTriangle` → `alert-triangle` (`/apply`); `Sparkles` → deleted (`/plan`'s quick-facts row).

- [ ] **Step 1: `app/build/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import labsData from "@/data/labs.json";
import { BuildLabs } from "@/components/build-labs";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { Badge, Callout, Card, Icon } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/build";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Build Labs",
  description: labsData.intro,
});

export default function BuildPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Build Labs"
        title="We don’t hand you the file."
        accent="We teach you to build it."
        lead={labsData.intro}
      >
        <Badge tone="signal">
          <Icon name="ban" size={13} /> We hand out zero templates
        </Badge>
        <Callout title="The creed" className="max-w-2xl">
          {labsData.creed}
        </Callout>
      </PageHero>

      <Section spacing="none" className="pb-24 lg:pb-32">
        <Card padding="lg">
          <BuildLabs />
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: `app/plan/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import plan from "@/data/plan.json";
import { PlanWizard } from "@/components/plan-wizard";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Badge, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/plan";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Your 30-Day Plan",
  description: plan.intro,
});

const QUICK_FACTS: { icon: string; label: string; tone: "signal" | "caution" | "verified" }[] = [
  { icon: "door-open", label: "Open to all", tone: "signal" },
  { icon: "clock", label: plan.commitment, tone: "caution" },
  { icon: "save", label: "Progress saved automatically", tone: "verified" },
];

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "Answer 5 quick questions",
    desc: "Experience, track, hours, equipment, and language goals.",
    icon: "list-checks",
  },
  {
    n: 2,
    title: "Get your day-by-day plan",
    desc: "30 days, mapped out with exact tasks and the in-app tool for each.",
    icon: "calendar-check",
  },
  {
    n: 3,
    title: "Track daily, right here",
    desc: "Check off each day as you finish it. Nothing to export or print.",
    icon: "check-circle-2",
  },
];

export default function PlanPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Your 30-day plan"
        title="Thirty days. One clear plan."
        accent="Built around you."
        lead={plan.intro}
      >
        <div className="flex flex-wrap gap-3">
          {QUICK_FACTS.map((f) => (
            <Badge key={f.label} tone={f.tone}>
              <Icon name={f.icon} size={13} />
              {f.label}
            </Badge>
          ))}
        </div>
      </PageHero>

      <Section>
        <SectionHeading
          kicker="How it works"
          title="Five minutes to a plan that fits your life"
          lead="No generic checklist. Your answers shape every one of the 30 days."
        />
        <CardGrid cols={3} className="mt-10">
          {HOW_IT_WORKS.map((s) => (
            <Card key={s.n}>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-ink font-display text-small tabular-nums text-on-navy">
                  0{s.n}
                </span>
                <Icon name={s.icon} size={18} className="text-primary" />
              </div>
              <Heading level={3} size="h5" className="mt-5">
                {s.title}
              </Heading>
              <Text size="small" className="mt-2">
                {s.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section spacing="none" className="pb-24">
        <Card padding="lg">
          <PlanWizard />
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

The `sparkles` icon in the first quick fact becomes `door-open` — §9 deletes the Sparkles motif outright, and "Open to all" wants a door, not a sparkle.

- [ ] **Step 3: `app/tasks/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import tasksData from "@/data/tasks.json";
import { MicroTasks } from "@/components/micro-tasks";
import { JsonLd } from "@/components/json-ld";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Button, Callout, Card, Heading, Icon, Kicker, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { BASE_URL } from "@/app/sitemap";

const HREF = "/tasks";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Micro-Tasks",
  description: tasksData.intro,
});

// ItemList of every micro-task, derived from the data so it can't drift.
const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Hire From PH micro-tasks",
  description: tasksData.intro,
  url: `${BASE_URL}/tasks`,
  numberOfItems: tasksData.tasks.length,
  itemListElement: tasksData.tasks.map((task, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: task.title,
  })),
};

// One icon per step of the doctrine's four-step brief shape; data stays in tasks.json.
const STEP_ICONS = ["list-checks", "book-open", "hammer", "trophy"];

export default function TasksPage() {
  return (
    <>
      <JsonLd data={itemListLd} />

      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={tasksData.kicker}
        title={tasksData.headline}
        lead={tasksData.intro}
      >
        <Callout title="The creed" className="max-w-2xl">
          {tasksData.creed}
        </Callout>
      </PageHero>

      <Section>
        <SectionHeading
          kicker="The shape of every task"
          title="Prerequisite → Resources → The Task → Prove it"
          lead="Every micro-task follows the same four-step brief, the same shape a real client hands a working professional."
        />
        <CardGrid cols={4} className="mt-12">
          {tasksData.howItWorks.map((step, idx) => (
            <Card key={step.title} as="article">
              <span className="font-display text-h3 tabular-nums text-line-strong">
                0{idx + 1}
              </span>
              <span className="mt-4 grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={STEP_ICONS[idx] ?? "list-checks"} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-4">
                {step.title}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {step.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section spacing="none" className="pb-24 lg:pb-32">
        <Card padding="lg">
          <MicroTasks />
        </Card>
      </Section>

      <Section band="tint">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col">
            <Kicker>Turn it into a portfolio</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              Every finished task is a portfolio piece
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Learn the anatomy of a real portfolio, then assemble your finished micro-tasks into
              one.
            </Text>
            <div className="mt-5">
              <Button href="/build" variant="outline">
                Open the portfolio lab
              </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <Kicker>Ready to apply</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              Take it straight to a client
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Finished a few of these? You already have proof. Go find who needs it.
            </Text>
            <div className="mt-5">
              <Button href="/apply">Find work</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 4: `app/tracker/page.tsx` in full**

```tsx
import type { Metadata } from "next";
import { ApplicationTracker } from "@/components/application-tracker";
import { CopyButton } from "@/components/copy-button";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/tracker";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Application Tracker",
  description:
    "Log every application, get nudged the moment a follow-up is overdue, and see your real reply and interview rates.",
});

const SCHEMA = [
  {
    part: "Company + Role",
    why: "Your unique row. Two applications to the same company for different roles are two different rows, never merge them.",
  },
  {
    part: "Status (fixed list)",
    why: 'Applied, Replied, Interview, Offer, Rejected, always picked from a dropdown, never typed free-hand. Free text drifts into ten spellings of "in progress" within a week.',
  },
  {
    part: "Applied on",
    why: "The date you sent it. On its own this is just a log, history, not a tool.",
  },
  {
    part: "Follow up on",
    why: "The one column that turns the log into a tool. It's what the radar panel above checks every time you open this page.",
  },
  {
    part: "Source",
    why: "Where you found it, LinkedIn, referral, direct. Once your pipeline gets long, this is what you'll filter by to see what's actually working.",
  },
  {
    part: "Notes",
    why: "Short and free text on purpose, the contact name, the referral, the one detail you'd forget by next week.",
  },
];

const FORMULAS = [
  {
    label: "Days overdue (Follow-up in column G)",
    formula: '=IF(G2="","",G2-TODAY())',
    note: "0 means due today, a negative number means overdue by that many days.",
  },
  {
    label: 'Count how many are at "Interview" (Status in column E)',
    formula: '=COUNTIF(E:E,"Interview")',
    note: "Swap the status string to count any stage.",
  },
  {
    label: "Reply rate",
    formula:
      '=(COUNTIF(E:E,"Replied")+COUNTIF(E:E,"Interview")+COUNTIF(E:E,"Offer"))/COUNTA(E2:E1000)',
    note: "Format the cell as a percentage.",
  },
];

export default function TrackerPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Get Hired · Your pipeline"
        title="Every application gets a row."
        accent="Every follow-up gets a date."
        lead="The #1 reason people lose an offer isn’t a bad resume, it’s silence after “applied”. This tracker runs your job hunt like an operation: log everything, get nudged the moment a follow-up is due, and see honestly whether the problem is your volume or your application."
      >
        <Callout icon="key-round" title="A quick reconciliation." className="max-w-3xl">
          <Text size="small">
            Everywhere else on Hire From PH we refuse to hand you a finished file, we teach you to
            build your own. This page is the one exception, on purpose: your job hunt is a tool for{" "}
            <em>your</em> life, not a deliverable you’d hand a client, and you need it running
            today, not after a lesson. So you get both, a working tracker right here, and below,
            exactly how it’s built, so you can rebuild it in Google Sheets and build the same kind
            of tracker for any client. That’s also the{" "}
            <strong className="font-semibold text-ink">Build Your Own Tracker</strong> lab at{" "}
            <Button href="/build" variant="link">
              /build
            </Button>
            .
          </Text>
        </Callout>
      </PageHero>

      <Section spacing="none" className="pb-20 lg:pb-28">
        <Card padding="lg">
          <ApplicationTracker />
        </Card>
      </Section>

      <Section band="tint">
        <SectionHeading
          kicker="How this is built"
          title="The schema behind this tracker, and why each column exists"
          lead="Every working tracker, applications, invoices, content calendars, is the same underlying pattern. Study this one, then rebuild it for anything."
        />

        <CardGrid cols={3} className="mt-12">
          {SCHEMA.map((s) => (
            <Card key={s.part} onBand>
              <Heading level={3} size="h5">
                {s.part}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {s.why}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-14">
          <SectionHeading
            kicker="Rebuild it in Sheets"
            title="The three formulas that make it self-monitoring"
            lead="Row 1 is your headers, row 2 is your first entry. Adjust column letters if you order yours differently."
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {FORMULAS.map((f) => (
            <Card key={f.formula} onBand>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Text size="small" tone="ink" className="font-semibold">
                    {f.label}
                  </Text>
                  <code className="mt-1.5 block overflow-x-auto whitespace-pre rounded-sm border border-line-strong bg-band px-3 py-2 text-caption text-ink-soft">
                    {f.formula}
                  </code>
                  <Text size="caption" tone="faint" className="mt-1.5">
                    {f.note}
                  </Text>
                </div>
                <CopyButton value={f.formula} label="Copy formula" />
              </div>
            </Card>
          ))}
        </div>

        <Card padding="md" className="mt-10" onBand>
          <Text size="small">
            Add Data → Data Validation on the Status column with a fixed list, add a conditional
            formatting rule to color any row where the days-overdue formula goes negative, and set
            a recurring reminder to review it, a tracker nobody reviews is worse than no tracker,
            because it creates false confidence.
          </Text>
          <Text size="lead" tone="ink" className="mt-4 font-display" balance>
            Now go rebuild this yourself, that’s the lab at{" "}
            <Button href="/build" variant="link">
              /build
            </Button>
            .
          </Text>
          <div className="mt-5">
            <Button href="/build">Go to Build Labs</Button>
          </div>
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
```

- [ ] **Step 5: `app/apply/page.tsx` edit script (231 lines)**

**Edit 1 — imports.** Replace lines 1–23 (through the closing `};` of `accentBg`) with:

```tsx
import type { Metadata } from "next";
import apply from "@/data/apply.json";
import findwork from "@/data/findwork.json";
import { VettingFlow } from "@/components/diagrams/vetting-flow";
import { CopyButton } from "@/components/copy-button";
import { FindWorkDirectory, VettingTool } from "@/components/find-work";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/apply";
```

`accentBg[method.accent]` becomes `accent(method.accent).soft` at its one call site.

**Edit 2 — the hero.** Replace the whole `<PageHero …> … </PageHero>` block with:

```tsx
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Find work"
        title="Don’t wait for a list."
        accent="Learn to find the work."
        lead={findwork.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {findwork.creed}
        </Callout>
        <Callout tone="caution" icon="alert-triangle" className="max-w-2xl">
          {apply.disclaimer}
        </Callout>
      </PageHero>
```

Note the hard-coded `text-[#6b4d00]` on the disclaimer goes with it — `Callout tone="caution"` carries the AA-checked `caution` text colour from the token set.

**Edit 3 — the sourcing section.** Replace `<section className="container-x pb-20 lg:pb-28">` with `<Section>`, drop the `<Reveal>` wrappers, and turn each method card into:

```tsx
            <Card key={method.id} as="article">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-sm border",
                  accent(method.accent).soft,
                )}
              >
                <Icon name={method.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-4">
                {method.name}
              </Heading>
              <Text size="small" className="mt-2">
                {method.how}
              </Text>
              <Text size="small" tone="faint" className="mt-3">
                <span className="font-semibold text-ink-soft">Why it works: </span>
                {method.why}
              </Text>
              <div className="mt-4 flex flex-col gap-2">
                {method.example.map((ex) => (
                  <div
                    key={ex}
                    className="flex items-center justify-between gap-3 rounded-sm border border-line-strong bg-band px-3.5 py-2.5"
                  >
                    <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-caption text-ink-soft">
                      {ex}
                    </code>
                    <CopyButton value={ex} label="Copy" />
                  </div>
                ))}
              </div>
            </Card>
```

**Edit 4 — the vetting section gains the flowchart.** Replace

```tsx
          <div className="mt-12">
            <VettingTool />
          </div>
```
with
```tsx
          <DiagramFrame
            title="Vetting an opportunity, gate by gate"
            caption="Read top to bottom. Every downward arrow is a no; a single yes exits right and ends the conversation."
            className="mt-12"
          >
            <VettingFlow />
          </DiagramFrame>

          <Card padding="lg" className="mt-10">
            <VettingTool />
          </Card>
```

**Edit 5 — the research list.** Replace the `<ol className="mt-10 grid gap-4 sm:grid-cols-2">` block with a `<StepList>` of `<Step n={idx + 1} title={step.title}>{step.desc}</Step>`.

**Edit 6 — the remaining sections.** `<section className="bg-paper-3/60 py-20 lg:py-28"><div className="container-x">` → `<Section band="tint">`; `<section className="container-x …">` → `<Section>`; every `<Reveal>` unwrapped; `rounded-2xl border border-line bg-paper-2 p-6` → `<Card>`; `<ButtonLink>` → `<Button>`; `<Kicker>` unchanged (it is a primitive); the closing two-column band becomes `<Section band="tint">` with a plain `grid sm:grid-cols-2`.

**Edit 7 — the tail.** After the closing band, add:

```tsx
      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
```

- [ ] **Step 6: Verify all five pages**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep -E "app.(build|plan|tasks|tracker|apply)" || echo "clean"
grep -c "practice:" app/build/page.tsx app/plan/page.tsx app/tasks/page.tsx app/tracker/page.tsx app/apply/page.tsx
```
Expected: silent, clean, build green, `clean`, and `0` practice markers per file — none of these five is on Phase 6's list.

Then confirm no tool draws its own card inside the host's card:

```bash
grep -nE "rounded-\[var\(--radius-lg\)\] border" components/build-labs.tsx components/plan-wizard.tsx components/micro-tasks.tsx components/application-tracker.tsx components/find-work.tsx || echo "no nested cards"
```
Expected: `no nested cards`.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/build/page.tsx app/plan/page.tsx app/tasks/page.tsx app/tracker/page.tsx app/apply/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(hosts): /build, /plan, /tasks, /tracker and /apply on the Workshop archetype; land the vetting flowchart"
```

---

### Task 19: Host pages 2 — `/prompts`, `/tools`, `/interview`, `/niches`, `/equipment`

**Parallel group:** E

**Files:**
- Edit script: `app/prompts/page.tsx` (349), `app/tools/page.tsx` (372), `app/interview/page.tsx` (278), `app/niches/page.tsx` (291), `app/equipment/page.tsx` (236)

All five are over 200 lines and all five share the same shape, so the edit script is written once as a **checklist applied to each file**, with the per-file specifics called out underneath.

- [ ] **Step 1: Apply the shared checklist to all five files**

For each file, in this order:

1. **Imports.** Delete the `lucide-react` import and the `@/components/reveal` import. Replace the `@/components/ui` import with the primitives the file actually uses, add `@/components/layout` for `CardGrid`, `PageFooterNav`, `PageHero`, `Section`, `SectionHeading` (and `Toc` where the file has six or more body sections), add `import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";`, and add `const HREF = "/…";` under the imports.
2. **Delete every page-local accent map** and replace its uses with `accent(id).{text|fill|tint|border|soft}`.
3. **Hero.** `<PageHero kicker title titleWidth backdrop>` → `<PageHero compact breadcrumb={getBreadcrumb(HREF)} kicker title accent lead>`; the split headline's second line moves from an inline `<span className="text-signal">` into the `accent` prop; `backdrop` is deleted; the last child becomes the Tldr comment.
4. **Sections.** `<section className="container-x …">` → `<Section>`; `<section className="bg-paper-3/60 …"><div className="container-x">` → `<Section band="tint">`; `<section className="bg-ink …">` → `<Section band="tint">` (§9: the only navy band on a page is its CTA, and none of these five has one).
5. **Unwrap every `<Reveal>`.**
6. **Cards.** Every `rounded-2xl border border-line bg-paper-2 p-N` → `<Card>` (`as="article"` where it wrapped an `<article>`, `onBand` inside a tinted `Section`). Every `hover:-translate-y-*` and `shadow-[…]` deleted.
7. **Text.** `font-display text-[length:var(--text-hN)]` on a heading → `<Heading level size>`; `text-sm leading-relaxed text-ink-soft` on a paragraph → `<Text size="small">`; `className="kicker"` → `<Kicker>`; `font-mono` → `tabular-nums` where it was lining up digits, deleted where it was decoration.
8. **Controls and buttons.** `<ButtonLink>` → `<Button>`; `<ArrowLink>` → `<Button variant="link" iconEnd={<Icon name="arrow-up-right" size={16} />}>`; `<Pill>` → `<Badge>`.
9. **Icons.** Per the mapping table in the Batch C preamble, plus: `/tools` `ArrowRight` → `arrow-right`, `Sparkles` → deleted; `/prompts` `AlertTriangle` → `alert-triangle`, `ArrowRight` → `arrow-right`, `CheckCircle2` → `check-circle-2`, `CircleHelp` → `help-circle`, `Quote` → `quote`, `XCircle` → `x-circle`; `/equipment` `ExternalLink` → absorbed by `<Source>`, `Sparkles` → deleted.
10. **The tool goes in a card.** `<PromptWorkshop …>`, `<NicheExplorer />`, `<NicheScorer />` and `<EquipmentChecker categories={…} />` each get wrapped in `<Card padding="lg">`.
11. **Tail.** Add the `PageFooterNav` section, exactly as in the archetype above. No practice markers: none of these five routes is on Phase 6's list.
12. **Legacy tokens.** `bg-paper-2` → `bg-paper`; `bg-paper-3` → `bg-band`; `text-signal`/`bg-signal`/`signal-tint`/`signal-deep` → `text-primary`/`bg-primary`/`primary-tint`/`primary-deep`; `caution-text` → `caution`; `rounded-xl` → `rounded-sm`; `rounded-2xl` → `rounded-md`; `rounded-full` → `rounded-pill`; `link-sweep` deleted; `dotgrid` deleted.

- [ ] **Step 2: Per-file specifics**

**`app/prompts/page.tsx`** — six body sections (anatomy, principles, iteration, where-to-point, workshop, judging, examples): give it a `Toc` rail with those ids. The `<pre>` specimen blocks keep their `overflow-x-auto` and move onto `bg-band` instead of `bg-ink`. `<section id="workshop" className="container-x scroll-mt-24 …">` becomes `<Section id="workshop" className="scroll-mt-24">` so the in-page anchor keeps working.

**`app/tools/page.tsx`** — seven body sections: `Toc` rail. The teardown table's `<div className="flex items-center gap-3 border-b border-line bg-ink px-6 py-5 text-paper-2">` header becomes a `Card padding="none"` header row on `bg-band` with ink text. The code specimens keep `<pre className="… overflow-x-auto">` but move from `bg-ink` to `bg-band` with `text-ink`, so the one navy surface on the page is gone. `FreshnessNote` stays where it is.

**`app/interview/page.tsx`** — five body sections, so no `Toc`; alternate `Section` / `Section band="tint"`. The red-flags section's `border-signal/30 bg-signal-tint/30` cards become `<Card>` inside a `<Callout tone="coral">`-headed section — the flags are red-flag content, which §4.2 assigns to `coral`, not to `primary`. Every `interview.json` `source` renders as `<Source>`.

**`app/niches/page.tsx`** — six body sections: `Toc` rail (method, research, score, how-it-works, explorer, emerging). Two content fixes carried from Phase 4's constraint: the two "21" strings are already `22` after Phase 4 Task 1 — **confirm** with `grep -n "21 " app/niches/page.tsx` and fix if not. The closing `<div className="rounded-[var(--radius-lg)] border border-line bg-ink px-8 py-10 text-paper-2">` becomes the page's single `<CtaBand>` — this is the one page in Task 19 that earns a navy band, because it closes with a call to action.

**`app/equipment/page.tsx`** — four body sections, no `Toc`. `equipment.priceReferences` renders as a `<SourceList>`; `frameworks.equipment.whatMatters[].source` each render as `<Source>`. The three "builds" cards drop their hover lift.

- [ ] **Step 3: Verify**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep -E "app.(prompts|tools|interview|niches|equipment)" || echo "clean"
grep -c "practice:" app/prompts/page.tsx app/tools/page.tsx app/interview/page.tsx app/niches/page.tsx app/equipment/page.tsx
node -e "
const fs=require('fs');
const src=fs.readFileSync('app/equipment/page.tsx','utf8');
const f=require('./data/frameworks.json');
console.log('whatMatters sources:', f.equipment.whatMatters.filter(w=>w.source).length, '| page <Source>:', (src.match(/<Source\b/g)||[]).length);
"
grep -n "\b21\b" app/niches/page.tsx || echo "niche count is 22 everywhere"
```
Expected: silent, clean, build green, `clean`, `0` practice markers per file (none of these five is on Phase 6's list), the equipment source counts equal, and `niche count is 22 everywhere`.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/prompts/page.tsx app/tools/page.tsx app/interview/page.tsx app/niches/page.tsx app/equipment/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(hosts): /prompts, /tools, /interview, /niches and /equipment on the Workshop archetype"
```

---

### Task 20: The leaf components, the stage-route markers, `/privacy` and the 404

**Parallel group:** E

**Files:**
- Replace (whole file): `components/copy-button.tsx`, `components/download-button.tsx`, `components/freshness-note.tsx`, `app/not-found.tsx`
- Edit script: `components/site/back-to-top.tsx`, `app/privacy/page.tsx`
- Modify (two comment lines each): `app/start/page.tsx`, `app/get-hired/page.tsx`, `app/deliver/page.tsx`, `app/level-up/page.tsx`, `app/own/page.tsx`
- Create: `components/copy-button.test.tsx`

**Why these are in Phase 5 at all:** `verify:primitives --strict` has to pass **repo-wide**. `copy-button` and `download-button` are the last two `lucide-react` importers outside the workshops; `back-to-top` carries the last `hover:-translate-y`; `freshness-note` is the last consumer of the `.kicker` class Task 21 deletes; `/privacy` carries the last three raw cards in `app/`. The five stage routes are here because Phase 6's contract assigns their two marker lines to Phase 5 and they are the only Phase-4 files this phase touches — two comment lines each, no logic.

- [ ] **Step 1: `components/copy-button.tsx` in full**

```tsx
"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

type Props = {
  value: string;
  label?: string;
  className?: string;
};

// Legacy fallback for contexts without navigator.clipboard (http, older
// in-app WebViews — a real audience here). Returns whether the copy took.
function execCopy(value: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

export function CopyButton({ value, label = "Copy", className }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = execCopy(value);
    }
    setStatus(ok ? "copied" : "failed");
    setTimeout(() => setStatus("idle"), 1600);
  }

  const copied = status === "copied";
  const failed = status === "failed";
  const text = copied ? "Copied" : failed ? "Copy blocked" : label;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={text}
      className={className}
      icon={<Icon name={copied ? "check" : failed ? "x" : "copy"} size={15} />}
    >
      {text}
    </Button>
  );
}
```

`execCopy`, the clipboard fallback and the 1600 ms reset are byte-identical. The `verified` / `signal` colour states are dropped: the label already says "Copied" or "Copy blocked", and a colour that repeats the word is redundant encoding, not information.

- [ ] **Step 2: `components/download-button.tsx` in full**

```tsx
"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

type Props = {
  value: string;
  filename: string;
  label?: string;
  className?: string;
};

/** Downloads `value` as a text/markdown file. The artifact is the user's own
 * words — the whole point of Build Labs is that you leave owning it. */
export function DownloadButton({
  value,
  filename,
  label = "Download .md",
  className,
}: Props) {
  const [done, setDone] = useState(false);

  function handleDownload() {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      aria-label={label}
      className={className}
      icon={<Icon name={done ? "check" : "download"} size={15} />}
    >
      {done ? "Saved" : label}
    </Button>
  );
}
```

- [ ] **Step 3: `components/freshness-note.tsx` in full**

```tsx
import { Text } from "@/components/ui";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Subtle "Last verified · Mon YYYY" stamp from a "YYYY-MM" string. */
export function FreshnessNote({ date }: { date: string }) {
  const [year, month] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  const label = name ? `${name} ${year}` : date; // fall back to raw string
  return (
    <Text size="caption" tone="faint" className="uppercase tracking-wider">
      Last verified · {label}
    </Text>
  );
}
```

- [ ] **Step 4: `app/not-found.tsx` in full**

```tsx
import { PageHero, Section } from "@/components/layout";
import { Button, Text } from "@/components/ui";

export default function NotFound() {
  return (
    <Section>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Text size="caption" tone="faint" className="uppercase tracking-wider">
          Error 404
        </Text>
        <p className="mt-6 font-display text-hero leading-none text-line-strong">404</p>
        <h1 className="mt-2 font-display text-h2 text-balance text-ink">
          This page wandered off its path.
        </h1>
        <Text className="mt-4 max-w-md">
          No worries, every online professional takes a wrong turn or two. Let’s get you back to
          something useful.
        </Text>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/start" variant="outline">
            Start your path
          </Button>
        </div>
      </div>
    </Section>
  );
}
```

`PageHero` is deliberately not used here: a 404 has no breadcrumb, no kicker and no place in the nav graph, and `getBreadcrumb` on an unknown href returns just `[{label:"Home"}]`. The import above is removed if your editor flags it — keep only `Section`.

- [ ] **Step 5: `components/site/back-to-top.tsx` edit script**

Two edits:

1. Replace `import { ArrowUp } from "lucide-react";` with `import { Icon } from "@/components/ui";`.
2. In the button's className, delete `hover:-translate-y-0.5` (or whatever the exact lift utility is — `grep -n "translate-y" components/site/back-to-top.tsx`), replace `rounded-full` with `rounded-pill`, and replace `<ArrowUp size={…} />` with `<Icon name="arrow-up" size={…} />`.

If Phase 2 left the file at `components/back-to-top.tsx` instead, apply the same two edits there and leave the path alone.

- [ ] **Step 6: `app/privacy/page.tsx` edit script (192 lines)**

1. Replace `import { Reveal } from "@/components/reveal";` and `import { PageHero, Pill, SectionHeading } from "@/components/ui";` with:

```tsx
import { PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { Badge, Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
```
and add `const HREF = "/privacy";` under the imports.

2. Replace the local `function Out({ href, children })` with:

```tsx
function Out({ href, children }: { href: string; children: string }) {
  return (
    <Button
      href={href}
      external
      variant="link"
      iconEnd={<Icon name="arrow-up-right" size={14} />}
    >
      {children}
    </Button>
  );
}
```

3. Hero: `titleWidth` is dropped, `<span className="text-signal">we never collect.</span>` moves into `accent="we never collect."`, `breadcrumb={getBreadcrumb(HREF)}` and `compact` are added, the `<Reveal>` blockquote becomes `<Callout tone="signal" className="max-w-2xl">`.

4. Sections: `<section className="bg-paper-3/60 py-20 lg:py-24"><div className="container-x">` → `<Section band="tint">`; `<section className="container-x …">` → `<Section>`; unwrap every `<Reveal>`.

5. The three raw cards at lines 79, 98 and 125 (`rounded-2xl border border-line bg-paper …`) become `<Card>`.

6. `<Pill …>` → `<Badge …>`.

7. Add the footer nav (no practice comments — `/privacy` is not a guide and Phase 6 does not quiz it):

```tsx
      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
```

- [ ] **Step 6b: Add the Phase 6 markers to the five stage routes**

Phase 6's list of eighteen practice routes includes `/start`, `/get-hired`, `/deliver`, `/level-up` and `/own`. Phase 4 built each of those as a thin wrapper around `<StagePage id="…" />`, so the markers go in the route file, not in the shared template — a marker inside `StagePage` would render on all five with the wrong route string.

Each of the five files currently reads (with its own id and metadata):

```tsx
import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({ … });

export default function StartPage() {
  return <StagePage id="start" />;
}
```

Change only the returned element, in all five, substituting the file's own id:

```tsx
export default function StartPage() {
  return (
    <>
      {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/start" /></Section> */}
      <StagePage id="start" />
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/start" /> */}
    </>
  );
}
```

The route strings are `/start`, `/get-hired`, `/deliver`, `/level-up`, `/own`. `StagePage` renders its own `PageFooterNav`, so Phase 6's `PracticeFooter` will land after it rather than before — record that difference here so the Phase 6 implementer does not go looking for a `PageFooterNav` in these five files:

> On the five stage routes the `PracticeFooter` marker sits **after** `<StagePage>`, because `StagePage` owns the footer nav internally. On the thirteen guides it sits before `<PageFooterNav>`, as Phase 6's Task 17 Step 6 describes.

Run:
```bash
grep -c "practice:" app/start/page.tsx app/get-hired/page.tsx app/deliver/page.tsx app/level-up/page.tsx app/own/page.tsx
npx tsc --noEmit && npm run build
```
Expected: `2` per file, `tsc` silent, build green.

- [ ] **Step 7: Write `components/copy-button.test.tsx`**

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "@/components/copy-button";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders its label", () => {
    render(<CopyButton value="hello" label="Copy formula" />);
    expect(screen.getByRole("button", { name: /copy formula/i })).toBeInTheDocument();
  });

  it("writes the value to the clipboard and confirms", async () => {
    const user = userEvent.setup();
    render(<CopyButton value="=COUNTIF(E:E,\"Interview\")" />);
    await user.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('=COUNTIF(E:E,"Interview")');
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Verify**

Run:
```bash
npx vitest run components/copy-button.test.tsx
npx tsc --noEmit && npm run lint && npm run build
node scripts/verify-primitives.mjs | grep -E "copy-button|download-button|freshness-note|back-to-top|not-found|privacy" || echo "clean"
grep -rn "kicker\"" --include=*.tsx app components || echo "no .kicker class left"
grep -rc "practice:" --include=*.tsx app | grep -v ":0" | wc -l
```
Expected: PASS, silent, build green, `clean`, `no .kicker class left` — Task 21 deletes the CSS rule and this is the proof nothing still needs it — and **18** files carrying practice markers (13 guides + 5 stage routes), which is exactly Phase 6's list.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/copy-button.tsx components/download-button.tsx components/freshness-note.tsx components/copy-button.test.tsx app/not-found.tsx app/privacy/page.tsx components/site/back-to-top.tsx app/start/page.tsx app/get-hired/page.tsx app/deliver/page.tsx app/level-up/page.tsx app/own/page.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(leaves): copy/download buttons, freshness note, back-to-top, 404 and /privacy off the legacy classes"
```
---

### Task 21: Cleanup — delete `Reveal`, the shim, `lucide-react`, the legacy CSS and the radius scale

**Parallel group:** F — runs only after Tasks 1–20 have all landed.

**Files:**
- Delete: `components/reveal.tsx`, `components/ui.tsx`, `components/icon.tsx`
- Modify: `app/globals.css`, `scripts/verify-contrast.mjs`, `package.json`, `BUILD_GUIDE.md`
- Conditionally delete: `components/path-chooser.tsx`, `components/path-gate.tsx`, `components/stage-page.tsx` (Phase 4 re-export shims)

**Nothing here is deleted before its grep proves it is unreferenced.** Every step is: prove zero references, then delete, then rebuild. If a grep comes back non-empty, the batch that owns that file is not finished — go fix it there, not here.

- [ ] **Step 1: Prove `Reveal` has no importers, then delete it**

Run:
```bash
grep -rn "components/reveal\|<Reveal\|{ Reveal }" --include=*.tsx --include=*.ts app components lib || echo "zero Reveal references"
```
Expected: `zero Reveal references`. (Baseline was 200+ call sites across 30 files.)

Then:
```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm components/reveal.tsx
```

- [ ] **Step 2: Prove nothing imports the flat `@/components/ui` shim's own exports, then delete it**

The shim exported `Pill`, `ButtonLink`, `ArrowLink`, `SectionHeading`, `PageHero`, `Marquee` on top of `export * from "./ui/index"`. Everything else in the repo now imports from `@/components/ui` (the **directory**), which resolves to `components/ui/index.ts` once the flat file is gone. Prove the six deprecated names are unused:

```bash
grep -rn "\bPill\b\|\bButtonLink\b\|\bArrowLink\b\|\bMarquee\b" --include=*.tsx --include=*.ts app components lib || echo "zero deprecated wrappers"
grep -rn "titleWidth\|backdrop=" --include=*.tsx app components || echo "zero legacy PageHero props"
```
Expected: both lines print their `zero …` message. (Baseline: 42 importers, 18 legacy-prop call sites.)

Then:
```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm components/ui.tsx
npx tsc --noEmit
```
Expected: `tsc` silent. A "Cannot find module '@/components/ui'" here means `components/ui/index.ts` is missing or the tsconfig path alias resolves files before directories — check `components/ui/index.ts` exists and re-run.

- [ ] **Step 3: Delete the `components/icon.tsx` re-export**

```bash
grep -rn "@/components/icon\"" --include=*.tsx --include=*.ts app components lib || echo "zero icon shim importers"
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm components/icon.tsx
```
Expected: `zero icon shim importers`, then the file is gone. Every consumer now imports `Icon` from `@/components/ui`.

- [ ] **Step 4: Conditionally delete the Phase 4 journey shims**

```bash
for f in path-chooser path-gate stage-page; do
  echo "--- $f"
  grep -rn "@/components/$f" --include=*.tsx --include=*.ts app components lib || echo "  zero importers"
done
```
For each that prints `zero importers`, `git rm components/<f>.tsx`. For any that still has importers, leave the shim and note it in the Status block — it is a Phase 4 artefact, not a Phase 5 regression.

- [ ] **Step 5: Prove nothing uses the legacy CSS classes, then delete them**

```bash
grep -rn 'className="[^"]*\bkicker\b\|font-display\b\|font-mono\b\|link-sweep\|marquee-track\|dotgrid\|container-x\|is-circle' --include=*.tsx app components | grep -v "font-display" || echo "no legacy helper classes"
grep -rn "link-sweep\|marquee-track\|dotgrid\|is-circle" --include=*.tsx app components || echo "no sweep/marquee/dotgrid/circle"
grep -rn "container-x" --include=*.tsx app components || echo "no container-x"
grep -rn 'className="[^"]*\bkicker\b[^"]*"' --include=*.tsx app components || echo "no .kicker utility class"
```

`font-display` is **kept**: it is a real Tailwind utility generated from `--font-display` in `@theme inline`, and `Heading`, `Button` and several diagrams use it. The `@layer base { .font-display { … } }` override is what gets deleted — the utility survives, the hand-written duplicate does not.

`.container-x` is the one conditional: if the `container-x` grep is non-empty, `components/site/*` still uses it. In that case keep the rule and record it in the Status block; otherwise delete it too.

Then edit `app/globals.css`:

1. **Delete the `:root` legacy alias block** (the seven lines under `/* LEGACY:P5 — consumed by pre-overhaul pages. Removed in Phase 5. */`, plus that comment): `--paper-2`, `--paper-3`, `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--caution-text`.
2. **Delete `--radius: 12px;`** and its `/* LEGACY:P5 */` comment.
3. **Delete `--shadow-lg` and `--shadow-signal`** and their `/* LEGACY:P5 */` comment.
4. **Delete the seven `--color-*` legacy theme aliases** in `@theme inline` (the block under `/* LEGACY:P5 — colour utilities (Phase 5 removes) */`).
5. **Wipe Tailwind's default radius scale.** In `@theme inline`, replace

```css
  --radius-sm: var(--r-sm);
  --radius-md: var(--r-md);
  --radius-lg: var(--r-lg);
  --radius-pill: var(--r-pill);
```
with
```css
  /* Wipe Tailwind's shipped scale (xs…4xl) so `rounded-2xl` cannot resolve;
     the four tokens below are the whole vocabulary (spec §4.3). */
  --radius-*: initial;
  --radius-sm: var(--r-sm);
  --radius-md: var(--r-md);
  --radius-lg: var(--r-lg);
  --radius-pill: var(--r-pill);
```

`rounded-full` is a static Tailwind utility, not a `--radius-*` lookup, so it survives the wipe — which is why every batch replaced it with `rounded-pill` rather than relying on it.

6. **Delete the `@layer base` legacy helpers**: `.font-display`, `.kicker`, `.font-mono`, `.link-sweep` (and `.link-sweep:hover`). Keep the `@layer base` wrapper only if something else lives in it; otherwise delete the whole block.
7. **Delete the marquee and dot-grid block**: `@keyframes marquee`, `.marquee-track`, `.dotgrid`, and the `.marquee-track { animation: none; }` override inside the `prefers-reduced-motion` media query. Keep the rest of that media query.

- [ ] **Step 6: Confirm the radius wipe actually bites**

Run:
```bash
npm run build
grep -rn "rounded-\(xl\|2xl\|3xl\)" --include=*.tsx app components || echo "no legacy radius utilities"
```
Expected: build green and `no legacy radius utilities`. If the build succeeds but a page looks square where it should be rounded, a `rounded-2xl` survived somewhere the grep does not reach (a template literal) — `node scripts/verify-primitives.mjs` catches it.

- [ ] **Step 7: Remove `lucide-react`**

```bash
grep -rn "lucide-react" --include=*.tsx --include=*.ts --include=*.mjs app components lib scripts || echo "zero lucide imports"
npm uninstall lucide-react
grep -n "lucide" package.json package-lock.json | head -5 || echo "gone from the manifest"
```
Expected: `zero lucide imports` (baseline: 47 across 25 files), then the dependency is removed from `package.json` and the lockfile.

- [ ] **Step 8: Drop the legacy pairs from `scripts/verify-contrast.mjs`**

In the `TEXT` array, delete the four legacy rows and the comment above them:

```js
  // legacy aliases still rendered by pre-overhaul pages
  ["signal", "paper"],
  ["signal-deep", "signal-tint"],
  ["signal-light", "ink"],
  ["caution-text", "caution-tint"],
```

In `WHITE_ON`, delete `"signal"` and `"signal-deep"`, leaving:

```js
const WHITE_ON = ["primary", "primary-deep", "ink", "verified", "caution", "info", "coral"];
```

Run: `npm run verify:contrast`
Expected: `Contrast OK — N pairs pass.` with `N` six lower than before. It **must not** throw `token --signal not found` — if it does, a legacy pair was left in the array.

- [ ] **Step 9: Update `BUILD_GUIDE.md`**

In the tokens section, delete the row or paragraph that documents the legacy aliases as "kept until Phase 5" and replace it with one line:

> Legacy aliases (`--paper-2`, `--paper-3`, `--signal*`, `--caution-text`, `--radius`, `--shadow-lg`, `--shadow-signal`) and the helper classes (`.kicker`, `.font-display`, `.font-mono`, `.link-sweep`, `.marquee-track`, `.dotgrid`) were removed in Phase 5. The radius vocabulary is exactly `rounded-sm | rounded-md | rounded-lg | rounded-pill`; Tailwind's default scale is wiped, so `rounded-2xl` is not a class.

In the "Shared components" section, add the two lines Phase 5 introduces:

> - **Charts** live in `components/diagrams/charts/`. `Axis`, `Bars`, `Line`, `Legend`, `ValueLabel`, all token-driven, geometry from `lib/chart-scale.ts`. Wrap every chart in `DiagramFrame` and put its `Source` under the frame.
> - **Archetypes.** Every interior page is a Guide, a Workshop, or a Data page (spec §8.3). A page that is none of those is a page that has not been designed yet.

- [ ] **Step 10: Full rebuild and full test run**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build && npm test
```
Expected: silent, clean, `✓ Compiled successfully`, and both suites green (`node --test` math suites, then vitest).

- [ ] **Step 11: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add -u
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/globals.css scripts/verify-contrast.mjs package.json package-lock.json BUILD_GUIDE.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(cleanup): delete Reveal, the ui shim, lucide-react, the legacy CSS block and Tailwind's radius scale"
```

`git add -u` is used here — and only here — because the task's deliverable includes three deletions that `git add <path>` cannot stage. It stages modifications and deletions of already-tracked files only, never new untracked files, so it cannot sweep up another agent's work in progress.

---

### Task 22: Phase exit verification

**Parallel group:** G — runs last, alone.

**Files:**
- Modify: `package.json` (`verify:primitives` gains `--strict`)
- Create: `screenshots/p5-*.png` (12 files)
- Modify: the Status block at the bottom of this plan

- [ ] **Step 1: Confirm the repo is already clean before flipping the switch**

Run:
```bash
node scripts/verify-primitives.mjs; echo "exit=$?"
```
Expected: `verify:primitives (warn-only): clean.` and `exit=0`. If any violation remains, **do not flip the flag** — go back to the task that owns the file. The whole point of the phase is that the switch is thrown over a clean repo, not that the repo is bent to fit the switch.

- [ ] **Step 2: Flip `verify:primitives` to fail-on-violation**

In `package.json`, change one line:

```json
  "verify:primitives": "node scripts/verify-primitives.mjs --strict",
```

`verify:all` already ends with `npm run verify:primitives`, so no second edit is needed.

- [ ] **Step 3: Prove the gate now fails on a violation**

Run:
```bash
printf '\nexport const CANARY = "rounded-2xl";\n' >> lib/utils.ts
npm run verify:primitives; echo "exit=$?"
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite checkout -- lib/utils.ts
npm run verify:primitives; echo "exit=$?"
```
Expected: the first run prints `lib/utils.ts:…  [radius]  …` and `exit=1`; after the checkout the second run prints `verify:primitives: clean.` and `exit=0`. A gate that has never failed is not a gate.

- [ ] **Step 4: Run the whole check suite**

Run:
```bash
npm run verify:all
npm test
npm run build
```
Expected, in order: `Contrast OK — N pairs pass.`; `✓ N dated pages, all verified within 6 months.`; eslint silent; `tsc` silent; `verify:primitives: clean.`; then `node --test` math suites PASS and vitest PASS; then `✓ Compiled successfully` with the full route table.

Also run the link audit, which is not in `verify:all`:

```bash
npm run verify:links
```
Expected: no broken internal links and no links to `pending` routes.

- [ ] **Step 5: Screenshots at 375 and 1280**

Start the production server:

```bash
npm run build && npm run start
```

Then, with the chrome-devtools MCP (`new_page`, `resize_page`, `navigate_page`, `take_screenshot`), capture these six routes at both widths and save each to `screenshots/`:

| Route | Why it is representative | Files |
|---|---|---|
| `/method` | Guide with the `Toc` rail and a static diagram | `p5-method-375.png`, `p5-method-1280.png` |
| `/reality` | Data page: diverging bars, growth bars, nine sections | `p5-reality-375.png`, `p5-reality-1280.png` |
| `/clients` | Guide hosting the new swimlane | `p5-clients-375.png`, `p5-clients-1280.png` |
| `/learn` | Guide hosting the new forgetting curve plus a workshop | `p5-learn-375.png`, `p5-learn-1280.png` |
| `/tracker` | Workshop archetype with the full field family | `p5-tracker-375.png`, `p5-tracker-1280.png` |
| `/simulator` | Data page with the `Line` chart and 30-odd controls | `p5-simulator-375.png`, `p5-simulator-1280.png` |

Check each screenshot against the de-slop inventory before saving it: no blur blob, no Sparkles, no hover lift caught mid-frame, no `rounded-2xl` corner, no mid-page navy panel, no dot grid, no emoji flag. At 375, confirm every `DiagramFrame` scrolls sideways inside its own container and the page body does not.

- [ ] **Step 6: Voice audit**

Run: `node scripts/voice-audit.mjs`

Expected: a ranked list. Compare the total against the number recorded before Phase 5 — **it must not have risen.** This phase writes no new content, so any increase means copy was invented during a migration. Record the number in the Status block.

- [ ] **Step 7: Count what changed**

Run:
```bash
echo "== violations =="
node scripts/verify-primitives.mjs | tail -2
echo "== Reveal call sites =="
grep -rc "<Reveal" --include=*.tsx app components 2>/dev/null | grep -v ":0" || echo "0"
echo "== lucide imports =="
grep -rc "lucide-react" --include=*.tsx --include=*.ts app components lib 2>/dev/null | grep -v ":0" || echo "0"
echo "== inline accent maps =="
grep -rn "const accent\(Text\|Bar\|Soft\|Border\)" --include=*.tsx app components lib || echo "0"
echo "== diagrams =="
node -e "console.log(Object.keys(require('./components/diagrams/index.ts')).length + ' — check by eye, ts file')" 2>/dev/null || grep -c '":' components/diagrams/index.ts
echo "== workshop tests =="
ls components/*.test.tsx | wc -l
```

Fill the Status block with what you measure.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add package.json screenshots docs/superpowers/plans/2026-08-21-ui-overhaul-p5-migration.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(verify): verify:primitives is now fail-on-violation, and the repo passes it"
```

---

## Status

_Fill this in as the phase runs. The `before` numbers were measured on `redesign/ui-overhaul` at the time this plan was written; re-measure in Task 1 Step 1 and correct them if Phases 2 and 4 have moved the surface since._

| Measure | Before | After | Target |
|---|---|---|---|
| `verify:primitives` violations | **620** | _fill in_ | 0 |
| — `radius` (`rounded-xl\|2xl\|3xl`) | 315 | _fill in_ | 0 |
| — `raw-card` | 138 | _fill in_ | 0 |
| — `lift` (`hover:-translate-y`) | 59 | _fill in_ | 0 |
| — `lucide` imports | 47 | _fill in_ | 0 |
| — `accent-map` literals | 40 | _fill in_ | 0 |
| — `raw-control` | 12 | _fill in_ | 0 |
| — `blur` | 9 | _fill in_ | 0 |
| `<Reveal>` call sites | 200+ | _fill in_ | 0 |
| `components/ui.tsx` shim importers | 42 | _fill in_ | n/a (file deleted) |
| Legacy `PageHero` prop call sites (`titleWidth`/`backdrop`) | 18 | _fill in_ | 0 |
| Registered diagrams | 4 | _fill in_ | 7 |
| Chart primitives | 0 | _fill in_ | 5 (`Axis`, `Bars`, `Line`, `Legend`, `ValueLabel`) |
| Workshop RTL smoke tests | 0 | _fill in_ | 16 |
| `verify:contrast` pairs | _fill in_ | _fill in_ | 6 fewer (legacy pairs dropped) |
| `voice-audit` aphorism count | _fill in_ | _fill in_ | not higher than before |
| `npm run build` | green | _fill in_ | green |
| `npm test` | green | _fill in_ | green |

**Exit criterion (spec §14 row 5):** `verify:primitives` switched to fail-on-violation and passing repo-wide. That is Task 22 Steps 1–4.

**Carried into Phase 6:** exactly eighteen files hold two comment markers each — the thirteen guides on Phase 6's list (Tasks 3–9) and the five stage routes (Task 20 Step 6b). `/markets` holds a third (`{/* practice: TimezoneOverlap … */}`). `/clients`, `/simulator` and every workshop host page hold **none**, because they are not on Phase 6's list. Count them before starting Phase 6:

```bash
grep -rc "practice:" --include=*.tsx app | grep -v ":0"
```
Expected: 18 files, `2` each except `app/markets/page.tsx` at `3`. Each marker holds the literal line Phase 6 substitutes, so the insertion is a find-and-replace with nothing to decide.

**Known deferrals, recorded so they are not mistaken for misses:**

- `/salary` and `/markets` ship no chart. Reasoned at the top of this plan; §7.2 lists the salary pricing-model chart as a second-wave candidate.
- `TimezoneOverlap`, `Tldr` and `PracticeFooter` are Phase 6 components. Phase 5 leaves the eighteen marker pairs Phase 6's Task 17 Step 6 asks for; it cannot import `@/components/practice`, which does not exist until Phase 6 runs.
- The `/plan` Gantt, the `/niches` radar and the `/legit` registration flow are §7.2's second-wave diagrams and are not built here.
- `.container-x` and the three Phase 4 journey shims are deleted **only if** their greps come back empty (Task 21 Steps 4 and 5). If they survive, they are Phase 2/4 artefacts and belong in Phase 9's dead-file sweep.
---

## Self-review

### 1. Spec coverage

**§14 row 5 — the phase's own definition.**

| Deliverable | Task |
|---|---|
| Batch A: guide pages | T3 (`/method`, `/learn`, `/conduct`), T4 (`/english`, `/ai-first`), T5 (`/indispensable`, `/legit`, `/languages`), T6 (`/resources`, `/portfolio`, `/clients`) |
| Batch B: data pages with chart primitives | T1 (`Bars`, `Line`, `Axis`, `Legend`, `ValueLabel`), T7 `/reality`, T8 `/salary`, T9 `/markets`, T10 `/simulator` |
| Batch B: remaining diagrams | T2 (`vetting-flow`, `agency-vs-direct`, `forgetting-curve`), hosted in T18 (`/apply`), T6 (`/clients`), T3 (`/learn`) |
| Batch C: workshops on form primitives | T10 (`career-simulator`), T11–T17 (the other 15), T18–T19 (10 host pages), T20 (4 leaves + 404 + `/privacy` + the five stage-route markers) |
| `Reveal` removed | T21 Step 1 |
| `lucide-react` removed | T21 Step 7 |
| `verify:primitives` fail-on-violation, passing repo-wide | T22 Steps 1–4 |

**§8.3 archetypes, page by page.** Every interior route is accounted for exactly once:

| Route | Archetype | Task |
|---|---|---|
| `/method` `/learn` `/conduct` `/english` `/ai-first` `/indispensable` `/legit` `/languages` `/resources` `/portfolio` `/clients` | Guide | T3–T6 |
| `/reality` `/salary` `/markets` `/simulator` | Data | T7–T10 |
| `/build` `/plan` `/tasks` `/tracker` `/apply` | Workshop | T18 |
| `/prompts` `/tools` `/interview` `/niches` `/equipment` | Workshop | T19 |
| `/privacy`, `not-found` | neither — chrome only | T20 |
| `/` `/start` `/get-hired` `/deliver` `/level-up` `/own` `/path` | Phase 4 | — |
| `/library` | Phase 2 | — |

Every Guide and Data task specifies: `PageHero` with `getBreadcrumb`, kicker, title, lead; a `Toc` where the page has six or more body sections (`/method`, `/learn`, `/english`, `/ai-first`, `/reality`, `/salary`, `/prompts`, `/tools`, `/niches`) and alternating bands where it does not; `Callout` for honesty notes; `Source`/`SourceList` under every figure; `PageFooterNav` from `findNavNeighbours`. Prose sits in `Container size="narrow"` via `Section size="narrow"` on the two pages that are pure prose (`/conduct`'s honesty note, `/markets`' overlap section); elsewhere the `Toc` rail's `minmax(0,1fr)` column plays the same role at a readable measure.

**§9 de-slop inventory, line by line.**

| Pattern | Where it dies |
|---|---|
| `blur-3xl` gradient blobs (8) | T3 (`/method`, `/learn`), T18 (`/plan`), and the `backdrop` prop is deleted wholesale with the shim in T21 Step 2 |
| `Sparkles` icon (11) | T3 (`/method`, `/learn`), T5 (`/portfolio` is T6), T6 (`/portfolio`), T12 (`micro-tasks`), T15 (`niche-explorer`, `niche-scorer`), T18 (`/plan` → `door-open`), T19 (`/tools`, `/equipment`) |
| `hover:-translate-y-*` lifts (59) | every Batch A/B/C task's sweep step; T20 (`back-to-top`) |
| `rounded-2xl/3xl` (221) + the radius hack | every task's sweep; the scale itself is wiped in T21 Step 5 |
| `Marquee` with ✦ | T21 Step 2 (it lived only on the shim and had no call sites) |
| Hero squiggle underline SVG | Phase 4 |
| Abstract hero SVG chart | Phase 4 |
| Kicker-with-dot mono labels | every task replaces `className="kicker"` with `<Kicker>`; the CSS rule dies in T21 Step 5; T20 fixes the last consumer (`freshness-note`) |
| "0 templates handed out" stat cards | Phase 4 |
| Emoji flags (3) | T5 (`/languages`), T9 (`/markets`, both `regions` and `abroad`) |
| Two icon libraries | T1 extends the Phosphor registry; T21 Step 7 uninstalls lucide |
| Dot-grid backgrounds (2) | T3 (`/learn`), T5 (`/languages`); the CSS rule dies in T21 Step 5 |
| Dark panels mid-page (2) | T3 (`/conduct` dos/donts → `tint`), T5 (`/indispensable` proof → paper + `DiagramFrame`), T7 (`/reality` thesis → paper), T19 (`/tools` code blocks → `band`) |
| `Reveal` wrapper (200+) | unwrapped in every task; deleted in T21 Step 1 |

**§5.7 enforcement rules, one by one.** Each of the seven rules has a task that drives it to zero and a per-task grep that proves it:

| Rule | Driven to zero by | Proved by |
|---|---|---|
| `accent-map` | every task's "delete the accent maps" edit | the per-task `grep -nE "const accent(Text\|Bar\|Soft\|Border)"` |
| `radius` | every task's sweep | T21 Step 6 grep + the scale wipe |
| `blur` | T3, T18, T21 Step 2 | T22 Step 1 |
| `lucide` | T1's registry + every task's icon mapping | T21 Step 7 grep |
| `lift` | every task's sweep | T22 Step 1 |
| `raw-card` | every `<Card>` substitution | T20 (the last three, on `/privacy`) |
| `raw-control` | Batch C's field-primitive migration | each Batch C task's `verify:primitives` grep |

**§7.2 first-wave diagrams.** Four already shipped in Phase 3. The five this phase owes: `/apply` flowchart (T2 + T18), `/clients` swimlane (T2 + T6), `/learn` line (T2 + T3), `/reality` bars (T1 + T7), `/simulator` line (T1 + T10). All five are built, all five are wrapped in `DiagramFrame` with a title and a one-sentence caption, and the two that carry citations render them with `Source`/`SourceList` under the frame.

**§10 accessibility.** `Tabs`, `Accordion`, `Dialog`, `Field`, `ProgressBar` and `EmptyState` carry their own semantics, which is most of the win. Three places where the migration could have lost something, and what each task does instead: the simulator's generated chart summary is kept as an sr-only paragraph (T10); the score dials that were `role="img"` become real `role="progressbar"` with `aria-valuenow` (T14, T15, T17); the tracker form keeps every `name` and every `id` so the uncontrolled `FormData` read is unchanged (T13).

**§13 testing.** 16 workshop smoke tests (T10–T17, T20), the `lib/chart-scale.ts` unit tests written first (T1 Steps 2–5), the chart render tests (T1 Step 8), and the existing `lib/*.test.mjs` math suites asserted green in T10, T17 and T21.

**Phase 6 hand-off, checked against the sibling plan.** `docs/superpowers/plans/2026-08-21-ui-overhaul-p6-practice.md` Task 17 Step 6 names eighteen routes and two exact lines. This plan places a marker pair on all eighteen — thirteen in Tasks 3–9, five stage routes in Task 20 Step 6b — and each marker holds the literal replacement text, including the `<Section spacing="none">` wrapper on `Tldr` and the `PracticeFooter` name (not `Quiz`, which is what `PracticeFooter` wraps). The one place the two plans differ is the stage routes, where `StagePage` owns the footer nav internally so the `PracticeFooter` marker sits after the component rather than before a `PageFooterNav`; Task 20 Step 6b records that difference in the plan text so the Phase 6 implementer is not surprised.

**Gaps, stated rather than hidden:** `/salary` and `/markets` ship no chart; the practice components themselves are Phase 6. Both are argued at the top of the plan and repeated in the Status block. Nothing else in §8.3, §9, §5.7 or §7.2's first wave is unassigned.

### 2. Placeholder scan

Searched the plan for every red flag in the writing-plans list:

- **"TBD" / "TODO" / "implement later" / "fill in details"** — the only `_fill in_` markers are in the Status table, which is a results log the executing agent completes in T22; that is the table's whole purpose, not a deferred decision.
- **"Add appropriate error handling"** — absent. Where behaviour could fail (the FX field's bad-value fallback, `execCopy`, the corrupt-storage `catch`), the plan reproduces the existing code rather than describing it.
- **"Write tests for the above"** — absent. Every test step prints the test file.
- **"Similar to Task N"** — absent. The two places where repetition would have been tempting are handled explicitly instead: the Batch A recipe is stated once as a **table of transformations** and then applied concretely in each task's full file, and Task 19's shared checklist is a numbered procedure with per-file specifics underneath, not a cross-reference.
- **Steps that describe without showing** — the four edit-script tasks (T10, T11, T12, T13, T14, T15, T16, T17, T18's `/apply`, T19, T20's `/privacy`) each print the exact `old` block and the exact `new` block. Task 19 is the one task that gives a procedure rather than blocks; its justification is that five files share one shape, and it names the exact per-file deltas. If a reviewer wants blocks there too, the right fix is to split T19 into five tasks — the procedure is complete, not vague.
- **References to undefined types** — checked in §3 below.

One thing that reads like a placeholder and is not: several Batch C edit scripts say "if the grep comes back non-empty, that batch is not finished — fix it there." That is a routing instruction with a concrete test, not a deferred decision.

### 3. Type consistency

Checked every name this plan invents against every place it is used.

**`lib/chart-scale.ts` → charts.** `linearScale(domain, range): Scale` and `niceTicks(min, max, count?): number[]` are defined in T1 Step 4 and consumed only inside `chart-primitives.tsx` (T1 Step 6). `Scale` is exported and used as `AxisProps["scale"]`. ✓

**Chart primitives → pages.** `BarDatum` is `{ id, label, value, note?, focal?, compare? }`.
- T4 `/english` passes `{ id, label, value, note?, focal }` — subset. ✓
- T5 `/indispensable` passes `{ id, label, value, compare }`. ✓
- T7 `/reality` passes `{ id, label, value, note? }` for the AI charts and `{ id, label, value, focal }` for growth. ✓
`BarsProps` fields used by pages: `data`, `max`, `diverging`, `format`, `reference`, `seriesLabel`, `compareLabel`, `labelWidth` — all declared. ✓
`LineSeries` is `{ id, label, points, focal?, dashed? }`; T10 passes exactly those. `LineProps.band` is `{ seriesId, drop }`; T10 passes `{ seriesId: "path", drop: NON_PAYMENT_RISK }` and the series id is literally `"path"`. ✓
`LegendItem.kind` is `"line" | "dashed" | "swatch" | "band"`; T10 uses `"dashed"`, `"line"`, `"band"`. ✓

**Diagram components.** T2 exports `VettingFlow`, `AgencyVsDirect`, `ForgettingCurve`, each `({ className }: DiagramProps)`. T18 imports `VettingFlow` from `@/components/diagrams/vetting-flow`, T6 imports `AgencyVsDirect` from `@/components/diagrams/agency-vs-direct`, T3 imports `ForgettingCurve` from `@/components/diagrams/forgetting-curve` — direct file imports, matching the README's convention and the `DIAGRAMS` map keys `"vetting-flow" | "agency-vs-direct" | "forgetting-curve"`. ✓

**`data/learning.json → forgettingCurve`.** T2 Step 1 defines `{ title, caption, axis: { top, bottom, x }, footnote, sources: [{ label, url }] }`. T2 Step 7 reads `axis.top`, `axis.bottom`, `footnote`. T3 Step 2 reads `title`, `caption`, `sources`. `axis.x` is defined and unread — it is there for Phase 6's `Tldr`/`Quiz` copy and for the HTML source's eyebrow; harmless, but flagged so a reviewer knows it is deliberate. ✓

**Primitive props against the pinned contract.** Spot-checked the props this plan uses that the contract does not obviously promise:
- `Card` `as="li"` — the contract lists `as?: "div"|"article"|"li"|"section"`. ✓ (T10 Edit 7 uses `as="li"`, T18 uses `as="article"`.)
- `Badge` with an `<Icon>` child — `Badge` takes `children: ReactNode`. ✓
- `Callout` `icon` takes a **kebab name string**, not a node — every use in this plan passes a string (`icon="alert-triangle"`, `icon="shield-check"`, `icon="key-round"`). ✓
- `Button` `icon`/`iconEnd` take **nodes** — every use passes `<Icon …/>`. ✓ (The two prop shapes differ between `Callout` and `Button`; that is Phase 1's contract, and this plan honours it rather than "fixing" it.)
- `ProgressBar` `tone` is `Accent`; T15 passes `tier.tone` (`"verified"|"caution"|"signal"`), T14 passes `"verified"`, T16/T17 pass `TONE[level.tone]` which is narrowed to the same union. ✓
- `Field` `as="group"` renders `fieldset`/`legend` and sets `id: undefined` so children keep their own ids — which is exactly why T13's `Field label="Company"` + `Input id="company" name="company"` works, and why T17's `Radio` sets need `as="group"`. ✓
- `Toc` takes `items: {id,label}[]`; every `TOC` constant in this plan is an array of `{ id, label }`. ✓
- `Section` accepts `id` — used for the anchor targets the `Toc` links to on the pages that use alternating bands (`/markets`, `/prompts`'s `#workshop`). On `Toc`-rail pages the ids sit on plain `<section id>` elements inside the rail's content column. ✓
- `Stat` `source` takes `SourceProps` (`{label, url, date?, grade?}`); T4 and T7 pass `{ label, url }`. ✓

**Names that must not drift across tasks.** `HREF` is a per-file constant, declared once per page and used by `getBreadcrumb(HREF)`, `findNavNeighbours(HREF)` and `pageMeta({ path: HREF })` — same spelling in all 15 page files. `fmt` in T7 is passed to `Bars` as `format`, matching `BarsProps.format: (value: number) => string`. `SliderField` in T17a is a local name and does not collide with the imported `Field` (the old file called its local helper `Field`, which would have shadowed the primitive — renaming it is required, not cosmetic). `TrajectoryChart` keeps its name in T10 but loses its `ariaLabel` prop, and the only call site is updated in the same edit. ✓

**One inconsistency found and fixed inline:** the Batch A recipe table originally mapped `<ArrowLink>` to `<Button variant="link">` without an icon, while the individual tasks all pass `iconEnd={<Icon name="arrow-up-right" size={16} />}`. The table now carries the icon too, so a reviewer reading only the recipe produces the same output as one reading only a task.
