/**
 * Rebuild design/diagrams/preview.html from the four plugin HTML sources.
 *
 *   node design/diagrams/build-preview.mjs
 *
 * The preview inlines each source's <svg> on one standalone page, with the
 * site's committed token values declared as CSS custom properties on :root and
 * every hard-coded hex swapped for the matching var(). That is the same
 * substitution the React components in components/diagrams/ perform by hand, so
 * the preview is the closest standalone approximation of what ships.
 *
 * No dependencies. Node 18+.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Hex -> CSS custom property. Values are the committed tokens in app/globals.css. */
const TOKENS = [
  ["#FFFFFF", "--paper"],
  ["#F7F6FF", "--band"],
  ["#EEEDFF", "--primary-tint"],
  ["#0E1230", "--ink"],
  ["#4A4F66", "--ink-soft"],
  ["#6B7087", "--ink-faint"],
  ["#E4E4EA", "--line"],
  ["#CFCFD8", "--line-strong"],
  ["#4B4EF6", "--primary"],
  ["#026AA2", "--info"],
];

const DIAGRAMS = [
  {
    id: "journey-map",
    type: "Journey / process",
    title: "The path — five stages, eleven steps",
    caption:
      "Follow the line: five stages across the top, the eleven steps ticked off beneath the stage that owns them. Stage 1 and the stage you are on are the only things in indigo.",
    component: "JourneyMap",
  },
  {
    id: "method-loop",
    type: "Process with a loop-back",
    title: "The method — seven ways to get unstuck",
    caption:
      "Read left to right, then the second row right to left. The dashed arrow is the only one that goes backwards: when UNSTICK runs out of road, you time-box and return to ASK.",
    component: "MethodLoop",
  },
  {
    id: "hiring-funnel",
    type: "Funnel",
    title: "What each stage of the hunt needs",
    caption:
      "Each band names what that stage needs, not how many people reach it. The narrow end is where evidence, not enthusiasm, closes the offer.",
    component: "HiringFunnel",
  },
  {
    id: "first-week-timeline",
    type: "Timeline",
    title: "Your first week, day by day",
    caption:
      "Five days, five checkpoints. Day 1 is highlighted because everything after it is easier once the recap is sent.",
    component: "FirstWeekTimeline",
  },
];

/** Pull the first <svg>…</svg> out of a plugin HTML file. */
function extractSvg(html) {
  const start = html.indexOf("<svg");
  const end = html.indexOf("</svg>");
  if (start === -1 || end === -1) throw new Error("no <svg> block found");
  return html.slice(start, end + "</svg>".length);
}

/** Drop the paper background rect: on the site the diagram sits on page paper. */
function stripBackground(svg) {
  return svg.replace(/\s*<rect width="100%" height="100%"[^>]*\/>\n?/, "\n");
}

function tokenize(svg) {
  let out = svg;
  for (const [hex, name] of TOKENS) {
    out = out.replaceAll(hex, `var(${name})`);
  }
  return out;
}

function indent(block, spaces) {
  const pad = " ".repeat(spaces);
  return block
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

const sections = [];
for (const diagram of DIAGRAMS) {
  const html = await readFile(join(HERE, `${diagram.id}.html`), "utf8");
  const svg = indent(tokenize(stripBackground(extractSvg(html))), 6);
  sections.push(`    <section class="figure">
      <p class="eyebrow">${diagram.type} · <code>${diagram.id}</code> · &lt;${diagram.component} /&gt;</p>
      <h2>${diagram.title}</h2>
${svg}
      <p class="caption">${diagram.caption}</p>
    </section>`);
}

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hire From PH — diagram preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* Committed tokens from app/globals.css — the diagrams read these. */
    :root {
      --paper: #FFFFFF;
      --band: #F7F6FF;
      --tint: #EEEDFF;
      --ink: #0E1230;
      --ink-soft: #4A4F66;
      --ink-faint: #6B7087;
      --line: #E4E4EA;
      --line-strong: #CFCFD8;
      --primary: #4B4EF6;
      --primary-deep: #3634D8;
      --primary-tint: #EEEDFF;
      --primary-soft: #C9C8FF;
      --info: #026AA2;

      /* On the site these resolve to Cabinet Grotesk / Inter via next/font.
         Standalone, Cabinet Grotesk is self-hosted and unreachable, so the
         display face falls back to Inter — a disclosed fallback, not a match. */
      --font-cabinet: 'Cabinet Grotesk';
      --font-inter: 'Inter';
      --font-display: var(--font-cabinet), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
      --font-text: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
    }

    body {
      font-family: var(--font-text);
      background: var(--paper);
      color: var(--ink);
      padding: 3rem 1.5rem 5rem;
    }
    main { max-width: 1040px; margin: 0 auto; }

    .page-head { border-bottom: 1px solid var(--line); padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
    h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 700; letter-spacing: -0.01em; }
    .lede { color: var(--ink-soft); font-size: 0.9375rem; margin-top: 0.5rem; max-width: 62ch; }

    .figure { margin-bottom: 3.5rem; }
    .figure + .figure { border-top: 1px solid var(--line); padding-top: 2.5rem; }

    .eyebrow {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-faint);
      margin-bottom: 0.5rem;
    }
    .eyebrow code { font-family: inherit; letter-spacing: inherit; }

    h2 {
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 1.25rem;
    }

    /* Stand-in for the site's DiagramFrame: hairline border, scrolls on phones. */
    svg {
      display: block;
      width: 100%;
      min-width: 560px;
      height: auto;
    }
    .figure > svg {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1.25rem;
      background: var(--paper);
    }
    .figure { overflow-x: auto; }

    .caption { color: var(--ink-soft); font-size: 0.8125rem; margin-top: 0.875rem; max-width: 70ch; }
  </style>
</head>
<body>
  <main>
    <div class="page-head">
      <p class="eyebrow">diagram-design · profile hirefromph</p>
      <h1>Diagram preview</h1>
      <p class="lede">The four first-wave diagrams, inlined from their plugin HTML sources with the site's tokens on <code>:root</code>. Open this file directly in a browser — nothing here is built. Regenerate with <code>node design/diagrams/build-preview.mjs</code>.</p>
    </div>

${sections.join("\n\n")}
  </main>
</body>
</html>
`;

await writeFile(join(HERE, "preview.html"), page, "utf8");
console.log("wrote design/diagrams/preview.html");
