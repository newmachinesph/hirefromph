# Design Review: Hire From PH, UI overhaul

Reviewed against: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`, `BUILD_GUIDE.md`, `README.md`

Design system: Inter (text) × Cabinet Grotesk (display), navy ink on white paper with
lavender bands, one blue-violet primary (`#4B4EF6`) and four semantic accents, 8/12/20px
radii, bordered cards, no scroll motion.

Date: 2026-08-22 · Branch `redesign/ui-overhaul` · Commit `d18f14b` (Phases 0–8; this
review and the Task 1/2 fixes below land in the commits immediately following it).
Supersedes the 2026-08-17 audit of the pre-overhaul site.

## Screenshots captured

**None in this pass.** Phase 9 was split by owner ruling: this pass (Tasks 1 dead-file
sweep, 2 service worker, 8 documentation) runs first and explicitly skips screenshot
capture for speed; Tasks 3/5/7 run separately afterward as a merge-gate QA pass and are
where `screenshots/final/` (the matrix, `measurements.md`, `lighthouse.md`, `keyboard.md`,
`INDEX.md`) gets produced. None of those five artifacts exist yet at the time of writing.
Every section below that would normally transcribe them says **not measured** rather than
guessing or reusing v1's numbers, which are from a different design system and no longer
apply.

## Summary

The overhaul replaces the v1 "Signal system" (Space Grotesk, graphite, electric indigo,
scroll-triggered reveals) with a calmer system: Inter/Cabinet Grotesk, navy ink on white
with lavender bands, one blue-violet primary, bordered cards with no hover lift or shadow,
and no scroll motion — `Reveal` and the fade-on-scroll pattern are gone from the codebase
entirely (confirmed by grep across `app/`, `components/`, `lib/`: zero matches). The IA
also changed shape: the four-stage roadmap becomes five stages and eleven steps
(`data/stages.json`, `data/roadmap.json`), and three new destinations shipped —
`/library` (a filterable index of every route), `/practice` (retrieval practice: due
items, decks, quiz history, streak), and `/glossary` (A–Z terms with Taglish glosses) —
plus the not-yet-linked `/educators` kit (see Should fix).

No measured numbers are available in this pass to characterize the result quantitatively
— Lighthouse scores, CLS, homepage weight, and the keyboard/screen-reader pass all wait on
the merge-gate QA pass (Tasks 3/5/7). What this pass verified directly: the tree type-checks
clean (`tsc --noEmit`), lints with zero errors, and the full test suite passes (`node --test`
+ vitest, 490 tests including the isolated re-run of one flaky 5 s timeout).

The open editorial question from the v1 review — homepage catalog weight on a phone — is
**not resolved or re-opened by this pass**, because it requires the visual/measurement
pass this task explicitly deferred. Whoever runs Tasks 3/5/7 should treat it as the first
thing to check against the new `/library` index, which may already relieve the pressure the
v1 review flagged by giving the homepage somewhere to point instead of listing everything
itself.

## Success criteria, measured

Not measured in this pass. `screenshots/final/measurements.md` does not exist yet; it is
produced by the merge-gate QA pass (Task 5/7 territory per the Phase 9 plan). Do not
substitute the v1 numbers — they were measured against a different design system.

## Performance and accessibility

Not measured in this pass. `screenshots/final/lighthouse.md` and the raw
`screenshots/final/lighthouse/*.json` reports do not exist yet. Budgets to check against
once they do (spec §10): LCP < 2.5 s on mobile, CLS < 0.05, Lighthouse a11y ≥ 95 and
perf ≥ 90 on `/` and `/start`.

## Keyboard and screen-reader pass

Not measured in this pass. `screenshots/final/keyboard.md` does not exist yet.

## Must fix

**Not evaluated in this pass.** This pass covered dead-code removal, service-worker
caching, and documentation only — it did not audit the running site for correctness bugs
or accessibility blockers, so an empty list here would be false confidence, not a clean
bill of health. Treat Must-fix as open until the merge-gate QA pass (Tasks 3/5/7) actually
looks for them.

## Should fix

1. **Two files still import the deleted `components/json-ld.tsx` shim by its old path.**
   `app/tasks/page.tsx:4` and `app/interview/page.tsx:3` import `JsonLd` from
   `@/components/json-ld` (a one-line re-export of `@/components/site/json-ld`) instead of
   the `@/components/site` barrel. The dead-file sweep (Task 1) left it in place because it
   has live importers — deleting it would break the build — but the two call sites should
   move to `@/components/site` (or `@/components/site/json-ld`) so the shim can go too.

