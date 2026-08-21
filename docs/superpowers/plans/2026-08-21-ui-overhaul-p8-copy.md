# UI Overhaul — Phase 8: Copy Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the shell copy (home, site, stage chrome, FAQ, library, educator intro, metadata, empty states, CTA labels) to the §11 voice rules, put those rules behind a linter with unit tests, sweep the 30 content JSONs mechanically, and flag every Tagalog TL;DR for native-speaker review.

**Architecture:** The rules become code first. `lib/voice-lint.ts` holds pure detectors (banned words, "not X, Y" reversals, triads, em-dash chains, duplicated openers, word counts, aphorism cadence) with a Vitest file that pins each one; `scripts/voice-lint.mjs` is the I/O and reporting shell around them and imports the `.ts` module directly (Node 24 strips types natively — verified on this machine, `node v24.18.1`). Only then does any copy change, so every rewrite in Tasks 2–4 is checked by the same detector that will gate the build. Copy scope stays exactly where §11 put it: the shell. The 30 content JSONs get a mechanical sweep and nothing else.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, TypeScript strict, Vitest 3 + Testing Library, `node --test` (legacy math tests), plain Node ESM for `scripts/*.mjs`, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` — §11 (copy pass), §9 (de-slop inventory), §14 row 8 (exit criteria), §7.4.7 (Tagalog TL;DR draft flag), §1 (the 70-word hero paragraph that repeats "forever" twice — the thing being fixed). Style authority: `.claude/skills/anti-ai-slop-writing/SKILL.md` and `.claude/skills/anti-ai-slop-writing/references/banned-words.md`. Doctrine: `BUILD_GUIDE.md` — "Voice & rules" and "THE HONESTY DOCTRINE".

This is plan 9 of 10; Phases 0–7 land before it, Phase 9 (verification and docs) after.

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

### Phase 8 additions to the constraints

- **Copy scope is the shell, full stop.** In scope: `data/home.json`, `data/site.json`, `data/stages.json` chrome, `data/faq.json`, `data/library.json`, `data/educators.json` `intro`/`quickStart`, the `metadata` of `/` and the five stage routes, every `EmptyState` string, every `Button` label in `app/page.tsx` and `components/{journey,layout,site,practice}/**`. Out of scope: `stages.json` `summary`/`doFirst`/`tools`, `educators.json` `sessions`/`slides`/`license`, and the prose of the 26 interior pages. The 30 content JSONs get the mechanical sweep in Task 6 and nothing else.
- **Never touch a `source` object.** No `source.url`, `source.label`, `source.date`, or `source.grade` value changes in any task. `npm run verify:claims` must stay green.
- **Never change a number.** The sweep and the rewrite may not alter a figure, a count, a date, or a currency amount. If a rewrite would drop a number, keep the number.
- **The brand line does not move.** `"Be the reason they hire from the Philippines."` stays byte-for-byte wherever it appears (`data/site.json` `meaning`, the head of `tagline`, `app/layout.tsx` default title).
- **Taglish stays where it already is.** `"Walang bayad, walang catch"` in `data/faq.json` stays. No new Taglish is added anywhere for flavour.
- **Never write "virtual assistant" or "assistant"** as a job title. Always "online professional" / "remote professional" (`BUILD_GUIDE.md`). `data/faq.json` `items[1].q` quotes `"VA course"` as the thing being rejected; that stays.
- **Node 24 type stripping is load-bearing.** `scripts/voice-lint.mjs` imports `../lib/voice-lint.ts` with the explicit `.ts` extension. `lib/voice-lint.ts` must therefore use only erasable TypeScript: `type`, `interface`, and annotations. No `enum`, no `namespace`, no parameter properties, no `declare`.

---

## The rule table (spec §11 + `anti-ai-slop-writing`)

This is the authority every rewrite in Tasks 2–4 is checked against, and every row maps to a detector in `lib/voice-lint.ts`.

| # | Rule | Source | Detector | Severity in `--shell` | Severity in `--all` |
|---|---|---|---|---|---|
| 1 | No `actually`, `forever`, `genuinely`, `truly` | spec §11 | `bannedWords` | error | error |
| 2 | No `virtual assistant` / `virtual assistants` | `BUILD_GUIDE.md` Voice & rules | `bannedWords` | error | error |
| 3 | No AI-slop vocabulary: `delve*`, `tapestry`, `testament`, `vibrant`, `pivotal`, `crucial`, `intricate/intricacies`, `meticulous(ly)`, `bolster(ed)`, `garner(ed)`, `underscore(s)`, `interplay`, `multifaceted`, `foster(ing)`, `utilize`, `commence`, `facilitate`, `encompass(ing)`, `paramount`, `groundbreaking`, `cutting-edge`, `game-changing/-changer`, `transformative`, `revolutionize/revolutionise`, `seamless(ly)`, `endeavor/endeavour`, `aforementioned`, `harnessing`, `spearheading`, `showcasing`, `unprecedented`, `remarkable`, `stunning`, `profound`, `synergy/synergies`, `empower(ing)`, `supercharge` | `references/banned-words.md` § Banned Vocabulary | `bannedWords` | error | error |
| 4 | No AI-slop phrases: `in today's`, `it's worth noting`, `it is important to note`, `let's dive in/deeper`, `at its core`, `in the realm of`, `when it comes to`, `a testament to`, `at the end of the day`, `the bottom line`, `in conclusion`, `without further ado`, `in a nutshell`, `bridge the gap`, `move the needle`, `take it to the next level`, `unlock the power`, `elevate your`, `streamline your`, `rest assured`, `it goes without saying` | `references/banned-words.md` § Banned Phrases | `bannedWords` (multi-word entries matched as phrases) | error | error |
| 5 | No banned openers: `Moreover,`, `Furthermore,`, `Additionally,`, `Interestingly,`, `Notably,`, `Importantly,`, `Indeed,`, `Certainly,`, `Absolutely,`, `Overall,` | `references/banned-words.md` § Banned Openers | `bannedWords` (anchored at string start) | error | error |
| 6 | No "not X, Y" reversals | spec §11 | `isReversal` | error | note |
| 7 | No triads for rhythm (three parallel fragments closing a sentence). Rule of Three is the AI default; use two, four, one, five unless the content genuinely has three | spec §11 + SKILL.md "No Rule of Three" | `triadIn` | error | note |
| 8 | No em-dash chains (≥ 2 `—` in one string). Max one em dash per 500 words | spec §11 + SKILL.md Punctuation | `emDashChain` | error | error |
| 9 | No duplicated sentence openers (same first two words on ≥ 3 consecutive strings in an array) | spec §11 + SKILL.md "No identical paragraph structure" | `duplicateOpeners` | error | error |
| 10 | Hero headline ≤ 8 words (title + accent segment) | spec §11, §8.1 | `words` | error | n/a |
| 11 | Hero lead ≤ 25 words | spec §11 | `words` | error | n/a |
| 12 | Every nav and library `desc` is 6–16 words | brief; Phase 2 additionally pins nav `desc` to 6–10 in `lib/nav.test.ts`, which keeps running | `words` | error | n/a |
| 13 | FAQ answers 40–90 words | spec §8.1.7 | `words` | error | n/a |
| 14 | One idea per paragraph; no parataxis (short sentence, then another, then another) | spec §11 + SKILL.md "No parataxis" | `isAphorism` density gate | density ≤ 20% of prose strings | note |
| 15 | Concrete nouns and verbs. "Write your own resume in the lab" beats "Build the assets that get replies" | spec §11 + SKILL.md "Be specific, not general" | human, at review | — | — |
| 16 | No lists of negatives ("No overwhelm, no 40-tab rabbit holes") | spec §11 | human, at review | — | — |
| 17 | Taglish only where it already is | spec §11 | human, at review | — | — |
| 18 | Honesty doctrine: no number without a visible `Source`; no invented social proof; no self-describing superlatives ("the complete platform", "comprehensive") | `BUILD_GUIDE.md` + SKILL.md Accuracy | human, at review | — | — |
| 19 | Use contractions; use semicolons; let sentences vary in length | SKILL.md Structural + Punctuation | human, at review | — | — |

**Deliberate keeps** (the allowlist in `scripts/voice-lint.mjs`, two entries, each with its reason):

| File · path | String | Why it stays |
|---|---|---|
| `site.json · standard.title` | "We don't hand you files. We make you resourceful." | The core-doctrine line from `BUILD_GUIDE.md`. `voice-audit`'s own advice: keep the punch on section openers. |
| `stages.json · [4].quote` | "The platform succeeds when you no longer need it. So does every stage before this one." | The closing line of the last stage, and the doctrine's own statement of its goal. Keep the punch on closers. |

**Documented exemptions from the sweep** (recorded in Task 6, not fixed):

| Where | Pattern | Why |
|---|---|---|
| `annotated.json · examples[*].blocks[*].text` (4 strings) | em-dash chains, 2–6 per string | These are literal reproductions of a resume line, a file list, and an invoice. The em dashes are document formatting, not our prose. |
| `tasks.json · tasks[11,14,15].brief.steps` (3 runs) | duplicated openers ("write the", "build the") | Procedural imperative step lists. Parallel openers are the point. Handled by `PROCEDURAL_ARRAY_KEYS`. |
| `app/manifest.ts · name` | "Hire From PH — the standard, not the discount" | The logo tagline. Phase 0's Global Constraints pin it as unchanged. |

---

## File structure

| Path | Responsibility |
|---|---|
| `lib/voice-lint.ts` | **New.** Pure detectors and word lists. No file I/O. Erasable TypeScript only. |
| `lib/voice-lint.test.ts` | **New.** One `describe` per detector; every rule row above has at least one positive and one negative case. |
| `scripts/voice-lint.mjs` | **New.** CLI: reads `data/*.json`, applies scope, prints findings, exits 1 under `--strict`. |
| `scripts/voice-audit.mjs` | **Modified.** Reuses `isAphorism`/`walkStrings` from `lib/voice-lint.ts` and gains `--shell` + a density line, so the two tools cannot disagree. |
| `package.json` | **Modified.** `voice:lint`, `voice:audit` scripts; `verify:all` gains the shell gate. |
| `data/home.json` | **Rewritten.** Hero, how-it-works, section kickers/titles/leads, FAQ intro, CTA. |
| `data/site.json` | **Modified.** `tagline`, `mission`, `standard.principles[1].desc`, two `stats[].sub`, new `footer` object, all 25 nav `desc`s. |
| `data/stages.json` | **Modified.** Chrome only: `role`, `subtitle`, `quote`, `closing`, `outcome`. `summary`, `doFirst`, `tools`, `steps`, `kicker`, `accent`, `image`, `diagram` untouched. |
| `data/library.json` | **Modified.** Six `desc` values. |
| `data/educators.json` | **Modified.** `intro.lead`, `intro.whoFor[0]`. |
| `data/faq.json` | **Verified, unchanged.** Task 4 Step 1 records the evidence. |
| `data/tldr.json` | **Verified, unchanged.** Task 5 confirms all 18 routes carry `reviewed: false`. |
| `app/layout.tsx`, `app/manifest.ts`, `lib/meta.ts` | **Modified.** Site-wide title/description/alt: "actually own" → "keep". |
| `app/{start,get-hired,deliver,level-up,own}/page.tsx` | **Modified.** `description` only. |
| `components/site/footer.tsx` | **Modified.** The two local copy constants move into `data/site.json.footer`, as Phase 2 asked. |
| `components/journey/stage-page.tsx`, `app/path/page.tsx` | **Modified.** Two button labels, one empty state. |
| `components/{application-tracker,niche-explorer,find-work}.tsx` | **Modified.** Four empty-state strings. |
| `components/practice/tldr.tsx` | **Verified or completed.** Must render the "Draft translation" badge while `reviewed === false`. |
| `docs/content/TAGALOG-REVIEW.md` | **New.** One row per TL;DR route for a native-speaker reviewer. |
| `docs/superpowers/reports/2026-08-21-p8-sweep.md` | **New.** The reviewable diff list from Task 6. |

---

## Parallel groups

Groups run in order; tasks **inside** a group touch disjoint files and can run concurrently.

| Group | Tasks | Why they can share a group |
|---|---|---|
| **A** | Task 1 | Nothing else can start: Tasks 2–6 are all checked by the linter this task builds. |
| **B** | Tasks 2, 3, 4, 5 | Task 2 owns `home.json`. Task 3 owns `site.json`, `stages.json`, and the metadata files. Task 4 owns `library.json`, `educators.json`, and the component strings. Task 5 owns `tldr.json`, `components/practice/tldr.tsx`, and the new doc. No file overlaps. |
| **C** | Task 6 | Runs `voice:lint --all` over the state Group B leaves, so it must follow B. |
| **D** | Task 7 | Exit verification. Last. |

---

### Task 1: The linter — pure detectors, unit tests, and the CLI

**Parallel group:** A

**Files:**
- Create: `lib/voice-lint.ts`, `scripts/voice-lint.mjs`
- Test: `lib/voice-lint.test.ts`
- Modify: `scripts/voice-audit.mjs`, `package.json`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces, from `@/lib/voice-lint` (and, for the `.mjs` CLI, from `../lib/voice-lint.ts`):
  - `type RuleId = "banned-word" | "reversal" | "triad" | "em-dash-chain" | "duplicate-opener" | "word-count" | "aphorism"`
  - `type Finding = { rule: RuleId; path: string; message: string; excerpt: string }`
  - `const BANNED: readonly string[]` — the rule-table rows 1–5, lowercase, longest-first
  - `const PROCEDURAL_ARRAY_KEYS: readonly string[]`
  - `function words(value: string): number`
  - `function sentences(value: string): string[]`
  - `function opener(value: string): string`
  - `function bannedWords(value: string): string[]`
  - `function isReversal(value: string): boolean`
  - `function triadIn(value: string): string | null`
  - `function emDashChain(value: string): number`
  - `function duplicateOpeners(list: readonly string[]): number[]`
  - `function isAphorism(value: string): boolean`
  - `function isUrl(value: string): boolean`
  - `function isSourcePath(path: string): boolean`
  - `function* walkStrings(node: unknown, path?: string): Generator<[string, string]>`

- [ ] **Step 1: Write the failing test**

Create `lib/voice-lint.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  BANNED,
  bannedWords,
  duplicateOpeners,
  emDashChain,
  isAphorism,
  isReversal,
  isSourcePath,
  isUrl,
  opener,
  sentences,
  triadIn,
  walkStrings,
  words,
} from "@/lib/voice-lint";

describe("words", () => {
  it("counts whitespace-separated tokens", () => {
    expect(words("Build the online career you keep.")).toBe(6);
  });

  it("ignores leading, trailing, and doubled whitespace", () => {
    expect(words("  two   words  ")).toBe(2);
  });

  it("returns zero for an empty string", () => {
    expect(words("   ")).toBe(0);
  });
});

describe("bannedWords", () => {
  it("catches the four spec §11 words, case-insensitively", () => {
    expect(bannedWords("You Actually own it forever")).toEqual(["actually", "forever"]);
    expect(bannedWords("genuinely, truly")).toEqual(["genuinely", "truly"]);
  });

  it("catches the anti-slop vocabulary", () => {
    expect(bannedWords("a seamless, meticulous tapestry")).toEqual([
      "seamless",
      "meticulous",
      "tapestry",
    ]);
  });

  it("catches multi-word phrases", () => {
    expect(bannedWords("At the end of the day it delivers synergy")).toEqual([
      "at the end of the day",
      "synergy",
    ]);
  });

  it("catches banned openers only at the start of a string", () => {
    expect(bannedWords("Moreover, the rate moves.")).toEqual(["moreover,"]);
    expect(bannedWords("The rate moves. Moreover, so does the work.")).toEqual([]);
  });

  it("never says virtual assistant", () => {
    expect(bannedWords("Hire a Virtual Assistant")).toEqual(["virtual assistant"]);
  });

  it("matches whole words only", () => {
    expect(bannedWords("factually forewarned")).toEqual([]);
    expect(bannedWords("Foster City")).toEqual(["foster"]);
  });

  it("leaves clean copy alone", () => {
    expect(bannedWords("Eleven ordered steps, starting with the desk you own.")).toEqual([]);
  });

  it("keeps the list lowercase and free of duplicates", () => {
    expect(BANNED).toEqual(BANNED.map((w) => w.toLowerCase()));
    expect(new Set(BANNED).size).toBe(BANNED.length);
  });
});

describe("isUrl and isSourcePath", () => {
  it("skips URL values", () => {
    expect(isUrl("https://psa.gov.ph/statistics")).toBe(true);
    expect(isUrl("Not a url, actually")).toBe(false);
  });

  it("skips source labels and urls by key path", () => {
    expect(isSourcePath("shift.stats[2].source.label")).toBe(true);
    expect(isSourcePath("cases[0].sources[1].url")).toBe(true);
    expect(isSourcePath("items[0].a")).toBe(false);
    expect(isSourcePath("source.note")).toBe(false);
  });
});

describe("isReversal", () => {
  it("flags the negate-then-correct reversal", () => {
    expect(isReversal("It is not about being perfect, it is about showing up.")).toBe(true);
    expect(isReversal("You run on systems, not vibes, the reason clients keep you.")).toBe(true);
  });

  it("ignores a plain contrast with no trailing clause", () => {
    expect(isReversal("We teach the method, not the file.")).toBe(false);
  });

  it("ignores a coordinated clause after the comma", () => {
    expect(isReversal("You do not need us present, and you do not need permission.")).toBe(false);
    expect(isReversal("You will not feel ready, so send it anyway.")).toBe(false);
  });

  it("ignores a list of negatives with no reversal", () => {
    expect(isReversal("No degree, no capital, not even a client.")).toBe(false);
  });
});

describe("triadIn", () => {
  it("flags three short parallel fragments closing a sentence", () => {
    expect(triadIn("Set up your desk, learn the skills, and build the habit.")).toBe(
      "Set up your desk, learn the skills, and build the habit.",
    );
    expect(triadIn("You write the resume, the SOP, the tracker.")).not.toBeNull();
  });

  it("ignores a list whose last item is long", () => {
    expect(triadIn("Japanese, Korean, or Mandarin thins the candidate pool.")).toBeNull();
  });

  it("ignores a sentence that keeps going after the third item", () => {
    expect(triadIn("Pay bands, demand, and AI risk are all on the card.")).toBeNull();
  });

  it("ignores two items", () => {
    expect(triadIn("Onboard well, and keep the client.")).toBeNull();
  });

  it("flags a trailing fragment with no terminal punctuation", () => {
    expect(triadIn("pay, demand, and AI risk")).toBe("pay, demand, and AI risk");
  });
});

describe("emDashChain", () => {
  it("counts em dashes", () => {
    expect(emDashChain("One — dash")).toBe(1);
    expect(emDashChain("Two — dashes — here")).toBe(2);
  });

  it("does not count hyphens or en dashes", () => {
    expect(emDashChain("Jan–Jun 2026, work-from-home")).toBe(0);
  });
});

describe("opener and duplicateOpeners", () => {
  it("normalises the first two words", () => {
    expect(opener("We will not claim that…")).toBe("we will");
    expect(opener("“Build the thing”")).toBe("build the");
  });

  it("returns the start index of every run of three or more", () => {
    expect(
      duplicateOpeners([
        "We will not claim a number.",
        "We will not tell you that.",
        "We will not sell you that.",
      ]),
    ).toEqual([0]);
  });

  it("ignores a run of two", () => {
    expect(duplicateOpeners(["We will go.", "We will stay.", "Then we stop."])).toEqual([]);
  });

  it("breaks a run on a non-matching opener", () => {
    expect(
      duplicateOpeners(["Log it.", "Log it.", "Send it.", "Log it.", "Log it.", "Log it."]),
    ).toEqual([3]);
  });
});

describe("isAphorism", () => {
  it("fires on the canonical house tic", () => {
    expect(isAphorism("A file solves today. A method solves every tomorrow.")).toBe(true);
  });

  it("does not fire on plain prose", () => {
    expect(
      isAphorism("This is one long ordinary sentence with no parallel short punch at all."),
    ).toBe(false);
  });

  it("does not fire on a one- or two-word verdict opener", () => {
    expect(isAphorism("Yes. Walang bayad, walang catch.")).toBe(false);
    expect(isAphorism("Nobody knows. Anyone who gives you a number is inventing it.")).toBe(false);
  });

  it("fires when the opener is three words", () => {
    expect(isAphorism("Age doesn't matter. Experience doesn't matter.")).toBe(true);
  });
});

describe("sentences", () => {
  it("splits on terminal punctuation followed by whitespace", () => {
    expect(sentences("One. Two! Three?")).toEqual(["One.", "Two!", "Three?"]);
  });

  it("returns one entry for a fragment", () => {
    expect(sentences("pay bands and AI risk")).toEqual(["pay bands and AI risk"]);
  });
});

describe("walkStrings", () => {
  it("yields every string with its JSON key path", () => {
    const tree = { a: "one", b: [{ c: "two" }], d: 3, e: null };
    expect([...walkStrings(tree)]).toEqual([
      ["a", "one"],
      ["b[0].c", "two"],
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/voice-lint.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/voice-lint"`.

- [ ] **Step 3: Write `lib/voice-lint.ts`**

```ts
/**
 * Pure copy detectors for the Phase 8 voice pass.
 *
 * Rules come from spec §11 and from the anti-ai-slop-writing skill at
 * `.claude/skills/anti-ai-slop-writing/` (SKILL.md structural rules,
 * references/banned-words.md vocabulary). Nothing here touches the disk:
 * `scripts/voice-lint.mjs` owns I/O, and `lib/voice-lint.test.ts` pins
 * every function below.
 *
 * Erasable TypeScript only — `scripts/voice-lint.mjs` imports this file
 * directly and Node strips the types at load.
 */

