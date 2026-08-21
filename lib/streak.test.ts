import { describe, expect, it } from "vitest";
import { currentStreak, longestStreak, uniqueDates } from "@/lib/streak";

const TODAY = "2026-08-21";

describe("uniqueDates", () => {
  it("dedupes, sorts, and drops anything that is not a real date", () => {
    expect(
      uniqueDates(["2026-08-21", "2026-08-19", "2026-08-21", "nope", "2026-02-30"]),
    ).toEqual(["2026-08-19", "2026-08-21"]);
  });
});

describe("currentStreak", () => {
  it("is 0 when nothing has been completed", () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  it("counts a run that ends today", () => {
    expect(currentStreak(["2026-08-19", "2026-08-20", "2026-08-21"], TODAY)).toBe(3);
  });

  it("counts a run that ends yesterday, so a day is not lost before it is over", () => {
    expect(currentStreak(["2026-08-19", "2026-08-20"], TODAY)).toBe(2);
  });

  it("is 0 when the last completed day is older than yesterday", () => {
    expect(currentStreak(["2026-08-17", "2026-08-18"], TODAY)).toBe(0);
  });

  it("stops at the first gap", () => {
    expect(
      currentStreak(["2026-08-01", "2026-08-19", "2026-08-20", "2026-08-21"], TODAY),
    ).toBe(3);
  });

  it("counts a duplicated day once", () => {
    expect(currentStreak(["2026-08-21", "2026-08-21", "2026-08-20"], TODAY)).toBe(2);
  });

  it("counts a single day", () => {
    expect(currentStreak(["2026-08-21"], TODAY)).toBe(1);
  });
});

describe("longestStreak", () => {
  it("is 0 for an empty history", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("finds the longest run anywhere in the history", () => {
    expect(
      longestStreak([
        "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04",
        "2026-08-20", "2026-08-21",
      ]),
    ).toBe(4);
  });

  it("counts an isolated day as 1", () => {
    expect(longestStreak(["2026-07-01", "2026-09-09"])).toBe(1);
  });

  it("spans a month boundary", () => {
    expect(longestStreak(["2026-08-30", "2026-08-31", "2026-09-01"])).toBe(3);
  });
});
