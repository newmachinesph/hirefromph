import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CSV_BOM,
  downloadText,
  labToMarkdown,
  rowsToCsv,
  safeFilename,
} from "@/lib/markdown-export";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("labToMarkdown", () => {
  it("puts the title first and one heading per written section", () => {
    expect(
      labToMarkdown("My resume", [
        { label: "Header", body: "J. Dela Cruz" },
        { label: "Summary", body: "Bookkeeping for small sellers." },
      ]),
    ).toBe(
      "# My resume\n\n## Header\n\nJ. Dela Cruz\n\n## Summary\n\nBookkeeping for small sellers.\n",
    );
  });

  it("drops sections the visitor left empty, so the file is only their words", () => {
    expect(
      labToMarkdown("My resume", [
        { label: "Header", body: "J. Dela Cruz" },
        { label: "Summary", body: "   " },
      ]),
    ).toBe("# My resume\n\n## Header\n\nJ. Dela Cruz\n");
  });

  it("returns just the title when nothing has been written", () => {
    expect(labToMarkdown("My resume", [{ label: "Header", body: "" }])).toBe("# My resume\n");
  });

  it("trims trailing whitespace inside a section but keeps its line breaks", () => {
    expect(labToMarkdown("Notes", [{ label: "Day 1", body: "one\ntwo   " }])).toBe(
      "# Notes\n\n## Day 1\n\none\ntwo\n",
    );
  });
});

describe("rowsToCsv", () => {
  it("writes a header row and CRLF line endings", () => {
    expect(rowsToCsv(["Company", "Role"], [["Acme", "Bookkeeper"]])).toBe(
      "Company,Role\r\nAcme,Bookkeeper",
    );
  });

  it("quotes cells containing a comma, a quote, or a newline", () => {
    expect(rowsToCsv(["Notes"], [['He said "no", twice']])).toBe(
      'Notes\r\n"He said ""no"", twice"',
    );
    expect(rowsToCsv(["Notes"], [["line one\nline two"]])).toBe('Notes\r\n"line one\nline two"');
  });

  it("quotes a cell with leading or trailing spaces so they survive", () => {
    expect(rowsToCsv(["Notes"], [["  padded  "]])).toBe('Notes\r\n"  padded  "');
  });

  it("writes only the header when there are no rows", () => {
    expect(rowsToCsv(["Company"], [])).toBe("Company");
  });

  it("does not include a byte-order mark", () => {
    expect(rowsToCsv(["A"], [["b"]]).startsWith(CSV_BOM)).toBe(false);
  });
});

describe("safeFilename", () => {
  it("lowercases, hyphenates and adds the extension", () => {
    expect(safeFilename("My 30-day Plan", "ics")).toBe("my-30-day-plan.ics");
  });

  it("strips characters a filesystem would reject", () => {
    expect(safeFilename('resume: "final"/v2', "md")).toBe("resume-final-v2.md");
  });

  it("falls back to a usable name when nothing survives", () => {
    expect(safeFilename("///", "md")).toBe("hire-from-ph.md");
  });
});

describe("downloadText", () => {
  it("creates a blob URL, clicks a download anchor, and revokes the URL", () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadText("plan.ics", "BEGIN:VCALENDAR", "text/calendar;charset=utf-8");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("text/calendar;charset=utf-8");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("revokes the URL even when the click throws", () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL: () => "blob:fake", revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => downloadText("a.md", "x", "text/markdown;charset=utf-8")).toThrow("blocked");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
