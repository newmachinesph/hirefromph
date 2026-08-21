import { describe, it, expect } from "vitest";
import { ACCENT, ACCENTS, accent, isAccent } from "@/lib/accent";

const KEYS = ["text", "fill", "tint", "border", "ring", "soft"] as const;

describe("accent map", () => {
  it("defines every class key for every accent", () => {
    for (const a of ACCENTS) {
      for (const k of KEYS) {
        expect(ACCENT[a][k], `${a}.${k}`).toMatch(/\S/);
      }
    }
  });

  it("uses white text only on the primary fill", () => {
    expect(ACCENT.signal.fill).toMatch(/text-white/);
    for (const a of ACCENTS) {
      if (a === "signal") continue;
      expect(ACCENT[a].fill, a).not.toMatch(/text-white/);
      expect(ACCENT[a].fill, a).toMatch(/text-ink/);
    }
  });

  it("falls back to signal for unknown or missing ids", () => {
    expect(accent("nope")).toBe(ACCENT.signal);
    expect(accent(undefined)).toBe(ACCENT.signal);
    expect(accent("coral")).toBe(ACCENT.coral);
  });

  it("guards accent ids", () => {
    expect(isAccent("info")).toBe(true);
    expect(isAccent("emerald")).toBe(false);
    expect(isAccent(3)).toBe(false);
  });
});
