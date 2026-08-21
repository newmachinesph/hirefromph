import { CABINET, DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * The path — five stages, eleven steps.
 *
 * Source of truth: design/diagrams/journey-map.html (diagram-design plugin,
 * profile `hirefromph`). Content from data/stages.json + data/roadmap.json.
 *
 * Accent budget: two elements max — stage 1 (the entry point) and, when
 * `current` is set, the stage the reader is on plus its "you are here" tag.
 */

type Stage = {
  num: number;
  cx: number;
  title: string;
  steps: string;
  rail: [number, number];
  ticks: { x: number; n: string }[];
};

const STAGES: Stage[] = [
  {
    num: 1,
    cx: 88,
    title: "Start Right",
    steps: "Steps 1–2",
    rail: [40, 136],
    ticks: [
      { x: 72, n: "1" },
      { x: 104, n: "2" },
    ],
  },
  {
    num: 2,
    cx: 224,
    title: "Get Hired",
    steps: "Steps 3–5",
    rail: [176, 272],
    ticks: [
      { x: 200, n: "3" },
      { x: 224, n: "4" },
      { x: 248, n: "5" },
    ],
  },
  {
    num: 3,
    cx: 360,
    title: "Deliver",
    steps: "Steps 6–8",
    rail: [312, 408],
    ticks: [
      { x: 336, n: "6" },
      { x: 360, n: "7" },
      { x: 384, n: "8" },
    ],
  },
  {
    num: 4,
    cx: 496,
    title: "Level Up",
    steps: "Step 9",
    rail: [448, 544],
    ticks: [{ x: 496, n: "9" }],
  },
  {
    num: 5,
    cx: 632,
    title: "Own",
    steps: "Steps 10–11",
    rail: [584, 680],
    ticks: [
      { x: 616, n: "10" },
      { x: 648, n: "11" },
    ],
  },
];

export function JourneyMap({ current, className }: DiagramProps) {
  const here =
    typeof current === "number" && current >= 1 && current <= STAGES.length
      ? current
      : undefined;

  return (
    <svg
      viewBox="0 0 720 224"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      {/* Spine, drawn before the stage nodes so the line sits behind them. */}
      <line x1="88" y1="72" x2="632" y2="72" stroke="var(--line-strong)" strokeWidth="1" />

      {/* One rail segment per stage: the segment is what groups its steps. */}
      {STAGES.map((stage) => (
        <line
          key={`rail-${stage.num}`}
          x1={stage.rail[0]}
          y1="168"
          x2={stage.rail[1]}
          y2="168"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}

      {/* Step ticks. */}
      <g stroke="var(--line-strong)" strokeWidth="1">
        {STAGES.flatMap((stage) =>
          stage.ticks.map((tick) => (
            <line key={`tick-${tick.n}`} x1={tick.x} y1="168" x2={tick.x} y2="180" />
          )),
        )}
      </g>

      {/* Step numbers. */}
      <g
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="10"
        fontWeight="500"
        textAnchor="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {STAGES.flatMap((stage) =>
          stage.ticks.map((tick) => (
            <text key={`n-${tick.n}`} x={tick.x} y="196">
              {tick.n}
            </text>
          )),
        )}
      </g>

      {/* Stage markers. Stage 1 and the current stage carry the accent. */}
      {STAGES.map((stage) => {
        const focal = stage.num === 1 || stage.num === here;
        return (
          <g key={`stage-${stage.num}`}>
            <circle
              cx={stage.cx}
              cy="72"
              r="20"
              fill={focal ? "var(--primary-tint)" : "var(--paper)"}
              stroke={focal ? "var(--primary)" : "var(--line-strong)"}
              strokeWidth={focal ? "1.2" : "1"}
            />
            <text
              x={stage.cx}
              y="78"
              fill={focal ? "var(--primary)" : "var(--ink)"}
              fontFamily={CABINET}
              fontSize="16"
              fontWeight="700"
              textAnchor="middle"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {stage.num}
            </text>
          </g>
        );
      })}

      {/* "You are here" tag — part of the current-stage focal element. */}
      {here !== undefined ? (
        <g>
          <text
            x={STAGES[here - 1].cx}
            y="40"
            fill="var(--primary)"
            fontFamily={INTER}
            fontSize="10"
            fontWeight="600"
            letterSpacing="1.8"
            textAnchor="middle"
          >
            YOU ARE HERE
          </text>
          <line
            x1={STAGES[here - 1].cx}
            y1="44"
            x2={STAGES[here - 1].cx}
            y2="52"
            stroke="var(--primary)"
            strokeWidth="1"
          />
        </g>
      ) : null}

      {/* Stage names and step ranges. */}
      <g
        fill="var(--ink)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="600"
        textAnchor="middle"
      >
        {STAGES.map((stage) => (
          <text key={`title-${stage.num}`} x={stage.cx} y="120">
            {stage.title}
          </text>
        ))}
      </g>
      <g
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="10"
        fontWeight="500"
        textAnchor="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {STAGES.map((stage) => (
          <text key={`steps-${stage.num}`} x={stage.cx} y="136">
            {stage.steps}
          </text>
        ))}
      </g>
    </svg>
  );
}
