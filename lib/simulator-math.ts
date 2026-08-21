/* ------------------------------------------------------------------ */
/*  THE MODEL                                                          */
/*  Pure projection math. Extracted from career-simulator.tsx so it    */
/*  can be tested in isolation. No React, no JSON, no formatting.      */
/*  All prose still lives in data/simulator.json.                      */
/* ------------------------------------------------------------------ */

export type Craft = "none" | "building" | "deep";
export type Ai = "none" | "user" | "augmented";
export type Ownership = "tasks" | "outcomes";
export type Hours = 10 | 20 | 40;
export type Language = "english" | "second";
export type Clients = "local" | "foreign";

export type Config = {
  craft: Craft;
  ai: Ai;
  ownership: Ownership;
  hours: Hours;
  language: Language;
  clients: Clients;
};

/** Base hourly USD, set by CRAFT and by nothing else. That is the thesis. */
export const BASE: Record<Craft, number> = { none: 4, building: 9, deep: 22 };
export const BASE_RANGE: Record<Craft, [number, number]> = {
  none: [3, 7],
  building: [8, 15],
  deep: [18, 35],
};

/** Everyone starts at the bottom of the generalist band. */
export const START_RATE = 3;

/** Months to reach the full base rate. Deep skill is slow. We do not pretend otherwise. */
export const CRAFT_RAMP: Record<Craft, number> = { none: 3, building: 18, deep: 30 };

/**
 * THE MOST IMPORTANT LINE IN THIS FILE.
 * The AI premium is conditional on craft. AI multiplies a craft; it cannot multiply zero.
 * `deep` is the one sourced figure: Upwork's reported +34% per hour for AI work
 * (simulator.json `ai-augmented-deep`). `building` is our interpolation.
 */
export const AI_AUGMENTED: Record<Craft, number> = { none: 1.0, building: 1.15, deep: 1.34 };
export const AI_USER = 1.05;

export const OWNERSHIP_OUTCOMES = 1.25;
export const LANGUAGE_SECOND = 1.2;
export const CLIENTS_LOCAL = 0.45;

/** Premium phase-ins, skill and trust are not granted on day one. */
export const AI_RAMP = 12;
export const OWNERSHIP_RAMP = 18;

/** The reality tax. ILO (2015–2017 surveys): ~20 unpaid minutes per paid hour → you keep about three quarters. */
export const UNPAID_KEEP = 0.75;
/** Fairwork: 31% of cloudworkers have experienced non-payment. Drawn as a band, never deducted. */
export const NON_PAYMENT_RISK = 0.31;

export const WEEKS_PER_MONTH = 4.33;
export const MONTHS = 36;
/**
 * USD to PHP default. BSP reference rate sampled mid-July 2026.
 * The only place this number lives: simulator.json `fx.note` reads it through
 * the `{fx}` and `{sampled}` tokens, so the prose cannot drift from the math.
 */
export const DEFAULT_FX = 61.5;
export const DEFAULT_FX_SAMPLED = "mid-July 2026";

/** Clamped smoothstep, legible easing, not a physics engine. */
export function ease(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** Phase a multiplier in from 1.0 to `target` over `months`. */
export function phaseIn(target: number, months: number, at: number): number {
  return 1 + (target - 1) * ease(at / months);
}

export function aiMultiplier(c: Config): number {
  if (c.ai === "none") return 1;
  if (c.ai === "user") return AI_USER;
  return AI_AUGMENTED[c.craft];
}

export function ownershipMultiplier(c: Config): number {
  return c.ownership === "outcomes" ? OWNERSHIP_OUTCOMES : 1;
}

export function languageMultiplier(c: Config): number {
  return c.language === "second" ? LANGUAGE_SECOND : 1;
}

export function clientsMultiplier(c: Config): number {
  return c.clients === "local" ? CLIENTS_LOCAL : 1;
}

/** Effective hourly at a given month, with every multiplier applied in order. */
export function hourlyAt(c: Config, month: number): number {
  const base =
    START_RATE +
    (BASE[c.craft] - START_RATE) * ease(month / CRAFT_RAMP[c.craft]);
  // "user" is available from day one, everyone already has ChatGPT. "augmented" is built, so it ramps.
  const ai =
    c.ai === "user" ? AI_USER : phaseIn(aiMultiplier(c), AI_RAMP, month);
  const own = phaseIn(ownershipMultiplier(c), OWNERSHIP_RAMP, month);
  return base * ai * own * languageMultiplier(c) * clientsMultiplier(c);
}

/** Monthly USD actually kept, after the unpaid-time tax. */
export function monthlyEffective(c: Config, month: number): number {
  return hourlyAt(c, month) * c.hours * WEEKS_PER_MONTH * UNPAID_KEEP;
}

export function monthlyBilled(c: Config, month: number): number {
  return hourlyAt(c, month) * c.hours * WEEKS_PER_MONTH;
}

/** The comparison line: generic task-taker, same hours, same client market. */
export function baselineOf(c: Config): Config {
  return {
    craft: "none",
    ai: "none",
    ownership: "tasks",
    hours: c.hours,
    language: "english",
    clients: c.clients,
  };
}
