/**
 * Static diagrams, authored with the `diagram-design` plugin under the
 * `hirefromph` profile. The HTML source of truth for each lives in
 * design/diagrams/<id>.html; see design/diagrams/README.md.
 *
 * Every component is a server component and draws no accessible name of its
 * own — wrap it in `DiagramFrame`, which supplies the title, the caption, and
 * the horizontal scroll container.
 */
import type { ComponentType } from "react";

import { FirstWeekTimeline } from "./first-week-timeline";
import { HiringFunnel } from "./hiring-funnel";
import { JourneyMap } from "./journey-map";
import { MethodLoop } from "./method-loop";
import type { DiagramProps } from "./types";

export { FirstWeekTimeline, HiringFunnel, JourneyMap, MethodLoop };
export type { DiagramProps };

export const DIAGRAMS = {
  "journey-map": JourneyMap,
  "method-loop": MethodLoop,
  "hiring-funnel": HiringFunnel,
  "first-week-timeline": FirstWeekTimeline,
} satisfies Record<string, ComponentType<DiagramProps>>;

export type DiagramId = keyof typeof DIAGRAMS;
