import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMPTY_QUIZ,
  PRACTICE_KEYS,
  parseDeckState,
  parseJournalState,
  parsePlanDayDates,
  parsePortfolioState,
  parseQuizState,
  parseTimerState,
  readSlot,
  writeSlot,
} from "@/lib/practice-store";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PRACTICE_KEYS", () => {
  it("keeps every slot under the hfph.practice namespace", () => {
    for (const key of Object.values(PRACTICE_KEYS)) {
      expect(key.startsWith("hfph.practice.")).toBe(true);
    }
    expect(new Set(Object.values(PRACTICE_KEYS)).size).toBe(6);
  });
});

describe("readSlot / writeSlot", () => {
  it("round-trips a value", () => {
    writeSlot(PRACTICE_KEYS.deck, { cards: { a: { box: 2, due: "2026-08-23" } } });
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toEqual({
      cards: { a: { box: 2, due: "2026-08-23" } },
    });
  });

  it("returns null for a slot that was never written", () => {
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("returns null instead of throwing on invalid JSON", () => {
    localStorage.setItem(PRACTICE_KEYS.deck, "{ not json");
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("returns null instead of throwing when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readSlot(PRACTICE_KEYS.deck, parseDeckState)).toBeNull();
  });

  it("swallows a quota error on write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(() => writeSlot(PRACTICE_KEYS.deck, { cards: {} })).not.toThrow();
  });
});

describe("parseQuizState", () => {
  it("keeps good entries and drops broken ones", () => {
    expect(
      parseQuizState({
        questions: {
          good: { box: 3, due: "2026-08-25" },
          badBox: { box: 11, due: "2026-08-25" },
          badDate: { box: 2, due: "someday" },
        },
        routes: {
          "/english": { score: 2, total: 3, taken: "2026-08-21" },
          "/legit": { score: "two", total: 3, taken: "2026-08-21" },
        },
      }),
    ).toEqual({
      questions: { good: { box: 3, due: "2026-08-25" } },
      routes: { "/english": { score: 2, total: 3, taken: "2026-08-21" } },
    });
  });

  it("returns the empty state for anything unusable", () => {
    expect(parseQuizState(null)).toEqual(EMPTY_QUIZ);
    expect(parseQuizState("nope")).toEqual(EMPTY_QUIZ);
    expect(parseQuizState({ questions: 7 })).toEqual(EMPTY_QUIZ);
  });
});

describe("parseJournalState", () => {
  it("keeps entries keyed by an ISO week and drops the rest", () => {
    expect(
      parseJournalState({
        "2026-W34": { text: "Found one client off-board.", updated: "2026-08-21" },
        "week 34": { text: "x", updated: "2026-08-21" },
        "2026-W35": { text: 7, updated: "2026-08-28" },
      }),
    ).toEqual({ "2026-W34": { text: "Found one client off-board.", updated: "2026-08-21" } });
  });
});

describe("parsePlanDayDates", () => {
  it("keeps numeric day keys with real dates", () => {
    expect(parsePlanDayDates({ "1": "2026-08-21", "2": "nope", x: "2026-08-21" })).toEqual({
      1: "2026-08-21",
    });
  });
});

describe("parsePortfolioState", () => {
  it("keeps true rung keys and drops everything else", () => {
    expect(
      parsePortfolioState({ "bookkeeping:Start": true, "bookkeeping:Pro": false, nocolon: true }),
    ).toEqual({ "bookkeeping:Start": true });
    expect(parsePortfolioState(null)).toEqual({});
  });
});

describe("parseTimerState", () => {
  it("keeps a well-formed running block", () => {
    const running = {
      shape: "medium",
      phase: "focus",
      endsAt: 1_800_000,
      paused: false,
      remainingMs: 0,
    };
    expect(parseTimerState(running)).toEqual(running);
  });

  it("returns null for a bad phase or a missing field", () => {
    expect(parseTimerState({ shape: "medium", phase: "nap", endsAt: 1, paused: false, remainingMs: 0 })).toBeNull();
    expect(parseTimerState({ shape: "medium" })).toBeNull();
    expect(parseTimerState(null)).toBeNull();
  });
});
