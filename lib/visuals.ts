import manifest from "@/data/visuals.json";

/**
 * One optimised image. Written by `scripts/optimize-images.mjs` in Phase 3;
 * hand-editing `data/visuals.json` is not a supported workflow.
 */
export type VisualEntry = {
  id: string;
  src: { avif?: string; webp?: string; jpg: string };
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** True for gpt-image-2 output. `Figure` always captions these. */
  generated?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function toEntry(raw: unknown): VisualEntry | null {
  if (!isRecord(raw)) return null;
  const { id, src, width, height, alt, caption, generated } = raw;
  if (!isNonEmptyString(id)) return null;
  if (!isRecord(src) || !isNonEmptyString(src.jpg)) return null;
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) return null;
  if (!isNonEmptyString(alt)) return null;

  const entry: VisualEntry = {
    id,
    src: {
      ...(isNonEmptyString(src.avif) ? { avif: src.avif } : {}),
      ...(isNonEmptyString(src.webp) ? { webp: src.webp } : {}),
      jpg: src.jpg,
    },
    width,
    height,
    alt,
  };
  if (isNonEmptyString(caption)) entry.caption = caption;
  if (typeof generated === "boolean") entry.generated = generated;
  return entry;
}

/** Total function: malformed entries are dropped, never thrown on. */
export function normaliseManifest(raw: unknown): VisualEntry[] {
  if (!isRecord(raw)) return [];
  const images = raw.images;
  if (!Array.isArray(images)) return [];
  return images
    .map(toEntry)
    .filter((entry): entry is VisualEntry => entry !== null);
}

const VISUALS: VisualEntry[] = normaliseManifest(manifest);
const BY_ID = new Map(VISUALS.map((entry) => [entry.id, entry]));

export function getVisual(id: string): VisualEntry | undefined {
  return BY_ID.get(id);
}

export function listVisuals(): VisualEntry[] {
  return VISUALS;
}
