/**
 * Shared props for every static diagram component.
 *
 * `current` is only meaningful for the journey map, where it highlights the
 * stage the reader is on. The other diagrams accept it so the `DIAGRAMS` map
 * stays uniformly typed, and ignore it.
 *
 * Diagrams never set `role`, `<title>`, or `aria-hidden`: the page's
 * `DiagramFrame` supplies the accessible name and the scroll container.
 */
export type DiagramProps = {
  /** 1-based stage number to highlight. Journey map only. Default: none. */
  current?: number;
  className?: string;
};

/** Minimum rendered width, in px. Below this the frame scrolls horizontally. */
export const DIAGRAM_MIN_WIDTH = 560;

export const INTER = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
export const CABINET =
  "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
