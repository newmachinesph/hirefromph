import { describe, expect, it } from "vitest";
import {
  PH_OFFSET,
  REGIONS,
  formatHour,
  intersectHours,
  offsetFor,
  overlap,
  toPhWindows,
} from "@/lib/overlap";

function region(id: string) {
  const found = REGIONS.find((r) => r.id === id);
  if (!found) throw new Error(`no region ${id}`);
  return found;
}

describe("REGIONS", () => {
  it("carries the six client regions the markets guide names", () => {
    expect(REGIONS).toHaveLength(6);
    expect(REGIONS.map((r) => r.id)).toEqual([
      "us", "uk-eu", "anz", "middle-east", "canada", "asia",
    ]);
  });
});

describe("offsetFor", () => {
  it("uses standard time outside the DST months", () => {
    expect(offsetFor(region("us"), 1)).toBe(-5);
  });

  it("moves the clock forward inside the DST months", () => {
    expect(offsetFor(region("us"), 7)).toBe(-4);
  });

  it("handles a southern-hemisphere DST window that wraps the new year", () => {
    expect(offsetFor(region("anz"), 1)).toBe(11);
    expect(offsetFor(region("anz"), 7)).toBe(10);
  });

  it("leaves a no-DST region alone all year", () => {
    for (let month = 1; month <= 12; month += 1) {
      expect(offsetFor(region("asia"), month)).toBe(8);
      expect(offsetFor(region("middle-east"), month)).toBe(4);
    }
  });
});

describe("toPhWindows", () => {
  it("returns one interval when the window does not wrap", () => {
    // Singapore is UTC+8, the same as PH: 9–17 there is 9–17 here.
    expect(toPhWindows({ start: 9, end: 17 }, 8)).toEqual([{ start: 9, end: 17 }]);
  });

  it("shifts a window forward by the difference to PH", () => {
    // UK on GMT (UTC+0): 9–17 there is 17–25 → 17–24 plus 0–1 here.
    expect(toPhWindows({ start: 9, end: 17 }, 0)).toEqual([
      { start: 17, end: 24 },
      { start: 0, end: 1 },
    ]);
  });

  it("wraps a window that lands entirely in the next PH day", () => {
    // US Eastern on EST (UTC-5): 9–17 there is 22–06 here.
    expect(toPhWindows({ start: 9, end: 17 }, -5)).toEqual([
      { start: 22, end: 24 },
      { start: 0, end: 6 },
    ]);
  });
});

describe("intersectHours", () => {
  it("counts the overlapping whole hours", () => {
    expect(intersectHours({ start: 9, end: 18 }, [{ start: 14, end: 22 }])).toBe(4);
  });

  it("is 0 when the windows do not touch", () => {
    expect(intersectHours({ start: 9, end: 12 }, [{ start: 14, end: 22 }])).toBe(0);
  });

  it("adds up both halves of a wrapped window", () => {
    expect(
      intersectHours({ start: 20, end: 24 }, [{ start: 22, end: 24 }, { start: 0, end: 6 }]),
    ).toBe(2);
  });
});

describe("overlap", () => {
  it("gives a PH day worker no live hours with US Eastern in January", () => {
    expect(overlap(region("us"), 1, { start: 9, end: 17 }).hours).toBe(0);
  });

  it("gives a PH night worker a full window with US Eastern in January", () => {
    const result = overlap(region("us"), 1, { start: 22, end: 24 });
    expect(result.hours).toBe(2);
    expect(result.offset).toBe(-5);
  });

  it("gives a PH afternoon worker real overlap with the UK in January", () => {
    expect(overlap(region("uk-eu"), 1, { start: 13, end: 21 }).hours).toBe(4);
  });

  it("gives a PH day worker a full working day with regional Asia", () => {
    expect(overlap(region("asia"), 6, { start: 9, end: 17 }).hours).toBe(8);
  });

  it("accepts a client window other than 9 to 5", () => {
    expect(
      overlap(region("asia"), 6, { start: 9, end: 17 }, { start: 12, end: 20 }).hours,
    ).toBe(5);
  });
});

describe("formatHour", () => {
  it("names midnight and noon rather than printing 12", () => {
    expect(formatHour(0)).toBe("12mn");
    expect(formatHour(12)).toBe("12nn");
    expect(formatHour(24)).toBe("12mn");
  });

  it("uses am and pm elsewhere", () => {
    expect(formatHour(9)).toBe("9am");
    expect(formatHour(17)).toBe("5pm");
  });
});

describe("PH_OFFSET", () => {
  it("is UTC+8", () => {
    expect(PH_OFFSET).toBe(8);
  });
});
