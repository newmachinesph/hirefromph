# UI Overhaul — Phase 6: Practice Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn every guide from something you read into something you *do* — retrieval quizzes, spaced flashcards, branching scenarios, annotated worked examples, a reflection journal, a glossary, reader controls, and exports of the visitor's own work — all frontend-only, all driven by the JSON already authored in `data/`.

**Architecture:** Every rule the practice layer needs lives in a pure, dependency-free module under `lib/` (`dates`, `leitner`, `streak`, `ics`, `scenario`, `overlap`, `practice-store`, `markdown-export`, `glossary`) with its own Vitest suite written before the implementation. `components/practice/*` are thin client components that compose the Phase 1 primitives and read those modules; none of them contains a date calculation, a schedule rule, or a `localStorage` call of its own. Persistence is six independent `localStorage` slots under `hfph.practice.*`, each parsed by a total function so a corrupt slot degrades to its empty value instead of taking down the page. `/practice` and `/glossary` become live by deleting the `"pending": true` keys Phase 2 authored — the header, drawer, footer, search index, and sitemap pick them up with no code change.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first tokens from Phase 0), TypeScript strict, Vitest 3 + @testing-library/react 16 + user-event 14, Phosphor Icons, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§5.2b practice components, §7.4.1–7.4.7 practice layer, §10 accessibility, §11 copy, §12 data shapes, §13 testing, §14 row 6). This is plan 7 of 10.

**Assumed done before this plan starts:** Phase 0 (tokens, fonts, `lib/accent.ts`, Vitest), Phase 1 (`components/ui` + `components/layout` barrels), Phase 2 (`lib/nav.ts`, `components/site/*`, the `pending` convention, `verify:links` in `verify:all`), Phase 3 (`data/visuals.json`, `Figure`), Phase 4 (home + stage template), Phase 5 (the 18 guide/stage pages rebuilt on the primitives, `verify:primitives --strict`).

**Already authored, do not rewrite:** `data/practice.json` (18 routes × 3 = 54 questions), `data/decks.json` (4 decks, 86 cards), `data/scenarios.json` (4 scenarios, 53 nodes), `data/annotated.json` (4 examples, 37 hotspots, 3 pairs), `data/glossary.json` (50 terms), `data/reflection.json` (12 prompts), `data/tldr.json` (18 routes). Every one of them already passes the integrity rules Task 8 encodes; if a check fails, the bug is in the check, not the data — read the data first.

## Global Constraints

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

### Phase 6 additions to the constraints

- **Pure logic first.** No date arithmetic, schedule rule, or `localStorage` access appears inside `components/practice/*`. It lives in `lib/` behind a named export with a test. A component that needs "today" receives it from `todayISO()` at the top of the component and passes it down.
- **Determinism.** Every function that depends on the date takes `today: IsoDate` as a parameter. `todayISO()` is the only place `new Date()` is read, and it accepts an injectable `now` for tests. Dates are ISO `YYYY-MM-DD` strings; schedules are `{ box: 1–5, due: "YYYY-MM-DD" }` (spec §12).
- **Storage is six independent slots**, all under `hfph.practice.*` (Task 6). Every read goes through a total parse function that never throws and drops malformed entries. A missing slot, a corrupt slot, and a disabled `localStorage` all produce the same empty value.
- **The export rule (spec §7.4.4):** *export is for what the user wrote; never for anything we wrote.* Every `ExportButton` `build()` closes over user state only — their answers, their oath text, their applications, their plan-day ticks. Never a `data/*.json` string.
- **No gamification.** No badges, points, leaderboards, or streak-loss warnings (spec §7.4.5). `Streak` states a count and stops.
- **`Term` is for the first use of a term on a page,** not every use. A paragraph with four `Term`s in it is worse than the plain sentence.
- **The reader classes are `<html>` classes** applied before paint by an inline script: `text-size-sm` / `text-size-md` / `text-size-lg`, `reading-comfort`, `low-data`. Nothing else may add or remove them.
- **Do not edit `lib/path-context.tsx`.** Plan-day completion *dates* live in the practice store, written by the `usePlanDays()` hook, which wraps `togglePlanDay` without changing it.
- **Every practice component renders `null` for an id it cannot find.** A missing route in `practice.json` or a missing term in `glossary.json` must never throw and never blank the page around it.
- Tests are behavioural. Assert what a visitor or assistive technology observes (roles, labels, `aria-*`, focus, which panel is on screen, what got written to storage). Class-name assertions only where the class *is* the contract (the three reader classes).
- **`git` concurrency:** if a git command fails with `Unable to create '.git/index.lock': File exists`, wait a few seconds and re-run the same command. Never delete `index.lock` by hand. Always `git add` explicit paths — never `git add -A`.

---

## File structure

| Path | Responsibility |
|---|---|
| `lib/dates.ts`, `lib/dates.test.ts` | ISO calendar arithmetic, ISO week, display formatting. The base every other module builds on. |
| `lib/leitner.ts`, `lib/leitner.test.ts` | Five-box schedule: promote/demote, intervals 1/2/4/8/16, `isDue`, `dueCount` |
| `lib/streak.ts`, `lib/streak.test.ts` | `currentStreak`, `longestStreak` over a set of completion dates |
| `lib/ics.ts`, `lib/ics.test.ts` | `planToIcs` — RFC 5545 VCALENDAR, all-day events, CRLF, escaping, 75-octet folding, stable UIDs |
| `lib/scenario.ts`, `lib/scenario.test.ts` | Typed access to `scenarios.json`, `walk`, `validateScenario` |
| `lib/overlap.ts`, `lib/overlap.test.ts` | Client regions with UTC offsets and DST months; pure overlap-hour maths |
| `lib/practice-store.ts`, `lib/practice-store.test.ts` | The six `hfph.practice.*` slots, their types, and their total parsers |
| `lib/markdown-export.ts`, `lib/markdown-export.test.ts` | `labToMarkdown`, `rowsToCsv`, `downloadText` |
| `lib/glossary.ts` | `TERMS`, `getTerm`, `groupByLetter` |
| `lib/practice-data.test.ts` | Data-integrity suite over all seven practice JSON files |
| `components/practice/hooks.ts` | `usePracticeSlot`, `useToday`, `usePlanDays`, `useReaderPrefs`, `useJournalWeek` — small imports only; ships in the shared bundle |
| `components/practice/use-practice-due.ts` | `usePracticeDue`; the only client module that imports `practice.json` and `decks.json` |
| `components/practice/quiz.tsx` | Server: reads the three questions for a route and hands them to the runner |
| `components/practice/quiz-runner.tsx` | Client: the quiz itself (choice + reveal, Leitner recording) |
| `components/practice/practice-footer.tsx` | The one-line wrapper Phase 5's pages render above `PageFooterNav` |
| `components/practice/tldr.tsx` | "TL;DR sa Tagalog" accordion with the draft-translation badge |
| `components/practice/deck.tsx` | Flashcard deck on the Leitner schedule |
| `components/practice/scenario.tsx` | Branching scenario walk + debrief |
| `components/practice/annotated.tsx` | Worked example with numbered hotspots |
| `components/practice/before-after.tsx` | Split-view message rewrite, tabs on mobile |
| `components/practice/term.tsx` | Inline glossary term |
| `components/practice/journal.tsx` | Weekly reflection prompt, one entry per ISO week |
| `components/practice/streak.tsx` | Consecutive plan days |
| `components/practice/timezone-overlap.tsx` | Overlap-hours explorer for `/markets` |
| `components/practice/study-timer.tsx` | Focus/break timer for `/learn` |
| `components/practice/export-button.tsx` | Markdown / ICS / CSV download of the visitor's own work |
| `components/practice/reader-controls.tsx` | Font size, comfortable reading, low-data |
| `components/practice/practice-hub.tsx` | The `/practice` client body |
| `components/practice/glossary-browser.tsx` | The `/glossary` client body |
| `components/practice/index.ts` | Barrel — the only import path pages use |
| `app/practice/page.tsx`, `app/glossary/page.tsx` | The two new routes |
| `app/globals.css` | Reader-mode classes (append only) |
| `app/layout.tsx` | The pre-paint reader script |
| `data/site.json`, `data/library.json` | Delete four `"pending": true` lines |
| `components/{plan-wizard,application-tracker,build-labs,integrity-oath}.tsx` | `ExportButton` wire-ups |
| `app/{path,markets,learn}/page.tsx`, `components/site/{footer,mobile-drawer}.tsx` | Component wire-ups |
| `BUILD_GUIDE.md` | Export rule, store namespace, `Term` rule, reader classes |

## Parallel groups

`A` → `B` → `C` → `D` → `E` → `F` → `G`. Tasks sharing a letter touch disjoint files and can run in parallel.

| Group | Tasks | Why they are ordered this way |
|---|---|---|
| A | 1–7 | Pure `lib/` modules. Task 1 (`lib/dates.ts`) is consumed by 2, 3 and 6, so **run Task 1 first, then 2–7 in parallel.** |
| B | 8 | Data-integrity suite; needs `lib/scenario.ts` from Task 4 and `lib/overlap.ts` from Task 5. |
| C | 9–13 | The practice components. Each task owns its own files; all of them consume group A. |
| D | 14 | `ExportButton` + `ReaderControls` + `globals.css` + `app/layout.tsx` + the barrel. Touches shared files, so it runs alone. |
| E | 15 | The two new routes and the `pending` deletions. |
| F | 16–17 | Wire-ups into existing components and pages. 16 and 17 touch disjoint files. |
| G | 18 | Docs and exit verification. |

---

### Task 1: `lib/dates.ts` and `lib/leitner.ts`

**Parallel group:** A (run before every other group-A task)

**Files:**
- Create: `lib/dates.ts`, `lib/dates.test.ts`, `lib/leitner.ts`, `lib/leitner.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces, from `@/lib/dates`:
  - `export type IsoDate = string` — an ISO `YYYY-MM-DD` calendar date.
  - `export function isIsoDate(value: unknown): value is IsoDate` — regex **and** round-trip, so `"2026-02-30"` is rejected.
  - `export function toUTCms(iso: IsoDate): number`, `export function fromUTCms(ms: number): IsoDate`
  - `export function addDays(iso: IsoDate, days: number): IsoDate`
  - `export function daysBetween(from: IsoDate, to: IsoDate): number`
  - `export function todayISO(now?: Date): IsoDate` — the visitor's local calendar date; the only clock read in the practice layer.
  - `export type IsoWeek = { year: number; week: number }`; `export function isoWeek(iso: IsoDate): IsoWeek`; `export function isoWeekKey(iso: IsoDate): string` → `"2026-W34"`
  - `export function formatIsoDate(iso: IsoDate): string` → `"23 Aug 2026"` (locale-independent, so server and client markup match)
- Produces, from `@/lib/leitner`:
  - `export type Box = 1 | 2 | 3 | 4 | 5`; `export const BOXES: readonly Box[]`
  - `export const INTERVALS: Record<Box, number>` — `{1:1, 2:2, 3:4, 4:8, 5:16}`
  - `export type Schedule = { box: Box; due: IsoDate }`
  - `export function schedule(current: Schedule | undefined, correct: boolean, today: IsoDate): Schedule`
  - `export function isDue(entry: Schedule | undefined, today: IsoDate): boolean`
  - `export function dueCount(entries: Readonly<Record<string, Schedule>>, ids: readonly string[], today: IsoDate): number`
  - `export function nextDue(entries: readonly Schedule[]): IsoDate | undefined`
  - `export function parseSchedule(raw: unknown): Schedule | null`

- [ ] **Step 1: Write the failing date test**

Create `lib/dates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  formatIsoDate,
  isIsoDate,
  isoWeek,
  isoWeekKey,
  todayISO,
} from "@/lib/dates";

