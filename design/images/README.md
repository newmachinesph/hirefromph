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

Photoreal editorial photography, 35mm or 50mm, natural window light, shallow
but not creamy depth of field, honest skin and fabric texture, neutral-warm
grade. Filipino subjects of varied ages and builds in real Philippine settings:
apartment corner desks, provincial homes with capiz or jalousie windows,
Cebu/Davao co-working spaces, a provincial street at dusk. Tidy but lived-in.
Subjects work; they never pose or look at the camera. No lens flare, neon,
screen-glow faces, watermarks, logos, flags, or readable text on any screen or
page (UI and documents are rendered blurred or abstract).

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
