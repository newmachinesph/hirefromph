/**
 * The only maths in the chart layer. Pure, dependency-free, unit-tested —
 * every SVG primitive in components/diagrams/charts/ takes its geometry from
 * these two functions, so a chart can never invent its own scale.
 */

export type Scale = (value: number) => number;

/**
 * A linear map from a data domain onto a pixel range. Deliberately does not
 * clamp: a point outside the domain draws outside the plot area, which is
 * visible and therefore fixable, where a silent clamp is a lie about the data.
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  const factor = (r1 - r0) / span;
  return (value: number) => r0 + (value - d0) * factor;
}

const STEPS = [1, 2, 2.5, 5, 10] as const;

/**
 * Round axis ticks that bracket [min, max]. `count` is a target, not a
 * guarantee: the step is snapped to 1 / 2 / 2.5 / 5 / 10 times a power of ten,
 * so every label reads as a number a person would say out loud.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const rough = (hi - lo) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step = (STEPS.find((s) => normalised <= s) ?? 10) * magnitude;

  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;

  const ticks: number[] = [];
  // Accumulate from `start` by index rather than by repeated addition:
  // floating-point drift over twenty steps prints "0.30000000000000004".
  for (let i = 0; i <= 1000; i += 1) {
    const value = Number((start + i * step).toPrecision(12));
    ticks.push(value);
    if (value >= end - step / 1e6) break;
  }
  return ticks;
}
