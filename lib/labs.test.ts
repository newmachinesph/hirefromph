import { describe, expect, it } from "vitest";
import labsData from "@/data/labs.json";
import { BUILD_HREF, LAB_IDS, isLabId, labHref, labIdFromParam } from "@/lib/labs";

describe("labs", () => {
  it("lists every lab id from data/labs.json in order", () => {
    expect(LAB_IDS).toEqual(labsData.labs.map((lab) => lab.id));
    expect(LAB_IDS.length).toBeGreaterThan(1);
  });

  it("builds the deep link on the build route", () => {
    expect(labHref("resume")).toBe(`${BUILD_HREF}?lab=resume`);
    expect(labHref("a b")).toBe(`${BUILD_HREF}?lab=a%20b`);
  });

  it("recognises known ids and nothing else", () => {
    expect(isLabId(LAB_IDS[0])).toBe(true);
    expect(isLabId("not-a-lab")).toBe(false);
    expect(isLabId(undefined)).toBe(false);
    expect(isLabId(null)).toBe(false);
  });

  it("resolves the raw search param to a known id or the gallery", () => {
    expect(labIdFromParam(LAB_IDS[1])).toBe(LAB_IDS[1]);
    expect(labIdFromParam("not-a-lab")).toBeNull();
    expect(labIdFromParam(undefined)).toBeNull();
    expect(labIdFromParam([LAB_IDS[0], LAB_IDS[1]])).toBeNull();
  });
});
