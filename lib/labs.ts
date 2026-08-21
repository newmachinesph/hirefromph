import labsData from "@/data/labs.json";

/** The Build Labs route. `labHref` appends the lab to open. */
export const BUILD_HREF = "/build";

/** Every lab id in data/labs.json, in gallery order. */
export const LAB_IDS: readonly string[] = labsData.labs.map((lab) => lab.id);

export function isLabId(id: unknown): id is string {
  return typeof id === "string" && LAB_IDS.includes(id);
}

/**
 * Deep link that opens one lab on load: `/build?lab=<id>`. The page falls
 * back to the gallery for an id it doesn't know, so a stale link never 404s.
 */
export function labHref(id: string): string {
  return `${BUILD_HREF}?lab=${encodeURIComponent(id)}`;
}

/** Resolves the raw `lab` search param to a known id, or null for the gallery. */
export function labIdFromParam(value: string | string[] | undefined): string | null {
  return isLabId(value) ? value : null;
}
