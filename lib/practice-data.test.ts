import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import annotated from "@/data/annotated.json";
import decks from "@/data/decks.json";
import glossary from "@/data/glossary.json";
import learning from "@/data/learning.json";
import markets from "@/data/markets.json";
import practice from "@/data/practice.json";
import reflection from "@/data/reflection.json";
import tldr from "@/data/tldr.json";
import { REGIONS } from "@/lib/overlap";
import { SCENARIOS, validateScenario } from "@/lib/scenario";

/** Every route the practice layer points at must be a real App Router page. */
function routeExists(route: string): boolean {
  return existsSync(`app${route}/page.tsx`);
}

type Question = {
  id: string;
  type: string;
  prompt: string;
  options?: { text: string; correct: boolean; why: string }[];
  answer?: string;
  source?: { label: string; url: string };
};

const questions: Question[] = Object.values(practice.routes).flatMap(
  (entry) => entry.questions as Question[],
);

describe("data/practice.json", () => {
  it("covers 18 routes with three questions each", () => {
    const routes = Object.keys(practice.routes);
    expect(routes).toHaveLength(18);
    for (const route of routes) {
      expect(practice.routes[route as keyof typeof practice.routes].questions).toHaveLength(3);
    }
    expect(questions).toHaveLength(54);
  });

  it("points every route at a page that exists", () => {
    for (const route of Object.keys(practice.routes)) {
      expect(routeExists(route), route).toBe(true);
    }
  });

  it("gives every question a unique id", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every choice question exactly one correct option", () => {
    for (const question of questions.filter((q) => q.type === "choice")) {
      const correct = (question.options ?? []).filter((option) => option.correct);
      expect(correct.length, question.id).toBe(1);
    }
  });

  it("explains every option, right or wrong", () => {
    for (const question of questions.filter((q) => q.type === "choice")) {
      expect((question.options ?? []).length, question.id).toBeGreaterThanOrEqual(2);
      for (const option of question.options ?? []) {
        expect(option.why.trim().length, `${question.id}: ${option.text}`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every reveal question an answer and no options", () => {
    for (const question of questions.filter((q) => q.type === "reveal")) {
      expect(question.answer?.trim().length, question.id).toBeGreaterThan(0);
      expect(question.options, question.id).toBeUndefined();
    }
  });

  it("uses only the two authored question types", () => {
    for (const question of questions) {
      expect(["choice", "reveal"], question.id).toContain(question.type);
    }
  });

  it("gives every cited source a real URL", () => {
    for (const question of questions.filter((q) => q.source)) {
      expect(question.source?.url, question.id).toMatch(/^https?:\/\//);
      expect(question.source?.label.trim().length, question.id).toBeGreaterThan(0);
    }
  });
});

describe("data/tldr.json", () => {
  it("covers the same 18 routes as the quizzes", () => {
    expect(Object.keys(tldr.routes).sort()).toEqual(Object.keys(practice.routes).sort());
  });

  it("points every route at a page that exists", () => {
    for (const route of Object.keys(tldr.routes)) {
      expect(routeExists(route), route).toBe(true);
    }
  });

  it("carries a review flag on every entry, so drafts stay labelled", () => {
    for (const [route, entry] of Object.entries(tldr.routes)) {
      expect(typeof entry.reviewed, route).toBe("boolean");
      expect(entry.tl.trim().length, route).toBeGreaterThan(0);
    }
  });
});

describe("data/decks.json", () => {
  it("has four decks with unique ids and unique card ids across all of them", () => {
    expect(decks.decks).toHaveLength(4);
    const deckIds = decks.decks.map((deck) => deck.id);
    expect(new Set(deckIds).size).toBe(deckIds.length);

    const cardIds = decks.decks.flatMap((deck) => deck.cards.map((card) => card.id));
    expect(cardIds).toHaveLength(86);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it("points every deck at the guide it came from", () => {
    for (const deck of decks.decks) {
      expect(routeExists(deck.href), deck.id).toBe(true);
    }
  });

  it("gives every card a front and a back", () => {
    for (const deck of decks.decks) {
      for (const card of deck.cards) {
        expect(card.front.trim().length, card.id).toBeGreaterThan(0);
        expect(card.back.trim().length, card.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("data/scenarios.json", () => {
  it("has four scenarios, each on a route that exists", () => {
    expect(SCENARIOS).toHaveLength(4);
    for (const scenario of SCENARIOS) {
      expect(routeExists(scenario.route), scenario.id).toBe(true);
    }
  });

  it("has no dangling next, unreachable node, dead end, or undebriefed ending", () => {
    for (const scenario of SCENARIOS) {
      expect(validateScenario(scenario), scenario.id).toEqual([]);
    }
  });

  it("names the principle every fork tests", () => {
    for (const scenario of SCENARIOS) {
      for (const [id, node] of Object.entries(scenario.nodes)) {
        for (const choice of node.choices ?? []) {
          expect(choice.tests.trim().length, `${scenario.id}/${id}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("data/annotated.json", () => {
  it("carries the doctrine note that renders above every example", () => {
    expect(annotated.doctrineNote.trim().length).toBeGreaterThan(0);
  });

  it("points every hotspot at a block that exists", () => {
    for (const example of annotated.examples) {
      const blocks = new Set(example.blocks.map((block) => block.id));
      for (const hotspot of example.hotspots) {
        expect(blocks.has(hotspot.block), `${example.id}: ${hotspot.block}`).toBe(true);
      }
    }
  });

  it("numbers hotspots densely from 1 so the reading order has no holes", () => {
    for (const example of annotated.examples) {
      const numbers = example.hotspots.map((hotspot) => hotspot.n).sort((a, b) => a - b);
      expect(numbers, example.id).toEqual(
        Array.from({ length: numbers.length }, (_, index) => index + 1),
      );
    }
  });

  it("gives every hotspot a why and a rule", () => {
    for (const example of annotated.examples) {
      for (const hotspot of example.hotspots) {
        expect(hotspot.why.trim().length, `${example.id}#${hotspot.n}`).toBeGreaterThan(0);
        expect(hotspot.rule.trim().length, `${example.id}#${hotspot.n}`).toBeGreaterThan(0);
      }
    }
  });

  it("points every example and pair at a page that exists", () => {
    for (const example of annotated.examples) expect(routeExists(example.route), example.id).toBe(true);
    for (const pair of annotated.pairs) expect(routeExists(pair.route), pair.id).toBe(true);
  });

  it("quotes every change from the before text and into the after text", () => {
    for (const pair of annotated.pairs) {
      for (const change of pair.changes) {
        expect(pair.before, `${pair.id}: ${change.from}`).toContain(change.from);
        expect(pair.after, `${pair.id}: ${change.to}`).toContain(change.to);
      }
    }
  });
});

describe("data/glossary.json", () => {
  it("has 50 terms with unique ids", () => {
    expect(glossary.terms).toHaveLength(50);
    const ids = glossary.terms.map((term) => term.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every href to a page that exists", () => {
    for (const term of glossary.terms) {
      if (!term.href) continue;
      expect(routeExists(term.href), term.id).toBe(true);
    }
  });

  it("gives every term a definition", () => {
    for (const term of glossary.terms) {
      expect(term.definition.trim().length, term.id).toBeGreaterThan(0);
    }
  });
});

describe("data/reflection.json", () => {
  it("has twelve prompts numbered 1 to 12", () => {
    expect(reflection.prompts).toHaveLength(12);
    expect(reflection.prompts.map((prompt) => prompt.week)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
  });
});

describe("lib/overlap regions", () => {
  it("names the same six regions as the markets guide, in the same order", () => {
    expect(REGIONS.map((region) => region.name)).toEqual(
      markets.regions.items.map((item) => item.name),
    );
  });
});

describe("study-timer session shapes", () => {
  it("keeps the hard-coded minutes in step with learning.json", () => {
    const expected: Record<string, [number, number]> = {
      short: [15, 3],
      medium: [25, 5],
      long: [50, 10],
    };
    for (const [id, [focus, rest]] of Object.entries(expected)) {
      const shape = learning.protocolRules.sessionShapes[
        id as keyof typeof learning.protocolRules.sessionShapes
      ];
      expect(shape.pattern, id).toBe(`${focus} min focus / ${rest} min break`);
    }
  });
});
