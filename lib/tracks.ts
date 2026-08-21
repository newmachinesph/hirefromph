import tracksData from "@/data/tracks.json";

/** The subset of a track the chooser and the homepage render. */
export type FeaturedTrack = {
  id: string;
  name: string;
  icon: string;
  accent: string;
  tagline: string;
  pay: string;
  demandLabel: string;
  demand: number;
};

export const TRACKS: FeaturedTrack[] = tracksData.tracks;

/**
 * Featured order: strongest demand first, then alphabetical so ties are stable
 * across renders and across machines (hence the explicit "en" locale).
 * `limit` is clamped, so a bad caller gets an empty list rather than a throw.
 */
export function featuredTracks(limit?: number): FeaturedTrack[] {
  const ordered = [...TRACKS].sort(
    (a, b) => b.demand - a.demand || a.name.localeCompare(b.name, "en"),
  );
  if (typeof limit !== "number" || Number.isNaN(limit)) return ordered;
  return ordered.slice(0, Math.max(0, limit));
}
