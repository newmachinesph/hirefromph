// Plain Node self-check for the extracted calculator math. No test framework.
// Run:  node lib/calculators.test.mjs   (Node >= 22.6 strips the TS types natively)
import assert from "node:assert/strict";
import {
  ease,
  phaseIn,
  aiMultiplier,
  hourlyAt,
  monthlyEffective,
  monthlyBilled,
  baselineOf,
  DEFAULT_FX,
  MONTHS,
} from "./simulator-math.ts";
import { computeRate, WEEKS } from "./rate-math.ts";

let passed = 0;
const approx = (actual, expected, eps = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ~${expected}, got ${actual}`,
  );
  passed++;
};
const eq = (actual, expected) => {
  assert.strictEqual(actual, expected);
  passed++;
};

/* ---------- simulator: easing / phase-in ---------- */
eq(ease(0), 0); // floor
eq(ease(1), 1); // ceiling
eq(ease(0.5), 0.5); // midpoint symmetry
eq(ease(-5), 0); // clamp below
eq(ease(3), 1); // clamp above
eq(phaseIn(1.4, 12, 0), 1); // nothing granted on day one
eq(phaseIn(2, 10, 10), 2); // fully phased in
eq(phaseIn(1.5, 10, 5), 1.25); // 1 + 0.5 * ease(0.5)

/* ---------- simulator: the craft-gated AI premium ---------- */
eq(aiMultiplier({ ai: "none", craft: "deep" }), 1); // no AI, no premium
eq(aiMultiplier({ ai: "user", craft: "none" }), 1.05); // flat user premium
eq(aiMultiplier({ ai: "augmented", craft: "deep" }), 1.34); // expertise + AI, Upwork's +34%
eq(aiMultiplier({ ai: "augmented", craft: "none" }), 1); // AI cannot multiply zero

/* ---------- simulator: hourly (normal cases) ---------- */
const generalist = {
  craft: "none",
  ai: "none",
  ownership: "tasks",
  hours: 20,
  language: "english",
  clients: "foreign",
};
eq(hourlyAt(generalist, 0), 3); // everyone starts at the floor
const deepMax = {
  craft: "deep",
  ai: "none",
  ownership: "tasks",
  hours: 40,
  language: "english",
  clients: "foreign",
};
eq(hourlyAt(deepMax, 30), 22); // full base at the end of the deep ramp

/* ---------- simulator: monthly take-home (normal + zero) ---------- */
approx(monthlyEffective(generalist, 0), 3 * 20 * WEEKS * 0.75); // 194.85
approx(monthlyBilled(generalist, 0), 3 * 20 * WEEKS); // 259.8
const zeroHours = { ...generalist, hours: 0 };
eq(monthlyEffective(zeroHours, 12), 0); // zero hours -> zero income

/* ---------- simulator: large value + baseline gap ---------- */
const big = {
  craft: "deep",
  ai: "augmented",
  ownership: "outcomes",
  hours: 40,
  language: "second",
  clients: "foreign",
};
approx(hourlyAt(big, 36), 44.22); // 22 * 1.34 * 1.25 * 1.2
approx(monthlyEffective(big, 36), 44.22 * 40 * WEEKS * 0.75); // ~5744.18
assert.ok(
  monthlyEffective(big, 36) > monthlyEffective(baselineOf(big), 36),
  "the built path must beat its own generic baseline",
);
passed++;

/* ---------- simulator: exported constants ---------- */
eq(DEFAULT_FX, 61.5);
eq(MONTHS, 36);

/* ---------- rate: the documented default case ---------- */
const base = computeRate({
  rate: 8,
  hours: 40,
  fee: 10,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
approx(base.afterFeeUsd, 1247.04);
approx(base.totalHoursMonthly, 225.16);
approx(base.netPhp, 62862.0544);
eq(base.shrink, 40); // headline $8 shrinks 40% after everything

/* ---------- rate: zero / empty guards ---------- */
const zeroRate = computeRate({
  rate: 0,
  hours: 40,
  fee: 10,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
eq(zeroRate.shrink, 0); // rate>0 guard: no shrink to report
eq(zeroRate.netPhp, -4000); // only fixed costs remain

/* ---------- rate: division-by-zero guard (no billable hours) ---------- */
const zeroHrs = computeRate({
  rate: 8,
  hours: 0,
  fee: 10,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
eq(zeroHrs.effHourlyPhp, 0); // totalHoursMonthly>0 guard, not NaN/Infinity
eq(zeroHrs.effHourlyUsd, 0);

/* ---------- rate: large value ---------- */
const large = computeRate({
  rate: 60,
  hours: 60,
  fee: 20,
  unpaid: 60,
  costs: 20000,
  tax: 25,
  fx: 70,
});
approx(large.netPhp, 639696);
eq(large.shrink, 63);

console.log(`ok - ${passed} assertions passed`);
