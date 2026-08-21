import { describe, expect, it } from "vitest";
import {
  BOXES,
  INTERVALS,
  dueCount,
  isDue,
  nextDue,
  parseSchedule,
  schedule,
  type Schedule,
} from "@/lib/leitner";

const TODAY = "2026-08-21";

describe("INTERVALS", () => {
  it("is the 1/2/4/8/16-day ladder", () => {
    expect(BOXES.map((box) => INTERVALS[box])).toEqual([1, 2, 4, 8, 16]);
  });
});

describe("schedule", () => {
  it("treats an unseen card as box 1 and promotes it on a correct answer", () => {
    expect(schedule(undefined, true, TODAY)).toEqual({ box: 2, due: "2026-08-23" });
  });

  it("keeps an unseen card in box 1 when it is missed", () => {
    expect(schedule(undefined, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("promotes one box per correct answer and dates the review from the new box", () => {
    expect(schedule({ box: 2, due: TODAY }, true, TODAY)).toEqual({ box: 3, due: "2026-08-25" });
    expect(schedule({ box: 3, due: TODAY }, true, TODAY)).toEqual({ box: 4, due: "2026-08-29" });
    expect(schedule({ box: 4, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: "2026-09-06" });
  });

  it("stops at box 5", () => {
    expect(schedule({ box: 5, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: "2026-09-06" });
  });

  it("demotes straight to box 1 from any box", () => {
    expect(schedule({ box: 5, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
    expect(schedule({ box: 3, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("dates the review from today, not from the old due date", () => {
    expect(schedule({ box: 1, due: "2026-01-01" }, true, TODAY)).toEqual({
      box: 2,
      due: "2026-08-23",
    });
  });

  it("repairs an out-of-range box instead of throwing", () => {
    expect(schedule({ box: 9 as Schedule["box"], due: TODAY }, true, TODAY).box).toBe(5);
    expect(schedule({ box: 0 as Schedule["box"], due: TODAY }, true, TODAY).box).toBe(2);
  });
});

describe("isDue", () => {
  it("treats a card that has never been seen as due", () => {
    expect(isDue(undefined, TODAY)).toBe(true);
  });

  it("is due on and after the due date", () => {
    expect(isDue({ box: 2, due: TODAY }, TODAY)).toBe(true);
    expect(isDue({ box: 2, due: "2026-08-20" }, TODAY)).toBe(true);
  });

  it("is not due before the due date", () => {
    expect(isDue({ box: 2, due: "2026-08-22" }, TODAY)).toBe(false);
  });
});

describe("dueCount", () => {
  it("counts unseen ids and overdue ids together", () => {
    const entries = {
      a: { box: 2, due: "2026-08-20" } as Schedule,
      b: { box: 4, due: "2026-09-01" } as Schedule,
    };
    expect(dueCount(entries, ["a", "b", "c"], TODAY)).toBe(2);
  });
});

describe("nextDue", () => {
  it("returns the earliest due date", () => {
    expect(
      nextDue([
        { box: 3, due: "2026-09-01" },
        { box: 1, due: "2026-08-22" },
        { box: 5, due: "2026-10-01" },
      ]),
    ).toBe("2026-08-22");
  });

  it("returns undefined for an empty list", () => {
    expect(nextDue([])).toBeUndefined();
  });
});

describe("parseSchedule", () => {
  it("accepts a well-formed entry", () => {
    expect(parseSchedule({ box: 3, due: "2026-08-25" })).toEqual({ box: 3, due: "2026-08-25" });
  });

  it("rejects a bad box, a bad date, and a non-object", () => {
    expect(parseSchedule({ box: 7, due: "2026-08-25" })).toBeNull();
    expect(parseSchedule({ box: 3, due: "yesterday" })).toBeNull();
    expect(parseSchedule("nope")).toBeNull();
    expect(parseSchedule(null)).toBeNull();
  });
});
