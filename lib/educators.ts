/**
 * The typed door onto data/educators.json and the kit's content hash.
 *
 * SERVER ONLY (it reaches lib/kit.mjs, which imports node:crypto and node:fs).
 * Kit routes and /educators are server components; keep it that way.
 */
import doctrine from "@/data/doctrine.json";
import educators from "@/data/educators.json";
import roadmap from "@/data/roadmap.json";
import site from "@/data/site.json";
import stages from "@/data/stages.json";
import { KIT_FILES, PUBLISHED_KIT_FILES, hashKitPayload } from "./kit.mjs";

export { KIT_FILES, PUBLISHED_KIT_FILES };
export type { KitFile } from "./kit.mjs";

/** A citation on a kit sheet. PDFs have no hover, so the URL gets printed. */
export type KitSource = { label: string; url: string };

export type SessionStep = {
  minutes: number;
  title: string;
  facilitator: string;
  participants: string;
  /** A site route to open on the projector during this block. */
  tool?: string;
};

export type SessionMistake = { mistake: string; fix: string };

export type Session = {
  id: string;
  title: string;
  minutes: number;
  method: string;
  objectives: string[];
  setup: string[];
  steps: SessionStep[];
  prompts: string[];
  mistakes: SessionMistake[];
};

export type KitSlide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  source?: KitSource;
};

export type EducatorsIntro = {
  title: string;
  lead: string;
  whoFor: string[];
  honestyNote: string;
};

export type QuickStartStep = { n: number; title: string; desc: string };

export type KitLicense = {
  name: string;
  url: string;
  attribution: string;
  summary: string;
};

export const EDUCATORS_LAST_VERIFIED: string = educators.lastVerified;
export const EDUCATORS_INTRO = educators.intro as EducatorsIntro;
export const QUICK_START = educators.quickStart as QuickStartStep[];
export const SESSIONS = educators.sessions as Session[];
export const SLIDES = educators.slides as KitSlide[];
export const KIT_LICENSE = educators.license as KitLicense;

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((session) => session.id === id);
}

/** The timed blocks must add up to the length on the cover. A test asserts it. */
export function sessionMinutes(session: Session): number {
  return session.steps.reduce((total, step) => total + step.minutes, 0);
}

export function getKitFile(slug: string) {
  return KIT_FILES.find((file) => file.slug === slug);
}

/**
 * sha256 over the five JSON sources the kit renders. scripts/verify-kit.mjs
 * recomputes the same digest from disk and compares it with the stamp in
 * public/kit/manifest.json; a mismatch means the PDFs are stale.
 */
export function kitContentHash(): string {
  return hashKitPayload({
    doctrine,
    educators,
    roadmap,
    stages,
    standard: site.standard,
  });
}