export type RuleId =
  | "banned-word"
  | "reversal"
  | "triad"
  | "em-dash-chain"
  | "duplicate-opener"
  | "word-count"
  | "aphorism";

export type Finding = {
  rule: RuleId;
  /** JSON key path, e.g. `entries[3].desc`. */
  path: string;
  message: string;
  excerpt: string;
};

/** Rule-table rows 1–3: single words. Whole-word, case-insensitive. */
const BANNED_VOCAB = [
  "actually", "forever", "genuinely", "truly",
  "delve", "delves", "delving", "tapestry", "testament", "vibrant", "pivotal",
  "crucial", "intricate", "intricacies", "meticulous", "meticulously",
  "bolster", "bolstered", "garner", "garnered", "underscore", "underscores",
  "interplay", "multifaceted", "foster", "fostering", "utilize", "commence",
  "facilitate", "encompass", "encompassing", "paramount", "groundbreaking",
  "cutting-edge", "game-changing", "game-changer", "transformative",
  "revolutionize", "revolutionise", "seamless", "seamlessly", "endeavor",
  "endeavour", "aforementioned", "harnessing", "spearheading", "showcasing",
  "unprecedented", "remarkable", "stunning", "profound", "synergy", "synergies",
  "empower", "empowering", "supercharge",
];

/** Rule-table rows 2 and 4: multi-word phrases. */
const BANNED_PHRASES = [
  "virtual assistants", "virtual assistant",
  "in today's", "it's worth noting", "it is important to note",
  "let's dive in", "let's dive deeper", "at its core", "in the realm of",
  "when it comes to", "a testament to", "at the end of the day",
  "the bottom line", "in conclusion", "without further ado", "in a nutshell",
  "bridge the gap", "move the needle", "take it to the next level",
  "unlock the power", "elevate your", "streamline your", "rest assured",
  "it goes without saying",
];

/** Rule-table row 5: banned openers, matched only at the head of a string. */
const BANNED_OPENERS = [
  "moreover,", "furthermore,", "additionally,", "interestingly,", "notably,",
  "importantly,", "indeed,", "certainly,", "absolutely,", "overall,",
];

/** Longest-first so "virtual assistants" wins over "virtual assistant". */
export const BANNED: readonly string[] = [
  ...BANNED_PHRASES,
  ...BANNED_VOCAB,
  ...BANNED_OPENERS,
].sort((a, b) => b.length - a.length);

/**
 * Arrays under these keys are procedural: parallel imperative openers are the
 * point, not a tic. `duplicateOpeners` is not applied inside them.
 */
export const PROCEDURAL_ARRAY_KEYS: readonly string[] = [
  "steps", "clauses", "options", "cards", "setup", "objectives", "prompts",
];

const ESCAPE = /[.*+?^${}()|[\]\\]/g;
function escapeRe(value: string): string {
  return value.replace(ESCAPE, "\\$&");
}

const VOCAB_RE = new RegExp(
  String.raw`\b(` + [...BANNED_PHRASES, ...BANNED_VOCAB].map(escapeRe).join("|") + String.raw`)\b`,
  "gi",
);
const OPENER_RE = new RegExp(
  String.raw`^\s*(` + BANNED_OPENERS.map(escapeRe).join("|") + String.raw`)`,
  "i",
);

