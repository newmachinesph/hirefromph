# Educators deck system — design

Date: 2026-08-22 · Owner decisions: **C / C / C** (master deck + per-session decks; editable PPTX *and* presenter PPTX, plus PDF; mixed visual language — photos for chapter openers, a seven-icon method set, code diagrams). Owner's closing instruction: build and commit while they sleep.

## 1. Purpose

Give educators a top-tier presentation they can **run, adapt and pass on**: one master deck that teaches the Hire From PH doctrine, and one short deck per existing session (Deconstruct a resume 90 min · Vet an opportunity 60 · Ask well 45). Every deck is viewable in the browser, and downloadable as PDF, editable PPTX and presenter PPTX, from a new `/educators` landing page that switches the hidden educators area on.

Doctrine constraints carried into the decks: method over material; **no number without its source** (enforced by test); honest, plain copy in the site voice; images must read as real documentary photography; CC BY 4.0 with attribution.

## 2. One source of truth

`data/decks/master.json`, `data/decks/session-deconstruct-resume.json`, `data/decks/session-vet-opportunity.json`, `data/decks/session-ask-well.json`.

```ts
type Deck = { id: string; title: string; subtitle: string; minutes?: number; lastVerified: string; slides: Slide[] };
type Slide = {
  id: string;                       // unique within the deck
  type: "title" | "chapter" | "statement" | "method" | "diagram" | "list" | "drill" | "close";
  kicker?: string;                  // small uppercase label
  title: string;                    // one idea, ≤ 90 chars
  body?: string;                    // ≤ 2 sentences or omitted
  items?: string[];                 // list / method moves / drill steps (≤ 5)
  source?: { label: string; url: string }; // REQUIRED when title/body/items contain a digit
  media?: { photo?: string; icon?: string; diagram?: "journey-map" | "method-loop" };
  notes: string;                    // speaker notes, always present
  minutes?: number;                 // drill slides: how long the block runs
};
```

`lib/deck.ts` (server-safe, no Node APIs): types, `DECKS` registry, `getDeck(id)`, `slideRequiresSource(slide)`, `validateDeck(deck)` returning a list of problems (used by the test and the build script).

## 3. Rendering — HTML canvas first

- `components/deck/slide-frame.tsx`: a 1920×1080 stage scaled to fit its container with `transform: scale()`. All slide layout is authored at 1920×1080 and never reflows.
- `components/deck/slides.tsx`: one component per slide `type`, using the site tokens (navy ink, white, lavender band, primary `#4B4EF6`), Cabinet Grotesk display at slide scale (72–128 px titles), Inter body at 32–40 px, generous margins (120 px). Title and chapter slides are navy with a photo; statement slides are white; method slides show the icon, the method name and three moves; diagram slides mount `JourneyMap` / `MethodLoop`; drill slides carry a minutes badge.
- `components/deck/presenter.tsx` (client): arrow/space/PageUp-Down navigation, `#n` in the hash, progress "n / N", `N` toggles speaker notes, `F` fullscreen, touch swipe. No autoplay, no transitions beyond an opacity fade that respects `prefers-reduced-motion`.
- Routes (inside the existing kit layout, which hides site chrome): `app/educators/deck/[id]/page.tsx` (presenter) and `app/educators/deck/[id]/print/page.tsx` (every slide stacked at exactly 1920×1080 with `break-after: page`, `data-slide` on each, `data-diagram` on diagram roots for rasterising).
- The old `/educators/kit/slides` route, its `KIT_FILES` entry and `educators.json.slides` are deleted: the master deck replaces them.

## 4. Decks

**Master (≈ 22 slides):** title · why (the standard, not the discount) · the honesty rule · method over material · *chapter: the path* · five stages (JourneyMap) · eleven steps · *chapter: seven methods* · FIND · DECONSTRUCT · LEARN · VET · ASK · UNSTICK · GIVE (each: icon, three moves, one drill prompt) · the loop (MethodLoop) · anti-patterns · how to run a session · run it, adapt it, pass it on · licence.

**Session (8–12 each):** title · why this session · the one method it drills · the clock (steps with minutes from `educators.json`) · the brief · the drill · debrief prompts · common mistakes · take-home · next session · licence.

Copy is derived from `data/doctrine.json`, `data/stages.json`, `data/roadmap.json`, `data/educators.json` — not invented. Any figure keeps the citation it has on the site.

## 5. Imagery (gpt-image-bridge / codex)

- Five chapter photographs (`deck-title`, `deck-why`, `deck-path`, `deck-methods`, `deck-close`) added to `design/images/shotlist.json` and generated with `scripts/gen-images.mjs --only …`, 16:9, to the owner's documentary standard (no fake text, no blank props, hands/faces checked at 2×, people from behind or three-quarter). Optimised into `public/images/` by the existing pipeline.
- Seven method icons generated as one style-locked series (thick single-weight line, navy on white, square), made transparent with sharp and saved to `public/images/deck/icons/<method>.png`, used by the method slides and the PPTX builders.
- Diagrams are not generated; they stay code and are rasterised by the build script for PPTX.

## 6. Exports — `scripts/build-decks.mjs`

Same contract as `scripts/build-kit-pdf.mjs`: refuses to run without a production build (or `KIT_BUILD_BASE_URL`), starts `next start`, writes `public/kit/decks/manifest.json` with content hashes, exits 1 on any error. For each deck:

1. **PDF** — Playwright prints `/educators/deck/<id>/print` at 1920×1080 page size, `printBackground: true`.
2. **Presenter PPTX** — Playwright screenshots each `[data-slide]` at 1920×1080; `pptxgenjs` places each image full-bleed on a 16:9 slide, speaker notes attached.
3. **Editable PPTX** — `scripts/deck-pptx.mjs` (pure Node, unit-tested) maps each slide type to `pptxgenjs` text boxes, shapes and images: fonts Inter / Calibri fallback, the same palette, photos and icons from `public/images/`, diagrams from rasters produced in step 2, speaker notes attached.

Outputs: `public/kit/decks/<id>.pdf`, `<id>.pptx`, `<id>-presenter.pptx`. `scripts/verify-kit.mjs` learns the decks manifest.

## 7. `/educators` landing + switch-on

`app/educators/page.tsx` (server, root layout, indexable): hero with the honesty note · the four decks, each with Present · PDF · PPTX · Presenter PPTX · the three session run-sheet PDFs (existing) · quick start (existing six steps) · licence. Switch-on: delete `pending: true` for `/educators` in `data/site.json` and `data/library.json`; add `/educators` to the sitemap (kit and deck routes stay out and `noindex`); the GIVE method's "pass it on" line links here.

## 8. Tests and gates

- `lib/deck.test.ts`: every deck validates — unique ids, required fields, ≤ 5 items, a `source` wherever a digit appears, notes present, every referenced photo/icon file exists.
- `components/deck/slides.test.tsx`: each slide type renders its title and media; presenter navigation changes the hash.
- `scripts/deck-pptx.test.mjs`: the layout mapper produces one slide per input with the expected text runs and notes (no browser).
- Gates before commit: `tsc`, `eslint`, `vitest`, `npm run build`, then `npm run kit:decks` (the export script) with its manifest checked by `verify-kit`.

## 9. Out of scope

Video, audio, translations beyond the existing Tagalog TL;DR pattern, a slide editor on the site, analytics on downloads.
