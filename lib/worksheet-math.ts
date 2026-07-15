/* ------------------------------------------------------------------ */
/*  WORKSHEET MATH                                                     */
/*  Turn a pile of live job posts into a defensible rate range.        */
/*  Normalize every post to ₱/month, then read the spread. Pure, no    */
/*  React. The point is the method: price from evidence, not a guess.  */
/* ------------------------------------------------------------------ */

import { WEEKS } from "@/lib/rate-math";

// Full-time baseline used to normalize hourly posts to a monthly figure.
export const FT_HOURS_PER_WEEK = 40;

export type RateUnit = "php_month" | "php_fortnight" | "php_hour" | "usd_hour";

export type Post = {
  id: string;
  role: string;
  amount: number; // as stated in the post; 0 = rate not disclosed
  unit: RateUnit;
  source?: string; // where it came from (URL or board name)
};

export type Spread = {
  n: number; // posts that had a usable rate
  low: number;
  median: number;
  high: number;
};

/** One post → ₱/month, or null if the rate is missing/invalid (a post that
 * hides its number can't price you — that's the site's whole thesis). */
export function toMonthlyPhp(amount: number, unit: RateUnit, fx: number): number | null {
  if (!(amount > 0)) return null;
  switch (unit) {
    case "php_month":
      return amount;
    case "php_fortnight":
      return amount * (26 / 12); // 26 fortnights a year, spread over 12 months
    case "php_hour":
      return amount * FT_HOURS_PER_WEEK * WEEKS;
    case "usd_hour":
      return amount * fx * FT_HOURS_PER_WEEK * WEEKS;
  }
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Aggregate posts into low / median / high ₱/month. Posts with no rate drop out. */
export function spreadFromPosts(posts: Post[], fx: number): Spread | null {
  const values = posts
    .map((p) => toMonthlyPhp(p.amount, p.unit, fx))
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  if (values.length === 0) return null;
  return {
    n: values.length,
    low: values[0],
    median: Math.round(median(values)),
    high: values[values.length - 1],
  };
}
