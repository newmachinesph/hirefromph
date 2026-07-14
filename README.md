# DevUp — Online Career Portal

**DevUp** — *developing upwards*: every step compounds on the last, and every skill you gain is one you keep. An awwwards-level, light-mode learning portal that takes Filipinos from zero to a thriving remote career as an **online professional** (never an "assistant"). Next.js 16 · React 19 · Tailwind v4 · `motion`. Frontend only — all content lives in `data/*.json`, no backend.

## The idea: path-gated depth

Everything is here (guides, tools, prompts, templates, a hiring directory), but the front stays calm on purpose. A visitor **chooses a career path**, and the depth unlocks — tailored to them. Path choice persists in `localStorage` via `lib/path-context.tsx` and personalizes the header, the `/path` dashboard, and gated sections (`components/path-gate.tsx`).

## Run

```bash
npm install
npm run dev                          # http://localhost:3000
npm run build                        # production build
set PORT=3000 && npx next start      # serve the build (Windows: PORT env, not -p)
```

## Routes

| Route | What it is |
|---|---|
| `/` | Home — hero, path chooser, journey, toolkit, language premium |
| `/start` `/get-hired` `/deliver` `/level-up` | The 4 career stages (9-step roadmap) |
| `/path` | Personalized dashboard (progress, next moves, toolkit) |
| `/plan` | Interactive 30-day plan wizard (5 questions → tracked day-by-day plan) |
| `/niches` | Niche explorer — pick a lane, see pay/tools/learning |
| `/prompts` | AI bots + copy-paste prompt library |
| `/templates` | In-app template viewer + copy (replaces Google Drive) |
| `/tools` | Tool tutorials + "codes for efficiency" |
| `/equipment` | Interactive equipment checker with ₱ estimates |
| `/apply` | Filterable directory of where to get hired |
| `/languages` | **New:** language premium + where to learn free in PH (TESDA, Japan Foundation, etc.) |
| `/wins` | Testimonial gallery (placeholder stories) |

## Content

All copy and data are in `data/`. Swap the JSON to change the site — no code edits needed. Images are CSS/SVG placeholders (no external assets), ready to replace with real media.

## Design

Warm-paper editorial system: Fraunces display serif × Geist sans, coral signature + emerald "growth" accents, scroll-reveal motion, grain texture. Tokens in `app/globals.css`. Shared conventions in `BUILD_GUIDE.md`.