export function words(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function sentences(value: string): string[] {
  return value.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/** Lowercased first two words, punctuation and quote marks stripped. */
export function opener(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s'’-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

/** Every banned word or phrase in the string, lowercased, in reading order. */
export function bannedWords(value: string): string[] {
  const hits = [...value.matchAll(VOCAB_RE)].map((m) => m[0].toLowerCase());
  const head = value.match(OPENER_RE);
  return head ? [head[1].toLowerCase(), ...hits] : hits;
}

/**
 * "not X, Y" — negate, comma, then the correction. The lookahead lets a real
 * coordinated or subordinated clause through, so "not ready, so send it
 * anyway" and "not present, and you do not need permission" stay clean.
 */
const REVERSAL_RE = new RegExp(
  String.raw`\bnot\b[^.!?]{3,40},\s+` +
    String.raw`(?!(?:and|but|or|so|nor|yet|because|since|while|if|when|unless|until|though|although|before|after|as|then|too)\b)`,
  "i",
);

export function isReversal(value: string): boolean {
  return REVERSAL_RE.test(value);
}

/**
 * A triad is three comma-separated fragments of at most four words each that
 * close a sentence (a leading "and"/"or" on the last one is stripped first).
 * A fragment with no terminal punctuation counts as its own sentence, so
 * sub-labels like "pay, demand, and AI risk" are caught too.
 */
export function triadIn(value: string): string | null {
  for (const sentence of sentences(value)) {
    const body = sentence.replace(/[.!?]+$/, "").trim();
    const parts = body.split(/,\s*/);
    if (parts.length < 3) continue;
    const tail = parts.slice(-3).map((p) => p.replace(/^(?:and|or)\s+/i, "").trim());
    if (tail.every((p) => p.length > 0 && words(p) <= 4)) return sentence;
  }
  return null;
}

export function emDashChain(value: string): number {
  return (value.match(/—/g) || []).length;
}

/**
 * Start index of every run of three or more consecutive strings that open with
 * the same two words. Returns one index per run, not one per string.
 */
export function duplicateOpeners(list: readonly string[]): number[] {
  const runs: number[] = [];
  let start = 0;
  for (let i = 1; i <= list.length; i++) {
    const same =
      i < list.length && opener(list[i]).length > 0 && opener(list[i]) === opener(list[i - 1]);
    if (same) continue;
    if (i - start >= 3) runs.push(start);
    start = i;
  }
  return runs;
}

const APHORISM_MAX_CHARS = 60;

/**
 * The house tic: two short parallel sentences back to back. A one- or two-word
 * opener ("Yes.", "Nobody knows.") is a direct verdict, not a tic, so the first
 * sentence must carry at least three words before this fires.
 */
export function isAphorism(value: string): boolean {
  const list = sentences(value);
  if (list.length < 2) return false;
  const [first, second] = list;
  if (words(first) < 3) return false;
  return first.length <= APHORISM_MAX_CHARS && second.length <= APHORISM_MAX_CHARS;
}

export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** `source.url`, `sources[2].label`, `honesty.source.url` — never our prose. */
export function isSourcePath(path: string): boolean {
  return /(^|\.)sources?(\[\d+\])?\.(url|label|date|grade)$/.test(path);
}

/** Every string in a parsed JSON value, with its key path. */
export function* walkStrings(node: unknown, path = ""): Generator<[string, string]> {
  if (typeof node === "string") {
    yield [path, node];
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walkStrings(node[i], `${path}[${i}]`);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      yield* walkStrings(value, path ? `${path}.${key}` : key);
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/voice-lint.test.ts`
Expected: PASS — 29 tests, 0 failed.

- [ ] **Step 5: Write the CLI**

Create `scripts/voice-lint.mjs`:

```js
// Copy gate for the shell (spec §11) and the mechanical sweep for the content
// JSONs. The rules live in lib/voice-lint.ts and are unit-tested there; this
// file only decides what to read, what is in scope, and what exits non-zero.
//
//   node scripts/voice-lint.mjs --shell            # the shell files, all rules
//   node scripts/voice-lint.mjs --shell --strict   # same, exit 1 on any error
//   node scripts/voice-lint.mjs --all              # every data/*.json, sweep rules only
//   node scripts/voice-lint.mjs --all --json       # machine-readable findings
//
// Node 24 strips the types out of the .ts import at load; keep that import
// specifier's extension.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bannedWords,
  duplicateOpeners,
  emDashChain,
  isAphorism,
  isReversal,
  isSourcePath,
  isUrl,
  triadIn,
  walkStrings,
  words,
  PROCEDURAL_ARRAY_KEYS,
} from "../lib/voice-lint.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");

const args = process.argv.slice(2);
const shellOnly = args.includes("--shell");
const strict = args.includes("--strict");
const asJson = args.includes("--json");
if (!shellOnly && !args.includes("--all")) {
  console.error("voice-lint: pass --shell or --all");
  process.exit(2);
}

/** Shell scope: file → the key paths §11 puts in the copy pass. */
const SHELL_SCOPE = {
  "home.json": /./,
  "site.json": /^(tagline|mission|meaning|standard|stats|cta|nav|navGroups|footer)/,
  "stages.json": /^\[\d+\]\.(role|subtitle|quote|closing|outcome|kicker|steps|title)$/,
  "faq.json": /^items/,
  "library.json": /^entries/,
  "educators.json": /^(intro|quickStart)/,
};

/** Word-count rules (rule-table rows 10–13). file → path regex → [min, max]. */
const WORD_LIMITS = [
  { file: "home.json", path: /^hero\.lead$/, min: 1, max: 25, what: "hero lead" },
  { file: "site.json", path: /\.desc$/, min: 6, max: 16, what: "nav description" },
  { file: "library.json", path: /^entries\[\d+\]\.desc$/, min: 6, max: 16, what: "library description" },
  { file: "faq.json", path: /^items\[\d+\]\.a$/, min: 40, max: 90, what: "FAQ answer" },
];

/** Strings kept deliberately aphoristic, with the reason. See the plan's rule table. */
const KEEPS = new Set([
  "site.json · standard.title",
  "stages.json · [4].quote",
]);

/** Literal document reproductions: their em dashes are formatting, not prose. */
const EMDASH_EXEMPT = /^annotated\.json · examples\[\d+\]\.blocks\[\d+\]\.text$/;

const errors = [];
const notes = [];
let proseStrings = 0;
let aphorisms = 0;

function record(list, rule, file, path, message, excerpt) {
  list.push({ rule, file, path, message, excerpt: excerpt.slice(0, 120) });
}

/** Arrays of strings, for the duplicated-opener rule. Skips procedural lists. */
function* stringArrays(node, path = "", key = "") {
  if (Array.isArray(node)) {
    const all = node.every((v) => typeof v === "string");
    if (all && node.length >= 3 && !PROCEDURAL_ARRAY_KEYS.includes(key)) yield [path, node];
    for (let i = 0; i < node.length; i++) yield* stringArrays(node[i], `${path}[${i}]`, key);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) yield* stringArrays(v, path ? `${path}.${k}` : k, k);
  }
}

const files = readdirSync(DATA)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => (shellOnly ? f in SHELL_SCOPE : true));

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(DATA, file), "utf8"));
  } catch (err) {
    record(errors, "banned-word", file, "", `unparseable JSON — ${err.message}`, "");
    continue;
  }
  const inScope = shellOnly ? SHELL_SCOPE[file] : /./;

  for (const [path, value] of walkStrings(data)) {
    if (!inScope.test(path)) continue;
    if (isUrl(value) || isSourcePath(path)) continue;
    const id = `${file} · ${path}`;

    const banned = bannedWords(value);
    if (banned.length) {
      record(errors, "banned-word", file, path, `banned: ${banned.join(", ")}`, value);
    }

    const chain = emDashChain(value);
    if (chain >= 2 && !EMDASH_EXEMPT.test(id)) {
      record(errors, "em-dash-chain", file, path, `${chain} em dashes in one string`, value);
    }

    // Rules 6, 7, 14 are shell-scope errors and content-scope notes.
    const bucket = shellOnly ? errors : notes;
    if (isReversal(value)) record(bucket, "reversal", file, path, `"not X, Y" reversal`, value);
    const triad = triadIn(value);
    if (triad) record(bucket, "triad", file, path, `triad closes the sentence`, triad);

    if (shellOnly) {
      if (isAphorism(value) || value.split(/(?<=[.!?])\s+/).filter(Boolean).length >= 2) {
        proseStrings++;
      }
      if (isAphorism(value)) {
        aphorisms++;
        if (!KEEPS.has(id)) {
          record(errors, "aphorism", file, path, "two short parallel sentences", value);
        }
      }
      for (const limit of WORD_LIMITS) {
        if (limit.file !== file || !limit.path.test(path)) continue;
        const n = words(value);
        if (n < limit.min || n > limit.max) {
          record(
            errors, "word-count", file, path,
            `${limit.what} is ${n} words (want ${limit.min}–${limit.max})`, value,
          );
        }
      }
    }
  }

  for (const [path, list] of stringArrays(data)) {
    if (shellOnly && !inScope.test(path)) continue;
    for (const start of duplicateOpeners(list)) {
      record(
        errors, "duplicate-opener", file, `${path}[${start}]`,
        `three or more strings open with "${list[start].split(/\s+/).slice(0, 2).join(" ")}"`,
        list[start],
      );
    }
  }
}

// The hero headline is title + accent, so it needs its own read.
if (shellOnly && files.includes("home.json")) {
  const home = JSON.parse(readFileSync(join(DATA, "home.json"), "utf8"));
  const headline = `${home.hero.title} ${home.hero.accent}`;
  const n = words(headline);
  if (n > 8) {
    record(errors, "word-count", "home.json", "hero.title+accent",
      `hero headline is ${n} words (want ≤ 8)`, headline);
  }
}

const density = proseStrings === 0 ? 0 : aphorisms / proseStrings;
const DENSITY_MAX = 0.2;
const densityFailed = shellOnly && density > DENSITY_MAX;

if (asJson) {
  console.log(JSON.stringify({ errors, notes, aphorisms, proseStrings, density }, null, 2));
} else {
  const scope = shellOnly ? "shell" : "all data";
  console.log(`\nvoice-lint · ${scope} · ${files.length} files\n`);
  for (const f of errors) console.log(`  ✗ ${f.rule.padEnd(16)} ${f.file} · ${f.path}\n      ${f.message}\n      "${f.excerpt}"`);
  for (const f of notes) console.log(`  · ${f.rule.padEnd(16)} ${f.file} · ${f.path}  ${f.message}`);
  if (shellOnly) {
    console.log(
      `\nAphorism density: ${aphorisms}/${proseStrings} prose strings ` +
        `(${(density * 100).toFixed(1)}%, gate ≤ ${DENSITY_MAX * 100}%). ` +
        `${KEEPS.size} deliberate keeps.`,
    );
  }
  console.log(`\n${errors.length} error(s), ${notes.length} note(s).\n`);
}