2. **`verify:kit` is not wired into `verify:all`.** `package.json`'s `verify:all` runs
   contrast, links, claims, eslint, `tsc`, and primitives, but not `verify:kit` (the check
   that the kit PDFs' embedded content hash matches `data/educators.json`). This is a
   pre-existing gap, not something this pass introduced; noting it here rather than wiring
   it in, since deciding whether the kit PDF pipeline should gate the build is a product
   decision, not a docs fix.

3. **`/educators` is unlinked.** `data/site.json`'s footer entry and `data/library.json`'s
   entry both carry `href: "/educators"` with `pending: true`, and there is no
   `app/educators/page.tsx` — the landing page has not been built. The kit routes
   themselves (`/educators/kit/one-pager`, `/path-map`, `/methods`, `/session/[id]`) exist
   and render, reachable only by direct URL. `/educators/kit/slides` additionally checks
   a `published` flag on its `data/educators.json` entry and 404s while that flag is
   `false` — the slide deck is not ready for distribution even by direct link. This is
   documented, not fixed, per the Phase 9 scope: wiring up the landing page and flipping
   `published` are product decisions outside a docs/cleanup pass.

4. **`voice:lint`, `shoot`, and `measure` are referenced in planning but not yet
   `package.json` scripts.** `scripts/voice-audit.mjs` exists but is not wired to an npm
   script under either name. `scripts/voice-lint.mjs` and `lib/voice-lint.ts` may be
   mid-flight from another agent (this pass was told not to touch them). The screenshot
   (`shoot`) and measurement (`measure`) scripts that Tasks 3/5/7 depend on do not exist in
   `scripts/` at all yet — whoever runs that pass needs to write them first.

5. **`.gitignore`'s `.claude` line ignores two tracked files.**
   `.claude/skills/anti-ai-slop-writing/SKILL.md` and its `references/banned-words.md` are
   tracked in git but match the pre-existing `.claude` ignore line (present before this
   pass touched the file). `git ls-files --ignored --exclude-standard -c` surfaces them.
   This predates Task 1's edit — the line was already there — so it was left alone rather
   than "fixed" as part of a docs/cleanup task; flagging it here so it doesn't go unnoticed.

## Could improve

1. **`/library` as the answer to the v1 homepage-weight question.** Now that there is a
   dedicated, filterable index of every route, the homepage may no longer need to carry
   the full catalog itself — worth a look once the measurement pass has numbers to compare.

## Fixed during review

- **Service worker cache strategy** (`public/sw.js`) — see below.
- **Dead-file sweep** (Task 1, `knip.json` + manual grep-verified deletions):
  - Deleted five zero-importer re-export/dead-component shims:
    `components/back-to-top.tsx`, `components/download-button.tsx`,
    `components/logo.tsx`, `components/motion-provider.tsx`,
    `components/sw-register.tsx` (all superseded by their `components/site/*`
    equivalents, confirmed via `git rm` after a grep found zero importers).
  - Removed the `Bracket` decoration (spec §9 names it for retirement): the function in
    `components/site/logo.tsx` and its re-export in `components/site/index.ts`. `Marquee`
    and `Reveal` were already fully gone before this pass (zero grep hits, no defining
    file) — nothing to do for either.
  - Removed three dead exports knip found with zero importers anywhere in the tree:
    `clearSlot` (`lib/practice-store.ts`), `SCENARIOS_LAST_VERIFIED` (`lib/scenario.ts`),
    `LIBRARY_LAST_VERIFIED` (`lib/nav.ts`).
  - Confirmed `lucide-react` was already removed from `package.json` (nothing to
    uninstall); confirmed `motion` has eight live importers (`components/find-work.tsx`,
    `study-protocol.tsx`, `build-labs.tsx`, `self-audit.tsx`, `plan-wizard.tsx`,
    `micro-tasks.tsx`, `niche-explorer.tsx`, `components/site/motion-provider.tsx`) and is
    kept per spec §4.5 (state-change animation only); confirmed `@next/third-parties` has
    two live importers (`lib/analytics.ts`, `app/layout.tsx`) and is kept.
  - `.gitignore` tail reorganized into three headed groups (local agent/tool state, test
    and browser artifacts, generated photoreal sources) per Task 1's spec; the
    `.next-stale-*/` line (concurrent-build scratch directories, not part of the brief's
    literal replacement block) was kept rather than dropped — removing it would have
    un-ignored a directory a separate build worktree still relies on.
- **Documentation caption bug.** `BUILD_GUIDE.md` claimed generated images are captioned
  "Illustrative image" in two places; the actual `Figure` component
  (`components/ui/figure.tsx:8`) and spec §7.1 both say "AI-generated image". Fixed both
  lines to match the shipped behavior.
- **`BUILD_GUIDE.md` transition scaffolding removed** (Task 8): the stale lucide warning
  in the header line, the "Phase 5 deleted `Reveal`/`Pill`/`ButtonLink`/…" historical aside
  (replaced with a plain statement of current import paths), the "warns … and from Phase 5
  it fails the build" phrasing on `verify:primitives` (now states the current behavior
  directly), the stale `primaryNav` shape in the `site.json` data-shape line (now `nav`,
  `navGroups`, `cta`, with stage/step counts corrected to 5/11), and the missing
  Phase 6–7 data files added to the same line (`faq.json`, `library.json`,
  `visuals.json`, `home.json`, `practice.json`, `decks.json`, `scenarios.json`,
  `annotated.json`, `glossary.json`, `reflection.json`, `tldr.json`, `educators.json`).
  Added the two doctrine amendments spec §7.4.4 and §7.5 required but that were missing:
  the export-is-for-what-the-user-wrote rule, and the teaching-material-is-not-a-deliverable
  clarification for the educator kit.
