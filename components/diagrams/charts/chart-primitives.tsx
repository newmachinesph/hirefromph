/**
 * Chart primitives — spec §7.2.
 *
 * Small React SVG components that take the data a page already computed and
 * draw it in the `hirefromph` diagram-design style: hairline axes, no shadows,
 * bordered not filled, at most one accent, radius <= 8px, tabular figures on
 * every number. Geometry comes from lib/chart-scale.ts; nothing here does its
 * own arithmetic on the domain.
 *
 * These are server components. They draw no accessible name of their own —
 * wrap them in <DiagramFrame>, which supplies the title, the caption and the
 * horizontal scroll container.
 */
import { linearScale, niceTicks, type Scale } from "@/lib/chart-scale";
import { cn } from "@/lib/utils";
import { INTER } from "../types";

const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

const TONE_FILL = {
  ink: "var(--ink)",
  muted: "var(--ink-soft)",
  faint: "var(--ink-faint)",
  accent: "var(--primary)",
} as const;

/* ------------------------------------------------------------------ */
/*  ValueLabel                                                         */
/* ------------------------------------------------------------------ */

export type ValueLabelProps = {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: keyof typeof TONE_FILL;
  size?: number;
  weight?: number;
  /** Paint an opaque paper rect behind the text (the plugin's masked-label rule). */
  maskWidth?: number;
};