if (strict && (errors.length > 0 || densityFailed)) process.exit(1);
```

- [ ] **Step 6: Run the linter to see the pre-rewrite baseline**

Run: `node scripts/voice-lint.mjs --shell`
Expected (Phases 0–7 landed, no Phase 8 copy work yet): errors in `stages.json` (`[0].quote`, `[0].closing`, `[1].quote`, `[2].quote`, `[2].outcome`, `[3].quote`, `[3].closing`), `site.json` (`standard.principles[1].desc` banned `forever`; `stats[2].sub` triad; several nav `desc` triads), `library.json` (six), `educators.json` (two). Exit 0 without `--strict`. This list is what Tasks 2–4 clear.

- [ ] **Step 7: Extend `scripts/voice-audit.mjs` to share the detector**

In `scripts/voice-audit.mjs`, delete the local `isAphoristic` function and the local `strings` generator (lines 20–36 of the current file, from `const MAX_APHORISM_CHARS = 60;` through the closing brace of `function* strings`), delete the two self-check `throw` statements at the bottom, and add the import plus a `--shell` flag. The two tools must never disagree about what an aphorism is.

Replace the imports block at the top with:

```js
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { isAphorism, walkStrings } from "../lib/voice-lint.ts";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const SHELL_FILES = ["home.json", "site.json", "stages.json", "faq.json", "library.json", "educators.json"];
const shellOnly = process.argv.includes("--shell");
```

Change the file loop's filter from:

```js
for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
```

to:

```js
for (const file of readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !shellOnly || SHELL_FILES.includes(f))) {
```

Change the two call sites `isAphoristic(str)` → `isAphorism(str)` and `strings(data)` → `walkStrings(data)`.

- [ ] **Step 8: Add the npm scripts**

In `package.json`, add two scripts and extend `verify:all`:

```json
    "voice:audit": "node scripts/voice-audit.mjs",
    "voice:lint": "node scripts/voice-lint.mjs",
    "verify:all": "npm run verify:contrast && npm run verify:claims && npm run voice:lint -- --shell --strict && npm run lint && npx tsc --noEmit && npm run verify:primitives",
```

- [ ] **Step 9: Run the whole suite once**

Run: `npx vitest run lib/voice-lint.test.ts && node scripts/voice-audit.mjs --shell && node scripts/voice-lint.mjs --all`
Expected: tests pass; `voice-audit --shell` prints a density line over the six shell files; `voice-lint --all` prints the sweep findings (Task 6 clears them) and exits 0.

- [ ] **Step 10: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint lib/voice-lint.ts lib/voice-lint.test.ts scripts/voice-lint.mjs scripts/voice-audit.mjs`
Expected: both silent, exit 0.

- [ ] **Step 11: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add lib/voice-lint.ts lib/voice-lint.test.ts scripts/voice-lint.mjs scripts/voice-audit.mjs package.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(voice): pure copy detectors, unit tests, and a shell/all lint gate"
```

---

### Task 2: Homepage shell copy — `data/home.json`

**Parallel group:** B

**Files:**
- Modify: `data/home.json` (full replacement of every string; `items[].href`/`icon` and `links` keys unchanged)
- Test: `lib/home.test.ts` (Phase 4) keeps running unchanged

**Interfaces:**
- Consumes: `words`, `bannedWords` from `@/lib/voice-lint` (Task 1) — indirectly, through the linter.
- Produces: no new symbols. `HomeCopy` in `lib/home.ts` is unchanged, so every key below must survive; `tsc` fails if one is dropped.

**What §1 is asking for.** The old hero was a 70-word paragraph that used "forever" twice, under a headline reading "Build the online career you **actually** own." Phase 4 already cut the paragraph to a lead; this task kills the banned word and makes every string concrete. The replacement headline is **"Build the online career you keep."** — six words, no banned vocabulary, and close enough to the old line that the OG image, the manifest, and the social alt text can all say the same thing (Task 3 changes those three).

- [ ] **Step 1: Write the whole of `data/home.json`**

```json
{
  "hero": {
    "kicker": "Free and open · for Filipinos building online careers",
    "title": "Build the online career you",
    "accent": "keep.",
    "lead": "Eleven ordered steps, starting with the desk you already own and the first task you can finish today.",
    "primary": { "label": "Find your path", "href": "/start" },
    "secondary": { "label": "How it works", "href": "#how" },
    "honesty": "Every number here links to the source it came from, including the ones that argue against starting.",
    "honestyLink": { "label": "Read the Reality Check", "href": "/reality" }
  },
  "howItWorks": {
    "kicker": "How it works",
    "title": "Pick a lane, then work the stages",
    "lead": "Each stage names the one thing to do next, so no session starts with a guess.",
    "items": [
      {
        "icon": "compass",
        "title": "Pick a lane",
        "body": "Twenty-two niches, each with a cited pay band and a note on what AI changed."
      },
      {
        "icon": "list-checks",
        "title": "Work the stages in order",
        "body": "Eleven steps in order, each naming the single thing to do next."
      },
      {
        "icon": "pencil-ruler",
        "title": "Write every deliverable yourself",
        "body": "The labs teach the anatomy and the rules; the resume you send is one you wrote."
      }
    ]
  },
  "path": {
    "kicker": "The path",
    "title": "Five stages, eleven steps",
    "lead": "Each stage builds on the one before it, and the map remembers every step you tick off.",
    "action": { "label": "Open your dashboard", "href": "/path" }
  },
  "lane": {
    "kicker": "Pick your lane",
    "title": "Go deep in one niche",
    "lead": "These six rank highest on the demand field in our niche data; all twenty-two are listed in full.",
    "more": { "label": "See all 22 niches", "href": "/niches" }
  },
  "build": {
    "kicker": "What you'll build",
    "title": "You leave with what you wrote",
    "lead": "Every tool here ends in something you wrote, whether that is a finished task or a month of plan days.",
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
    "body": "Stage one asks for one micro-task, finished today, with no client involved.",
    "action": { "label": "Find your path", "href": "/start" }
  }
}
```

**Before → after, and why, for every string that changed:**

| Key | Before (Phase 4 draft) | After | Rule |
|---|---|---|---|
| `hero.accent` | `"own."` | `"keep."` | 12/19 — "own" is abstract; "keep" is the thing a reader wants and the word the site can honestly promise |
| `hero.lead` | "Five stages, eleven steps, from setting up your desk to invoicing direct clients. Every deliverable here is one you write yourself." (22 w, 2 sentences) | "Eleven ordered steps, starting with the desk you already own and the first task you can finish today." (18 w, 1 sentence) | 4 (banned "From X to Y" range opener), 11, 14 (one idea per paragraph) |
| `howItWorks.title` | "Pick a lane, then work the stages" | unchanged | — |
| `howItWorks.lead` | "Each stage names what to do next, so you never have to guess." | "Each stage names the one thing to do next, so no session starts with a guess." | 15 — "the one thing" is countable, "you never have to guess" is a promise about the reader |
| `howItWorks.items[0].body` | "Twenty-two niches with pay bands, demand, and how AI is changing each one." | "Twenty-two niches, each with a cited pay band and a note on what AI changed." | 7 (triad), 18 ("cited" is the honest word for what `tracks.json` carries) |
| `howItWorks.items[1].title` | "Follow five stages" | "Work the stages in order" | 15 — "follow" is passive-flavoured; the site's verb is "work" |
| `howItWorks.items[1].body` | "Eleven ordered steps take you from a bare desk to direct clients." | "Eleven steps in order, each naming the single thing to do next." | 4 (range opener), 18 (the old line promised clients) |
| `howItWorks.items[2].body` | "The labs teach the anatomy and the rules; you write the resume, the SOP, the tracker." | "The labs teach the anatomy and the rules; the resume you send is one you wrote." | 7 (triad) |
| `path.lead` | "Each stage builds on the one before it. Tick a step when it is done and the map remembers." (2 short sentences) | "Each stage builds on the one before it, and the map remembers every step you tick off." | 14 (aphorism cadence) |
| `lane.lead` | "These six carry the strongest demand in our niche data. Twenty-two lanes are listed in full." (2 short sentences) | "These six rank highest on the demand field in our niche data; all twenty-two are listed in full." | 14, 18 (names the actual field the ranking reads) |
| `build.title` | "Workshops, not downloads" | "You leave with what you wrote" | 6-adjacent (contrast-by-negation), 15 |
| `build.lead` | "Every tool here ends with something you wrote: a task finished, an application logged, a month you can follow." | "Every tool here ends in something you wrote, whether that is a finished task or a month of plan days." | 7 (triad) |
| `cta.body` | "Stage one begins with the desk you already have." | "Stage one asks for one micro-task, finished today, with no client involved." | 15 — the hero lead now owns the desk; the CTA should name the first action instead of repeating it |

Every other string is carried through from Phase 4 unchanged because it already passes.

- [ ] **Step 2: Run the linter over the file**

Run: `node scripts/voice-lint.mjs --shell --strict`
Expected: no `home.json` line in the output. (Other files still fail until Tasks 3 and 4 land; run `node scripts/voice-lint.mjs --shell --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).errors.filter(e=>e.file==='home.json')))"` to check this file alone.)

- [ ] **Step 3: Run the Phase 4 copy test**

Run: `npx vitest run lib/home.test.ts`
Expected: PASS — including `keeps the hero headline to eight words or fewer` (6 words), `keeps the hero lead to twenty-five words or fewer` (18), `keeps the banned shell words out of every string`, and `gives how-it-works exactly three feature items`.

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0 from both. If `tsc` rejects `const HOME: HomeCopy = homeData`, a key was dropped from the JSON above — restore it rather than widening `HomeCopy`.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/home.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(copy): rewrite the homepage shell copy to the section 11 voice rules"
```

---

### Task 3: `site.json`, `stages.json` chrome, and the six page metadata blocks

**Parallel group:** B

**Files:**
- Modify: `data/site.json`, `data/stages.json`
- Modify: `app/layout.tsx`, `app/manifest.ts`, `lib/meta.ts`
- Modify: `app/start/page.tsx`, `app/get-hired/page.tsx`, `app/deliver/page.tsx`, `app/level-up/page.tsx`, `app/own/page.tsx`
- Modify: `components/site/footer.tsx`
- Test: `lib/nav.test.ts` (Phase 2) keeps running unchanged

**Interfaces:**
- Consumes: `NAV`, `NAV_GROUPS`, `isMenu` from `@/lib/nav` (Phase 2) — indirectly, through the tests.
- Produces: a new `site.footer` object, `{ honesty: string; note: string }`, which `components/site/footer.tsx` reads instead of its two local constants. Phase 2's own comment on those constants says: _"The honesty sentence is a local constant here because Phase 8 owns shell copy in `site.json`."_ This is that move.

#### 3a — `data/site.json`

- [ ] **Step 1: Replace `tagline` and `mission`**

`meaning` is the brand line and does not change. Replace only these two keys:

```json
  "tagline": "Be the reason they hire from the Philippines. A free, path-based site for Filipinos building an online career.",
  "mission": "Hire From PH is built on one idea: the people companies hire from the Philippines should be the ones worth hiring anywhere. Everything here is free to read, and every figure carries a link to its source.",
```

| Key | Before | Rule broken |
|---|---|---|
| `tagline` | "…The complete platform for building an online career, open to every Filipino." | 18 — "The complete platform" is a self-describing superlative, the same move as "comprehensive" on the banned list |
| `mission` | 82 words across four sentences, ending "…trusted with outcomes, **not just tasks**. Built to the standard of a real operations team, and given openly." | 4 ("not just X" is on the banned-phrases list), 14 (four sentences, several ideas), 18 ("built to the standard of a real operations team" is an unverifiable claim about ourselves) |

- [ ] **Step 2: Fix the one banned word in `standard`**

```json
        "desc": "The artifact you leave with is written in your words, from your situation, so you can rebuild it anywhere.",
```

Before: `"The artifact you leave with is written in your words, from your situation. You can rebuild it anywhere, forever."` — rule 1 (`forever`) and rule 14 (the parataxis the semicolon-free full stop creates). `standard.title` and the other two `principles[].desc` values are unchanged; `standard.title` is on the deliberate-keeps allowlist.

- [ ] **Step 3: Fix two `stats[].sub` values**

Phase 4 trimmed `stats` to four structural facts. Two of the `sub` lines break rules:

```json
  "stats": [
    { "value": "5", "label": "stages", "sub": "zero to independent" },
    { "value": "11", "label": "steps", "sub": "one ordered roadmap" },
    { "value": "22", "label": "niches", "sub": "pay bands and AI risk" },
    { "value": "40", "label": "micro-tasks", "sub": "each ends as portfolio proof" }
  ],
```

`stats[2].sub` was `"pay, demand, and AI risk"` — a three-item triad closing the string (rule 7). `stats[0]`, `stats[1]`, `stats[3]` are unchanged.

- [ ] **Step 4: Add the `footer` object**

Insert after `stats` and before `cta`:

```json
  "footer": {
    "honesty": "Independent and non-commercial. Nothing on this site is for sale, and no page asks for your email.",
    "note": "Pay figures and market data are cited to their sources, and every one of them is an estimate rather than a promise."
  },
