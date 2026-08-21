import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import educatorsData from "@/data/educators.json";
import {
  EDUCATORS_INTRO,
  EDUCATORS_LAST_VERIFIED,
  KIT_FILES,
  KIT_LICENSE,
  QUICK_START,
  SESSIONS,
  SLIDES,
  getKitFile,
  getSession,
  kitContentHash,
  sessionMinutes,
} from "@/lib/educators";
import { canonicalJson, hashKitPayload, readKitPayload } from "@/lib/kit.mjs";

/** Ground truth for "this route exists": the app directory itself. */
function appRoutes(dir = join(process.cwd(), "app"), prefix = ""): Set<string> {
  const routes = new Set<string>();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const segment =
        entry.name.startsWith("(") && entry.name.endsWith(")") ? "" : `/${entry.name}`;
      for (const route of appRoutes(join(dir, entry.name), prefix + segment)) routes.add(route);
    } else if (/^page\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      routes.add(prefix === "" ? "/" : prefix);
    }
  }
  return routes;
}

describe("educators loader", () => {
  it("exposes the authored intro, quick start, sessions, slides and licence", () => {
    expect(EDUCATORS_LAST_VERIFIED).toMatch(/^\d{4}-\d{2}$/);
    expect(EDUCATORS_INTRO.title).toBe(educatorsData.intro.title);
    expect(EDUCATORS_INTRO.whoFor).toHaveLength(4);
    expect(EDUCATORS_INTRO.honestyNote).toContain("no learner count");
    expect(QUICK_START).toHaveLength(6);
    expect(QUICK_START.map((step) => step.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(SESSIONS.map((session) => session.id)).toEqual([
      "deconstruct-resume",
      "vet-opportunity",
      "ask-well",
    ]);
    expect(KIT_LICENSE.name).toBe("CC BY 4.0");
    expect(KIT_LICENSE.url).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("ships exactly sixteen slides, each with a kicker, a title and a body", () => {
    expect(SLIDES).toHaveLength(16);
    for (const slide of SLIDES) {
      expect(slide.id, slide.id).toMatch(/\S/);
      expect(slide.kicker, slide.id).toMatch(/\S/);
      expect(slide.title, slide.id).toMatch(/\S/);
      expect(slide.body, slide.id).toMatch(/\S/);
    }
    expect(new Set(SLIDES.map((slide) => slide.id)).size).toBe(SLIDES.length);
  });

  it("prints a real URL for every slide that carries a source", () => {
    for (const slide of SLIDES.filter((s) => s.source)) {
      expect(slide.source?.url, slide.id).toMatch(/^https:\/\//);
      expect(slide.source?.label, slide.id).toMatch(/\S/);
    }
  });

  it("finds a session by id and nothing by a wrong one", () => {
    expect(getSession("ask-well")?.title).toBe("Ask a question that gets answered");
    expect(getSession("nope")).toBeUndefined();
  });

  it("keeps every session's timed steps summing to its advertised length", () => {
    for (const session of SESSIONS) {
      expect(sessionMinutes(session), session.id).toBe(session.minutes);
    }
  });

  it("only ever opens a route that exists", () => {
    const routes = appRoutes();
    for (const session of SESSIONS) {
      for (const step of session.steps) {
        if (!step.tool) continue;
        expect(routes.has(step.tool), `${session.id} → ${step.tool}`).toBe(true);
      }
    }
  });

  it("lists seven kit files, one run-sheet per session", () => {
    expect(KIT_FILES).toHaveLength(7);
    expect(new Set(KIT_FILES.map((file) => file.slug)).size).toBe(7);

    const sessionFiles = KIT_FILES.filter((file) => file.sessionId);
    expect(sessionFiles.map((file) => file.sessionId)).toEqual(SESSIONS.map((s) => s.id));
    for (const file of sessionFiles) {
      expect(file.slug).toBe(`hirefromph-session-${file.sessionId}`);
      expect(file.route).toBe(`/educators/kit/session/${file.sessionId}`);
    }

    expect(getKitFile("hirefromph-slides")?.pages).toBe(SLIDES.length);
    expect(getKitFile("nope")).toBeUndefined();
  });
});

describe("kit content hash", () => {
  it("agrees with the on-disk payload the build scripts hash", () => {
    expect(kitContentHash()).toBe(hashKitPayload(readKitPayload()));
  });

  it("is a stable sha256 hex digest", () => {
    expect(kitContentHash()).toMatch(/^[0-9a-f]{64}$/);
    expect(kitContentHash()).toBe(kitContentHash());
  });

  it("ignores key order and notices a changed value", () => {
    expect(canonicalJson({ b: 1, a: [2, 3] })).toBe(canonicalJson({ a: [2, 3], b: 1 }));
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));

    const payload = readKitPayload() as { educators: { lastVerified: string } };
    const changed = { ...payload, educators: { ...payload.educators, lastVerified: "1999-01" } };
    expect(hashKitPayload(changed)).not.toBe(kitContentHash());
  });
});
