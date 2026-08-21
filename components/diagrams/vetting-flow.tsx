import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * Vetting an opportunity, gate by gate.
 *
 * Source of truth: design/diagrams/vetting-flow.html (diagram-design plugin,
 * profile `hirefromph`). Content from data/findwork.json (`vetting.redFlags`,
 * ordered by weight) and data/findwork.json (`research`).
 *
 * Accent budget: one element — the Stop terminal and the rail that feeds it
 * count as one focal group. Every other node is white with a hairline.
 *
 * No numbers anywhere: the gates are the five heaviest red flags, not a score.
 */

type Gate = { id: string; y: number; line1: string; line2: string };

const GATES: Gate[] = [
  { id: "upfront-fees", y: 116, line1: "Any upfront fee,", line2: '"training", "starter kit"?' },
  { id: "guaranteed-income", y: 204, line1: "Guaranteed income", line2: "or guaranteed hiring?" },
  { id: "vague-work", y: 292, line1: "Vague or evasive about", line2: "the day-to-day work?" },
  { id: "urgency", y: 380, line1: "Pressure to decide,", line2: "pay, or sign right now?" },
  { id: "no-footprint", y: 468, line1: "No verifiable footprint,", line2: "no site, no reviews?" },
];

export function VettingFlow({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 640 616"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id="vf-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--line-strong)" />
        </marker>
        <marker
          id="vf-arrow-accent"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)" />
        </marker>
      </defs>

      <g stroke="var(--line-strong)" strokeWidth="1" fill="none" markerEnd="url(#vf-arrow)">
        <path d="M220,56 L220,84" />
        <path d="M220,148 L220,172" />
        <path d="M220,236 L220,260" />
        <path d="M220,324 L220,348" />
        <path d="M220,412 L220,436" />
        <path d="M220,500 L220,528" />
      </g>

      <g stroke="var(--primary)" strokeWidth="1" fill="none">
        {GATES.map((gate) => (
          <path key={`yes-${gate.id}`} d={`M328,${gate.y} L468,${gate.y}`} />
        ))}
        <path d="M468,116 L468,524" markerEnd="url(#vf-arrow-accent)" />
      </g>

      <rect x="120" y="16" width="200" height="40" rx="20" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
      <text x="220" y="41" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="600" fill="var(--ink)">
        An opportunity lands
      </text>

      <g fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1">
        {GATES.map((gate) => (
          <polygon
            key={`gate-${gate.id}`}
            points={`112,${gate.y} 220,${gate.y - 32} 328,${gate.y} 220,${gate.y + 32}`}
          />
        ))}
      </g>
      <g textAnchor="middle" fontFamily={INTER} fontSize="11" fontWeight="600" fill="var(--ink)">
        {GATES.map((gate) => (
          <g key={`label-${gate.id}`}>
            <text x="220" y={gate.y - 3}>{gate.line1}</text>
            <text x="220" y={gate.y + 11}>{gate.line2}</text>
          </g>
        ))}
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="500">
        <g fill="var(--paper)">
          {GATES.map((gate) => (
            <rect key={`mask-${gate.id}`} x="340" y={gate.y - 12} width="26" height="16" />
          ))}
          <rect x="228" y="60" width="24" height="16" />
        </g>
        <g fill="var(--primary)">
          {GATES.map((gate) => (
            <text key={`yes-label-${gate.id}`} x="344" y={gate.y}>
              yes
            </text>
          ))}
        </g>
        <text x="232" y="72" fill="var(--ink-faint)">
          no
        </text>
      </g>

      <rect x="396" y="524" width="144" height="56" rx="8" fill="var(--primary-tint)" stroke="var(--primary)" strokeWidth="1.2" />
      <text x="468" y="548" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="700" fill="var(--ink)">
        Stop. Walk away.
      </text>
      <text x="468" y="564" textAnchor="middle" fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-soft)">
        No rate is worth it.
      </text>

      <rect x="104" y="528" width="232" height="48" rx="20" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1" />
      <text x="220" y="548" textAnchor="middle" fontFamily={INTER} fontSize="12" fontWeight="600" fill="var(--ink)">
        Research it, then apply
      </text>
      <text x="220" y="564" textAnchor="middle" fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-soft)">
        A clean checklist is not proof.
      </text>

      <text
        x="16"
        y="606"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        Every downward arrow is a no.
      </text>
    </svg>
  );
}