```

| Key | Before (the local constant in `components/site/footer.tsx`) | Rule broken |
|---|---|---|
| `footer.honesty` | `HONESTY` = "Hire From PH is an independent, non-commercial project. Every page is free to read, and every figure carries its source." | Duplicates the new `mission` sentence word for word; the footer should not restate the mission |
| `footer.note` | `COPYRIGHT` = "Pay figures and market data are cited to their sources. They are estimates, not promises." | 14 (two short parallel sentences), 6-adjacent ("estimates, not promises") |

- [ ] **Step 5: Rewrite the nav descriptions**

Phase 2 authored 25 `desc` strings. Nine break rule 7 (triad) or rule 4 (range opener). Replace the whole `nav` array's `desc` values with these; **every `label`, `href`, `pending`, `title`, and `footerLinks` structure stays exactly as Phase 2 left it.**

| href | Before | After | Words | Rule |
|---|---|---|---|---|
| `/start` | "Stage 1. Set up your desk, build first proof." | "Set up your desk and finish one micro-task." | 8 | 14 (the "Stage 1." + short-clause pair reads as the cadence tic, and §6.1 already renders these as a numbered list) |
| `/get-hired` | "Stage 2. Source leads, apply, and close the offer." | "Source your own leads and close the first offer." | 9 | 7, 14 |
| `/deliver` | "Stage 3. Onboard, write SOPs, keep the client." | "Write the SOPs and trackers that keep a client." | 9 | 7, 14 |
| `/level-up` | "Stage 4. Specialise, automate, and raise your rate." | "Specialise in one niche and raise your rate on evidence." | 10 | 7, 14 |
| `/own` | "Stage 5. Go direct, register, and set your terms." | "Move to direct clients and register with the BIR." | 9 | 7, 14 |
| `/path` | "See your saved track and how far you are." | unchanged | 9 | — |
| `/plan` | "Answer five questions, get a day-by-day month." | unchanged | 7 | — |
| `/method` | "Six principles and seven methods for building anything." | unchanged | 8 | — |
| `/ai-first` | "Coding agents, local models, and four working habits." | "Fold coding agents and local models into your craft." | 9 | 7 |
| `/learn` | "How memory works, and a study protocol you write." | unchanged | 9 | — |
| `/tasks` | "Forty small jobs that each end as portfolio proof." | unchanged | 9 | — |
| `/build` | "Learn a resume's anatomy, then write your own." | unchanged | 8 | — |
| `/tools` | "Pick up unfamiliar software in a single weekend." | unchanged | 8 | — |
| `/portfolio` | "Each niche's tool ladder, free to paid, rung by rung." | "Each niche's tool ladder, free tools on the bottom rung." | 10 | 7 |
| `/prompts` | "Prompt anatomy, so you can write your own." | unchanged | 8 | — |
| `/equipment` | "Check what you own, budget pesos for the rest." | unchanged | 9 | — |
| `/indispensable` | "The judgment that makes you hard to replace." | unchanged | 8 | — |
| `/english` | "Cut hedges, and learn four structures for client messages." | unchanged | 9 | — |
| `/conduct` | "What gets people delisted, and an oath you write." | unchanged | 9 | — |
| `/simulator` | "Model 36 months of two career paths side by side." | unchanged | 10 | — |
| `/resources` | "Verified free courses, and how to judge one first." | unchanged | 9 | — |
| `/practice` | "Flashcards and quizzes on a spacing schedule." | unchanged | 7 | — |
| `/glossary` | "Plain definitions for every term this site uses." | unchanged | 8 | — |
| `/apply` | "Search operators, reverse-sourcing, and a red-flag scorer." | "Search operators and a red-flag scorer for any lead." | 9 | 7 |
| `/interview` | "STAR answers, a question bank, and scam warning signs." | "STAR answers and the warning signs of a scam interview." | 10 | 7 |
| `/tracker` | "Log every application and get nudged on follow-ups." | unchanged | 8 | — |
| `/niches` | "Twenty-two lanes with pay bands, demand, and AI risk." | unchanged | 9 | — |
| `/salary` | "Cited pay ranges, and how to price your work." | unchanged | 9 | — |
| `/markets` | "Where clients are, what each market pays, overlap hours." | "What each market pays, and your overlap hours from UTC+8." | 10 | 7 |
| `/clients` | "Move from platform gigs to direct clients and retainers." | "Leave the platforms for direct clients and retainers." | 8 | 4 (range opener) |
| `/legit` | "BIR registration, the 8% option, SSS, and payment rails." | "Register with the BIR and pick the 8% option." | 9 | 7 |
| `/languages` | "Japanese, Korean, or Mandarin thins the candidate pool." | unchanged | 8 | — |

Every "After" value is 8–10 words, inside both the 6–16 gate in `scripts/voice-lint.mjs` and the stricter 6–10 gate that Phase 2's `lib/nav.test.ts` still enforces.

- [ ] **Step 6: Point the footer at the new keys**

In `components/site/footer.tsx`, delete the two local constants and read `site.footer` instead. Replace:

```tsx
/** Shell copy. Phase 8 owns the final wording; the honesty rule does not move. */
const HONESTY =
  "Hire From PH is an independent, non-commercial project. Every page is free to read, and every figure carries its source.";

const COPYRIGHT =
  "Pay figures and market data are cited to their sources. They are estimates, not promises.";
```

with nothing, and change the two usages:

```tsx
            <p className="mt-4 text-caption leading-relaxed text-ink-faint">{site.footer.honesty}</p>
```

```tsx
            © 2026 {site.brand}. {site.footer.note}
```

- [ ] **Step 7: Run the nav test and the linter**

Run: `npx vitest run lib/nav.test.ts && node scripts/voice-lint.mjs --shell`
Expected: `lib/nav.test.ts` passes (the 6–10-word rule and the banned-word rule both hold); `voice-lint --shell` shows no `site.json` lines except the allowlisted `standard.title`, which is reported in the density line and not as an error.

#### 3b — `data/stages.json` chrome

Only `role`, `subtitle`, `quote`, `closing`, and `outcome` change. `summary`, `doFirst`, `tools`, `steps`, `kicker`, `accent`, `image`, `diagram`, `id`, `num`, `title`, `href` are untouched — §11 puts them out of scope.

- [ ] **Step 8: Apply the chrome rewrites, stage by stage**

**Stage 1 — `start` (`[0]`)**

```json
    "role": "The Beginner",
    "subtitle": "Your foundation as an online professional",
    "quote": "Nobody checks your diploma here; what you finish this week is the thing that counts.",
    "outcome": "You'll have a working setup and the foundational skills to apply with confidence.",
    "closing": "Finish one micro-task this week and you have something to send."
```

| Key | Before | Rule |
|---|---|---|
| `quote` | "Age doesn't matter. Experience doesn't matter. What matters is your dedication to learning." | 14 (three short parallel sentences — the parataxis SKILL.md names as the AI tell), 16 (opens with two negatives) |
| `closing` | "You don't need to be perfect. You just need to start." | 14, plus SKILL.md "No corporate pep talk tone" |
| `role`, `subtitle`, `outcome` | unchanged | — |

**Stage 2 — `get-hired` (`[1]`)**

```json
    "role": "The Job Hunter",
    "subtitle": "Land your first client, systematically",
    "quote": "You will not feel ready, so send the application anyway and let the interviews teach you.",
    "outcome": "You'll have a live pipeline of applications and the prep to convert interviews into offers.",
    "closing": "Most offers are lost to silence, so apply on a schedule and follow up on every one."
```

| Key | Before | Rule |
|---|---|---|
| `quote` | "Don't wait until you feel ready. You'll never feel 100% ready. Just apply, learn from every interview, and adjust." | 7 (triad), 14 |
| `closing` | "Every 'no' moves you closer to the right 'yes'. The system is here, the work now is to apply, consistently, and follow up." | 15 and SKILL.md "No corporate pep talk tone" — the "every no is closer to a yes" line is a motivational platitude with nothing behind it; the replacement states the actual mechanism the tracker page teaches |
| `role`, `subtitle`, `outcome` | unchanged | — |

**Stage 3 — `deliver` (`[2]`)**

```json
    "role": "The Online Professional",
    "subtitle": "Impress your client and become reliable",
    "quote": "Your first week is an audition for the second one, and organisation is what it scores.",
    "outcome": "You'll run the work on written systems, which is the reason clients keep you and refer you.",
    "closing": "A professional runs on written systems; a hire runs on memory."
```

| Key | Before | Rule |
|---|---|---|
| `quote` | "Your first week is your audition. It's not about being perfect, it's about being organized, responsive, and showing up." | 6 (reversal), 7 (triad) |
| `outcome` | "You'll run your work on systems, not vibes, the reason clients keep and refer you." | 6 (reversal) |
| `closing` | "This is what separates a hire from a professional: systems, reliability, and follow-through." | 7 (triad after the colon) |
| `role`, `subtitle` | unchanged | — |

**Stage 4 — `level-up` (`[3]`)**

```json
    "role": "The Specialist",
    "subtitle": "Where specialising starts paying",
    "quote": "Systemise anything you do twice, and hand the rest to a machine that does not get bored.",
    "outcome": "You'll own a niche and have the evidence to ask for a higher rate.",
    "closing": "Specialise in one lane, then raise the rate the evidence supports."
```

| Key | Before | Rule |
|---|---|---|
| `role` | "The Growth Path" | 15 — the other four roles name a person ("The Beginner", "The Job Hunter", "The Online Professional", "The Independent"); this one named an abstraction |
| `subtitle` | "From good to indispensable" | 4 ("From X to Y" range opener) |
| `quote` | "Anything you do twice, systemize. Anything a machine can do, automate. That is how professionals scale their value." | 14, 9 (two consecutive sentences opening "Anything") |
| `outcome` | "You'll own a niche, command a premium rate, and build a career that compounds." | 18 — "command a premium rate" is an unsourced promise about earnings |
| `closing` | "The work compounds from here. Specialize, automate, and let your rate follow your value." | 14 |

**Stage 5 — `own` (`[4]`)**

```json
    "role": "The Independent",
    "subtitle": "The career becomes yours; then it helps someone else's",
    "quote": "The platform succeeds when you no longer need it. So does every stage before this one.",
    "outcome": "You'll own client relationships, invoice as a registered professional, and carry a name people vouch for: the three assets no platform can revoke.",
    "closing": "Build the things nobody can revoke: your skill, your client list, and the name people vouch for. Then hold the door for whoever is next."
```

| Key | Before | Rule |
|---|---|---|
| `closing` | "Build the things nobody can take: the skill, the relationships, the name. Then hold the door open for the next one coming up." | 7 (triad closing the first sentence) |
| `quote` | unchanged — **deliberate keep**, allowlisted in `scripts/voice-lint.mjs` as the doctrine's own closing line | 14, waived |
| `role`, `subtitle`, `outcome` | unchanged — `outcome` names "the three assets" explicitly, so its three items are content, not rhythm (SKILL.md: "unless the content genuinely has three items") | — |

#### 3c — Metadata for `/` and the five stage routes

Every `description` below is under 160 characters; the count is given so the implementer can check without guessing.

- [ ] **Step 9: `app/layout.tsx`**

Three strings change. The `title.default` is the brand line and does not move.

```tsx
  description:
    "Free, open learning for Filipino online professionals: eleven ordered steps, twenty-two niches, and a source under every number.",
