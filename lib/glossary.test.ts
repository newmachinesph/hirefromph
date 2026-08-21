import { describe, expect, it } from "vitest";
import { TERMS, filterTerms, getTerm, groupByLetter } from "@/lib/glossary";

describe("TERMS", () => {
  it("loads the fifty-seven authored terms", () => {
    expect(TERMS).toHaveLength(57);
  });
});

describe("getTerm", () => {
  it("finds a term by id and returns undefined for anything else", () => {
    expect(getTerm("retainer")?.term).toBe("Retainer");
    expect(getTerm("not-a-term")).toBeUndefined();
  });
});

describe("groupByLetter", () => {
  it("groups by first letter, ascending, with no empty letters", () => {
    const groups = groupByLetter([
      { id: "b", term: "Batch", definition: "x" },
      { id: "a", term: "acronym", definition: "x" },
      { id: "a2", term: "Async", definition: "x" },
    ]);
    expect(groups.map((group) => group.letter)).toEqual(["A", "B"]);
    expect(groups[0].terms.map((term) => term.id)).toEqual(["a", "a2"]);
  });

  it("sorts within a letter case-insensitively", () => {
    const groups = groupByLetter([
      { id: "z", term: "az", definition: "x" },
      { id: "a", term: "AA", definition: "x" },
    ]);
    expect(groups[0].terms.map((term) => term.id)).toEqual(["a", "z"]);
  });

  it("puts anything that does not start with a letter under #", () => {
    const groups = groupByLetter([{ id: "n", term: "2307", definition: "x" }]);
    expect(groups[0].letter).toBe("#");
  });

  it("groups all fifty-seven authored terms without losing one", () => {
    const grouped = groupByLetter(TERMS).flatMap((group) => group.terms);
    expect(grouped).toHaveLength(57);
  });
});

describe("filterTerms", () => {
  it("returns everything for an empty or blank query", () => {
    expect(filterTerms(TERMS, "")).toHaveLength(57);
    expect(filterTerms(TERMS, "   ")).toHaveLength(57);
  });

  it("matches the term and the definition, case-insensitively", () => {
    expect(filterTerms(TERMS, "RETAINER").map((term) => term.id)).toContain("retainer");
    expect(filterTerms(TERMS, "revisions").length).toBeGreaterThan(0);
  });

  it("returns nothing when there is no match", () => {
    expect(filterTerms(TERMS, "zzzzzz")).toEqual([]);
  });
});