- **Spec status line flipped** — `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md:4`
  now reads `**Status:** Implemented 2026-08-21; see DESIGN_REVIEW.md`.
- **README.md** — Routes table rewritten to match the shipped four-group nav
  (`data/site.json` → `navGroups`: The path, Learn, Work, More) rather than the six-way
  split an earlier draft assumed; every `app/**/page.tsx` route (except the kit's print
  targets) is cross-checked present. Design and Run sections rewritten; `voice:lint`,
  `shoot`, and `measure` lines dropped from Run because those scripts do not exist yet
  (see Should fix #4).

**Service worker.** The shipped worker cached every asset with an image, font, or script
extension cache-first. That is correct for `/_next/static/**`, which Next content-hashes,
and wrong for `public/images/**` and `public/kit/**`, whose URLs are stable while their
bytes are not: a visitor from before the overhaul would have kept the old hero photograph
indefinitely. `public/sw.js` now runs three strategies — cache-first for hashed assets,
stale-while-revalidate for first-party images, kit PDFs, the favicon and the manifest, and
network-first for documents — and the cache name moved to `hfph-v2`, which purges every
`hfph-v1` cache on activation. The build-and-serve verification in the original task brief
(Steps 4–7: `npm run build`, `npx next start`, DevTools cache inspection, an offline
reload) was not run in this pass — the controlling process builds in a separate worktree,
and building here was out of scope for a docs/cleanup pass. The rewritten worker was
verified by code review against the three stated strategies (`isImmutable` checked before
`isRevalidatable`, the `putInCache` guard against non-ok/opaque responses, the
`hit || network` ordering for stale-while-revalidate) and by listing `public/images/`,
`public/kit/`, and `public/*.{svg,ico}` to confirm every current asset falls into
`isRevalidatable`. The runtime behavior (cache contents, offline fallback) is unverified
until someone runs it against a production build.

## What works well

Based on code inspection, not screenshots — none were captured in this pass (see above).
Treat these as verifiable-in-the-source claims to be confirmed visually in the QA pass,
not as a substitute for that pass.

The scroll-motion removal is complete and consistent: `Reveal` has zero remaining
references anywhere in `app/`, `components/`, or `lib/`, and `BUILD_GUIDE.md`'s page-shell
pattern documents plain, unwrapped sections as the only pattern. The component library is
genuinely centralized — every primitive knip could find in `components/ui/` and
`components/layout/` is reachable through its barrel `index.ts`, `verify:primitives` fails
the build on a bypass, and after this pass's sweep there are no more competing re-export
paths for `Logo`, `BackToTop`, `SWRegister`, `MotionProvider`, or `DownloadButton` — each
has exactly one home. The honesty rule holds structurally: the `Figure` primitive
(`components/ui/figure.tsx`) hard-codes the "AI-generated image" caption for any manifest
entry marked `generated`, rather than leaving it to each page to remember — one component
enforces the rule instead of every page having to.