```
(127 chars. Before, at 189 chars: "Open learning for Filipino online professionals. Real talk on remote work, AI, direct clients, pay, and the skills that make you layoff-proof. We teach you to build it yourself, so you own it." — over the 160 limit and carrying a four-item list.)

```tsx
  openGraph: {
    title: "Hire From PH — Build the online career you keep.",
    description:
      "Free, open learning for Filipino online professionals. Eleven ordered steps, and a link to the source under every number.",
```
(120 chars.)

```tsx
  twitter: {
    card: "summary_large_image",
    title: "Hire From PH — Build the online career you keep.",
    description:
      "Free, open learning for Filipino online professionals. Eleven ordered steps, and a link to the source under every number.",
```

Both `title` values were "Hire From PH — Build the online career you **actually** own." — rule 1.

- [ ] **Step 10: `app/manifest.ts`**

```ts
    description:
      "Open learning for Filipino online professionals. Build the online career you keep.",
```

`name` (`"Hire From PH — the standard, not the discount"`) does **not** change: Phase 0's Global Constraints pin the logo tagline.

- [ ] **Step 11: `lib/meta.ts`**

```ts
const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Hire From PH — build the online career you keep",
};
```

- [ ] **Step 12: The five stage `description` values**

`app/start/page.tsx`:
```ts
  description:
    "Stage 1 for Filipinos with no experience: check your equipment, finish one micro-task with no client, and learn a study protocol you write yourself.",
```
(148 chars. Before: "Your foundation as an online professional. Set up your workspace, learn the core skills, and build the mindset that lasts. No degree or capital needed." — 149 chars, but "the mindset that lasts" is rule 15.)

`app/get-hired/page.tsx`:
```ts
  description:
    "Stage 2: source your own leads with search operators, score them for red flags, and log every application so no follow-up goes late.",
```
(132 chars. Before, at 155: "Land your first client, systematically. Build assets that get replies, work the vetted directory of places to apply, track everything, and close the offer." — "assets that get replies" is the exact phrase §11 names as the thing to beat.)

`app/deliver/page.tsx`:
```ts
  description:
    "Stage 3: run your first week like an audition. Write the SOPs and trackers your role needs, and send status updates a client can act on.",
```
(136 chars. Before: "Impress your client and become reliable. Onboard like a pro, systemize your work with SOPs and trackers, and communicate so clients trust you with more." — "like a pro" is filler.)

`app/level-up/page.tsx`:
```ts
  description:
    "Stage 4: pick one niche and go deep. Automate what repeats, add a premium language, and raise your rate on evidence you can show.",
```
(129 chars. Before: "From good to indispensable. Specialize into a high-value niche, automate the repetitive, learn a premium language, and raise your rate." — rule 4, range opener.)

`app/own/page.tsx`:
```ts
  description:
    "Stage 5: move to direct clients, register with the BIR and pick the 8% option, then hold the door for whoever is coming up behind you.",
```
(133 chars. Before: "The career becomes yours. Go direct, get legit, grow into an end-goal role, then send the ladder back down." — a four-item run of imperatives with no concrete nouns.)

- [ ] **Step 13: Verify nothing still says "actually own"**

Run: `grep -rn "actually own" app/ lib/ components/ data/ public/ 2>/dev/null; echo "exit=$?"`
Expected: no matches, `exit=1` from grep.

- [ ] **Step 14: Run the linter, the tests, the type-check, and the build**

Run: `node scripts/voice-lint.mjs --shell && npx vitest run lib/nav.test.ts lib/stages.test.ts && npx tsc --noEmit && npm run build`
Expected: `voice-lint --shell` shows no `site.json` or `stages.json` errors (the two allowlisted keeps appear only in the density line); all tests pass; build green.

- [ ] **Step 15: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/site.json data/stages.json app/layout.tsx app/manifest.ts lib/meta.ts app/start/page.tsx app/get-hired/page.tsx app/deliver/page.tsx app/level-up/page.tsx app/own/page.tsx components/site/footer.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(copy): rewrite site.json, stage chrome, and the six metadata blocks"
```

---

### Task 4: FAQ, library, educator intro, empty states, and CTA labels

**Parallel group:** B

**Files:**
- Verify (expect no change): `data/faq.json`
- Modify: `data/library.json`, `data/educators.json`
- Modify: `app/path/page.tsx`, `components/journey/stage-page.tsx`
- Modify: `components/application-tracker.tsx`, `components/niche-explorer.tsx`, `components/find-work.tsx`
- Test: `lib/home.test.ts` (Phase 4) keeps running unchanged

**Interfaces:**
- Consumes: `routeDesc` from `@/lib/routes` (Phase 4) reads `library.json` `desc` values, so a rewrite here changes the stage pages' "Tools for this stage" cards and the homepage build cards. That is intended.
- Produces: no new symbols.

#### 4a — `data/faq.json`: re-check, expect no change

- [ ] **Step 1: Record the evidence and leave the file alone**

Run:
```bash
node -e "const f=require('./data/faq.json'); for(const i of f.items) console.log(i.id.padEnd(15), i.a.trim().split(/\s+/).length, 'words');"
```
Expected exactly:
```
free            61 words
va-course       66 words
degree          64 words
ai-jobs         71 words
first-client    63 words
who-runs-this   68 words
```
All six sit inside the 40–90 band (rule 13). Run `node scripts/voice-lint.mjs --shell --json` and confirm no finding has `"file": "faq.json"`.

Three answers open with a one- or two-word verdict ("Yes.", "No.", "Nobody knows.") followed by a short sentence. `isAphorism` deliberately does not fire on those: a direct verdict first is the honest FAQ shape, and Task 1's test `does not fire on a one- or two-word verdict opener` pins that behaviour. `items[1].q` quotes `"VA course"` as the phrase being rejected; that stays, and "virtual assistant" appears nowhere. **No edits to this file.**

#### 4b — `data/library.json`: six descriptions

- [ ] **Step 2: Apply the six `desc` rewrites**

Change only the `desc` value on these six entries. Every other field, and the other 27 entries, stay byte-for-byte.

| `href` | Before | After | Words | Rule |
|---|---|---|---|---|
| `/get-hired` | "Stage two. Source your own leads, track applications, and close the offer." | "Stage two. Source your own leads and close the first offer." | 11 | 7 |
| `/build` | "Learn the anatomy of a resume, an SOP, or a tracker, then write yours." | "Learn how a resume and an SOP are built, then write your own." | 13 | 7 |
| `/niches` | "Explore the lanes with pay bands, demand, skills, and how AI changes each." | "Compare the lanes on cited pay bands and what AI has changed." | 12 | 7 |
| `/languages` | "Japanese, Korean, or Mandarin thins the candidate pool. Where to learn free." | "A second language thins the candidate pool, and PH has free places to learn one." | 15 | 14 |
| `/simulator` | "Model 36 months of a task-taker against a specialist. Every assumption tagged." | "Model 36 months of a task-taker against a specialist, with every assumption tagged." | 13 | 14 |
| `/legit` | "BIR registration, the 8% option, SSS and PhilHealth, and payment rails." | "BIR registration, the 8% option, and the payment rail that protects your rate." | 13 | 7 |

**Do not touch `/tasks`.** Phase 4's `lib/home.test.ts` asserts `expect(routeDesc("/tasks")).toContain("Forty")`, and its current value ("Forty self-contained jobs you can start today, each ending as portfolio proof.") already passes every rule.

#### 4c — `data/educators.json`: `intro` and `quickStart`

- [ ] **Step 3: Apply the two `intro` rewrites**

```json
  "intro": {
    "title": "Take the method into your own room.",
    "lead": "Everything here is built for a facilitator with a room, a projector, and ninety minutes. Take it and run it; you do not need us present, and you do not need our permission.",
    "whoFor": [
      "Teachers running a livelihood or work-immersion class",
      "TESDA and community trainers with a batch to move",
      "Barangay, parish, and co-op organisers hosting a no-cost session",
      "Senior online professionals mentoring juniors in their niche"
    ],
    "honestyNote": "We do not know how many rooms this kit reaches. There is no sign-in, no tracking, and no learner count, so we will never publish one. If a session works, the proof is in your room and in what your participants build, not in a number on our page."
  },
```

| Key | Before | Rule |
|---|---|---|
| `intro.lead` | "…ninety minutes. **Take it, run it, adapt it.** You do not need us present, and you do not need our permission." | 7 — "Take it, run it, adapt it" is a pure rhythm triad |
| `intro.whoFor[0]` | "Teachers running a livelihood, ICT, or work-immersion class" | 7 — three-item triad closing the fragment |
| `intro.title`, `intro.whoFor[1..3]`, `intro.honestyNote` | unchanged | — |

`quickStart` (six steps) passes every rule as authored in Phase 7; run the linter and confirm no `quickStart` line appears. `sessions`, `slides`, and `license` are Phase 7 content and out of §11 scope — they get the Task 6 mechanical sweep only.

#### 4d — Empty states

- [ ] **Step 4: `app/path/page.tsx`**

Replace the `EmptyState` props Phase 4 shipped:

```tsx
      <EmptyState
        title="Pick a lane to start this page"
        body="Choose your niche and this page becomes your hub, with your progress and the next move on it."
```

Before: `title="You have not chosen a path yet"` / `body="Pick a lane and this page becomes your hub: progress, next moves, and the toolkit for that niche."` — the title framed the state as the reader's failure (SKILL.md: write like someone with experience, no cheerleading and no scolding), and the body closed on a three-item list (rule 7). The `media={<Figure id="path-dashboard" … />}` prop and everything else on the component are unchanged.

- [ ] **Step 5: `components/application-tracker.tsx`**

Two strings. At the overdue banner (currently line 232):

```tsx
                ? "No follow-up is overdue right now."
```
Before: `"Nothing overdue, you're on top of it."` — the second clause is a compliment the app cannot verify (rule 18, and SKILL.md "No corporate pep talk tone").

At the list empty state (currently the `<p>` around line 450), which Phase 5 has already moved into `EmptyState`:

```tsx
          <EmptyState
            icon="inbox"
            title="No applications logged yet"
            body="Give every application a row and every “applied” a follow-up date. Log the first one above and the radar starts watching it."
          />
```
Before: "Nothing logged yet. The discipline is simple: every application gets a row, and every “applied” gets a follow-up date. Log your first one above, future you will thank you in four days." — "The discipline is simple" is filler and "future you will thank you" is a promise (rule 18). The `Inbox` lucide import that fed the old markup goes with it; `EmptyState`'s `icon` prop resolves the Phosphor name.

- [ ] **Step 6: `components/niche-explorer.tsx`**

```tsx
          No niches match those filters. Clear one and try again.
```
Before: "No niches match this filter yet." — "yet" implies the list will grow, which it will not on a filter miss.

- [ ] **Step 7: `components/find-work.tsx`**

```tsx
  clear: {
    title: "No red flags checked. Verify the lead anyway.",
    body: "A clean checklist is not proof. Run the research steps below before you send anything or sign anything.",
```
Before: `title: "No red flags checked, still verify independently."` / `body: "A clean checklist isn't proof by itself. Run the research steps below before you commit to anything."` — the title ran two clauses into one comma splice, and "commit to anything" is vaguer than what the page actually asks for.

- [ ] **Step 8: Sweep for any empty state the earlier phases added**

Run:
```bash
grep -rn "<EmptyState" app/ components/ --include=*.tsx
grep -rnE "\"(No |Nothing |Nada )[^\"]{3,90}\"" app/ components/ --include=*.tsx
```
Check every hit against rules 1–9 and 15–16. `components/library/library-browser.tsx` (Phase 2) ships `title="No pages match those filters."` / `body="Clear a filter or try a shorter search term."` — both pass; leave them. `components/comms-lab.tsx:106` ("Nothing flagged. This reads like the person in charge of the thing.") passes: the two-word verdict opener is exempt by design. Any `EmptyState` added by Phase 6 on `/practice` or `/glossary`, or by Phase 7 on `/educators`, is in scope; rewrite it to the same shape used above (a state, then the one action that clears it, no scolding and no promise).

#### 4e — CTA labels

- [ ] **Step 9: `components/journey/stage-page.tsx`**

One label changes:

```tsx
            <Button href="/plan" variant="outline">
              Build a 30-day plan
            </Button>
```
Before: `Build a 30-day plan around this` — six words in a pill button, and "around this" adds nothing the surrounding section has not already said.

`Next: {nextStage.title}`, `Continue to {nextStage.title}`, `Model your next 3 years`, and the `Open` affordance on the tool cards all pass; leave them. `{first.cta}` comes from `stages.json` `doFirst[].cta`, which §11 puts out of scope.

- [ ] **Step 10: Audit the remaining button labels**

Run:
```bash
grep -rnE "<Button[^>]*>[^<]{2,60}<" app/page.tsx components/journey components/layout components/site --include=*.tsx
grep -rn "label\"*:" data/home.json data/site.json
```
Expected label inventory, all passing: "Find your path" (header CTA and hero and CTA band), "How it works", "Open your dashboard", "See all 22 niches", "Browse the library", "Read the method", "Read the Reality Check", "Build a 30-day plan", "Model your next 3 years", "Continue to …", "Next: …", "Open". Every one is a verb plus its object, under five words, and names a real destination. Flag anything else for rewrite before moving on.

- [ ] **Step 11: Run the linter, the tests, and the build**

Run: `node scripts/voice-lint.mjs --shell --strict && npx vitest run && npx tsc --noEmit && npm run build`
Expected: `voice-lint --shell --strict` exits 0 with `0 error(s)` and a density line under 20%; all Vitest suites pass; build green.

- [ ] **Step 12: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/library.json data/educators.json app/path/page.tsx components/journey/stage-page.tsx components/application-tracker.tsx components/niche-explorer.tsx components/find-work.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(copy): library and educator intro copy, empty states, and CTA labels"
```

---

### Task 5: TL;DR draft flags and the Tagalog review checklist

**Parallel group:** B

**Files:**
- Verify (expect no change): `data/tldr.json`
- Verify or complete: `components/practice/tldr.tsx`
- Create: `docs/content/TAGALOG-REVIEW.md`

**Interfaces:**
- Consumes: `data/tldr.json`, shape `{ _note: string; routes: Record<string, { tl: string; reviewed: boolean }> }`.
- Produces: no new symbols. `Tldr` keeps its Phase 6 signature, `({ route }: { route: string })`.

Spec §7.4.7: TL;DRs are "written in this project and **flagged for native-speaker review before publish**; the block carries a 'draft translation' note until the flag is cleared." Spec §16 Q10 records the applied default: ship them marked, do not hold them back.

- [ ] **Step 1: Confirm every route is still flagged**

Run:
```bash
node -e "const t=require('./data/tldr.json').routes; const bad=Object.entries(t).filter(([,v])=>v.reviewed!==false); console.log(Object.keys(t).length,'routes;',bad.length,'not flagged'); if(bad.length) console.log(bad.map(([k])=>k));"
```
Expected: `18 routes; 0 not flagged`.

The 18 are `/start`, `/get-hired`, `/deliver`, `/level-up`, `/own`, `/method`, `/learn`, `/reality`, `/conduct`, `/english`, `/indispensable`, `/ai-first`, `/legit`, `/salary`, `/markets`, `/languages`, `/resources`, `/portfolio`. If any route reports `reviewed: true`, set it back to `false` — nothing has been through a native speaker yet, and a cleared flag on unreviewed copy is exactly the fabricated-assurance the honesty doctrine forbids.

- [ ] **Step 2: Confirm every TL;DR is 60–90 words**

Run:
```bash
node -e "const t=require('./data/tldr.json').routes; for(const [k,v] of Object.entries(t)){const n=v.tl.trim().split(/\s+/).length; console.log((n<60||n>90?'✗ ':'  ')+k.padEnd(16)+n);}"
```
Expected: all 18 print with a leading space; the observed range is 73–86 words. Spec §7.4.7 asks for 60–90.

- [ ] **Step 3: Confirm the component shows the badge**

Read `components/practice/tldr.tsx` and check it does all four of these. If Phase 6 shipped it without the badge, add it now:

```tsx
"use client";

import { Accordion, AccordionItem, Badge, Text } from "@/components/ui";
import tldrData from "@/data/tldr.json";

const ROUTES: Record<string, { tl: string; reviewed: boolean }> = tldrData.routes;

/**
 * "TL;DR sa Tagalog" (spec §7.4.7). Collapsed by default. While `reviewed` is
 * false the block says so in the summary and again in the body — a draft
 * translation that does not announce itself is a claim we have not earned.
 */
export function Tldr({ route }: { route: string }) {
  const entry = ROUTES[route];
  if (!entry) return null;

  return (
    <Accordion type="single">
      <AccordionItem
        id={`tldr-${route}`}
        title={
          <span className="flex flex-wrap items-center gap-2">
            TL;DR sa Tagalog
            {!entry.reviewed && (
              <Badge tone="caution" variant="outline">
                Draft translation
              </Badge>
            )}
          </span>
        }
      >
        <Text size="body">{entry.tl}</Text>
        {!entry.reviewed && (
          <Text size="caption" tone="faint" className="mt-3">
            A native speaker has not reviewed this yet. The English above it is the version to trust.
          </Text>
        )}
      </AccordionItem>
    </Accordion>
  );
}
```

The badge tone is `caution` because `lib/accent.ts` maps it to `--caution` (`#9A5B00`), which is AA on both `paper` and `caution-tint`.

- [ ] **Step 4: Write the failing test for the badge**

Create `components/practice/tldr.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import tldr from "@/data/tldr.json";
import { Tldr } from "./tldr";

describe("Tldr", () => {
  it("marks an unreviewed translation as a draft", () => {
    render(<Tldr route="/start" />);
    expect(screen.getByText("Draft translation")).toBeInTheDocument();
  });

  it("renders nothing for a route with no TL;DR", () => {
    const { container } = render(<Tldr route="/not-a-route" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps every shipped TL;DR flagged for review", () => {
    const unflagged = Object.entries(tldr.routes).filter(([, v]) => v.reviewed !== false);
    expect(unflagged.map(([k]) => k)).toEqual([]);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npx vitest run components/practice/tldr.test.tsx`
Expected: PASS — 3 tests. If the first fails, the badge is missing; add it per Step 3 and re-run.

- [ ] **Step 6: Write `docs/content/TAGALOG-REVIEW.md`**

```markdown
# Tagalog TL;DR review

Every "TL;DR sa Tagalog" block on this site is a **draft translation**. It was
written inside this project, not by a native speaker, and the site says so on
every one of them until this checklist is cleared.

Source of truth: `data/tldr.json`, shape `{ routes: { "<route>": { tl, reviewed } } }`.
Component: `components/practice/tldr.tsx`. While `reviewed` is `false` the block
renders a "Draft translation" badge and a caption pointing the reader at the
English.

## What to check, per row

1. **Meaning matches.** Read the English page first, then the TL;DR. The Tagalog
   must not add a claim, drop a caveat, or soften a warning the English makes.
2. **Register.** Conversational Tagalog with the English loanwords a Filipino
   remote worker actually uses (client, tracker, application, rate). Not textbook
   Filipino, not straight translation of English idiom.
3. **No invented numbers.** If the English carries a figure with a source, the
   Tagalog carries the same figure. If the English says nobody knows, the Tagalog
   says `walang nakakaalam`, not a guess.
4. **Never "virtual assistant".** Use `online professional` or `remote
   professional`, in English, as the site does everywhere else.
5. **Length.** 60–90 words. Shorter loses the point; longer stops being a TL;DR.
6. **Terminology is consistent across routes.** Pick one rendering per term and
   use it in all 18. Note your choice in the Terminology table below.

## How to clear a row

1. Edit `data/tldr.json` → `routes["<route>"].tl` if the text needs changing.
2. Set `routes["<route>"].reviewed` to `true`.
3. Run `npx vitest run components/practice/tldr.test.tsx`. The third test,
   `keeps every shipped TL;DR flagged for review`, **will fail** — that test is
   the tripwire for exactly this moment. Update it to assert the reviewed set
   you intend, in the same commit.
4. Run `npm run verify:all && npm test`.
5. Commit with the reviewer's initials in the message, e.g.
   `content(tldr): native-speaker review of /start and /get-hired (JD)`.

## Rows

| # | Route | English page | Words | Reviewed | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `/start` | Stage 1 · Start Right | 80 | ☐ | | | |
| 2 | `/get-hired` | Stage 2 · Get Hired | 79 | ☐ | | | |
| 3 | `/deliver` | Stage 3 · Deliver | 79 | ☐ | | | |
| 4 | `/level-up` | Stage 4 · Level Up | 78 | ☐ | | | |
| 5 | `/own` | Stage 5 · Own | 79 | ☐ | | | |
| 6 | `/method` | The Method | 76 | ☐ | | | |
| 7 | `/learn` | How to Learn | 75 | ☐ | | | |
| 8 | `/reality` | Reality Check | 78 | ☐ | | | Carries sourced figures — check every one against the English |
| 9 | `/conduct` | Conduct & Integrity | 86 | ☐ | | | Longest row; trim toward 80 if it reads heavy |
| 10 | `/english` | English at Work | 75 | ☐ | | | About English, written in Tagalog — watch the register |
| 11 | `/indispensable` | Become Indispensable | 80 | ☐ | | | |
| 12 | `/ai-first` | AI-First | 81 | ☐ | | | Keep tool names in English |
| 13 | `/legit` | Get Legit | 75 | ☐ | | | BIR, 8%, SSS, PhilHealth stay as the agencies write them |
| 14 | `/salary` | Salary Guide | 73 | ☐ | | | Vendor-grade data must still read as vendor-grade |
| 15 | `/markets` | Client Markets | 77 | ☐ | | | |
| 16 | `/languages` | Languages | 76 | ☐ | | | |
| 17 | `/resources` | Resource Shelf | 73 | ☐ | | | |
| 18 | `/portfolio` | Portfolio Ladder | 75 | ☐ | | | |

## Terminology

Fill this in as you go, so row 18 uses the same words as row 1.

| English | Agreed Tagalog / Taglish | Decided on row |
|---|---|---|
| online professional | (keep in English) | — |
| client | | |
| rate | | |
| application | | |
| follow-up | | |
| portfolio piece | | |
| red flag | | |
```

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add docs/content/TAGALOG-REVIEW.md components/practice/tldr.tsx components/practice/tldr.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(tldr): pin the draft-translation badge and add the native-speaker review checklist"
```

---

### Task 6: The mechanical sweep of the 30 content JSONs

**Parallel group:** C

**Files:**
- Modify: the content JSONs the sweep reports (expected: 23 files carrying banned words, plus one duplicated-opener run in `english.json`)
- Create: `docs/superpowers/reports/2026-08-21-p8-sweep.md`

**Interfaces:**
- Consumes: `scripts/voice-lint.mjs --all` from Task 1.
- Produces: no new symbols.

**The scope is narrow on purpose.** §11: _"The 30 content JSON files get a mechanical sweep only (the banned-word list above, em-dash chains, duplicated sentence openers), reviewed as a diff; rewrites are a separate project."_ So this task fixes three things and nothing else. Reversals and triads in content files print as **notes**, get logged in the report, and are left alone — they are the follow-up project's work.

- [ ] **Step 1: Capture the baseline**

Run:
```bash
node scripts/voice-lint.mjs --all --json > /tmp/p8-sweep-before.json
node -e "const r=require('/tmp/p8-sweep-before.json'); const by={}; for(const e of r.errors) by[e.rule]=(by[e.rule]||0)+1; console.log(by, r.errors.length+' errors, '+r.notes.length+' notes');"
```
Expected, measured on the repo as it stands: **221 strings carrying 230 banned-word occurrences across 23 files**, one `duplicate-opener` run, and four `em-dash-chain` strings that the `EMDASH_EXEMPT` rule already skips (so they should not appear). Occurrence breakdown:

| Word | Count |
|---|---|
| `actually` | 165 |
| `genuinely` | 42 |
| `forever` | 14 |
| `truly` | 3 |
| `seamless` | 2 |
| `synergy` | 1 |
| `utilize` | 1 |
| `delve` | 1 |
| `meticulous` | 1 |

Heaviest files: `labs.json` 44 strings, `tasks.json` 38, `learning.json` 20, `reality.json` 16, `resources.json` 12, `prompting.json` 10, `tracks.json` 10, `english.json` 8, `simulator.json` 8, `frameworks.json` 7, `portfolio.json` 7, then a tail of 12 files with 1–6 each.

If the counts differ, do not adjust the plan — the earlier phases changed the data. Use the numbers the run reports.

- [ ] **Step 2: Fix the banned words, one file at a time**

The four spec §11 words cover 224 of the 230 occurrences and almost all of them are the same three shapes. Apply the shape, then read the sentence back:

| Shape | Fix |
|---|---|
| "what X **actually** does / says / pays / costs" | delete the word. "What the evidence says" is stronger than "what the evidence actually says". |
| "the ones clients **actually** look for" | delete the word, or replace the whole clause with the concrete thing: "the certs named in current job posts". |
| "you can **actually** check" | "you can check". |
| "yours, **forever**" / "anywhere, **forever**" | delete the trailing word and let the clause end, or replace with the concrete span: "for any client after this one". |
| "where demand is **genuinely** growing" | "where demand is growing", or name the measure: "where posting volume is up". |
| "clauses you can **genuinely** keep" | "clauses you can keep". |
| "**truly** independent" | "independent". |
| `seamless`, `synergy`, `utilize`, `delve`, `meticulous` (6 occurrences) | `smooth`/delete, delete the sentence's abstraction, `use`, `read`, `careful`. Read each in context; these six are one-off and deserve one-off fixes. |

**Never** delete a number, a `source` object, a `href`, or an `id` while doing this. **Never** rewrite the surrounding sentence for style. If deleting the word leaves an ungrammatical sentence, make the smallest grammatical repair and note it in the report.

Three occurrences are **not** copy and must be left alone; confirm the linter skips them:
- `components/comms-lab.tsx:15` — `actually` inside the hedge-word regex the English lab uses to score a message. That is a `.tsx` file, so `--all` never reads it.
- `app/equipment/page.tsx:83`, `app/learn/page.tsx:143` — `ACTUALLY` inside JSX section comments. Same reason.

- [ ] **Step 3: Fix the one duplicated-opener run**

`english.json` → `honesty.points` — three consecutive strings all opening "We will not". Rule 9 and SKILL.md "No identical paragraph structure". Keep the meaning exactly; vary the openers:

```json
    "points": [
      "We will not claim that better English raises your rate by some percentage. Upwork asserts that strong communication leads to higher rates, but that's a platform's marketing research, not a controlled study. Any specific number you see quoted (\"improve your English, earn 40% more\") is invented.",
      "Nobody here will tell you that Filipinos are 'too indirect' as a matter of fact. Every article claiming that traces back to BPO and outsourcing-vendor blogs, not research. There is no peer-reviewed study showing Filipino remote workers are perceived as less senior because of po, sir/ma'am, or indirectness. Treat the habits below as things to audit in your own writing, not as a diagnosis of your culture.",
      "Accent reduction is not on sale here either. The research field moved away from that decades ago. The goal is being understood, not sounding American, and the two are not the same thing."
    ]
```

Only the first six words of `points[1]` and the first seven of `points[2]` change. Everything after, including the Upwork attribution and the "no peer-reviewed study" sentence, is byte-for-byte identical.

- [ ] **Step 4: Confirm the em-dash exemption held**

Run:
```bash
node scripts/voice-lint.mjs --all --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);console.log(r.errors.filter(e=>e.rule==='em-dash-chain'));});"
```
Expected: `[]`. The only four em-dash chains in `data/` are in `annotated.json` `examples[*].blocks[*].text`, which reproduce a resume line, a shared-file list, and an invoice; their em dashes are document formatting. If a new one appears outside that path, fix it by splitting the sentence, not by swapping the dash for a comma.

- [ ] **Step 5: Confirm the honesty layer is intact**

Run:
```bash
npm run verify:claims
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat data/
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff -U0 data/ | grep -E "^[+-]" | grep -iE "\"(url|label|grade|date)\":|[0-9]{2,}|₱|\\$|%" | head -40
```
Expected: `verify:claims` passes; the third command prints **nothing**. Any line it prints is a number, a currency figure, or a source field that the sweep touched — revert that hunk before going further.

- [ ] **Step 6: Write the reviewable report**

Create `docs/superpowers/reports/2026-08-21-p8-sweep.md`. Generate the body from the diff so a reviewer can read every change without opening 23 files:

```bash
mkdir -p docs/superpowers/reports
{
  echo "# Phase 8 content-JSON sweep"
  echo
  echo "Scope (spec §11): banned words, em-dash chains, duplicated openers. Nothing else."
  echo "Numbers, \`source\` objects, hrefs and ids are untouched; \`npm run verify:claims\` passes."
  echo
  echo '## Files touched'
  echo
  git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat data/
  echo
  echo '## Every changed string'
  echo
  echo '```diff'
  git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff -U0 data/ | grep -E '^(diff|[+-])' | grep -v '^[+-][+-]'
  echo '```'
  echo
  echo '## Left alone, on purpose'
  echo
  echo '| Where | Pattern | Why |'
  echo '|---|---|---|'
  echo '| `annotated.json · examples[*].blocks[*].text` | em-dash chains ×4 | Literal reproductions of a resume, a file list, and an invoice. |'
  echo '| `tasks.json · tasks[11,14,15].brief.steps` | duplicated openers ×3 | Procedural imperative lists; parallel openers are the point. |'
  echo '| every content file | reversals and triads | §11 puts voice rewrites of the content JSONs in a separate project. Listed as notes below. |'
  echo
  echo '## Notes carried forward to the content-voice project'
  echo
  echo '```'
  node scripts/voice-lint.mjs --all --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{for(const n of JSON.parse(s).notes) console.log(n.rule.padEnd(10), n.file+' · '+n.path);});"
  echo '```'
} > docs/superpowers/reports/2026-08-21-p8-sweep.md
```

- [ ] **Step 7: Re-run the linter and the whole test suite**

Run: `node scripts/voice-lint.mjs --all --strict && npm test`
Expected: `0 error(s)` from the linter (notes are fine and expected), exit 0; `node --test` and Vitest both green.

- [ ] **Step 8: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/ docs/superpowers/reports/2026-08-21-p8-sweep.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(copy): mechanical sweep of the content JSONs (banned words, openers)"
```

