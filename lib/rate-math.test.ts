import { describe, expect, it } from "vitest";
import { computeRate, unpaidShareToAddon } from "@/lib/rate-math";
import { UNPAID_KEEP } from "@/lib/simulator-math";

describe("unpaidShareToAddon", () => {
  it("turns the ILO quarter into a third on top of billed hours", () => {
    expect(unpaidShareToAddon(25)).toBeCloseTo(33.333, 2);
  });

  it("is zero at zero and never divides by zero", () => {
    expect(unpaidShareToAddon(0)).toBe(0);
    expect(Number.isFinite(unpaidShareToAddon(100))).toBe(true);
    expect(Number.isFinite(unpaidShareToAddon(250))).toBe(true);
  });

  it("agrees with the simulator's keep-rate on the default case", () => {
    // The simulator keeps 75% of the headline rate; the calculator must land
    // on the same number from the same 25% share, or the two tools contradict.
    const share = Math.round((1 - UNPAID_KEEP) * 100);
    const r = computeRate({
      rate: 10,
      hours: 40,
      fee: 0,
      unpaid: unpaidShareToAddon(share),
      costs: 0,
      tax: 0,
      fx: 1,
    });
    expect(r.effHourlyUsd).toBeCloseTo(10 * UNPAID_KEEP, 6);
  });
});
