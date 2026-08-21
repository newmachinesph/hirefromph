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
npm run verify:contrast              # verify color contrast (WCAG AA)
set PORT=3000 && npx next start      # serve the build (Windows: PORT env, not -p)
```

## Routes

| Route | What it is |
|---|---|
| `/` | Home — hero, path chooser, journey, toolkit, language premium |
| `/start` `/get-hired` `/deliver` `/level-up` | The 4 career stages (9-step roadmap) |
| `/method` | The six core methods — find, deconstruct, learn, vet, ask, unstick |
| `/learn` | How to learn — what the evidence on studying actually supports |
| `/reality` | **Reality check** — sourced market data, what AI is doing to this work, and the claims nobody can back up |
| `/simulator` | **Career simulator** — model 3 years; see the generalist flatline against a specialist's curve |
| `/english` | **English at work** — the habits that make fluent English read as junior, plus a live message audit |
| `/conduct` | **Conduct & integrity** — do's and don'ts, real firing/lawsuit cases, and an oath you write yourself |
| `/tasks` | Micro-tasks — real jobs you can do today, each finishing as a portfolio piece |
| `/build` | Build labs — write your own resume, portfolio, and SOPs from a blank page |
| `/path` | Personalized dashboard (progress, next moves, toolkit) |
| `/plan` | Interactive 30-day plan wizard (5 questions → tracked day-by-day plan) |
| `/niches` | Niche explorer + a weighted rubric to evaluate any niche yourself |
| `/prompts` | AI leverage — learn to write your own prompts |
| `/tools` | The transferable method for learning any tool fast |
| `/tracker` | Application pipeline with a follow-up radar |
| `/apply` | Source and vet opportunities yourself — search operators, red flags |
| `/languages` | Language premium + where to learn free in PH (TESDA, Japan Foundation, etc.) |
| `/equipment` | Interactive equipment checker with ₱ estimates |

## Content

All copy and data are in `data/`. Swap the JSON to change the site — no code edits needed. Nav and footer both read from `site.json` → `navGroups`, so adding a route to that array is all it takes to surface it in both. Images are first-party generated assets in `public/images/` (see `design/images/README.md`); diagrams are SVG components in `components/diagrams/`.

## Design

Inter (text) × Cabinet Grotesk (display), navy ink on white with lavender bands, one blue-violet primary and four semantic accents, 8/12/20px radii, bordered cards. Tokens in `app/globals.css`; the overhaul spec lives in `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`. Shared conventions in `BUILD_GUIDE.md` — **read it before building any page.**
