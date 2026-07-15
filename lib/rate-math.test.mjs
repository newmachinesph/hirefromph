// Plain Node self-check for the rate math. No test framework.
// Run:  node lib/rate-math.test.mjs   (Node >= 22.6 strips the TS types natively)
// Covers the computeRate fields/branches that calculators.test.mjs leaves untested:
// the intermediate money line (gross -> fee -> php -> costs -> tax), and the
// Math.max(0, ...) tax floor when costs exceed gross.
import assert from "node:assert/strict";
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

/* ---------- WEEKS constant is the documented 4.33 ---------- */
eq(WEEKS, 4.33);

/* ---------- the full money line, field by field ---------- */
const r = computeRate({
  rate: 8,
  hours: 40,
  fee: 10,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
approx(r.grossMonthlyUsd, 1385.6); // 8 * 40 * 4.33
approx(r.grossPhp, 72328.32); // afterFeeUsd (1247.04) * 58
approx(r.afterCostsPhp, 68328.32); // grossPhp - 4000 fixed costs
approx(r.taxPhp, 5466.2656); // 68328.32 * 8%
approx(r.netPhp, r.afterCostsPhp - r.taxPhp); // net is exactly what's left after tax
approx(r.effHourlyUsd, r.effHourlyPhp / 58); // usd/hr is just php/hr / fx

/* ---------- tax floor: a loss must not manufacture a tax refund ---------- */
const loss = computeRate({
  rate: 8,
  hours: 40,
  fee: 10,
  unpaid: 30,
  costs: 100000, // costs dwarf gross -> afterCostsPhp goes negative
  tax: 8,
  fx: 58,
});
approx(loss.afterCostsPhp, -27671.68); // 72328.32 - 100000
eq(loss.taxPhp, 0); // Math.max(0, negative) -> no tax on a loss
approx(loss.netPhp, -27671.68); // net == afterCosts, untouched by tax

/* ---------- fee = 0: afterFee equals gross ---------- */
const noFee = computeRate({
  rate: 8,
  hours: 40,
  fee: 0,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
approx(noFee.afterFeeUsd, noFee.grossMonthlyUsd); // 1 - 0/100 = 1

/* ---------- extreme rate: math stays linear, no overflow ---------- */
const big = computeRate({
  rate: 1000,
  hours: 40,
  fee: 10,
  unpaid: 30,
  costs: 4000,
  tax: 8,
  fx: 58,
});
approx(big.grossMonthlyUsd, 173200); // 1000 * 40 * 4.33
approx(big.netPhp, 8314076.8); // (155880*58 - 4000) * 0.92

console.log(`ok - ${passed} assertions passed`);