---

### Task 7: Exit verification

**Parallel group:** D

**Files:**
- Modify: `BUILD_GUIDE.md` (one new section), this plan file (the Status block)

**Interfaces:**
- Consumes: everything Tasks 1–6 produced.
- Produces: nothing new.

- [ ] **Step 1: The §14 row-8 gate — `voice-lint` clean on the shell**

Run: `npm run voice:lint -- --shell --strict; echo "exit=$?"`
Expected:
```
voice-lint · shell · 6 files

Aphorism density: 2/N prose strings (x.x%, gate ≤ 20%). 2 deliberate keeps.

0 error(s), 0 note(s).

exit=0
```
The two aphorisms counted are the allowlisted keeps (`site.json · standard.title`, `stages.json · [4].quote`). Anything else in the error list is a Task 2–4 miss; fix it in the owning task's file and re-run.

- [ ] **Step 2: The §14 row-8 gate — hero ≤ 8 words**

Run:
```bash
node -e "const h=require('./data/home.json').hero; const n=(h.title+' '+h.accent).trim().split(/\s+/).length; console.log(h.title, h.accent, '=', n, 'words'); process.exit(n<=8?0:1);"
```
Expected: `Build the online career you keep. = 6 words`, exit 0.

- [ ] **Step 3: The §14 row-8 gate — `voice-audit` density on the shell**

