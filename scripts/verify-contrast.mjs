import { readFile } from "node:fs/promises";

const PAIRS = [
  ["signal", "paper", 4.5],
  ["signal", "signal-tint", 4.5],
  ["signal-light", "ink", 4.5],
  ["verified", "paper", 4.5],
  ["verified", "verified-tint", 4.5],
  ["info", "paper", 4.5],
  ["caution", "paper", 4.5],
  ["caution-text", "caution-tint", 4.5],
  ["ink", "paper", 4.5],
  ["ink-soft", "paper", 4.5],
  ["ink-faint", "paper", 4.5],
];
// White-on-fill pairs, checked against #ffffff rather than a token.
const ON_FILL = [["signal", 4.5], ["signal-deep", 4.5], ["verified", 4.5], ["info", 4.5]];

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  return m[1];
}

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const failures = [];
for (const [fg, bg, min] of PAIRS) {
  const r = ratio(token(fg), token(bg));
  if (r < min) failures.push(`--${fg} on --${bg}: ${r.toFixed(2)}:1 (need ${min}:1)`);
}
for (const [fill, min] of ON_FILL) {
  const r = ratio("#ffffff", token(fill));
  if (r < min) failures.push(`white on --${fill}: ${r.toFixed(2)}:1 (need ${min}:1)`);
}

if (failures.length) {
  console.error("Contrast failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log(`Contrast OK — ${PAIRS.length + ON_FILL.length} pairs pass.`);
