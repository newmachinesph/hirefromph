import { describe, expect, it } from "vitest";
import tracks from "@/data/tracks.json";
import { TRACKS, featuredTracks } from "@/lib/tracks";

describe("featuredTracks", () => {
  it("returns every track when no limit is given", () => {
    expect(featuredTracks()).toHaveLength(tracks.tracks.length);
    expect(TRACKS).toHaveLength(22);
  });

  it("orders by demand descending, then by name", () => {
    expect(featuredTracks(6).map((track) => track.id)).toEqual([
      "ai-agent-ops",
      "design-viz",
      "ecommerce",
      "executive-ops",
      "medical-va",
      "social-media",
    ]);
  });

  it("never mutates the source array", () => {
    const before = tracks.tracks.map((track) => track.id);
    featuredTracks(3);
    expect(tracks.tracks.map((track) => track.id)).toEqual(before);
  });

  it("clamps a nonsense limit instead of throwing", () => {
    expect(featuredTracks(0)).toEqual([]);
    expect(featuredTracks(-4)).toEqual([]);
    expect(featuredTracks(999)).toHaveLength(22);
  });
});
