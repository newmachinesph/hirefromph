// WCAG contrast gate over the tokens in app/globals.css.
// Text pairs need 4.5:1; UI-component pairs (form borders) need 3:1.
// Run: npm run verify:contrast
import { readFile } from "node:fs/promises";

const TEXT = [
  ["ink", "paper"],
  ["ink-soft", "paper"],
  ["ink-faint", "paper"],
  ["ink-faint", "band"],
  ["ink", "band"],
  ["ink", "tint"],
  ["primary", "paper"],
  ["primary", "band"],
  ["primary-deep", "primary-tint"],
  ["verified", "paper"],
  ["verified", "verified-tint"],
  ["caution", "paper"],
  ["caution", "caution-tint"],
  ["info", "paper"],
  ["info", "info-tint"],
  ["coral", "paper"],
  ["coral", "coral-tint"],
  ["on-navy", "ink"],
  ["primary-soft", "ink"],
];
// White text on these fills must pass 4.5:1.
const WHITE_ON = ["primary", "primary-deep", "ink", "verified", "caution", "info", "coral"];
// Ink text on the vibrant fills must pass 4.5:1.
const INK_ON = ["verified-fill", "caution-fill", "info-fill", "coral-fill"];
// Non-text UI boundaries need 3:1.
const UI = [
  ["control", "paper", 3],
  ["control", "band", 3],
];

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

// Anchor lookups to the :root block first (where every colour token lives);
// fall back to the whole file for names not found there.
const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
const rootCss = rootMatch ? rootMatch[1] : css;

function token(name, depth = 0) {
  const re = new RegExp(`--${name}:\\s*([^;]+);`);
  const m = rootCss.match(re) ?? css.match(re);
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  const v = m[1].trim();
  const hex = v.match(/^#[0-9a-fA-F]{6}$/);
  if (hex) return v.toUpperCase();
  const ref = v.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (ref && depth < 3) return token(ref[1], depth + 1);
  throw new Error(`token --${name} is not a 6-digit hex or var() alias: ${v}`);
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
let checked = 0;
const check = (label, fg, bg, min) => {
  checked++;
  const r = ratio(fg, bg);
  if (r < min) failures.push(`${label}: ${r.toFixed(2)}:1 (need ${min}:1)`);
};

for (const [fg, bg] of TEXT) check(`--${fg} on --${bg}`, token(fg), token(bg), 4.5);
for (const fill of WHITE_ON) check(`white on --${fill}`, "#FFFFFF", token(fill), 4.5);
for (const fill of INK_ON) check(`--ink on --${fill}`, token("ink"), token(fill), 4.5);
for (const [fg, bg, min] of UI) check(`--${fg} on --${bg} (UI)`, token(fg), token(bg), min);

if (failures.length) {
  console.error("Contrast failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log(`Contrast OK — ${checked} pairs pass.`);
