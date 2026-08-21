# Hire From PH — Build Guide (read before building any page)

Next.js 16 App Router, React 19, Tailwind v4 (CSS-first, tokens in `app/globals.css`), `motion` for state-change animation only, Phosphor icons via `components/icon.tsx` (lucide is being removed; add no new lucide imports). Light mode only. TypeScript strict.

## THE CORE DOCTRINE (read `data/doctrine.json` — this governs everything)

**We do not spoon-feed artifacts. We teach resourcefulness.**

The platform never hands over a finished file to download and rename. For every deliverable it instead teaches:
1. **Why it exists** — what job the artifact actually does.
2. **Its anatomy** — each part, its purpose, and the rule that makes it good.
3. **The judgment** — the decisions the user must make, and how to choose.
4. **A workshop** — the user writes it themselves, in their own words, from their own situation. The output is *theirs*.
5. **Self-critique** — a checklist so they can judge their own work without us.
6. **Where to build it for real** — do it in Docs/Sheets/Notion themselves.

This applies to EVERY page, not just templates:
- Finding work → teach how to *source and vet* opportunities yourself (search operators, red flags), not just a list to click.
- AI → teach *how to write a prompt*, not just prompts to paste.
- Tools → teach *how to learn any tool fast* (transferable method), not just tutorials.
- Niches/Equipment → teach the *evaluation framework*, not just a recommendation.

Never write copy that implies "download this" / "copy this file and rename it" / "here's the done-for-you X". Lists and examples exist only as **material to study and extract rules from**. Say so explicitly when you show one.

Test for any section you write: *does this make the reader more capable, or more dependent?* If dependent, rewrite it.

## THE HONESTY DOCTRINE (equally non-negotiable)

We ask users to sign an integrity oath. We therefore hold ourselves to it — a site that fakes its own numbers has no standing to teach conduct.

- **No fabricated social proof.** No invented testimonials, no made-up learner counts, no "12,000+ people started". If we don't have it, we don't claim it.
- **Every statistic ships with a visible, clickable link to its primary source.** No exceptions. Use the `Source` component pattern in `app/conduct/page.tsx`.
- **Where the data doesn't exist, say so.** There is no credible data on time-to-first-client, freelancer churn, or what fraction succeed. `/reality` states this plainly. Teaching the reader to spot an unsourced number is worth more than a number.
- **Label vendor-grade data as vendor-grade.** PH rate "guides" are staffing/training-vendor marketing with no disclosed methodology. Cite them if you must, but tag them, and show where they contradict each other.
- **Never assert a pay figure without a source.** Prefer a qualitative claim to a fabricated precise one.
- Distinguish **SOURCED** from **ASSUMPTION** anywhere we model or project (see `/simulator`).

## Voice & rules (non-negotiable)
- Audience: Filipinos building a remote career. Warm, direct, encouraging. Light Taglish is welcome ("walang bayad, walang catch", "sabi sa'yo eh").
- **Never** say "virtual assistant" or "assistant". Always **"online professional" / "remote professional"**.
- Free, path-based, not overwhelming. Depth reveals as the user goes.
- No hotlinked or third-party images. First-party assets in `public/images/` (manifest `data/visuals.json`) render through the `Figure` primitive; every generated asset is captioned as illustrative (spec §7.1). Emoji flags OK.
- All content comes from `data/*.json`. Do not hardcode copy that exists in JSON.

