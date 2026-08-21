import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * The method — seven ways to get unstuck, with the loop back to ASK.
 *
 * Source of truth: design/diagrams/method-loop.html (diagram-design plugin,
 * profile `hirefromph`). Content from data/doctrine.json (`methods`); the
 * return arrow's label is UNSTICK step 5, "Time-box, then ask well".
 *
 * Accent budget: one element — GIVE. Every connector stays muted; the return
 * arrow is dashed because it is a return, not a step.
 */

type Node = { id: string; name: string; sub: string; x: number; y: number };

const NODE_W = 112;
const NODE_H = 48;

const NODES: Node[] = [
  { id: "find", name: "FIND", sub: "any answer", x: 32, y: 32 },
  { id: "deconstruct", name: "DECONSTRUCT", sub: "from 5 examples", x: 208, y: 32 },
  { id: "learn", name: "LEARN", sub: "by building", x: 384, y: 32 },
  { id: "vet", name: "VET", sub: "who benefits?", x: 560, y: 32 },
  { id: "ask", name: "ASK", sub: "four parts", x: 472, y: 140 },
  { id: "unstick", name: "UNSTICK", sub: "a procedure", x: 296, y: 140 },
  { id: "give", name: "GIVE", sub: "value first", x: 120, y: 140 },
];

const FOCAL = "give";

export function MethodLoop({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 704 248"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id="hfph-method-loop-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--ink-soft)" />
        </marker>
        <marker
          id="hfph-method-loop-arrow-sm"
          markerWidth="6"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 6 2.5, 0 5" fill="var(--ink-faint)" />
        </marker>
      </defs>

      {/* Connectors first, so nodes paint over the line ends. */}
      <g stroke="var(--ink-soft)" strokeWidth="1" markerEnd="url(#hfph-method-loop-arrow)">
        <line x1="144" y1="56" x2="204" y2="56" />
        <line x1="320" y1="56" x2="380" y2="56" />
        <line x1="496" y1="56" x2="556" y2="56" />
        {/* VET → ASK: out right, down the outer corridor, back in from the right. */}
        <path d="M 672,56 H 680 Q 688,56 688,64 V 156 Q 688,164 680,164 H 588" fill="none" />
        <line x1="472" y1="164" x2="412" y2="164" />
        <line x1="296" y1="164" x2="236" y2="164" />
      </g>

      {/* UNSTICK → ASK: the return loop. Dashed, and routed clear of the row. */}
      <path
        d="M 352,188 V 208 Q 352,216 360,216 H 520 Q 528,216 528,208 V 192"
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth="1"
        strokeDasharray="5,4"
        markerEnd="url(#hfph-method-loop-arrow-sm)"
      />
      <rect x="384" y="192" width="112" height="16" rx="4" fill="var(--paper)" />
      <text
        x="440"
        y="204"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="10"
        fontWeight="500"
        letterSpacing="0.6"
        textAnchor="middle"
      >
        time-box, then ask
      </text>

      {/* Nodes. */}
      {NODES.map((node) => {
        const focal = node.id === FOCAL;
        return (
          <rect
            key={`box-${node.id}`}
            x={node.x}
            y={node.y}
            width={NODE_W}
            height={NODE_H}
            rx="8"
            fill={focal ? "var(--primary-tint)" : "var(--paper)"}
            stroke={focal ? "var(--primary)" : "var(--line-strong)"}
            strokeWidth={focal ? "1.2" : "1"}
          />
        );
      })}

      <g fontFamily={INTER} textAnchor="middle">
        <g fill="var(--ink)" fontSize="12" fontWeight="600">
          {NODES.map((node) => (
            <text key={`name-${node.id}`} x={node.x + NODE_W / 2} y={node.y + 20}>
              {node.name}
            </text>
          ))}
        </g>
        <g fill="var(--ink-soft)" fontSize="10" fontWeight="500">
          {NODES.map((node) => (
            <text key={`sub-${node.id}`} x={node.x + NODE_W / 2} y={node.y + 36}>
              {node.sub}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}
