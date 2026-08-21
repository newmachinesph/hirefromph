import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * Agency or direct: who holds the relationship.
 *
 * Source of truth: design/diagrams/agency-vs-direct.html (diagram-design
 * plugin, profile `hirefromph`). Content from data/clients.json (`roads.agency`
 * pros/cons and `roads.direct` pros/cons).
 *
 * Accent budget: one element — the Direct lane's "You keep" node, which is the
 * whole argument of the page.
 *
 * No numbers: the diagram states who owns each step, which is a structural
 * fact out of the page's own prose, never a rate or a margin.
 */

type Step = { id: string; x: number; agency: [string, string]; direct: [string, string]; column: string };

const STEPS: Step[] = [
  { id: "find", x: 160, column: "FIND", agency: ["Agency finds", "no selling for you"], direct: ["You find", "selling is your job"] },
  { id: "rate", x: 300, column: "SET THE RATE", agency: ["Agency sets", "their rate card"], direct: ["You set", "your price"] },
  { id: "work", x: 440, column: "DO THE WORK", agency: ["You do it", "under their name"], direct: ["You do it", "under your name"] },
  { id: "keep", x: 580, column: "KEEP THE CLIENT", agency: ["Agency keeps", "you cannot take them"], direct: ["You keep", "referrals are yours"] },
];

const FOCAL = "keep";

export function AgencyVsDirect({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 720 288"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id="avd-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--line-strong)" />
        </marker>
      </defs>

      <g fontFamily={INTER} fontSize="10" fontWeight="600" letterSpacing="0.14em" fill="var(--ink-faint)">
        {STEPS.map((step) => (
          <text key={`col-${step.id}`} x={step.x} y="28">
            {step.column}
          </text>
        ))}
      </g>

      <g stroke="var(--line)" strokeWidth="1">
        <line x1="16" y1="56" x2="704" y2="56" />
        <line x1="16" y1="172" x2="704" y2="172" />
        <line x1="16" y1="272" x2="704" y2="272" />
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="600" letterSpacing="0.14em" fill="var(--ink-soft)">
        <text x="16" y="120">AGENCY</text>
        <text x="16" y="232">DIRECT</text>
      </g>

      <g stroke="var(--line-strong)" strokeWidth="1" fill="none" markerEnd="url(#avd-arrow)">
        {STEPS.slice(1).map((step) => (
          <g key={`arrows-${step.id}`}>
            <path d={`M${step.x - 24},116 L${step.x},116`} />
            <path d={`M${step.x - 24},228 L${step.x},228`} />
          </g>
        ))}
      </g>

      {STEPS.map((step) => {
        const focal = step.id === FOCAL;
        return (
          <g key={`node-${step.id}`}>
            <rect x={step.x} y="88" width="116" height="56" rx="8" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
            <rect
              x={step.x}
              y="200"
              width="116"
              height="56"
              rx="8"
              fill={focal ? "var(--primary-tint)" : "var(--paper)"}
              stroke={focal ? "var(--primary)" : "var(--line-strong)"}
              strokeWidth={focal ? "1.2" : "1"}
            />
            <g textAnchor="middle" fontFamily={INTER}>
              <text x={step.x + 58} y="112" fontSize="12" fontWeight="600" fill="var(--ink)">
                {step.agency[0]}
              </text>
              <text x={step.x + 58} y="128" fontSize="10" fontWeight="500" fill="var(--ink-soft)">
                {step.agency[1]}
              </text>
              <text x={step.x + 58} y="224" fontSize="12" fontWeight="600" fill="var(--ink)">
                {step.direct[0]}
              </text>
              <text x={step.x + 58} y="240" fontSize="10" fontWeight="500" fill="var(--ink-soft)">
                {step.direct[1]}
              </text>
            </g>
          </g>
        );
      })}

      <text
        x="16"
        y="284"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        Same four steps. The difference is who owns the last one.
      </text>
    </svg>
  );
}