## Design tokens (Tailwind utilities already wired)
Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` §4. Phase 0 of the overhaul shipped these; Phases 1–5 replace the page structure.

Surfaces: `paper` (white), `band` (lavender section band), `tint`, `card`. Ink: `ink`, `ink-soft`, `ink-faint`, `on-navy`. Lines: `line`, `line-strong`, `control` (form borders, 3:1).
Primary: `primary`, `primary-deep`, `primary-tint`, `primary-soft`.
Semantic accents — the bare name is the **text/deep** value (AA on paper and on its tint); `*-fill` is the vibrant shape colour and takes **ink text only**; `*-tint` is the pale surface: `verified`, `caution`, `info`, `coral` (red flags). Stage ids in JSON (`signal|caution|verified|info`) resolve through `lib/accent.ts` — **never re-declare accent maps in a page.**
White text is allowed only on `primary`, `primary-deep`, `ink`, and the deep semantic values.
`ink-faint` is for paper/band backgrounds only; on `*-tint` surfaces use `ink-soft` (AA).

Fonts: `font-display` (Cabinet Grotesk — headings, buttons, wordmark), `font-sans` (Inter — everything else). No mono family.
Type: `text-hero` `text-display` `text-h2` `text-h3` `text-h4` `text-h5` `text-lead` `text-body` `text-small` `text-caption` `text-kicker` — each utility already carries its line-height, weight, and tracking; do not pair with `leading-*`.
Radius: `rounded-sm` (8) `rounded-md` (12) `rounded-lg` (20) `rounded-pill`. Shadows: `shadow-[var(--shadow-sm)]` (dropdowns) and `--shadow-md` (dialogs) only — cards use borders, never shadows, never hover lifts.
Helpers (globals.css): `.container-x`, `.skip-link`. Legacy helpers `.kicker`, `.font-display`, `.link-sweep` remain until Phase 5.

## Shared components (import and REUSE — do not re-invent)

Everything visual is built from two barrels. Pages compose them; pages do not
re-style borders, radii, inputs, type or accents by hand.
`npm run verify:primitives` warns when a page bypasses them, and from Phase 5 it
fails the build.

- `@/components/ui` — primitives, one per file:
  `Accordion` / `AccordionItem`, `Badge`, `Button`, `Callout`,
  `Card` / `CardBody` / `CardFooter` / `CardMedia`, `Checkbox`, `ChoiceCard`,
  `DiagramFrame`, `Dialog`, `EmptyState`, `Field` (+ `controlClass`,
  `useFieldControl`), `Figure`, `Heading`, `Icon` (+ `ICON_NAMES`), `Input`,
  `Kicker`, `ProgressBar`, `Radio`, `Range`, `Select`, `Source` / `SourceList`,
  `Stat` / `StatStrip`, `Step` / `StepList`, `Switch`,
  `Tabs` / `TabList` / `Tab` / `TabPanel`, `Text`, `Textarea`.
- `@/components/layout` — page structure: `Breadcrumb`, `CardGrid`, `Container`,
  `CtaBand`, `FeatureRow`, `PageFooterNav`, `PageHero`, `Section`,
  `SectionHeading`, `Toc`.

Rules that matter more than the list:

- **`Button` is the only button.** `href` renders a `next/link`; `href` +
  `external` renders `<a target="_blank" rel="noopener noreferrer">`; no `href`
  renders a real `<button>`. Never hand-roll a pill.
- **`Heading` and `Text` are the only way to reach the type scale.** Headline
  accent colouring is the `Heading accent` prop, never an inline
  `<span className="text-primary">`.
- **`Field` owns label, hint and error wiring.** Put a single control inside
  `Field`; put a set of `Radio`s or `ChoiceCard`s inside `Field as="group"`.
  `aria-describedby` and `aria-invalid` come for free — do not set them by hand.
- **`Figure` is the only image path.** Pass a manifest `id` from
  `data/visuals.json`, or `src` + `alt` + `width` + `height`. Any entry marked
  `generated` is captioned "Illustrative image" automatically; that caption is
  honesty doctrine, not decoration.
- **`Source` is the only way to cite.** `grade="vendor"` tags staffing- and
  training-vendor data as vendor-grade.
- **`Dialog` owns modality**: portal, focus trap, Escape, return focus, scroll
  lock. Do not write another one.
- **`Card` is a single interactive unit.**
  - A `Card` with `href` is one link: never nest a `Button`, link, or other
    interactive element inside it — put secondary actions outside the card or
    use a non-linked `Card` with a `Button` in `CardFooter`.
  - Touch targets: every interactive primitive renders ≥ 44px tall; do not
    override their height classes.

Still current, unchanged by the overhaul:

- `@/components/copy-button` → `CopyButton` ({value, label}).
- `@/components/path-chooser` → `PathChooser` ({compact?, redirectTo?, onChosen?}).
- `@/components/path-gate` → `PathGate` ({children, teaser?, unlocks?}) — wrap DEEP content; before the user picks a path it shows a locked invitation + inline chooser, after it reveals children.
- `@/lib/path-context` → `usePath()` → `{state, hydrated, hasPath, choosePath, clearPath, setStage, toggleStep, togglePlanDay, toggleEquipment, setPlanAnswers}`. Client only.
- `@/lib/accent` → `ACCENT`, `accent(id)`, `isAccent`, `ACCENTS` — the single accent map.
- `@/lib/utils` → `cn(...)`.

Deprecated, kept only so pre-overhaul pages compile (Phase 5 deletes them):
`Pill` (use `Badge`), `ButtonLink` (use `Button`), `ArrowLink` (use
`Button variant="link"`), `Marquee`, and the old `PageHero` / `SectionHeading`
signatures re-exported from `@/components/ui`. `@/components/reveal` → `Reveal`
is a no-op wrapper and is being unwrapped as pages migrate — do not add new uses.
`@/components/icon` re-exports `Icon` from `@/components/ui/icon`; import from
`@/components/ui` in new code.

## Page conventions
- Every route is `app/<slug>/page.tsx`. Add `export const metadata = { title, description }`.
- Default to Server Components. Add `"use client"` only for interactivity (wizards, filters, toggles, copy). Split interactive bits into their own client component under `components/` and import into the server page.
- Page shell pattern:
  ```tsx
  <section className="container-x pt-14 pb-10 lg:pt-20">
    <Reveal><Kicker>…</Kicker></Reveal>
    <Reveal i={1}><h1 className="mt-5 font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">…</h1></Reveal>
    <Reveal i={2}><p className="mt-5 max-w-2xl text-[length:var(--text-lead)] text-ink-soft">{intro}</p></Reveal>
  </section>
  ```
- Cards: use `<Card>`. Bordered, **never shadowed** — `rounded-md border border-line bg-paper` on paper, `border-line-strong` on a band (`<Card onBand>`). Padding is `padding="sm" | "md" | "lg"`. `interactive` (or `href`) hovers to `border-ink` + `bg-band` only: no translate, no shadow, no scale. Compose media cards as `<Card padding="none"><CardMedia/><CardBody/><CardFooter/></Card>`.
- Accents: `import { ACCENT, accent, type Accent } from "@/lib/accent"`. Stage ids in JSON stay `signal | caution | verified | info`; `coral` is added for red-flag content. Read classes off the map — `accent(stage.accent).text | .fill | .tint | .border | .ring | .soft` — and **never re-declare an accent map in a page**. `verify:primitives` flags `const accentText`, `accentBar`, `accentSoft`, `accentBorder`.
- Accessibility: semantic landmarks, `alt`/`aria-label`, keyboard-usable controls, focus-visible is styled globally.
- Reference implementation for tone & polish: `app/page.tsx`.

## Data shapes (in `data/`)
- `site.json` ({brand,wordmarkAccent,meaning,tagline,mission,standard,stats[],**navGroups**[],primaryNav[]} — `navGroups` drives BOTH the mobile nav and the footer; add a route there and it appears in both), `stages.json` (4 stages), `roadmap.json` (9 steps), `tracks.json` ({intro,note,tracks[]}), `prompts.json`, `plan.json`, `equipment.json`, `apply.json`, `tools.json`, `languages.json`, `doctrine.json`, `frameworks.json`, `labs.json`, `tasks.json`, `learning.json`, `findwork.json`, `prompting.json`, `learntools.json`.
- Honesty-doctrine pages: `conduct.json` ({intro,creed,principles[],philippineAnchor,cases[],dosDonts[],oath{clauses[]},honesty}), `english.json` ({baseline,threeCauses,honesty,banlist,frameworks[],speaking,resources[],lab}), `reality.json`, `simulator.json`. Each carries `source: {label,url}` objects — render them, never strip them.
Import JSON directly: `import data from "@/data/x.json";`.