describe("isIsoDate", () => {
  it("accepts a real calendar date", () => {
    expect(isIsoDate("2026-08-21")).toBe(true);
  });

  it("rejects a date that does not exist", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });

  it("rejects anything that is not an ISO date string", () => {
    expect(isIsoDate("21/08/2026")).toBe(false);
    expect(isIsoDate(20260821)).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe("addDays", () => {
  it("crosses a month boundary", () => {
    expect(addDays("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("crosses a year boundary backwards", () => {
    expect(addDays("2026-01-02", -3)).toBe("2025-12-30");
  });

  it("handles the leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("daysBetween", () => {
  it("counts forward and backward", () => {
    expect(daysBetween("2026-08-21", "2026-08-24")).toBe(3);
    expect(daysBetween("2026-08-24", "2026-08-21")).toBe(-3);
    expect(daysBetween("2026-08-21", "2026-08-21")).toBe(0);
  });
});

describe("todayISO", () => {
  it("reads the local calendar date, not the UTC one", () => {
    // 31 Dec 2026 at 20:00 in a UTC+8 zone is still 1 Jan 2027 in UTC.
    const localNewYearsEve = new Date(2026, 11, 31, 20, 0, 0);
    expect(todayISO(localNewYearsEve)).toBe("2026-12-31");
  });
});

describe("isoWeek", () => {
  it("puts 1 January 2026 in week 1 of 2026", () => {
    expect(isoWeek("2026-01-01")).toEqual({ year: 2026, week: 1 });
  });

  it("starts weeks on Monday", () => {
    expect(isoWeekKey("2026-08-23")).toBe("2026-W34"); // Sunday
    expect(isoWeekKey("2026-08-24")).toBe("2026-W35"); // Monday
  });

  it("keeps 1 January 2027 in 2026's week 53", () => {
    expect(isoWeekKey("2027-01-01")).toBe("2026-W53");
  });

  it("puts 30 December 2024 in 2025's week 1", () => {
    expect(isoWeekKey("2024-12-30")).toBe("2025-W01");
  });
});

describe("formatIsoDate", () => {
  it("renders a short, locale-independent date", () => {
    expect(formatIsoDate("2026-08-23")).toBe("23 Aug 2026");
    expect(formatIsoDate("2026-01-05")).toBe("5 Jan 2026");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/dates.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/dates"`.

- [ ] **Step 3: Write `lib/dates.ts`**

```ts
/**
 * Calendar-date helpers for the practice layer.
 *
 * Every date the practice layer stores is an ISO `YYYY-MM-DD` string in the
 * visitor's own calendar (spec §12). Every function here is pure: the date is
 * always an argument, never read from the clock, so schedules, streaks and
 * exports are deterministic and testable. `todayISO()` is the single place the
 * clock is read; callers read it once and pass the result down.
 *
 * Arithmetic runs at UTC midnight so a DST transition can never shift a
 * calendar date by a day. `todayISO()` deliberately uses the *local* getters,
 * because "today" for a visitor in Manila is the date on their wall calendar.
 */

export type IsoDate = string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** UTC-midnight timestamp for a YYYY-MM-DD string. */
export function toUTCms(iso: IsoDate): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
}

export function fromUTCms(ms: number): IsoDate {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Shape check plus a round-trip, so an impossible date such as "2026-02-30"
 * (which `Date.UTC` would silently roll into March) is rejected.
 */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  return fromUTCms(toUTCms(value)) === value;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUTCms(toUTCms(iso) + days * DAY_MS);
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUTCms(to) - toUTCms(from)) / DAY_MS);
}

/** The visitor's local calendar date — what a `<input type="date">` shows. */
export function todayISO(now: Date = new Date()): IsoDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export type IsoWeek = { year: number; week: number };

/**
 * ISO-8601 week number. The Thursday of a week decides which year the week
 * belongs to, which is why 1 Jan 2027 (a Friday) is 2026-W53.
 */
export function isoWeek(iso: IsoDate): IsoWeek {
  const d = new Date(toUTCms(iso));
  const dayIndex = (d.getUTCDay() + 6) % 7; // Monday 0 … Sunday 6
  d.setUTCDate(d.getUTCDate() - dayIndex + 3); // this week's Thursday
  const year = d.getUTCFullYear();

  const jan4 = new Date(Date.UTC(year, 0, 4)); // always in week 1
  const jan4Index = (jan4.getUTCDay() + 6) % 7;
  jan4.setUTCDate(jan4.getUTCDate() - jan4Index + 3); // week 1's Thursday

  const week = 1 + Math.round((d.getTime() - jan4.getTime()) / (7 * DAY_MS));
  return { year, week };
}

export function isoWeekKey(iso: IsoDate): string {
  const { year, week } = isoWeek(iso);
  return `${year}-W${pad(week)}`;
}

/**
 * "23 Aug 2026". Built by hand rather than through `toLocaleDateString` so the
 * server and the client always produce the same string — a locale mismatch
 * here would be a hydration error on every page that shows a due date.
 */
export function formatIsoDate(iso: IsoDate): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m || 1) - 1]} ${y}`;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/dates.test.ts`
Expected: PASS — 13 tests, 0 failed.

- [ ] **Step 5: Write the failing Leitner test**

Create `lib/leitner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  BOXES,
  INTERVALS,
  dueCount,
  isDue,
  nextDue,
  parseSchedule,
  schedule,
  type Schedule,
} from "@/lib/leitner";

const TODAY = "2026-08-21";

describe("INTERVALS", () => {
  it("is the 1/2/4/8/16-day ladder", () => {
    expect(BOXES.map((box) => INTERVALS[box])).toEqual([1, 2, 4, 8, 16]);
  });
});

describe("schedule", () => {
  it("treats an unseen card as box 1 and promotes it on a correct answer", () => {
    expect(schedule(undefined, true, TODAY)).toEqual({ box: 2, due: "2026-08-23" });
  });

  it("keeps an unseen card in box 1 when it is missed", () => {
    expect(schedule(undefined, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("promotes one box per correct answer and dates the review from the new box", () => {
    expect(schedule({ box: 2, due: TODAY }, true, TODAY)).toEqual({ box: 3, due: "2026-08-25" });
    expect(schedule({ box: 3, due: TODAY }, true, TODAY)).toEqual({ box: 4, due: "2026-08-29" });
    expect(schedule({ box: 4, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: "2026-09-06" });
  });

  it("stops at box 5", () => {
    expect(schedule({ box: 5, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: "2026-09-06" });
  });

  it("demotes straight to box 1 from any box", () => {
    expect(schedule({ box: 5, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
    expect(schedule({ box: 3, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("dates the review from today, not from the old due date", () => {
    expect(schedule({ box: 1, due: "2026-01-01" }, true, TODAY)).toEqual({
      box: 2,
      due: "2026-08-23",
    });
  });

  it("repairs an out-of-range box instead of throwing", () => {
    expect(schedule({ box: 9 as Schedule["box"], due: TODAY }, true, TODAY).box).toBe(5);
    expect(schedule({ box: 0 as Schedule["box"], due: TODAY }, true, TODAY).box).toBe(2);
  });
});

describe("isDue", () => {
  it("treats a card that has never been seen as due", () => {
    expect(isDue(undefined, TODAY)).toBe(true);
  });

  it("is due on and after the due date", () => {
    expect(isDue({ box: 2, due: TODAY }, TODAY)).toBe(true);
    expect(isDue({ box: 2, due: "2026-08-20" }, TODAY)).toBe(true);
  });

  it("is not due before the due date", () => {
    expect(isDue({ box: 2, due: "2026-08-22" }, TODAY)).toBe(false);
  });
});

describe("dueCount", () => {
  it("counts unseen ids and overdue ids together", () => {
    const entries = {
      a: { box: 2, due: "2026-08-20" } as Schedule,
      b: { box: 4, due: "2026-09-01" } as Schedule,
    };
    expect(dueCount(entries, ["a", "b", "c"], TODAY)).toBe(2);
  });
});

describe("nextDue", () => {
  it("returns the earliest due date", () => {
    expect(
      nextDue([
        { box: 3, due: "2026-09-01" },
        { box: 1, due: "2026-08-22" },
        { box: 5, due: "2026-10-01" },
      ]),
    ).toBe("2026-08-22");
  });

  it("returns undefined for an empty list", () => {
    expect(nextDue([])).toBeUndefined();
  });
});

describe("parseSchedule", () => {
  it("accepts a well-formed entry", () => {
    expect(parseSchedule({ box: 3, due: "2026-08-25" })).toEqual({ box: 3, due: "2026-08-25" });
  });

  it("rejects a bad box, a bad date, and a non-object", () => {
    expect(parseSchedule({ box: 7, due: "2026-08-25" })).toBeNull();
    expect(parseSchedule({ box: 3, due: "yesterday" })).toBeNull();
    expect(parseSchedule("nope")).toBeNull();
    expect(parseSchedule(null)).toBeNull();
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run lib/leitner.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/leitner"`.

- [ ] **Step 7: Write `lib/leitner.ts`**

```ts
/**
 * The five-box Leitner schedule (spec §7.4.1).
 *
 * A card sits in one of five boxes. Answering it from memory moves it up one
 * box; missing it sends it back to box 1. The box decides when it comes back:
 * 1, 2, 4, 8 or 16 days from the day you answered — never from the day it was
 * previously due, so a card you review late is not punished twice.
 *
 * Pure and deterministic: `today` is always passed in.
 */

import { addDays, isIsoDate, type IsoDate } from "./dates";

export type Box = 1 | 2 | 3 | 4 | 5;

export const BOXES: readonly Box[] = [1, 2, 3, 4, 5];

/** Days until the next review, by box. */
export const INTERVALS: Record<Box, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export type Schedule = { box: Box; due: IsoDate };

function clampBox(value: number): Box {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value))) as Box;
}

/**
 * The next schedule for a card. `current` is `undefined` for a card the
 * visitor has never answered; it is treated as box 1, so a first correct
 * answer promotes it to box 2 and brings it back in two days.
 */
export function schedule(
  current: Schedule | undefined,
  correct: boolean,
  today: IsoDate,
): Schedule {
  const box = current ? clampBox(current.box) : 1;
  const next: Box = correct ? clampBox(box + 1) : 1;
  return { box: next, due: addDays(today, INTERVALS[next]) };
}

/** A card with no schedule has never been seen, so it is due. */
export function isDue(entry: Schedule | undefined, today: IsoDate): boolean {
  if (!entry) return true;
  // ISO dates sort lexicographically in calendar order, so no parsing needed.
  return entry.due <= today;
}

export function dueCount(
  entries: Readonly<Record<string, Schedule>>,
  ids: readonly string[],
  today: IsoDate,
): number {
  return ids.filter((id) => isDue(entries[id], today)).length;
}

export function nextDue(entries: readonly Schedule[]): IsoDate | undefined {
  if (entries.length === 0) return undefined;
  return entries.reduce<IsoDate>(
    (earliest, entry) => (entry.due < earliest ? entry.due : earliest),
    entries[0].due,
  );
}

/** Total: anything that is not a valid stored schedule becomes `null`. */
export function parseSchedule(raw: unknown): Schedule | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as { box?: unknown; due?: unknown };
  if (typeof value.box !== "number" || !BOXES.includes(value.box as Box)) return null;
  if (!isIsoDate(value.due)) return null;
  return { box: value.box as Box, due: value.due };
}
```

- [ ] **Step 8: Run it and watch it pass**

Run: `npx vitest run lib/leitner.test.ts`
Expected: PASS — 15 tests, 0 failed.

- [ ] **Step 9: Type-check**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 10: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/dates.ts lib/dates.test.ts lib/leitner.ts lib/leitner.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add ISO calendar helpers and the five-box Leitner schedule"
```

---

### Task 2: `lib/streak.ts`

**Parallel group:** A

**Files:**
- Create: `lib/streak.ts`, `lib/streak.test.ts`

**Interfaces:**
- Consumes: `addDays`, `daysBetween`, `isIsoDate`, `type IsoDate` from `@/lib/dates` (Task 1).
- Produces:
  - `export function currentStreak(completedDates: readonly string[], today: IsoDate): number` — consecutive days ending today or yesterday; `0` if the run ended earlier than yesterday.
  - `export function longestStreak(completedDates: readonly string[]): number`
  - `export function uniqueDates(completedDates: readonly string[]): IsoDate[]` — deduped, sorted ascending, invalid entries dropped.

- [ ] **Step 1: Write the failing test**

Create `lib/streak.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { currentStreak, longestStreak, uniqueDates } from "@/lib/streak";

const TODAY = "2026-08-21";

describe("uniqueDates", () => {
  it("dedupes, sorts, and drops anything that is not a real date", () => {
    expect(
      uniqueDates(["2026-08-21", "2026-08-19", "2026-08-21", "nope", "2026-02-30"]),
    ).toEqual(["2026-08-19", "2026-08-21"]);
  });
});

describe("currentStreak", () => {
  it("is 0 when nothing has been completed", () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  it("counts a run that ends today", () => {
    expect(currentStreak(["2026-08-19", "2026-08-20", "2026-08-21"], TODAY)).toBe(3);
  });

  it("counts a run that ends yesterday, so a day is not lost before it is over", () => {
    expect(currentStreak(["2026-08-19", "2026-08-20"], TODAY)).toBe(2);
  });

  it("is 0 when the last completed day is older than yesterday", () => {
    expect(currentStreak(["2026-08-17", "2026-08-18"], TODAY)).toBe(0);
  });

  it("stops at the first gap", () => {
    expect(
      currentStreak(["2026-08-01", "2026-08-19", "2026-08-20", "2026-08-21"], TODAY),
    ).toBe(3);
  });

  it("counts a duplicated day once", () => {
    expect(currentStreak(["2026-08-21", "2026-08-21", "2026-08-20"], TODAY)).toBe(2);
  });

  it("counts a single day", () => {
    expect(currentStreak(["2026-08-21"], TODAY)).toBe(1);
  });
});

describe("longestStreak", () => {
  it("is 0 for an empty history", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("finds the longest run anywhere in the history", () => {
    expect(
      longestStreak([
        "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04",
        "2026-08-20", "2026-08-21",
      ]),
    ).toBe(4);
  });

  it("counts an isolated day as 1", () => {
    expect(longestStreak(["2026-07-01", "2026-09-09"])).toBe(1);
  });

  it("spans a month boundary", () => {
    expect(longestStreak(["2026-08-30", "2026-08-31", "2026-09-01"])).toBe(3);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/streak.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/streak"`.

- [ ] **Step 3: Write `lib/streak.ts`**

```ts
/**
 * Streaks over plan-day completion dates (spec §7.4.5).
 *
 * A streak here is a fact, not a game: the number of consecutive days on which
 * the visitor ticked at least one plan day. No badges, no points, no warning
 * that a streak is "about to break" — the site says the number and stops.
 *
 * The current streak is allowed to end *yesterday* as well as today, so a
 * visitor who has not opened the site yet this morning does not see their
 * count collapse to zero before the day is over.
 */

import { addDays, daysBetween, isIsoDate, type IsoDate } from "./dates";

export function uniqueDates(completedDates: readonly string[]): IsoDate[] {
  return [...new Set(completedDates.filter(isIsoDate))].sort();
}

export function currentStreak(completedDates: readonly string[], today: IsoDate): number {
  const days = new Set(uniqueDates(completedDates));
  if (days.size === 0) return 0;

  const yesterday = addDays(today, -1);
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  if (cursor === null) return 0;

  let run = 0;
  while (days.has(cursor)) {
    run += 1;
    cursor = addDays(cursor, -1);
  }
  return run;
}

export function longestStreak(completedDates: readonly string[]): number {
  const days = uniqueDates(completedDates);
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/streak.test.ts`
Expected: PASS — 12 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/streak.ts lib/streak.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add current and longest streak over completion dates"
```

---

### Task 3: `lib/ics.ts`

**Parallel group:** A

**Files:**
- Create: `lib/ics.ts`, `lib/ics.test.ts`

**Interfaces:**
- Consumes: `addDays`, `type IsoDate` from `@/lib/dates` (Task 1).
- Produces:
  - `export type IcsDay = { n: number; title: string; desc?: string }`
  - `export type IcsPlan = { title: string; startDate: IsoDate; days: readonly IcsDay[]; uidNamespace?: string; stamp?: string }`
  - `export function planToIcs(plan: IcsPlan): string` — a complete `VCALENDAR` with one all-day `VEVENT` per day, CRLF line endings, a trailing CRLF, every text value escaped, every line folded to ≤ 75 octets, and a UID that depends only on the day number and the namespace so re-exporting updates events instead of duplicating them.
  - `export function escapeText(value: string): string` — RFC 5545 §3.3.11.
  - `export function foldLine(line: string): string` — RFC 5545 §3.1, counted in UTF-8 octets, never splitting a character.
  - `export function toIcsDate(iso: IsoDate): string` → `"20260821"`.

**Why `stamp` is a parameter:** RFC 5545 requires `DTSTAMP`, and reading the clock for it would make the output untestable and make two exports of an unchanged plan differ. It defaults to midnight UTC on the plan's start date, which is valid and stable.

- [ ] **Step 1: Write the failing test**

Create `lib/ics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { escapeText, foldLine, planToIcs, toIcsDate } from "@/lib/ics";

const PLAN = {
  title: "My 30-day plan",
  startDate: "2026-08-21",
  days: [
    { n: 1, title: "Confirm equipment and workspace", desc: "Open the Equipment Checker." },
    { n: 2, title: "Read the roadmap end to end" },
  ],
};

function lines(ics: string): string[] {
  return ics.split("\r\n");
}

describe("escapeText", () => {
  it("escapes backslash, semicolon, comma and newline, in that order", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("normalises CRLF and lone CR to the literal \\n escape", () => {
    expect(escapeText("a\r\nb\rc")).toBe("a\\nb\\nc");
  });
});

describe("foldLine", () => {
  it("leaves a short line alone", () => {
    expect(foldLine("SUMMARY:short")).toBe("SUMMARY:short");
  });

  it("folds a long line with CRLF plus one space and keeps every chunk under 76 octets", () => {
    const folded = foldLine(`SUMMARY:${"x".repeat(200)}`);
    const chunks = folded.split("\r\n");
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(new TextEncoder().encode(chunk).length).toBeLessThanOrEqual(75);
    }
    for (const chunk of chunks.slice(1)) {
      expect(chunk.startsWith(" ")).toBe(true);
    }
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"x".repeat(200)}`);
  });

  it("never splits a multi-byte character", () => {
    const folded = foldLine(`SUMMARY:${"ñ".repeat(80)}`);
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"ñ".repeat(80)}`);
    for (const chunk of folded.split("\r\n")) {
      expect(new TextEncoder().encode(chunk).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("toIcsDate", () => {
  it("strips the dashes", () => {
    expect(toIcsDate("2026-08-21")).toBe("20260821");
  });
});

describe("planToIcs", () => {
  it("opens and closes a VCALENDAR", () => {
    const out = lines(planToIcs(PLAN));
    expect(out[0]).toBe("BEGIN:VCALENDAR");
    expect(out).toContain("VERSION:2.0");
    expect(out).toContain("END:VCALENDAR");
  });

  it("uses CRLF everywhere and ends with one", () => {
    const ics = planToIcs(PLAN);
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("writes one all-day VEVENT per day with an exclusive end date", () => {
    const out = lines(planToIcs(PLAN));
    expect(out.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(2);
    expect(out).toContain("DTSTART;VALUE=DATE:20260821");
    expect(out).toContain("DTEND;VALUE=DATE:20260822");
    expect(out).toContain("DTSTART;VALUE=DATE:20260822");
    expect(out).toContain("DTEND;VALUE=DATE:20260823");
  });

  it("numbers the summary so a calendar row reads as a plan day", () => {
    expect(lines(planToIcs(PLAN))).toContain("SUMMARY:Day 1 — Confirm equipment and workspace");
  });

  it("omits DESCRIPTION when the day has none", () => {
    const out = lines(planToIcs(PLAN));
    expect(out.filter((line) => line.startsWith("DESCRIPTION:"))).toHaveLength(1);
  });

  it("gives every event a stable UID that does not change between exports", () => {
    const first = lines(planToIcs(PLAN)).filter((line) => line.startsWith("UID:"));
    const second = lines(planToIcs(PLAN)).filter((line) => line.startsWith("UID:"));
    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(2);
    expect(first[0]).toBe("UID:hfph-plan-day-1@hirefrom.ph");
  });

  it("escapes commas and semicolons in the summary", () => {
    const ics = planToIcs({
      ...PLAN,
      days: [{ n: 1, title: "Vet it, price it; then send" }],
    });
    expect(lines(ics)).toContain("SUMMARY:Day 1 — Vet it\\, price it\\; then send");
  });

  it("produces a deterministic DTSTAMP from the start date", () => {
    expect(lines(planToIcs(PLAN))).toContain("DTSTAMP:20260821T000000Z");
  });

  it("keeps every line at or under 75 octets", () => {
    const ics = planToIcs({
      ...PLAN,
      days: [{ n: 1, title: "x".repeat(300), desc: "y".repeat(300) }],
    });
    for (const line of lines(ics)) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("still produces a valid empty calendar for a plan with no days", () => {
    const out = lines(planToIcs({ ...PLAN, days: [] }));
    expect(out).toContain("BEGIN:VCALENDAR");
    expect(out).toContain("END:VCALENDAR");
    expect(out.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/ics.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/ics"`.

- [ ] **Step 3: Write `lib/ics.ts`**

```ts
/**
 * iCalendar export for the 30-day plan (spec §7.4.4).
 *
 * RFC 5545, the parts that matter here:
 *  - §3.1  lines are CRLF-terminated and folded at 75 *octets* with CRLF + one
 *          leading space; a folded line must never split a character.
 *  - §3.3.11 TEXT values escape backslash, semicolon, comma, and newline.
 *  - §3.6.1 an all-day event uses `VALUE=DATE` and an *exclusive* DTEND, so a
 *          one-day event ends on the following date.
 *  - §3.8.4.7 UID must be stable: re-exporting an unchanged plan has to update
 *          the same events rather than duplicate them in the visitor's calendar.
 *
 * Nothing here reads the clock. `stamp` defaults to midnight UTC on the start
 * date so two exports of the same plan are byte-identical.
 */

import { addDays, type IsoDate } from "./dates";

export type IcsDay = { n: number; title: string; desc?: string };

export type IcsPlan = {
  title: string;
  startDate: IsoDate;
  days: readonly IcsDay[];
  /** Domain half of the UID. Only change it in a test. */
  uidNamespace?: string;
  /** `YYYYMMDDTHHMMSSZ`. Defaults to midnight UTC on `startDate`. */
  stamp?: string;
};

const MAX_OCTETS = 75;

export function toIcsDate(iso: IsoDate): string {
  return iso.replace(/-/g, "");
}

export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

const encoder = new TextEncoder();

export function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_OCTETS) return line;

  const chunks: string[] = [];
  let current = "";
  let octets = 0;
  // The first chunk gets all 75 octets; every continuation spends one on the
  // leading space the unfolder strips back off.
  let limit = MAX_OCTETS;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (octets + size > limit) {
      chunks.push(current);
      current = "";
      octets = 0;
      limit = MAX_OCTETS - 1;
    }
    current += char;
    octets += size;
  }
  chunks.push(current);

  return chunks.join("\r\n ");
}

export function planToIcs({
  title,
  startDate,
  days,
  uidNamespace = "hirefrom.ph",
  stamp,
}: IcsPlan): string {
  const dtstamp = stamp ?? `${toIcsDate(startDate)}T000000Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hire From PH//Practice layer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(title)}`,
  ];

  for (const day of days) {
    const start = addDays(startDate, day.n - 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:hfph-plan-day-${day.n}@${uidNamespace}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
      `DTEND;VALUE=DATE:${toIcsDate(addDays(start, 1))}`,
      `SUMMARY:${escapeText(`Day ${day.n} — ${day.title}`)}`,
    );
    if (day.desc) lines.push(`DESCRIPTION:${escapeText(day.desc)}`);
    lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/ics.test.ts`
Expected: PASS — 15 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/ics.ts lib/ics.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add RFC 5545 iCalendar export for the 30-day plan"
```

---

### Task 4: `lib/scenario.ts`

**Parallel group:** A

**Files:**
- Create: `lib/scenario.ts`, `lib/scenario.test.ts`

**Interfaces:**
- Consumes: `data/scenarios.json`.
- Produces:
  - `export type ScenarioChoice = { label: string; next: string; tests: string; note?: string }`
  - `export type ScenarioNode = { text: string; choices?: ScenarioChoice[]; end?: boolean; debrief?: string }`
  - `export type Scenario = { id: string; title: string; route: string; intro: string; start: string; nodes: Record<string, ScenarioNode> }`
  - `export const SCENARIOS: Scenario[]`; `export const SCENARIOS_LAST_VERIFIED: string`
  - `export function getScenario(id: string): Scenario | undefined`
  - `export function getScenarioForRoute(route: string): Scenario | undefined`
  - `export type WalkStep = { id: string; node: ScenarioNode; choice?: ScenarioChoice }`
  - `export type Walk = { steps: WalkStep[]; currentId: string; current: ScenarioNode; finished: boolean }` — `steps` is the path *taken* (each entry carries the choice made at that node); `current` is where the visitor is now.
  - `export function walk(scenario: Scenario, choices: readonly number[]): Walk`
  - `export type ProblemKind = "missing-start" | "dangling" | "unreachable" | "dead-end" | "no-debrief" | "end-with-choices"`
  - `export type ScenarioProblem = { kind: ProblemKind; node: string; detail: string }`
  - `export function validateScenario(scenario: Scenario): ScenarioProblem[]` — `[]` means the graph is sound.

- [ ] **Step 1: Write the failing test**

Create `lib/scenario.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  SCENARIOS,
  getScenario,
  getScenarioForRoute,
  validateScenario,
  walk,
  type Scenario,
} from "@/lib/scenario";

const TOY: Scenario = {
  id: "toy",
  title: "A toy scenario",
  route: "/conduct",
  intro: "Two forks, one ending.",
  start: "a",
  nodes: {
    a: {
      text: "You are at A.",
      choices: [
        { label: "Go to B", next: "b", tests: "Boundaries." },
        { label: "Go to C", next: "c", tests: "Scope.", note: "Costs you nothing." },
      ],
    },
    b: { text: "You are at B.", choices: [{ label: "Finish", next: "end", tests: "Follow-through." }] },
    c: { text: "You are at C.", choices: [{ label: "Finish", next: "end", tests: "Follow-through." }] },
    end: { text: "Done.", end: true, debrief: "You got there." },
  },
};

describe("walk", () => {
  it("starts at the start node with no steps taken", () => {
    const result = walk(TOY, []);
    expect(result.currentId).toBe("a");
    expect(result.steps).toEqual([]);
    expect(result.finished).toBe(false);
  });

  it("records the node and the choice made at each step", () => {
    const result = walk(TOY, [0]);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].id).toBe("a");
    expect(result.steps[0].choice?.next).toBe("b");
    expect(result.currentId).toBe("b");
  });

  it("reaches an end node and marks the walk finished", () => {
    const result = walk(TOY, [1, 0]);
    expect(result.currentId).toBe("end");
    expect(result.current.debrief).toBe("You got there.");
    expect(result.finished).toBe(true);
    expect(result.steps.map((step) => step.id)).toEqual(["a", "c"]);
  });

  it("stops where it is when a choice index is out of range", () => {
    const result = walk(TOY, [9]);
    expect(result.currentId).toBe("a");
    expect(result.steps).toEqual([]);
  });

  it("stops where it is when a choice points at a node that does not exist", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, a: { text: "A", choices: [{ label: "Nowhere", next: "ghost", tests: "x" }] } },
    };
    expect(walk(broken, [0]).currentId).toBe("a");
  });

  it("falls back to the first node when `start` is missing", () => {
    const result = walk({ ...TOY, start: "ghost" }, []);
    expect(result.currentId).toBe("a");
  });
});

describe("validateScenario", () => {
  it("finds nothing wrong with a sound graph", () => {
    expect(validateScenario(TOY)).toEqual([]);
  });

  it("reports a dangling next", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, b: { text: "B", choices: [{ label: "Nowhere", next: "ghost", tests: "x" }] } },
    };
    expect(validateScenario(broken)).toContainEqual({
      kind: "dangling",
      node: "b",
      detail: 'choice "Nowhere" points at "ghost", which is not a node',
    });
  });

  it("reports an unreachable node", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, orphan: { text: "Nobody gets here.", end: true, debrief: "…" } },
    };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("unreachable");
  });

  it("reports a non-end node with no choices", () => {
    const broken: Scenario = { ...TOY, nodes: { ...TOY.nodes, b: { text: "B" } } };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("dead-end");
  });

  it("reports an end node with no debrief", () => {
    const broken: Scenario = { ...TOY, nodes: { ...TOY.nodes, end: { text: "Done.", end: true } } };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("no-debrief");
  });

  it("reports a missing start node", () => {
    expect(validateScenario({ ...TOY, start: "ghost" }).map((p) => p.kind)).toContain(
      "missing-start",
    );
  });
});

describe("the authored scenarios", () => {
  it("loads four scenarios", () => {
    expect(SCENARIOS).toHaveLength(4);
  });

  it("finds one by id and one by route", () => {
    expect(getScenario("late-request")?.route).toBe("/conduct");
    expect(getScenarioForRoute("/clients")?.id).toBe("scope-creep");
    expect(getScenario("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/scenario.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/scenario"`.

- [ ] **Step 3: Write `lib/scenario.ts`**

```ts
/**
 * Branching scenarios (spec §7.4.2).
 *
 * A scenario is a directed graph of nodes. A node either offers choices or is
 * an ending with a debrief. There is no score: some forks are trade-offs, and
 * the debrief names the principle each fork tested rather than grading it.
 *
 * `walk` is pure — the component owns the list of chosen indices and re-walks
 * from the start on every render, so "go back one step" is `choices.slice(0, -1)`
 * and needs no undo stack.
 */

import scenariosData from "@/data/scenarios.json";

export type ScenarioChoice = {
  label: string;
  next: string;
  /** The principle this fork tests. Shown in the debrief. */
  tests: string;
  /** One line of consequence shown after the choice is made. */
  note?: string;
};

export type ScenarioNode = {
  text: string;
  choices?: ScenarioChoice[];
  end?: boolean;
  debrief?: string;
};

export type Scenario = {
  id: string;
  title: string;
  route: string;
  intro: string;
  start: string;
  nodes: Record<string, ScenarioNode>;
};

export const SCENARIOS = scenariosData.scenarios as Scenario[];
export const SCENARIOS_LAST_VERIFIED = scenariosData.lastVerified;

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

export function getScenarioForRoute(route: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.route === route);
}

export type WalkStep = { id: string; node: ScenarioNode; choice?: ScenarioChoice };

export type Walk = {
  /** The path taken, oldest first. Each step carries the choice made there. */
  steps: WalkStep[];
  currentId: string;
  current: ScenarioNode;
  finished: boolean;
};

function startId(scenario: Scenario): string {
  if (scenario.nodes[scenario.start]) return scenario.start;
  // A broken `start` must not blank the page; Task 8's integrity test is what
  // stops this reaching production.
  return Object.keys(scenario.nodes)[0];
}

export function walk(scenario: Scenario, choices: readonly number[]): Walk {
  const steps: WalkStep[] = [];
  let currentId = startId(scenario);
  let current = scenario.nodes[currentId];

  for (const index of choices) {
    const options = current?.choices ?? [];
    const choice = options[index];
    if (!choice) break;
    const nextNode = scenario.nodes[choice.next];
    if (!nextNode) break;

    steps.push({ id: currentId, node: current, choice });
    currentId = choice.next;
    current = nextNode;
  }

  return {
    steps,
    currentId,
    current,
    finished: current?.end === true,
  };
}

export type ProblemKind =
  | "missing-start"
  | "dangling"
  | "unreachable"
  | "dead-end"
  | "no-debrief"
  | "end-with-choices";

export type ScenarioProblem = { kind: ProblemKind; node: string; detail: string };

/** `[]` means the graph is sound. Used by the data-integrity suite (Task 8). */
export function validateScenario(scenario: Scenario): ScenarioProblem[] {
  const problems: ScenarioProblem[] = [];
  const ids = Object.keys(scenario.nodes);

  if (!scenario.nodes[scenario.start]) {
    problems.push({
      kind: "missing-start",
      node: scenario.start,
      detail: `start "${scenario.start}" is not a node`,
    });
  }

  for (const [id, node] of Object.entries(scenario.nodes)) {
    const choices = node.choices ?? [];
    for (const choice of choices) {
      if (!scenario.nodes[choice.next]) {
        problems.push({
          kind: "dangling",
          node: id,
          detail: `choice "${choice.label}" points at "${choice.next}", which is not a node`,
        });
      }
    }
    if (!node.end && choices.length === 0) {
      problems.push({ kind: "dead-end", node: id, detail: "no choices and not marked as an end" });
    }
    if (node.end && !node.debrief) {
      problems.push({ kind: "no-debrief", node: id, detail: "an ending with no debrief" });
    }
    if (node.end && choices.length > 0) {
      problems.push({ kind: "end-with-choices", node: id, detail: "an ending that still offers choices" });
    }
  }

  const seen = new Set<string>();
  const stack = [scenario.start];
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id) || !scenario.nodes[id]) continue;
    seen.add(id);
    for (const choice of scenario.nodes[id].choices ?? []) stack.push(choice.next);
  }
  for (const id of ids) {
    if (!seen.has(id)) {
      problems.push({ kind: "unreachable", node: id, detail: "no path from the start reaches it" });
    }
  }

  return problems;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/scenario.test.ts`
Expected: PASS — 13 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/scenario.ts lib/scenario.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add scenario graph walk and validator"
```

---

### Task 5: `lib/overlap.ts`

**Parallel group:** A

**Files:**
- Create: `lib/overlap.ts`, `lib/overlap.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export const PH_OFFSET = 8` — Philippine Standard Time, UTC+8, no DST.
  - `export type Region = { id: string; name: string; city: string; baseOffset: number; dstMonths: readonly number[]; dstShift: number }` — `name` matches `data/markets.json → regions.items[].name` exactly (Task 8 asserts it); `baseOffset` is the standard-time UTC offset of `city`; `dstMonths` are 1-based month numbers on which that city is on summer time; `dstShift` is the hours the clock moves forward (0 where there is no DST).
  - `export const REGIONS: readonly Region[]` — six regions in the same order as `markets.json`.
  - `export const TZ_SOURCE: { label: string; url: string }` — the citation rendered under the tool.
  - `export type HourWindow = { start: number; end: number }` — whole hours, `0 ≤ start < end ≤ 24`.
  - `export function offsetFor(region: Region, month: number): number`
  - `export function toPhWindows(window: HourWindow, offset: number): HourWindow[]` — the same wall-clock window expressed in PH time, split into one or two intervals when it wraps midnight.
  - `export function intersectHours(mine: HourWindow, theirs: readonly HourWindow[]): number`
  - `export function overlap(region: Region, month: number, mine: HourWindow, theirs?: HourWindow): { hours: number; windows: HourWindow[]; offset: number }` — `theirs` defaults to `{ start: 9, end: 17 }`.
  - `export function formatHour(hour: number): string` → `"9am"`, `"12nn"`, `"5pm"`, `"12mn"`.

- [ ] **Step 1: Write the failing test**

Create `lib/overlap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  PH_OFFSET,
  REGIONS,
  formatHour,
  intersectHours,
  offsetFor,
  overlap,
  toPhWindows,
} from "@/lib/overlap";

function region(id: string) {
  const found = REGIONS.find((r) => r.id === id);
  if (!found) throw new Error(`no region ${id}`);
  return found;
}

describe("REGIONS", () => {
  it("carries the six client regions the markets guide names", () => {
    expect(REGIONS).toHaveLength(6);
    expect(REGIONS.map((r) => r.id)).toEqual([
      "us", "uk-eu", "anz", "middle-east", "canada", "asia",
    ]);
  });
});

describe("offsetFor", () => {
  it("uses standard time outside the DST months", () => {
    expect(offsetFor(region("us"), 1)).toBe(-5);
  });

  it("moves the clock forward inside the DST months", () => {
    expect(offsetFor(region("us"), 7)).toBe(-4);
  });

  it("handles a southern-hemisphere DST window that wraps the new year", () => {
    expect(offsetFor(region("anz"), 1)).toBe(11);
    expect(offsetFor(region("anz"), 7)).toBe(10);
  });

  it("leaves a no-DST region alone all year", () => {
    for (let month = 1; month <= 12; month += 1) {
      expect(offsetFor(region("asia"), month)).toBe(8);
      expect(offsetFor(region("middle-east"), month)).toBe(4);
    }
  });
});

describe("toPhWindows", () => {
  it("returns one interval when the window does not wrap", () => {
    // Singapore is UTC+8, the same as PH: 9–17 there is 9–17 here.
    expect(toPhWindows({ start: 9, end: 17 }, 8)).toEqual([{ start: 9, end: 17 }]);
  });

  it("shifts a window forward by the difference to PH", () => {
    // UK on GMT (UTC+0): 9–17 there is 17–25 → 17–24 plus 0–1 here.
    expect(toPhWindows({ start: 9, end: 17 }, 0)).toEqual([
      { start: 17, end: 24 },
      { start: 0, end: 1 },
    ]);
  });

  it("wraps a window that lands entirely in the next PH day", () => {
    // US Eastern on EST (UTC-5): 9–17 there is 22–06 here.
    expect(toPhWindows({ start: 9, end: 17 }, -5)).toEqual([
      { start: 22, end: 24 },
      { start: 0, end: 6 },
    ]);
  });
});

describe("intersectHours", () => {
  it("counts the overlapping whole hours", () => {
    expect(intersectHours({ start: 9, end: 18 }, [{ start: 14, end: 22 }])).toBe(4);
  });

  it("is 0 when the windows do not touch", () => {
    expect(intersectHours({ start: 9, end: 12 }, [{ start: 14, end: 22 }])).toBe(0);
  });

  it("adds up both halves of a wrapped window", () => {
    expect(
      intersectHours({ start: 20, end: 24 }, [{ start: 22, end: 24 }, { start: 0, end: 6 }]),
    ).toBe(2);
  });
});

describe("overlap", () => {
  it("gives a PH day worker no live hours with US Eastern in January", () => {
    expect(overlap(region("us"), 1, { start: 9, end: 17 }).hours).toBe(0);
  });

  it("gives a PH night worker a full window with US Eastern in January", () => {
    const result = overlap(region("us"), 1, { start: 22, end: 24 });
    expect(result.hours).toBe(2);
    expect(result.offset).toBe(-5);
  });

  it("gives a PH afternoon worker real overlap with the UK in January", () => {
    expect(overlap(region("uk-eu"), 1, { start: 13, end: 21 }).hours).toBe(4);
  });

  it("gives a PH day worker a full working day with regional Asia", () => {
    expect(overlap(region("asia"), 6, { start: 9, end: 17 }).hours).toBe(8);
  });

  it("accepts a client window other than 9 to 5", () => {
    expect(
      overlap(region("asia"), 6, { start: 9, end: 17 }, { start: 12, end: 20 }).hours,
    ).toBe(5);
  });
});

describe("formatHour", () => {
  it("names midnight and noon rather than printing 12", () => {
    expect(formatHour(0)).toBe("12mn");
    expect(formatHour(12)).toBe("12nn");
    expect(formatHour(24)).toBe("12mn");
  });

  it("uses am and pm elsewhere", () => {
    expect(formatHour(9)).toBe("9am");
    expect(formatHour(17)).toBe("5pm");
  });
});

describe("PH_OFFSET", () => {
  it("is UTC+8", () => {
    expect(PH_OFFSET).toBe(8);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/overlap.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/overlap"`.

- [ ] **Step 3: Write `lib/overlap.ts`**

```ts
/**
 * Overlap hours between a Philippine working window and a client region
 * (spec §7.4.6).
 *
 * The model is deliberately coarse and says so in the UI: one representative
 * city per region, DST resolved at month granularity. A region spans several
 * zones — "United States" here is New York, and the Pacific coast is three
 * hours further from Manila — so the number is a planning estimate, not a
 * booking system. Everything is whole hours; nowhere in this tool is a
 * half-hour offset (India, parts of Australia) in scope.
 *
 * Pure: the month is always passed in.
 */

/** Philippine Standard Time. No DST, and none since 1978. */
export const PH_OFFSET = 8;

export type Region = {
  id: string;
  /** Matches data/markets.json → regions.items[].name exactly. */
  name: string;
  /** The city the offset belongs to, named in the UI so the estimate is honest. */
  city: string;
  /** Standard-time UTC offset of `city`, in whole hours. */
  baseOffset: number;
  /** 1-based months on which `city` is on summer time. */
  dstMonths: readonly number[];
  /** Hours the clock moves forward during those months. */
  dstShift: number;
};

export const REGIONS: readonly Region[] = [
  {
    id: "us",
    name: "United States",
    city: "New York",
    baseOffset: -5,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    dstShift: 1,
  },
  {
    id: "uk-eu",
    name: "United Kingdom & Europe",
    city: "London",
    baseOffset: 0,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    dstShift: 1,
  },
  {
    id: "anz",
    name: "Australia & New Zealand",
    city: "Sydney",
    baseOffset: 10,
    dstMonths: [10, 11, 12, 1, 2, 3, 4],
    dstShift: 1,
  },
  {
    id: "middle-east",
    name: "Middle East",
    city: "Dubai",
    baseOffset: 4,
    dstMonths: [],
    dstShift: 0,
  },
  {
    id: "canada",
    name: "Canada",
    city: "Toronto",
    baseOffset: -5,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    dstShift: 1,
  },
  {
    id: "asia",
    name: "Singapore, Hong Kong & regional Asia",
    city: "Singapore",
    baseOffset: 8,
    dstMonths: [],
    dstShift: 0,
  },
];

/** Offsets and DST rules come from the IANA time-zone database. */
export const TZ_SOURCE = {
  label: "IANA Time Zone Database",
  url: "https://www.iana.org/time-zones",
};

export type HourWindow = { start: number; end: number };

export function offsetFor(region: Region, month: number): number {
  return region.dstMonths.includes(month)
    ? region.baseOffset + region.dstShift
    : region.baseOffset;
}

/**
 * The same wall-clock window seen from Manila. A window that crosses PH
 * midnight comes back as two intervals so `intersectHours` stays trivial.
 */
export function toPhWindows(window: HourWindow, offset: number): HourWindow[] {
  const shift = PH_OFFSET - offset;
  const start = window.start + shift;
  const end = window.end + shift;

  const wrapped = ((start % 24) + 24) % 24;
  const length = end - start;
  const first = { start: wrapped, end: Math.min(wrapped + length, 24) };
  const spill = wrapped + length - 24;

  if (spill <= 0) return [first];
  return [first, { start: 0, end: Math.min(spill, 24) }];
}

export function intersectHours(mine: HourWindow, theirs: readonly HourWindow[]): number {
  return theirs.reduce((total, window) => {
    const start = Math.max(mine.start, window.start);
    const end = Math.min(mine.end, window.end);
    return total + Math.max(0, end - start);
  }, 0);
}

export function overlap(
  region: Region,
  month: number,
  mine: HourWindow,
  theirs: HourWindow = { start: 9, end: 17 },
): { hours: number; windows: HourWindow[]; offset: number } {
  const offset = offsetFor(region, month);
  const windows = toPhWindows(theirs, offset);
  return { hours: intersectHours(mine, windows), windows, offset };
}

export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return "12mn";
  if (h === 12) return "12nn";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/overlap.test.ts`
Expected: PASS — 16 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/overlap.ts lib/overlap.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add pure overlap-hour maths for client regions"
```

---

### Task 6: `lib/practice-store.ts`

**Parallel group:** A

**Files:**
- Create: `lib/practice-store.ts`, `lib/practice-store.test.ts`

**Interfaces:**
- Consumes: `isIsoDate`, `type IsoDate` from `@/lib/dates` (Task 1); `parseSchedule`, `type Schedule` from `@/lib/leitner` (Task 1).
- Produces:
  - `export const PRACTICE_KEYS` — the six slot names, all under `hfph.practice.*`:
    `quiz: "hfph.practice.quiz.v1"`, `deck: "hfph.practice.deck.v1"`, `journal: "hfph.practice.journal.v1"`, `reader: "hfph.practice.reader.v1"`, `planDays: "hfph.practice.plan-days.v1"`, `timer: "hfph.practice.timer.v1"`.
  - `export function readSlot<T>(key: string, parse: (raw: unknown) => T): T | null` — `null` only when the slot is absent, unreadable, or not JSON.
  - `export function writeSlot(key: string, value: unknown): void`
  - `export function clearSlot(key: string): void`
  - `export type QuizRun = { score: number; total: number; taken: IsoDate }`; `export type QuizState = { questions: Record<string, Schedule>; routes: Record<string, QuizRun> }`; `export const EMPTY_QUIZ: QuizState`; `export function parseQuizState(raw: unknown): QuizState`
  - `export type DeckState = { cards: Record<string, Schedule> }`; `export const EMPTY_DECK: DeckState`; `export function parseDeckState(raw: unknown): DeckState`
  - `export type JournalEntry = { text: string; updated: IsoDate }`; `export type JournalState = Record<string, JournalEntry>`; `export const EMPTY_JOURNAL: JournalState`; `export function parseJournalState(raw: unknown): JournalState`
  - `export type FontSize = "sm" | "md" | "lg"`; `export type ReaderPrefs = { size: FontSize; comfort: boolean; lowData: boolean }`; `export const DEFAULT_READER: ReaderPrefs`; `export function parseReaderPrefs(raw: unknown): ReaderPrefs`
  - `export type PlanDayDates = Record<number, IsoDate>`; `export const EMPTY_PLAN_DAYS: PlanDayDates`; `export function parsePlanDayDates(raw: unknown): PlanDayDates`
  - `export type TimerPhase = "focus" | "break"`; `export type TimerState = { shape: string; phase: TimerPhase; endsAt: number; paused: boolean; remainingMs: number } | null`; `export const EMPTY_TIMER: TimerState`; `export function parseTimerState(raw: unknown): TimerState`

**Why six slots and not one blob:** a quota error or a corrupt write in one feature must not cost the visitor their journal. Each slot is parsed by a total function that drops malformed entries rather than rejecting the whole slot, and the reader slot stays small enough for the pre-paint script in Task 14 to parse without a measurable cost.

- [ ] **Step 1: Write the failing test**

Create `lib/practice-store.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_READER,
  EMPTY_QUIZ,
  PRACTICE_KEYS,
  parseDeckState,
  parseJournalState,
  parsePlanDayDates,
  parseQuizState,
  parseReaderPrefs,
  parseTimerState,
  readSlot,
  writeSlot,
} from "@/lib/practice-store";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PRACTICE_KEYS", () => {
  it("keeps every slot under the hfph.practice namespace", () => {
    for (const key of Object.values(PRACTICE_KEYS)) {
      expect(key.startsWith("hfph.practice.")).toBe(true);
    }
    expect(new Set(Object.values(PRACTICE_KEYS)).size).toBe(6);
  });
});

describe("readSlot / writeSlot", () => {
  it("round-trips a value", () => {
    writeSlot(PRACTICE_KEYS.deck, { cards: { a: { box: 2, due: "2026-08-23" } } });
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toEqual({
      cards: { a: { box: 2, due: "2026-08-23" } },
    });
  });

  it("returns null for a slot that was never written", () => {
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("returns null instead of throwing on invalid JSON", () => {
    localStorage.setItem(PRACTICE_KEYS.deck, "{ not json");
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("returns null instead of throwing when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("swallows a quota error on write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(() => writeSlot(PRACTICE_KEYS.deck, { cards: {} })).not.toThrow();
  });
});

describe("parseQuizState", () => {
  it("keeps good entries and drops broken ones", () => {
    expect(
      parseQuizState({
        questions: {
          good: { box: 3, due: "2026-08-25" },
          badBox: { box: 11, due: "2026-08-25" },
          badDate: { box: 2, due: "someday" },
        },
        routes: {
          "/english": { score: 2, total: 3, taken: "2026-08-21" },
          "/legit": { score: "two", total: 3, taken: "2026-08-21" },
        },
      }),
    ).toEqual({
      questions: { good: { box: 3, due: "2026-08-25" } },
      routes: { "/english": { score: 2, total: 3, taken: "2026-08-21" } },
    });
  });

  it("returns the empty state for anything unusable", () => {
    expect(parseQuizState(null)).toEqual(EMPTY_QUIZ);
    expect(parseQuizState("nope")).toEqual(EMPTY_QUIZ);
    expect(parseQuizState({ questions: 7 })).toEqual(EMPTY_QUIZ);
  });
});

describe("parseJournalState", () => {
  it("keeps entries keyed by an ISO week and drops the rest", () => {
    expect(
      parseJournalState({
        "2026-W34": { text: "Found one client off-board.", updated: "2026-08-21" },
        "week 34": { text: "x", updated: "2026-08-21" },
        "2026-W35": { text: 7, updated: "2026-08-28" },
      }),
    ).toEqual({ "2026-W34": { text: "Found one client off-board.", updated: "2026-08-21" } });
  });
});

describe("parseReaderPrefs", () => {
  it("returns the defaults for anything unusable", () => {
    expect(parseReaderPrefs(undefined)).toEqual(DEFAULT_READER);
    expect(DEFAULT_READER).toEqual({ size: "md", comfort: false, lowData: false });
  });

  it("keeps valid fields and repairs invalid ones", () => {
    expect(parseReaderPrefs({ size: "lg", comfort: true, lowData: "yes" })).toEqual({
      size: "lg",
      comfort: true,
      lowData: false,
    });
    expect(parseReaderPrefs({ size: "enormous" }).size).toBe("md");
  });
});

describe("parsePlanDayDates", () => {
  it("keeps numeric day keys with real dates", () => {
    expect(parsePlanDayDates({ "1": "2026-08-21", "2": "nope", x: "2026-08-21" })).toEqual({
      1: "2026-08-21",
    });
  });
});

describe("parseTimerState", () => {
  it("keeps a well-formed running block", () => {
    const running = {
      shape: "medium",
      phase: "focus",
      endsAt: 1_800_000,
      paused: false,
      remainingMs: 0,
    };
    expect(parseTimerState(running)).toEqual(running);
  });

  it("returns null for a bad phase or a missing field", () => {
    expect(parseTimerState({ shape: "medium", phase: "nap", endsAt: 1, paused: false, remainingMs: 0 })).toBeNull();
    expect(parseTimerState({ shape: "medium" })).toBeNull();
    expect(parseTimerState(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/practice-store.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/practice-store"`.

- [ ] **Step 3: Write `lib/practice-store.ts`**

```ts
/**
 * The practice layer's localStorage namespace (spec §5.2b, §12).
 *
 * Six independent slots under `hfph.practice.*`. Independent because a quota
 * error or a corrupt write in one feature must never cost the visitor their
 * journal, and because the pre-paint reader script (app/layout.tsx) has to
 * parse the reader slot before anything else on the page runs.
 *
 * Every parser is total: it keeps the entries it recognises, drops the ones it
 * does not, and returns the empty value rather than throwing. Nothing here
 * reads or writes outside these six keys, and nothing here touches the
 * `hfph.path.v1` key that `lib/path-context.tsx` owns.
 */

import { isIsoDate, type IsoDate } from "./dates";
import { parseSchedule, type Schedule } from "./leitner";

export const PRACTICE_KEYS = {
  quiz: "hfph.practice.quiz.v1",
  deck: "hfph.practice.deck.v1",
  journal: "hfph.practice.journal.v1",
  reader: "hfph.practice.reader.v1",
  planDays: "hfph.practice.plan-days.v1",
  timer: "hfph.practice.timer.v1",
} as const;

/** `null` means absent, unreadable, or not JSON — all the same to a caller. */
export function readSlot<T>(key: string, parse: (raw: unknown) => T): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return parse(JSON.parse(raw) as unknown);
  } catch {
    // Invalid JSON, private mode, or a blocked-storage SecurityError. A failed
    // read must never break a render.
    return null;
  }
}

export function writeSlot(key: string, value: unknown): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled. Losing the write is acceptable;
    // throwing during an event handler is not.
  }
}

export function clearSlot(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* storage disabled */
  }
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

function scheduleMap(raw: unknown): Record<string, Schedule> {
  if (!isRecord(raw)) return {};
  const out: Record<string, Schedule> = {};
  for (const [id, value] of Object.entries(raw)) {
    const entry = parseSchedule(value);
    if (entry) out[id] = entry;
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Quiz                                                             */
/* ---------------------------------------------------------------- */

export type QuizRun = { score: number; total: number; taken: IsoDate };
export type QuizState = {
  /** Leitner schedule per question id from data/practice.json. */
  questions: Record<string, Schedule>;
  /** The last run of each route's three questions. */
  routes: Record<string, QuizRun>;
};

export const EMPTY_QUIZ: QuizState = { questions: {}, routes: {} };

export function parseQuizState(raw: unknown): QuizState {
  if (!isRecord(raw)) return EMPTY_QUIZ;
  const routes: Record<string, QuizRun> = {};
  if (isRecord(raw.routes)) {
    for (const [route, value] of Object.entries(raw.routes)) {
      if (!isRecord(value)) continue;
      if (typeof value.score !== "number" || typeof value.total !== "number") continue;
      if (!isIsoDate(value.taken)) continue;
      routes[route] = { score: value.score, total: value.total, taken: value.taken };
    }
  }
  return { questions: scheduleMap(raw.questions), routes };
}

/* ---------------------------------------------------------------- */
/*  Decks                                                            */
/* ---------------------------------------------------------------- */

export type DeckState = { cards: Record<string, Schedule> };

export const EMPTY_DECK: DeckState = { cards: {} };

export function parseDeckState(raw: unknown): DeckState {
  if (!isRecord(raw)) return EMPTY_DECK;
  return { cards: scheduleMap(raw.cards) };
}

/* ---------------------------------------------------------------- */
/*  Journal                                                          */
/* ---------------------------------------------------------------- */

export type JournalEntry = { text: string; updated: IsoDate };
export type JournalState = Record<string, JournalEntry>;

export const EMPTY_JOURNAL: JournalState = {};

const ISO_WEEK_KEY = /^\d{4}-W\d{2}$/;

export function parseJournalState(raw: unknown): JournalState {
  if (!isRecord(raw)) return EMPTY_JOURNAL;
  const out: JournalState = {};
  for (const [week, value] of Object.entries(raw)) {
    if (!ISO_WEEK_KEY.test(week) || !isRecord(value)) continue;
    if (typeof value.text !== "string" || !isIsoDate(value.updated)) continue;
    out[week] = { text: value.text, updated: value.updated };
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Reader preferences                                               */
/* ---------------------------------------------------------------- */

export type FontSize = "sm" | "md" | "lg";
export type ReaderPrefs = { size: FontSize; comfort: boolean; lowData: boolean };

export const DEFAULT_READER: ReaderPrefs = { size: "md", comfort: false, lowData: false };

const FONT_SIZES: readonly FontSize[] = ["sm", "md", "lg"];

export function parseReaderPrefs(raw: unknown): ReaderPrefs {
  if (!isRecord(raw)) return DEFAULT_READER;
  return {
    size: FONT_SIZES.includes(raw.size as FontSize) ? (raw.size as FontSize) : DEFAULT_READER.size,
    comfort: raw.comfort === true,
    lowData: raw.lowData === true,
  };
}

/* ---------------------------------------------------------------- */
/*  Plan-day completion dates                                        */
/* ---------------------------------------------------------------- */

/**
 * `lib/path-context.tsx` stores plan-day completion as `Record<number, boolean>`
 * with no dates, and this phase does not change it. The dates live here,
 * written by `usePlanDays()`, so `Streak` has something to count. A day ticked
 * before this map existed simply has no date; the UI says so rather than
 * inventing one.
 */
export type PlanDayDates = Record<number, IsoDate>;

export const EMPTY_PLAN_DAYS: PlanDayDates = {};

export function parsePlanDayDates(raw: unknown): PlanDayDates {
  if (!isRecord(raw)) return EMPTY_PLAN_DAYS;
  const out: PlanDayDates = {};
  for (const [day, value] of Object.entries(raw)) {
    const n = Number(day);
    if (!Number.isInteger(n) || n < 1) continue;
    if (!isIsoDate(value)) continue;
    out[n] = value;
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Study timer                                                      */
/* ---------------------------------------------------------------- */

export type TimerPhase = "focus" | "break";

export type TimerState = {
  shape: string;
  phase: TimerPhase;
  /** Epoch ms when the running block ends. Ignored while `paused`. */
  endsAt: number;
  paused: boolean;
  /** Milliseconds left when the block was paused. */
  remainingMs: number;
} | null;

export const EMPTY_TIMER: TimerState = null;

export function parseTimerState(raw: unknown): TimerState {
  if (!isRecord(raw)) return EMPTY_TIMER;
  if (typeof raw.shape !== "string") return EMPTY_TIMER;
  if (raw.phase !== "focus" && raw.phase !== "break") return EMPTY_TIMER;
  if (typeof raw.endsAt !== "number" || !Number.isFinite(raw.endsAt)) return EMPTY_TIMER;
  if (typeof raw.paused !== "boolean") return EMPTY_TIMER;
  if (typeof raw.remainingMs !== "number" || !Number.isFinite(raw.remainingMs)) return EMPTY_TIMER;
  return {
    shape: raw.shape,
    phase: raw.phase,
    endsAt: raw.endsAt,
    paused: raw.paused,
    remainingMs: raw.remainingMs,
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/practice-store.test.ts`
Expected: PASS — 14 tests, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/practice-store.ts lib/practice-store.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add the hfph.practice storage namespace with total parsers"
```

---

### Task 7: `lib/markdown-export.ts`

**Parallel group:** A

**Files:**
- Create: `lib/markdown-export.ts`, `lib/markdown-export.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export type MarkdownSection = { label: string; body: string }`
  - `export function labToMarkdown(title: string, sections: readonly MarkdownSection[]): string` — `# title`, then `## label` + body for every section whose body has content. Sections with an empty body are dropped, so the file contains only what the visitor wrote.
  - `export function rowsToCsv(header: readonly string[], rows: readonly (readonly string[])[]): string` — RFC 4180, CRLF row endings, no BOM.
  - `export const CSV_BOM = "\uFEFF"` — prepended by `ExportButton` for `kind="csv"` so Excel opens accented text correctly.
  - `export type ExportMime = "text/markdown;charset=utf-8" | "text/calendar;charset=utf-8" | "text/csv;charset=utf-8"`
  - `export function downloadText(filename: string, text: string, mime: ExportMime): void` — Blob + object URL + a synthetic anchor click; the URL is always revoked.
  - `export function safeFilename(value: string, extension: string): string` — lowercase, ASCII, hyphenated, always ends in `.${extension}`.

- [ ] **Step 1: Write the failing test**

Create `lib/markdown-export.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CSV_BOM,
  downloadText,
  labToMarkdown,
  rowsToCsv,
  safeFilename,
} from "@/lib/markdown-export";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("labToMarkdown", () => {
  it("puts the title first and one heading per written section", () => {
    expect(
      labToMarkdown("My resume", [
        { label: "Header", body: "J. Dela Cruz" },
        { label: "Summary", body: "Bookkeeping for small sellers." },
      ]),
    ).toBe(
      "# My resume\n\n## Header\n\nJ. Dela Cruz\n\n## Summary\n\nBookkeeping for small sellers.\n",
    );
  });

  it("drops sections the visitor left empty, so the file is only their words", () => {
    expect(
      labToMarkdown("My resume", [
        { label: "Header", body: "J. Dela Cruz" },
        { label: "Summary", body: "   " },
      ]),
    ).toBe("# My resume\n\n## Header\n\nJ. Dela Cruz\n");
  });

  it("returns just the title when nothing has been written", () => {
    expect(labToMarkdown("My resume", [{ label: "Header", body: "" }])).toBe("# My resume\n");
  });

  it("trims trailing whitespace inside a section but keeps its line breaks", () => {
    expect(labToMarkdown("Notes", [{ label: "Day 1", body: "one\ntwo   " }])).toBe(
      "# Notes\n\n## Day 1\n\none\ntwo\n",
    );
  });
});

describe("rowsToCsv", () => {
  it("writes a header row and CRLF line endings", () => {
    expect(rowsToCsv(["Company", "Role"], [["Acme", "Bookkeeper"]])).toBe(
      "Company,Role\r\nAcme,Bookkeeper",
    );
  });

  it("quotes cells containing a comma, a quote, or a newline", () => {
    expect(rowsToCsv(["Notes"], [['He said "no", twice']])).toBe(
      'Notes\r\n"He said ""no"", twice"',
    );
    expect(rowsToCsv(["Notes"], [["line one\nline two"]])).toBe('Notes\r\n"line one\nline two"');
  });

  it("quotes a cell with leading or trailing spaces so they survive", () => {
    expect(rowsToCsv(["Notes"], [["  padded  "]])).toBe('Notes\r\n"  padded  "');
  });

  it("writes only the header when there are no rows", () => {
    expect(rowsToCsv(["Company"], [])).toBe("Company");
  });

  it("does not include a byte-order mark", () => {
    expect(rowsToCsv(["A"], [["b"]]).startsWith(CSV_BOM)).toBe(false);
  });
});

describe("safeFilename", () => {
  it("lowercases, hyphenates and adds the extension", () => {
    expect(safeFilename("My 30-day Plan", "ics")).toBe("my-30-day-plan.ics");
  });

  it("strips characters a filesystem would reject", () => {
    expect(safeFilename('resume: "final"/v2', "md")).toBe("resume-final-v2.md");
  });

  it("falls back to a usable name when nothing survives", () => {
    expect(safeFilename("///", "md")).toBe("hire-from-ph.md");
  });
});

describe("downloadText", () => {
  it("creates a blob URL, clicks a download anchor, and revokes the URL", () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadText("plan.ics", "BEGIN:VCALENDAR", "text/calendar;charset=utf-8");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/calendar;charset=utf-8");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("revokes the URL even when the click throws", () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL: () => "blob:fake", revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => downloadText("a.md", "x", "text/markdown;charset=utf-8")).toThrow("blocked");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/markdown-export.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/markdown-export"`.

- [ ] **Step 3: Write `lib/markdown-export.ts`**

```ts
/**
 * Client-side file export (spec §7.4.4).
 *
 * THE RULE: export is for what the user wrote; never for anything we wrote.
 * `labToMarkdown` drops every section the visitor left empty for exactly that
 * reason — a downloaded file must not contain our prompts, our examples, or
 * our copy, only their answers. Anything a visitor could rename and pass off
 * as their own work has no business in a download.
 */

export type MarkdownSection = { label: string; body: string };

export function labToMarkdown(
  title: string,
  sections: readonly MarkdownSection[],
): string {
  const written = sections
    .map((section) => ({ label: section.label, body: section.body.trim() }))
    .filter((section) => section.body.length > 0);

  const blocks = [
    `# ${title}`,
    ...written.map((section) => `## ${section.label}\n\n${section.body}`),
  ];

  return `${blocks.join("\n\n")}\n`;
}

export const CSV_BOM = "\uFEFF";

/** RFC 4180: quote when the cell holds a comma, quote, CR, LF, or edge space. */
function csvCell(value: string): string {
  const needsQuotes = /[",\r\n]/.test(value) || value !== value.trim();
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToCsv(
  header: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  return lines.join("\r\n");
}

export type ExportMime =
  | "text/markdown;charset=utf-8"
  | "text/calendar;charset=utf-8"
  | "text/csv;charset=utf-8";

export function safeFilename(value: string, extension: string): string {
  const stem = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${stem || "hire-from-ph"}.${extension}`;
}

export function downloadText(filename: string, text: string, mime: ExportMime): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    // The anchor and the object URL are cleaned up even when a browser policy
    // blocks the click, so a blocked download never leaks memory or DOM.
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/markdown-export.test.ts`
Expected: PASS — 15 tests, 0 failed.

- [ ] **Step 5: Run every group-A suite and type-check**

Run: `npx vitest run lib/ && npx tsc --noEmit`
Expected: PASS across `dates`, `leitner`, `streak`, `ics`, `scenario`, `overlap`, `practice-store`, `markdown-export` (plus the Phase 0–2 `lib` suites); `tsc` silent.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/markdown-export.ts lib/markdown-export.test.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add markdown, CSV and blob-download helpers"
```

---

### Task 8: The data-integrity suite and the practice hooks

**Parallel group:** B (the seam between the pure modules and the components — every group-C task consumes `components/practice/hooks.ts`)

**Files:**
- Create: `lib/practice-data.test.ts`, `components/practice/hooks.ts`, `components/practice/use-practice-due.ts`, `components/practice/hooks.test.tsx`
- Modify: none

**Bundle rule for this task:** `hooks.ts` ends up in the shared client bundle, because `ReaderControls` sits in the footer on every page. It may therefore import only small JSON (`reflection.json`, 1.6 KB) — **never `practice.json` (54 KB) or `decks.json` (30 KB)**. Those two live in `use-practice-due.ts`, which only `/practice` and `Deck` import.

**Interfaces:**
- Consumes: `SCENARIOS`, `validateScenario` from `@/lib/scenario` (Task 4); `REGIONS` from `@/lib/overlap` (Task 5); everything from `@/lib/practice-store` (Task 6); `todayISO`, `isoWeekKey`, `type IsoDate` from `@/lib/dates` (Task 1); `dueCount`, `isDue` from `@/lib/leitner` (Task 1); `usePath` from `@/lib/path-context`; the seven practice JSON files; `node:fs`.
- Produces, from `@/components/practice/hooks`:
  - `export function usePracticeSlot<T>(key: string, empty: T, parse: (raw: unknown) => T): { value: T; set: (updater: T | ((prev: T) => T)) => void; hydrated: boolean }` — SSR-safe: renders `empty` on the server and on the first client pass, reads storage in a mount effect, and writes on every `set`. `parse` **must be a module-level named function**, never an inline arrow, or the effect re-runs on every render.
  - `export function useToday(): IsoDate` — `todayISO()` captured once after mount; `""` before hydration so server and client markup match.
  - (in `@/components/practice/use-practice-due`) `export function usePracticeDue(): { cards: number; questions: number; hydrated: boolean }` — the due counts `/practice` and the deck headers show (spec §5.2b). Separate file so `practice.json` and `decks.json` stay out of the shared bundle.
  - `export function usePlanDays(): { planDays: Record<number, boolean>; dates: PlanDayDates; completedDates: IsoDate[]; undatedCount: number; markPlanDay: (n: number) => void; hydrated: boolean }` — wraps `togglePlanDay` from `usePath()` and records the completion date in the practice store. **It does not modify `lib/path-context.tsx`.**
  - `export function useReaderPrefs(): { prefs: ReaderPrefs; setPrefs: (next: ReaderPrefs) => void; hydrated: boolean }` — also applies the three `<html>` classes whenever `prefs` change.
  - `export function useJournalWeek(): { week: string; prompt: string; entry: JournalEntry | undefined; save: (text: string) => void; hydrated: boolean }`

**What it asserts:** every `practice.json` and `tldr.json` route has an `app<route>/page.tsx`; every `choice` question has exactly one correct option and a `why` on every option; every `reveal` question has an `answer`; question, deck, and card ids are unique; every scenario passes `validateScenario`; every annotated hotspot points at a block that exists and the numbering is dense from 1; every route referenced by a deck, a scenario, an annotated example, a pair, or a glossary term resolves to a real page; `REGIONS` names match `markets.json`; the study-timer minutes match `learning.json`'s pattern strings.

- [ ] **Step 1: Write the suite**

Create `lib/practice-data.test.ts`:

```ts
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import annotated from "@/data/annotated.json";
import decks from "@/data/decks.json";
import glossary from "@/data/glossary.json";
import learning from "@/data/learning.json";
import markets from "@/data/markets.json";
import practice from "@/data/practice.json";
import reflection from "@/data/reflection.json";
import tldr from "@/data/tldr.json";
import { REGIONS } from "@/lib/overlap";
import { SCENARIOS, validateScenario } from "@/lib/scenario";

/** Every route the practice layer points at must be a real App Router page. */
function routeExists(route: string): boolean {
  return existsSync(`app${route}/page.tsx`);
}

type Question = {
  id: string;
  type: string;
  prompt: string;
  options?: { text: string; correct: boolean; why: string }[];
  answer?: string;
  source?: { label: string; url: string };
};

const questions: Question[] = Object.values(practice.routes).flatMap(
  (entry) => entry.questions as Question[],
);

describe("data/practice.json", () => {
  it("covers 18 routes with three questions each", () => {
    const routes = Object.keys(practice.routes);
    expect(routes).toHaveLength(18);
    for (const route of routes) {
      expect(practice.routes[route as keyof typeof practice.routes].questions).toHaveLength(3);
    }
    expect(questions).toHaveLength(54);
  });

  it("points every route at a page that exists", () => {
    for (const route of Object.keys(practice.routes)) {
      expect(routeExists(route), route).toBe(true);
    }
  });

  it("gives every question a unique id", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every choice question exactly one correct option", () => {
    for (const question of questions.filter((q) => q.type === "choice")) {
      const correct = (question.options ?? []).filter((option) => option.correct);
      expect(correct.length, question.id).toBe(1);
    }
  });

  it("explains every option, right or wrong", () => {
    for (const question of questions.filter((q) => q.type === "choice")) {
      expect((question.options ?? []).length, question.id).toBeGreaterThanOrEqual(2);
      for (const option of question.options ?? []) {
        expect(option.why.trim().length, `${question.id}: ${option.text}`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every reveal question an answer and no options", () => {
    for (const question of questions.filter((q) => q.type === "reveal")) {
      expect(question.answer?.trim().length, question.id).toBeGreaterThan(0);
      expect(question.options, question.id).toBeUndefined();
    }
  });

  it("uses only the two authored question types", () => {
    for (const question of questions) {
      expect(["choice", "reveal"], question.id).toContain(question.type);
    }
  });

  it("gives every cited source a real URL", () => {
    for (const question of questions.filter((q) => q.source)) {
      expect(question.source?.url, question.id).toMatch(/^https?:\/\//);
      expect(question.source?.label.trim().length, question.id).toBeGreaterThan(0);
    }
  });
});

describe("data/tldr.json", () => {
  it("covers the same 18 routes as the quizzes", () => {
    expect(Object.keys(tldr.routes).sort()).toEqual(Object.keys(practice.routes).sort());
  });

  it("points every route at a page that exists", () => {
    for (const route of Object.keys(tldr.routes)) {
      expect(routeExists(route), route).toBe(true);
    }
  });

  it("carries a review flag on every entry, so drafts stay labelled", () => {
    for (const [route, entry] of Object.entries(tldr.routes)) {
      expect(typeof entry.reviewed, route).toBe("boolean");
      expect(entry.tl.trim().length, route).toBeGreaterThan(0);
    }
  });
});

describe("data/decks.json", () => {
  it("has four decks with unique ids and unique card ids across all of them", () => {
    expect(decks.decks).toHaveLength(4);
    const deckIds = decks.decks.map((deck) => deck.id);
    expect(new Set(deckIds).size).toBe(deckIds.length);

    const cardIds = decks.decks.flatMap((deck) => deck.cards.map((card) => card.id));
    expect(cardIds).toHaveLength(86);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it("points every deck at the guide it came from", () => {
    for (const deck of decks.decks) {
      expect(routeExists(deck.href), deck.id).toBe(true);
    }
  });

  it("gives every card a front and a back", () => {
    for (const deck of decks.decks) {
      for (const card of deck.cards) {
        expect(card.front.trim().length, card.id).toBeGreaterThan(0);
        expect(card.back.trim().length, card.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("data/scenarios.json", () => {
  it("has four scenarios, each on a route that exists", () => {
    expect(SCENARIOS).toHaveLength(4);
    for (const scenario of SCENARIOS) {
      expect(routeExists(scenario.route), scenario.id).toBe(true);
    }
  });

  it("has no dangling next, unreachable node, dead end, or undebriefed ending", () => {
    for (const scenario of SCENARIOS) {
      expect(validateScenario(scenario), scenario.id).toEqual([]);
    }
  });

  it("names the principle every fork tests", () => {
    for (const scenario of SCENARIOS) {
      for (const [id, node] of Object.entries(scenario.nodes)) {
        for (const choice of node.choices ?? []) {
          expect(choice.tests.trim().length, `${scenario.id}/${id}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("data/annotated.json", () => {
  it("carries the doctrine note that renders above every example", () => {
    expect(annotated.doctrineNote.trim().length).toBeGreaterThan(0);
  });

  it("points every hotspot at a block that exists", () => {
    for (const example of annotated.examples) {
      const blocks = new Set(example.blocks.map((block) => block.id));
      for (const hotspot of example.hotspots) {
        expect(blocks.has(hotspot.block), `${example.id}: ${hotspot.block}`).toBe(true);
      }
    }
  });

  it("numbers hotspots densely from 1 so the reading order has no holes", () => {
    for (const example of annotated.examples) {
      const numbers = example.hotspots.map((hotspot) => hotspot.n).sort((a, b) => a - b);
      expect(numbers, example.id).toEqual(
        Array.from({ length: numbers.length }, (_, index) => index + 1),
      );
    }
  });

  it("gives every hotspot a why and a rule", () => {
    for (const example of annotated.examples) {
      for (const hotspot of example.hotspots) {
        expect(hotspot.why.trim().length, `${example.id}#${hotspot.n}`).toBeGreaterThan(0);
        expect(hotspot.rule.trim().length, `${example.id}#${hotspot.n}`).toBeGreaterThan(0);
      }
    }
  });

  it("points every example and pair at a page that exists", () => {
    for (const example of annotated.examples) expect(routeExists(example.route), example.id).toBe(true);
    for (const pair of annotated.pairs) expect(routeExists(pair.route), pair.id).toBe(true);
  });

  it("quotes every change from the before text and into the after text", () => {
    for (const pair of annotated.pairs) {
      for (const change of pair.changes) {
        expect(pair.before, `${pair.id}: ${change.from}`).toContain(change.from);
        expect(pair.after, `${pair.id}: ${change.to}`).toContain(change.to);
      }
    }
  });
});

describe("data/glossary.json", () => {
  it("has 50 terms with unique ids", () => {
    expect(glossary.terms).toHaveLength(50);
    const ids = glossary.terms.map((term) => term.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every href to a page that exists", () => {
    for (const term of glossary.terms) {
      if (!term.href) continue;
      expect(routeExists(term.href), term.id).toBe(true);
    }
  });

  it("gives every term a definition", () => {
    for (const term of glossary.terms) {
      expect(term.definition.trim().length, term.id).toBeGreaterThan(0);
    }
  });
});

describe("data/reflection.json", () => {
  it("has twelve prompts numbered 1 to 12", () => {
    expect(reflection.prompts).toHaveLength(12);
    expect(reflection.prompts.map((prompt) => prompt.week)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
  });
});

describe("lib/overlap regions", () => {
  it("names the same six regions as the markets guide, in the same order", () => {
    expect(REGIONS.map((region) => region.name)).toEqual(
      markets.regions.items.map((item) => item.name),
    );
  });
});

describe("study-timer session shapes", () => {
  it("keeps the hard-coded minutes in step with learning.json", () => {
    const expected: Record<string, [number, number]> = {
      short: [15, 3],
      medium: [25, 5],
      long: [50, 10],
    };
    for (const [id, [focus, rest]] of Object.entries(expected)) {
      const shape = learning.protocolRules.sessionShapes[
        id as keyof typeof learning.protocolRules.sessionShapes
      ];
      expect(shape.pattern, id).toBe(`${focus} min focus / ${rest} min break`);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it pass**

Run: `npx vitest run lib/practice-data.test.ts`
Expected: PASS — 26 tests, 0 failed. **If anything fails, read the data file before touching it.** Every one of these assertions was checked against the authored JSON while this plan was written; a failure means either the check drifted from the shape or an earlier phase edited a data file it should not have.

- [ ] **Step 3: Prove the suite actually bites**

Temporarily break one thing and confirm the suite catches it:

```bash
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('data/practice.json','utf8'));p.routes['/start'].questions[0].options[1].correct=true;fs.writeFileSync('data/practice.json.bak',fs.readFileSync('data/practice.json'));fs.writeFileSync('data/practice.json',JSON.stringify(p,null,2))"
npx vitest run lib/practice-data.test.ts
```
Expected: FAIL — `gives every choice question exactly one correct option … start-1`.

Restore it:
```bash
mv data/practice.json.bak data/practice.json
npx vitest run lib/practice-data.test.ts
```
Expected: PASS again. Confirm `git status --short data/` is clean before moving on.

- [ ] **Step 4: Write the failing hooks test**

Create `components/practice/hooks.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS, parseDeckState, EMPTY_DECK } from "@/lib/practice-store";
import { usePracticeSlot, useJournalWeek, useReaderPrefs } from "@/components/practice/hooks";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

function SlotHarness() {
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);
  return (
    <div>
      <p data-testid="hydrated">{String(hydrated)}</p>
      <p data-testid="count">{Object.keys(value.cards).length}</p>
      <button
        type="button"
        onClick={() => set((prev) => ({ cards: { ...prev.cards, a: { box: 2, due: "2026-08-23" } } }))}
      >
        Record a card
      </button>
    </div>
  );
}

describe("usePracticeSlot", () => {
  it("hydrates from storage after mount", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.deck,
      JSON.stringify({ cards: { a: { box: 3, due: "2026-08-25" } } }),
    );
    render(<SlotHarness />);
    expect(await screen.findByText("true")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("writes through to storage on set", async () => {
    const user = userEvent.setup();
    render(<SlotHarness />);
    await screen.findByText("true");
    await user.click(screen.getByRole("button", { name: "Record a card" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}")).toEqual({
      cards: { a: { box: 2, due: "2026-08-23" } },
    });
  });

  it("starts from the empty value when the slot holds rubbish", async () => {
    localStorage.setItem(PRACTICE_KEYS.deck, "{{{");
    render(<SlotHarness />);
    expect(await screen.findByText("true")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});

function ReaderHarness() {
  const { prefs, setPrefs } = useReaderPrefs();
  return (
    <button type="button" onClick={() => setPrefs({ ...prefs, size: "lg", lowData: true })}>
      Go large
    </button>
  );
}

describe("useReaderPrefs", () => {
  it("puts the stored classes on <html> and keeps them in step with changes", async () => {
    const user = userEvent.setup();
    render(<ReaderHarness />);
    await user.click(screen.getByRole("button", { name: "Go large" }));

    const html = document.documentElement;
    expect(html.classList.contains("text-size-lg")).toBe(true);
    expect(html.classList.contains("text-size-md")).toBe(false);
    expect(html.classList.contains("low-data")).toBe(true);
    expect(html.classList.contains("reading-comfort")).toBe(false);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.reader) ?? "{}")).toEqual({
      size: "lg",
      comfort: false,
      lowData: true,
    });
  });
});

function JournalHarness() {
  const { week, prompt, entry, save } = useJournalWeek();
  return (
    <div>
      <p data-testid="week">{week}</p>
      <p data-testid="prompt">{prompt}</p>
      <p data-testid="entry">{entry?.text ?? ""}</p>
      <button type="button" onClick={() => save("One client found off-board.")}>
        Save
      </button>
    </div>
  );
}

describe("useJournalWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("rotates the twelve prompts by ISO week and stores one entry per week", async () => {
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // Friday, 2026-W34
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<JournalHarness />);

    expect(await screen.findByTestId("week")).toHaveTextContent("2026-W34");
    // (34 - 1) % 12 === 9 → the tenth prompt.
    expect(screen.getByTestId("prompt")).toHaveTextContent(/should have been an SOP/);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByTestId("entry")).toHaveTextContent("One client found off-board.");
    expect(Object.keys(JSON.parse(localStorage.getItem(PRACTICE_KEYS.journal) ?? "{}"))).toEqual([
      "2026-W34",
    ]);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 5: Run it and watch it fail**

Run: `npx vitest run components/practice/hooks.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/hooks"`.

- [ ] **Step 6: Write `components/practice/hooks.ts`**

```ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import reflectionData from "@/data/reflection.json";
import { isoWeekKey, todayISO, type IsoDate } from "@/lib/dates";
import { usePath } from "@/lib/path-context";
import {
  DEFAULT_READER,
  EMPTY_JOURNAL,
  EMPTY_PLAN_DAYS,
  PRACTICE_KEYS,
  parseJournalState,
  parsePlanDayDates,
  parseReaderPrefs,
  readSlot,
  writeSlot,
  type JournalEntry,
  type PlanDayDates,
  type ReaderPrefs,
} from "@/lib/practice-store";

/**
 * One localStorage slot as React state.
 *
 * The server and the first client pass both render `empty`, so the markup
 * matches and hydration is clean; the mount effect then swaps in whatever is
 * stored. `parse` must be a module-level function — an inline arrow would
 * change identity on every render and re-run the effect forever.
 */
export function usePracticeSlot<T>(
  key: string,
  empty: T,
  parse: (raw: unknown) => T,
): { value: T; set: (updater: T | ((prev: T) => T)) => void; hydrated: boolean } {
  const [value, setValue] = useState<T>(empty);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef<T>(empty);

  useEffect(() => {
    const stored = readSlot(key, parse);
    if (stored !== null) {
      latest.current = stored;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(stored);
    }
    setHydrated(true);
  }, [key, parse]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const next =
        typeof updater === "function" ? (updater as (prev: T) => T)(latest.current) : updater;
      latest.current = next;
      setValue(next);
      writeSlot(key, next);
    },
    [key],
  );

  return { value, set, hydrated };
}

/** Today's date, read once after mount. `""` on the server so markup matches. */
export function useToday(): IsoDate {
  const [today, setToday] = useState<IsoDate>("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(todayISO());
  }, []);
  return today;
}

/**
 * Plan-day completion with dates.
 *
 * `lib/path-context.tsx` owns whether a day is done; this hook owns *when* it
 * was done, in its own storage slot. `markPlanDay` calls the context's
 * `togglePlanDay` unchanged and records or clears the date alongside it, so
 * nothing about the existing plan state or its storage key moves.
 */
export function usePlanDays(): {
  planDays: Record<number, boolean>;
  dates: PlanDayDates;
  completedDates: IsoDate[];
  undatedCount: number;
  markPlanDay: (n: number) => void;
  hydrated: boolean;
} {
  const { state, hydrated: pathHydrated, togglePlanDay } = usePath();
  const today = useToday();
  const { value: dates, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.planDays,
    EMPTY_PLAN_DAYS,
    parsePlanDayDates,
  );

  const markPlanDay = useCallback(
    (n: number) => {
      const wasDone = state.planDays[n] === true;
      togglePlanDay(n);
      set((prev) => {
        const next = { ...prev };
        if (wasDone) delete next[n];
        else next[n] = todayISO();
        return next;
      });
    },
    [state.planDays, togglePlanDay, set],
  );

  const done = useMemo(
    () =>
      Object.entries(state.planDays)
        .filter(([, isDone]) => isDone)
        .map(([day]) => Number(day)),
    [state.planDays],
  );

  const completedDates = useMemo(
    () => done.map((day) => dates[day]).filter((date): date is IsoDate => Boolean(date)),
    [done, dates],
  );

  return {
    planDays: state.planDays,
    dates,
    completedDates,
    // Days ticked before this map existed. The UI says so rather than
    // inventing a date for them.
    undatedCount: done.length - completedDates.length,
    markPlanDay,
    hydrated: hydrated && pathHydrated && today !== "",
  };
}

const READER_CLASSES = ["text-size-sm", "text-size-md", "text-size-lg"] as const;

function applyReaderClasses(prefs: ReaderPrefs): void {
  const html = document.documentElement;
  for (const className of READER_CLASSES) html.classList.remove(className);
  html.classList.add(`text-size-${prefs.size}`);
  html.classList.toggle("reading-comfort", prefs.comfort);
  html.classList.toggle("low-data", prefs.lowData);
}

/**
 * Reader preferences plus the three `<html>` classes they drive. The pre-paint
 * script in `app/layout.tsx` sets the same classes before React runs; this
 * hook is what keeps them in step afterwards.
 */
export function useReaderPrefs(): {
  prefs: ReaderPrefs;
  setPrefs: (next: ReaderPrefs) => void;
  hydrated: boolean;
} {
  const { value, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.reader,
    DEFAULT_READER,
    parseReaderPrefs,
  );

  const setPrefs = useCallback(
    (next: ReaderPrefs) => {
      set(next);
      applyReaderClasses(next);
    },
    [set],
  );

  return { prefs: value, setPrefs, hydrated };
}

const PROMPTS = reflectionData.prompts;

/** One prompt per ISO week, rotating through the twelve (spec §7.4.5). */
export function useJournalWeek(): {
  week: string;
  prompt: string;
  entry: JournalEntry | undefined;
  save: (text: string) => void;
  hydrated: boolean;
} {
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.journal,
    EMPTY_JOURNAL,
    parseJournalState,
  );

  const week = today === "" ? "" : isoWeekKey(today);
  const index = today === "" ? 0 : (Number(week.slice(-2)) - 1) % PROMPTS.length;

  const save = useCallback(
    (text: string) => {
      if (today === "") return;
      set((prev) => ({ ...prev, [isoWeekKey(today)]: { text, updated: today } }));
    },
    [set, today],
  );

  return {
    week,
    prompt: PROMPTS[index].prompt,
    entry: week === "" ? undefined : value[week],
    save,
    hydrated: hydrated && today !== "",
  };
}
```

- [ ] **Step 7: Write `components/practice/use-practice-due.ts`**

This is a separate module on purpose: it is the only client file allowed to import `practice.json` and `decks.json`, so those 84 KB stay out of the shared bundle that `ReaderControls` drags into every page.

```ts
"use client";

import { useMemo } from "react";
import decksData from "@/data/decks.json";
import practiceData from "@/data/practice.json";
import { isDue } from "@/lib/leitner";
import {
  EMPTY_DECK,
  EMPTY_QUIZ,
  PRACTICE_KEYS,
  parseDeckState,
  parseQuizState,
} from "@/lib/practice-store";
import { usePracticeSlot, useToday } from "./hooks";

const ALL_CARD_IDS = decksData.decks.flatMap((deck) => deck.cards.map((card) => card.id));
const ALL_QUESTION_IDS = Object.values(practiceData.routes).flatMap((entry) =>
  entry.questions.map((question) => question.id),
);

/** Due counts for `/practice` and the deck headers (spec §5.2b). */
export function usePracticeDue(): { cards: number; questions: number; hydrated: boolean } {
  const today = useToday();
  const deck = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);
  const quiz = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);
  const hydrated = deck.hydrated && quiz.hydrated && today !== "";
  const cards = deck.value.cards;
  const questions = quiz.value.questions;

  return useMemo(() => {
    if (!hydrated) return { cards: 0, questions: 0, hydrated: false };
    return {
      cards: ALL_CARD_IDS.filter((id) => isDue(cards[id], today)).length,
      questions: ALL_QUESTION_IDS.filter((id) => isDue(questions[id], today)).length,
      hydrated: true,
    };
  }, [hydrated, cards, questions, today]);
}
```

- [ ] **Step 8: Run the hooks test and watch it pass**

Run: `npx vitest run components/practice/hooks.test.tsx`
Expected: PASS — 6 tests, 0 failed.

If the journal test fails on the prompt text, print what week the harness computed and check it against `reflection.json`: `(week - 1) % 12` for 2026-W34 is index 9, which is `"What did you do twice this week that should have been an SOP or an automation?"`.

- [ ] **Step 9: Type-check**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 10: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/practice-data.test.ts components/practice/hooks.ts components/practice/use-practice-due.ts components/practice/hooks.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add the practice hooks and the data-integrity suite"
```

---

### Task 9: `Quiz`, `PracticeFooter` and `Tldr`

**Parallel group:** C

**Files:**
- Create: `components/practice/quiz.tsx`, `components/practice/quiz-runner.tsx`, `components/practice/quiz-runner.test.tsx`, `components/practice/practice-footer.tsx`, `components/practice/tldr.tsx`
- Modify: none

**Interfaces:**
- Consumes: `Badge`, `Button`, `Heading`, `Icon`, `Kicker`, `ProgressBar`, `Source`, `Text`, `Accordion`, `AccordionItem` from `@/components/ui`; `Section` from `@/components/layout`; `ACCENT` from `@/lib/accent`; `cn` from `@/lib/utils`; `formatIsoDate` from `@/lib/dates`; `nextDue`, `schedule`, `type Schedule` from `@/lib/leitner`; `EMPTY_QUIZ`, `PRACTICE_KEYS`, `parseQuizState` from `@/lib/practice-store`; `usePracticeSlot`, `useToday` from `./hooks`.
- Produces:
  - `export type QuizOption = { text: string; correct: boolean; why: string }`
  - `export type QuizQuestion = { id: string; type: "choice" | "reveal"; prompt: string; options?: QuizOption[]; answer?: string; source?: { label: string; url: string } }` — declared in `quiz-runner.tsx`, re-used by `quiz.tsx`.
  - `export function getQuestions(route: string): QuizQuestion[]` — from `quiz.tsx` (server); `[]` for an unknown route.
  - `export function Quiz({ route }: { route: string })` — server; renders `null` when the route has no questions.
  - `export function QuizRunner({ route, questions }: { route: string; questions: QuizQuestion[] })` — client.
  - `export function PracticeFooter({ route }: { route: string })` — server; the tinted `Section` a guide page renders directly above `PageFooterNav`.
  - `export function Tldr({ route }: { route: string })` — server; renders `null` when the route has no TL;DR.

**Why `Quiz` is split:** `data/practice.json` is 54 KB. A client `Quiz` would bundle all of it into every one of the 18 guide pages. The server half reads the three questions the page needs and passes about 2 KB across the boundary. `Tldr` is server for the same reason — it hands two strings to the client `Accordion` instead of shipping `tldr.json`.

- [ ] **Step 1: Write the failing test**

Create `components/practice/quiz-runner.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { QuizRunner, type QuizQuestion } from "@/components/practice/quiz-runner";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    type: "choice",
    prompt: "What proves you can do the work?",
    options: [
      { text: "One finished micro-task", correct: true, why: "It ends as a piece you can send today." },
      { text: "A certificate", correct: false, why: "A receipt that says you attended." },
    ],
  },
  {
    id: "q2",
    type: "reveal",
    prompt: "Think first: what is the requirement?",
    answer: "A working setup and the habit of finishing something real.",
    source: { label: "PSA Labour Force Survey", url: "https://psa.gov.ph/statistics/labor-force-survey" },
  },
  {
    id: "q3",
    type: "choice",
    prompt: "When does a favour become a job?",
    options: [
      { text: "When it is outside the agreed scope", correct: true, why: "Scope is the line." },
      { text: "When it takes over an hour", correct: false, why: "Time is not the test." },
    ],
  },
];

describe("QuizRunner", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // 2026-08-21
  });

  function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<QuizRunner route="/start" questions={QUESTIONS} />);
    return user;
  }

  it("shows one question at a time, starting at the first", () => {
    setup();
    expect(screen.getByText("What proves you can do the work?")).toBeInTheDocument();
    expect(screen.queryByText("When does a favour become a job?")).toBeNull();
  });

  it("hides every explanation until an option is chosen", () => {
    setup();
    expect(screen.queryByText("It ends as a piece you can send today.")).toBeNull();
  });

  it("reveals the explanation on every option once one is chosen", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    expect(screen.getByText("It ends as a piece you can send today.")).toBeInTheDocument();
    expect(screen.getByText("A receipt that says you attended.")).toBeInTheDocument();
  });

  it("announces the outcome once, in a status region", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    expect(screen.getByRole("status")).toHaveTextContent(/Not this one/i);
  });

  it("locks the options after an answer so the score cannot be farmed", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    expect(screen.getByRole("button", { name: /One finished micro-task/ })).toBeDisabled();
  });

  it("makes a reveal question think first, then self-grade", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.queryByText(/A working setup and the habit/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    expect(screen.getByText(/A working setup and the habit/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I had it" })).toBeInTheDocument();
  });

  it("shows the question's source when it has one", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByRole("link", { name: "PSA Labour Force Survey" })).toHaveAttribute(
      "href",
      "https://psa.gov.ph/statistics/labor-force-survey",
    );
  });

  it("reports the score and the next review date when all three are answered", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I had it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));

    const summary = screen.getByTestId("quiz-summary");
    expect(within(summary).getByText(/3 of 3/)).toBeInTheDocument();
    // Three correct answers put every question in box 2, which is two days out.
    expect(within(summary).getByText(/23 Aug 2026/)).toBeInTheDocument();
  });

  it("writes a Leitner schedule per question and one run per route", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I missed it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.quiz) ?? "{}");
    expect(stored.questions.q1).toEqual({ box: 1, due: "2026-08-22" });
    expect(stored.questions.q3).toEqual({ box: 2, due: "2026-08-23" });
    expect(stored.routes["/start"]).toEqual({ score: 1, total: 3, taken: "2026-08-21" });
  });

  it("lets the visitor run it again without wiping the schedule", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I had it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));
    await user.click(screen.getByRole("button", { name: "Run it again" }));

    expect(screen.getByText("What proves you can do the work?")).toBeInTheDocument();
    expect(screen.queryByTestId("quiz-summary")).toBeNull();
    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.quiz) ?? "{}");
    expect(Object.keys(stored.questions)).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/practice/quiz-runner.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/quiz-runner"`.

- [ ] **Step 3: Write `components/practice/quiz-runner.tsx`**

```tsx
"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ACCENT } from "@/lib/accent";
import { formatIsoDate } from "@/lib/dates";
import { nextDue, schedule, type Schedule } from "@/lib/leitner";
import { EMPTY_QUIZ, PRACTICE_KEYS, parseQuizState } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Button, Heading, Icon, Kicker, ProgressBar, Source, Text } from "@/components/ui";
import { usePracticeSlot, useToday } from "./hooks";

export type QuizOption = { text: string; correct: boolean; why: string };

export type QuizQuestion = {
  id: string;
  type: "choice" | "reveal";
  prompt: string;
  options?: QuizOption[];
  answer?: string;
  source?: { label: string; url: string };
};

export function QuizRunner({
  route,
  questions,
}: {
  route: string;
  questions: QuizQuestion[];
}) {
  const baseId = useId();
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);

  const [index, setIndex] = useState(0);
  /** questionId -> answered from memory. */
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answersRef = useRef<Record<string, boolean>>({});
  /** choice questions: which option index was clicked. */
  const [picked, setPicked] = useState<Record<string, number>>({});
  /** reveal questions: has the answer been shown yet. */
  const [shown, setShown] = useState<Record<string, boolean>>({});

  const record = useCallback(
    (question: QuizQuestion, correct: boolean) => {
      const next = { ...answersRef.current, [question.id]: correct };
      answersRef.current = next;
      setAnswers(next);
      if (today === "") return;

      const complete = questions.every((candidate) => candidate.id in next);
      const score = questions.filter((candidate) => next[candidate.id]).length;

      set((prev) => ({
        questions: {
          ...prev.questions,
          [question.id]: schedule(prev.questions[question.id], correct, today),
        },
        routes: complete
          ? { ...prev.routes, [route]: { score, total: questions.length, taken: today } }
          : prev.routes,
      }));
    },
    [questions, route, set, today],
  );

  const reset = useCallback(() => {
    answersRef.current = {};
    setAnswers({});
    setPicked({});
    setShown({});
    setIndex(0);
  }, []);

  const current = questions[Math.min(index, questions.length - 1)];
  const answered = current.id in answers;
  const answeredCount = Object.keys(answers).length;
  const finished = questions.every((question) => question.id in answers);
  const score = questions.filter((question) => answers[question.id]).length;
  const isLast = index === questions.length - 1;

  const schedules = questions
    .map((question) => value.questions[question.id])
    .filter((entry): entry is Schedule => Boolean(entry));
  const due = nextDue(schedules);

  const promptId = `${baseId}-prompt`;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-3">
        <Kicker>Retrieval practice</Kicker>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          Check yourself
        </Heading>
        <Text>
          Three questions on this page. Pulling an answer out of your head is what makes it stay
          there.
        </Text>
      </div>

      <ProgressBar
        value={answeredCount}
        max={questions.length}
        label={`Question ${index + 1} of ${questions.length}`}
        showValue
      />

      <Text id={promptId} size="lead" tone="ink">
        {current.prompt}
      </Text>

      {current.type === "choice" ? (
        <div role="group" aria-labelledby={promptId} className="flex flex-col gap-3">
          {(current.options ?? []).map((option, optionIndex) => {
            const chosen = picked[current.id] === optionIndex;
            return (
              // A raw <button> rather than the Button primitive: an option row is
              // a full-width answer card whose border carries the verdict, which
              // none of Button's five variants can express.
              <button
                key={option.text}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked((prev) => ({ ...prev, [current.id]: optionIndex }));
                  record(current, option.correct);
                }}
                className={cn(
                  "rounded-md border p-4 text-left transition-colors duration-150 ease-out",
                  !answered && "border-line-strong hover:border-ink hover:bg-band",
                  answered && option.correct && ACCENT.verified.soft,
                  answered && !option.correct && chosen && ACCENT.coral.soft,
                  answered && !option.correct && !chosen && "border-line",
                )}
              >
                <span className="flex items-start gap-3">
                  {answered && (option.correct || chosen) && (
                    <Icon
                      name={option.correct ? "check-circle-2" : "shield-alert"}
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-medium text-ink">{option.text}</span>
                    {answered && <span className="text-small text-ink-soft">{option.why}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!shown[current.id] ? (
            <div>
              <Button
                variant="outline"
                onClick={() => setShown((prev) => ({ ...prev, [current.id]: true }))}
              >
                Show the answer
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-line bg-band p-4">
                <Text tone="ink">{current.answer}</Text>
              </div>
              {!answered && (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => record(current, true)}>
                    I had it
                  </Button>
                  <Button variant="ghost" onClick={() => record(current, false)}>
                    I missed it
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p role="status" className="text-small text-ink-soft">
        {answered
          ? answers[current.id]
            ? "Right. Next one."
            : "Not this one. The answer above says why."
          : ""}
      </p>

      {current.source && <Source label={current.source.label} url={current.source.url} />}

      {answered && !isLast && (
        <div>
          <Button variant="secondary" onClick={() => setIndex(index + 1)}>
            Next question
          </Button>
        </div>
      )}

      {finished && (
        <div data-testid="quiz-summary" className="flex flex-col gap-3 border-t border-line pt-6">
          <Text tone="ink">
            <strong className="font-semibold">
              {score} of {questions.length}
            </strong>{" "}
            answered from memory.
          </Text>
          {hydrated && due && <Text size="small">These come back on {formatIsoDate(due)}.</Text>}
          <div className="flex flex-wrap gap-3">
            <Button href="/practice" variant="secondary">
              See what is due
            </Button>
            <Button variant="ghost" onClick={reset}>
              Run it again
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run components/practice/quiz-runner.test.tsx`
Expected: PASS — 10 tests, 0 failed.

- [ ] **Step 5: Write `components/practice/quiz.tsx` (server)**

```tsx
import practiceData from "@/data/practice.json";
import { QuizRunner, type QuizQuestion } from "./quiz-runner";

const ROUTES = practiceData.routes as Record<string, { questions: QuizQuestion[] } | undefined>;

/** The three questions authored for a route. `[]` for anything unknown. */
export function getQuestions(route: string): QuizQuestion[] {
  return ROUTES[route]?.questions ?? [];
}

/**
 * Server half of the quiz. `data/practice.json` is 54 KB; reading it here and
 * handing the runner only this route's three questions keeps the other 52 KB
 * off the client.
 */
export function Quiz({ route }: { route: string }) {
  const questions = getQuestions(route);
  if (questions.length === 0) return null;
  return <QuizRunner route={route} questions={questions} />;
}
```

- [ ] **Step 6: Write `components/practice/practice-footer.tsx` (server)**

```tsx
import { Section } from "@/components/layout";
import { Quiz, getQuestions } from "./quiz";

/**
 * The block every guide and stage page renders directly above
 * `PageFooterNav` (spec §5.2b). One line per page, nothing to configure.
 */
export function PracticeFooter({ route }: { route: string }) {
  if (getQuestions(route).length === 0) return null;
  return (
    <Section band="tint" size="narrow">
      <Quiz route={route} />
    </Section>
  );
}
```

- [ ] **Step 7: Write `components/practice/tldr.tsx` (server)**

```tsx
import tldrData from "@/data/tldr.json";
import { Accordion, AccordionItem, Badge, Text } from "@/components/ui";

type TldrEntry = { tl: string; reviewed: boolean };

const ROUTES = tldrData.routes as Record<string, TldrEntry | undefined>;

/**
 * "TL;DR sa Tagalog", collapsed by default (spec §7.4.7).
 *
 * The drafts were written in this project and are flagged for native-speaker
 * review. Until `reviewed` flips to true the block says so on its face: a
 * translation nobody has checked is the same kind of unbacked claim the
 * honesty doctrine exists to stop.
 */
export function Tldr({ route }: { route: string }) {
  const entry = ROUTES[route];
  if (!entry) return null;

  const id = `tldr-${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

  return (
    <Accordion type="single">
      <AccordionItem
        id={id}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span>TL;DR sa Tagalog</span>
            {!entry.reviewed && (
              <Badge tone="caution" variant="outline">
                Draft translation
              </Badge>
            )}
          </span>
        }
      >
        <div className="flex flex-col gap-3">
          <Text tone="ink">{entry.tl}</Text>
          {!entry.reviewed && (
            <Text size="caption" tone="faint">
              A native speaker has not checked this yet. Read the English above if anything here
              reads wrong.
            </Text>
          )}
        </div>
      </AccordionItem>
    </Accordion>
  );
}
```

- [ ] **Step 8: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint components/practice`
Expected: no output from either.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/practice/quiz.tsx components/practice/quiz-runner.tsx components/practice/quiz-runner.test.tsx components/practice/practice-footer.tsx components/practice/tldr.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add the retrieval quiz, its footer wrapper and the Tagalog TL;DR block"
```

---

### Task 10: `Deck`

**Parallel group:** C

**Files:**
- Create: `components/practice/deck.tsx`, `components/practice/deck.test.tsx`
- Modify: none

**Interfaces:**
- Consumes: `Badge`, `Button`, `Heading`, `Icon`, `ProgressBar`, `Source`, `Text` from `@/components/ui`; `formatIsoDate` from `@/lib/dates`; `isDue`, `schedule` from `@/lib/leitner`; `EMPTY_DECK`, `PRACTICE_KEYS`, `parseDeckState` from `@/lib/practice-store`; `usePracticeSlot`, `useToday` from `./hooks`; `data/decks.json`.
- Produces:
  - `export type DeckCard = { id: string; front: string; back: string; source?: { label: string; url: string } }`
  - `export type DeckData = { id: string; title: string; blurb: string; href: string; cards: DeckCard[] }`
  - `export const DECKS: DeckData[]`; `export function getDeck(id: string): DeckData | undefined`
  - `export function Deck({ deckId }: { deckId: string })` — client; renders `null` for an unknown id.

**Session rule:** a session is the cards due today, fixed when the session starts. When nothing is due, the deck says so and offers the whole deck as a free review — it never silently reschedules cards that are not due, because the gap is the part that does the work.

- [ ] **Step 1: Write the failing test**

Create `components/practice/deck.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import decksData from "@/data/decks.json";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { Deck } from "@/components/practice/deck";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Deck", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // 2026-08-21
  });

  function setup(deckId = "interview-questions") {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Deck deckId={deckId} />);
    return user;
  }

  it("renders nothing for a deck that does not exist", () => {
    const { container } = render(<Deck deckId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the front first and hides the back", async () => {
    setup();
    expect(await screen.findByTestId("deck-front")).toBeInTheDocument();
    expect(screen.queryByTestId("deck-back")).toBeNull();
  });

  it("flips to the back and offers the two verdicts", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: "Show the back" }));
    expect(screen.getByTestId("deck-back")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not yet" })).toBeInTheDocument();
  });

  it("promotes a card the visitor got and moves on", async () => {
    const user = setup();
    const first = (await screen.findByTestId("deck-front")).textContent;
    await user.click(screen.getByRole("button", { name: "Show the back" }));
    await user.click(screen.getByRole("button", { name: "Got it" }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}");
    expect(Object.values(stored.cards)[0]).toEqual({ box: 2, due: "2026-08-23" });
    expect(screen.getByTestId("deck-front").textContent).not.toBe(first);
  });

  it("sends a missed card back to box 1", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: "Show the back" }));
    await user.click(screen.getByRole("button", { name: "Not yet" }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}");
    expect(Object.values(stored.cards)[0]).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("says when nothing is due and offers a free review instead", async () => {
    const parked = decksData.decks.find((deck) => deck.id === "red-flags");
    if (!parked) throw new Error("red-flags deck missing");
    localStorage.setItem(
      PRACTICE_KEYS.deck,
      JSON.stringify({
        cards: Object.fromEntries(
          parked.cards.map((card) => [card.id, { box: 5, due: "2027-01-01" }]),
        ),
      }),
    );

    setup("red-flags");
    expect(await screen.findByText(/Nothing is due in this deck today/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review the whole deck anyway" })).toBeInTheDocument();
  });

  it("links back to the guide the deck came from", async () => {
    setup();
    expect(await screen.findByRole("link", { name: /Open the guide/i })).toHaveAttribute(
      "href",
      "/interview",
    );
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/practice/deck.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/deck"`.

- [ ] **Step 3: Write `components/practice/deck.tsx`**

```tsx
"use client";

import { useCallback, useId, useMemo, useState } from "react";
import decksData from "@/data/decks.json";
import { formatIsoDate } from "@/lib/dates";
import { isDue, schedule } from "@/lib/leitner";
import { EMPTY_DECK, PRACTICE_KEYS, parseDeckState } from "@/lib/practice-store";
import { Badge, Button, Heading, Icon, ProgressBar, Source, Text } from "@/components/ui";
import { usePracticeSlot, useToday } from "./hooks";

export type DeckCard = {
  id: string;
  front: string;
  back: string;
  source?: { label: string; url: string };
};

export type DeckData = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  cards: DeckCard[];
};

export const DECKS = decksData.decks as DeckData[];

export function getDeck(id: string): DeckData | undefined {
  return DECKS.find((deck) => deck.id === id);
}

export function Deck({ deckId }: { deckId: string }) {
  const baseId = useId();
  const deck = getDeck(deckId);
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);

  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewAll, setReviewAll] = useState(false);
  const [done, setDone] = useState(0);

  const cards = deck?.cards;
  const ready = hydrated && today !== "";

  /**
   * The queue is built once per session. Recomputing it after every verdict
   * would pull a card the visitor just demoted straight back to the front,
   * which is the opposite of spacing.
   */
  const session = useMemo(() => {
    if (!ready || !cards) return [];
    const due = cards.filter((card) => isDue(scheduleRef.current[card.id], today));
    if (due.length > 0) return due;
    return reviewAll ? cards : [];
    // `value.cards` is read through a ref on purpose — see the comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cards, reviewAll, today]);

  const answer = useCallback(
    (card: DeckCard, correct: boolean) => {
      if (today !== "") {
        set((prev) => ({
          cards: { ...prev.cards, [card.id]: schedule(prev.cards[card.id], correct, today) },
        }));
      }
      setFlipped(false);
      setDone((count) => count + 1);
      setPosition((index) => index + 1);
    },
    [set, today],
  );

  if (!deck) return null;

  const card = session[position];
  const finished = ready && session.length > 0 && position >= session.length;
  const nothingDue = ready && session.length === 0;
  const nextUp = deck.cards
    .map((entry) => value.cards[entry.id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => (a.due < b.due ? -1 : 1))[0];

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={3} size="h4" id={`${baseId}-title`}>
            {deck.title}
          </Heading>
          <Text size="small">{deck.blurb}</Text>
        </div>
        <Badge tone={session.length > 0 ? "signal" : "neutral"}>
          {ready ? `${session.length} in this session` : `${deck.cards.length} cards`}
        </Badge>
      </div>

      {nothingDue && (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-line-strong bg-band p-5">
          <Text size="small">
            Nothing is due in this deck today. Spacing only works if you let the gap happen.
          </Text>
          <Button variant="outline" size="sm" onClick={() => setReviewAll(true)}>
            Review the whole deck anyway
          </Button>
        </div>
      )}

      {card && (
        <div className="flex flex-col gap-4">
          <ProgressBar
            value={position}
            max={session.length}
            label={`Card ${position + 1} of ${session.length}`}
            showValue
          />

          <div data-testid="deck-front" className="rounded-md border border-line bg-band p-5">
            <Text size="lead" tone="ink">
              {card.front}
            </Text>
          </div>

          {!flipped ? (
            <div>
              <Button variant="outline" onClick={() => setFlipped(true)}>
                Show the back
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div data-testid="deck-back" className="rounded-md border border-line bg-paper p-5">
                <Text tone="ink">{card.back}</Text>
              </div>
              {card.source && <Source label={card.source.label} url={card.source.url} />}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => answer(card, true)}>
                  Got it
                </Button>
                <Button variant="ghost" onClick={() => answer(card, false)}>
                  Not yet
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <Text tone="ink">
            <strong className="font-semibold">{done}</strong> cards reviewed. Come back when the
            next batch is due.
          </Text>
          {nextUp && <Text size="small">Next card due {formatIsoDate(nextUp.due)}.</Text>}
        </div>
      )}

      <div>
        <Button href={deck.href} variant="link" iconEnd={<Icon name="arrow-up-right" size={14} />}>
          Open the guide these came from
        </Button>
      </div>
    </section>
  );
}
```

**One correction to make before running:** the `session` memo above references `scheduleRef`, which does not exist. Add it directly under the `usePracticeSlot` call and keep it in step with the stored value:

```tsx
  const scheduleRef = useRef(value.cards);
  scheduleRef.current = value.cards;
```

and add `useRef` to the React import. The ref is what lets the queue read the schedule without re-running the memo on every answer.

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run components/practice/deck.test.tsx`
Expected: PASS — 7 tests, 0 failed.

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint components/practice/deck.tsx`
Expected: no output from either.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/practice/deck.tsx components/practice/deck.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add the flashcard deck on the Leitner schedule"
```

---

### Task 11: `Scenario`, `Annotated` and `BeforeAfter`

**Parallel group:** C

**Files:**
- Create: `components/practice/scenario.tsx`, `components/practice/scenario.test.tsx`, `components/practice/annotated.tsx`, `components/practice/annotated.test.tsx`, `components/practice/before-after.tsx`, `components/practice/before-after.test.tsx`
- Modify: none

**Interfaces:**
- Consumes: `Badge`, `Button`, `Callout`, `Dialog`, `Heading`, `Icon`, `Range`, `Step`, `StepList`, `Tab`, `TabList`, `TabPanel`, `Tabs`, `Text` from `@/components/ui`; `getScenario`, `walk` from `@/lib/scenario`; `data/annotated.json`.
- Produces:
  - `export function Scenario({ scenarioId }: { scenarioId: string })` — client; `null` for an unknown id.
  - `export type AnnotatedBlock = { id: string; label?: string; text: string }`
  - `export type AnnotatedHotspot = { block: string; n: number; title: string; why: string; rule: string }`
  - `export type AnnotatedExample = { id: string; kind: string; title: string; route: string; blocks: AnnotatedBlock[]; hotspots: AnnotatedHotspot[] }`
  - `export const DOCTRINE_NOTE: string`; `export function getExample(id: string): AnnotatedExample | undefined`
  - `export function Annotated({ exampleId }: { exampleId: string })` — client; `null` for an unknown id.
  - `export type BeforeAfterPair = { id: string; route: string; title: string; before: string; after: string; changes: { from: string; to: string; why: string }[] }`
  - `export function getPair(id: string): BeforeAfterPair | undefined`
  - `export function splitHighlights(text: string, fragments: readonly string[]): { text: string; hit: boolean }[]` — pure, exported for its own test.
  - `export function BeforeAfter({ pairId }: { pairId: string })` — client; `null` for an unknown id.

- [ ] **Step 1: Write the failing scenario test**

Create `components/practice/scenario.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Scenario } from "@/components/practice/scenario";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

/** Walk the first branch to whatever ending it reaches. */
async function walkToEnd(user: ReturnType<typeof userEvent.setup>) {
  for (let step = 0; step < 15; step += 1) {
    const choices = screen.queryAllByTestId("scenario-choice");
    if (choices.length === 0) return;
    await user.click(choices[0]);
  }
}

describe("Scenario", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<Scenario scenarioId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens on the intro and the start node's choices", () => {
    render(<Scenario scenarioId="late-request" />);
    expect(screen.getByText(/Sunday night\. You are in bed\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
  });

  it("moves to the next node when a choice is taken and shows its consequence", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Leave it\. Answer at 8 am Monday/ }));
    expect(screen.getByText(/You put the phone face down/)).toBeInTheDocument();
  });

  it("lets the visitor step back one fork", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Reply with one question/ }));
    await user.click(screen.getByRole("button", { name: "Back one step" }));
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
  });

  it("restarts from the beginning", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Reply with one question/ }));
    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back one step" })).toBeNull();
  });

  it("ends with a debrief listing the path taken and the rule each fork tested", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await walkToEnd(user);

    const debrief = screen.getByTestId("scenario-debrief");
    expect(within(debrief).getByText(/The path you took/i)).toBeInTheDocument();
    expect(within(debrief).getAllByTestId("scenario-tested").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Read the rule/i })).toHaveAttribute("href", "/conduct");
  });

  it("never shows a score", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await walkToEnd(user);
    expect(screen.queryByText(/\bscore\b/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/practice/scenario.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/scenario"`.

- [ ] **Step 3: Write `components/practice/scenario.tsx`**

```tsx
"use client";

import { useId, useState } from "react";
import { getScenario, walk } from "@/lib/scenario";
import { Badge, Button, Callout, Heading, Icon, Step, StepList, Text } from "@/components/ui";

/**
 * A branching scenario (spec §7.4.2).
 *
 * The component owns nothing but the list of chosen indices; `walk` rebuilds
 * the path from the start on every render, so "back one step" is a slice and
 * there is no undo stack to fall out of sync.
 *
 * There is deliberately no score. Some forks are trade-offs, and the debrief
 * names the principle each one tested instead of grading it.
 */
export function Scenario({ scenarioId }: { scenarioId: string }) {
  const baseId = useId();
  const scenario = getScenario(scenarioId);
  const [choices, setChoices] = useState<number[]>([]);

  if (!scenario) return null;

  const state = walk(scenario, choices);
  const lastNote = state.steps.at(-1)?.choice?.note;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-3">
        <Badge tone="info" variant="outline">
          Scenario
        </Badge>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          {scenario.title}
        </Heading>
        <Text>{scenario.intro}</Text>
      </div>

      {lastNote && (
        <Callout tone="neutral" icon="quote">
          {lastNote}
        </Callout>
      )}

      <div className="rounded-md border border-line bg-band p-5">
        <Text tone="ink" className="whitespace-pre-line">
          {state.current.text}
        </Text>
      </div>

      {!state.finished && (
        <div role="group" aria-label="What do you do?" className="flex flex-col gap-3">
          {(state.current.choices ?? []).map((choice, index) => (
            // Raw <button>: a full-width decision row that wraps to several
            // lines, which none of Button's variants is shaped for.
            <button
              key={choice.next + choice.label}
              type="button"
              data-testid="scenario-choice"
              onClick={() => setChoices([...choices, index])}
              className="rounded-md border border-line-strong p-4 text-left text-base text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-band"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {state.finished && (
        <div data-testid="scenario-debrief" className="flex flex-col gap-5 border-t border-line pt-6">
          <Heading level={3} size="h5">
            The path you took
          </Heading>
          <StepList>
            {state.steps.map((step, index) => (
              <Step key={`${step.id}-${index}`} n={index + 1} title={step.choice?.label ?? ""}>
                <span data-testid="scenario-tested">{step.choice?.tests}</span>
              </Step>
            ))}
          </StepList>

          {state.current.debrief && <Text tone="ink">{state.current.debrief}</Text>}

          <div className="flex flex-wrap gap-3">
            <Button
              href={scenario.route}
              variant="secondary"
              iconEnd={<Icon name="arrow-up-right" size={14} />}
            >
              Read the rule in the guide
            </Button>
            <Button variant="ghost" onClick={() => setChoices([])}>
              Start over
            </Button>
          </div>
          <Text size="small">
            Walk it again down a different fork. Two of these paths are trade-offs, so the second
            run teaches more than the first.
          </Text>
        </div>
      )}

      {!state.finished && choices.length > 0 && (
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Button variant="ghost" size="sm" onClick={() => setChoices(choices.slice(0, -1))}>
            Back one step
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setChoices([])}>
            Start over
          </Button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run components/practice/scenario.test.tsx`
Expected: PASS — 7 tests, 0 failed.

- [ ] **Step 5: Write the failing annotated test**

Create `components/practice/annotated.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Annotated } from "@/components/practice/annotated";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Annotated", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<Annotated exampleId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("puts the doctrine note above the example", () => {
    render(<Annotated exampleId="resume-junior" />);
    const note = screen.getByText(/Study it, extract the rules/);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(note.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders every hotspot as a button numbered in reading order", () => {
    render(<Annotated exampleId="resume-junior" />);
    const buttons = screen.getAllByTestId("hotspot");
    expect(buttons).toHaveLength(10);
    expect(buttons.map((button) => button.textContent)).toEqual(
      Array.from({ length: 10 }, (_, index) => String(index + 1)),
    );
  });

  it("names each hotspot for assistive technology rather than reading '1'", () => {
    render(<Annotated exampleId="resume-junior" />);
    expect(screen.getByRole("button", { name: /Note 1: One way to reach you/ })).toBeInTheDocument();
  });

  it("opens a dialog with the why and the rule, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Annotated exampleId="resume-junior" />);
    await user.click(screen.getByRole("button", { name: /Note 1: One way to reach you/ }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/The header exists so a reader/)).toBeInTheDocument();
    expect(within(dialog).getByText(/One email, one link/)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("links to the guide the example belongs to", () => {
    render(<Annotated exampleId="supplier-invoice" />);
    expect(screen.getByRole("link", { name: /Open the guide/i })).toHaveAttribute("href", "/legit");
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run components/practice/annotated.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/annotated"`.

- [ ] **Step 7: Write `components/practice/annotated.tsx`**

```tsx
"use client";

import { useId, useState } from "react";
import annotatedData from "@/data/annotated.json";
import { Badge, Button, Callout, Dialog, Heading, Icon, Text } from "@/components/ui";

export type AnnotatedBlock = { id: string; label?: string; text: string };

export type AnnotatedHotspot = {
  block: string;
  n: number;
  title: string;
  why: string;
  rule: string;
};

export type AnnotatedExample = {
  id: string;
  kind: string;
  title: string;
  route: string;
  blocks: AnnotatedBlock[];
  hotspots: AnnotatedHotspot[];
};

/** Renders above every example (spec §7.4.3). */
export const DOCTRINE_NOTE = annotatedData.doctrineNote;

const EXAMPLES = annotatedData.examples as AnnotatedExample[];

export function getExample(id: string): AnnotatedExample | undefined {
  return EXAMPLES.find((example) => example.id === id);
}

/**
 * A worked example with numbered hotspots (spec §7.4.3).
 *
 * A block's notes render with that block, in `n` order, so tab order and
 * reading order are the same thing. Each note is a real button with a spoken
 * name ("Note 3: …") rather than a bare numeral.
 */
export function Annotated({ exampleId }: { exampleId: string }) {
  const baseId = useId();
  const example = getExample(exampleId);
  const [openNote, setOpenNote] = useState<number | null>(null);

  if (!example) return null;

  const active = example.hotspots.find((hotspot) => hotspot.n === openNote);

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-6">
      <Callout tone="info" icon="scan-eye" title="How to use this">
        {DOCTRINE_NOTE}
      </Callout>

      <div className="flex flex-col gap-2">
        <Badge tone="neutral" variant="outline">
          {example.kind}
        </Badge>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          {example.title}
        </Heading>
        <Text size="small">
          The numbered notes say why each part exists and the rule it follows. Open one, then close
          it and write your own.
        </Text>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6">
        {example.blocks.map((block) => {
          const notes = example.hotspots
            .filter((hotspot) => hotspot.block === block.id)
            .sort((a, b) => a.n - b.n);
          return (
            <div
              key={block.id}
              className="flex flex-col gap-2 border-b border-line pb-5 last:border-0 last:pb-0"
            >
              {block.label && <p className="text-kicker uppercase text-ink-faint">{block.label}</p>}
              <p className="whitespace-pre-line text-base leading-relaxed text-ink">{block.text}</p>
              {notes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {notes.map((hotspot) => (
                    <button
                      key={hotspot.n}
                      type="button"
                      data-testid="hotspot"
                      aria-label={`Note ${hotspot.n}: ${hotspot.title}`}
                      onClick={() => setOpenNote(hotspot.n)}
                      className="grid h-8 w-8 place-items-center rounded-pill border border-primary bg-primary-tint text-small font-semibold text-primary-deep transition-colors duration-150 ease-out hover:bg-primary hover:text-white"
                    >
                      {hotspot.n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <Button
          href={example.route}
          variant="link"
          iconEnd={<Icon name="arrow-up-right" size={14} />}
        >
          Open the guide that teaches this
        </Button>
      </div>

      <Dialog
        open={active !== undefined}
        onClose={() => setOpenNote(null)}
        title={active ? `Note ${active.n}: ${active.title}` : "Note"}
        size="sm"
      >
        {active && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-kicker uppercase text-ink-faint">Why it exists</p>
              <Text tone="ink">{active.why}</Text>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-kicker uppercase text-ink-faint">The rule</p>
              <Text tone="ink">{active.rule}</Text>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
```

- [ ] **Step 8: Run it and watch it pass**

Run: `npx vitest run components/practice/annotated.test.tsx`
Expected: PASS — 6 tests, 0 failed.

- [ ] **Step 9: Write the failing before/after test**

Create `components/practice/before-after.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BeforeAfter, splitHighlights } from "@/components/practice/before-after";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("splitHighlights", () => {
  it("marks each fragment it finds and leaves the rest alone", () => {
    expect(
      splitHighlights("sorry to bother you, here is the report", ["sorry to bother you"]),
    ).toEqual([
      { text: "sorry to bother you", hit: true },
      { text: ", here is the report", hit: false },
    ]);
  });

  it("orders fragments by where they appear, not by how they were passed", () => {
    expect(splitHighlights("one two three", ["three", "one"])).toEqual([
      { text: "one", hit: true },
      { text: " two ", hit: false },
      { text: "three", hit: true },
    ]);
  });

  it("marks only the first occurrence of a repeated fragment", () => {
    expect(splitHighlights("po po", ["po"])).toEqual([
      { text: "po", hit: true },
      { text: " po", hit: false },
    ]);
  });

  it("returns the whole string untouched when nothing matches", () => {
    expect(splitHighlights("nothing here", ["absent"])).toEqual([
      { text: "nothing here", hit: false },
    ]);
  });

  it("handles an empty fragment list", () => {
    expect(splitHighlights("plain", [])).toEqual([{ text: "plain", hit: false }]);
  });
});

describe("BeforeAfter", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<BeforeAfter pairId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows both versions at once in the split view", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    const split = screen.getByTestId("split-view");
    expect(within(split).getByText(/sorry to bother you/)).toBeInTheDocument();
    expect(within(split).getByText(/moves from Friday to Tuesday/)).toBeInTheDocument();
  });

  it("gives the divider a labelled slider a keyboard can move", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairId="late-delivery" />);
    const slider = screen.getByRole("slider", { name: /split between the two versions/i });
    slider.focus();
    const before = Number((slider as HTMLInputElement).value);
    await user.keyboard("{ArrowRight}");
    expect(Number((slider as HTMLInputElement).value)).toBeGreaterThan(before);
  });

  it("offers the two versions as tabs for small screens", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairId="late-delivery" />);
    const tabs = screen.getByRole("tablist", { name: /two versions/i });
    await user.click(within(tabs).getByRole("tab", { name: "After" }));
    expect(within(tabs).getByRole("tab", { name: "After" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("lists every change with the reason it was made", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    const changes = screen.getByTestId("change-list");
    expect(within(changes).getAllByRole("listitem")).toHaveLength(5);
    expect(within(changes).getByText(/Twelve words of throat-clearing/)).toBeInTheDocument();
  });

  it("marks the changed phrases in both versions", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    expect(screen.getAllByTestId("marked").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 10: Run it and watch it fail**

Run: `npx vitest run components/practice/before-after.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/before-after"`.

- [ ] **Step 11: Write `components/practice/before-after.tsx`**

```tsx
"use client";

import { Fragment, useId, useState } from "react";
import annotatedData from "@/data/annotated.json";
import { Badge, Heading, Range, Tab, TabList, TabPanel, Tabs, Text } from "@/components/ui";

export type BeforeAfterPair = {
  id: string;
  route: string;
  title: string;
  before: string;
  after: string;
  changes: { from: string; to: string; why: string }[];
};

const PAIRS = annotatedData.pairs as BeforeAfterPair[];

export function getPair(id: string): BeforeAfterPair | undefined {
  return PAIRS.find((pair) => pair.id === id);
}

/**
 * Split `text` on the first occurrence of each fragment, ordered by where the
 * fragments appear in the text. Pure so it can be tested on its own; the
 * component only turns the result into `<mark>` elements.
 */
export function splitHighlights(
  text: string,
  fragments: readonly string[],
): { text: string; hit: boolean }[] {
  const hits = fragments
    .map((fragment) => ({ fragment, at: text.indexOf(fragment) }))
    .filter((hit) => hit.at >= 0 && hit.fragment.length > 0)
    .sort((a, b) => a.at - b.at);

  const parts: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const { fragment, at } of hits) {
    if (at < cursor) continue; // overlaps a fragment already marked
    if (at > cursor) parts.push({ text: text.slice(cursor, at), hit: false });
    parts.push({ text: fragment, hit: true });
    cursor = at + fragment.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts.length > 0 ? parts : [{ text, hit: false }];
}

function Marked({ text, fragments }: { text: string; fragments: readonly string[] }) {
  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-ink">
      {splitHighlights(text, fragments).map((part, index) => (
        <Fragment key={index}>
          {part.hit ? (
            <mark data-testid="marked" className="rounded-sm bg-caution-tint px-0.5 text-ink">
              {part.text}
            </mark>
          ) : (
            part.text
          )}
        </Fragment>
      ))}
    </p>
  );
}

/**
 * Two versions of the same message (spec §5.2b).
 *
 * Desktop gets a split view whose divider the visitor drags: both texts stay
 * fully readable and only get narrower, which is what makes the comparison
 * work for prose. Small screens get the same two texts as tabs. Both are in
 * the DOM at every width; the breakpoint decides which one is visible.
 */
export function BeforeAfter({ pairId }: { pairId: string }) {
  const baseId = useId();
  const pair = getPair(pairId);
  const [split, setSplit] = useState(50);

  if (!pair) return null;

  const fromFragments = pair.changes.map((change) => change.from);
  const toFragments = pair.changes.map((change) => change.to);

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge tone="neutral" variant="outline">
          Rewrite
        </Badge>
        <Heading level={3} size="h4" id={`${baseId}-title`}>
          {pair.title}
        </Heading>
      </div>

      <div data-testid="split-view" className="hidden flex-col gap-3 lg:flex">
        <div className="grid gap-4" style={{ gridTemplateColumns: `${split}fr ${100 - split}fr` }}>
          <div className="min-w-0 rounded-md border border-line bg-band p-5">
            <p className="text-kicker mb-2 uppercase text-ink-faint">Before</p>
            <Marked text={pair.before} fragments={fromFragments} />
          </div>
          <div className="min-w-0 rounded-md border border-line-strong bg-paper p-5">
            <p className="text-kicker mb-2 uppercase text-ink-faint">After</p>
            <Marked text={pair.after} fragments={toFragments} />
          </div>
        </div>
        <Range
          aria-label="Split between the two versions"
          min={20}
          max={80}
          step={1}
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          valueLabel={`${split}% before, ${100 - split}% after`}
        />
      </div>

      <div className="lg:hidden">
        <Tabs defaultValue="before">
          <TabList label="The two versions">
            <Tab value="before">Before</Tab>
            <Tab value="after">After</Tab>
          </TabList>
          <TabPanel value="before">
            <div className="mt-4 rounded-md border border-line bg-band p-5">
              <Marked text={pair.before} fragments={fromFragments} />
            </div>
          </TabPanel>
          <TabPanel value="after">
            <div className="mt-4 rounded-md border border-line-strong bg-paper p-5">
              <Marked text={pair.after} fragments={toFragments} />
            </div>
          </TabPanel>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <Heading level={4} size="h5">
          What changed, and why
        </Heading>
        <ul data-testid="change-list" className="flex flex-col gap-4">
          {pair.changes.map((change) => (
            <li key={change.from} className="flex flex-col gap-1 border-l-2 border-line-strong pl-4">
              <Text size="small" tone="faint">
                {change.from}
              </Text>
              <Text size="small" tone="ink">
                {change.to}
              </Text>
              <Text size="small">{change.why}</Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

**Note on the split-view test:** because both layouts are in the DOM, `screen.getByText(/sorry to bother you/)` would match twice. The test scopes every split-view query with `within(screen.getByTestId("split-view"))`, and the tabs test scopes to the `tablist`. Keep that scoping if you add assertions.

- [ ] **Step 12: Run it and watch it pass**

Run: `npx vitest run components/practice/before-after.test.tsx`
Expected: PASS — 11 tests, 0 failed.

- [ ] **Step 13: Type-check, lint, and commit**

Run: `npx tsc --noEmit && npx eslint components/practice`
Expected: no output from either.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/practice/scenario.tsx components/practice/scenario.test.tsx components/practice/annotated.tsx components/practice/annotated.test.tsx components/practice/before-after.tsx components/practice/before-after.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add branching scenarios, annotated examples and message rewrites"
```

---

### Task 12: `Term`, `Journal` and `Streak`

**Parallel group:** C

**Files:**
- Create: `lib/glossary.ts`, `lib/glossary.test.ts`, `components/practice/term.tsx`, `components/practice/term.test.tsx`, `components/practice/journal.tsx`, `components/practice/streak.tsx`, `components/practice/journal-streak.test.tsx`
- Modify: none

**Interfaces:**
- Consumes: `Badge`, `Button`, `Card`, `EmptyState`, `Field`, `Heading`, `Icon`, `Stat`, `StatStrip`, `Textarea`, `Text` from `@/components/ui`; `currentStreak`, `longestStreak` from `@/lib/streak`; `formatIsoDate` from `@/lib/dates`; `useJournalWeek`, `usePlanDays`, `useToday` from `./hooks`; `data/glossary.json`.
- Produces, from `@/lib/glossary`:
  - `export type GlossaryTerm = { id: string; term: string; definition: string; taglish?: string; href?: string }`
  - `export const TERMS: GlossaryTerm[]`; `export const GLOSSARY_LAST_VERIFIED: string`
  - `export function getTerm(id: string): GlossaryTerm | undefined`
  - `export function groupByLetter(terms: readonly GlossaryTerm[]): { letter: string; terms: GlossaryTerm[] }[]` — A–Z, ascending, letters with no terms omitted; anything that does not start with a letter groups under `"#"`.
  - `export function filterTerms(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[]` — case-insensitive over `term` and `definition`; an empty query returns everything.
- Produces, from `@/components/practice`:
  - `export function Term({ id, children }: { id: string; children?: ReactNode })` — client; renders `children` (or nothing) unchanged when the id is unknown, so a bad id never breaks a sentence.
  - `export function Journal()` — client.
  - `export function Streak()` — client.

**Which state `Streak` reads, exactly:** `usePlanDays()` from `./hooks`, which combines `usePath().state.planDays` (`Record<number, boolean>` — whether a day is done) with the `hfph.practice.plan-days.v1` slot (`Record<number, IsoDate>` — when it was ticked). `lib/path-context.tsx` is not modified.

- [ ] **Step 1: Write the failing glossary test**

Create `lib/glossary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TERMS, filterTerms, getTerm, groupByLetter } from "@/lib/glossary";

describe("TERMS", () => {
  it("loads the fifty authored terms", () => {
    expect(TERMS).toHaveLength(50);
  });
});

describe("getTerm", () => {
  it("finds a term by id and returns undefined for anything else", () => {
    expect(getTerm("retainer")?.term).toBe("Retainer");
    expect(getTerm("not-a-term")).toBeUndefined();
  });
});

describe("groupByLetter", () => {
  it("groups by first letter, ascending, with no empty letters", () => {
    const groups = groupByLetter([
      { id: "b", term: "Batch", definition: "x" },
      { id: "a", term: "acronym", definition: "x" },
      { id: "a2", term: "Async", definition: "x" },
    ]);
    expect(groups.map((group) => group.letter)).toEqual(["A", "B"]);
    expect(groups[0].terms.map((term) => term.id)).toEqual(["a", "a2"]);
  });

  it("sorts within a letter case-insensitively", () => {
    const groups = groupByLetter([
      { id: "z", term: "az", definition: "x" },
      { id: "a", term: "AA", definition: "x" },
    ]);
    expect(groups[0].terms.map((term) => term.id)).toEqual(["a", "z"]);
  });

  it("puts anything that does not start with a letter under #", () => {
    const groups = groupByLetter([{ id: "n", term: "2307", definition: "x" }]);
    expect(groups[0].letter).toBe("#");
  });

  it("groups all fifty authored terms without losing one", () => {
    const grouped = groupByLetter(TERMS).flatMap((group) => group.terms);
    expect(grouped).toHaveLength(50);
  });
});

describe("filterTerms", () => {
  it("returns everything for an empty or blank query", () => {
    expect(filterTerms(TERMS, "")).toHaveLength(50);
    expect(filterTerms(TERMS, "   ")).toHaveLength(50);
  });

  it("matches the term and the definition, case-insensitively", () => {
    expect(filterTerms(TERMS, "RETAINER").map((term) => term.id)).toContain("retainer");
    expect(filterTerms(TERMS, "revisions").length).toBeGreaterThan(0);
  });

  it("returns nothing when there is no match", () => {
    expect(filterTerms(TERMS, "zzzzzz")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/glossary.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/glossary"`.

- [ ] **Step 3: Write `lib/glossary.ts`**

```ts
/**
 * The glossary (spec §7.4.6). Read by the inline `Term` component and by the
 * `/glossary` route. Fifty terms, each with a plain definition, an optional
 * Taglish gloss, and a link to the guide that teaches it.
 */

import glossaryData from "@/data/glossary.json";

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  /** A one-line Tagalog gloss where one helps. Twelve terms carry it. */
  taglish?: string;
  href?: string;
};

export const TERMS = glossaryData.terms as GlossaryTerm[];
export const GLOSSARY_LAST_VERIFIED = glossaryData.lastVerified;

export function getTerm(id: string): GlossaryTerm | undefined {
  return TERMS.find((term) => term.id === id);
}

function letterOf(term: GlossaryTerm): string {
  const first = term.term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export function groupByLetter(
  terms: readonly GlossaryTerm[],
): { letter: string; terms: GlossaryTerm[] }[] {
  const buckets = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const letter = letterOf(term);
    const bucket = buckets.get(letter);
    if (bucket) bucket.push(term);
    else buckets.set(letter, [term]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, group]) => ({
      letter,
      terms: [...group].sort((a, b) =>
        a.term.localeCompare(b.term, "en", { sensitivity: "base" }),
      ),
    }));
}

export function filterTerms(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [...terms];
  return terms.filter(
    (term) =>
      term.term.toLowerCase().includes(needle) ||
      term.definition.toLowerCase().includes(needle),
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/glossary.test.ts`
Expected: PASS — 9 tests, 0 failed.

- [ ] **Step 5: Write the failing `Term` test**

Create `components/practice/term.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Term } from "@/components/practice/term";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Term", () => {
  it("leaves the sentence alone when the id is unknown", () => {
    render(
      <p>
        A <Term id="not-a-term">retainer</Term> is fine.
      </p>,
    );
    expect(screen.getByText(/A retainer is fine\./)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the term as a button that carries its definition for screen readers", () => {
    render(<Term id="retainer" />);
    const button = screen.getByRole("button", { name: "Retainer" });
    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      /A fixed monthly fee for an agreed scope/,
    );
  });

  it("keeps the popover closed until it is asked for", () => {
    render(<Term id="retainer" />);
    expect(screen.getByRole("button", { name: "Retainer" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("opens the popover on click and closes it on Escape", async () => {
    const user = userEvent.setup();
    render(<Term id="retainer" />);
    const button = screen.getByRole("button", { name: "Retainer" });

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("note")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the Taglish gloss and the link to the guide", async () => {
    const user = userEvent.setup();
    render(<Term id="retainer" />);
    await user.click(screen.getByRole("button", { name: "Retainer" }));
    expect(screen.getByText(/Buwanang bayad/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Where this is explained/i })).toHaveAttribute(
      "href",
      "/salary",
    );
  });

  it("uses the author's wording when children are given", () => {
    render(<Term id="retainer">retainers</Term>);
    expect(screen.getByRole("button", { name: "retainers" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run components/practice/term.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/term"`.

- [ ] **Step 7: Write `components/practice/term.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { getTerm } from "@/lib/glossary";

/**
 * An inline glossary term (spec §5.2b).
 *
 * The definition is always in the DOM in a visually hidden node that the
 * button points at with `aria-describedby`, so a screen reader hears it the
 * moment the term is focused, whether or not the popover is open. The popover
 * is the sighted equivalent of the same text.
 *
 * Use it on the *first* mention of a term on a page, not on every mention.
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const baseId = useId();
  const term = getTerm(id);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // A term that is not in the glossary must never swallow the sentence.
  if (!term) return <>{children}</>;

  const descriptionId = `${baseId}-definition`;

  return (
    <span ref={wrapper} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={descriptionId}
        onClick={() => setOpen(!open)}
        className="border-b border-dashed border-control text-inherit transition-colors duration-150 ease-out hover:border-primary hover:text-primary"
      >
        {children ?? term.term}
      </button>

      <span id={descriptionId} className="sr-only">
        {term.definition}
      </span>

      {open && (
        <span
          role="note"
          className="absolute left-0 top-full z-20 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-md border border-line-strong bg-paper p-4 text-left shadow-[var(--shadow-md)]"
        >
          <span className="text-small font-semibold text-ink">{term.term}</span>
          <span className="text-small leading-relaxed text-ink-soft">{term.definition}</span>
          {term.taglish && (
            <span className="text-caption leading-relaxed text-ink-faint">{term.taglish}</span>
          )}
          {term.href && (
            <Link
              href={term.href}
              className="text-caption font-medium text-primary underline underline-offset-2"
            >
              Where this is explained
            </Link>
          )}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 8: Run it and watch it pass**

Run: `npx vitest run components/practice/term.test.tsx`
Expected: PASS — 6 tests, 0 failed.

- [ ] **Step 9: Write the failing journal and streak test**

Create `components/practice/journal-streak.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { Journal } from "@/components/practice/journal";
import { Streak } from "@/components/practice/streak";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // Friday, 2026-W34
});

describe("Journal", () => {
  it("shows this week's prompt and saves one entry for the week", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Journal />);

    expect(await screen.findByText(/should have been an SOP/)).toBeInTheDocument();

    const box = screen.getByRole("textbox", { name: /this week/i });
    await user.type(box, "Wrote the invoice SOP.");
    await user.click(screen.getByRole("button", { name: "Save this week" }));

    expect(screen.getByRole("status")).toHaveTextContent(/Saved/i);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.journal) ?? "{}")).toEqual({
      "2026-W34": { text: "Wrote the invoice SOP.", updated: "2026-08-21" },
    });
  });

  it("reloads an entry already written this week", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.journal,
      JSON.stringify({ "2026-W34": { text: "Already written.", updated: "2026-08-21" } }),
    );
    render(<Journal />);
    expect(await screen.findByDisplayValue("Already written.")).toBeInTheDocument();
  });
});

describe("Streak", () => {
  function renderStreak() {
    render(
      <PathProvider>
        <Streak />
      </PathProvider>,
    );
  }

  it("says nothing has been ticked yet rather than showing a zero", async () => {
    renderStreak();
    expect(await screen.findByText(/No plan days ticked yet/i)).toBeInTheDocument();
  });

  it("counts consecutive days ending today", async () => {
    localStorage.setItem(
      "hfph.path.v1",
      JSON.stringify({ planDays: { 1: true, 2: true, 3: true } }),
    );
    localStorage.setItem(
      PRACTICE_KEYS.planDays,
      JSON.stringify({ 1: "2026-08-19", 2: "2026-08-20", 3: "2026-08-21" }),
    );
    renderStreak();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(screen.getByText(/day streak/i)).toBeInTheDocument();
  });

  it("says how many older ticks carry no date instead of guessing one", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ planDays: { 1: true, 2: true } }));
    localStorage.setItem(PRACTICE_KEYS.planDays, JSON.stringify({ 2: "2026-08-21" }));
    renderStreak();
    expect(await screen.findByText(/1 day was ticked before this site started/i)).toBeInTheDocument();
  });

  it("shows no badge, no points and no warning about losing the streak", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ planDays: { 1: true } }));
    localStorage.setItem(PRACTICE_KEYS.planDays, JSON.stringify({ 1: "2026-08-21" }));
    renderStreak();
    await screen.findByText("1");
    expect(screen.queryByText(/badge|points|don't break|keep it alive/i)).toBeNull();
  });
});
```

- [ ] **Step 10: Run it and watch it fail**

Run: `npx vitest run components/practice/journal-streak.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/journal"`.

- [ ] **Step 11: Write `components/practice/journal.tsx`**

```tsx
"use client";

import { useEffect, useId, useState } from "react";
import { formatIsoDate } from "@/lib/dates";
import { Badge, Button, Field, Heading, Text, Textarea } from "@/components/ui";
import { useJournalWeek } from "./hooks";

/**
 * One reflection prompt per ISO week (spec §7.4.5).
 *
 * Twelve prompts rotate; the entry is keyed by ISO week, so a visitor gets one
 * box per week rather than an endless log. Nothing leaves the browser.
 */
export function Journal() {
  const baseId = useId();
  const { week, prompt, entry, save, hydrated } = useJournalWeek();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  // Seed the box from storage once the week and the entry are known.
  useEffect(() => {
    if (!hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(entry?.text ?? "");
  }, [hydrated, entry?.text]);

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={2} size="h4" id={`${baseId}-title`}>
          This week&rsquo;s question
        </Heading>
        {hydrated && <Badge tone="neutral">{week}</Badge>}
      </div>

      <Text size="lead" tone="ink">
        {prompt}
      </Text>

      <Field
        label="Your answer this week"
        hint="Saved in this browser only. Nobody else can read it."
      >
        <Textarea
          rows={5}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setSaved(false);
          }}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          disabled={!hydrated || draft.trim().length === 0}
          onClick={() => {
            save(draft.trim());
            setSaved(true);
          }}
        >
          Save this week
        </Button>
        <p role="status" className="text-small text-ink-faint">
          {saved
            ? "Saved."
            : entry
              ? `Last saved ${formatIsoDate(entry.updated)}.`
              : ""}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 12: Write `components/practice/streak.tsx`**

```tsx
"use client";

import { currentStreak, longestStreak } from "@/lib/streak";
import { Stat, StatStrip, Text } from "@/components/ui";
import { usePlanDays, useToday } from "./hooks";

/**
 * Consecutive plan days (spec §7.4.5).
 *
 * A count, and nothing else: no badge, no points, no warning that a streak is
 * about to break. The current streak may end today or yesterday, so opening
 * the site in the morning never shows a collapse that has not happened.
 *
 * Completion comes from `usePath().state.planDays`; the dates come from the
 * practice store, written by `usePlanDays().markPlanDay`. Days ticked before
 * that map existed have no date, and the component says so rather than
 * inventing one.
 */
export function Streak() {
  const today = useToday();
  const { completedDates, undatedCount, hydrated } = usePlanDays();

  if (!hydrated) return null;

  if (completedDates.length === 0 && undatedCount === 0) {
    return (
      <Text size="small">
        No plan days ticked yet. Tick your first one on the 30-day plan and the count starts.
      </Text>
    );
  }

  const current = currentStreak(completedDates, today);
  const longest = longestStreak(completedDates);

  return (
    <div className="flex flex-col gap-3">
      <StatStrip>
        <Stat value={current} label="day streak" sub="in a row, up to today" />
        <Stat value={longest} label="longest run" sub="your best so far" />
        <Stat value={completedDates.length} label="plan days done" sub="dated ticks" />
      </StatStrip>
      {undatedCount > 0 && (
        <Text size="caption" tone="faint">
          {undatedCount === 1
            ? "1 day was ticked before this site started recording dates, so it is not in the streak."
            : `${undatedCount} days were ticked before this site started recording dates, so they are not in the streak.`}
        </Text>
      )}
    </div>
  );
}
```

- [ ] **Step 13: Run the test and watch it pass**

Run: `npx vitest run components/practice/journal-streak.test.tsx`
Expected: PASS — 6 tests, 0 failed.

If `Stat` renders its `value` inside a wrapper that breaks `getByText("3")`, query with `screen.getByText("3", { exact: true })` — do not change `Stat`.

- [ ] **Step 14: Type-check, lint, and commit**

Run: `npx tsc --noEmit && npx eslint lib/glossary.ts components/practice`
Expected: no output from either.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/glossary.ts lib/glossary.test.ts components/practice/term.tsx components/practice/term.test.tsx components/practice/journal.tsx components/practice/streak.tsx components/practice/journal-streak.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add inline glossary terms, the weekly journal and the plan-day streak"
```

---

### Task 13: `TimezoneOverlap` and `StudyTimer`

**Parallel group:** C

**Files:**
- Create: `components/practice/timezone-overlap.tsx`, `components/practice/timezone-overlap.test.tsx`, `components/practice/study-timer.tsx`, `components/practice/study-timer.test.tsx`
- Modify: none

**Interfaces:**
- Consumes: `Badge`, `Button`, `Card`, `Field`, `Heading`, `Icon`, `Range`, `Select`, `Source`, `Text` from `@/components/ui`; `REGIONS`, `TZ_SOURCE`, `formatHour`, `overlap`, `type HourWindow` from `@/lib/overlap`; `EMPTY_TIMER`, `PRACTICE_KEYS`, `parseTimerState`, `type TimerPhase` from `@/lib/practice-store`; `usePracticeSlot` from `./hooks`; `data/learning.json`.
- Produces:
  - `export function TimezoneOverlap()` — client. No props: the six regions come from `lib/overlap.ts`, which the data-integrity suite keeps in step with `markets.json`.
  - `export type SessionShape = { id: "short" | "medium" | "long"; focusMinutes: number; breakMinutes: number }`
  - `export const SHAPES: readonly SessionShape[]`
  - `export function StudyTimer()` — client.

**Honesty note for `TimezoneOverlap`:** the tool names the city each offset belongs to and cites the IANA database. A "region" spans several zones — the US Pacific coast is three hours further from Manila than New York — and the component says so on its face rather than presenting one number as the whole truth.

- [ ] **Step 1: Write the failing overlap test**

Create `components/practice/timezone-overlap.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimezoneOverlap } from "@/components/practice/timezone-overlap";

describe("TimezoneOverlap", () => {
  it("lists all six client regions", () => {
    render(<TimezoneOverlap />);
    const rows = screen.getAllByTestId("overlap-row");
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent("United States");
  });

  it("labels the two sliders that set the visitor's working window", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByRole("slider", { name: /your day starts/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hours you work/i })).toBeInTheDocument();
  });

  it("gives a 9-to-5 Manila day no overlap with New York in January", async () => {
    const user = userEvent.setup();
    render(<TimezoneOverlap />);
    await user.selectOptions(screen.getByRole("combobox", { name: /month/i }), "1");

    const us = screen.getAllByTestId("overlap-row")[0];
    expect(within(us).getByTestId("overlap-hours")).toHaveTextContent("0");
  });

  it("recomputes when the visitor moves their working window", async () => {
    const user = userEvent.setup();
    render(<TimezoneOverlap />);
    await user.selectOptions(screen.getByRole("combobox", { name: /month/i }), "1");

    const start = screen.getByRole("slider", { name: /your day starts/i });
    // Move the day to a 10 pm start, which is when New York is at work.
    await user.clear?.(start);
    (start as HTMLInputElement).focus();
    for (let step = 0; step < 13; step += 1) await user.keyboard("{ArrowRight}");

    const us = screen.getAllByTestId("overlap-row")[0];
    expect(Number(within(us).getByTestId("overlap-hours").textContent)).toBeGreaterThan(0);
  });

  it("names the city each offset belongs to, so the estimate is honest", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByText(/New York/)).toBeInTheDocument();
    expect(screen.getByText(/Singapore/)).toBeInTheDocument();
  });

  it("cites where the offsets come from", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByRole("link", { name: /IANA Time Zone Database/ })).toHaveAttribute(
      "href",
      "https://www.iana.org/time-zones",
    );
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/practice/timezone-overlap.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/timezone-overlap"`.

- [ ] **Step 3: Write `components/practice/timezone-overlap.tsx`**

```tsx
"use client";

import { useId, useState } from "react";
import {
  REGIONS,
  TZ_SOURCE,
  formatHour,
  offsetFor,
  overlap,
  type HourWindow,
} from "@/lib/overlap";
import { Badge, Field, Heading, ProgressBar, Range, Select, Source, Text } from "@/components/ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Overlap hours between the visitor's working window and each client region
 * (spec §7.4.6).
 *
 * The month matters because half of these regions move their clocks. The city
 * is named on every row because a region is not a time zone: New York and Los
 * Angeles are three hours apart, and a number that hides that is a worse
 * answer than a number that admits it.
 */
export function TimezoneOverlap() {
  const baseId = useId();
  const [start, setStart] = useState(9);
  const [length, setLength] = useState(8);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const mine: HourWindow = { start, end: Math.min(start + length, 24) };

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-2">
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          Your hours against theirs
        </Heading>
        <Text>
          Set the window you are willing to work in Manila time. The number on each row is how many
          of those hours land inside a 9-to-5 day in that region.
        </Text>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Your day starts" hint={formatHour(start)}>
          <Range
            min={0}
            max={23}
            step={1}
            value={start}
            onChange={(event) => setStart(Number(event.target.value))}
          />
        </Field>
        <Field label="Hours you work" hint={`${length} hours`}>
          <Range
            min={1}
            max={14}
            step={1}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
          />
        </Field>
        <Field label="Month">
          <Select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Text size="small" tone="ink">
        Your window: {formatHour(mine.start)} to {formatHour(mine.end)}, Manila time.
      </Text>

      <ul className="flex flex-col gap-4">
        {REGIONS.map((region) => {
          const result = overlap(region, month, mine);
          const offset = offsetFor(region, month);
          const sign = offset >= 0 ? "+" : "−";
          return (
            <li
              key={region.id}
              data-testid="overlap-row"
              className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-base font-medium text-ink">{region.name}</span>
                <Badge tone={result.hours >= 4 ? "verified" : result.hours > 0 ? "caution" : "neutral"}>
                  <span data-testid="overlap-hours">{result.hours}</span>
                  &nbsp;overlap {result.hours === 1 ? "hour" : "hours"}
                </Badge>
              </div>
              <ProgressBar
                value={result.hours}
                max={Math.max(1, mine.end - mine.start)}
                label={`Overlap with ${region.name}`}
                hideLabel
                tone={result.hours >= 4 ? "verified" : "caution"}
              />
              <Text size="caption" tone="faint">
                Measured at {region.city}, UTC{sign}
                {Math.abs(offset)} this month. Their 9-to-5 is{" "}
                {result.windows
                  .map((window) => `${formatHour(window.start)}–${formatHour(window.end)}`)
                  .join(" and ")}{" "}
                for you.
              </Text>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <Text size="caption">
          One city stands in for each region, so a client on the US west coast sits three hours
          further from you than this row shows. Treat the number as a planning estimate and confirm
          the hours before you accept a role.
        </Text>
        <Source label={TZ_SOURCE.label} url={TZ_SOURCE.url} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run components/practice/timezone-overlap.test.tsx`
Expected: PASS — 6 tests, 0 failed.

If the "recomputes" test is flaky because `Range` starts at a different value, replace the keyboard loop with `fireEvent.change(start, { target: { value: "22" } })` from `@testing-library/react` — a direct change event on a range input is the reliable way to set an exact value in jsdom.

- [ ] **Step 5: Write the failing study-timer test**

Create `components/practice/study-timer.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { StudyTimer } from "@/components/practice/study-timer";

describe("StudyTimer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0));
  });

  function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudyTimer />);
    return user;
  }

  it("offers the three session shapes from the study protocol", () => {
    setup();
    expect(screen.getByRole("radio", { name: /15 min focus \/ 3 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /25 min focus \/ 5 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /50 min focus \/ 10 min break/ })).toBeInTheDocument();
  });

  it("exposes the clock as a timer for assistive technology", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");
  });

  it("counts down", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(65_000);
    expect(screen.getByRole("timer")).toHaveTextContent("23:55");
  });

  it("persists the running block so a reload does not lose it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.timer) ?? "null");
    expect(stored.phase).toBe("focus");
    expect(stored.paused).toBe(false);
    expect(stored.shape).toBe("medium");
  });

  it("pauses and keeps the time left", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(60_000);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await vi.advanceTimersByTimeAsync(120_000);
    expect(screen.getByRole("timer")).toHaveTextContent("24:00");
  });

  it("moves to the break when the focus block runs out and says so once", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(25 * 60_000 + 1_000);
    expect(screen.getByRole("status")).toHaveTextContent(/Break time/i);
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("resets back to a stopped focus block", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(localStorage.getItem(PRACTICE_KEYS.timer)).toBe("null");
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run components/practice/study-timer.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/study-timer"`.

- [ ] **Step 7: Write `components/practice/study-timer.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useId, useState } from "react";
import learning from "@/data/learning.json";
import { EMPTY_TIMER, PRACTICE_KEYS, parseTimerState, type TimerPhase } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Button, Heading, Text } from "@/components/ui";
import { usePracticeSlot } from "./hooks";

export type SessionShape = {
  id: "short" | "medium" | "long";
  focusMinutes: number;
  breakMinutes: number;
};

/**
 * The minutes are here and the words are in `learning.json`. Parsing "25 min
 * focus / 5 min break" out of prose would break the first time the copy was
 * edited; `lib/practice-data.test.ts` asserts the two stay in step instead.
 */
export const SHAPES: readonly SessionShape[] = [
  { id: "short", focusMinutes: 15, breakMinutes: 3 },
  { id: "medium", focusMinutes: 25, breakMinutes: 5 },
  { id: "long", focusMinutes: 50, breakMinutes: 10 },
];

const COPY = learning.protocolRules.sessionShapes;

function minutesFor(shape: SessionShape, phase: TimerPhase): number {
  return phase === "focus" ? shape.focusMinutes : shape.breakMinutes;
}

function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * A focus/break timer with a visible plan (spec §7.4.6).
 *
 * The running block is stored as an *end timestamp* rather than a countdown,
 * so closing the tab and coming back resumes at the right second instead of
 * where the last tick left it.
 */
export function StudyTimer() {
  const baseId = useId();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.timer, EMPTY_TIMER, parseTimerState);
  const [shapeId, setShapeId] = useState<SessionShape["id"]>("medium");
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState("");

  const shape = SHAPES.find((candidate) => candidate.id === (value?.shape ?? shapeId)) ?? SHAPES[1];

  // One interval for the whole component; it only runs while a block is live.
  useEffect(() => {
    if (!value || value.paused) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [value]);

  const startBlock = useCallback(
    (phase: TimerPhase, id: SessionShape["id"]) => {
      const next = SHAPES.find((candidate) => candidate.id === id) ?? SHAPES[1];
      set({
        shape: id,
        phase,
        endsAt: Date.now() + minutesFor(next, phase) * 60_000,
        paused: false,
        remainingMs: 0,
      });
      setNow(Date.now());
    },
    [set],
  );

  const remaining = value
    ? value.paused
      ? value.remainingMs
      : Math.max(0, value.endsAt - now)
    : 0;

  // Roll focus into break (and break into focus) the moment a block runs out.
  useEffect(() => {
    if (!value || value.paused || remaining > 0) return;
    const nextPhase: TimerPhase = value.phase === "focus" ? "break" : "focus";
    setAnnouncement(nextPhase === "break" ? "Break time. Stand up." : "Back to focus.");
    startBlock(nextPhase, value.shape as SessionShape["id"]);
  }, [value, remaining, startBlock]);

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6"
    >
      <div className="flex flex-col gap-2">
        <Heading level={2} size="h4" id={`${baseId}-title`}>
          Run one block now
        </Heading>
        <Text size="small">
          Pick the shape that matches your attention today, then start it. The clock keeps running
          if you switch tabs.
        </Text>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-kicker uppercase text-ink-faint">Session shape</legend>
        {SHAPES.map((candidate) => {
          const copy = COPY[candidate.id];
          const selected = shape.id === candidate.id;
          return (
            <label
              key={candidate.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-md border p-4 transition-colors duration-150 ease-out",
                selected ? "border-primary bg-primary-tint" : "border-line-strong hover:border-ink",
              )}
            >
              <input
                type="radio"
                name={`${baseId}-shape`}
                value={candidate.id}
                checked={selected}
                onChange={() => setShapeId(candidate.id)}
                disabled={value !== null}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
                aria-label={`${copy.label}. ${copy.pattern}`}
              />
              <span className="flex flex-col gap-1">
                <span className="text-base font-medium text-ink">{copy.label}</span>
                <span className="text-small text-ink-soft">{copy.pattern}</span>
                <span className="text-caption text-ink-faint">{copy.perDay}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {hydrated && value && (
        <div className="flex flex-col items-start gap-3">
          <p
            role="timer"
            aria-label={`Time left in this ${value.phase} block`}
            className="font-display text-hero tabular-nums text-ink"
          >
            {clock(remaining)}
          </p>
          <Text size="small">
            {value.phase === "focus" ? "Focus block" : "Break"} ·{" "}
            {minutesFor(shape, value.phase)} minutes
          </Text>
        </div>
      )}

      <p role="status" className="text-small text-ink-soft">
        {announcement}
      </p>

      <div className="flex flex-wrap gap-3">
        {!value && (
          <Button variant="primary" onClick={() => startBlock("focus", shapeId)}>
            Start focus
          </Button>
        )}
        {value && !value.paused && (
          <Button
            variant="outline"
            onClick={() => set({ ...value, paused: true, remainingMs: Math.max(0, value.endsAt - Date.now()) })}
          >
            Pause
          </Button>
        )}
        {value && value.paused && (
          <Button
            variant="outline"
            onClick={() => set({ ...value, paused: false, endsAt: Date.now() + value.remainingMs })}
          >
            Resume
          </Button>
        )}
        {value && (
          <Button
            variant="ghost"
            onClick={() => {
              set(null);
              setAnnouncement("");
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </section>
  );
}
```

**Raw `<input type="radio">` note:** `verify:primitives` allows a raw control in a file that imports from `@/components/ui`, which this file does. The `Radio` primitive is not used here because each row needs the pattern and the per-day guidance beneath its label; `ChoiceCard` is the closer fit but does not carry three lines of description. If Phase 5 has widened `ChoiceCard` with a `description` slot by the time this runs, use it instead and drop the raw input.

- [ ] **Step 8: Run it and watch it pass**

Run: `npx vitest run components/practice/study-timer.test.tsx`
Expected: PASS — 7 tests, 0 failed.

- [ ] **Step 9: Type-check, lint, and commit**

Run: `npx tsc --noEmit && npx eslint components/practice`
Expected: no output from either.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/practice/timezone-overlap.tsx components/practice/timezone-overlap.test.tsx components/practice/study-timer.tsx components/practice/study-timer.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add the overlap-hours explorer and the study timer"
```

---

### Task 14: `ExportButton`, `ReaderControls`, the reader CSS and the pre-paint script

**Parallel group:** D (runs alone — it is the only task that touches `app/globals.css` and `app/layout.tsx`)

**Files:**
- Create: `components/practice/export-button.tsx`, `components/practice/export-button.test.tsx`, `components/practice/reader-controls.tsx`, `components/practice/reader-controls.test.tsx`, `components/practice/index.ts`
- Modify: `app/globals.css` (append one section), `app/layout.tsx` (add the pre-paint script)

**Interfaces:**
- Consumes: `Button`, `Field`, `Icon`, `Switch`, `Text` from `@/components/ui`; `CSV_BOM`, `downloadText`, `safeFilename`, `type ExportMime` from `@/lib/markdown-export`; `DEFAULT_READER`, `PRACTICE_KEYS`, `type FontSize` from `@/lib/practice-store`; `useReaderPrefs` from `./hooks`.
- Produces:
  - `export type ExportKind = "markdown" | "ics" | "csv"`
  - `export type ExportButtonProps = { title: string; kind: ExportKind; filename: string; build: () => string; label?: string; variant?: ButtonVariant; size?: ButtonSize; disabled?: boolean }`
  - `export function ExportButton(props: ExportButtonProps)` — client. `build()` runs at click time, so nothing is serialised until the visitor asks for it.
  - `export const READER_SCRIPT: string` — the minified pre-paint script, exported from `reader-controls.tsx` so `app/layout.tsx` has one source for it.
  - `export function ReaderControls({ layout }: { layout?: "row" | "stack" })` — client.
  - `components/practice/index.ts` — the barrel every page imports from.

**Deviation from spec §5.2b, recorded deliberately:** the spec's `ExportButton` takes `markdown` or `ics` as a value. This version takes `kind` plus a `build()` callback so a 30-day plan or a full application pipeline is not stringified on every render of the page that offers the download, and so a third format (CSV, required by §7.4.4 for the tracker) fits the same component. `title` and `filename` are unchanged.

- [ ] **Step 1: Write the failing export test**

Create `components/practice/export-button.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "@/components/practice/export-button";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function stubDownload() {
  const createObjectURL = vi.fn(() => "blob:fake");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return { createObjectURL, click };
}

describe("ExportButton", () => {
  it("does not build the file until it is clicked", async () => {
    stubDownload();
    const build = vi.fn(() => "# My resume");
    const user = userEvent.setup();
    render(
      <ExportButton title="My resume" kind="markdown" filename="my-resume.md" build={build} />,
    );

    expect(build).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Download Markdown/i }));
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("uses the calendar MIME type for an ICS export", async () => {
    const { createObjectURL } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My 30-day plan"
        kind="ics"
        filename="plan.ics"
        build={() => "BEGIN:VCALENDAR"}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Add to calendar/i }));
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe("text/calendar;charset=utf-8");
  });

  it("prepends a byte-order mark to CSV so spreadsheets read accents correctly", async () => {
    const { createObjectURL } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My pipeline"
        kind="csv"
        filename="pipeline.csv"
        build={() => "Company\r\nAcme"}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Download CSV/i }));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe("\uFEFFCompany\r\nAcme");
  });

  it("names the file for assistive technology", () => {
    render(
      <ExportButton title="My resume" kind="markdown" filename="my-resume.md" build={() => "x"} />,
    );
    expect(screen.getByRole("button", { name: "Download Markdown of My resume" })).toBeInTheDocument();
  });

  it("does nothing when there is nothing written yet", async () => {
    const { click } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My resume"
        kind="markdown"
        filename="my-resume.md"
        build={() => ""}
        disabled
      />,
    );
    await user.click(screen.getByRole("button", { name: /Download Markdown/i }));
    expect(click).not.toHaveBeenCalled();
  });

  it("accepts a custom label", () => {
    render(
      <ExportButton
        title="My oath"
        kind="markdown"
        filename="oath.md"
        label="Save my oath"
        build={() => "x"}
      />,
    );
    expect(screen.getByRole("button", { name: /Save my oath/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run components/practice/export-button.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/export-button"`.

- [ ] **Step 3: Write `components/practice/export-button.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  CSV_BOM,
  downloadText,
  type ExportMime,
} from "@/lib/markdown-export";
import { Button, Icon, type ButtonSize, type ButtonVariant } from "@/components/ui";

export type ExportKind = "markdown" | "ics" | "csv";

const MIME: Record<ExportKind, ExportMime> = {
  markdown: "text/markdown;charset=utf-8",
  ics: "text/calendar;charset=utf-8",
  csv: "text/csv;charset=utf-8",
};

const DEFAULT_LABEL: Record<ExportKind, string> = {
  markdown: "Download Markdown",
  ics: "Add to calendar",
  csv: "Download CSV",
};

const ICON: Record<ExportKind, string> = {
  markdown: "file-text",
  ics: "calendar-days",
  csv: "table",
};

export type ExportButtonProps = {
  /** What the file is, in the visitor's terms. Used for the accessible name. */
  title: string;
  kind: ExportKind;
  filename: string;
  /** Runs at click time — nothing is serialised until the visitor asks. */
  build: () => string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
};

/**
 * THE RULE (spec §7.4.4, BUILD_GUIDE): export is for what the user wrote;
 * never for anything we wrote. Every `build` closure at every call site must
 * read user state only — their answers, their oath, their applications, their
 * plan-day ticks. A finished deliverable somebody could rename and pass off as
 * their own work has no business coming out of this button.
 */
export function ExportButton({
  title,
  kind,
  filename,
  build,
  label,
  variant = "outline",
  size = "sm",
  disabled = false,
}: ExportButtonProps) {
  const [done, setDone] = useState(false);
  const text = label ?? DEFAULT_LABEL[kind];

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={`${text} of ${title}`}
      icon={<Icon name={done ? "check-circle-2" : ICON[kind]} size={16} />}
      onClick={() => {
        const body = build();
        if (body.trim().length === 0) return;
        downloadText(filename, kind === "csv" ? CSV_BOM + body : body, MIME[kind]);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Saved" : text}
    </Button>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run components/practice/export-button.test.tsx`
Expected: PASS — 6 tests, 0 failed.

- [ ] **Step 5: Write the failing reader-controls test**

Create `components/practice/reader-controls.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { READER_SCRIPT, ReaderControls } from "@/components/practice/reader-controls";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("READER_SCRIPT", () => {
  it("applies the stored classes and survives a corrupt slot", () => {
    localStorage.setItem(
      PRACTICE_KEYS.reader,
      JSON.stringify({ size: "lg", comfort: true, lowData: false }),
    );
    // eslint-disable-next-line no-eval
    eval(READER_SCRIPT);
    expect(document.documentElement.classList.contains("text-size-lg")).toBe(true);
    expect(document.documentElement.classList.contains("reading-comfort")).toBe(true);
    expect(document.documentElement.classList.contains("low-data")).toBe(false);

    document.documentElement.className = "";
    localStorage.setItem(PRACTICE_KEYS.reader, "{{{");
    // eslint-disable-next-line no-eval
    expect(() => eval(READER_SCRIPT)).not.toThrow();
    expect(document.documentElement.className).toBe("");
  });

  it("carries no closing script tag that would break the inline block", () => {
    expect(READER_SCRIPT).not.toContain("</script");
  });
});

describe("ReaderControls", () => {
  it("groups the controls under a name a screen reader can find", () => {
    render(<ReaderControls />);
    expect(screen.getByRole("group", { name: /reading/i })).toBeInTheDocument();
  });

  it("offers the three text sizes as one radio group", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("radio", { name: "Large" }));
    expect(document.documentElement.classList.contains("text-size-lg")).toBe(true);
    expect(document.documentElement.classList.contains("text-size-md")).toBe(false);
  });

  it("toggles comfortable reading and stores it", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("switch", { name: /comfortable reading/i }));
    expect(document.documentElement.classList.contains("reading-comfort")).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.reader) ?? "{}").comfort).toBe(true);
  });

  it("toggles low-data mode and stores it", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("switch", { name: /low-data/i }));
    expect(document.documentElement.classList.contains("low-data")).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.reader) ?? "{}").lowData).toBe(true);
  });

  it("restores what was stored on the previous visit", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.reader,
      JSON.stringify({ size: "sm", comfort: false, lowData: true }),
    );
    render(<ReaderControls />);
    expect(await screen.findByRole("radio", { name: "Small" })).toBeChecked();
    expect(screen.getByRole("switch", { name: /low-data/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run components/practice/reader-controls.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/reader-controls"`.

- [ ] **Step 7: Write `components/practice/reader-controls.tsx`**

```tsx
"use client";

import { useId } from "react";
import { PRACTICE_KEYS, type FontSize } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Switch, Text } from "@/components/ui";
import { useReaderPrefs } from "./hooks";

/**
 * The pre-paint script (spec §5.2b: "applied as classes on `<html>` before
 * paint to avoid flicker").
 *
 * `app/layout.tsx` inlines this string as the first child of `<body>`, so it
 * runs before any page content is parsed. It is deliberately tiny, ES5, and
 * wrapped in try/catch: a blocked `localStorage` must cost the visitor a
 * preference, never a blank page. No template literals and no `</script`
 * substring, because it is injected with `dangerouslySetInnerHTML`.
 */
export const READER_SCRIPT =
  '(function(){try{var r=localStorage.getItem("' +
  PRACTICE_KEYS.reader +
  '");if(!r)return;var p=JSON.parse(r);if(!p||typeof p!=="object")return;var e=document.documentElement;var s=p.size;if(s==="sm"||s==="md"||s==="lg"){e.classList.add("text-size-"+s);}if(p.comfort===true){e.classList.add("reading-comfort");}if(p.lowData===true){e.classList.add("low-data");}}catch(err){}})();';

const SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

/**
 * Font size, comfortable reading, and low-data mode (spec §7.4.7). Rendered in
 * the site footer and in the mobile drawer.
 */
export function ReaderControls({ layout = "stack" }: { layout?: "row" | "stack" }) {
  const baseId = useId();
  const { prefs, setPrefs } = useReaderPrefs();

  return (
    <div
      role="group"
      aria-label="Reading preferences"
      className={cn(
        "flex gap-5",
        layout === "row" ? "flex-row flex-wrap items-center" : "flex-col",
      )}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-kicker uppercase text-ink-faint">Text size</legend>
        <div className="flex gap-2">
          {SIZES.map((size) => (
            <label
              key={size.value}
              className={cn(
                "cursor-pointer rounded-pill border px-4 py-2 text-small transition-colors duration-150 ease-out",
                prefs.size === size.value
                  ? "border-primary bg-primary-tint text-primary-deep"
                  : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={`${baseId}-size`}
                value={size.value}
                checked={prefs.size === size.value}
                onChange={() => setPrefs({ ...prefs, size: size.value })}
                className="sr-only"
              />
              {size.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Switch
        checked={prefs.comfort}
        onChange={(next) => setPrefs({ ...prefs, comfort: next })}
        label="Comfortable reading"
      />

      <div className="flex flex-col gap-1">
        <Switch
          checked={prefs.lowData}
          onChange={(next) => setPrefs({ ...prefs, lowData: next })}
          label="Low-data mode"
        />
        <Text size="caption" tone="faint">
          Hides photographs. Diagrams and text stay.
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Append the reader CSS to `app/globals.css`**

Add this block at the very end of the file, after the `prefers-reduced-motion` block. Nothing above it changes.

```css
/* ------------------------------------------------------------------ */
/*  Reader modes (spec §7.4.7)                                         */
/*  Driven by ReaderControls and by the pre-paint script in            */
/*  app/layout.tsx. These rules sit outside @layer on purpose: an      */
/*  unlayered rule beats a layered utility, so `reading-comfort` can   */
/*  override `text-center` and `text-balance` without !important.      */
/* ------------------------------------------------------------------ */

/* Text size. Everything on the type scale is in rem, so moving the root
   size moves body copy, controls and spacing together. Headline sizes use
   clamp() with a vw term, so they scale less — which is what you want. */
html.text-size-sm { font-size: 15px; }
html.text-size-md { font-size: 16px; }
html.text-size-lg { font-size: 18px; }

/* Comfortable reading: wider tracking, 1.8 leading, ragged-right, and a
   measure that stays inside 68 characters. */
html.reading-comfort body {
  letter-spacing: 0.012em;
  word-spacing: 0.06em;
  line-height: 1.8;
}
html.reading-comfort :where(p, li, blockquote, figcaption) {
  line-height: 1.8;
  max-width: 68ch;
}
html.reading-comfort :where(p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption) {
  text-align: left;
  text-wrap: wrap;
}

/* Low-data mode: photographs are replaced by a labelled placeholder.
   Diagrams (DiagramFrame renders a <figure> with no <img>) are untouched.
   Lazy images inside a display:none subtree are never fetched, which covers
   every Figure except the one `priority` hero per page. */
html.low-data figure:has(img) > div:has(img) {
  display: none;
}
html.low-data figure:has(img)::before {
  content: "Image hidden. Low-data mode is on.";
  display: block;
  padding: 1.25rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r-lg);
  background: var(--band);
  color: var(--ink-faint);
  font-size: var(--text-caption);
  text-align: center;
}
```

- [ ] **Step 9: Add the pre-paint script to `app/layout.tsx`**

Add the import beside the other component imports:

```tsx
import { READER_SCRIPT } from "@/components/practice/reader-controls";
```

Then, inside `<body>`, insert the script **before** the existing JSON-LD script so it is the first thing the browser executes:

```tsx
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: READER_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
```

Nothing else in `app/layout.tsx` changes. `READER_SCRIPT` is a plain string constant exported from a `"use client"` module, which is a client reference — importing it into the server layout would fail. **Guard against that:** if `npm run build` reports "Attempted to call READER_SCRIPT() from the server", move the constant into `lib/practice-store.ts` (which has no `"use client"`), export it as `READER_SCRIPT` from there, and re-export it from `reader-controls.tsx`. Check this in Step 11 before committing.

- [ ] **Step 10: Write `components/practice/index.ts`**

The barrel every page and wire-up imports from. Alphabetical, no `export *`.

```ts
export { Annotated, DOCTRINE_NOTE, getExample, type AnnotatedExample } from "./annotated";
export { BeforeAfter, getPair, splitHighlights, type BeforeAfterPair } from "./before-after";
export { DECKS, Deck, getDeck, type DeckCard, type DeckData } from "./deck";
export { ExportButton, type ExportButtonProps, type ExportKind } from "./export-button";
export {
  useJournalWeek,
  usePlanDays,
  usePracticeSlot,
  useReaderPrefs,
  useToday,
} from "./hooks";
export { Journal } from "./journal";
export { PracticeFooter } from "./practice-footer";
export { Quiz, getQuestions } from "./quiz";
export { QuizRunner, type QuizQuestion } from "./quiz-runner";
export { READER_SCRIPT, ReaderControls } from "./reader-controls";
export { Scenario } from "./scenario";
export { Streak } from "./streak";
export { StudyTimer, SHAPES, type SessionShape } from "./study-timer";
export { Term } from "./term";
export { TimezoneOverlap } from "./timezone-overlap";
export { Tldr } from "./tldr";
export { usePracticeDue } from "./use-practice-due";
```

- [ ] **Step 11: Run the suite, type-check and build**

Run: `npx vitest run components/practice && npx tsc --noEmit && npm run build`
Expected: every practice suite passes; `tsc` silent; the build completes at the current route count with no new warnings. If the build complains about `READER_SCRIPT`, apply the fallback in Step 9 and re-run.

- [ ] **Step 12: Check the reader classes by hand**

Start `npm run dev`, open any guide page, and in the console run:

```js
document.documentElement.classList.add("reading-comfort", "low-data", "text-size-lg");
```

Expected: body copy grows, paragraphs go ragged-right at 1.8 leading and stop at about 68 characters, every photograph is replaced by a dashed "Image hidden" panel, and diagrams still render. Reload with the classes removed and confirm the page is back to normal. Then toggle the same three from the footer controls and reload: the page comes back already in that mode with no flash of the default styling.

- [ ] **Step 13: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/practice/export-button.tsx components/practice/export-button.test.tsx components/practice/reader-controls.tsx components/practice/reader-controls.test.tsx components/practice/index.ts app/globals.css app/layout.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): add ExportButton, ReaderControls, reader-mode CSS and the pre-paint script"
```

---

### Task 15: The `/practice` and `/glossary` routes

**Parallel group:** E

**Files:**
- Create: `app/practice/page.tsx`, `app/glossary/page.tsx`, `components/practice/practice-hub.tsx`, `components/practice/glossary-browser.tsx`, `components/practice/practice-hub.test.tsx`
- Modify: `data/site.json` (delete four `"pending": true` keys), `data/library.json` (delete two `"pending": true` lines), `components/practice/index.ts` (two lines)

**Interfaces:**
- Consumes: `PageFooterNav`, `PageHero`, `Section`, `SectionHeading`, `CardGrid` from `@/components/layout`; `Badge`, `Button`, `Card`, `EmptyState`, `Field`, `Heading`, `Icon`, `Input`, `Stat`, `StatStrip`, `Text` from `@/components/ui`; `LIBRARY`, `findNavNeighbours`, `getBreadcrumb` from `@/lib/nav`; `pageMeta` from `@/lib/meta`; `Deck`, `DECKS`, `Journal`, `Streak`, `usePracticeDue`, `usePracticeSlot` from `@/components/practice`; `TERMS`, `filterTerms`, `groupByLetter` from `@/lib/glossary`; `formatIsoDate` from `@/lib/dates`; `nextDue` from `@/lib/leitner`.
- Produces:
  - `export function PracticeHub()` — client; the whole `/practice` body.
  - `export function GlossaryBrowser()` — client; the whole `/glossary` body.
  - The routes `/practice` and `/glossary`, which the header dropdown, mobile drawer, footer, search index, `/library` and the sitemap all start rendering the moment the `pending` keys are gone.

- [ ] **Step 1: Delete the `pending` keys**

Phase 2 authored `/practice` and `/glossary` with `"pending": true` in two places each in `data/site.json` (the Learn dropdown's `footerLinks`, and the Learn bucket in `navGroups`) and one place each in `data/library.json`. Deleting those six keys is the whole switch-on — no component changes anywhere.

In `data/site.json`, the two `footerLinks` entries become:

```json
      "footerLinks": [
        { "label": "Practice", "href": "/practice", "desc": "Flashcards and quizzes on a spacing schedule." },
        { "label": "Glossary", "href": "/glossary", "desc": "Plain definitions for every term this site uses." }
      ]
```

and the two `navGroups` Learn entries become:

```json
        { "label": "Practice", "href": "/practice" },
        { "label": "Glossary", "href": "/glossary" }
```

In `data/library.json`, delete the single `"pending": true,` line from each of the two entries, leaving:

```json
    {
      "label": "Practice",
      "href": "/practice",
      "group": "tools",
      "type": "tool",
      "desc": "Flashcards and quizzes on a spacing schedule, so what you read stays."
    },
    {
      "label": "Glossary",
      "href": "/glossary",
      "group": "tools",
      "type": "tool",
      "desc": "Plain definitions for every term this site uses, with Tagalog glosses."
    }
```

**`/educators` keeps its `"pending": true` in both files.** Phase 7 removes it.

- [ ] **Step 2: Verify exactly what is left pending**

Run:
```bash
grep -n '"pending"' data/site.json data/library.json
```
Expected: exactly two lines, both on the `/educators` entry — one in `data/site.json` (the "More" bucket in `navGroups`) and one in `data/library.json`. If `/practice` or `/glossary` still appears, you missed an occurrence.

Run:
```bash
node -e "const s=require('./data/site.json');const l=require('./data/library.json');const j=JSON.stringify({s,l});for(const r of ['/practice','/glossary'])console.log(r, j.includes(r))"
```
Expected: both `true` — the routes are still authored, just no longer pending.

- [ ] **Step 3: Write the failing hub test**

Create `components/practice/practice-hub.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PathProvider } from "@/lib/path-context";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { PracticeHub } from "@/components/practice/practice-hub";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderHub() {
  render(
    <PathProvider>
      <PracticeHub />
    </PathProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0));
});

describe("PracticeHub", () => {
  it("explains the method to a visitor with no history", async () => {
    renderHub();
    expect(await screen.findByText(/Nothing recorded yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How to study/i })).toHaveAttribute("href", "/learn");
  });

  it("counts everything as due on a first visit", async () => {
    renderHub();
    expect(await screen.findByTestId("due-cards")).toHaveTextContent("86");
    expect(screen.getByTestId("due-questions")).toHaveTextContent("54");
  });

  it("shows all four decks", async () => {
    renderHub();
    const headings = await screen.findAllByRole("heading", { level: 3 });
    const titles = headings.map((heading) => heading.textContent);
    for (const title of ["Interview questions", "Red flags", "Get Legit terms", "English habits"]) {
      expect(titles).toContain(title);
    }
  });

  it("lists the quizzes already taken, with the score and the next review", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.quiz,
      JSON.stringify({
        questions: { "english-1": { box: 2, due: "2026-08-23" } },
        routes: { "/english": { score: 2, total: 3, taken: "2026-08-20" } },
      }),
    );
    renderHub();
    const history = await screen.findByTestId("quiz-history");
    expect(history).toHaveTextContent("English at Work");
    expect(history).toHaveTextContent("2 of 3");
    expect(history).toHaveTextContent("23 Aug 2026");
  });

  it("carries the weekly journal", async () => {
    renderHub();
    expect(await screen.findByRole("textbox", { name: /this week/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run it and watch it fail**

Run: `npx vitest run components/practice/practice-hub.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/practice/practice-hub"`.

- [ ] **Step 5: Write `components/practice/practice-hub.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import practiceData from "@/data/practice.json";
import { formatIsoDate } from "@/lib/dates";
import { nextDue, type Schedule } from "@/lib/leitner";
import { LIBRARY } from "@/lib/nav";
import { EMPTY_QUIZ, PRACTICE_KEYS, parseQuizState } from "@/lib/practice-store";
import { CardGrid, SectionHeading } from "@/components/layout";
import { Button, Card, EmptyState, Heading, Icon, Stat, StatStrip, Text } from "@/components/ui";
import { DECKS, Deck } from "./deck";
import { usePracticeSlot } from "./hooks";
import { Journal } from "./journal";
import { Streak } from "./streak";
import { usePracticeDue } from "./use-practice-due";

const ROUTE_QUESTIONS = practiceData.routes as Record<string, { questions: { id: string }[] }>;

function labelFor(href: string): string {
  return LIBRARY.find((entry) => entry.href === href)?.label ?? href;
}

/**
 * The `/practice` body (spec §7.4.1): what is due, the four decks, what you
 * have already been quizzed on, the streak, and this week's journal prompt.
 */
export function PracticeHub() {
  const due = usePracticeDue();
  const { value: quiz, hydrated } = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);

  const history = useMemo(
    () =>
      Object.entries(quiz.routes)
        .map(([route, run]) => {
          const ids = ROUTE_QUESTIONS[route]?.questions.map((question) => question.id) ?? [];
          const schedules = ids
            .map((id) => quiz.questions[id])
            .filter((entry): entry is Schedule => Boolean(entry));
          return { route, run, due: nextDue(schedules) };
        })
        .sort((a, b) => (a.run.taken < b.run.taken ? 1 : -1)),
    [quiz],
  );

  const nothingYet = hydrated && history.length === 0 && due.cards === 86;

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6">
        <SectionHeading
          kicker="Due now"
          title="What is waiting for you"
          lead="Cards and questions come back on a widening schedule: one day, then two, four, eight, sixteen. Missing one sends it back to the start."
        />
        <StatStrip>
          <Stat
            value={<span data-testid="due-cards">{due.cards}</span>}
            label="cards due"
            sub="across four decks"
          />
          <Stat
            value={<span data-testid="due-questions">{due.questions}</span>}
            label="questions due"
            sub="from the guides you have read"
          />
        </StatStrip>
        <Streak />
      </section>

      {nothingYet && (
        <EmptyState
          icon="brain"
          title="Nothing recorded yet"
          body="Reading a page and recognising it later are different skills. Answer three questions at the end of any guide, or run a deck below, and this page starts tracking what to come back to."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/learn" variant="primary">
                How to study, and why this works
              </Button>
              <Button href="/library" variant="outline">
                Pick a guide
              </Button>
            </div>
          }
        />
      )}

      <section className="flex flex-col gap-6">
        <SectionHeading
          kicker="Decks"
          title="Four decks, eighty-six cards"
          lead="Answer from memory before you flip. The card you find hardest is the one that comes back soonest."
        />
        <CardGrid cols={2}>
          {DECKS.map((deck) => (
            <Deck key={deck.id} deckId={deck.id} />
          ))}
        </CardGrid>
      </section>

      {history.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading kicker="History" title="Guides you have been quizzed on" />
          <ul data-testid="quiz-history" className="flex flex-col gap-3">
            {history.map((entry) => (
              <li key={entry.route}>
                <Card padding="sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <Heading level={3} size="h5">
                        {labelFor(entry.route)}
                      </Heading>
                      <Text size="caption" tone="faint">
                        {entry.run.score} of {entry.run.total} on {formatIsoDate(entry.run.taken)}
                        {entry.due ? ` · back on ${formatIsoDate(entry.due)}` : ""}
                      </Text>
                    </div>
                    <Button
                      href={entry.route}
                      variant="link"
                      iconEnd={<Icon name="arrow-up-right" size={14} />}
                    >
                      Run it again
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <SectionHeading
          kicker="Reflection"
          title="One question a week"
          lead="Twelve prompts, rotating. Written in your browser, read by nobody else."
        />
        <Journal />
      </section>
    </div>
  );
}
```

**Type note:** `Stat`'s `value` is `ReactNode`, so the `<span data-testid>` wrapper is valid. If `tsc` disagrees, put the testid on a wrapping `<div>` around the `Stat` and update the test's query to `within(screen.getByTestId("due-cards")).getByText("86")`.

- [ ] **Step 6: Run it and watch it pass**

Run: `npx vitest run components/practice/practice-hub.test.tsx`
Expected: PASS — 5 tests, 0 failed.

- [ ] **Step 7: Write `app/practice/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { PracticeHub } from "@/components/practice/practice-hub";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";

export const metadata: Metadata = pageMeta({
  path: "/practice",
  title: "Practice",
  description:
    "Flashcards and quizzes on a spacing schedule, so what you read on this site is still there in a month. Saved in your browser, sent nowhere.",
});

export default function PracticePage() {
  const neighbours = findNavNeighbours("/practice");

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb("/practice")}
        kicker="Practice"
        title="Bring it back from memory."
        lead="Reading a page twice feels like learning. Recalling it a week later is learning. Everything here is saved in your browser and sent nowhere."
      />
      <Section>
        <PracticeHub />
      </Section>
      <Section spacing="none">
        <PageFooterNav
          prev={neighbours.prev}
          next={neighbours.next}
          up={neighbours.up}
          className="pb-20"
        />
      </Section>
    </>
  );
}
```

- [ ] **Step 8: Write `components/practice/glossary-browser.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { TERMS, filterTerms, groupByLetter } from "@/lib/glossary";
import { CardGrid } from "@/components/layout";
import { Badge, Button, Card, Field, Heading, Icon, Input, Text } from "@/components/ui";

/**
 * `/glossary` (spec §7.4.6): every term this site uses, A to Z, with the guide
 * that explains it. The filter matches the term and the definition, so
 * searching "revisions" finds "Scope" even though the word is not in the name.
 */
export function GlossaryBrowser() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupByLetter(filterTerms(TERMS, query)), [query]);
  const count = useMemo(() => groups.reduce((total, group) => total + group.terms.length, 0), [groups]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Field label="Filter the glossary" hint="Matches the term and the definition.">
          <Input
            type="search"
            value={query}
            placeholder="retainer, 2307, scope creep…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Text size="small" aria-live="polite">
          {count} {count === 1 ? "term" : "terms"}
          {query.trim() ? ` matching “${query.trim()}”` : ""}.
        </Text>
      </div>

      {count === 0 && (
        <Text>
          Nothing matches that. Try a shorter word, or browse the whole list by clearing the filter.
        </Text>
      )}

      {groups.map((group) => (
        <section key={group.letter} className="flex flex-col gap-4">
          <Heading level={2} size="h3" id={`letter-${group.letter}`}>
            {group.letter}
          </Heading>
          <CardGrid cols={2} as="ul">
            {group.terms.map((term) => (
              <Card key={term.id} as="li" padding="md">
                <div className="flex flex-col gap-2">
                  <Heading level={3} size="h5">
                    {term.term}
                  </Heading>
                  <Text size="small">{term.definition}</Text>
                  {term.taglish && (
                    <Text size="caption" tone="faint">
                      {term.taglish}
                    </Text>
                  )}
                  {term.href && (
                    <div className="pt-1">
                      <Button
                        href={term.href}
                        variant="link"
                        iconEnd={<Icon name="arrow-up-right" size={14} />}
                      >
                        Where this is explained
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </CardGrid>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Write `app/glossary/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { GlossaryBrowser } from "@/components/practice/glossary-browser";
import { GLOSSARY_LAST_VERIFIED, TERMS } from "@/lib/glossary";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { Text } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  path: "/glossary",
  title: "Glossary",
  description:
    "Plain definitions for every term this site uses, with a Tagalog gloss where one helps and a link to the guide that explains it.",
});

export default function GlossaryPage() {
  const neighbours = findNavNeighbours("/glossary");

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb("/glossary")}
        kicker="Glossary"
        title="Every term this site uses."
        lead={`${TERMS.length} definitions in plain English, each one linked to the guide that teaches it. Some carry a Tagalog gloss.`}
      />
      <Section>
        <GlossaryBrowser />
        <Text size="caption" tone="faint" className="mt-12">
          Definitions last checked {GLOSSARY_LAST_VERIFIED}.
        </Text>
      </Section>
      <Section spacing="none">
        <PageFooterNav
          prev={neighbours.prev}
          next={neighbours.next}
          up={neighbours.up}
          className="pb-20"
        />
      </Section>
    </>
  );
}
```

- [ ] **Step 10: Add the two hub components to the barrel**

Append to `components/practice/index.ts`, keeping the list alphabetical:

```ts
export { GlossaryBrowser } from "./glossary-browser";
export { PracticeHub } from "./practice-hub";
```

- [ ] **Step 11: Build and check the routes are live**

Run: `npm run build`
Expected: exit 0 with two more routes than the previous build, including `/practice` and `/glossary`.

Run: `npm run verify:links`
Expected: `Link audit passed: … 2 links pending a later phase.` — down from 5, because only `/educators` is still pending.

Run: `npm run dev` and open `http://localhost:3000/sitemap.xml`
Expected: `/practice` and `/glossary` both appear; `/educators` does not.

- [ ] **Step 12: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/site.json data/library.json app/practice/page.tsx app/glossary/page.tsx components/practice/practice-hub.tsx components/practice/practice-hub.test.tsx components/practice/glossary-browser.tsx components/practice/index.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): ship /practice and /glossary and switch off their pending flags"
```

---

### Task 16: Wire `ExportButton` into the four places the visitor owns something

**Parallel group:** F

**Files:**
- Modify: `components/plan-wizard.tsx`, `components/application-tracker.tsx`, `components/build-labs.tsx`, `components/integrity-oath.tsx`

**Interfaces:**
- Consumes: `ExportButton`, `usePlanDays` from `@/components/practice`; `planToIcs` from `@/lib/ics`; `labToMarkdown`, `rowsToCsv` from `@/lib/markdown-export`; `todayISO` from `@/lib/dates`.
- Produces: no new exports. Four additive edits.

**The rule these four edits obey (spec §7.4.4):** *export is for what the user wrote; never for anything we wrote.* Each `build()` below reads user state only. The 30-day plan is the one that needs care: `plan.json`'s day tasks are our copy, so the calendar carries the day number and the tick state the visitor chose — the task text goes in the description because the visitor is exporting *their* schedule of *their* commitments, and a calendar entry is not a deliverable anyone can rename and pass off as their own work. The oath is the sharper case: the ten clauses are our writing, so the export carries the visitor's own commitment paragraph, their name, the date they signed, and a count of clauses accepted — never the clause text.

- [ ] **Step 1: `components/plan-wizard.tsx` — switch to `markPlanDay` and add two exports**

Add to the imports:

```tsx
import { ExportButton, usePlanDays } from "@/components/practice";
import { todayISO } from "@/lib/dates";
import { planToIcs } from "@/lib/ics";
import { labToMarkdown } from "@/lib/markdown-export";
```

Replace line 128:

```tsx
  const { state, hydrated, choosePath, togglePlanDay, setPlanAnswers } = usePath();
```

with:

```tsx
  const { state, hydrated, choosePath, setPlanAnswers } = usePath();
  // markPlanDay calls the context's togglePlanDay and records the date in the
  // practice store, which is what `Streak` counts. lib/path-context.tsx is
  // unchanged.
  const { markPlanDay } = usePlanDays();
```

Replace line 304:

```tsx
                                onChange={() => togglePlanDay(day.day)}
```

with:

```tsx
                                onChange={() => markPlanDay(day.day)}
```

Add the two export buttons to the action row at line 334, between `Change my path` and `Start over`:

```tsx
                <ExportButton
                  title="my 30-day plan"
                  kind="ics"
                  filename="hire-from-ph-30-day-plan.ics"
                  label="Add to calendar"
                  build={() =>
                    planToIcs({
                      title: "My 30-day plan",
                      startDate: todayISO(),
                      days: plan.weeks
                        .flatMap((week) => week.days)
                        .filter((day) => !state.planDays[day.day])
                        .map((day) => ({
                          n: day.day,
                          title: day.task,
                          desc: `Open ${day.tool} on hirefrom.ph`,
                        })),
                    })
                  }
                />
                <ExportButton
                  title="my 30-day plan"
                  kind="markdown"
                  filename="hire-from-ph-30-day-plan.md"
                  build={() =>
                    labToMarkdown(
                      "My 30-day plan",
                      plan.weeks.map((week) => ({
                        label: `Week ${week.week} — ${week.title}`,
                        body: week.days
                          .map(
                            (day) =>
                              `- [${state.planDays[day.day] ? "x" : " "}] Day ${day.day}: ${day.task}`,
                          )
                          .join("\n"),
                      })),
                    )
                  }
                />
```

Note the `.filter(...)` on the calendar export: days already ticked are left out, so the calendar holds what is still ahead of the visitor rather than a month of events they have finished.

- [ ] **Step 2: `components/application-tracker.tsx` — add the CSV export**

Add to the imports:

```tsx
import { ExportButton } from "@/components/practice";
import { rowsToCsv } from "@/lib/markdown-export";
```

Add a `csv` memo directly under the existing `tsv` memo (which stays — the clipboard copy is still useful):

```tsx
  const csv = useMemo(
    () =>
      rowsToCsv(
        ["Company", "Role", "Source", "Link", "Status", "Applied", "Follow-up", "Notes"],
        applications.map((a) => [
          a.company,
          a.role,
          a.source,
          a.link,
          STATUS_LABEL[a.status],
          a.appliedAt,
          a.followUpAt,
          a.notes,
        ]),
      ),
    [applications],
  );
```

Then, at line 442, put the download beside the copy button:

```tsx
          {applications.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton value={tsv} label="Copy pipeline as TSV" />
              <ExportButton
                title="my application pipeline"
                kind="csv"
                filename="my-applications.csv"
                build={() => csv}
              />
            </div>
          )}
```

Unlike `tsvCell`, `rowsToCsv` quotes rather than flattens, so a multi-line note survives the export intact.

- [ ] **Step 3: `components/build-labs.tsx` — replace the two `DownloadButton`s**

Add to the imports:

```tsx
import { ExportButton } from "@/components/practice";
import { labToMarkdown } from "@/lib/markdown-export";
```

`buildDocument` already assembles only the visitor's answers. Give it a Markdown sibling directly beneath it:

```tsx
/** The same answers as `buildDocument`, as Markdown. Still never our copy. */
function buildMarkdown(lab: Lab, labAnswers: Record<string, string>): string {
  return labToMarkdown(
    lab.name,
    lab.builder.steps.map((step) => ({
      label: step.label,
      body: labAnswers[step.id]?.trim() ?? "",
    })),
  );
}
```

Replace the `DownloadButton` at line 511:

```tsx
                  <DownloadButton value={document} filename={`${lab.id}.md`} />
```

with:

```tsx
                  <ExportButton
                    title={lab.name}
                    kind="markdown"
                    filename={`${lab.id}.md`}
                    build={() => buildMarkdown(lab, answers)}
                  />
```

and do the same at line 630, which uses the same `lab` and `answers` in scope. Then delete the now-unused import:

```tsx
import { DownloadButton } from "@/components/download-button";
```

Run `grep -rn "DownloadButton" --include=*.tsx app components` afterwards. If nothing outside `components/download-button.tsx` matches, delete that file too — it is the last `lucide-react` import in this component tree, and Phase 5's `verify:primitives --strict` fails on it.

- [ ] **Step 4: `components/integrity-oath.tsx` — export the visitor's own words**

Add to the imports:

```tsx
import { ExportButton } from "@/components/practice";
import { labToMarkdown } from "@/lib/markdown-export";
```

Add the button inside the signed panel, next to the "Revise it" button at line 190:

```tsx
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ExportButton
                title="my integrity oath"
                kind="markdown"
                filename="my-integrity-oath.md"
                label="Save what I wrote"
                build={() =>
                  labToMarkdown("My integrity oath", [
                    { label: "My commitment", body: commitment.trim() },
                    { label: "Signed", body: `${name.trim()} · ${signedDate}` },
                    {
                      label: "Clauses accepted",
                      body: `${accepted} of ${oath.clauses.length}`,
                    },
                  ])
                }
              />
              <button
                type="button"
                onClick={unsign}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-paper-2 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <RotateCcw size={14} /> Revise it
              </button>
            </div>
```

(the existing `unsign` button moves inside the new wrapper `div`; nothing about it changes).

**The clause text is deliberately absent.** The ten clauses are our writing. What the visitor owns is the commitment paragraph they typed, their name, and the date — so that is what comes out of the file.

- [ ] **Step 5: Type-check, lint and test**

Run: `npx tsc --noEmit && npx eslint components && npm run test:unit`
Expected: no output from `tsc` or `eslint`; every suite green.

- [ ] **Step 6: Try each export by hand**

Start `npm run dev`, then:

1. `/plan` — answer the wizard, tick two days, click **Add to calendar**. Open the `.ics` in Google Calendar (import) or macOS Calendar. Expected: one all-day event per untick­ed day, starting today, titled `Day 3 — …`, and re-importing the same file updates the same events rather than duplicating them.
2. `/plan` — click **Download Markdown**. Expected: four `## Week n` sections with `- [x]` on the days you ticked.
3. `/tracker` — log two applications, one with a comma and a line break in the notes. Click **Download CSV** and open it in Excel or Google Sheets. Expected: eight columns, the note intact in one cell, accented characters correct.
4. `/build` — write two steps of the resume lab, click **Download Markdown**. Expected: only the steps you filled in; no prompts, no hints, no example text.
5. `/conduct` — sign the oath, click **Save what I wrote**. Expected: your commitment, your name, the date, and `10 of 10` — and no clause text.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/plan-wizard.tsx components/application-tracker.tsx components/build-labs.tsx components/integrity-oath.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): export the plan, the pipeline, the labs and the oath as the visitor's own files"
```

---

### Task 17: Wire the practice components into the pages that need them

**Parallel group:** F

**Files:**
- Modify: `app/path/page.tsx`, `app/markets/page.tsx`, `app/learn/page.tsx`, `components/site/footer.tsx`, `components/site/mobile-drawer.tsx`

**Interfaces:**
- Consumes: `Journal`, `ReaderControls`, `Streak`, `StudyTimer`, `TimezoneOverlap` from `@/components/practice`; `SectionHeading` from `@/components/layout`.
- Produces: no new exports.

- [ ] **Step 1: `app/path/page.tsx` — add the streak and the journal**

`/path` is already a client component (`"use client"` on line 1), so the two components drop straight in.

Add to the imports:

```tsx
import { Journal, Streak } from "@/components/practice";
```

Add `<Streak />` to the header section, directly after the stats `<dl>` block that closes with `</Reveal>` at the end of the "HEADER" section:

```tsx
        <Reveal i={4}>
          <div className="mt-8">
            <Streak />
          </div>
        </Reveal>
      </section>
```

Add the journal as its own section, immediately before the closing `{/* ------------------------------------------------------------ TOOLKIT */}` comment:

```tsx
      {/* ---------------------------------------------------------- JOURNAL */}
      <section className="container-x pb-14">
        <Reveal>
          <SectionHeading
            kicker="One question a week"
            title="What moved this week"
            lead="Twelve prompts, rotating. Saved in this browser, read by nobody else."
          />
        </Reveal>
        <Reveal i={1} className="mt-8">
          <Journal />
        </Reveal>
      </section>
```

`SectionHeading` is already imported on line 11 of this file. If Phase 5 has already rebuilt `/path` on `Section`/`SectionHeading` from `@/components/layout`, use `<Section>` in place of the `container-x` wrapper and drop the `Reveal`s — the two components take no props either way.

- [ ] **Step 2: `app/markets/page.tsx` — add the overlap tool**

`/markets` is a server component. `TimezoneOverlap` is a client component, so importing and rendering it needs nothing else.

Add to the imports:

```tsx
import { TimezoneOverlap } from "@/components/practice";
```

Add it inside the existing OVERLAP section, directly after the `overlap.note` blockquote and before that section's closing `</div>`:

```tsx
          <Reveal i={2}>
            <div className="mt-10">
              <TimezoneOverlap />
            </div>
          </Reveal>
```

The guide's prose explains what overlap *means*; the tool lets the reader put their own hours in and see the number. Keep both.

- [ ] **Step 3: `app/learn/page.tsx` — add the timer beside the protocol builder**

Add to the imports:

```tsx
import { StudyTimer } from "@/components/practice";
```

Add it inside the PROTOCOL BUILDER section, directly after `<StudyProtocol />`'s `Reveal`:

```tsx
          <Reveal i={2} className="mt-10">
            <StudyTimer />
          </Reveal>
```

The protocol builder tells the reader which session shape fits them; the timer runs one. They belong on the same screen.

- [ ] **Step 4: `components/site/footer.tsx` — add the reader controls**

Add to the imports:

```tsx
import { ReaderControls } from "@/components/practice";
```

Add a row above the copyright line, inside the bordered block at the bottom of the `Container`:

```tsx
        <div className="border-t border-line py-8">
          <div className="flex flex-col gap-6">
            <ReaderControls layout="row" />
            <p className="text-caption text-ink-faint">
              © 2026 {site.brand}. {COPYRIGHT}
            </p>
          </div>
        </div>
```

(the `<p>` is the existing copyright line, moved inside the new wrapper; nothing about its content changes).

`SiteFooter` is a server component and `ReaderControls` is a client component, which is the ordinary direction — no `"use client"` is added to the footer.

- [ ] **Step 5: `components/site/mobile-drawer.tsx` — add the reader controls**

Add to the imports:

```tsx
import { ReaderControls } from "@/components/practice";
```

Add a block above the `SECONDARY_LINKS` list at the bottom of the drawer:

```tsx
          <div className="border-t border-line p-4">
            <ReaderControls layout="stack" />
          </div>

          <ul className="flex flex-col border-t border-line p-2">
```

- [ ] **Step 6: The two lines Phase 5 adds to each of the 18 guide and stage pages**

Phase 5 owns the migration of `/start`, `/get-hired`, `/deliver`, `/level-up`, `/own`, `/method`, `/learn`, `/reality`, `/conduct`, `/english`, `/indispensable`, `/ai-first`, `/legit`, `/salary`, `/markets`, `/languages`, `/resources` and `/portfolio`. This plan does **not** edit those pages. It provides the exact two lines Phase 5 inserts, with `/english` as the worked example:

```tsx
import { PracticeFooter, Tldr } from "@/components/practice";
```

Line 1 — directly **after** the page's `<PageHero …/>`:

```tsx
      <Section spacing="none"><Tldr route="/english" /></Section>
```

Line 2 — directly **before** the page's `<PageFooterNav …/>`:

```tsx
      <PracticeFooter route="/english" />
```

Both components are server components that render `null` for a route with no data, so a page added later needs no guard. The route string is the page's own path; `lib/practice-data.test.ts` fails the build if it does not match a real route.

Record this in `BUILD_GUIDE.md` in Task 18 so the Phase 5 implementer finds it without reading this plan.

- [ ] **Step 7: Type-check, lint, test and build**

Run: `npx tsc --noEmit && npx eslint app components && npm run test:unit && npm run build`
Expected: all silent / green; the build shows the same route count as Task 15.

- [ ] **Step 8: Check the five wire-ups in a browser**

Start `npm run dev`:

1. `/path` with a chosen niche — the streak strip sits under the stats, and the journal section sits above the toolkit.
2. `/markets` — the overlap tool sits under the "quick math" note; moving "Your day starts" changes every row's number.
3. `/learn` — the timer sits under the protocol builder; starting a block and reloading the page resumes the same countdown.
4. Any page, footer — the three reader controls render in one row; toggling large text reflows the page immediately and survives a reload with no flash.
5. Any page at 375px, drawer open — the same controls sit above Library and Privacy, and the drawer still closes on Escape with focus returning to the menu button.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add app/path/page.tsx app/markets/page.tsx app/learn/page.tsx components/site/footer.tsx components/site/mobile-drawer.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(practice): wire the streak, journal, overlap tool, timer and reader controls into the shell"
```

---

### Task 18: `BUILD_GUIDE.md` and phase exit verification

**Parallel group:** G

**Files:**
- Modify: `BUILD_GUIDE.md`
- Create: `screenshots/p6-practice-1280.png`, `screenshots/p6-glossary-375.png`

**Interfaces:**
- Consumes: everything from Tasks 1–17.
- Produces: the Phase 6 exit evidence required by spec §14 row 6 — "Data-integrity tests pass; every guide ends with a `Quiz`; `/practice` shows due items; exports open in Calendar/Markdown apps".

- [ ] **Step 1: Add the practice section to `BUILD_GUIDE.md`**

Insert this block immediately after the existing `## Shared components (import and REUSE — do not re-invent)` section and before `## Page conventions`:

```markdown
## Practice layer (`components/practice/`, `lib/leitner|streak|ics|scenario|overlap|practice-store|glossary`)

- **Export is for what the user wrote; never for anything we wrote.** `ExportButton`'s
  `build()` closure reads user state only: their lab answers, their oath commitment, their
  applications, their plan-day ticks. Our clause text, our prompts, our example copy and our
  guide prose never enter a downloaded file. The no-downloads doctrine exists so nobody leaves
  with a finished deliverable they can rename; an export of their own words is the opposite of
  that.
- **Storage lives in `lib/practice-store.ts`**, in six independent slots under
  `hfph.practice.*`: `quiz`, `deck`, `journal`, `reader`, `plan-days`, `timer`. Never call
  `localStorage` from a component — use `usePracticeSlot(key, empty, parse)` from
  `@/components/practice`, and pass a **module-level** parse function, not an inline arrow.
  Every parser is total: bad JSON, a blocked store, and a missing key all give the empty value.
  `lib/path-context.tsx` still owns `hfph.path.v1`; the two never touch each other's keys.
- **Dates are ISO `YYYY-MM-DD` strings and every date function takes `today` as an argument.**
  `todayISO()` in `lib/dates.ts` is the only clock read. Schedules are `{ box: 1–5, due }` and
  the ladder is 1 / 2 / 4 / 8 / 16 days (`lib/leitner.ts`).
- **`Term` marks the first use of a glossary term on a page, not every use.** Four `Term`s in
  one paragraph is worse than the plain sentence. `<Term id="retainer" />` renders the term
  itself; `<Term id="retainer">retainers</Term>` keeps your wording. An unknown id renders the
  children unchanged rather than throwing.
- **Every guide and stage page carries two lines.** Directly under the `PageHero`:
  `<Section spacing="none"><Tldr route="/x" /></Section>`. Directly above the
  `PageFooterNav`: `<PracticeFooter route="/x" />`. Both render `null` when `data/tldr.json`
  or `data/practice.json` has nothing for that route. `lib/practice-data.test.ts` fails the
  build if a route in either file has no `app/<route>/page.tsx`.
- **Reader modes are three `<html>` classes**, set before paint by the inline script in
  `app/layout.tsx` and kept in step by `useReaderPrefs()`:
  `text-size-sm|md|lg` (root font size), `reading-comfort` (wider tracking, 1.8 leading,
  ragged-right, 68ch measure), `low-data` (photographs become a labelled placeholder;
  diagrams and text stay). The rules live at the end of `app/globals.css`, **outside**
  `@layer`, because an unlayered rule is what lets `reading-comfort` beat a `text-center`
  utility without `!important`. Nothing else may add or remove these classes.
- **The practice JSON is validated, not trusted.** `lib/practice-data.test.ts` checks route
  existence, one correct option per choice question, scenario graph soundness, hotspot block
  ids, glossary hrefs, and id uniqueness. Edit `data/practice.json`, `decks.json`,
  `scenarios.json`, `annotated.json`, `glossary.json`, `reflection.json` or `tldr.json` and
  run `npx vitest run lib/practice-data.test.ts` before you commit.
- **Bundle rule.** `components/practice/hooks.ts` reaches every page through `ReaderControls`
  in the footer, so it may import only small JSON. `practice.json` (54 KB) and `decks.json`
  (30 KB) belong in `components/practice/use-practice-due.ts` and in the server half of
  `Quiz`, never in the shared bundle.
```

Also update the `## Data shapes (in `data/`)` section's first bullet by appending, after the existing list:

```markdown
- Practice data: `practice.json` (`{lastVerified, routes:{"/x":{questions:[{id,type,prompt,options?,answer?,source?}]}}}`), `decks.json` (`{lastVerified, decks:[{id,title,blurb,href,cards:[{id,front,back,source?}]}]}`), `scenarios.json` (`{lastVerified, scenarios:[{id,title,route,intro,start,nodes:{[id]:{text,choices?,end?,debrief?}}}]}`), `annotated.json` (`{lastVerified, doctrineNote, examples:[…], pairs:[…]}`), `glossary.json` (`{lastVerified, terms:[{id,term,definition,taglish?,href?}]}`), `reflection.json` (`{prompts:[{week,prompt}]}`), `tldr.json` (`{_note, routes:{"/x":{tl,reviewed}}}` — `reviewed:false` renders a "draft translation" badge).
```

- [ ] **Step 2: Run the static suite**

Run: `npm run verify:all`
Expected: exit 0, in order:
```
Contrast audit passed: …
Link audit passed: 36 routes, … 2 links pending a later phase.
Claims audit passed: …
(verify:primitives: no violations)
(eslint: no output)
(tsc: no output)
```
The pending count is 2 (both `/educators`), down from 5. The route count is two higher than Phase 5's.

- [ ] **Step 3: Run every test**

Run: `npm test`
Expected: exit 0. `node --test` reports the existing math suites, then Vitest reports the Phase 0–5 suites plus the seventeen new ones:
```
✓ lib/dates.test.ts (13)
✓ lib/leitner.test.ts (15)
✓ lib/streak.test.ts (12)
✓ lib/ics.test.ts (15)
✓ lib/scenario.test.ts (13)
✓ lib/overlap.test.ts (16)
✓ lib/practice-store.test.ts (14)
✓ lib/markdown-export.test.ts (15)
✓ lib/glossary.test.ts (9)
✓ lib/practice-data.test.ts (26)
✓ components/practice/hooks.test.tsx (6)
✓ components/practice/quiz-runner.test.tsx (10)
✓ components/practice/deck.test.tsx (7)
✓ components/practice/scenario.test.tsx (7)
✓ components/practice/annotated.test.tsx (6)
✓ components/practice/before-after.test.tsx (11)
✓ components/practice/term.test.tsx (6)
✓ components/practice/journal-streak.test.tsx (6)
✓ components/practice/timezone-overlap.test.tsx (6)
✓ components/practice/study-timer.test.tsx (7)
✓ components/practice/export-button.test.tsx (6)
✓ components/practice/reader-controls.test.tsx (6)
✓ components/practice/practice-hub.test.tsx (5)
```
Counts may shift by one or two if you added an assertion; a *missing suite* is the failure to look for.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exit 0. Two new routes. No `lucide-react` warning from `components/practice/*`. No hydration warning on `/practice` or `/glossary`.

- [ ] **Step 5: Confirm the practice bundle stayed off the shared chunk**

Run:
```bash
grep -rn "data/practice.json\|data/decks.json" --include=*.ts --include=*.tsx components lib app
```
Expected: `data/practice.json` in `components/practice/quiz.tsx`, `components/practice/practice-hub.tsx`, `components/practice/use-practice-due.ts` and `lib/practice-data.test.ts`; `data/decks.json` in `components/practice/deck.tsx`, `components/practice/use-practice-due.ts` and `lib/practice-data.test.ts`. **Nothing in `components/practice/hooks.ts`.** If either file appears there, move the import back to `use-practice-due.ts`.

- [ ] **Step 6: Confirm the sitemap carries both routes**

Run: `npm run dev`, then in another shell:
```bash
curl -s http://localhost:3000/sitemap.xml | grep -E "practice|glossary|educators"
```
Expected: one `<loc>` for `/practice`, one for `/glossary`, and nothing for `/educators`.

- [ ] **Step 7: Walk the practice layer by hand**

With the dev server running:

1. `/practice` on a clean profile — the empty state explains the method and links `/learn`; the due counts read 86 cards and 54 questions.
2. Run five cards in one deck, answering some wrong. Reload. Expected: the session comes back smaller, and the cards you missed are the ones still due.
3. Open `/english`, expand "TL;DR sa Tagalog" and confirm the "Draft translation" badge is there. Answer the three questions at the bottom. Return to `/practice`: the guide is now in the history list with its score and its next-review date.
4. `/conduct` — walk one scenario to an ending, read the debrief, click "Start over" and take a different fork. Confirm no score appears anywhere.
5. Keyboard-only pass on one `Annotated` example: `Tab` reaches the hotspots in numeric order, `Enter` opens the dialog, `Esc` closes it, and focus returns to the hotspot that opened it.
6. Focus a `Term` with the keyboard and confirm a screen reader (or the accessibility inspector) reads the definition from `aria-describedby` without the popover being open.
7. Turn on low-data mode and reload a page with a hero image: the dashed placeholder is there on first paint, with no flash of the photograph.

- [ ] **Step 8: Take the two screenshots**

With the dev server running and some practice history recorded, use the chrome-devtools tools:

1. `navigate_page` → `http://localhost:3000/practice`; `resize_page` → 1280×900; `take_screenshot` (full page) → save as `screenshots/p6-practice-1280.png`.
2. `resize_page` → 375×812; `navigate_page` → `http://localhost:3000/glossary`; type `retainer` into the filter; `take_screenshot` → save as `screenshots/p6-glossary-375.png`.

Check each before moving on: the practice page shows the due strip, the streak, four decks, the history list and the journal, with no card lifting on hover and no shadowed surfaces; the glossary at 375px shows one column of bordered cards with the filter above them and the count line updating.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add BUILD_GUIDE.md screenshots/p6-practice-1280.png screenshots/p6-glossary-375.png
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs(practice): build-guide rules for exports, storage, Term and reader modes, plus phase 6 exit screenshots"
```

---

## Status

| # | Task | Group | Done |
|---|---|---|---|
| 1 | `lib/dates.ts` and `lib/leitner.ts` | A | [ ] |
| 2 | `lib/streak.ts` | A | [ ] |
| 3 | `lib/ics.ts` | A | [ ] |
| 4 | `lib/scenario.ts` | A | [ ] |
| 5 | `lib/overlap.ts` | A | [ ] |
| 6 | `lib/practice-store.ts` | A | [ ] |
| 7 | `lib/markdown-export.ts` | A | [ ] |
| 8 | Data-integrity suite and the practice hooks | B | [ ] |
| 9 | `Quiz`, `PracticeFooter`, `Tldr` | C | [ ] |
| 10 | `Deck` | C | [ ] |
| 11 | `Scenario`, `Annotated`, `BeforeAfter` | C | [ ] |
| 12 | `Term`, `Journal`, `Streak` | C | [ ] |
| 13 | `TimezoneOverlap`, `StudyTimer` | C | [ ] |
| 14 | `ExportButton`, `ReaderControls`, reader CSS, pre-paint script, barrel | D | [ ] |
| 15 | `/practice` and `/glossary`, `pending` switched off | E | [ ] |
| 16 | `ExportButton` wired into plan, tracker, labs, oath | F | [ ] |
| 17 | Streak, journal, overlap, timer and reader controls wired in | F | [ ] |
| 18 | `BUILD_GUIDE.md` and exit verification | G | [ ] |

**Execution waves.** A → B → C → D → E → F → G. **Within group A, Task 1 runs first**; Tasks 2–7 then run in parallel because every one of them imports `lib/dates.ts`. Tasks 9–13 share group C and touch disjoint files. Tasks 16 and 17 share group F and touch disjoint files.

**Phase 6 exit criteria (spec §14 row 6):**
- [ ] Data-integrity tests pass (`npx vitest run lib/practice-data.test.ts`, 26 assertions)
- [ ] Every one of the 18 guide and stage routes has three authored questions and a `PracticeFooter` line documented for Phase 5
- [ ] `/practice` shows due items, four decks, quiz history, the streak and the journal
- [ ] Exports open in Calendar and in a Markdown reader; the CSV opens in a spreadsheet with accents intact
- [ ] `npm run verify:all` green, with `verify:primitives --strict` inside it
- [ ] `npm test` green, including the 23 new suites
- [ ] `npm run build` green with `/practice` and `/glossary` in the sitemap
- [ ] `screenshots/p6-practice-1280.png` and `screenshots/p6-glossary-375.png` committed

**Handed to later phases:**
- Phase 5 adds the two documented lines (`Tldr`, `PracticeFooter`) to each of the 18 guide and stage pages, and places `Scenario`, `Annotated` and `BeforeAfter` on `/conduct`, `/apply`, `/deliver`, `/clients`, `/build`, `/english` and `/legit` per spec §7.4.2–7.4.3. Every one of those components exists and is tested after this phase; only the page-level placement is left.
- Phase 7 removes the last two `"pending": true` keys when `/educators` ships.
- Phase 8 flips `reviewed` to `true` in `data/tldr.json` once a native speaker has cleared each TL;DR; the "Draft translation" badge disappears with no code change.
- Phase 9 adds `/practice` and `/glossary` to the screenshot matrix in `DESIGN_REVIEW.md` v2.

---

## Self-review

**1. Spec coverage.**

| Spec | Where |
|---|---|
| §5.2b `Quiz` — route key, 3 items, choice + reveal, records attempts, last score, next-review date, before `PageFooterNav` | Task 9 (`Quiz`, `QuizRunner`, `PracticeFooter`); Task 17 Step 6 documents the one-line insertion |
| §5.2b `Deck` — flip, got it / not yet, five-box Leitner, due count via `usePracticeDue()` | Tasks 10 and 8 (`use-practice-due.ts`) |
| §5.2b `Scenario` — branching nodes, choice → consequence → next, debrief with the path taken and the rule each tested, no score | Task 11 (`Scenario`); Task 4 (`walk`) |
| §5.2b `Annotated` — numbered hotspots, click or focus reveals why + rule, buttons in reading order | Task 11 (`Annotated`) |
| §5.2b `BeforeAfter` — draggable divider on desktop, tabs on mobile, changed phrases highlighted | Task 11 (`BeforeAfter`, `splitHighlights`) |
| §5.2b `ExportButton` — client-side Blob download, only what the user wrote | Task 14; the rule is enforced call site by call site in Task 16 |
| §5.2b `Journal` — weekly prompt, one entry per ISO week, on `/path` | Task 12 (`Journal`), Task 8 (`useJournalWeek`), Task 17 Step 1 |
| §5.2b `Streak` — consecutive plan days, no badges or points | Task 12 (`Streak`), Task 2 (`lib/streak.ts`), Task 8 (`usePlanDays`) |
| §5.2b `Term` — dotted underline, hover/focus card, Taglish gloss, `aria-describedby` | Task 12 (`Term`) |
| §5.2b `TimezoneOverlap` — slider for the visitor's window, overlap hours, DST months | Task 13 (`TimezoneOverlap`), Task 5 (`lib/overlap.ts`) |
| §5.2b `StudyTimer` — focus/break blocks, visible plan, persists the running block | Task 13 (`StudyTimer`) |
| §5.2b `Tldr` — "TL;DR sa Tagalog", collapsed by default | Task 9 (`Tldr`) |
| §5.2b `ReaderControls` — font size, comfortable reading, low-data, applied before paint | Task 14 |
| §5.2b "all persist through a `practice.*` namespace" | Task 6 (`PRACTICE_KEYS`, six `hfph.practice.*` slots) |
| §7.4.1 retrieval practice, `/practice` page with due cards, decks, quiz history, streak, empty state linking `/learn` | Tasks 9, 10, 15 |
| §7.4.2 four branching scenarios with debriefs | Tasks 4 and 11; the data was authored ahead of this plan |
| §7.4.3 four annotated artifacts, doctrine note above every one, three `BeforeAfter` pairs | Task 11 |
| §7.4.4 export on lab outputs, the plan (`.ics` + Markdown), the tracker (CSV); build-guide rule | Tasks 14, 16, 18 |
| §7.4.5 journal on `/path`, streak from plan-day completion dates, no badges | Tasks 12, 17 |
| §7.4.6 `glossary.json` rendered inline via `Term` and on `/glossary` (A–Z, filter box); `TimezoneOverlap` on `/markets`; `StudyTimer` on `/learn` | Tasks 12, 13, 15, 17 |
| §7.4.7 `ReaderControls` in the footer and drawer; `Tldr` on 18 routes; drafts flagged for review | Tasks 9, 14, 17 |
| §10 keyboard-complete controls, named regions, 44px targets, `role="timer"`, `role="status"` | Tasks 9–14 (every component test asserts roles and names); Task 18 Step 7 is the manual pass |
| §11 copy rules for the copy this phase writes | All UI strings above; no "actually", "forever", "genuinely", "truly", no "not X, Y" reversals, no triads |
| §12 data shapes; ISO `YYYY-MM-DD`; `{ box: 1–5, due }` | Tasks 1, 6; Task 8 validates the authored files |
| §13 `lib/leitner`, `lib/streak`, `lib/ics`, `lib/scenario` tested first, plus data-integrity tests | Tasks 1–8, every one test-first |
| §14 row 6 exit criteria | Task 18 |

Gaps, deliberately left to another phase: placing `Scenario`, `Annotated` and `BeforeAfter` on the seven guide pages belongs to Phase 5's page migration (this phase builds and tests the components and documents the placement); the print stylesheet named in §7.4.4 belongs to Phase 7, which owns `@page` rules for the educator kit; the second-wave items §7.4 defers (read-aloud, Remotion explainers, formula playground, typing test, live comms linter) are out of scope by the spec's own text.

**2. Placeholder scan.** No "TBD", "TODO", "implement later", "add appropriate error handling", or "similar to Task N" appears. Every code step carries a complete file or an exact before/after edit with the surrounding lines. Four steps carry a conditional, and each shows both concrete outcomes rather than deferring a decision: Task 10 Step 3 (`scheduleRef` correction and the `data-testid` wrapper), Task 13 Step 4 (`fireEvent.change` fallback for the range slider), Task 14 Step 9 (`READER_SCRIPT` fallback if the client-reference boundary rejects it), Task 15 Step 5 (`Stat value` testid wrapper). Task 16 Step 3 ends with a `grep` whose result decides whether `components/download-button.tsx` is deleted, and states both branches.

**3. Type consistency.**

- `IsoDate` is `string` from `lib/dates.ts` and is the type of every date in `lib/leitner.ts`, `lib/streak.ts`, `lib/ics.ts`, `lib/practice-store.ts` and every component. No component declares its own date type.
- `Schedule` is `{ box: Box; due: IsoDate }` in `lib/leitner.ts` and is the value type of both `QuizState.questions` and `DeckState.cards`. `parseSchedule` is the only place a stored schedule is validated, and `practice-store.ts`'s `scheduleMap` is its only caller.
- `schedule(current, correct, today)` keeps that argument order in `QuizRunner.record` and `Deck.answer`. `isDue(entry, today)` keeps its order in `use-practice-due.ts` and `Deck`. `nextDue(entries)` takes an array of `Schedule` in `QuizRunner` and `PracticeHub`.
- `usePracticeSlot` returns `{ value, set, hydrated }` in Task 8 and is destructured that way in `QuizRunner`, `Deck`, `StudyTimer`, `PracticeHub`, `usePlanDays`, `useReaderPrefs`, `useJournalWeek` and `usePracticeDue`. Every call passes a module-level parser (`parseQuizState`, `parseDeckState`, `parseJournalState`, `parseReaderPrefs`, `parsePlanDayDates`, `parseTimerState`), never an inline arrow.
- `PRACTICE_KEYS` is the only source of storage key strings; `READER_SCRIPT` builds its key from `PRACTICE_KEYS.reader` rather than repeating the literal, so the pre-paint script and `useReaderPrefs` can never drift.
- `ReaderPrefs` is `{ size: FontSize; comfort: boolean; lowData: boolean }` in `practice-store.ts`; `applyReaderClasses` (hooks), `ReaderControls`, `READER_SCRIPT` and the CSS in `globals.css` all use the same three names and the same three class names `text-size-*`, `reading-comfort`, `low-data`.
- `QuizQuestion` is declared once in `quiz-runner.tsx` and imported by `quiz.tsx` and the barrel; `practice.json`'s shape is asserted against it by `lib/practice-data.test.ts`.
- `Scenario` (the data type) lives in `lib/scenario.ts`; the component of the same name lives in `components/practice/scenario.tsx` and imports `getScenario`/`walk` rather than re-declaring the type. The barrel exports the component, not the type, so the two names never collide at an import site.
- `HourWindow` is `{ start: number; end: number }` in `lib/overlap.ts` and is what `TimezoneOverlap` builds from its two sliders; `overlap(region, month, mine)` keeps that argument order in the component.
- `ExportMime` is a three-member union in `lib/markdown-export.ts` and `ExportButton`'s `MIME` record is keyed by `ExportKind` with exactly those three values.
- `Crumb` from `lib/nav.ts` is what `getBreadcrumb()` returns and what `PageHero breadcrumb` accepts; `NavNeighbours.prev|next|up` are `NavLink`, structurally assignable to `PageFooterNav`'s `FooterLink` because `desc` and `pending` are optional.
- Phase 1 primitives are used only with the props pinned in their Interfaces blocks: `Button` (`href`, `variant`, `size`, `icon`, `iconEnd`, `disabled`, `onClick`, `aria-label`), `Badge`/`Kicker` (`tone`, `variant`), `Heading` (`level`, `size`, `id`), `Text` (`size`, `tone`, `id`, `className`), `Dialog` (`open`, `onClose`, `title`, `size`), `Range`/`Input`/`Select`/`Textarea` (native props through `ComponentPropsWithoutRef`), `Switch` (`checked`, `onChange`, `label`), `Field` (`label`, `hint`), `ProgressBar` (`value`, `max`, `label`, `hideLabel`, `showValue`, `tone`), `Stat`/`StatStrip`, `Callout` (`tone`, `icon`, `title`), `Source` (`label`, `url`), `EmptyState` (`icon`, `title`, `body`, `action`), `Accordion`/`AccordionItem` (`type`, `id`, `title`), `Tabs`/`TabList`/`Tab`/`TabPanel` (`defaultValue`, `label`, `value`), `Card` (`padding`, `as`), `CardGrid` (`cols`, `as`), `Section` (`band`, `spacing`, `size`), `SectionHeading` (`kicker`, `title`, `lead`), `PageHero` (`compact`, `breadcrumb`, `kicker`, `title`, `lead`), `PageFooterNav` (`prev`, `next`, `up`, `className`). Every icon name used — `arrow-up-right`, `brain`, `calendar-days`, `check-circle-2`, `file-text`, `quote`, `scan-eye`, `shield-alert`, `table` — is in the Phase 1 registry.
