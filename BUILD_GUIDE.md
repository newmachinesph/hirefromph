# DevUp — Build Guide (read before building any page)

Next.js 16 App Router, React 19, Tailwind v4 (CSS-first, tokens in `app/globals.css`), `motion` for animation, `lucide-react` icons. Light mode only. TypeScript strict.

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
- No external images. Build visuals with CSS/SVG/gradients/`dotgrid`. Emoji flags OK.
- All content comes from `data/*.json`. Do not hardcode copy that exists in JSON.

## Design tokens (Tailwind utilities already wired)
Colors: `paper`, `paper-2`, `paper-3`, `card`, `ink`, `ink-soft`, `ink-faint`, `line`, `line-strong`, `coral`, `coral-deep`, `coral-tint`, `emerald`, `emerald-tint`, `indigo`, `amber`.
Fonts: `font-display` (Bricolage Grotesque — headings), default sans (Geist), `font-mono` (Geist Mono — kickers/code).
Type: `text-[length:var(--text-hero)]`, `--text-display`, `--text-h2`, `--text-h3`, `--text-lead` (pair each with its `--line-height`).
Radius: `rounded-[var(--radius)]` / `--radius-sm` / `--radius-lg`. Shadows: `shadow-[var(--shadow-sm)]`, `--shadow-md`, `--shadow-lg` (pick one token per class).
Helpers (globals.css): `.container-x` (page gutter+max-width), `.kicker`, `.dotgrid`, `.link-sweep`, `.font-display`.

## Shared components (import and REUSE — do not re-invent)
- `@/components/ui` → `Kicker`, `Pill` (tone: neutral|coral|emerald|amber|indigo), `ButtonLink` (variant: primary|outline|ghost; `external`), `ArrowLink`, `SectionHeading` ({kicker,title,lead,align}), `Marquee`.
- `@/components/reveal` → `Reveal` ({i?: staggerIndex, as?, className}) — scroll-reveal wrapper (client). Wrap sections/cards.
- `@/components/icon` → `Icon` ({name}) — resolves kebab icon names from JSON to Lucide. Use for any icon name stored in JSON.
- `@/components/copy-button` → `CopyButton` ({value, label}).
- `@/components/path-chooser` → `PathChooser` ({compact?, redirectTo?, onChosen?}).
- `@/components/path-gate` → `PathGate` ({children, teaser?, unlocks?}) — wrap DEEP content; before the user picks a path it shows a locked invitation + inline chooser, after it reveals children. Use it to gate the heaviest lists (apply directory, full niche detail, full prompt library).
- `@/lib/path-context` → `usePath()` → `{state, hydrated, hasPath, choosePath, clearPath, setStage, toggleStep, togglePlanDay, toggleEquipment, setPlanAnswers}`. Client only.
- `@/lib/utils` → `cn(...)`.

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
- Cards: `rounded-2xl border border-line bg-paper-2 p-6`, hover `hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-300`.
- accent maps (reuse):
  - text: coral→`text-coral`, emerald→`text-emerald`, amber→`text-[#9a6b00]`, indigo→`text-indigo`
  - bar/bg: coral→`bg-coral`, emerald→`bg-emerald`, amber→`bg-amber`, indigo→`bg-indigo`
- Accessibility: semantic landmarks, `alt`/`aria-label`, keyboard-usable controls, focus-visible is styled globally.
- Reference implementation for tone & polish: `app/page.tsx`.

## Data shapes (in `data/`)
- `site.json` ({brand,mission,standard,contact,stats[],**navGroups**[],primaryNav[]} — `navGroups` drives BOTH the mobile nav and the footer; add a route there and it appears in both), `stages.json` (4 stages), `roadmap.json` (9 steps), `tracks.json` ({intro,note,tracks[]}), `prompts.json`, `plan.json`, `equipment.json`, `apply.json`, `tools.json`, `languages.json`, `doctrine.json`, `frameworks.json`, `labs.json`, `tasks.json`, `learning.json`, `findwork.json`, `prompting.json`, `learntools.json`.
- Honesty-doctrine pages: `conduct.json` ({intro,creed,principles[],philippineAnchor,cases[],dosDonts[],oath{clauses[]},honesty}), `english.json` ({baseline,threeCauses,honesty,banlist,frameworks[],speaking,resources[],lab}), `reality.json`, `simulator.json`. Each carries `source: {label,url}` objects — render them, never strip them.
Import JSON directly: `import data from "@/data/x.json";`.
