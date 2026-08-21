import learning from "@/data/learning.json";
import { DIAGRAM_MIN_WIDTH, INTER, type DiagramProps } from "./types";

/**
 * What review does to what you remember.
 *
 * Source of truth: design/diagrams/forgetting-curve.html (diagram-design
 * plugin, profile `hirefromph`). Copy and citations from
 * data/learning.json -> forgettingCurve; the page renders those sources with
 * <SourceList> directly under the DiagramFrame.
 *
 * Qualitative on purpose. There is no y scale and no elapsed time on the x
 * axis: the shape of the decay and the effect of a review are the claim, and
 * putting invented percentages on a curve would be exactly the kind of number
 * this site refuses to print. The footnote says so inside the figure.
 *
 * Accent budget: one series — the retrieval line and its review dots.
 */

const { axis, footnote } = learning.forgettingCurve;

const REVIEWS = [271, 410, 549] as const;

export function ForgettingCurve({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 720 320"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: DIAGRAM_MIN_WIDTH, height: "auto", display: "block" }}
    >
      <g stroke="var(--line-strong)" strokeWidth="1">
        <line x1="132" y1="40" x2="132" y2="248" />
        <line x1="132" y1="248" x2="688" y2="248" />
      </g>

      <g stroke="var(--line)" strokeWidth="0.8" strokeDasharray="4 3">
        {REVIEWS.map((x) => (
          <line key={`review-${x}`} x1={x} y1="40" x2={x} y2="248" />
        ))}
      </g>

      <polyline
        points="132,40 271,140 410,196 549,224 688,240"
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth="1.2"
        strokeDasharray="7 4"
        strokeLinejoin="round"
      />

      <polyline
        points="132,40 271,140 271,56 410,120 410,60 549,104 549,56 688,88"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g fill="var(--primary)">
        <circle cx="271" cy="56" r="4" />
        <circle cx="410" cy="60" r="4" />
        <circle cx="549" cy="56" r="4" />
        <circle cx="688" cy="88" r="4" />
      </g>

      <g fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-faint)" textAnchor="end">
        <text x="124" y="44">{axis.top}</text>
        <text x="124" y="252">{axis.bottom}</text>
      </g>
      <g fontFamily={INTER} fontSize="10" fontWeight="500" fill="var(--ink-faint)" textAnchor="middle">
        <text x="132" y="268">learned it</text>
        <text x="271" y="268">review 1</text>
        <text x="410" y="268">review 2</text>
        <text x="549" y="268">review 3</text>
        <text x="688" y="268">review 4</text>
      </g>

      <g fontFamily={INTER} fontSize="11" fontWeight="600">
        <rect x="440" y="70" width="152" height="16" fill="var(--paper)" />
        <text x="444" y="82" fill="var(--primary)">
          with spaced retrieval
        </text>
        <rect x="472" y="212" width="120" height="16" fill="var(--paper)" />
        <text x="476" y="224" fill="var(--ink-faint)">
          without review
        </text>
      </g>

      <text
        x="16"
        y="310"
        fill="var(--ink-faint)"
        fontFamily={INTER}
        fontSize="12"
        fontWeight="500"
        fontStyle="italic"
      >
        {footnote}
      </text>
    </svg>
  );
}
