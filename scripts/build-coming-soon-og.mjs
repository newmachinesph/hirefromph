// Regenerate the committed share image: node scripts/build-coming-soon-og.mjs
// Uses the same local font and renderer as app/opengraph-image.tsx.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const root = new URL("../", import.meta.url);
const font = await readFile(new URL("app/fonts/Inter-Bold.woff", root));
const icon = await readFile(new URL("app/icon.svg", root));
const navy = "#043882";
const gold = "#FCC449";
const ink = "#161A24";
const box = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);
const text = (value, style = {}) => box(style, value);
const arrow = (color) => h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" },
  h("path", { d: "M5 19 19 5M5 5h14v14", stroke: color, strokeWidth: 2.5 }),
);

const image = new ImageResponse(
  box({ width: "100%", height: "100%", background: "#FFFFFF", color: ink, fontFamily: "Inter", padding: 56, flexDirection: "column" },
    box({ alignItems: "center", gap: 14 },
      h("img", { src: `data:image/svg+xml;base64,${icon.toString("base64")}`, width: 40, height: 40, alt: "" }),
      box({ fontSize: 32, letterSpacing: -1 }, text("HireFrom"), text("PH", { color: navy })),
    ),
    box({ marginTop: 42, flex: 1, gap: 32 },
      box({ flexDirection: "column", width: 600 },
        box({ alignItems: "center", gap: 10, fontSize: 16, letterSpacing: 2 },
          box({ width: 9, height: 9, borderRadius: "50%", background: gold }),
          "A NEW CHAPTER · COMING SOON",
        ),
        box({ flexDirection: "column", marginTop: 22, fontSize: 82, lineHeight: 1.02, letterSpacing: -3 },
          text("Great talent."), text("Right here."), text("Going places.", { color: navy }),
        ),
        text("Filipino talent. Global opportunity.", { fontSize: 24, color: "#464C5C", marginTop: 26 }),
      ),
      box({ position: "relative", width: 456, height: 398, background: navy, color: "#FFFFFF", borderRadius: 12, flexDirection: "column", overflow: "hidden" },
        text("ROOTED IN THE PHILIPPINES", { position: "absolute", top: 26, left: 28, fontSize: 13, letterSpacing: 2 }),
        h("img", { src: `data:image/svg+xml;base64,${icon.toString("base64")}`, width: 216, height: 216, alt: "", style: { position: "absolute", top: 88, left: 120 } }),
        box({ position: "absolute", top: 62, left: 24, background: "#FFFFFF", color: ink, padding: "12px 18px", borderRadius: 8, fontSize: 18, transform: "rotate(-7deg)", alignItems: "center", gap: 12 }, text("Filipino talent"), arrow(navy)),
        box({ position: "absolute", top: 280, right: 24, background: gold, color: navy, padding: "12px 18px", borderRadius: 8, fontSize: 18, transform: "rotate(5deg)", alignItems: "center", gap: 12 }, arrow(navy), text("Global opportunity")),
        text("A new connection is coming.", { position: "absolute", bottom: 22, left: 28, fontSize: 17 }),
      ),
    ),
    box({ borderTop: "1px solid #E3E5EA", paddingTop: 18, justifyContent: "space-between", fontSize: 17 },
      text("Built for Filipino potential.", { color: "#464C5C" }),
      text("hirefrom.ph", { color: navy }),
    ),
  ),
  { width: 1200, height: 630, fonts: [{ name: "Inter", data: font, weight: 700, style: "normal" }] },
);

const output = fileURLToPath(new URL("public/coming-soon/og-image.png", root));
await writeFile(output, Buffer.from(await image.arrayBuffer()));
console.log(`Created ${output}`);
