import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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
      // neutral uses text-ink (not the deep accent text), so it is skipped
      // alongside signal here and covered separately below.
      if (a === "signal" || a === "neutral") continue;
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

  it("knows every accent/tone id used in data/*.json", () => {
    const dataDir = path.resolve(process.cwd(), "data");
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
    const offenders: string[] = [];

    const walk = (node: unknown, file: string, keyPath: string): void => {
      if (Array.isArray(node)) {
        node.forEach((item, i) => walk(item, file, `${keyPath}[${i}]`));
        return;
      }
      if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          const nextPath = keyPath ? `${keyPath}.${key}` : key;
          // `hero.accent` is the headline's trailing segment (see `Heading accent`
          // and `PageHero accent`), not a colour id — skip that convention.
          const isHeadlineSegment = key === "accent" && keyPath.endsWith("hero");
          if ((key === "accent" || key === "tone") && typeof value === "string" && !isHeadlineSegment) {
            if (!isAccent(value)) offenders.push(`${file}:${nextPath} = "${value}"`);
          }
          walk(value, file, nextPath);
        }
      }
    };

    for (const file of files) {
      const json = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
      walk(json, file, "");
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
