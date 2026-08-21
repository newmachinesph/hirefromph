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

  it("gives every stage four tools the library can describe", () => {
    const bad = STAGES.flatMap((stage) =>
      stage.tools.length === 4
        ? stage.tools.filter((tool) => !routeDesc(tool.href)).map((tool) => tool.href)
        : [`${stage.id} has ${stage.tools.length} tools`],
    );
    expect(bad).toEqual([]);
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
