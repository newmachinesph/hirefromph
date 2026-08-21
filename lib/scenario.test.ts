import { describe, expect, it } from "vitest";
import {
  SCENARIOS,
  getScenario,
  getScenarioForRoute,
  validateScenario,
  walk,
  type Scenario,
} from "@/lib/scenario";

const TOY: Scenario = {
  id: "toy",
  title: "A toy scenario",
  route: "/conduct",
  intro: "Two forks, one ending.",
  start: "a",
  nodes: {
    a: {
      text: "You are at A.",
      choices: [
        { label: "Go to B", next: "b", tests: "Boundaries." },
        { label: "Go to C", next: "c", tests: "Scope.", note: "Costs you nothing." },
      ],
    },
    b: { text: "You are at B.", choices: [{ label: "Finish", next: "end", tests: "Follow-through." }] },
    c: { text: "You are at C.", choices: [{ label: "Finish", next: "end", tests: "Follow-through." }] },
    end: { text: "Done.", end: true, debrief: "You got there." },
  },
};

describe("walk", () => {
  it("starts at the start node with no steps taken", () => {
    const result = walk(TOY, []);
    expect(result.currentId).toBe("a");
    expect(result.steps).toEqual([]);
    expect(result.finished).toBe(false);
  });

  it("records the node and the choice made at each step", () => {
    const result = walk(TOY, [0]);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].id).toBe("a");
    expect(result.steps[0].choice?.next).toBe("b");
    expect(result.currentId).toBe("b");
  });

  it("reaches an end node and marks the walk finished", () => {
    const result = walk(TOY, [1, 0]);
    expect(result.currentId).toBe("end");
    expect(result.current.debrief).toBe("You got there.");
    expect(result.finished).toBe(true);
    expect(result.steps.map((step) => step.id)).toEqual(["a", "c"]);
  });

  it("stops where it is when a choice index is out of range", () => {
    const result = walk(TOY, [9]);
    expect(result.currentId).toBe("a");
    expect(result.steps).toEqual([]);
  });

  it("stops where it is when a choice points at a node that does not exist", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, a: { text: "A", choices: [{ label: "Nowhere", next: "ghost", tests: "x" }] } },
    };
    expect(walk(broken, [0]).currentId).toBe("a");
  });

  it("falls back to the first node when `start` is missing", () => {
    const result = walk({ ...TOY, start: "ghost" }, []);
    expect(result.currentId).toBe("a");
  });
});

describe("validateScenario", () => {
  it("finds nothing wrong with a sound graph", () => {
    expect(validateScenario(TOY)).toEqual([]);
  });

  it("reports a dangling next", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, b: { text: "B", choices: [{ label: "Nowhere", next: "ghost", tests: "x" }] } },
    };
    expect(validateScenario(broken)).toContainEqual({
      kind: "dangling",
      node: "b",
      detail: 'choice "Nowhere" points at "ghost", which is not a node',
    });
  });

  it("reports an unreachable node", () => {
    const broken: Scenario = {
      ...TOY,
      nodes: { ...TOY.nodes, orphan: { text: "Nobody gets here.", end: true, debrief: "…" } },
    };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("unreachable");
  });

  it("reports a non-end node with no choices", () => {
    const broken: Scenario = { ...TOY, nodes: { ...TOY.nodes, b: { text: "B" } } };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("dead-end");
  });

  it("reports an end node with no debrief", () => {
    const broken: Scenario = { ...TOY, nodes: { ...TOY.nodes, end: { text: "Done.", end: true } } };
    expect(validateScenario(broken).map((p) => p.kind)).toContain("no-debrief");
  });

  it("reports a missing start node", () => {
    expect(validateScenario({ ...TOY, start: "ghost" }).map((p) => p.kind)).toContain(
      "missing-start",
    );
  });
});

describe("the authored scenarios", () => {
  it("loads four scenarios", () => {
    expect(SCENARIOS).toHaveLength(4);
  });

  it("finds one by id and one by route", () => {
    expect(getScenario("late-request")?.route).toBe("/conduct");
    expect(getScenarioForRoute("/clients")?.id).toBe("scope-creep");
    expect(getScenario("nope")).toBeUndefined();
  });
});
