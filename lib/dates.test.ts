import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  formatIsoDate,
  isIsoDate,
  isoWeek,
  isoWeekKey,
  todayISO,
} from "@/lib/dates";

describe("isIsoDate", () => {
  it("accepts a real calendar date", () => {
    expect(isIsoDate("2026-08-21")).toBe(true);
  });

  it("rejects a date that does not exist", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });

  it("rejects anything that is not an ISO date string", () => {
    expect(isIsoDate("21/08/2026")).toBe(false);
    expect(isIsoDate(20260821)).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe("addDays", () => {
  it("crosses a month boundary", () => {
    expect(addDays("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("crosses a year boundary backwards", () => {
    expect(addDays("2026-01-02", -3)).toBe("2025-12-30");
  });

  it("handles the leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("daysBetween", () => {
  it("counts forward and backward", () => {
    expect(daysBetween("2026-08-21", "2026-08-24")).toBe(3);
    expect(daysBetween("2026-08-24", "2026-08-21")).toBe(-3);
    expect(daysBetween("2026-08-21", "2026-08-21")).toBe(0);
  });
});

describe("todayISO", () => {
  it("reads the local calendar date, not the UTC one", () => {
    // 31 Dec 2026 at 20:00 in a UTC+8 zone is still 1 Jan 2027 in UTC.
    const localNewYearsEve = new Date(2026, 11, 31, 20, 0, 0);
    expect(todayISO(localNewYearsEve)).toBe("2026-12-31");
  });
});

describe("isoWeek", () => {
  it("puts 1 January 2026 in week 1 of 2026", () => {
    expect(isoWeek("2026-01-01")).toEqual({ year: 2026, week: 1 });
  });

  it("starts weeks on Monday", () => {
    expect(isoWeekKey("2026-08-23")).toBe("2026-W34"); // Sunday
    expect(isoWeekKey("2026-08-24")).toBe("2026-W35"); // Monday
  });

  it("keeps 1 January 2027 in 2026's week 53", () => {
    expect(isoWeekKey("2027-01-01")).toBe("2026-W53");
  });

  it("puts 30 December 2024 in 2025's week 1", () => {
    expect(isoWeekKey("2024-12-30")).toBe("2025-W01");
  });
});

describe("formatIsoDate", () => {
  it("renders a short, locale-independent date", () => {
    expect(formatIsoDate("2026-08-23")).toBe("23 Aug 2026");
    expect(formatIsoDate("2026-01-05")).toBe("5 Jan 2026");
  });
});
