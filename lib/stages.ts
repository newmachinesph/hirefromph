import stagesData from "@/data/stages.json";

export type StageDoFirst = { title: string; desc: string; href: string; cta: string };
/**
 * A page that belongs to the stage without being one of its steps. Never a
 * route that `doFirst` already links: the stage page prints these as one
 * "Also useful" line under the steps, and a repeat there is noise.
 */
export type StageTool = { label: string; href: string };

/**
 * One stage of the path. `image` is an id in data/visuals.json; `diagram` is a
 * key of DIAGRAMS in components/diagrams — only the stages whose story is
 * better told as a picture carry one (spec §7.2: a diagram earns its place).
 *
 * The type exists because a raw `import stages from "@/data/stages.json"` gives
 * a union of five object shapes, and only two of them have `diagram` — so the
 * property is unreachable without this door.
 */
export type Stage = {
  id: string;
  num: number;
  role: string;
  title: string;
  href: string;
  steps: string;
  accent: string;
  image: string;
  diagram?: string;
  kicker: string;
  subtitle: string;
  summary: string;
  quote: string;
  outcome: string;
  doFirst: StageDoFirst[];
  tools: StageTool[];
  closing: string;
};

export const STAGES: Stage[] = stagesData;
export const TOTAL_STAGES = STAGES.length;

export function getStage(id: string): Stage | undefined {
  return STAGES.find((stage) => stage.id === id);
}
