import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * Your first week, day by day.
 *
 * Source of truth: design/diagrams/first-week-timeline.html (diagram-design
 * plugin, profile `hirefromph`). Content from the `first-week` scenario in
 * data/scenarios.json and the `first-week-plan` lab in data/labs.json.
 *
 * The five days are equally spaced because the intervals really are equal.
 *
 * Accent budget: one element — day 1, the day the whole week turns on.
 */

type Day = { n: number; cx: number; lines: [string, string] };

const DAYS: Day[] = [
  { n: 1, cx: 96, lines: ["Send your recap", "in your own words"] },
  { n: 2, cx: 228, lines: ["Start a dated log", "of what you touched"] },
  { n: 3, cx: 360, lines: ["Turn repeat steps", "into one SOP"] },
  { n: 4, cx: 492, lines: ["Time-box, then ask", "with what you tried"] },
  { n: 5, cx: 624, lines: ["Send the update", "before it is asked for"] },
];

export function FirstWeekTimeline({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 720 176"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      {/* Baseline, drawn before the markers. */}
      <line x1="32" y1="96" x2="688" y2="96" stroke="var(--line-strong)" strokeWidth="1" />

      {/* Hairline drop from each day label to its marker. */}
      <g stroke="var(--line)" strokeWidth="1">
        {DAYS.map((day) => (
          <line key={`drop-${day.n}`} x1={day.cx} y1="48" x2={day.cx} y2="88" />
        ))}
      </g>

      {/* Day labels. Day 1 carries the accent. */}
      <g
        fontFamily={INTER}
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.8"
        textAnchor="middle"
      >
        {DAYS.map((day) => (
          <text
            key={`label-${day.n}`}
            x={day.cx}
            y="40"
            fill={day.n === 1 ? "var(--primary)" : "var(--ink-faint)"}
          >
            {`DAY ${day.n}`}
          </text>
        ))}
      </g>

      {/* Markers. */}
      {DAYS.map((day) => (
        <circle
          key={`dot-${day.n}`}
          cx={day.cx}
          cy="96"
          r={day.n === 1 ? "8" : "6"}
          fill={day.n === 1 ? "var(--primary)" : "var(--ink)"}
        />
      ))}

      {/* Checkpoints. */}
      <g
        fill="var(--ink-soft)"
        fontFamily={INTER}
        fontSize="10"
        fontWeight="500"
        textAnchor="middle"
      >
        {DAYS.map((day) => (
          <g key={`text-${day.n}`}>
            <text x={day.cx} y="124">
              {day.lines[0]}
            </text>
            <text x={day.cx} y="140">
              {day.lines[1]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
