import { describe, expect, it } from "vitest";
import { DIAGRAMS } from "@/components/diagrams";
import roadmap from "@/data/roadmap.json";
import { routeDesc } from "@/lib/routes";
import { STAGES, TOTAL_STAGES, getStage } from "@/lib/stages";
import { listVisuals } from "@/lib/visuals";

const VISUAL_IDS = new Set(listVisuals().map((visual) => visual.id));
const DIAGRAM_IDS = new Set(Object.keys(DIAGRAMS));

describe("stage data", () => {
  it("has five stages numbered 1 to 5", () => {
    expect(TOTAL_STAGES).toBe(5);
    expect(STAGES.map((stage) => stage.num)).toEqual([1, 2, 3, 4, 5]);
  });

  it("gives every stage a hero image that exists in the visuals manifest", () => {
    const missing = STAGES.filter((stage) => !VISUAL_IDS.has(stage.image));
    expect(missing.map((stage) => `${stage.id} → ${stage.image}`)).toEqual([]);
  });

  it("names the image after the stage", () => {
    expect(STAGES.map((stage) => stage.image)).toEqual([
      "stage-start",
      "stage-get-hired",
      "stage-deliver",
      "stage-level-up",
      "stage-own",
    ]);
  });

  it("only names diagrams that the DIAGRAMS map can render", () => {
    const bad = STAGES.filter((stage) => stage.diagram && !DIAGRAM_IDS.has(stage.diagram));
    expect(bad.map((stage) => `${stage.id} → ${stage.diagram}`)).toEqual([]);
  });

  it("puts the funnel on Get Hired and the timeline on Deliver, and nothing elsewhere", () => {
    expect(STAGES.map((stage) => stage.diagram ?? null)).toEqual([
      null,
      "hiring-funnel",
      "first-week-timeline",
      null,
      null,
    ]);
  });

  it("links every doFirst step to a page the library describes", () => {
    const bad = STAGES.flatMap((stage) =>
      stage.doFirst
        .filter((item) => !routeDesc(item.href.split(/[?#]/)[0]))
        .map((item) => `${stage.id} → ${item.href}`),
    );
    expect(bad).toEqual([]);
  });

  it("keeps every tool off the doFirst list, so the 'Also useful' line never repeats a step", () => {
    const bad = STAGES.flatMap((stage) => {
      const steps = new Set(stage.doFirst.map((item) => item.href.split(/[?#]/)[0]));
      return stage.tools
        .filter((tool) => steps.has(tool.href.split(/[?#]/)[0]) || !routeDesc(tool.href.split(/[?#]/)[0]))
        .map((tool) => `${stage.id} → ${tool.href}`);
    });
    expect(bad).toEqual([]);
  });

  it("cuts Start Right to the four pages a beginner needs, with the other two as tools", () => {
    const start = getStage("start");
    expect(start?.doFirst.map((item) => item.href)).toEqual(["/equipment", "/tasks", "/build?lab=resume", "/niches"]);
    expect(start?.tools.map((tool) => tool.href)).toEqual(["/learn", "/tools"]);
  });

  it("covers all eleven roadmap steps across the five stages", () => {
    const covered = roadmap.steps.filter((step) =>
      STAGES.some((stage) => stage.num === step.stage),
    );
    expect(covered).toHaveLength(roadmap.steps.length);
  });

  it("looks a stage up by id and returns undefined for a bad one", () => {
    expect(getStage("deliver")?.title).toBe("Deliver");
    expect(getStage("nope")).toBeUndefined();
  });
});
