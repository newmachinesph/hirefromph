import { describe, expect, it } from "vitest";
import { linearScale, niceTicks } from "@/lib/chart-scale";

describe("linearScale", () => {
  it("maps the domain ends onto the range ends", () => {
    const x = linearScale([0, 100], [0, 500]);
    expect(x(0)).toBe(0);
    expect(x(100)).toBe(500);
    expect(x(50)).toBe(250);
  });

  it("handles an inverted range, which is how every y axis is drawn", () => {
    const y = linearScale([0, 10], [400, 40]);
    expect(y(0)).toBe(400);
    expect(y(10)).toBe(40);
    expect(y(5)).toBe(220);
  });

  it("handles a negative domain without clamping", () => {
    const x = linearScale([-40, 40], [0, 800]);
    expect(x(-40)).toBe(0);
    expect(x(0)).toBe(400);
    expect(x(80)).toBe(1200);
  });

  it("collapses a zero-width domain onto the range start instead of dividing by zero", () => {
    const x = linearScale([7, 7], [10, 90]);
    expect(x(7)).toBe(10);
    expect(Number.isFinite(x(9))).toBe(true);
  });
});

describe("niceTicks", () => {
  it("produces round steps that cover the data", () => {
    expect(niceTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("extends outward across zero for diverging data", () => {
    expect(niceTicks(-30, 12, 5)).toEqual([-30, -20, -10, 0, 10, 20]);
  });

  it("returns evenly spaced ticks whose ends bracket the input", () => {
    const ticks = niceTicks(3, 187, 5);
    expect(ticks.length).toBeGreaterThan(2);
    expect(ticks[0]).toBeLessThanOrEqual(3);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(187);
    const steps = ticks.slice(1).map((t, i) => Number((t - ticks[i]).toFixed(10)));
    expect(new Set(steps).size).toBe(1);
  });

  it("degenerates safely", () => {
    expect(niceTicks(5, 5)).toEqual([5]);
    expect(niceTicks(Number.NaN, 10)).toEqual([]);
  });
});