Run: `npm run voice:audit -- --shell`
Expected: the report covers the six shell files and the aphorism count is 2. **The threshold, stated plainly:** density is `flagged ÷ prose strings`, where a *prose string* is any in-scope string with two or more sentences — the only kind the detector can flag. The gate is **≤ 20%**, that is, at most one aphorism per five multi-sentence strings, which is the "thin ~1-in-5" instruction in `scripts/voice-audit.mjs`'s own header comment. Measured before this phase, the six shell files ran **11 flagged out of 38 prose strings (28.9%)**. After Tasks 2–4 the count is 2, comfortably inside the gate, and `scripts/voice-lint.mjs` fails the build if it ever climbs back over 20%.

- [ ] **Step 4: Full verification**

Run: `npm run verify:all && npm test && npm run build`
Expected: every step exits 0. `verify:all` now runs, in order: `verify:contrast`, `verify:claims`, `voice:lint -- --shell --strict`, `lint`, `tsc --noEmit`, `verify:primitives`.

- [ ] **Step 5: Confirm nothing forbidden survived anywhere**

Run:
```bash
grep -rniE "\b(actually|forever|genuinely|truly)\b" data/ ; echo "data exit=$?"
grep -rniE "virtual assistant" data/ app/ components/ ; echo "va exit=$?"
grep -rn "actually own" . --include=*.ts --include=*.tsx --include=*.json --include=*.md | grep -v docs/superpowers ; echo "brand exit=$?"
```
Expected: `data exit=1`, `va exit=1`, `brand exit=1` — grep found nothing in all three. (This plan file and the sweep report quote the old strings, which is why `docs/superpowers` is excluded from the third.)

- [ ] **Step 6: Record the rules in `BUILD_GUIDE.md`**

The build guide is what the next writer reads. Add this after the existing "Voice & rules (non-negotiable)" section:

```markdown
## Copy gate (Phase 8)

Shell copy is linted. Before writing or editing any string in `data/home.json`,
`data/site.json`, `data/stages.json` chrome, `data/faq.json`, `data/library.json`,
or `data/educators.json` `intro`/`quickStart`, read the rules and then run the gate:

    npm run voice:lint -- --shell --strict   # fails the build on any violation
    npm run voice:lint -- --all              # the sweep rules over every data/*.json
    npm run voice:audit -- --shell           # aphorism cadence report

Rules, in one line each: hero ≤ 8 words; lead ≤ 25; nav and library `desc` 6–16;
FAQ answers 40–90; one idea per paragraph; no `actually` / `forever` /
`genuinely` / `truly`; no AI-slop vocabulary (`delve`, `seamless`, `pivotal`,
`showcasing`, `crucial`, `leverage` as a verb, and the rest of
`.claude/skills/anti-ai-slop-writing/references/banned-words.md`); no "not X, Y"
reversals; no triads for rhythm; no lists of negatives; no em-dash chains; no
three consecutive strings opening with the same two words; concrete nouns and
verbs; Taglish only where it already is; never "virtual assistant".

The detectors live in `lib/voice-lint.ts` and are unit-tested in
`lib/voice-lint.test.ts`. Two strings are allowlisted as deliberate keeps;
`scripts/voice-lint.mjs` names them and says why. The 30 content JSONs are under
the sweep rules only (banned words, em-dash chains, duplicated openers); their
full voice rewrite is a separate project.
```

- [ ] **Step 7: Fill in the Status block below and commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add BUILD_GUIDE.md docs/superpowers/plans/2026-08-21-ui-overhaul-p8-copy.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs(copy): record the phase 8 copy gate in the build guide and close the plan"
```

---

## Status

_Filled in by the implementer as tasks land._

| Task | State | Commit | Notes |
|---|---|---|---|
| 1 — linter, tests, CLI | ☐ | | |
| 2 — `home.json` | ☐ | | |
| 3 — `site.json`, stage chrome, metadata | ☐ | | |
| 4 — FAQ, library, educators, empty states, CTAs | ☐ | | |
| 5 — TL;DR flags, review checklist | ☐ | | |
| 6 — content sweep | ☐ | | |
| 7 — exit verification | ☐ | | |

**Exit criteria (spec §14 row 8):**

| Criterion | Command | Result |
|---|---|---|
| `voice-audit` clean | `npm run voice:audit -- --shell` | ☐ 2 flagged, both allowlisted |
| Aphorism density ≤ 1-in-5 | `npm run voice:lint -- --shell --strict` | ☐ ≤ 20% of prose strings |
| Hero ≤ 8 words | Task 7 Step 2 | ☐ 6 words |
| TL;DR drafts flagged | `npx vitest run components/practice/tldr.test.tsx` | ☐ 18/18 `reviewed: false` |
| Full suite | `npm run verify:all && npm test && npm run build` | ☐ |

---

## Self-review

**1. Spec coverage.** Every §11 clause maps to a task:

| Spec clause | Task |
|---|---|
| §11 scope: `site.json` hero/nav/standard/mission/footer | Task 3 (hero moved to `home.json` in Phase 4, so Task 2) |
| §11 scope: `stages.json` chrome (`kicker`, `steps`, `closing`) | Task 3b — plus `role`, `subtitle`, `quote`, `outcome`, which are also chrome; `summary` and `doFirst` untouched, as §11 requires |
| §11 scope: `faq.json`, `library.json` | Task 4a (verified unchanged), 4b (six rewrites) |
| §11 scope: all CTAs and empty states | Task 4d, 4e |
| §11 scope: `metadata` of home and stage pages | Task 3c |
| §11 rule: hero ≤ 8 words, lead ≤ 25, one idea per paragraph | Rule rows 10, 11, 14; enforced in Task 1, applied in Task 2, gated in Task 7 |
| §11 rule: no `actually`/`forever`/`genuinely`/`truly` | Rule row 1; Tasks 2, 3, 6; grepped in Task 7 Step 5 |
| §11 rule: no "not X, Y" reversals | Rule row 6; `isReversal`; Task 3b clears the two in `stages.json` |
| §11 rule: no triads for rhythm | Rule row 7; `triadIn`; Tasks 2, 3, 4 clear 14 of them |
| §11 rule: no lists of negatives | Rule row 16; applied by hand in Task 3b (`[0].quote`) |
| §11 rule: concrete nouns and verbs | Rule row 15; every before → after table names the rule it fixes |
| §11 rule: Taglish stays where it is | Global Constraints; `faq.json` untouched, so "walang bayad, walang catch" survives |
| §11 rule: honesty doctrine, no number without a source | Global Constraints; Task 6 Step 5 diffs for number and `source` drift |
| §11: content JSONs get a mechanical sweep only, reviewed as a diff | Task 6, and the report at `docs/superpowers/reports/2026-08-21-p8-sweep.md` |
| §9 copy-adjacent slop: "0 templates handed out" stat cards | Phase 4 replaced `stats`; Task 3 Step 3 fixes the surviving `sub` triad |
| §9: kicker-with-dot mono labels, marquee, Sparkles | Phases 0–5; nothing copy-side left |
| §7.4.7: TL;DR drafts flagged for native-speaker review | Task 5, plus `docs/content/TAGALOG-REVIEW.md` |
| §14 row 8 exit: `voice-audit` clean, hero ≤ 8 words, TL;DRs flagged | Task 7 Steps 1–3, and the Status table |
| §1: the 70-word hero paragraph that repeated "forever" | Task 2 — hero lead is 18 words, one sentence, one idea, zero banned words |
| §16 Q10: TL;DRs ship marked rather than held back | Task 5 Step 3, the badge |
| `anti-ai-slop-writing` skill folded into the rule table with citations | The rule table, rows 3–5 and 7, 8, 9, 14, 15, 19, each citing SKILL.md or `references/banned-words.md` |

**Two deliberate deviations, both recorded above rather than hidden:**
- The brief asks for a 6–16-word gate on nav `desc`s. Phase 2's `lib/nav.test.ts` already pins nav `desc` to 6–10 and keeps running. Task 3's rewrites all land at 8–10, so both gates pass; the linter uses 6–16 so it can cover `library.json` (11–15 words) with the same rule.
- The brief lists `stages.json` chrome as `kicker`, `steps`, `closing`, `role`, `subtitle`, `quote`. Task 3b also rewrites `outcome`, because `StagePage` renders it as the "Do these first" section lead — it is chrome by function, and two of the five broke the reversal rule. `summary`, `doFirst`, and `tools` stay untouched exactly as §11 requires.

**2. Placeholder scan.** No "TBD", no "similar to Task N", no "add error handling". Every rewritten string appears in full, in its own code block or table cell, with its before value and the rule it fixes. Every detector has its implementation and its test. Every command has its expected output.

**3. Type consistency.** `lib/voice-lint.ts` exports exactly the names Task 1's Interfaces block lists, and the test file and `scripts/voice-lint.mjs` import only those: `BANNED`, `PROCEDURAL_ARRAY_KEYS`, `words`, `sentences`, `opener`, `bannedWords`, `isReversal`, `triadIn`, `emDashChain`, `duplicateOpeners`, `isAphorism`, `isUrl`, `isSourcePath`, `walkStrings`, plus the `RuleId` and `Finding` types. `scripts/voice-audit.mjs` is edited to call `isAphorism` and `walkStrings`, matching those names rather than its old local `isAphoristic`/`strings`. `site.footer.honesty` and `site.footer.note` are defined in Task 3 Step 4 and consumed in Step 6 under the same names. `Tldr({ route })` in Task 5 matches the Phase 6 signature the spec's §5.2b table gives. `HomeCopy` is not changed, so every key in Task 2's `home.json` is one `lib/home.ts` already declares.
