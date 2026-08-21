/* ------------------------------------------------------------------ */
/*  RATE MATH                                                          */
/*  Pure hourly → monthly → take-home math. Extracted from            */
/*  rate-calculator.tsx so it can be tested in isolation. No React,   */
/*  no formatting.                                                     */
/* ------------------------------------------------------------------ */

export type RateInputs = {
  rate: number; // $/hr billed
  hours: number; // billable hours/week
  fee: number; // platform fee %
  unpaid: number; // unpaid time %
  costs: number; // ₱/mo internet, power, tools
  tax: number; // %
  fx: number; // ₱ per $1
};

export type RateResult = {
  grossMonthlyUsd: number;
  afterFeeUsd: number;
  grossPhp: number;
  afterCostsPhp: number;
  taxPhp: number;
  netPhp: number;
  totalHoursMonthly: number;
  effHourlyPhp: number;
  effHourlyUsd: number;
  shrink: number;
};

export const WEEKS = 4.33;

/** Turn a billed rate into what actually lands in your pocket per real hour worked. */
export function computeRate({
  rate,
  hours,
  fee,
  unpaid,
  costs,
  tax,
  fx,
}: RateInputs): RateResult {
  const grossMonthlyUsd = rate * hours * WEEKS;
  const afterFeeUsd = grossMonthlyUsd * (1 - fee / 100);
  const grossPhp = afterFeeUsd * fx;
  const afterCostsPhp = grossPhp - costs;
  const taxPhp = Math.max(0, afterCostsPhp) * (tax / 100);
  const netPhp = afterCostsPhp - taxPhp;

  const totalHoursMonthly = hours * (1 + unpaid / 100) * WEEKS;
  const effHourlyPhp = totalHoursMonthly > 0 ? netPhp / totalHoursMonthly : 0;
  const effHourlyUsd = effHourlyPhp / fx;
  const shrink =
    rate > 0 ? Math.max(0, Math.round((1 - effHourlyUsd / rate) * 100)) : 0;

  return {
    grossMonthlyUsd,
    afterFeeUsd,
    grossPhp,
    afterCostsPhp,
    taxPhp,
    netPhp,
    totalHoursMonthly,
    effHourlyPhp,
    effHourlyUsd,
    shrink,
  };
}

/**
 * Turn "share of all working time that is unpaid" (how the ILO reports it:
 * ~20 unpaid minutes per paid hour, so about a quarter of the time you work)
 * into the add-on over billed hours that `computeRate` takes. 25% of all time
 * unpaid means you work 100/75 of your billed hours, i.e. 33⅓% on top.
 * Shares are clamped to [0, 99] so a slider can never divide by zero.
 */
export function unpaidShareToAddon(sharePct: number): number {
  const share = Math.min(99, Math.max(0, sharePct));
  return (share / (100 - share)) * 100;
}
