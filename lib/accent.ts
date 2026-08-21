/**
 * The single accent → Tailwind class map. Stage ids in data/*.json
 * (signal | caution | verified | info) are kept; coral is new for
 * red-flag content. Import from here; never re-declare accent maps in pages.
 *
 * Class strings are literal so Tailwind v4's scanner sees them.
 */
export const ACCENTS = ["neutral", "signal", "caution", "verified", "info", "coral"] as const;
export type Accent = (typeof ACCENTS)[number];

export type AccentClasses = {
  /** Text in the deep/legible value of the accent. */
  text: string;
  /** Solid chip/shape fill with the contrast-safe text colour. */
  fill: string;
  /** Pale background only. */
  tint: string;
  /** Border in the deep value. */
  border: string;
  /** Focus/selection ring in the deep value. */
  ring: string;
  /** Tinted surface with deep text and a faint border (badges, callouts). */
  soft: string;
};

export const ACCENT: Record<Accent, AccentClasses> = {
  neutral: {
    text: "text-ink-soft",
    fill: "bg-band text-ink",
    tint: "bg-band",
    border: "border-line-strong",
    ring: "ring-line-strong",
    soft: "bg-band text-ink-soft border-line-strong",
  },
  signal: {
    text: "text-primary",
    fill: "bg-primary text-white",
    tint: "bg-primary-tint",
    border: "border-primary",
    ring: "ring-primary",
    soft: "bg-primary-tint text-primary-deep border-primary/20",
  },
  caution: {
    text: "text-caution",
    fill: "bg-caution-fill text-ink",
    tint: "bg-caution-tint",
    border: "border-caution",
    ring: "ring-caution",
    soft: "bg-caution-tint text-caution border-caution/20",
  },
  verified: {
    text: "text-verified",
    fill: "bg-verified-fill text-ink",
    tint: "bg-verified-tint",
    border: "border-verified",
    ring: "ring-verified",
    soft: "bg-verified-tint text-verified border-verified/20",
  },
  info: {
    text: "text-info",
    fill: "bg-info-fill text-ink",
    tint: "bg-info-tint",
    border: "border-info",
    ring: "ring-info",
    soft: "bg-info-tint text-info border-info/20",
  },
  coral: {
    text: "text-coral",
    fill: "bg-coral-fill text-ink",
    tint: "bg-coral-tint",
    border: "border-coral",
    ring: "ring-coral",
    soft: "bg-coral-tint text-coral border-coral/20",
  },
};

export function isAccent(x: unknown): x is Accent {
  return typeof x === "string" && (ACCENTS as readonly string[]).includes(x);
}

/** Resolve an accent id from JSON; unknown ids fall back to the primary. */
export function accent(id: string | undefined): AccentClasses {
  return isAccent(id) ? ACCENT[id] : ACCENT.signal;
}