export function ValueLabel({
  x,
  y,
  children,
  anchor = "start",
  tone = "muted",
  size = 11,
  weight = 600,
  maskWidth,
}: ValueLabelProps) {
  const maskX =
    anchor === "end"
      ? x - (maskWidth ?? 0)
      : anchor === "middle"
        ? x - (maskWidth ?? 0) / 2
        : x;
  return (
    <>
      {maskWidth ? (
        <rect
          x={maskX - 4}
          y={y - size}
          width={maskWidth + 8}
          height={size + 6}
          fill="var(--paper)"
        />
      ) : null}
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fill={TONE_FILL[tone]}
        fontFamily={INTER}
        fontSize={size}
        fontWeight={weight}
        style={TABULAR}
      >
        {children}
      </text>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Axis                                                               */
/* ------------------------------------------------------------------ */

export type AxisProps = {
  orientation: "x" | "y";
  ticks: readonly number[];
  scale: Scale;
  /** Cross-axis extent of the gridlines, in px. */
  from: number;
  to: number;
  /** Where the tick labels sit, in px on the cross axis. */
  labelAt: number;
  format?: (value: number) => string;
  /** This tick draws the solid axis line instead of a faint gridline. */
  baselineAt?: number;
  hideLabels?: boolean;
};

export function Axis({
  orientation,
  ticks,
  scale,
  from,
  to,
  labelAt,
  format = (v) => String(v),
  baselineAt,
  hideLabels = false,
}: AxisProps) {
  return (
    <g>
      {ticks.map((tick) => {
        const p = scale(tick);
        const isBaseline = baselineAt !== undefined && tick === baselineAt;
        return (
          <g key={`tick-${tick}`}>
            <g
              stroke={isBaseline ? "var(--line-strong)" : "var(--line)"}
              strokeWidth={isBaseline ? 1 : 0.8}
            >
              {orientation === "x" ? (
                <line x1={p} x2={p} y1={from} y2={to} />
              ) : (
                <line x1={from} x2={to} y1={p} y2={p} />
              )}
            </g>
            {!hideLabels && (
              <ValueLabel
                x={orientation === "x" ? p : labelAt}
                y={orientation === "x" ? labelAt : p + 4}
                anchor={orientation === "x" ? "middle" : "end"}
                tone="faint"
                size={10}
                weight={500}
              >
                {format(tick)}
              </ValueLabel>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Bars — horizontal, optional diverging, optional second series      */
/* ------------------------------------------------------------------ */

export type BarDatum = {
  id: string;
  label: string;
  value: number;
  /** A short qualifier under the row label. */
  note?: string;
  /** The one accented row. At most one datum in a chart should set this. */
  focal?: boolean;
  /** A second, muted bar on the same row (two-state comparison). */
  compare?: number;
};

export type BarsProps = {
  data: readonly BarDatum[];
  /** Value-axis ceiling. Defaults to the largest magnitude in the data. */
  max?: number;
  /** Zero sits in the middle; negatives run left. */
  diverging?: boolean;
  format?: (value: number) => string;
  /** A dashed reference line, e.g. a global average. */
  reference?: { value: number; label: string };
  seriesLabel?: string;
  compareLabel?: string;
  labelWidth?: number;
  width?: number;
  rowHeight?: number;
  className?: string;
};

export function Bars({
  data,
  max,
  diverging = false,
  format = (v) => String(v),
  reference,
  seriesLabel,
  compareLabel,
  labelWidth = 232,
  width = 720,
  rowHeight = 40,
  className,
}: BarsProps) {
  const valueColumn = 64;
  const plotLeft = labelWidth;
  const plotRight = width - valueColumn;
  const top = 28;
  const axisBottom = top + data.length * rowHeight + 8;
  const height = axisBottom + 44;

  const magnitudes = data.flatMap((d) =>
    d.compare === undefined
      ? [Math.abs(d.value)]
      : [Math.abs(d.value), Math.abs(d.compare)],
  );
  const ceiling = max ?? Math.max(1, ...magnitudes);
  const domain: [number, number] = diverging ? [-ceiling, ceiling] : [0, ceiling];
  const x = linearScale(domain, [plotLeft, plotRight]);
  const zero = x(diverging ? 0 : domain[0]);
  const ticks = niceTicks(domain[0], domain[1], 4);
  const barHeight = Math.min(14, rowHeight / 2 - 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: 560, height: "auto", display: "block" }}
    >
      <Axis
        orientation="x"
        ticks={ticks}
        scale={x}
        from={top - 8}
        to={axisBottom}
        labelAt={axisBottom + 18}
        format={format}
        baselineAt={diverging ? 0 : domain[0]}
      />

      {reference && (
        <g>
          <line
            x1={x(reference.value)}
            x2={x(reference.value)}
            y1={top - 8}
            y2={axisBottom}
            stroke="var(--ink-faint)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <ValueLabel
            x={x(reference.value)}
            y={top - 12}
            anchor="middle"
            tone="faint"
            size={10}
            weight={500}
            maskWidth={reference.label.length * 5.4}
          >
            {reference.label}
          </ValueLabel>
        </g>
      )}

      {data.map((d, index) => {
        const rowTop = top + index * rowHeight;
        const centre = rowTop + rowHeight / 2;
        const hasCompare = d.compare !== undefined;
        const primaryY = hasCompare ? centre - barHeight - 2 : centre - barHeight / 2;
        const start = Math.min(zero, x(d.value));
        const barWidth = Math.max(Math.abs(x(d.value) - zero), 1);
        const accented = d.focal === true;

        return (
          <g key={d.id}>
            <text
              x={labelWidth - 16}
              y={hasCompare ? centre - 2 : centre + 4}
              textAnchor="end"
              fill="var(--ink)"
              fontFamily={INTER}
              fontSize={12}
              fontWeight={600}
            >
              {d.label}
            </text>
            {d.note && (
              <text
                x={labelWidth - 16}
                y={hasCompare ? centre + 12 : centre + 18}
                textAnchor="end"
                fill="var(--ink-faint)"
                fontFamily={INTER}
                fontSize={10}
                fontWeight={500}
              >
                {d.note}
              </text>
            )}

            <rect
              x={start}
              y={primaryY}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={accented ? "var(--primary-tint)" : "var(--paper)"}
              stroke={accented ? "var(--primary)" : "var(--line-strong)"}
              strokeWidth={accented ? 1.2 : 1}
            />

            {hasCompare && (
              <rect
                x={Math.min(zero, x(d.compare as number))}
                y={centre + 2}
                width={Math.max(Math.abs(x(d.compare as number) - zero), 1)}
                height={barHeight}
                rx={4}
                fill="var(--band)"
                stroke="var(--line-strong)"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
            )}

            <ValueLabel
              x={width - 12}
              y={hasCompare ? centre - 2 : centre + 4}
              anchor="end"
              tone={accented ? "accent" : "ink"}
              size={11}
            >
              {format(d.value)}
            </ValueLabel>
            {hasCompare && (
              <ValueLabel x={width - 12} y={centre + 16} anchor="end" tone="faint" size={10}>
                {format(d.compare as number)}
              </ValueLabel>
            )}
          </g>
        );
      })}

      {(seriesLabel || compareLabel) && (
        <text
          x={plotLeft}
          y={height - 6}
          fill="var(--ink-faint)"
          fontFamily={INTER}
          fontSize={10}
          fontWeight={500}
        >
          {[seriesLabel, compareLabel].filter(Boolean).join("  ·  ")}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Line — multi-series                                                */
/* ------------------------------------------------------------------ */

export type LineSeries = {
  id: string;
  label: string;
  points: readonly { x: number; y: number }[];
  /** The one accented series. */
  focal?: boolean;
  dashed?: boolean;
};

export type LineProps = {
  series: readonly LineSeries[];
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTickCount?: number;
  yTickCount?: number;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  xTitle?: string;
  /**
   * A shaded region under one series, expressed as a fraction of its y values
   * (0.31 -> "down to 31% below this line"). Used for the simulator's
   * non-payment risk band, which is a warning, not a projection.
   */
  band?: { seriesId: string; drop: number };
  width?: number;
  height?: number;
  className?: string;
};

export function Line({
  series,
  xDomain,
  yDomain,
  xTickCount = 6,
  yTickCount = 4,
  formatX = (v) => String(v),
  formatY = (v) => String(v),
  xTitle,
  band,
  width = 780,
  height = 320,
  className,
}: LineProps) {
  const pad = { left: 64, right: 20, top: 20, bottom: 44 };
  const x = linearScale(xDomain, [pad.left, width - pad.right]);
  const y = linearScale(yDomain, [height - pad.bottom, pad.top]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], xTickCount);
  const yTicks = niceTicks(yDomain[0], yDomain[1], yTickCount);

  const path = (points: readonly { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x)},${y(p.y)}`).join(" ");

  const banded = band ? series.find((s) => s.id === band.seriesId) : undefined;
  const drop = band?.drop ?? 0;
  const bandPath =
    banded && banded.points.length > 0
      ? [
          ...banded.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x)},${y(p.y)}`),
          ...[...banded.points].reverse().map((p) => `L${x(p.x)},${y(p.y * (1 - drop))}`),
          "Z",
        ].join(" ")
      : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ minWidth: 560, height: "auto", display: "block" }}
    >
      <Axis
        orientation="y"
        ticks={yTicks}
        scale={y}
        from={pad.left}
        to={width - pad.right}
        labelAt={pad.left - 10}
        format={formatY}
        baselineAt={yDomain[0]}
      />
      <Axis
        orientation="x"
        ticks={xTicks}
        scale={x}
        from={pad.top}
        to={height - pad.bottom}
        labelAt={height - pad.bottom + 20}
        format={formatX}
      />

      {bandPath && <path d={bandPath} fill="var(--primary)" opacity={0.1} />}

      {series.map((s) => (
        <path
          key={s.id}
          d={path(s.points)}
          fill="none"
          stroke={s.focal ? "var(--primary)" : "var(--ink-faint)"}
          strokeWidth={s.focal ? 2 : 1.2}
          strokeDasharray={s.dashed ? "7 4" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {series
        .filter((s) => s.focal && s.points.length > 0)
        .map((s) => {
          const last = s.points[s.points.length - 1];
          return (
            <circle key={`${s.id}-end`} cx={x(last.x)} cy={y(last.y)} r={4} fill="var(--primary)" />
          );
        })}

      {xTitle && (
        <text
          x={(pad.left + width - pad.right) / 2}
          y={height - 6}
          textAnchor="middle"
          fill="var(--ink-faint)"
          fontFamily={INTER}
          fontSize={10}
          fontWeight={600}
          letterSpacing="0.12em"
        >
          {xTitle.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Legend — HTML, so the labels stay selectable text                  */
/* ------------------------------------------------------------------ */

export type LegendItem = {
  id: string;
  label: string;
  kind: "line" | "dashed" | "swatch" | "band";
  focal?: boolean;
};

export function Legend({
  items,
  className,
}: {
  items: readonly LegendItem[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2 text-caption text-ink-soft", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span aria-hidden className="inline-flex h-3 w-6 shrink-0 items-center">
            {item.kind === "swatch" || item.kind === "band" ? (
              <span
                className={cn(
                  "block h-3 w-6 rounded-sm border",
                  item.kind === "band"
                    ? "border-primary/30 bg-primary/10"
                    : item.focal
                      ? "border-primary bg-primary-tint"
                      : "border-line-strong bg-paper",
                )}
              />
            ) : (
              <svg width="24" height="8" aria-hidden>
                <line
                  x1="0"
                  y1="4"
                  x2="24"
                  y2="4"
                  stroke={item.focal ? "var(--primary)" : "var(--ink-faint)"}
                  strokeWidth={item.focal ? 2 : 1.2}
                  strokeDasharray={item.kind === "dashed" ? "7 4" : undefined}
                />
              </svg>
            )}
          </span>
          <span className={item.focal ? "font-medium text-ink" : undefined}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
