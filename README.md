# Hire From PH — Online Career Portal

**Hire From PH** — *Be the reason they hire from the Philippines.*: every step compounds on the last, and every skill you gain is one you keep. A light-mode learning portal that takes Filipinos from zero to a thriving remote career as an **online professional** (never an "assistant"). Next.js 16 · React 19 · Tailwind v4 · `motion`. Frontend only — all content lives in `data/*.json`, no backend.

## The idea: path-gated depth

Everything is here (methods, labs, tools, a hiring directory), but the front stays calm on purpose. A visitor **chooses a career path**, and the depth unlocks — tailored to them. Path choice persists in `localStorage` via `lib/path-context.tsx` and personalizes the header, the `/path` dashboard, and gated sections (`components/path-gate.tsx`).

## The honesty rule

This site teaches integrity, so it holds itself to it. **No fabricated social proof, ever** — no invented testimonials, no made-up learner counts, no unsourced income claims. Any statistic on the site renders with a visible, clickable link to its primary source, and where good data simply does not exist (time-to-first-client, freelancer churn rates) `/reality` says so out loud rather than inventing a number. If you add content, this is the bar.

## Run

```bash
npm install
npm run dev                          # http://localhost:3000
npm run build                        # production build
set PORT=3000 && npx next start      # serve the build (Windows: PORT env, not -p)

npm test                             # node --test math suites + vitest component suites
npm run verify:all                   # contrast, links, claims, eslint, tsc, primitives
npm run verify:contrast              # WCAG AA over the tokens in app/globals.css
npm run verify:primitives            # fails when a page bypasses components/ui or layout

npm run images:optimize              # raw PNGs in design/images/raw → public/images/ + visuals.json
npm run kit:build                    # re-render public/kit/*.pdf from data/educators.json
```

`verify:kit` (checks the kit PDFs are current) exists but is not wired into `verify:all` yet —
run it by hand after touching `data/educators.json`. A voice-cadence linter and a screenshot/
measurement pipeline are planned but not yet scripted in `package.json`.

## Routes

Grouped the way the header groups them (`data/site.json` → `navGroups`).

**The path** — five stages, eleven steps (`data/stages.json`, `data/roadmap.json`).

| Route | What it is |
|---|---|
| `/` | Home — hero, how it works, the path, lanes, what you'll build, the standard, FAQ |
| `/start` | Stage 1 — set up a workspace and build proof before applying |
| `/get-hired` | Stage 2 — source leads, track applications, close the offer |
| `/deliver` | Stage 3 — onboard, write SOPs, communicate so clients keep you |
| `/level-up` | Stage 4 — specialise, automate, raise your rate on evidence |
| `/own` | Stage 5 — go direct, register with the BIR, grow into an end-goal role |
| `/path` | Personalized dashboard (progress, next moves, toolkit, weekly reflection) |
| `/plan` | Interactive 30-day plan wizard, exportable to calendar and Markdown |

**Learn.**

| Route | What it is |
|---|---|
| `/method` | The seven core methods — find, deconstruct, learn, vet, ask, unstick, give |
| `/ai-first` | Working AI-first without outsourcing your judgment |
| `/learn` | How to learn — what the evidence on studying actually supports |
| `/tasks` | Micro-tasks — real jobs you can do today, each finishing as a portfolio piece |
| `/build` | Build labs — write your own resume, portfolio, and SOPs from a blank page |
| `/tools` | The transferable method for learning any tool fast |
| `/portfolio` | The portfolio ladder |
| `/prompts` | AI leverage — learn to write your own prompts |
| `/equipment` | Interactive equipment checker with ₱ estimates |
| `/indispensable` | Become indispensable |
| `/english` | English at work — the habits that make fluent English read as junior |
| `/conduct` | Conduct & integrity — cases, do's and don'ts, and an oath you write yourself |
| `/simulator` | Career simulator — model 3 years; generalist flatline against a specialist curve |
| `/resources` | Resource shelf |
| `/practice` | Retrieval practice — what's due, decks, quiz history, streak |
| `/glossary` | A–Z of the terms the guides use, with Taglish glosses |

**Work.**

| Route | What it is |
|---|---|
| `/apply` | Source and vet opportunities yourself — search operators, red flags |
| `/interview` | Interview prep |
| `/tracker` | Application pipeline with a follow-up radar |
| `/niches` | Niche explorer + a weighted rubric to evaluate any niche yourself |
| `/salary` | Salary guide, with every figure sourced and vendor-grade data labelled |
| `/markets` | Client markets and timezone overlap |
| `/clients` | Own your clients — agency versus direct |
| `/legit` | Get legit — BIR, 8%, receipts, PhilHealth |
| `/languages` | Language premium + where to learn free in PH (TESDA, Japan Foundation) |

**More.**

| Route | What it is |
|---|---|
| `/reality` | **Reality check** — sourced market data, what AI is doing to this work, and the claims nobody can back up |
| `/library` | The index — every route, filterable by group and type |
| `/privacy` | Privacy |
| `/educators` | For educators. **Pending** — `data/site.json` and `data/library.json` both carry this link with `pending: true`, so it renders nowhere yet; there is no `app/educators/page.tsx`. The kit itself already ships and is reachable by direct URL: `/educators/kit/one-pager`, `/educators/kit/path-map`, `/educators/kit/methods`, `/educators/kit/session/[id]`, `/educators/kit/slides` (the slide deck itself 404s — its `published` flag in `data/educators.json` is `false`). `npm run kit:build` renders these to `public/kit/*.pdf`; `verify:kit` checks the PDFs are current but is not part of `verify:all`. |
| `/dev/ui` | Component gallery. Development only — returns 404 in production, excluded from the sitemap |

## Content

All copy and data are in `data/`. Swap the JSON to change the site — no code edits needed. Nav and footer both read from `site.json` → `navGroups`, so adding a route to that array is all it takes to surface it in both. Images are first-party generated assets in `public/images/` (see `design/images/README.md`); diagrams are SVG components in `components/diagrams/`.

## Design

Inter (text) × Cabinet Grotesk (display), navy ink on white with lavender bands, one
blue-violet primary (`#4B4EF6`) and four semantic accents, 8/12/20px radii, bordered
cards, no scroll motion. Tokens live in `app/globals.css` and reach Tailwind v4 through
`@theme inline`.

Every page is composed from two barrels — `@/components/ui` (primitives) and
`@/components/layout` (page structure). `npm run verify:primitives` fails the build when a
page re-implements a card, an input, an accent map, or the type scale by hand. Browse them
all at `/dev/ui` in development.

Visuals are first-party: photoreal images in `public/images/` through the `Figure`
primitive (generated images are always captioned "AI-generated image"), and SVG diagrams in
`components/diagrams/` that read the CSS tokens. The overhaul spec is
`docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`; the review of what shipped is
`DESIGN_REVIEW.md`. Shared conventions are in `BUILD_GUIDE.md` — **read it before building
any page.**
