/**
 * Branching scenarios (spec §7.4.2).
 *
 * A scenario is a directed graph of nodes. A node either offers choices or is
 * an ending with a debrief. There is no score: some forks are trade-offs, and
 * the debrief names the principle each fork tested rather than grading it.
 *
 * `walk` is pure — the component owns the list of chosen indices and re-walks
 * from the start on every render, so "go back one step" is `choices.slice(0, -1)`
 * and needs no undo stack.
 */

import scenariosData from "@/data/scenarios.json";

export type ScenarioChoice = {
  label: string;
  next: string;
  /** The principle this fork tests. Shown in the debrief. */
  tests: string;
  /** One line of consequence shown after the choice is made. */
  note?: string;
};

export type ScenarioNode = {
  text: string;
  choices?: ScenarioChoice[];
  end?: boolean;
  debrief?: string;
};

export type Scenario = {
  id: string;
  title: string;
  route: string;
  intro: string;
  start: string;
  nodes: Record<string, ScenarioNode>;
};

export const SCENARIOS = scenariosData.scenarios as unknown as Scenario[];
export const SCENARIOS_LAST_VERIFIED = scenariosData.lastVerified;

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

export function getScenarioForRoute(route: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.route === route);
}

export type WalkStep = { id: string; node: ScenarioNode; choice?: ScenarioChoice };

export type Walk = {
  /** The path taken, oldest first. Each step carries the choice made there. */
  steps: WalkStep[];
  currentId: string;
  current: ScenarioNode;
  finished: boolean;
};

function startId(scenario: Scenario): string {
  if (scenario.nodes[scenario.start]) return scenario.start;
  // A broken `start` must not blank the page; Task 8's integrity test is what
  // stops this reaching production.
  return Object.keys(scenario.nodes)[0];
}

export function walk(scenario: Scenario, choices: readonly number[]): Walk {
  const steps: WalkStep[] = [];
  let currentId = startId(scenario);
  let current = scenario.nodes[currentId];

  for (const index of choices) {
    const options = current?.choices ?? [];
    const choice = options[index];
    if (!choice) break;
    const nextNode = scenario.nodes[choice.next];
    if (!nextNode) break;

    steps.push({ id: currentId, node: current, choice });
    currentId = choice.next;
    current = nextNode;
  }

  return {
    steps,
    currentId,
    current,
    finished: current?.end === true,
  };
}

export type ProblemKind =
  | "missing-start"
  | "dangling"
  | "unreachable"
  | "dead-end"
  | "no-debrief"
  | "end-with-choices";

export type ScenarioProblem = { kind: ProblemKind; node: string; detail: string };

/** `[]` means the graph is sound. Used by the data-integrity suite (Task 8). */
export function validateScenario(scenario: Scenario): ScenarioProblem[] {
  const problems: ScenarioProblem[] = [];
  const ids = Object.keys(scenario.nodes);

  if (!scenario.nodes[scenario.start]) {
    problems.push({
      kind: "missing-start",
      node: scenario.start,
      detail: `start "${scenario.start}" is not a node`,
    });
  }

  for (const [id, node] of Object.entries(scenario.nodes)) {
    const choices = node.choices ?? [];
    for (const choice of choices) {
      if (!scenario.nodes[choice.next]) {
        problems.push({
          kind: "dangling",
          node: id,
          detail: `choice "${choice.label}" points at "${choice.next}", which is not a node`,
        });
      }
    }
    if (!node.end && choices.length === 0) {
      problems.push({ kind: "dead-end", node: id, detail: "no choices and not marked as an end" });
    }
    if (node.end && !node.debrief) {
      problems.push({ kind: "no-debrief", node: id, detail: "an ending with no debrief" });
    }
    if (node.end && choices.length > 0) {
      problems.push({ kind: "end-with-choices", node: id, detail: "an ending that still offers choices" });
    }
  }

  const seen = new Set<string>();
  const stack = [scenario.start];
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id) || !scenario.nodes[id]) continue;
    seen.add(id);
    for (const choice of scenario.nodes[id].choices ?? []) stack.push(choice.next);
  }
  for (const id of ids) {
    if (!seen.has(id)) {
      problems.push({ kind: "unreachable", node: id, detail: "no path from the start reaches it" });
    }
  }

  return problems;
}
