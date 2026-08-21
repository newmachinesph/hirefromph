import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * What each stage of the hunt needs.
 *
 * Source of truth: design/diagrams/hiring-funnel.html (diagram-design plugin,
 * profile `hirefromph`). Content from data/stages.json (`get-hired.doFirst`),
 * data/apply.json and data/interview.json.
 *
 * No counts, no rates, no invented numbers: each band is labelled with what it
 * needs. The widths are ordinal — they show the order of the drop-off, not a
 * measured conversion, and the footnote in the diagram says so.
 *
 * Accent budget: one element — the Offers band at the narrow end.
 */

type Band = { id: string; name: string; needs: string; points: string; top: number };

const BANDS: Band[] = [
  {
    id: "applications",
    name: "Applications",
    needs: "proof, not promises",
    points: "60,32 500,32 468,88 92,88",
    top: 32,
  },
  {
    id: "replies",
    name: "Replies",
    needs: "a tracked follow-up",
    points: "92,88 468,88 436,144 124,144",
    top: 88,
  },
  {
    id: "interviews",
    name: "Interviews",
    needs: "STAR answers + questions for them",
    points: "124,144 436,144 404,200 156,200",
    top: 144,
  },
  {
    id: "offers",
    name: "Offers",
    needs: "negotiate with evidence",
    points: "156,200 404,200 372,256 188,256",
    top: 200,
  },
];

const FOCAL = "offers";

export function HiringFunnel({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 560 288"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      {BANDS.map((band) => {
        const focal = band.id === FOCAL;
        return (
          <polygon
            key={`band-${band.id}`}
            points={band.points}
            fill={focal ? "var(--primary-tint)" : "var(--paper)"}
            stroke={focal ? "var(--primary)" : "var(--line-strong)"}
            strokeWidth={focal ? "1.2" : "1"}
          />
        );
      })}

      <g fontFamily={INTER} textAnchor="middle">
        <g fill="var(--ink)" fontSize="12" fontWeight="600">
          {BANDS.map((band) => (
            <text key={`name-${band.id}`} x="280" y={band.top + 24}>
              {band.name}
            </text>
          ))}
        </g>
        <g fill="var(--ink-soft)" fontSize="10" fontWeight="500">
          {BANDS.map((band) => (
            <text key={`needs-${band.id}`} x="280" y={band.top + 40}>
              {band.needs}
            </text>
          ))}
        </g>
      </g>

      <text
        x="32"
        y="280"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        The widths show the shape of the drop-off, not measured rates.
      </text>
    </svg>
  );
}
