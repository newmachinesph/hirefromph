import { describe, expect, it } from "vitest";
import { escapeText, foldLine, planToIcs, toIcsDate } from "@/lib/ics";

const PLAN = {
  title: "My 30-day plan",
  startDate: "2026-08-21",
  days: [
    { n: 1, title: "Confirm equipment and workspace", desc: "Open the Equipment Checker." },
    { n: 2, title: "Read the roadmap end to end" },
  ],
};

function lines(ics: string): string[] {
  return ics.split("\r\n");
}

describe("escapeText", () => {
  it("escapes backslash, semicolon, comma and newline, in that order", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("normalises CRLF and lone CR to the literal \\n escape", () => {
    expect(escapeText("a\r\nb\rc")).toBe("a\\nb\\nc");
  });
});

describe("foldLine", () => {
  it("leaves a short line alone", () => {
    expect(foldLine("SUMMARY:short")).toBe("SUMMARY:short");
  });

  it("folds a long line with CRLF plus one space and keeps every chunk under 76 octets", () => {
    const folded = foldLine(`SUMMARY:${"x".repeat(200)}`);
    const chunks = folded.split("\r\n");
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(new TextEncoder().encode(chunk).length).toBeLessThanOrEqual(75);
    }
    for (const chunk of chunks.slice(1)) {
      expect(chunk.startsWith(" ")).toBe(true);
    }
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"x".repeat(200)}`);
  });

  it("never splits a multi-byte character", () => {
    const folded = foldLine(`SUMMARY:${"ñ".repeat(80)}`);
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"ñ".repeat(80)}`);
    for (const chunk of folded.split("\r\n")) {
      expect(new TextEncoder().encode(chunk).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("toIcsDate", () => {
  it("strips the dashes", () => {
    expect(toIcsDate("2026-08-21")).toBe("20260821");
  });
});

describe("planToIcs", () => {
  it("opens and closes a VCALENDAR", () => {
    const out = lines(planToIcs(PLAN));
    expect(out[0]).toBe("BEGIN:VCALENDAR");
    expect(out).toContain("VERSION:2.0");
    expect(out).toContain("END:VCALENDAR");
  });

  it("uses CRLF everywhere and ends with one", () => {
    const ics = planToIcs(PLAN);
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("writes one all-day VEVENT per day with an exclusive end date", () => {
    const out = lines(planToIcs(PLAN));
    expect(out.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(2);
    expect(out).toContain("DTSTART;VALUE=DATE:20260821");
    expect(out).toContain("DTEND;VALUE=DATE:20260822");
    expect(out).toContain("DTSTART;VALUE=DATE:20260822");
    expect(out).toContain("DTEND;VALUE=DATE:20260823");
  });

  it("numbers the summary so a calendar row reads as a plan day", () => {
    expect(lines(planToIcs(PLAN))).toContain("SUMMARY:Day 1 — Confirm equipment and workspace");
  });

  it("omits DESCRIPTION when the day has none", () => {
    const out = lines(planToIcs(PLAN));
    expect(out.filter((line) => line.startsWith("DESCRIPTION:"))).toHaveLength(1);
  });

  it("gives every event a stable UID that does not change between exports", () => {
    const first = lines(planToIcs(PLAN)).filter((line) => line.startsWith("UID:"));
    const second = lines(planToIcs(PLAN)).filter((line) => line.startsWith("UID:"));
    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(2);
    expect(first[0]).toBe("UID:hfph-plan-day-1@hirefrom.ph");
  });

  it("escapes commas and semicolons in the summary", () => {
    const ics = planToIcs({
      ...PLAN,
      days: [{ n: 1, title: "Vet it, price it; then send" }],
    });
    expect(lines(ics)).toContain("SUMMARY:Day 1 — Vet it\\, price it\\; then send");
  });

  it("produces a deterministic DTSTAMP from the start date", () => {
    expect(lines(planToIcs(PLAN))).toContain("DTSTAMP:20260821T000000Z");
  });

  it("keeps every line at or under 75 octets", () => {
    const ics = planToIcs({
      ...PLAN,
      days: [{ n: 1, title: "x".repeat(300), desc: "y".repeat(300) }],
    });
    for (const line of lines(ics)) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("still produces a valid empty calendar for a plan with no days", () => {
    const out = lines(planToIcs({ ...PLAN, days: [] }));
    expect(out).toContain("BEGIN:VCALENDAR");
    expect(out).toContain("END:VCALENDAR");
    expect(out.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(0);
  });
});
