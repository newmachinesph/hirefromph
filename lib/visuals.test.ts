import { describe, expect, it } from "vitest";
import { getVisual, normaliseManifest } from "@/lib/visuals";

const valid = {
  id: "home-hero",
  src: { avif: "/images/home-hero.avif", webp: "/images/home-hero.webp", jpg: "/images/home-hero.jpg" },
  width: 1200,
  height: 1500,
  alt: "A woman reviews a spreadsheet at a home desk",
  caption: "A corner desk in Cebu",
  generated: true,
};

describe("normaliseManifest", () => {
  it("returns an empty list for an empty manifest", () => {
    expect(normaliseManifest({ images: [] })).toEqual([]);
  });

  it("never throws on junk", () => {
    expect(normaliseManifest(null)).toEqual([]);
    expect(normaliseManifest(undefined)).toEqual([]);
    expect(normaliseManifest({})).toEqual([]);
    expect(normaliseManifest({ images: "nope" })).toEqual([]);
    expect(normaliseManifest([1, 2, 3])).toEqual([]);
  });

  it("keeps a complete entry as-is", () => {
    expect(normaliseManifest({ images: [valid] })).toEqual([valid]);
  });

  it("keeps a minimal entry", () => {
    const minimal = {
      id: "stage-start",
      src: { jpg: "/images/stage-start.jpg" },
      width: 1200,
      height: 800,
      alt: "A man sets up a second-hand monitor",
    };
    expect(normaliseManifest({ images: [minimal] })).toEqual([minimal]);
  });

  it("drops entries missing a jpg, an id, an alt, or real dimensions", () => {
    const broken = [
      { ...valid, id: "" },
      { ...valid, src: { avif: "/x.avif" } },
      { ...valid, width: "1200" },
      { ...valid, height: 0 },
      { ...valid, alt: undefined },
      "not-an-object",
    ];
    expect(normaliseManifest({ images: broken })).toEqual([]);
  });
});

describe("getVisual", () => {
  it("returns undefined for an id that is not in the real manifest", () => {
    expect(getVisual("not-a-real-id")).toBeUndefined();
  });

  it("resolves home-hero from the real manifest as a generated image with a jpg src", () => {
    const entry = getVisual("home-hero");
    expect(entry).toBeDefined();
    expect(entry?.generated).toBe(true);
    expect(entry?.src.jpg).toBe("/images/home-hero.jpg");
  });
});
