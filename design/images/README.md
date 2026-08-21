# Photoreal imagery

Source of truth for the site's generated photographs: shot list, prompts, and
alt text live in `shotlist.json`; raw PNGs are produced into `raw/` and later
optimised into `public/images/`.

## How to run

```
node scripts/gen-images.mjs                      # everything still missing
node scripts/gen-images.mjs --only home-hero     # one or more ids
node scripts/gen-images.mjs --dry-run            # list what would run
```

The script skips any id that already has `raw/<id>.png` and calls
`~/.claude/skills/gpt-image-bridge/bin/gpt-image-2` two at a time. Each call
takes 4–6 minutes and uses ChatGPT quota, so rerunning only fills the gaps.
Logs land in `raw/<id>.log`; delete a PNG to regenerate it. Sizes are the
model's presets (1024x1536, 1536x1024); the optimise step crops to each `ratio`.

## Art direction

Documentary editorial photography — frames a human photographer took on
assignment, never a render. 35mm or 50mm prime, available natural light only,
neutral untouched colour, subtle film grain and a slight natural vignette,
off-centre composition, and the real imperfections of a room someone uses:
dust, smudges, tangled cable, worn edges, something set down crooked. No HDR,
no colour grading, no lens flare, no bokeh balls, no studio look, no pastel
props, no perfectly tidy surfaces.

Filipino subjects of varied ages and builds in real Philippine settings:
apartment corner desks, provincial homes with capiz or jalousie windows,
Cebu/Davao co-working spaces, a low-rise provincial street under flat overcast
daylight (`cta-band`). Tidy but lived-in. Subjects work; they never pose. Faces
are turned away or in profile — no direct eye contact, no symmetrical front-on
portraits. Hands rest or are cropped by the frame, exactly five fingers when
visible, nothing held up mid-air.

Four subjects carry the "human-made" direction hardest: `home-hero`, a woman
seen from three-quarters behind at a cluttered home desk in raking morning
light; `home-standard`, a close over-the-shoulder view of a well-used notebook
with handwritten notes; `stage-level-up`, a man reading a well-thumbed printed
manual in profile under overcast light; and `library-hero`, a desk corner of
notebooks, spiral-bound manuals and torn paper page tabs shot at an oblique
angle.

Text is present in these scenes as real ink and real screen content — blank
sheets and blank books read as staged renders. It is made unreadable only by
honest optics: too small, too far, or outside the plane of focus. Never a
model-blurred smear, never squiggles standing in for letterforms, and never
legible. No signage, no sticky notes bearing writing, no watermarks, no logos,
no flags.

## Honesty rules

- Every generated image is captioned "Illustrative image" through `Figure`.
- No generated person sits next to a quote, a name, a role, or a number.
- No generated document that could pass as a real credential, payslip, invoice,
  or contract. Document surfaces are abstract shapes only.
- `alt` describes the scene, never a claim like "a successful professional".

## Where files go

`raw/` is git-ignored (large, regenerable). Phase 3 adds
`scripts/optimize-images.mjs` (sharp) writing AVIF/WebP/JPEG at 1x and 2x into
`public/images/` plus a `data/visuals.json` manifest; those outputs are committed.

## Optimised outputs

### How to run

```
npm run images:optimize                              # process every id with a raw PNG
node scripts/optimize-images.mjs --only home-hero    # one or more ids
node scripts/optimize-images.mjs --dry-run           # print the plan, write nothing
```

For each shotlist entry with a `raw/<id>.png`, the script centre-crops to the
entry's `ratio`, resizes down to a max long edge (portrait 1600px, landscape
2048px; `1200x630` — the `og-default` id — always resizes to that exact
size), and writes `public/images/<id>.jpg` (mozjpeg, quality 82, progressive)
and `public/images/<id>.webp` (quality 80). AVIF is skipped; `next/image`
encodes AVIF on demand from the JPEG source. The crop/resize never upscales
past the raw render's own resolution. Re-running overwrites; `--only`
re-encodes just those ids but still rebuilds the full manifest from every id
that has an output on disk, so a partial run doesn't drop other entries.

### Budget rule

Every JPEG must stay at or under 260 KB, and `home-hero` specifically must
stay at or under 180 KB (it is the largest hero image and loads above the
fold). If an encode exceeds its budget at quality 82, the script steps
quality down in 4-point increments (82 → 78 → 74 → 70) and stops at whichever
step first clears the budget, or at quality 70 if it still doesn't. The
printed table notes the quality used whenever it was lowered from the
default, and flags anything still over budget after quality 70.

### Manifest contract

`data/visuals.json` is `{ "images": VisualEntry[] }`, sorted by `id`, where:

```ts
type VisualEntry = {
  id: string;
  src: { jpg: string; webp?: string; avif?: string }; // site-relative, under /images/
  width: number;   // intrinsic pixel width of the jpg
  height: number;  // intrinsic pixel height of the jpg
  alt: string;      // from shotlist.json
  caption?: string; // not set by this script — Figure adds "Illustrative
                     // image" automatically for generated: true
  generated: true;
};
```

This is a fixed contract consumed by `lib/visuals.ts` and the `Figure`
component — the shape does not change without updating those consumers too.

### What's committed

`public/images/` (the optimised JPEG/WebP outputs) and `data/visuals.json`
(the manifest) **are committed** — they are what the site actually serves.
`design/images/raw/` (the source PNGs from `gen-images.mjs`) is **not
committed**; it's git-ignored, large, and fully regenerable from
`shotlist.json`.
