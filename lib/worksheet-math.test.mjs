import { test } from "node:test";
import assert from "node:assert/strict";

// Mirror of the pure functions (kept in sync with worksheet-math.ts). The .ts
// imports "@/lib/rate-math" which node can't resolve without the bundler, so we
// re-declare the tiny math here — same as rate-math.test.mjs does.
const WEEKS = 4.33;
const FT = 40;

function toMonthlyPhp(amount, unit, fx) {
  if (!(amount > 0)) return null;
  if (unit === "php_month") return amount;
  if (unit === "php_fortnight") return amount * (26 / 12);
  if (unit === "php_hour") return amount * FT * WEEKS;
  if (unit === "usd_hour") return amount * fx * FT * WEEKS;
  return null;
}

test("php_month passes through", () => {
  assert.equal(toMonthlyPhp(60000, "php_month", 60), 60000);
});

test("usd_hour normalizes to monthly PHP", () => {
  // $7/hr × 60 × 40 × 4.33 ≈ 72,744
  assert.equal(Math.round(toMonthlyPhp(7, "usd_hour", 60)), 72744);
});

test("php_fortnight scales to monthly", () => {
  // ₱10,000/fortnight × 26/12 ≈ 21,667
  assert.equal(Math.round(toMonthlyPhp(10000, "php_fortnight", 60)), 21667);
});

test("missing rate returns null (a post that hides its number can't price you)", () => {
  assert.equal(toMonthlyPhp(0, "php_month", 60), null);
  assert.equal(toMonthlyPhp(-5, "php_hour", 60), null);
});
