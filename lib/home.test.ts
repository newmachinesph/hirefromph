import { describe, expect, it } from "vitest";
import faq from "@/data/faq.json";
import homeData from "@/data/home.json";
import roadmap from "@/data/roadmap.json";
import stages from "@/data/stages.json";
import tasks from "@/data/tasks.json";
import tracks from "@/data/tracks.json";
import { HOME, HOME_STATS } from "@/lib/home";
import { routeDesc, routeEntry } from "@/lib/routes";

/** Every string in the file, so the banned-word sweep cannot be dodged by nesting. */
function* strings(node: unknown): Generator<string> {
  if (typeof node === "string") yield node;
  else if (Array.isArray(node)) for (const item of node) yield* strings(item);
  else if (node && typeof node === "object")
    for (const value of Object.values(node)) yield* strings(value);
}

const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

describe("home copy rules (spec §11)", () => {
  it("keeps the hero headline to eight words or fewer", () => {
    expect(words(`${HOME.hero.title} ${HOME.hero.accent}`)).toBeLessThanOrEqual(8);
  });

  it("keeps the hero lead to twenty-five words or fewer", () => {
    expect(words(HOME.hero.lead)).toBeLessThanOrEqual(25);
  });

  it("keeps the banned shell words out of every string", () => {
    const banned = /\b(actually|forever|genuinely|truly|virtual assistants?)\b/i;
    expect([...strings(homeData)].filter((s) => banned.test(s))).toEqual([]);
  });

  it("gives how-it-works exactly three feature items", () => {
    expect(HOME.howItWorks.items).toHaveLength(3);
  });
});

describe("home hero facts", () => {
  it("carries exactly four structural facts", () => {
    expect(HOME_STATS).toHaveLength(4);
  });

  it("matches the real counts in the data files", () => {
    expect(HOME_STATS.map((stat) => stat.value)).toEqual([
      String(stages.length),
      String(roadmap.steps.length),
      String(tracks.tracks.length),
      String(tasks.tasks.length),
    ]);
  });

  it("labels them without inventing achievements", () => {
    expect(HOME_STATS.map((stat) => stat.label)).toEqual([
      "stages",
      "steps",
      "niches",
      "micro-tasks",
    ]);
  });
});

describe("home FAQ wiring", () => {
  it("shows six questions", () => {
    expect(faq.items).toHaveLength(6);
  });

  it("names the link on every answer that has one", () => {
    const missing = faq.items
      .filter((item) => item.href)
      .filter((item) => !HOME.questions.links[item.id]);
    expect(missing.map((item) => item.id)).toEqual([]);
  });
});

describe("routeDesc", () => {
  it("returns the library one-liner for a route", () => {
    expect(routeDesc("/tasks")).toContain("Forty");
    expect(routeEntry("/tasks")?.label).toBe("Micro-Tasks");
  });

  it("describes every card in the What you'll build section", () => {
    const missing = HOME.build.items.filter((item) => !routeDesc(item.href));
    expect(missing.map((item) => item.href)).toEqual([]);
  });

  it("returns undefined for a route the library does not list", () => {
    expect(routeDesc("/not-a-route")).toBeUndefined();
  });
});
